---
targetModels:
  - "DeepSeek V4"
  - "DeepSeek V3.2"
  - "DeepSeek R1"
  - "DeepSeek V3 Family"
  - "Future DeepSeek Models"
name: orm
category: Database
description: Using an ORM without losing control of the SQL it emits — N+1 prevention, transaction scoping, migrations, and knowing when to drop to raw SQL.
license: MIT
author: Agent.md maintainers
last-verified: 2026-08-23
reviewed-by: unreviewed
---
<!-- Generated from models/_canonical by scripts/build-model-variants.js.
     Edit the canonical source, not this file. Structure adapted for DeepSeek per deep-research.md. -->


# Purpose

Rules for working with an ORM (Prisma, Drizzle, TypeORM, SQLAlchemy, ActiveRecord,
Ent). An ORM removes boilerplate and gives you types. It does not remove the need
to understand the SQL — it hides it, which is the problem this package addresses.

Working rule: **you must be able to see the SQL for any query you ship.** If you
cannot, you are not in a position to say whether it is correct or fast.

---

# See the SQL

Turn on query logging in development, permanently:

```js
// Prisma
new PrismaClient({ log: [{ emit: "event", level: "query" }] })
  .$on("query", (e) => console.log(e.query, e.params, `${e.duration}ms`));
```

```py
# SQLAlchemy
create_engine(url, echo=True)
```

```rb
# ActiveRecord — already on in development; make it visible
ActiveRecord::Base.logger = Logger.new($stdout)
```

Two things become obvious immediately: the number of queries per request, and any
query the ORM built that you would never have written.

---

# N+1 is the default failure

Lazy loading turns a property access into a query. It is invisible in the code
and catastrophic under load.

```js
// N+1 — one query, then one per row
const posts = await db.post.findMany();
for (const p of posts) p.author = await db.user.findUnique({ where: { id: p.authorId } });

// Eager — one query
const posts = await db.post.findMany({ include: { author: true } });
```

| ORM | Eager loading |
| --- | --- |
| Prisma | `include` / `select` |
| Drizzle | `with: { author: true }` |
| SQLAlchemy | `selectinload()` / `joinedload()` |
| ActiveRecord | `includes(:author)` |
| TypeORM | `relations: ["author"]` |

Assert query counts in integration tests. Code review does not catch N+1
reliably; a failing test does.

```js
// Fails the moment someone adds a lazy relation to this endpoint
expect(queryCount(() => getFeed(userId))).toBeLessThan(5);
```

**Never** access a relation inside a loop. → `Database/query-optimization`

---

# Select only what you need

An ORM's default is to hydrate every column into an object.

```js
// Moves password hashes, blobs and audit columns you never read
const users = await db.user.findMany();

// Explicit projection — smaller payload, enables index-only scans
const users = await db.user.findMany({ select: { id: true, email: true } });
```

Projection is also a security control: a default `findMany()` that reaches a JSON
response is how password hashes and internal flags leak. Serialise from an
explicit shape, never from the ORM entity directly.

---

# Transactions

Scope a transaction to one unit of work, and keep everything slow outside it.

```js
await db.$transaction(async (tx) => {
  await tx.account.update({ where: { id: from }, data: { balance: { decrement: amt } } });
  await tx.account.update({ where: { id: to   }, data: { balance: { increment: amt } } });
});
```

- **Never** make an HTTP call, send an email, or await user input inside a
  transaction. It holds locks and a connection for the duration of someone else's
  latency.
- Use `{ decrement: n }`-style atomic operators rather than read-then-write in
  application code — the read-modify-write loses updates under concurrency.
- Handle serialization failures and deadlocks with a bounded retry.
  → `Database/transactions`

---

# Migrations

Use the ORM's migration tool, but read the generated SQL before applying it.
Generators routinely produce a table rewrite or a blocking index build where a
safe equivalent exists.

- Review every generated migration as code, in the pull request.
- Add `CREATE INDEX CONCURRENTLY` by hand — most generators do not emit it.
- Never edit an applied migration; write a new one.
- Verify the migration is reversible, or state explicitly that it is not.
  → `Database/migration`

---

# Connection handling

The ORM owns the pool. Misconfiguring it is the most common ORM-caused outage,
and it looks like a slow query rather than what it is: waiting for a connection.

| Setting | Typical | Note |
| --- | --- | --- |
| `connection_limit` (Prisma) | `(cores * 2) + 1` per instance | Multiply by instance count against `max_connections` |
| `pool_size` / `max_overflow` (SQLAlchemy) | `5` / `10` | `pool_pre_ping=True` to survive dropped connections |
| `pool` (ActiveRecord) | matches thread count | A pool smaller than the thread pool serialises requests |
| `pool_timeout` | `10s` | Fail fast rather than queue forever |
| `idle_timeout` | below the server's `idle_in_transaction_session_timeout` | Avoid using a connection the server already closed |

In serverless, a per-invocation `PrismaClient`/`create_engine` opens a new pool on
every cold start. Instantiate once at module scope and route through a pooler.
→ `Database/postgres`

Instrument `pool.wait_time` or the equivalent. If p99 request latency is high
while the database is idle, the queue is in the pool, not in the engine.

---

# When to drop to SQL

Use raw SQL, parameterised, when the ORM's generated query is wrong or slow:

```js
await db.$queryRaw`SELECT tenant_id, count(*) FROM orders
                   WHERE created_at > ${since} GROUP BY tenant_id`;
```

Legitimate cases: window functions, recursive CTEs, bulk upserts, complex
aggregation, and anything where `EXPLAIN` shows the ORM's plan is unusable.

**Never** build SQL by string concatenation, even inside an ORM's raw escape
hatch. `$queryRaw` with a tagged template parameterises; `$queryRawUnsafe` with an
interpolated string does not. → `Security/sql-injection`

---

# Anti-patterns

| Anti-pattern | Why it fails | Fix |
| --- | --- | --- |
| No query logging in development | The SQL is invisible until production | Log every query with duration |
| Relation access inside a loop | N+1; latency multiplied | Eager load |
| No query-count assertions | N+1 regressions ship unnoticed | Assert counts in tests |
| Default full-entity fetch | Moves unused and sensitive columns | Explicit `select` |
| Serialising the entity to JSON | Leaks hashes and internal fields | Map to an explicit DTO |
| HTTP call inside a transaction | Holds locks for external latency | Do it before or after |
| Read-then-write for counters | Lost updates | Atomic increment operators |
| Applying generated migrations unread | Table rewrites, blocking index builds | Review the SQL in the PR |
| Editing an applied migration | Environments diverge | New migration |
| `queryRawUnsafe` with interpolation | SQL injection | Parameterised tagged template |
| Repository abstraction over the ORM | The ORM already is one | Use it directly |

---

# Checklist

- [ ] Query logging with durations is enabled in development
- [ ] Relations are eager-loaded; no relation access inside a loop
- [ ] Query counts are asserted in integration tests for key endpoints
- [ ] Queries project explicit columns rather than whole entities
- [ ] API responses are built from explicit shapes, not ORM entities
- [ ] Transactions contain no network calls and no user interaction
- [ ] Counters use atomic operators, not read-then-write
- [ ] Deadlock and serialization retries are implemented
- [ ] Generated migrations are reviewed as SQL before merge
- [ ] Index creation on large tables is concurrent
- [ ] Raw SQL is parameterised; no string concatenation anywhere
