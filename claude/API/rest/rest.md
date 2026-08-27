---
targetModels:
  - "Claude Fable 5"
  - "Claude Opus 5"
  - "Claude Sonnet 5"
  - "Claude 5 Family"
  - "Future Claude Models"
name: rest
category: API
description: Designing HTTP APIs that clients can rely on — resource modelling, correct status codes, idempotency, and the conventions that prevent breaking changes.
license: MIT
author: Agent.md maintainers
last-verified: 2026-08-23
reviewed-by: unreviewed
---
<!-- Generated from models/_canonical by scripts/build-model-variants.js.
     Edit the canonical source, not this file. Structure adapted for Claude per deep-research.md. -->
# Purpose

<purpose>
Rules for designing an HTTP/REST API. The API is a contract: once a client
depends on it, its shape is fixed until you version it. Design accordingly.

Scope here is resource design, methods, status codes and error shape. Versioning
is `API/versioning`, pagination is `API/pagination`, authentication is
`Security/authentication`.

---
</purpose>

# Resources and URLs

<rules>
```
GET    /v1/orders                 list
POST   /v1/orders                 create
GET    /v1/orders/{id}            fetch
PATCH  /v1/orders/{id}            partial update
DELETE /v1/orders/{id}            delete
POST   /v1/orders/{id}/refunds    action modelled as a subresource
```

| Rule | Example |
| --- | --- |
| Plural nouns, never verbs | `/orders`, not `/getOrders` |
| Lowercase, hyphenated | `/payment-methods`, not `/paymentMethods` |
| Nest at most one level | `/orders/{id}/items`, not `/users/{u}/orders/{o}/items/{i}` |
| Actions become subresources | `POST /orders/{id}/cancel` |
| Identifiers are opaque | `ord_8fd2c1` — never a sequential integer |

Sequential integer identifiers leak business volume and enable enumeration. Use a
UUID or a prefixed opaque identifier. → `Security/authorization`

Deep nesting forces clients to know a hierarchy that will change. One level of
nesting expresses ownership; more expresses your database schema, which is not
the client's problem.

---
</rules>

# Methods and their guarantees

<rules>
| Method | Safe | Idempotent | Body | Notes |
| --- | --- | --- | --- | --- |
| `GET` | Yes | Yes | No | Never mutates. Cacheable |
| `POST` | No | No | Yes | Creation, and non-idempotent actions |
| `PUT` | No | Yes | Yes | Full replacement |
| `PATCH` | No | No | Yes | Partial update |
| `DELETE` | No | Yes | No | Second call returns `404` or `204` — decide and document |

**Never** mutate state in a `GET`. Proxies, prefetchers, browsers and link
scanners issue `GET` freely; a `GET /orders/{id}/delete` will fire on its own.

**Idempotency for `POST`.** Any endpoint that moves money or creates something
expensive takes an `Idempotency-Key` header:

```
POST /v1/payments
Idempotency-Key: 9f3c2e10-4a1b-4d5c-8a71-2b0c9d8e7f61
```

Store the key with the response for at least 24 hours. A repeat with the same key
returns the original response without re-executing. Without this, a client
timeout followed by a retry charges the customer twice.

---
</rules>

# Status codes

<rules>
| Code | Meaning |
| --- | --- |
| `200` | Success with a body |
| `201` | Created — include a `Location` header |
| `202` | Accepted for async processing — return a status URL |
| `204` | Success, no body |
| `400` | Malformed request — syntax or schema |
| `401` | Not authenticated (missing or invalid credentials) |
| `403` | Authenticated but not permitted |
| `404` | Not found — **or** hidden from this caller by design |
| `409` | Conflict — state or version mismatch |
| `422` | Well-formed but semantically invalid |
| `429` | Rate limited — always with `Retry-After` |
| `500` | Server fault. Never a client's fault |
| `503` | Temporarily unavailable — with `Retry-After` |

`401` versus `403` is a common error: `401` means "I do not know who you are",
`403` means "I know, and no". Returning `403` for an unauthenticated request tells
an attacker the resource exists.

**Never** return `200` with `{"error": …}` in the body. Every client's error
handling keys on the status code, and a `200` error is invisible to retries,
alerting, and logs.

---
</rules>

# Error shape

<rules>
One shape, everywhere. RFC 9457 (`application/problem+json`) is the standard;
anything consistent works, as long as it is genuinely consistent.

```json
{
  "type": "https://api.example.com/errors/insufficient-funds",
  "title": "Insufficient funds",
  "status": 422,
  "detail": "Account balance 1250 is below the requested 5000.",
  "instance": "/v1/payments/pay_8fd2",
  "requestId": "req_01J8Z…",
  "errors": [
    { "field": "amountCents", "code": "exceeds_balance" }
  ]
}
```

- A **machine-readable code** per error, stable across releases. Clients branch on
  the code, never on the message text.
- A **`requestId`** in every response — success and failure. It is what turns a
  support ticket into a log search.
- **Never** leak stack traces, SQL, internal hostnames or library versions in an
  error body. → `Security/headers`

---
</rules>

# Requests and responses

<rules>
- **`Content-Type: application/json`** on both, and validate it. Reject unknown
  fields rather than silently ignoring them — a client typo should fail loudly.
- **Validate at the boundary**, against a schema (`zod`, `pydantic`, JSON Schema),
  before any business logic sees the value.
- Field naming: pick `camelCase` or `snake_case` and hold it across the entire
  surface. Mixed conventions are a permanent tax on every client.
- Timestamps are RFC 3339 UTC strings: `2026-08-23T14:32:59Z`. Never epoch
  integers, never local time, never a format that varies by endpoint.
- Money is an integer of minor units plus an ISO 4217 currency code. Never a
  float, never a formatted string.
- Enumerations are strings, not integers. `"status": "pending"` survives being
  read by a human at 3am; `"status": 2` does not.

**Never** return a bare array as a top-level response body. `{"data": [...]}`
leaves room to add pagination metadata without a breaking change.

---
</rules>

# Compatibility

<rules>
Additive changes are safe. These are not, and require a new version:

- Removing or renaming a field
- Changing a field's type or nullability
- Adding a required request field
- Changing the meaning of an existing value
- Tightening validation on an existing field

Clients must ignore unknown response fields — document that expectation
explicitly, because if they do not, every addition becomes breaking.
→ `API/versioning`

---
</rules>

# Anti-patterns

<antipatterns>
| Anti-pattern | Why it fails | Fix |
| --- | --- | --- |
| Verbs in URLs (`/getUser`) | Duplicates what the method expresses | Nouns plus HTTP methods |
| Mutating state in `GET` | Prefetchers and crawlers fire it | `POST`/`PATCH`/`DELETE` |
| `200` with an error body | Invisible to clients, retries and alerts | Correct status code |
| `403` for unauthenticated | Confirms the resource exists | `401` |
| Sequential integer IDs | Leaks volume; enables enumeration | Opaque identifiers |
| Free-form error strings | Clients parse messages; messages change | Stable machine codes |
| Top-level array response | No room for metadata | Wrap in an object |
| Mixed naming conventions | Permanent client-side tax | One convention everywhere |
| Money as float or string | Rounding; ambiguity | Integer minor units + currency |
| Epoch or local timestamps | Ambiguous, needs client knowledge | RFC 3339 UTC |
| No `Idempotency-Key` on payments | Retry after timeout double-charges | Key stored with the response |
| No `requestId` | Support tickets are unresolvable | Echo one on every response |
| Silently ignoring unknown fields | Client typos fail silently | Reject with `400` |

---
</antipatterns>

# Checklist

<checklist>
- [ ] Resources are plural nouns; actions are subresources
- [ ] Nesting is at most one level deep
- [ ] Identifiers are opaque, not sequential integers
- [ ] `GET` is side-effect free everywhere
- [ ] Expensive or money-moving `POST`s accept `Idempotency-Key`
- [ ] Status codes are correct, including `401` vs `403` and `422` vs `400`
- [ ] `429` and `503` always carry `Retry-After`
- [ ] Errors use one shape with stable machine-readable codes
- [ ] Every response carries a `requestId`
- [ ] No stack traces, SQL or internal detail in error bodies
- [ ] Requests are schema-validated at the boundary; unknown fields rejected
- [ ] Timestamps are RFC 3339 UTC; money is integer minor units plus currency
- [ ] Collections are wrapped in an object, not returned as bare arrays
- [ ] Breaking changes are enumerated and gated behind a version
</checklist>
