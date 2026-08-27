---
targetModels:
  - "DeepSeek V4"
  - "DeepSeek V3.2"
  - "DeepSeek R1"
  - "DeepSeek V3 Family"
  - "Future DeepSeek Models"
name: authentication
category: Backend
description: Wiring authentication into a backend service — session versus token, the verification middleware, refresh and rotation, and multi-tenant identity.
license: MIT
author: Agent.md maintainers
last-verified: 2026-08-23
reviewed-by: unreviewed
---
<!-- Generated from models/_canonical by scripts/build-model-variants.js.
     Edit the canonical source, not this file. Structure adapted for DeepSeek per deep-research.md. -->


# Purpose

Rules for implementing authentication in a backend service: choosing a mechanism,
verifying credentials on each request, and managing session lifetime.

Credential storage, password policy and MFA are `Security/authentication`. Token
format specifics are `Security/jwt`. This package is the server-side plumbing.

---

# Choose the mechanism from the client

| Client | Mechanism | Why |
| --- | --- | --- |
| First-party browser app | Opaque session id in an `HttpOnly` cookie | Revocable instantly; invisible to JavaScript |
| First-party mobile app | Refresh token in the OS keystore + short access token | No cookie jar; needs explicit rotation |
| Third-party integration | OAuth 2.0, or a scoped API key | Revocable per integration, auditable |
| Service to service | mTLS, or a short-lived signed token | No long-lived shared secret |

**Default to server-side sessions.** They can be revoked in one `DELETE`, they
carry no claims that go stale, and they are a cookie the browser handles for you.

Reach for JWTs only when statelessness is a genuine requirement — and then accept
that a JWT cannot be revoked before it expires, which is why access tokens must be
short-lived (5–15 minutes) and paired with a revocable refresh token.

```
Set-Cookie: sid=<128-bit random>; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=1209600
```

**Never** put a session or access token in `localStorage`. Any XSS then becomes
full account takeover. → `Security/xss`

---

# The verification middleware

Authentication runs once, early, for every request, and establishes exactly one
thing: **who is calling.**

```ts
app.use(async (req, res, next) => {
  const sid = req.cookies.sid;
  if (!sid) return next();                       // anonymous; authorization decides
  const session = await sessions.get(sid);       // single lookup, cached briefly
  if (!session || session.expiresAt < Date.now()) return next();

  req.auth = { userId: session.userId, tenantId: session.tenantId,
               scopes: session.scopes, sessionId: sid };
  next();
});
```

- It establishes identity; it does **not** decide access. That is
  `Security/authorization`.
- Register it **before** any route. → `Backend/middlewares`
- Default-deny: apply `requireAuth` globally and mark public routes explicitly,
  so a new route is protected by default.
- Never read identity from the request body or a client-supplied header such as
  `X-User-Id`. Only the verified credential establishes it.
- Put `userId`, `tenantId` and `sessionId` into async context so logging and
  authorization reach them without threading parameters.

For bearer tokens, verify the signature against a **cached** JWKS with a refresh
interval — a network fetch per request is a hard dependency on the identity
provider for every single call.

---

# Sessions and refresh

- **Rotate the identifier** on login, on logout, and on any privilege change.
  Reusing the pre-login id is session fixation.
- Enforce **both** an idle timeout and an absolute lifetime. Idle alone lets a
  stolen token live indefinitely under automated use.
- **Logout deletes server-side state.** Clearing the cookie is not logout; a
  captured token remains valid until natural expiry.
- **Rotate refresh tokens on use**, and store them hashed. Detect reuse of an
  already-consumed refresh token: that means it was stolen, so revoke the entire
  token family and force re-authentication.
- Invalidate every session on password change, except optionally the one making
  the change.
- Keep a **session list per user** with device, IP and last-seen, and let users
  revoke individual sessions. This is both a security control and the feature
  users ask for.

---

# Multi-tenant identity

The tenant is part of the identity, resolved server-side, and never taken from the
request.

```ts
// Every query is scoped by the session's tenant, not by a parameter
const order = await db.order.findFirst({
  where: { id: req.params.id, tenantId: req.auth.tenantId },
});
```

**Never** accept `tenantId` from a header, body or query parameter. A
client-supplied tenant is horizontal privilege escalation in one line.

When a user belongs to several tenants, the active tenant is part of the session,
changed by an explicit endpoint that rotates the session id.

Impersonation ("log in as customer") must record the real actor alongside the
impersonated one, be time-limited, and be audit-logged on every request.
→ `Security/audit-log`

---

# Failure behaviour

- `401` for missing or invalid credentials; `403` for authenticated but not
  permitted. Returning `403` to an anonymous caller confirms the resource exists.
- **Identical responses** for unknown user and wrong password, in body, status and
  timing. Any difference is a user-enumeration oracle.
- Rate limit login attempts on **both** account and IP. Per-IP alone does not stop
  distributed credential stuffing; per-account alone lets one host spray many
  accounts. → `API/rate-limiting`
- Never lock an account permanently on failed attempts — that is a
  denial-of-service primitive against your own users. Use temporary backoff.
- Log every authentication failure, success, logout and privilege change with
  actor, source IP and user agent.

---

# Anti-patterns

| Anti-pattern | Why it fails | Fix |
| --- | --- | --- |
| Token in `localStorage` | XSS becomes account takeover | `HttpOnly` cookie |
| JWT chosen by default | Cannot be revoked before expiry | Server-side sessions |
| Long-lived access tokens | A stolen token stays valid for hours | 5–15 minutes plus refresh |
| Identity from a request header | Client-controlled | Verified credential only |
| `tenantId` from the request | Horizontal privilege escalation | Tenant from the session |
| Per-route opt-in auth | One forgotten line is an open endpoint | Default-deny globally |
| Session id reused after login | Session fixation | Rotate on privilege change |
| Idle timeout only | Stolen token lives forever under use | Absolute lifetime too |
| Logout clears only the cookie | Captured token still valid | Delete server-side state |
| Refresh tokens not rotated | A stolen refresh token is permanent | Rotate on use; detect reuse |
| Refresh tokens stored plaintext | DB leak yields live sessions | Store hashed |
| Distinct errors for unknown user | Enumeration oracle | One identical failure response |
| JWKS fetched per request | Hard dependency on the IdP for every call | Cache with refresh |
| Permanent lockout | Self-inflicted DoS | Temporary backoff |
| No session inventory | Users cannot revoke a stolen session | Per-user session list |

---

# Checklist

- [ ] The mechanism is chosen per client type and written down
- [ ] Browser sessions use `HttpOnly; Secure; SameSite` cookies
- [ ] No token is stored in `localStorage` or `sessionStorage`
- [ ] Access tokens, where used, are short-lived and paired with refresh tokens
- [ ] Authentication middleware runs before all routes and only establishes identity
- [ ] Routes are default-deny with explicitly marked public exceptions
- [ ] Identity and tenant are never read from client-supplied fields
- [ ] Identity is carried in async context, not threaded parameters
- [ ] JWKS or key material is cached with a refresh interval
- [ ] Session identifiers rotate on login, logout and privilege change
- [ ] Both idle and absolute expiry are enforced
- [ ] Logout deletes server-side session state
- [ ] Refresh tokens rotate on use, are stored hashed, and reuse triggers revocation
- [ ] All sessions are invalidated on password change
- [ ] Users can list and revoke their own sessions
- [ ] Impersonation records the real actor and is time-limited and audited
- [ ] `401` and `403` are used correctly; failures are indistinguishable
- [ ] Login is rate limited on both account and IP, with temporary backoff
