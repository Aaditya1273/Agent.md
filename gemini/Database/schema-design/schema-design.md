---
targetModels:
  - "Gemini 3.6 Flash"
  - "Gemini 3.5 Flash"
  - "Gemini 3.1 Pro"
  - "Gemini 3 Family"
  - "Future Gemini Models"
name: schema-design
category: Database
description: Designing relational schemas that stay correct as requirements move — key choice, normalisation, nullability, enums, and the constraints that keep bad rows out.
license: MIT
author: Agent.md maintainers
last-verified: 2026-08-23
reviewed-by: unreviewed
---
<!-- Generated from models/_canonical by scripts/build-model-variants.js.
     Edit the canonical source, not this file. Structure adapted for Gemini per deep-research.md. -->


# Purpose

Rules for designing tables. The schema is the longest-lived artefact in the
system — application code is rewritten, the data outlives it. Every invalid
state the schema permits will eventually exist in production.

Design principle: **make illegal states unrepresentable at the database level.**
Application validation is a convenience for the user; the constraint is the
guarantee.

---

# Keys

Every table gets a primary key. No exceptions — a table without one cannot be
replicated logically, deduplicated, or safely updated.

| Key type | Use when | Trade-off |
| --- | --- | --- |
| `bigint` identity | Internal-only tables | Compact, ordered; leaks row counts if exposed |
| `uuid` v7 | Rows exposed in URLs or created client-side | Time-ordered, so index locality is preserved |
| `uuid` v4 | Only when ordering must not leak | Random writes fragment the B-tree |
| Natural key | The value is genuinely immutable (ISO country code) | Rare; "immutable" usually is not |

```sql
CREATE TABLE orders (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id    uuid NOT NULL REFERENCES tenants(id),
  status       order_status NOT NULL DEFAULT 'pending',
  total_cents  bigint NOT NULL CHECK (total_cents >= 0),
  currency     char(3) NOT NULL,
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now()
);
```

**Never** use an email address, username, or phone number as a primary key. They
change, and the change cascades through every foreign key in the system.

**Never** use `uuid` v4 as a clustered/primary key on a high-insert table without
measuring — random insertion order fragments the index and inflates write
amplification. `uuid` v7 gives you opacity and locality together.

---

# Types

| Concept | Use | Never |
| --- | --- | --- |
| Money | `bigint` minor units + `currency char(3)` | `float`, `double` |
| Timestamp | `timestamptz` | `timestamp` (no zone), epoch integers |
| Date only | `date` | `timestamptz` truncated in code |
| Enumeration | `CHECK` constraint or native enum | free-text `varchar` |
| Boolean | `boolean NOT NULL` | nullable boolean (three states) |
| Identifier | `uuid` / `bigint` | `varchar` holding a number |
| Text | `text` | `varchar(255)` chosen by habit |

`0.1 + 0.2 != 0.3` in binary floating point. Money in `float` will produce a
reconciliation failure — the only question is when. Store minor units as an
integer, and always store the currency beside the amount; an amount without a
currency is not a price.

`timestamp without time zone` records a wall-clock reading with no way to know
which clock. Use `timestamptz` everywhere and convert at the presentation layer.

---

# Nullability

`NOT NULL` is the default position. Add nullability only when "unknown" or "not
applicable" is a genuine, distinct domain state.

`NULL` is not zero, not empty string, and not false. It propagates: `NULL = NULL`
is `NULL`, and `count(col)` skips it. A nullable column that is never legitimately
null is a permanent source of defensive branching in every query that touches it.

Where a column is only meaningful for some rows, prefer a partial constraint over
a nullable free-for-all:

```sql
-- cancelled_at is null unless status = 'cancelled', and required when it is
ALTER TABLE orders ADD CONSTRAINT cancelled_consistency CHECK (
  (status = 'cancelled') = (cancelled_at IS NOT NULL)
);
```

---

# Normalise first, denormalise on evidence

Reach 3NF by default: every non-key column depends on the key, the whole key, and
nothing but the key. Duplicated data is duplicated truth, and the copies diverge.

Denormalise only with a measured read problem, and only when you can state how
the copy is kept correct — a trigger, a materialised view, or an explicit
recompute job. A denormalised column with no stated maintenance mechanism is a
bug with a delay fuse.

**Never** store a comma-separated list in a column. It cannot be indexed,
joined, or constrained. Use a join table.

```sql
CREATE TABLE order_tags (
  order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  tag_id   uuid NOT NULL REFERENCES tags(id)  ON DELETE CASCADE,
  PRIMARY KEY (order_id, tag_id)
);
```

---

# Constraints belong in the database

| Constraint | Enforces |
| --- | --- |
| `NOT NULL` | Presence |
| `CHECK` | Domain rules (`total_cents >= 0`, valid state transitions) |
| `UNIQUE` | Identity — including partial: `UNIQUE (email) WHERE deleted_at IS NULL` |
| `FOREIGN KEY` | Referential integrity, with an explicit `ON DELETE` |
| `EXCLUDE` | Non-overlap (booking ranges, effective-dated rows) |

Always state `ON DELETE` explicitly — `RESTRICT`, `CASCADE`, or `SET NULL`. The
default varies and silent `RESTRICT` failures surface as opaque 500s.

Application-level checks race. Two concurrent requests both read "no existing
row", both insert, and only a `UNIQUE` constraint stops the duplicate.

---

# Soft deletes and history

If rows must be recoverable, use `deleted_at timestamptz`, and then remember that
**every** query and **every** unique constraint must account for it:

```sql
CREATE UNIQUE INDEX users_email_active
  ON users (lower(email)) WHERE deleted_at IS NULL;
```

Without the partial index, a deleted user permanently blocks their own email from
being reused. This is the single most common soft-delete bug.

For audit history, append to a separate table rather than overwriting.
→ `Security/audit-log`

---

# Anti-patterns

| Anti-pattern | Why it fails | Fix |
| --- | --- | --- |
| Table with no primary key | Cannot replicate, dedupe, or safely update | Always declare one |
| Email/username as primary key | Changes cascade everywhere | Surrogate key |
| Money in `float` | Binary rounding; reconciliation breaks | `bigint` minor units |
| Amount without currency | Meaningless number | Store `currency` beside it |
| `timestamp` without zone | Ambiguous wall clock | `timestamptz` |
| Comma-separated list column | Unindexable, unconstrainable | Join table |
| Nullable by default | Defensive branching forever | `NOT NULL` unless genuinely optional |
| Validation only in app code | Concurrent requests race past it | `CHECK` / `UNIQUE` in the schema |
| Implicit `ON DELETE` | Behaviour differs by engine | State it explicitly |
| Soft delete without partial unique index | Deleted rows block reuse | `WHERE deleted_at IS NULL` |
| EAV (`key`/`value` rows) for core entities | No types, no constraints, no plans | Real columns, or `jsonb` for genuinely open data |

---

# Checklist

- [ ] Verify: Every table declares a primary key
- [ ] Verify: Keys are surrogate and opaque where rows are externally visible
- [ ] Verify: Money stored as integer minor units with an explicit currency column
- [ ] Verify: All timestamps are `timestamptz`
- [ ] Verify: Columns are `NOT NULL` unless "unknown" is a real domain state
- [ ] Verify: Enumerations constrained by `CHECK` or a native enum, never free text
- [ ] Verify: No multi-valued columns; many-to-many uses a join table
- [ ] Verify: Every foreign key declares `ON DELETE` explicitly
- [ ] Verify: Uniqueness enforced by the database, not by an application read-then-write
- [ ] Verify: Soft-deleted tables use partial unique indexes
- [ ] Verify: Denormalised columns have a stated maintenance mechanism
