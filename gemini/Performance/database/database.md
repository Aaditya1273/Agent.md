---
targetModels:
  - "Gemini 3.6 Flash"
  - "Gemini 3.5 Flash"
  - "Gemini 3.1 Pro"
  - "Gemini 3 Family"
  - "Future Gemini Models"
name: database
category: Performance
description: Database performance at the system level — connection pooling, saturation, lock contention, bloat, and the signals that tell you which one you have.
license: MIT
author: Agent.md maintainers
last-verified: 2026-08-23
reviewed-by: unreviewed
---
<!-- Generated from models/_canonical by scripts/build-model-variants.js.
     Edit the canonical source, not this file. Structure adapted for Gemini per deep-research.md. -->


# Purpose

Rules for database performance above the level of a single query. Individual query
tuning is `Performance/queries` and `Database/query-optimization`; this covers the
system: connections, contention, capacity, and diagnosing which of them is
actually the problem.

The most common diagnosis error: **"the database is slow" when the database is
idle and the application is queueing for a connection.**

---

# Diagnose before tuning

| Symptom | Likely cause | Check |
| --- | --- | --- |
| High latency, low database CPU | Pool exhaustion or lock waits | `pg_stat_activity`, pool metrics |
| High CPU, few queries | One expensive query | `pg_stat_statements` by total time |
| Latency spikes at intervals | Checkpoints, autovacuum, a cron job | Log checkpoints; correlate |
| Gradual slowdown over weeks | Bloat, or an index no longer in memory | `n_dead_tup`, cache hit ratio |
| Fast in `psql`, slow in the app | Round trips or pool wait | Query count per request |
| Fine in staging, slow in production | Data volume changed the plan | `EXPLAIN` on real volume |

```sql
-- What is happening right now, and what is waiting on what
SELECT pid, state, wait_event_type, wait_event, now() - query_start AS runtime, left(query, 80)
FROM pg_stat_activity
WHERE state <> 'idle'
ORDER BY runtime DESC;
```

`idle in transaction` sessions are the single most damaging thing in that output:
they hold locks, pin the vacuum horizon, and consume a pool slot while doing
nothing. → `Database/postgres`

---

# Connections are the usual bottleneck

A Postgres connection is an OS process. A few hundred is a crisis, not a
comfortable number.

```
app replicas × pool size  ≤  max_connections − reserved
pool size ≈ (cores × 2) + effective_spindle_count
```

- A **transaction-mode pooler** (PgBouncer, Supavisor) sits between the
  application and the database. In serverless it is mandatory — every cold start
  otherwise opens a connection nobody closes.
- More connections **reduce** throughput past the sweet spot: the database spends
  its time context switching. Measure before raising the pool.
- Watch `pool_wait_time` / `db_pool_in_use`. Wait time above a few milliseconds
  means requests are queueing for a connection, and every latency graph will
  mislead you until it is fixed.
- Workers and the API share `max_connections`. Size them together.
  → `Backend/workers`

---

# Contention

Locks serialise work that looked concurrent.

```sql
-- Who is blocking whom
SELECT blocked.pid AS blocked_pid, blocking.pid AS blocking_pid,
       left(blocked.query, 60) AS blocked_query, left(blocking.query, 60) AS blocking_query
FROM pg_stat_activity blocked
JOIN pg_stat_activity blocking ON blocking.pid = ANY(pg_blocking_pids(blocked.pid));
```

Rules that remove most contention:

- **Short transactions.** No network calls, no user interaction, no queue publish
  inside one. → `Database/transactions`
- **Consistent lock ordering** across code paths, or two transactions deadlock by
  taking the same rows in opposite orders.
- A **row counter updated by every request** is a serialisation point regardless of
  index quality. Use an aggregate table, a periodic rollup, or sharded counters.
- DDL takes an exclusive lock and queues behind any open transaction — then blocks
  every subsequent query on that table, including reads. Always set `lock_timeout`
  before DDL. → `Database/migration`

---

# Capacity and maintenance

- **Working set versus RAM.** Once the frequently-read data no longer fits in
  `shared_buffers` plus the OS cache, latency changes character — reads become
  disk-bound and the graph steps rather than sloping. Track the buffer cache hit
  ratio.
- **Bloat.** MVCC leaves dead tuples; if autovacuum cannot keep up, tables and
  indexes grow and plans degrade with no change in row count. Monitor
  `n_dead_tup` and `last_autovacuum`, and tune autovacuum per hot table rather
  than globally.
- **Checkpoints** cause periodic write storms. Spread them
  (`checkpoint_completion_target`), and correlate latency spikes against
  checkpoint logs before blaming a query.
- **Replicas** offload reads, but only for reads that tolerate staleness — and
  they add a data-loss window on failover. → `Database/replication`
- **Partition** large time-series tables so old data can be dropped in one
  operation and queries prune to one partition. Note it complicates unique
  constraints and foreign keys; do it when the table is genuinely large, not
  preemptively.

---

# Guard it in CI and in production

```sql
-- Always set these. An unbounded query is an unbounded outage.
statement_timeout = '30s';
lock_timeout = '5s';
idle_in_transaction_session_timeout = '60s';
```

- `statement_timeout` per role: short for the web application, longer for
  reporting. Reporting queries should not run on the primary at all.
- Assert query counts per endpoint in tests. → `Performance/queries`
- Run migrations through a linter (`squawk`, `atlas lint`) that flags full-table
  rewrites and blocking index builds.
- Load-test against production-shaped **volume**, not production-shaped schema.
  Plans depend on data distribution, so a query that is instant on 100 rows can be
  an outage on 10 million. → `Testing/load`

---

# Anti-patterns

| Anti-pattern | Why it fails | Fix |
| --- | --- | --- |
| Blaming the query before checking pool wait | The database may be idle | Check saturation first |
| Raising the pool size to fix latency | Past the sweet spot throughput falls | Measure; add a pooler |
| No connection pooler in serverless | Connection exhaustion on cold starts | Transaction-mode pooler |
| Sizing API and worker pools independently | Combined total exceeds `max_connections` | Size together |
| Long transactions | Locks, bloat, pool slots held | Keep them short |
| Network calls inside transactions | Locks held for external latency | Move them out |
| Inconsistent lock ordering | Deadlocks | Fixed order everywhere |
| A single hot counter row | Serialises every request | Rollups or sharded counters |
| DDL without `lock_timeout` | Queues behind one transaction, blocks all reads | Always set it |
| No `statement_timeout` | One query becomes an outage | Set it per role |
| Reporting queries on the primary | Long queries block maintenance | A dedicated replica |
| Ignoring `n_dead_tup` | Silent plan degradation | Monitor and tune autovacuum |
| Latency spikes blamed on queries | Often checkpoints or autovacuum | Correlate with logs |
| Testing on small datasets | Plans differ entirely at scale | Production-shaped volume |
| Partitioning preemptively | Complexity without benefit | Partition when genuinely large |

---

# Checklist

- [ ] Verify: Pool wait time is measured and ruled out before query tuning
- [ ] Verify: A transaction-mode pooler sits in front of the database
- [ ] Verify: Combined pool capacity across all consumers is below `max_connections`
- [ ] Verify: Pool size was chosen by measurement, not by increasing it until it worked
- [ ] Verify: `pg_stat_activity` is checked for `idle in transaction` sessions
- [ ] Verify: Transactions are short and contain no network calls
- [ ] Verify: Lock ordering is consistent across code paths
- [ ] Verify: Blocking-query monitoring exists
- [ ] Verify: Hot single-row counters are replaced by rollups or sharding
- [ ] Verify: `statement_timeout`, `lock_timeout` and `idle_in_transaction_session_timeout` are set
- [ ] Verify: Reporting workloads run on a replica, not the primary
- [ ] Verify: Buffer cache hit ratio and working-set growth are tracked
- [ ] Verify: Dead tuples and autovacuum recency are monitored, with per-table tuning
- [ ] Verify: Latency spikes are correlated against checkpoint and autovacuum logs
- [ ] Verify: Migrations are linted for full-table rewrites and blocking index builds
- [ ] Verify: Load tests run against production-shaped data volume
