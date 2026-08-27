---
targetModels:
  - "DeepSeek V4"
  - "DeepSeek V3.2"
  - "DeepSeek R1"
  - "DeepSeek V3 Family"
  - "Future DeepSeek Models"
name: prisma
category: Database
description: Prisma-specific rules — schema modelling, connection pooling in serverless, migration workflow, and the query patterns that generate bad SQL.
license: MIT
author: Agent.md maintainers
last-verified: 2026-08-23
reviewed-by: unreviewed
---
<!-- Generated from models/_canonical by scripts/build-model-variants.js.
     Edit the canonical source, not this file. Structure adapted for DeepSeek per deep-research.md. -->


# Purpose

Rules for Prisma specifically. General ORM discipline is `Database/orm`; this
covers Prisma's own sharp edges — the client lifecycle, `prisma migrate`, and the
places where the generated SQL differs from what the schema implies.

---

# One client, module scope

```ts
// src/lib/prisma.ts
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({ log: ["warn", "error"] });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
```

The `globalThis` cache is not a hack — Next.js and most dev servers hot-reload
modules, and a fresh `PrismaClient` per reload exhausts `max_connections` within
minutes.

**Never** construct a `PrismaClient` inside a request handler or a serverless
function body. Each instance opens its own pool.

In serverless, additionally set a pooled connection string and a small limit:

```
DATABASE_URL="postgresql://…/db?pgbouncer=true&connection_limit=1&pool_timeout=20"
DIRECT_URL="postgresql://…/db"     # migrations bypass the pooler
```

`pgbouncer=true` disables prepared statements, which transaction-mode pooling
cannot support. `directUrl` in the datasource block is what `prisma migrate` uses
— migrations must not go through a transaction pooler.
→ `Database/postgres`

---

# Schema modelling

```prisma
model Order {
  id        String      @id @default(uuid(7)) @db.Uuid
  tenantId  String      @map("tenant_id") @db.Uuid
  status    OrderStatus @default(PENDING)
  totalCents BigInt     @map("total_cents")
  currency  String      @db.Char(3)
  createdAt DateTime    @default(now())    @map("created_at") @db.Timestamptz(3)
  updatedAt DateTime    @updatedAt         @map("updated_at") @db.Timestamptz(3)
  tenant    Tenant      @relation(fields: [tenantId], references: [id], onDelete: Cascade)

  @@index([tenantId, createdAt(sort: Desc)])
  @@map("orders")
}
```

| Rule | Why |
| --- | --- |
| `@db.Timestamptz` explicitly | Prisma's `DateTime` maps to `timestamp(3)` on some connectors — no time zone |
| `BigInt` for money in minor units | `Float` is binary floating point |
| `@map` / `@@map` for snake_case | Keeps SQL conventional while the client stays idiomatic |
| `onDelete` stated on every relation | Prisma's default is `SetNull`/`Restrict` depending on optionality |
| `@@index` in the schema | An index created outside the schema is dropped by the next migration diff |

**Never** create an index manually in the database without also declaring it in
`schema.prisma`. `prisma migrate dev` diffs against the schema and will generate a
`DROP INDEX`.

Prisma does not support `CREATE INDEX CONCURRENTLY`. On a large table, edit the
generated migration SQL by hand. → `Database/migration`

---

# Migration workflow

| Command | Use |
| --- | --- |
| `prisma migrate dev` | Local only. Creates the migration and may **reset the database** |
| `prisma migrate deploy` | The only command that touches staging or production |
| `prisma migrate diff` | Generate SQL to review or hand-edit |
| `prisma db push` | Prototyping only — no migration history |

**Never** run `prisma migrate dev` against a shared or production database. It can
drop and recreate the schema when it detects drift.

**Never** use `prisma db push` on anything with data you care about. It has no
history and no rollback path.

Review the generated `migration.sql` in the pull request. Prisma will emit a
column drop or a type change that rewrites the table without flagging the cost.

---

# Queries

```ts
// Explicit projection — never return the whole entity to an API caller
const users = await prisma.user.findMany({
  where: { tenantId },
  select: { id: true, email: true },
  orderBy: { createdAt: "desc" },
  take: 20,
});
```

- **`include` and `select` are mutually exclusive** at one level. Nest `select`
  inside `include` to project a relation.
- Prisma issues **separate queries per relation** by default and joins in the
  client. Use `relationJoinType: "query"` vs `"join"` (`relationJoins` preview /
  GA depending on version) deliberately, and read the logged SQL either way.
- `findMany` with no `take` will happily return the whole table. Always paginate.
- Deep pagination: use `cursor` + `take`, not `skip`.

```ts
// Keyset pagination — constant cost at any depth
prisma.order.findMany({ take: 20, skip: 1, cursor: { id: lastId }, orderBy: { id: "asc" } });
```

Nested writes are a single transaction — use them rather than hand-rolling one:

```ts
await prisma.order.create({ data: { tenantId, items: { create: lineItems } } });
```

`$transaction([...])` with an array runs sequentially in one transaction;
`$transaction(async (tx) => …)` gives you the interactive form. Keep network calls
out of both. → `Database/transactions`

---

# Anti-patterns

| Anti-pattern | Why it fails | Fix |
| --- | --- | --- |
| `new PrismaClient()` per request | Pool per instance; connection exhaustion | Module-scope singleton |
| No `globalThis` cache in dev | Hot reload leaks clients | Cache on `globalThis` |
| Serverless without `pgbouncer=true` | Prepared statements break through the pooler | Set the flag and `directUrl` |
| `migrate dev` against production | Can reset the database | `migrate deploy` only |
| `db push` on real data | No history, no rollback | `migrate deploy` |
| Index created outside the schema | Dropped by the next diff | Declare `@@index` |
| `DateTime` without `@db.Timestamptz` | Time zone lost | Annotate explicitly |
| `Float` for money | Rounding errors | `BigInt` minor units |
| `findMany` with no `take` | Returns the entire table | Always paginate |
| `skip` for deep pages | Produces and discards rows | `cursor` pagination |
| Returning the model straight to JSON | Leaks hashes and internal fields | `select` an explicit shape |
| Unread generated migration | Silent table rewrite | Review the SQL in the PR |

---

# Checklist

- [ ] A single module-scope `PrismaClient`, cached on `globalThis` in development
- [ ] Serverless deployments use a pooled URL with `pgbouncer=true` and `directUrl`
- [ ] `@db.Timestamptz` on every `DateTime`; `BigInt` minor units for money
- [ ] `onDelete` declared on every relation
- [ ] Every index is declared in `schema.prisma`
- [ ] Concurrent index creation is hand-edited into migrations for large tables
- [ ] `migrate deploy` is the only migration command used outside local dev
- [ ] `db push` is not used against data that matters
- [ ] Generated `migration.sql` is reviewed in the pull request
- [ ] All list queries paginate; deep pagination uses `cursor`
- [ ] Responses are projected with `select`, never the raw model
- [ ] Transactions contain no network calls
