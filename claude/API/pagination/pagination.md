---
targetModels:
  - "Claude Fable 5"
  - "Claude Opus 5"
  - "Claude Sonnet 5"
  - "Claude 5 Family"
  - "Future Claude Models"
name: pagination
category: API
description: Cursor and offset pagination — which to use, how to encode a cursor, and why deep OFFSET pages get slower and skip rows.
license: MIT
author: Agent.md maintainers
last-verified: 2026-08-23
reviewed-by: unreviewed
---
<!-- Generated from models/_canonical by scripts/build-model-variants.js.
     Edit the canonical source, not this file. Structure adapted for Claude per deep-research.md. -->
# Purpose

<purpose>
Rules for paginating list endpoints. Every collection endpoint paginates, from
the first release — retrofitting pagination onto an endpoint that returned
everything is a breaking change, and the endpoint will fall over first.

---
</purpose>

# Choose the strategy deliberately

<rules>
| Strategy | Deep-page cost | Stable under writes | Jump to page N | Total count |
| --- | --- | --- | --- | --- |
| Cursor (keyset) | Constant | Yes | No | Not free |
| Offset/limit | O(offset) | **No** | Yes | Yes |

**Cursor pagination is the default.** Use offset only when the client genuinely
needs numbered pages over a small, slow-changing set — an admin table, not a feed.

Two failures make offset unsuitable for large or active collections:

1. **It gets slower with depth.** `OFFSET 100000` makes the database produce and
   discard 100,000 rows before returning 20.
2. **It skips and duplicates rows.** If a row is inserted before your position
   between page 2 and page 3, one row shifts across the boundary and you never
   see it. This is silent — clients report "missing data" months later.

---
</rules>

# Cursor pagination

<rules>
```
GET /v1/orders?limit=20&cursor=eyJjIjoiMjAyNi0wOC0yM1QxNDozMjo1OVoiLCJpIjoib3JkXzhmZDIifQ
```

```json
{
  "data": [ … ],
  "pageInfo": {
    "nextCursor": "eyJjIjoiMjAyNi0wOC0yM1QxMjowMDowMFoiLCJpIjoib3JkXzRhMWIifQ",
    "hasMore": true
  }
}
```

The query behind it:

```sql
SELECT * FROM orders
WHERE tenant_id = $1
  AND (created_at, id) < ($2, $3)     -- the cursor, as a row comparison
ORDER BY created_at DESC, id DESC
LIMIT $4;
```

Three requirements:

1. **A total sort order.** `created_at` alone is not unique; two rows sharing a
   timestamp make the boundary ambiguous and rows are skipped. Always append a
   unique tiebreaker — the primary key.
2. **An index matching the sort.** `(tenant_id, created_at DESC, id DESC)`.
   Without it the database sorts the whole table for every page.
   → `Database/indexes`
3. **An opaque cursor.** Base64url of a small JSON object. Clients must treat it
   as a blob — document that, and change its internal shape freely.

**Never** expose the sort key as a raw cursor value (`?after=2026-08-23`). Clients
will construct their own, and you can never change the ordering again.

If a cursor must not be forgeable — because it encodes a filter or a tenant —
sign it (HMAC) or store it server-side. An unsigned base64 cursor is decodable and
editable by anyone. → `Security/authorization`

---
</rules>

# Limits

<rules>
- Always a **default** (`20`) and a **maximum** (`100`). An unbounded `limit` is a
  denial-of-service primitive against your own database.
- Clamp rather than error on an over-large limit, and say so in the docs.
- Validate that `limit` is a positive integer before it reaches SQL.

```ts
const limit = Math.min(Math.max(Number(query.limit) || 20, 1), 100);
```

---
</rules>

# Totals

<rules>
`hasMore` is cheap: fetch `limit + 1` rows and report whether the extra one
existed. Do that by default.

An exact `totalCount` requires a second aggregate query that scans the matching
set. On a large filtered collection it costs more than the page itself.

- Return `totalCount` only when the client asked for it (`?include=total`).
- For large sets, an estimate is usually enough — `pg_class.reltuples` for
  unfiltered counts, or a capped count (`LIMIT 1000` then "1000+").

---
</rules>

# Ordering and filtering

<rules>
Ordering must be **explicit and stable**. Without `ORDER BY`, the database may
return rows in any order, and the order may differ between pages of the same
query — so the pagination is meaningless even when it looks correct in testing.

Allow sorting only on an allowlist of fields that are indexed:

```ts
const SORTABLE = { createdAt: "created_at", total: "total_cents" } as const;
const column = SORTABLE[query.sort] ?? "created_at";   // never interpolate input
```

Interpolating a client-supplied column name into SQL is injection.
→ `Security/sql-injection`, `API/sorting`, `API/filtering`

Filters must be part of the cursor's contract: a cursor is only valid for the
filter and sort it was issued with. Either encode them into the cursor and
validate on use, or document that changing filters resets pagination.

---
</rules>

# Anti-patterns

<antipatterns>
| Anti-pattern | Why it fails | Fix |
| --- | --- | --- |
| No pagination at all | Endpoint dies as the table grows | Paginate from day one |
| Offset for feeds and large lists | Slower with depth; skips rows on insert | Cursor pagination |
| Sort key without a tiebreaker | Ties make the boundary ambiguous; rows skipped | Append the primary key |
| No index matching the sort | Full sort per page | Composite index on the sort keys |
| Transparent cursor values | Clients build their own; ordering is frozen | Opaque base64 blob |
| Unsigned cursor encoding a tenant | Editable; horizontal privilege escalation | HMAC or server-side storage |
| Unbounded `limit` | Self-inflicted DoS | Default 20, maximum 100 |
| `totalCount` on every request | Doubles the cost of every page | Opt-in, or estimate |
| No explicit `ORDER BY` | Order is undefined; pages overlap | Always order explicitly |
| Client-supplied sort column in SQL | Injection | Allowlist mapping |
| Cursor reused across a filter change | Meaningless position | Bind filters to the cursor |

---
</antipatterns>

# Checklist

<checklist>
- [ ] Every collection endpoint paginates
- [ ] Cursor pagination is used unless numbered pages are a stated requirement
- [ ] The sort order is total — a unique tiebreaker is always appended
- [ ] A composite index matches the sort order exactly
- [ ] Cursors are opaque, and documented as opaque
- [ ] Cursors encoding authorization-relevant state are signed
- [ ] `limit` has a default and an enforced maximum
- [ ] `hasMore` is computed with a `limit + 1` fetch
- [ ] `totalCount` is opt-in, or an estimate on large sets
- [ ] `ORDER BY` is always explicit
- [ ] Sortable and filterable fields come from an allowlist
- [ ] Cursor validity across filter changes is defined and documented
</checklist>
