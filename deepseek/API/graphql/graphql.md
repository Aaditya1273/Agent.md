---
targetModels:
  - "DeepSeek V4"
  - "DeepSeek V3.2"
  - "DeepSeek R1"
  - "DeepSeek V3 Family"
  - "Future DeepSeek Models"
name: graphql
category: API
description: GraphQL schema and server rules — bounding query cost, killing N+1 with dataloaders, per-field authorization, and errors clients can act on.
license: MIT
author: Agent.md maintainers
last-verified: 2026-08-23
reviewed-by: unreviewed
---
<!-- Generated from models/_canonical by scripts/build-model-variants.js.
     Edit the canonical source, not this file. Structure adapted for DeepSeek per deep-research.md. -->


# Purpose

Rules for building a GraphQL API. GraphQL moves query construction from the server
to the client. That is the feature and the entire risk surface: the client now
decides how expensive a request is, and how deep it goes.

Every rule here follows from that. Choose GraphQL when clients genuinely need
varied shapes; if every consumer fetches the same thing, REST is less machinery.
→ `API/rest`

---

# Bound the cost of a query

A public GraphQL endpoint without cost controls is an open denial-of-service
target. All four controls below are needed — none is sufficient alone.

```graphql
# Without depth limiting, this recurses until the server dies
query { user { friends { friends { friends { friends { id } } } } } }
```

| Control | Typical value | Tool |
| --- | --- | --- |
| Maximum depth | 10–15 | `graphql-depth-limit` |
| Query complexity budget | Per-operation score | `graphql-query-complexity` |
| Maximum aliases / breadth | 100 | Custom validation rule |
| Timeout | 10s | Server config |
| Persisted queries | Allowlist only | `graphql-codegen` + APQ |

**Persisted (allowlisted) queries are the strongest control.** The client sends a
hash; the server executes only queries it has seen at build time. Arbitrary
queries become impossible. Use this for first-party clients; keep cost limits for
any genuinely public endpoint.

Assign complexity weights by real cost — a paginated list costs `limit ×
child cost`, not `1`:

```ts
@Field(() => [Order], { complexity: ({ args, childComplexity }) =>
  args.first * childComplexity })
```

**Never** expose introspection on a public production endpoint. It hands an
attacker the complete schema, including fields you forgot were reachable.

---

# N+1 is structural, not accidental

Resolvers run per field per object. A list of 100 orders each resolving `customer`
issues 100 queries — the resolver has no idea it is in a list.

```ts
// One batched query per tick, deduplicated by key
const customerLoader = new DataLoader(async (ids: readonly string[]) => {
  const rows = await db.customer.findMany({ where: { id: { in: [...ids] } } });
  const byId = new Map(rows.map((r) => [r.id, r]));
  return ids.map((id) => byId.get(id) ?? null);   // must return in input order
});
```

Three rules that are easy to get wrong:

1. **Create loaders per request**, in the context factory. A module-scope
   DataLoader caches across users and leaks data between them.
2. **Return results in input order**, one entry per key, `null` for misses.
   Returning the raw query result mismatches keys silently.
3. **Batch relations, not just entities.** A one-to-many needs a loader keyed by
   the parent id that groups the result.

Assert resolver query counts in tests — this regresses every time someone adds a
field. → `Database/query-optimization`

---

# Authorization is per field

There is no endpoint to guard. A single query can traverse from a public field
into a sensitive one, so authorization belongs in the resolver or the type layer.

```ts
Order: {
  costBasisCents: (order, _args, ctx) => {
    if (!ctx.can("order:read_financials", order.tenantId)) return null;
    return order.costBasisCents;
  },
}
```

- Check on the **object being resolved**, not on the root argument. A nested path
  reaches objects the top-level check never saw.
- Default to deny: a field with no explicit policy should fail review.
- Never rely on the client not asking for a field.
- Depth-limit and cost controls are not authorization — they limit volume, not
  access. → `Security/authorization`

---

# Schema design

```graphql
type Order implements Node {
  id: ID!
  status: OrderStatus!
  totalCents: Int!
  currency: String!
  items(first: Int = 20, after: String): OrderItemConnection!
}

union CreateOrderResult = CreateOrderSuccess | ValidationFailed | InsufficientFunds
```

| Rule | Why |
| --- | --- |
| Non-null (`!`) only where truly guaranteed | A null in a non-null field **nulls the whole parent** |
| Enums, not free strings | Validated by the schema, self-documenting |
| Connections for lists | Pagination is impossible to retrofit → `API/pagination` |
| Result unions for mutations | Expected failures are typed, not exceptions |
| One input object per mutation | Adding a field stays non-breaking |
| Global `ID` opaque and namespaced | Prevents cross-type id confusion |

The non-null propagation rule surprises people: if a `String!` resolver returns
`null`, GraphQL nulls the parent object, and if that is also non-null, it
propagates upward — potentially nulling the entire `data` payload. Be
conservative with `!`.

**Never** version a GraphQL schema with `/v2`. Deprecate fields in place:

```graphql
amount: Int! @deprecated(reason: "Use totalCents. Removed after 2026-09-01.")
```

---

# Errors

GraphQL returns `200` with a top-level `errors` array. Clients need more
structure than a message string.

```json
{ "errors": [{
    "message": "Insufficient funds",
    "path": ["createOrder"],
    "extensions": { "code": "INSUFFICIENT_FUNDS", "requestId": "req_01J8Z" }
}] }
```

- Put a stable machine code in `extensions.code`. Clients branch on the code.
- Model **expected** failures (validation, business rules) as result unions in the
  schema; reserve the `errors` array for genuinely exceptional conditions.
- Mask internal errors in production — `maskedErrors: true` in Yoga, or a
  `formatError` hook. A stack trace in `extensions` is an information leak.
- Include a `requestId` in every response.

---

# Operations

- **Disable introspection and the GraphiQL playground** in production.
- Log per-operation name, complexity score and duration — not the raw query
  string, which contains user data.
- `@defer`/`@stream` change response framing; confirm every client supports the
  incremental delivery protocol before enabling them.
- Caching is per-field, not per-URL. HTTP caches are useless here; use persisted
  queries plus a response cache keyed on the operation hash and the viewer.

---

# Anti-patterns

| Anti-pattern | Why it fails | Fix |
| --- | --- | --- |
| No depth or complexity limit | Recursive query kills the server | Depth + complexity + timeout |
| Introspection enabled publicly | Full schema handed to attackers | Disable in production |
| Resolvers without DataLoader | N+1 on every list field | Per-request loaders |
| Module-scope DataLoader | Caches across users; data leaks | Create in the context factory |
| Loader returning unordered results | Silent key/value mismatch | Map back into input order |
| Authorization only at the root | Nested paths bypass it | Check on each resolved object |
| Everything non-null | One null nulls the whole response | `!` only where guaranteed |
| Lists without connections | Pagination cannot be retrofitted | Connection pattern from the start |
| Business failures thrown as errors | Untyped, unhandleable by clients | Result unions |
| `/v2` endpoint | Doubles the schema | `@deprecated` in place |
| Raw query strings in logs | Logs user data | Log operation name and hash |
| Unmasked errors in production | Stack traces leak internals | `maskedErrors` / `formatError` |

---

# Checklist

- [ ] Query depth, complexity, breadth and timeout limits are all enforced
- [ ] Complexity weights reflect real cost, including pagination multipliers
- [ ] First-party clients use persisted/allowlisted queries
- [ ] Introspection and the playground are disabled in production
- [ ] Every relation field resolves through a per-request DataLoader
- [ ] Loaders return one result per key, in input order
- [ ] Resolver query counts are asserted in tests
- [ ] Authorization is checked on each resolved object, defaulting to deny
- [ ] Non-null is used only where the value is genuinely guaranteed
- [ ] All list fields use the connection pattern
- [ ] Expected failures are typed as result unions
- [ ] Errors carry a stable `extensions.code` and a `requestId`
- [ ] Internal errors are masked in production
- [ ] Deprecation uses `@deprecated` with a removal date, not a new endpoint
