---
targetModels:
  - "Claude Fable 5"
  - "Claude Opus 5"
  - "Claude Sonnet 5"
  - "Claude 5 Family"
  - "Future Claude Models"
name: query-optimization
category: Database
description: Making slow queries fast — reading execution plans, eliminating N+1, and the rewrites that change complexity rather than shaving constants.
license: MIT
author: Agent.md maintainers
last-verified: 2026-08-23
reviewed-by: unreviewed
---
<!-- Generated from models/_canonical by scripts/build-model-variants.js.
     Edit the canonical source, not this file. Structure adapted for Claude per deep-research.md. -->
# Purpose

<purpose>
Rules for diagnosing and fixing slow queries. Index selection is
`Database/indexes`; this package is about finding the problem and rewriting it.

The discipline: **measure, read the plan, change one thing, measure again.**
Guessing at query performance is unreliable even for people who do it daily,
because the planner's choice depends on data distribution you cannot see.

---
</purpose>

# Find the real problem first

<rules>
```sql
-- Rank by total time, not by the slowest single call. A 20ms query run
-- 100,000 times costs far more than a 3s report run once.
SELECT calls,
       round(total_exec_time::numeric, 0) AS total_ms,
       round(mean_exec_time::numeric, 2)  AS mean_ms,
       rows, query
FROM pg_stat_statements
ORDER BY total_exec_time DESC
LIMIT 20;
```

Then read the plan for the worst offender:

```sql
EXPLAIN (ANALYZE, BUFFERS, FORMAT TEXT)
SELECT … ;
```

What to look for, in order:

| Signal | Meaning |
| --- | --- |
| `Seq Scan` on a large table | Missing or unusable index |
| `Rows Removed by Filter: 400000` | Reading far more than returned |
| Estimated rows ≫ or ≪ actual | Stale statistics — run `ANALYZE` |
| `Nested Loop` with a large outer | Often an N+1 in disguise |
| `Sort` with `external merge Disk` | `work_mem` too small for the sort |
| `Heap Fetches` high on an index-only scan | Table needs `VACUUM` |
| `Buffers: read` ≫ `hit` | Working set does not fit in cache |

**`ANALYZE` actually runs the query.** Never use it on a mutating statement
outside a transaction you roll back.

---
</rules>

# N+1: the most common cause

<rules>
One query for the list, then one per row. Invisible at 10 rows, fatal at 1,000.

```js
// N+1 — 1 + N round trips, each with full latency
const orders = await db.order.findMany({ where: { tenantId } });
for (const o of orders) {
  o.customer = await db.customer.findUnique({ where: { id: o.customerId } });
}

// Fixed — one round trip, the join happens in the database
const orders = await db.order.findMany({
  where: { tenantId },
  include: { customer: true },
});
```

Where an ORM cannot express it, batch by key:

```sql
SELECT * FROM customers WHERE id = ANY($1);   -- one query, array of ids
```

Detect it by counting queries per request in tests, not by reading code. A
`queryCount` assertion in an integration test catches the regression the moment
somebody adds a lazy relation.

---
</rules>

# Rewrites that change complexity

<rules>
Shaving constants rarely matters. These change the shape of the work:

```sql
-- 1. Filter before joining, not after
SELECT * FROM orders o
JOIN customers c ON c.id = o.customer_id
WHERE o.created_at > now() - interval '7 days';    -- planner pushes this down

-- 2. EXISTS instead of IN with a subquery — stops at the first match
SELECT * FROM customers c
WHERE EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.id);

-- 3. Keyset pagination instead of OFFSET — constant time at any page
SELECT * FROM orders
WHERE (created_at, id) < ($1, $2)                 -- cursor from the last row
ORDER BY created_at DESC, id DESC
LIMIT 20;

-- 4. Aggregate in the database, not in the application
SELECT tenant_id, count(*), sum(total) FROM orders GROUP BY tenant_id;
```

`OFFSET 100000` makes the database produce and discard 100,000 rows. Keyset
pagination is the single highest-value rewrite for any large list.

**Never** `SELECT *` when you need three columns — it defeats index-only scans and
moves bytes nobody reads.

---
</rules>

# Where the time actually goes

<rules>
| Symptom | Cause |
| --- | --- |
| Fast in `psql`, slow in the app | Round trips (N+1), or connection pool wait |
| Slow only sometimes | Plan flip from stale statistics, or cache miss |
| Slow only in production | Data volume; test against production-shaped data |
| CPU flat, latency high | Pool exhaustion or lock waits, not query cost |
| Gradually slower over weeks | Table bloat, or an index no longer fitting in memory |

Check `pg_stat_activity` for `idle in transaction` and `pg_locks` for waits before
concluding a query is slow. Frequently it is not the query — it is waiting for a
connection. → `Database/transactions`

---
</rules>

# Caching is the last resort

<rules>
Cache after the query is correct and indexed, never instead.

- A cache in front of an unindexed query hides the problem until the cache misses,
  usually under the load that caused you to add it.
- Cache **derived, expensive, rarely-changing** results — not primary key lookups
  that are already sub-millisecond.
- Every cache needs an invalidation story before it is added.
  → `Performance/caching`

---
</rules>

# Anti-patterns

<antipatterns>
| Anti-pattern | Why it fails | Fix |
| --- | --- | --- |
| Optimising without a plan | Time spent on the wrong query | `pg_stat_statements`, then `EXPLAIN ANALYZE` |
| Ranking by slowest call | Misses the frequent cheap query | Rank by total time |
| Loop of single-row queries | N+1; latency multiplied | Join or batch with `ANY` |
| `OFFSET` for deep pages | Produces and discards every skipped row | Keyset pagination |
| `SELECT *` | Defeats index-only scans; moves dead bytes | Select the columns needed |
| Aggregating in application code | Moves every row across the wire | `GROUP BY` in SQL |
| `EXPLAIN` without `ANALYZE` | Estimates, not measurements | Always `ANALYZE, BUFFERS` |
| Caching a slow query | Hides it until the cache misses | Index first |
| Testing against tiny data | Plans differ entirely at scale | Production-shaped volume |
| Adding an index per slow query | Write cost accretes | Composite indexes; drop unused |

---
</antipatterns>

# Checklist

<checklist>
- [ ] Slow queries are identified by total time from `pg_stat_statements`
- [ ] Every fix is preceded by `EXPLAIN (ANALYZE, BUFFERS)`
- [ ] `ANALYZE` has been run so estimates are trustworthy
- [ ] Queries per request are asserted in tests to catch N+1 regressions
- [ ] Relations are loaded with a join or a batched `ANY`, never in a loop
- [ ] Deep pagination uses a keyset cursor, not `OFFSET`
- [ ] Only required columns are selected
- [ ] Aggregation happens in the database
- [ ] Pool waits and lock waits are ruled out before blaming the query
- [ ] Caching is added only after the query is correct and indexed
- [ ] Performance is verified against production-scale data
</checklist>
