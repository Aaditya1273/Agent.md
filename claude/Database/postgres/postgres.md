---
targetModels:
  - "Claude Fable 5"
  - "Claude Opus 5"
  - "Claude Sonnet 5"
  - "Claude 5 Family"
  - "Future Claude Models"
name: postgres
category: Database
description: PostgreSQL-specific operational rules — connection pooling, MVCC and bloat, jsonb, extensions, and the settings that decide whether it survives production.
license: MIT
author: Agent.md maintainers
last-verified: 2026-08-23
reviewed-by: unreviewed
---
<!-- Generated from models/_canonical by scripts/build-model-variants.js.
     Edit the canonical source, not this file. Structure adapted for Claude per deep-research.md. -->
# Purpose

<purpose>
Rules specific to PostgreSQL. Portable schema design is `Database/schema-design`;
this covers what Postgres does differently and what bites teams that treat it as
a generic SQL box.

---
</purpose>

# Connections and pooling

<rules>
A Postgres connection is a forked OS process with its own memory. A few hundred
is not "a lot of connections" — it is a resource crisis.

```
                  app instances × pool size  ≤  max_connections
```

Use **PgBouncer** in `transaction` mode in front of the database. Serverless
platforms make this mandatory: every cold start otherwise opens a fresh
connection and nothing closes them.

| Pooler mode | Safe with | Breaks |
| --- | --- | --- |
| `session` | Everything | Very low connection reuse |
| `transaction` | Ordinary queries | `SET`, advisory locks, `LISTEN`, prepared statements across calls |
| `statement` | Autocommit-only workloads | Multi-statement transactions |

**Never** run `LISTEN/NOTIFY`, session-level advisory locks, or `SET LOCAL`-free
`SET` through a transaction-mode pooler. The session that receives the command is
not the session that runs the next query.

Rule of thumb for pool size: `(cores × 2) + effective_spindle_count`. More
connections than that reduces throughput — the database spends its time context
switching, not working.

---
</rules>

# MVCC, bloat and vacuum

<rules>
Postgres never updates a row in place. An `UPDATE` writes a new tuple and marks
the old one dead. `VACUUM` reclaims dead tuples; if it cannot keep up, tables and
indexes bloat, and plans degrade even though row counts have not changed.

```sql
-- Dead tuples, and when autovacuum last managed to run
SELECT relname, n_live_tup, n_dead_tup, last_autovacuum, last_autoanalyze
FROM pg_stat_user_tables
WHERE n_dead_tup > 10000
ORDER BY n_dead_tup DESC;
```

What blocks vacuum, in practice:

- **Long-running transactions.** A session `idle in transaction` for hours pins
  the oldest visible snapshot and stops vacuum reclaiming anything newer.
- **Abandoned replication slots.** An inactive slot holds WAL and the xmin
  horizon indefinitely, and will fill the disk.
- **Long queries on replicas** with `hot_standby_feedback = on`.

Set `idle_in_transaction_session_timeout` (e.g. `60s`) so a forgotten transaction
cannot hold the horizon. Monitor `pg_replication_slots.active` — an inactive slot
is an outage in slow motion.

Tune autovacuum per-table for hot tables rather than globally:

```sql
ALTER TABLE events SET (autovacuum_vacuum_scale_factor = 0.02,
                        autovacuum_vacuum_cost_limit  = 2000);
```

---
</rules>

# Settings that matter

<rules>
| Setting | Guidance |
| --- | --- |
| `shared_buffers` | ~25% of RAM |
| `effective_cache_size` | ~50–75% of RAM — a planner hint, allocates nothing |
| `work_mem` | Per sort/hash **per node**, not per query — start small (4–16 MB) |
| `maintenance_work_mem` | 512 MB–2 GB; speeds index builds and vacuum |
| `random_page_cost` | `1.1` on SSD — the default `4.0` assumes spinning disks |
| `statement_timeout` | Always set. An unbounded query is an unbounded outage |
| `lock_timeout` | Set before any DDL → `Database/migration` |

`work_mem` is the classic footgun: it is allocated per sort node, per parallel
worker. A high global value times a hundred connections exhausts memory.

---
</rules>

# jsonb

<rules>
`jsonb` is for genuinely open-ended data — third-party webhook payloads, user
attributes with no fixed set. It is not a way to avoid designing a schema.

```sql
CREATE INDEX events_payload ON events USING gin (payload jsonb_path_ops);
SELECT * FROM events WHERE payload @> '{"type":"checkout"}';
```

Rules:

- Anything queried, sorted, or constrained on a hot path belongs in a real column.
- Index with `GIN` and `jsonb_path_ops` for containment (`@>`) — smaller and
  faster than the default operator class when you only need containment.
- Extract a stable field to a generated column when it is queried constantly.

**Never** store what should be a foreign key inside `jsonb`. There is no
referential integrity, and the join will not use an index the way you expect.

---
</rules>

# Extensions worth enabling

<rules>
| Extension | Why |
| --- | --- |
| `pg_stat_statements` | Query-level timing. Enable it before you need it |
| `pgcrypto` | `gen_random_uuid()`, digests |
| `pg_trgm` | Trigram fuzzy/`ILIKE` search with a GIN index |
| `btree_gin` / `btree_gist` | Mixed-type composite and `EXCLUDE` constraints |
| `citext` | Case-insensitive text — or use `lower()` expression indexes |

**Never** enable an extension in production without checking whether your managed
provider supports it — an unsupported extension blocks a major-version upgrade.

---
</rules>

# Anti-patterns

<antipatterns>
| Anti-pattern | Why it fails | Fix |
| --- | --- | --- |
| Direct connections from serverless | Connection exhaustion on cold starts | PgBouncer, transaction mode |
| `max_connections = 500` | Each is a process; throughput collapses | Pooler + small pools |
| High global `work_mem` | Allocated per node per worker; OOM | Small default, raise per session |
| Ignoring `n_dead_tup` | Bloat degrades plans silently | Monitor and tune autovacuum |
| Leaving a replication slot inactive | WAL accumulates until the disk fills | Alert on `active = false` |
| No `statement_timeout` | One query holds locks indefinitely | Set globally |
| `jsonb` as the whole schema | No constraints, no types, no plans | Real columns for known fields |
| `random_page_cost = 4` on SSD | Planner avoids correct index scans | Set to `1.1` |
| `SELECT count(*)` for an approximate figure | Full scan under MVCC | `pg_class.reltuples` when an estimate suffices |
| Advisory locks through a transaction pooler | Different backend each call | Session mode, or a lock table |

---
</antipatterns>

# Checklist

<checklist>
- [ ] A transaction-mode pooler sits between the application and the database
- [ ] Total pool capacity is below `max_connections` with headroom
- [ ] No session-scoped features are used through a transaction-mode pooler
- [ ] `statement_timeout` and `idle_in_transaction_session_timeout` are set
- [ ] `pg_stat_statements` is enabled
- [ ] `n_dead_tup` and autovacuum recency are monitored
- [ ] Replication slots are alerted on when inactive
- [ ] `random_page_cost` reflects the actual storage
- [ ] `work_mem` is sized per node, not per query
- [ ] `jsonb` holds only genuinely schemaless data, indexed with GIN
- [ ] Extension use is confirmed supported by the hosting provider
</checklist>
