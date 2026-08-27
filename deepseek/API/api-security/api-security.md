---
targetModels:
  - "DeepSeek V4"
  - "DeepSeek V3.2"
  - "DeepSeek R1"
  - "DeepSeek V3 Family"
  - "Future DeepSeek Models"
name: api-security
category: API
description: Securing an HTTP API — authentication at the edge, per-object authorization, input validation, transport, and the controls that stop the OWASP API Top 10.
license: MIT
author: Agent.md maintainers
last-verified: 2026-08-23
reviewed-by: unreviewed
---
<!-- Generated from models/_canonical by scripts/build-model-variants.js.
     Edit the canonical source, not this file. Structure adapted for DeepSeek per deep-research.md. -->


# Purpose

Security rules specific to APIs. An API has no HTML, no browser, and often no
human — so browser-centric defences do not apply and the failures are different.

The dominant API vulnerability is not injection. It is **broken object-level
authorization**: an endpoint that authenticates correctly and then returns
somebody else's row. → `Security/authorization`

---

# Authorization is per object, on every request

```ts
// Broken (BOLA) — authenticated, and completely unauthorized
app.get("/v1/orders/:id", auth, async (req, res) => {
  res.json(await db.order.findUnique({ where: { id: req.params.id } }));
});

// Correct — the tenant scope is part of the query, not a check after it
const order = await db.order.findFirst({
  where: { id: req.params.id, tenantId: req.auth.tenantId },
});
if (!order) return res.sendStatus(404);
```

- Scope **inside the query**. A fetch-then-compare is one forgotten `if` away from
  a leak, and it has already loaded the data.
- Return `404`, not `403`, for objects the caller may not see — `403` confirms
  existence.
- Opaque identifiers reduce enumeration but are **not** authorization. Guessing is
  harder; the missing check is still the bug.
- **Property-level too**: a caller allowed to read an order is not necessarily
  allowed to read its `costBasisCents`. Project explicit fields.

**Never** accept an identity field from the request body. `{"userId": …}` or a
`role` in the payload is client-controlled; identity comes from the verified token
only.

---

# Authentication

| Client | Mechanism |
| --- | --- |
| First-party browser app | Session cookie: `HttpOnly; Secure; SameSite` |
| Third-party server | OAuth 2.0 client credentials, or a scoped API key |
| Third-party on behalf of a user | OAuth 2.0 authorization code + PKCE |
| Service to service, internal | mTLS or a short-lived signed token |

For API keys: high entropy, a visible prefix (`ak_live_…`) so leak scanners can
detect them, **stored hashed**, scoped, and revocable independently. Show the
value once.

For bearer tokens: verify `alg`, `iss`, `aud`, `exp` and the signature against a
pinned JWKS. Keep lifetimes short and pair with refresh.
→ `Security/jwt`, `Security/oauth`

**Never** accept credentials in a URL query string. They land in access logs,
proxy logs, browser history and `Referer` headers.

---

# Validate everything at the boundary

```ts
const CreateOrder = z.object({
  items: z.array(z.object({
    sku: z.string().regex(/^[A-Z0-9-]{3,32}$/),
    qty: z.number().int().min(1).max(999),
  })).min(1).max(100),
  note: z.string().max(500).optional(),
}).strict();          // .strict() rejects unknown keys — this is the mass-assignment guard
```

- **Allowlist**, never denylist. Enumerate what is permitted.
- **Reject unknown fields.** Silently ignoring them is how mass assignment
  (`isAdmin: true`) reaches an ORM `update`.
- Bound every array, string and number. An unbounded array is a memory
  exhaustion vector.
- Enforce a **body size limit** (`express.json({ limit: "100kb" })`) and reject
  compressed bodies that expand beyond a ratio.
- Validate `Content-Type` and reject anything unexpected.
- Never pass a client-supplied string into SQL, a shell, a file path, a URL fetch,
  or a template. → `Security/sql-injection`, `Security/command-injection`,
  `Security/path-traversal`

Any endpoint that fetches a client-supplied URL must block private and link-local
address ranges, and re-validate after redirects — SSRF is how cloud metadata
credentials are stolen.

---

# Transport and headers

```
Strict-Transport-Security: max-age=63072000; includeSubDomains; preload
Cache-Control: no-store
X-Content-Type-Options: nosniff
```

- HTTPS only, TLS 1.2+, HTTP redirected or refused.
- `Cache-Control: no-store` on any authenticated response — shared caches
  otherwise serve one user's data to another.
- CORS: an explicit origin allowlist. **Never** reflect the `Origin` header while
  `Access-Control-Allow-Credentials: true` — that is equivalent to allowing every
  origin with cookies. → `Security/cors`, `Security/headers`

---

# Rate limiting and abuse

Every endpoint is limited; authentication endpoints more strictly, keyed on both
account and IP. Return `429` with `Retry-After`. → `API/rate-limiting`

Bound the cost of a single request as well as the rate: maximum page size,
maximum query depth, maximum export range. One request that scans ten million
rows is an outage regardless of the rate limit.

---

# Errors, logging and exposure

- One error shape, stable machine codes, no stack traces, no SQL, no internal
  hostnames, no framework version.
- Log the **event**, not the payload. Never log tokens, passwords, card numbers,
  or full request bodies. Redact by allowlist.
- Log authentication failures, authorization denials, rate-limit breaches and
  privilege changes with actor, target and source IP. → `Security/audit-log`
- Do not ship an interactive API explorer, GraphQL introspection, or a debug
  endpoint to production.
- Inventory your endpoints. Undocumented, forgotten and deprecated-but-live
  endpoints are the ones without current authorization checks.

---

# Anti-patterns

| Anti-pattern | Why it fails | Fix |
| --- | --- | --- |
| Authentication without per-object checks | BOLA — the top API vulnerability | Scope inside the query |
| Fetch then compare ownership | One missed branch leaks data | Filter in the `WHERE` clause |
| `403` for hidden objects | Confirms existence | `404` |
| Identity taken from the request body | Client-controlled | Identity from the verified token only |
| Unknown fields ignored | Mass assignment (`isAdmin`) | `.strict()` schema |
| Denylist validation | Always incomplete | Allowlist |
| Unbounded arrays or body size | Memory exhaustion | Explicit limits |
| API key stored in plaintext | DB leak yields live credentials | Store the hash |
| Credentials in a query string | Logged everywhere | `Authorization` header |
| `Origin` reflected with credentials | Any site reads authenticated responses | Static allowlist |
| No `Cache-Control: no-store` | Shared caches cross-serve user data | Set it on authenticated responses |
| Unvalidated outbound URL fetch | SSRF to cloud metadata | Block private ranges, re-check redirects |
| Stack traces in responses | Leaks internals | Generic message + `requestId` |
| Full request bodies in logs | Credentials and PII in log storage | Allowlist redaction |
| Forgotten legacy endpoints | Unpatched, unchecked, still live | Maintained endpoint inventory |

---

# Checklist

- [ ] Every object fetch is scoped to the caller inside the query
- [ ] Hidden objects return `404`, not `403`
- [ ] Field-level authorization is applied to sensitive properties
- [ ] Identity is never read from the request body
- [ ] Every request body is schema-validated with unknown fields rejected
- [ ] Arrays, strings, numbers and total body size are bounded
- [ ] API keys are prefixed, hashed at rest, scoped and revocable
- [ ] Bearer tokens verify `alg`, `iss`, `aud`, `exp` and signature
- [ ] No credentials appear in URLs
- [ ] TLS is enforced with HSTS; authenticated responses are `no-store`
- [ ] CORS uses a static allowlist, never a reflected origin with credentials
- [ ] Rate limits apply to every endpoint, keyed on account and IP
- [ ] Per-request cost is bounded, not just request rate
- [ ] Outbound fetches of client-supplied URLs are SSRF-guarded
- [ ] Error bodies expose no internal detail; every response carries a `requestId`
- [ ] Security-relevant events are logged; payloads are redacted by allowlist
- [ ] Introspection, explorers and debug endpoints are disabled in production
- [ ] An endpoint inventory exists and is reviewed
