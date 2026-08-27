---
targetModels:
  - "Claude Fable 5"
  - "Claude Opus 5"
  - "Claude Sonnet 5"
  - "Claude 5 Family"
  - "Future Claude Models"
name: sorting
category: API
description: Sort parameters that are stable, indexed and injection-proof — allowlisted keys, deterministic tiebreakers, null ordering, and locale-aware text.
license: MIT
author: Agent.md maintainers
last-verified: 2026-08-23
reviewed-by: unreviewed
---
<!-- Generated from models/_canonical by scripts/build-model-variants.js.
     Edit the canonical source, not this file. Structure adapted for Claude per deep-research.md. -->
# Purpose

<purpose>
Rules for sorting on list endpoints. Sorting looks trivial and produces two
serious bugs: a client-controlled column name reaching SQL, and a non-deterministic
order that makes pagination silently skip rows.

---
</purpose>

# Syntax

<rules>
```
GET /v1/orders?sort=-createdAt          descending
GET /v1/orders?sort=status,-createdAt   multi-key, in priority order
```

The `-` prefix is the most common convention and needs no second parameter. The
alternative — `?sortBy=createdAt&order=desc` — cannot express multi-key sorting
without inventing array syntax.

Whatever you choose, use it on **every** list endpoint. Always define and document
a **default sort**; an endpoint with no default returns rows in whatever order the
database found them, which changes between releases and between replicas.

---
</rules>

# Allowlist, always

<rules>
```ts
const SORTABLE = {
  createdAt: "created_at",
  total:     "total_cents",
  status:    "status",
} as const;

function orderBy(sort = "-createdAt") {
  const keys = sort.split(",").slice(0, 3);            // cap the key count
  const parts = keys.map((k) => {
    const desc = k.startsWith("-");
    const column = SORTABLE[desc ? k.slice(1) : k];    // column from the table, not from input
    if (!column) throw new BadRequest(`Cannot sort by ${k}`);
    return `${column} ${desc ? "DESC" : "ASC"}`;
  });
  parts.push("id DESC");                               // deterministic tiebreaker, always
  return parts.join(", ");
}
```

- The column name comes from **your** map. Parameterisation does not protect
  identifiers — a bound parameter cannot be a column name, so an interpolated one
  is injection. → `Security/sql-injection`
- Direction resolves to the literal `ASC`/`DESC`, never to client text.
- Unknown key → `400` with the field named. Silently falling back to a default
  hides client bugs and makes results look correct while being wrong.
- Cap the number of sort keys; each one adds an index requirement.

Aliases also decouple the API from the schema, so renaming `total_cents` is not a
breaking change. → `API/filtering`

---
</rules>

# Determinism is mandatory

<rules>
**Every sort must end in a unique tiebreaker.** Without one, rows with equal sort
values may come back in any order — and a different order on the next page.

```sql
-- Broken: two orders created in the same millisecond swap between pages,
-- so one is returned twice and another never appears.
ORDER BY created_at DESC

-- Correct
ORDER BY created_at DESC, id DESC
```

This is the mechanism behind "the export is missing rows" reports that nobody can
reproduce. It only manifests under ties, which are rare in test data and common in
production. → `API/pagination`

Cursor pagination requires the same total order, and the cursor must encode every
sort key. A cursor is valid only for the sort it was issued with — validate that,
or reset pagination when the sort changes.

---
</rules>

# Index every sortable field

<rules>
A sort without a matching index makes the database read and sort the entire
matching set for every page.

| Query | Index required |
| --- | --- |
| `WHERE tenant_id = ? ORDER BY created_at DESC, id DESC` | `(tenant_id, created_at DESC, id DESC)` |
| `ORDER BY lower(name) ASC, id ASC` | `(lower(name), id)` expression index |
| `ORDER BY total_cents DESC NULLS LAST, id DESC` | `(total_cents DESC NULLS LAST, id DESC)` |

The index's key order and direction must match the `ORDER BY` — including the
tiebreaker and the null placement. A close-but-not-exact index is not used, and
`EXPLAIN` will show a `Sort` node above the scan. → `Database/indexes`

Verify with `EXPLAIN (ANALYZE, BUFFERS)` that no `Sort` node appears for any
allowed sort combination.

---
</rules>

# Nulls, text and case

<rules>
- **Null placement is engine-specific.** Postgres puts `NULL` first on `DESC`;
  MySQL puts it last. State it explicitly (`NULLS LAST`) so behaviour does not
  change with the database.
- **Text sorting is collation-dependent.** `'Ä'` sorts differently under `C`,
  `en_US` and `de_DE`. Pick a collation, declare it on the column, and index it —
  changing collation later invalidates every text index.
- **Case sensitivity**: `ORDER BY name` puts `Zebra` before `apple` under a binary
  collation. Sort on `lower(name)` with a matching expression index, and document
  the choice.
- **Numbers stored as text** sort lexicographically: `"10" < "9"`. Store numbers
  as numbers.
- **Enumerations** rarely sort usefully by their string value. If `pending` should
  precede `shipped`, sort by an explicit rank column or a `CASE` expression, not
  alphabetically.

---
</rules>

# Anti-patterns

<antipatterns>
| Anti-pattern | Why it fails | Fix |
| --- | --- | --- |
| Client sort key interpolated into SQL | Injection — parameters cannot bind identifiers | Allowlist map |
| Direction taken from client text | Same injection surface | Literal `ASC`/`DESC` |
| Unknown key silently ignored | Wrong results that look right | `400` naming the field |
| No default sort | Order changes between releases and replicas | Documented default |
| Sort without a unique tiebreaker | Pages skip and duplicate rows | Append the primary key |
| Cursor not bound to the sort | Meaningless position after a sort change | Encode and validate sort in the cursor |
| Unindexed sortable field | Full sort per page | Composite index matching the sort |
| Index direction mismatched | Extra `Sort` node; index unused | Match order and direction exactly |
| Relying on default null placement | Differs between Postgres and MySQL | Explicit `NULLS FIRST/LAST` |
| Ignoring collation | Locale-dependent order; index invalidation on change | Declare and index the collation |
| Sorting numeric strings | `"10" < "9"` | Numeric column type |
| Alphabetical enum sort | `cancelled` before `pending` | Explicit rank |
| Unbounded sort key count | Unplanned query shapes | Cap the keys |
| Internal column names exposed | Renames become breaking changes | Alias layer |

---
</antipatterns>

# Checklist

<checklist>
- [ ] One sort syntax is used across every list endpoint
- [ ] Every endpoint has a documented default sort
- [ ] Sort keys come from an allowlist mapping alias → column
- [ ] Direction resolves to a literal, never to client-supplied text
- [ ] Unknown sort keys return `400` naming the field
- [ ] The number of sort keys is capped
- [ ] Every sort ends in a unique tiebreaker
- [ ] Cursors encode the sort and are validated against it
- [ ] A composite index matches each allowed sort, including direction and tiebreaker
- [ ] `EXPLAIN ANALYZE` shows no `Sort` node for any allowed combination
- [ ] Null ordering is stated explicitly
- [ ] Text collation and case handling are declared, indexed and documented
- [ ] Enumerations sort by an explicit rank, not alphabetically
- [ ] Sortable fields are declared in the OpenAPI document
</checklist>
