---
targetModels:
  - "DeepSeek V4"
  - "DeepSeek V3.2"
  - "DeepSeek R1"
  - "DeepSeek V3 Family"
  - "Future DeepSeek Models"
name: mongodb
category: Database
description: MongoDB document modelling and operational rules — embed versus reference, indexes, write concern, transactions, and the failure modes of a schemaless store.
license: MIT
author: Agent.md maintainers
last-verified: 2026-08-23
reviewed-by: unreviewed
---
<!-- Generated from models/_canonical by scripts/build-model-variants.js.
     Edit the canonical source, not this file. Structure adapted for DeepSeek per deep-research.md. -->


# Purpose

Rules for MongoDB. "Schemaless" means the schema lives in application code
instead of the database — it does not mean there isn't one. Every rule here
exists because the database will not stop you.

Choose MongoDB for genuinely document-shaped data with varying structure. If the
data is relational and you are joining it with `$lookup` on every read, you chose
wrong. → `Database/schema-design`

---

# Embed or reference

The single most consequential modelling decision.

| Embed when | Reference when |
| --- | --- |
| Read together, always | Read independently |
| The child has no life of its own | The child is queried on its own |
| Bounded cardinality (tens, not thousands) | Unbounded growth |
| Updated together | Updated at different rates |

```js
// Embed — an order's line items are never read without the order
{ _id, customerId, items: [{ sku, qty, priceCents }], totalCents }

// Reference — a customer's orders are unbounded and queried alone
{ _id, orderId, customerId, ... }
```

**Never** embed an unbounded array. A document has a **16 MB hard limit**, and a
growing array forces document relocation and rewrites the whole document on every
push. An array that grows with user activity — comments, events, log lines —
belongs in its own collection.

Where you need the last N of an unbounded set, use the **subset pattern**: embed
the most recent few for fast reads and keep the full set in a separate
collection.

---

# Indexes

```js
db.orders.createIndex({ tenantId: 1, createdAt: -1 });
db.orders.find({ tenantId: t }).sort({ createdAt: -1 }).explain("executionStats");
```

Read `executionStats` and check:

| Field | Want |
| --- | --- |
| `stage` | `IXSCAN`, not `COLLSCAN` |
| `totalKeysExamined` vs `nReturned` | Close to 1:1 |
| `totalDocsExamined` | Zero for a covered query |
| `hasSortStage` | Absent — an in-memory sort fails above 32 MB |

The ESR rule orders compound index keys: **Equality**, then **Sort**, then
**Range**. A compound index serves any prefix of its keys, so `{a:1, b:1, c:1}`
also serves queries on `{a}` and `{a,b}` — do not create those separately.

**Never** leave an in-memory sort in a hot query. Above 32 MB it errors outright
rather than degrading. → `Database/indexes`

---

# Write concern and durability

The defaults are not what most teams assume.

```js
// Acknowledged by a majority, and durable on disk
await coll.insertOne(doc, { writeConcern: { w: "majority", j: true } });
```

| Concern | Meaning |
| --- | --- |
| `w: 1` | Primary acknowledged only — lost on failover |
| `w: "majority"` | Committed to a majority; survives an election |
| `j: true` | Written to the journal, survives a crash |
| `readConcern: "majority"` | Never reads data that could be rolled back |

**Never** use `w: 1` for data whose loss matters. An election after a `w: 1`
write can roll it back with no error ever reaching the client.

For read-after-write in the same session, use a **causally consistent session**
rather than reading from the primary by convention:

```js
const session = client.startSession({ causalConsistency: true });
```

---

# Transactions

Multi-document transactions exist (replica sets and sharded clusters) but are far
more expensive than in a relational engine, and they have a default 60-second
limit.

Prefer a document model where the atomic unit **is** one document — that is the
point of embedding. Reach for a transaction only when a genuine invariant spans
collections. → `Database/transactions`

---

# Schema validation

The database will happily store `{ price: "twelve" }`. Add validation:

```js
db.createCollection("orders", {
  validator: { $jsonSchema: {
    bsonType: "object",
    required: ["tenantId", "totalCents", "createdAt"],
    properties: {
      totalCents: { bsonType: "long", minimum: 0 },
      createdAt:  { bsonType: "date" },
    },
  }},
  validationLevel: "strict",
  validationAction: "error",
});
```

Store money as integer minor units (`long`), never `double`. Store dates as BSON
`date`, never as a string — string dates sort lexicographically and cannot use
date operators.

---

# Anti-patterns

| Anti-pattern | Why it fails | Fix |
| --- | --- | --- |
| Unbounded embedded array | 16 MB document cap; full rewrite per push | Separate collection, or subset pattern |
| Using MongoDB for relational data | `$lookup` on every read | Use a relational database |
| No schema validation | Type drift reaches production silently | `$jsonSchema` validator |
| `w: 1` for important writes | Silently rolled back on failover | `w: "majority", j: true` |
| Dates as strings | Lexicographic sort; no date operators | BSON `date` |
| Money as `double` | Binary rounding error | `long` minor units |
| Index per query | Write amplification; RAM pressure | Compound indexes by ESR |
| Duplicate index and its prefix | Redundant maintenance cost | Prefix is served by the compound index |
| In-memory sort in a hot path | Hard 32 MB failure | Index covering the sort |
| Transactions used as the default | Far costlier than relational | Model so one document is atomic |
| `$where` / unindexed `$regex` | Full collection scan | Anchored regex on an indexed field |

---

# Checklist

- [ ] Embed/reference decided per relationship, with cardinality stated
- [ ] No embedded array grows without bound
- [ ] Every hot query verified with `explain("executionStats")` showing `IXSCAN`
- [ ] Compound indexes follow Equality → Sort → Range
- [ ] No redundant indexes that duplicate a compound prefix
- [ ] No in-memory sorts on hot paths
- [ ] Important writes use `w: "majority", j: true`
- [ ] Read-after-write uses a causally consistent session
- [ ] `$jsonSchema` validation is enabled with `validationAction: "error"`
- [ ] Money stored as integer minor units; dates stored as BSON dates
- [ ] Transactions used only for invariants that genuinely span documents
