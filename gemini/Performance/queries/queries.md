---
targetModels:
  - "Gemini 3.6 Flash"
  - "Gemini 3.5 Flash"
  - "Gemini 3.1 Pro"
  - "Gemini 3 Family"
  - "Future Gemini Models"
name: queries
category: Performance
description: Query performance from the application's side — N+1 elimination, projection, batching, pagination cost, and asserting query counts in tests.
license: MIT
author: Agent.md maintainers
last-verified: 2026-08-23
reviewed-by: unreviewed
---
<!-- Generated from models/_canonical by scripts/build-model-variants.js.
     Edit the canonical source, not this file. Structure adapted for Gemini per deep-research.md. -->


# Purpose

Rules for the queries an application issues. Plan reading and index design are
`Database/query-optimization` and `Database/indexes`; this covers what the code
does — how many queries, how much data, and how it is shaped.

The dominant cost in most applications is not a slow query. It is **too many
queries**, each individually fast.

---

# Count queries per request

```ts
// One request, 143 queries. Every one is 0.4ms and the endpoint takes 900ms.
```

Latency is per round trip. A hundred 0.4 ms queries with 0.5 ms of network each is
90 ms of pure waiting, and it grows linearly with result size — which testing with
ten rows never reveals.

Instrument it. Log query count and total query time per request, and put the count
in the response headers in development:

```ts
res.set("Server-Timing", `db;dur=${totalMs};desc="${queryCount} queries"`);
```

Then **assert** it, so the regression is caught by CI rather than by a customer:

```ts
test("the feed endpoint issues a bounded number of queries", async () => {
  const { queries } = await withQueryCount(() => getFeed(userId));
  expect(queries.length).toBeLessThan(6);
});
```

This single test catches almost every N+1 that would otherwise ship. Code review
does not catch them reliably, because the query is invisible at the call site.

---

# N+1: the default failure of every ORM

```ts
// 1 + N queries. The loop is invisible as a performance problem.
const posts = await db.post.findMany();
for (const p of posts) p.author = await db.user.findUnique({ where: { id: p.authorId } });

// 1 query
const posts = await db.post.findMany({ include: { author: true } });
```

Where an ORM cannot express the join, batch by key:

```sql
SELECT * FROM users WHERE id = ANY($1);     -- one round trip, array of ids
```

In a resolver-based system (GraphQL), the loop is structural — a field resolver
has no idea it is being called for a hundred parents. Use a per-request DataLoader
that batches within a tick and deduplicates keys. → `API/graphql`

**Never** access a relation inside a loop. That single rule prevents most of this
class.

---

# Ask for less

| Habit | Cost |
| --- | --- |
| `SELECT *` | Moves columns nobody reads; defeats index-only scans |
| Hydrating full ORM entities | Allocation and serialisation for unused fields |
| No `LIMIT` | The result set grows with the table |
| Aggregating in application code | Every row crosses the wire |
| Fetching to count | Reads everything to produce one number |

```ts
// Explicit projection: smaller payload, and the index can cover the query
const rows = await db.user.findMany({
  where: { tenantId },
  select: { id: true, email: true },
  take: 50,
});

// Count in the database
const total = await db.order.count({ where: { tenantId, status: "paid" } });
```

Projection is also a security control: a default full-entity fetch that reaches a
JSON response is how password hashes leak. → `Backend/validation`

---

# Pagination is a performance decision

`OFFSET 100000` makes the database produce and discard 100,000 rows before
returning 20. The cost grows with depth, so the deepest pages — usually crawlers
and exports — are the most expensive requests you serve.

```sql
-- Constant cost at any depth
SELECT * FROM orders
WHERE tenant_id = $1 AND (created_at, id) < ($2, $3)
ORDER BY created_at DESC, id DESC
LIMIT 20;
```

Also: `COUNT(*)` over a filtered set is a second full scan. Make total counts
opt-in, or return an estimate. → `API/pagination`

---

# Batch, and do independent work concurrently

```ts
// Sequential — 3 round trips of latency for 3 independent queries
const user   = await getUser(id);
const orders = await getOrders(id);
const prefs  = await getPrefs(id);

// One round-trip's worth of latency
const [user, orders, prefs] = await Promise.all([getUser(id), getOrders(id), getPrefs(id)]);
```

- Bound the concurrency. `Promise.all` over 5,000 items opens 5,000 queries and
  exhausts the connection pool — which presents as "the database is slow" when it
  is actually queueing. → `Database/postgres`
- Bulk writes: one `INSERT ... VALUES (…),(…),(…)` or `COPY` beats a thousand
  single-row inserts by orders of magnitude.
- Use a limiter rather than raw `Promise.all` for large sets:
  `pLimit(10)`, a semaphore, or the ORM's own batching. The right bound is the
  free capacity in `DB_POOL_SIZE`, not the number of items.
- Keep network calls **out of transactions** — an open transaction holds locks and
  a connection for the duration of someone else's latency.
  → `Database/transactions`

---

# Anti-patterns

| Anti-pattern | Why it fails | Fix |
| --- | --- | --- |
| No query-count instrumentation | N+1 is invisible until production | Log and assert counts |
| Relation access inside a loop | 1 + N round trips | Eager load or batch |
| Resolvers without DataLoader | N+1 by construction | Per-request loaders |
| `SELECT *` | Moves unused bytes; defeats covering indexes | Explicit projection |
| Returning ORM entities to the API | Leaks internal and sensitive fields | Map to an explicit shape |
| Missing `LIMIT` | Cost grows with the table | Always paginate |
| `OFFSET` for deep pages | Produces and discards every skipped row | Keyset pagination |
| `COUNT(*)` on every list request | A second full scan per page | Opt-in or estimate |
| Aggregating in application code | Every row crosses the wire | `GROUP BY` in SQL |
| Fetching rows to count them | Reads everything for one number | `count()` |
| Sequential independent queries | Latency adds up | `Promise.all` |
| Unbounded concurrent fan-out | Pool exhaustion; looks like a slow database | Concurrency limiter |
| Row-by-row inserts | Orders of magnitude slower | Bulk insert or `COPY` |
| Network calls inside transactions | Locks held for external latency | Move them out |
| Testing against small datasets | Plans and costs differ entirely | Production-shaped data |

---

# Checklist

- [ ] Verify: Query count and total query time are logged per request
- [ ] Verify: Integration tests assert a bounded query count on key endpoints
- [ ] Verify: No relation is fetched inside a loop
- [ ] Verify: Resolver-based APIs batch through per-request DataLoaders
- [ ] Verify: Queries select explicit columns, never `*`
- [ ] Verify: API responses are built from explicit shapes, not ORM entities
- [ ] Verify: Every list query has a limit and paginates
- [ ] Verify: Deep pagination uses keyset cursors, not `OFFSET`
- [ ] Verify: Total counts are opt-in or estimated
- [ ] Verify: Aggregation happens in the database
- [ ] Verify: Independent queries run concurrently, with bounded fan-out
- [ ] Verify: Bulk writes use multi-row inserts or `COPY`
- [ ] Verify: No network call happens inside a transaction
- [ ] Verify: Performance is verified against production-shaped data volumes
