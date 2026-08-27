---
targetModels:
  - "DeepSeek V4"
  - "DeepSeek V3.2"
  - "DeepSeek R1"
  - "DeepSeek V3 Family"
  - "Future DeepSeek Models"
name: validation
category: Backend
description: Validating input at the trust boundary — schema-first parsing, allowlists, mass-assignment prevention, and separating shape from business rules.
license: MIT
author: Agent.md maintainers
last-verified: 2026-08-23
reviewed-by: unreviewed
---
<!-- Generated from models/_canonical by scripts/build-model-variants.js.
     Edit the canonical source, not this file. Structure adapted for DeepSeek per deep-research.md. -->


# Purpose

Rules for validating input on the server. The principle is one line: **anything
that crosses a trust boundary is parsed into a known type before any code acts on
it.**

Client-side validation is a user-experience feature. It provides no security —
the client is under the attacker's control. Every rule here is server-side.

---

# Parse, do not validate

Validation that returns a boolean leaves you holding the same untyped value.
Parsing returns a **new, typed value** that cannot be wrong further down.

```ts
const CreateOrder = z.object({
  customerId: z.string().uuid(),
  items: z.array(z.object({
    sku: z.string().regex(/^[A-Z0-9-]{3,32}$/),
    qty: z.number().int().min(1).max(999),
  })).min(1).max(100),
  note: z.string().max(500).optional(),
  currency: z.enum(["EUR", "USD", "GBP"]),
}).strict();                                   // reject unknown keys

app.post("/v1/orders", (req, res) => {
  const parsed = CreateOrder.safeParse(req.body);
  if (!parsed.success) return res.status(422).json(toFieldErrors(parsed.error));
  return createOrder(parsed.data);             // typed from here down
});
```

After this line, `parsed.data.qty` is a bounded integer by construction. No
downstream function needs to re-check it, and the type system enforces that.

Tooling: `zod`/`valibot`/`typebox` (TypeScript), `pydantic` (Python),
`go-playground/validator` (Go), Bean Validation (Java), `dry-schema` (Ruby). Where
you already publish an OpenAPI document, generate the validator from it so the
spec and the check cannot disagree. → `API/open-api`

---

# `.strict()` is the mass-assignment fix

```ts
// Without .strict(): { "email": "…", "role": "admin", "credits": 999999 }
await db.user.update({ where: { id }, data: req.body });   // ← privilege escalation
```

Unknown fields must be **rejected**, not ignored, and an object must never be
spread straight into an ORM write. Build the update from explicitly named fields:

```ts
const { email, displayName } = parsed.data;
await db.user.update({ where: { id }, data: { email, displayName } });
```

This is the same defect as `params.permit` misuse in Rails and
`@ModelAttribute` binding in Spring. It is consistently in the OWASP top ten and
it is one line to prevent.

---

# Allowlist everything, and bound everything

| Input | Rule |
| --- | --- |
| Strings | `maxLength` on every one. A `text` field with no cap is a memory vector |
| Arrays | `min` and `max` length |
| Numbers | Explicit range, and integer-vs-float stated |
| Enumerations | A closed set, never free text |
| Identifiers | Format-checked (`uuid`, prefixed opaque id) |
| Dates | RFC 3339, plus a sane range — reject year 9999 |
| Body size | Framework-level limit (`express.json({ limit: "100kb" })`) |
| Content type | Validated and rejected when unexpected |
| Uploads | Type by magic bytes, not by extension or `Content-Type`; size capped |

**Never** write a denylist. `if (input.includes("<script>"))` is bypassed by
`<ScRiPt>`, `<img onerror>`, and a hundred other encodings. Enumerate what is
allowed.

Sanitising by stripping characters is worse than rejecting: it produces a value
that passed no check and matches nothing you specified. Reject, and say why.

Compressed request bodies need a decompressed-size cap as well — a 1 KB gzip
payload can expand to gigabytes.

---

# Shape, then business rules

Two distinct layers, and they belong in different places:

| Layer | Checks | Where | Response |
| --- | --- | --- | --- |
| Shape | Types, ranges, formats, required fields | Edge, before business logic | `422` with field errors |
| Business rules | Uniqueness, balance, state transitions, permissions | Domain service, inside the transaction | `409`/`422` with a domain code |

A uniqueness check is **not** shape validation. Checking "is this email taken?"
before inserting is a race — two concurrent requests both see "free". The database
constraint is the guarantee; the pre-check is only a nicer error message.
→ `Database/schema-design`

---

# Validation is not encoding

Validated input is still untrusted **in a different context**. A name that is
perfectly valid input is still dangerous when concatenated into SQL, a shell
command, a file path, or HTML.

- Parameterise SQL. → `Security/sql-injection`
- Never build shell commands from input. → `Security/command-injection`
- Resolve and confine file paths. → `Security/path-traversal`
- Escape on output, per context. → `Security/xss`
- Block private address ranges when fetching a supplied URL (SSRF).

Validation reduces the surface. Context-correct encoding is what actually
prevents injection.

---

# Error responses

```json
{ "code": "validation_failed", "message": "Validation failed", "requestId": "req_01J8Z",
  "errors": [
    { "field": "items.0.qty", "code": "out_of_range", "message": "Must be between 1 and 999." },
    { "field": "currency",    "code": "invalid_enum", "message": "Must be one of EUR, USD, GBP." }
  ] }
```

- Return **all** failures at once, not the first. Otherwise the client fixes one
  field per round trip.
- Use a path (`items.0.qty`) that identifies the exact field.
- Stable machine `code` per error; the human message may change freely.
- Never echo the rejected value back if it might be a credential.
  → `Backend/error-handling`

---

# Anti-patterns

| Anti-pattern | Why it fails | Fix |
| --- | --- | --- |
| Relying on client-side validation | The client is attacker-controlled | Always validate server-side |
| Boolean validation, untyped value | Every downstream layer re-checks | Parse into a typed value |
| Ignoring unknown fields | Mass assignment (`role: "admin"`) | `.strict()` and reject |
| Spreading the body into an ORM write | Any column becomes settable | Name the fields explicitly |
| Denylist filtering | Bypassed by encoding variants | Allowlist |
| Sanitising by stripping | Produces an unspecified value | Reject with a reason |
| Unbounded strings and arrays | Memory exhaustion | `maxLength` / `max` everywhere |
| No body size limit | Trivial DoS | Framework-level cap |
| No decompressed-size cap | Zip-bomb expansion | Ratio and absolute limits |
| Upload type from extension | Trivially spoofed | Magic-byte detection |
| Uniqueness checked before insert only | Races under concurrency | Database constraint |
| Business rules at the edge | Duplicated and drifts from the domain | Enforce in the service |
| Validation treated as injection prevention | Wrong layer | Encode per output context |
| First-error-only responses | One round trip per field | Return all errors |
| Rejected values echoed back | May log credentials | Redact |

---

# Checklist

- [ ] Every request body, query and path parameter is parsed against a schema
- [ ] Parsing produces a typed value used downstream
- [ ] Unknown fields are rejected, not ignored
- [ ] No request object is spread into a database write
- [ ] Every string, array and number has explicit bounds
- [ ] Enumerations are closed sets
- [ ] Body size, decompressed size and upload size are capped
- [ ] Upload types are detected from content, not from the filename
- [ ] Allowlists are used throughout; no denylist filtering
- [ ] Shape validation is at the edge; business rules are in the domain layer
- [ ] Uniqueness and invariants are enforced by database constraints
- [ ] Output encoding is applied per context, independently of validation
- [ ] Client-supplied URLs are SSRF-guarded before any fetch
- [ ] Validation errors list every failure with a field path and a stable code
- [ ] Rejected values are not echoed when they may be sensitive
