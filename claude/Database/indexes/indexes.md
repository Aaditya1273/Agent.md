---
targetModels:
  - "Claude Fable 5"
  - "Claude Opus 5"
  - "Claude Sonnet 5"
  - "Claude 5 Family"
  - "Future Claude Models"
name: indexes
category: Database
description: Indexing for real query patterns — column order in composite indexes, when an index is ignored, and the cost of the ones you do not need.
license: MIT
author: Agent.md maintainers
last-verified: 2026-08-23
reviewed-by: unreviewed
---
<!-- Generated from models/_canonical by scripts/build-model-variants.js.
     Edit the canonical source, not this file. Structure adapted for Claude per deep-research.md. -->
# Purpose

<purpose>
Rules for choosing indexes. Query rewriting is `Database/query-optimization`.

Two facts govern everything below: **an index makes reads faster and writes
slower**, and **an index the planner cannot use costs you everything and returns
nothing.** Index for measured query patterns, never speculatively.

---
</purpose>

# Index what you filter, join and sort on

<rules>
Start from the actual queries, then read the plan:

```sql
EXPLAIN (ANALYZE, BUFFERS)
SELECT * FROM orders WHERE tenant_id = $1 AND status = 'open' ORDER BY created_at DESC LIMIT 20;
```

Read for: `Seq Scan` on a large table, `Rows Removed by Filter` in the thousands,
and a large gap between estimated and actual rows — that last one usually means
stale statistics, so `ANALYZE` before concluding anything.

Always index:

- **Foreign keys.** PostgreSQL does not index them automatically, and an unindexed
  FK makes every parent `DELETE` scan the child table.
- **Columns in `WHERE`** on tables that grow.
- **Join columns** on both sides.
- **`ORDER BY` columns** where the sort would otherwise be external.

---
</rules>

# Composite index column order

<rules>
The single most consequential decision, and the one most often wrong.

```sql
-- Serves: (tenant_id), (tenant_id, status), (tenant_id, status, created_at)
CREATE INDEX idx_orders_tenant_status_created
  ON orders (tenant_id, status, created_at DESC);
```

The rule is **leftmost prefix**: an index on `(a, b, c)` can serve queries
filtering on `a`, `a`+`b`, or `a`+`b`+`c` — never `b` alone, never `c` alone.

Order the columns:

1. **Equality** predicates first (`tenant_id = $1`, `status = 'open'`)
2. **Range** predicate next (`created_at > $2`) — a range stops the index being
   usable for anything to its right
3. **Sort** column last, matching the `ORDER BY` direction

Put the **most selective** equality column first among equals. A composite index
usually replaces a single-column index on its leading column, so drop the
redundant one.

---
</rules>

# Specialised index types

<rules>
| Type | Use |
| --- | --- |
| **B-tree** | Default; equality, ranges, sorting |
| **Partial** | A subset you query constantly — far smaller |
| **Covering** (`INCLUDE`) | Index-only scans; no heap fetch |
| **Expression** | When you filter on a function of a column |
| **GIN** | `jsonb`, arrays, full-text search |
| **BRIN** | Very large, naturally ordered tables (time series) |
| **Unique** | A correctness constraint that also indexes |

```sql
-- Partial: index only the rows actually queried
CREATE INDEX idx_orders_open ON orders (tenant_id, created_at)
  WHERE status = 'open';

-- Covering: the query is answered from the index alone
CREATE INDEX idx_orders_lookup ON orders (tenant_id, id) INCLUDE (total, status);

-- Expression: without this, lower(email) cannot use an index on email
CREATE INDEX idx_users_email_lower ON users (lower(email));
```

**Never** wrap an indexed column in a function in the `WHERE` clause — 
`WHERE lower(email) = $1` cannot use an index on `email`. Either index the
expression or store the normalised value.

---
</rules>

# When an index is ignored

<rules>
The planner declines an index more often than people expect:

| Cause | Fix |
| --- | --- |
| Function applied to the column | Expression index, or normalise on write |
| Type mismatch (`varchar` vs `int` parameter) | Cast correctly; align the column type |
| Leading `%` in a `LIKE` pattern | Trigram (`pg_trgm`) index or full-text search |
| Low selectivity — the query returns most rows | A scan genuinely is cheaper |
| Stale statistics | `ANALYZE` the table |
| `OR` across different columns | Rewrite as `UNION`, or index each branch |
| Small table | Sequential scan is faster; not a problem |

That fourth row matters: **a sequential scan is not automatically a bug.** For a
query returning 40% of a table, a scan is the correct plan.

---
</rules>

# The cost of too many

<rules>
Every index must be updated on every `INSERT`, `UPDATE` and `DELETE`, and occupies
memory that would otherwise cache data.

```sql
-- Never used since the last statistics reset — candidates for removal
SELECT relname, indexrelname, idx_scan, pg_size_pretty(pg_relation_size(indexrelid))
FROM pg_stat_user_indexes
WHERE idx_scan = 0
ORDER BY pg_relation_size(indexrelid) DESC;
```

- **Drop unused indexes.** Verify across a full business cycle — a monthly report
  may be the only consumer.
- **Drop redundant ones.** `(a)` is redundant when `(a, b)` exists.
- Build and drop with `CONCURRENTLY` in production → `Database/migration`.
- Watch for **duplicate indexes** created by an ORM and a migration independently.

---
</rules>

# Anti-patterns

<antipatterns>
| Anti-pattern | Why it fails | Fix |
| --- | --- | --- |
| One index per column | Composite queries still scan; writes slow | Composite in query order |
| Wrong composite order | Leftmost-prefix rule makes it unusable | Equality, range, sort |
| Unindexed foreign key | Parent deletes scan the child table | Index every FK |
| `WHERE lower(x) = $1` on an index of `x` | Function defeats the index | Expression index |
| `LIKE '%term%'` expecting B-tree | Leading wildcard cannot seek | `pg_trgm` or full-text |
| Indexing speculatively | Write cost with no read benefit | Index measured patterns |
| Never dropping unused indexes | Permanent write tax | Audit `idx_scan = 0` |
| `CREATE INDEX` without `CONCURRENTLY` | Blocks writes during the build | `CONCURRENTLY` |
| Assuming a `Seq Scan` is a bug | Often the correct plan | Read the row estimates |
| Reading `EXPLAIN` without `ANALYZE` | Estimates, not reality | `EXPLAIN (ANALYZE, BUFFERS)` |

---
</antipatterns>

# Checklist

<checklist>
- [ ] Indexes were added in response to a measured plan, not speculation
- [ ] Every foreign key is indexed
- [ ] Composite indexes order columns equality, then range, then sort
- [ ] Sort direction in the index matches the `ORDER BY`
- [ ] No `WHERE` clause wraps an indexed column in a function
- [ ] Partial indexes are used where queries target a consistent subset
- [ ] Covering indexes are used where an index-only scan is achievable
- [ ] `jsonb`, array and full-text columns use GIN
- [ ] Unused and redundant indexes are audited and dropped
- [ ] Index creation uses `CONCURRENTLY` in production
- [ ] `ANALYZE` has run before drawing conclusions from a plan
</checklist>
