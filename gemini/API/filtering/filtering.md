---
targetModels:
  - "Gemini 3.6 Flash"
  - "Gemini 3.5 Flash"
  - "Gemini 3.1 Pro"
  - "Gemini 3 Family"
  - "Future Gemini Models"
name: filtering
category: API
description: Filter parameters that are expressive without being injectable — allowlisted fields, typed operators, index-backed queries, and bounded cost.
license: MIT
author: Agent.md maintainers
last-verified: 2026-08-23
reviewed-by: unreviewed
---
<!-- Generated from models/_canonical by scripts/build-model-variants.js.
     Edit the canonical source, not this file. Structure adapted for Gemini per deep-research.md. -->


# Purpose

Rules for query filtering on list endpoints. Filtering sits directly on top of the
database, which makes it the place where API design, SQL injection and query
performance meet. Three requirements, in priority order:

1. **Safe** — no client string ever reaches SQL as structure.
2. **Bounded** — no filter combination can produce an unindexed full scan.
3. **Predictable** — the same query means the same thing next release.

---

# Syntax: pick one and hold it

| Style | Example | Trade-off |
| --- | --- | --- |
| Flat equality | `?status=paid&currency=EUR` | Simplest; no ranges |
| Bracketed operators | `?total[gte]=1000&status[in]=paid,void` | Readable, expressive. **Default** |
| Prefixed operators | `?minTotal=1000&maxTotal=5000` | Explicit; parameter count grows |
| RSQL / OData | `?filter=total>=1000;status==paid` | Very expressive; needs a real parser |
| JSON in a query param | `?filter={"total":{"$gte":1000}}` | Awkward to encode; invites Mongo-style injection |

Bracketed operators cover almost every real need without a grammar to maintain.
Whatever you choose, use it on **every** list endpoint — a per-endpoint dialect is
a permanent tax on client authors.

Repeated parameters mean `IN`, and it should be documented:

```
?status=paid&status=refunded        →  status IN ('paid','refunded')
?tag=eu&tag=priority                →  tag = 'eu' AND tag = 'priority'   (also valid — pick one, document it)
```

---

# Allowlist the field and the operator

This is the whole security story. Never map client input to SQL structure by
interpolation.

```ts
const FILTERABLE = {
  status:    { column: "status",       ops: ["eq", "in"],               type: "enum"   },
  totalCents:{ column: "total_cents",  ops: ["eq","gte","lte"],         type: "int"    },
  createdAt: { column: "created_at",   ops: ["gte","lte"],              type: "date"   },
  email:     { column: "email",        ops: ["eq", "startsWith"],       type: "string" },
} as const;

const OPS = { eq: "=", gte: ">=", lte: "<=", in: "IN" } as const;

function clause(field: string, op: string, raw: unknown) {
  const spec = FILTERABLE[field];
  if (!spec) throw new BadRequest(`Unknown filter field: ${field}`);
  if (!spec.ops.includes(op)) throw new BadRequest(`Operator ${op} not allowed on ${field}`);
  const value = coerce(spec.type, raw);              // throws on a bad value
  return { sql: `${spec.column} ${OPS[op]} ?`, value };   // column from the table, never from input
}
```

Three properties matter:

- The **column name comes from your table**, keyed by an alias. A client-supplied
  column name interpolated into SQL is injection even if the value is
  parameterised. → `Security/sql-injection`
- The **operator comes from a fixed map**. `OPS[op]` with an unknown key is
  `undefined`, not a fragment.
- Values are **parameterised and type-coerced**. Reject `?totalCents[gte]=abc`
  with `400`, do not coerce it to `0`.

Exposing your internal column names in the API also freezes your schema — the
alias layer means a column rename is not a breaking change.

---

# Bound the cost

An expressive filter language lets a client construct a query nobody planned for.

- Every filterable field must be **indexed**, or explicitly documented as slow and
  rate-limited more strictly. → `Database/indexes`
- Cap the number of filters per request (e.g. 10) and the size of an `in` list
  (e.g. 100).
- **Leading-wildcard search (`%term%`) cannot use a B-tree index.** Offer
  `startsWith` instead, or route full-text search to a trigram/GIN index or a
  search engine — not to `LIKE '%…%'` on a large table.
- Always combine filtering with pagination and a bounded `limit`.
  → `API/pagination`
- Tenant scoping is not a filter. It is applied server-side to every query,
  regardless of what the client sent. → `Security/authorization`

Check the plan for the worst legal combination, not the common one:

```sql
-- The worst request a client may legally send, planned before it is shipped
EXPLAIN (ANALYZE, BUFFERS)
SELECT * FROM orders
WHERE tenant_id = $1
  AND status = ANY($2)                 -- in: 100 values
  AND total_cents >= $3
  AND created_at BETWEEN $4 AND $5
ORDER BY created_at DESC, id DESC
LIMIT 100;
```

A `Seq Scan` or a `Rows Removed by Filter` in the hundreds of thousands means the
filter combination is not index-backed and must be narrowed or indexed before
release. → `Database/query-optimization`

---

# Semantics worth defining once

- **Multiple fields combine with `AND`.** If you need `OR`, add it explicitly
  rather than overloading repeated parameters.
- **Absent versus empty**: `?status=` should be a `400`, not "match everything" and
  not "match empty string".
- **Null matching** needs an explicit operator (`?deletedAt[isNull]=true`) —
  `= NULL` never matches.
- **Ranges are inclusive** unless the operator says otherwise, and dates are
  RFC 3339 UTC.
- **Case sensitivity** is a documented property per field, backed by a matching
  index (`lower(email)` needs an expression index).

Document every filterable field, its operators and its type in the OpenAPI
document, so clients and generators see the same contract. → `API/open-api`

---

# Anti-patterns

| Anti-pattern | Why it fails | Fix |
| --- | --- | --- |
| Client-supplied column name in SQL | Injection, even with parameterised values | Alias → column allowlist |
| Operator string interpolated | `?op=; DROP` reaches the parser | Fixed operator map |
| Values not type-checked | `abc` coerced to `0`; wrong results | Coerce and reject |
| Unindexed filterable field | Full scan on demand | Index it or document and limit it |
| `LIKE '%term%'` on a large table | Cannot use a B-tree index | `startsWith`, trigram index, or a search engine |
| Unbounded `in` list | One request scans everything | Cap the list length |
| No cap on filter count | Unplanned query shapes | Limit filters per request |
| Filtering without pagination | Unbounded result set | Always paginate |
| Tenant scope passed as a filter | Client can omit or change it | Server-side, unconditional |
| Per-endpoint filter dialects | Every client re-learns the API | One syntax everywhere |
| Empty value means "all" | Surprising and easy to send accidentally | `400` on empty |
| Internal column names in the API | Schema changes become breaking | Alias layer |
| Undocumented filters | Discovered by trial and error, then depended on | Declare in OpenAPI |

---

# Checklist

- [ ] Verify: One filter syntax is used across every list endpoint
- [ ] Verify: Filterable fields come from an explicit allowlist mapping alias → column
- [ ] Verify: Allowed operators are declared per field
- [ ] Verify: Operators resolve through a fixed map, never string interpolation
- [ ] Verify: Values are type-coerced and rejected with `400` when invalid
- [ ] Verify: All values are passed as bound parameters
- [ ] Verify: Every filterable field is indexed, or documented as slow and rate-limited
- [ ] Verify: `in` list length and filters-per-request are capped
- [ ] Verify: Substring search does not use a leading-wildcard `LIKE` on large tables
- [ ] Verify: Filtering is always combined with pagination and a bounded limit
- [ ] Verify: Tenant scoping is applied server-side and cannot be influenced by input
- [ ] Verify: Combination semantics, null handling and case sensitivity are documented
- [ ] Verify: The worst legal filter combination has been checked with `EXPLAIN ANALYZE`
- [ ] Verify: Filters are declared in the OpenAPI document
