---
targetModels:
  - "Gemini 3.6 Flash"
  - "Gemini 3.5 Flash"
  - "Gemini 3.1 Pro"
  - "Gemini 3 Family"
  - "Future Gemini Models"
name: jwt
category: Security
description: Issuing and validating JSON Web Tokens safely — algorithm pinning, claim validation, key rotation, and why revocation is the hard part.
license: MIT
author: Agent.md maintainers
last-verified: 2026-08-23
reviewed-by: unreviewed
---
<!-- Generated from models/_canonical by scripts/build-model-variants.js.
     Edit the canonical source, not this file. Structure adapted for Gemini per deep-research.md. -->


# Purpose

Rules for using JWTs without introducing the failure modes the format invites.

**First, decide whether you need one.** A JWT is the right tool when a resource
server must validate a token without calling the issuer. If your API can reach a
session store, an opaque session identifier is simpler, revocable instantly, and
has none of the pitfalls below. Reach for a JWT because you need stateless
verification — not because it is the default.

---

# Algorithm — the classic break

## Pin the algorithm at verification. Never read it from the token.

The `alg` header is attacker-controlled. A verifier that trusts it can be
defeated two ways:

**`alg: none`** — the token declares it is unsigned. A verifier honouring this
accepts a forged payload with an empty signature.

**`RS256` → `HS256` confusion** — the attacker changes the header to `HS256` and
signs with the *public* RSA key as the HMAC secret. A verifier that selects the
algorithm from the header will validate it, because the public key is not secret.

```js
// WRONG — algorithm comes from the token
jwt.verify(token, key);

// RIGHT — algorithm is fixed by the server
jwt.verify(token, publicKey, {
  algorithms: ["RS256"],          // explicit allow-list
  issuer: "https://auth.example.com",
  audience: "https://api.example.com",
});
```

Always pass an explicit `algorithms` allow-list containing exactly the algorithm
you issue. Never include `none`. Never let the list vary with the token.

| Algorithm | Use |
| --- | --- |
| `EdDSA` (Ed25519) | Preferred asymmetric; small, fast, no curve pitfalls |
| `RS256` / `PS256` | Asymmetric, widely supported; `PS256` preferred over `RS256` |
| `ES256` | Asymmetric; verify the library rejects malleable signatures |
| `HS256` | Symmetric — only when issuer and verifier are the same service |
| `none` | Never |

Use `HS256` only where a single service both signs and verifies. The moment a
second party must verify, they need the secret, and then they can also mint
tokens.

---

# Claim validation

Verifying the signature proves integrity. It does not prove the token is *for
you*, *current*, or *from whom you expect*. Validate every claim explicitly.

| Claim | Meaning | Rule |
| --- | --- | --- |
| `exp` | Expiry | Required. Reject if past. Allow ≤ 60 s clock skew. |
| `nbf` | Not before | Reject if in the future |
| `iat` | Issued at | Use to enforce a maximum token age |
| `iss` | Issuer | Must equal your expected issuer exactly |
| `aud` | Audience | Must contain this service. Prevents token reuse across APIs. |
| `sub` | Subject | The user identity; never trust a custom `user_id` instead |
| `jti` | Token ID | Needed for replay detection and revocation lists |

**Never** skip `aud` validation in a multi-service estate. A token minted for the
analytics API is otherwise accepted by the payments API.

```js
// Validate claims explicitly. A verified signature says the token was not
// tampered with — not that it was minted for this service, or is still current.
const { payload } = await jwtVerify(token, keySet, {
  algorithms: ["EdDSA"],
  issuer: "https://auth.example.com",
  audience: "https://api.example.com",
  clockTolerance: 60,               // seconds
  maxTokenAge: "15m",               // bounds `iat`, not just `exp`
});
```

**Never** trust unvalidated custom claims for authorisation — `{"role":"admin"}`
in a token you did not verify the issuer of is just attacker input.

Keep expiry short: **5–15 minutes** for access tokens. Long-lived access tokens
are the reason revocation becomes an unsolvable problem.

---

# Keys

- Store signing keys in a secret manager or KMS, never in the repository, never
  in a client bundle. See `Security/secret-management`.
- HMAC secrets must be **≥ 256 bits of CSPRNG output**. A guessable secret makes
  the signature decorative; `HS256` with a dictionary word is brute-forced offline.
- Publish public keys via **JWKS** (`/.well-known/jwks.json`) and select the key
  by the token's `kid`.
- **Rotate** on a schedule. Publish the new key before signing with it, and keep
  the old key verifiable until every issued token has expired.
- Cache JWKS, but **bound the cache** and re-fetch on unknown `kid`. Never fetch
  a key from a URL inside the token — that is a server-side request forgery and
  key-injection vector in one.

---

# Revocation — the honest part

A JWT is valid until it expires. That is the whole point of stateless
verification, and it is also the problem: **you cannot un-issue one.**

Practical approaches, in increasing cost:

1. **Short expiry + refresh tokens.** Access tokens live minutes; the refresh
   token is opaque, stored server-side, and revocable. This is the standard
   design and the one to reach for first.
2. **Deny-list by `jti`** until natural expiry. Requires a shared store — you have
   reintroduced state, but only for revoked tokens, and entries expire.
3. **Token version per user.** Store `tokenVersion` on the user; include it as a
   claim; reject on mismatch. One row read per request, invalidates every token
   for that user at once. Good for "log out everywhere" and forced password reset.

```js
// Token-version revocation: one indexed read per request, and a single
// increment logs the user out everywhere — on password reset or reported theft.
const user = await db.user.findUnique({
  where: { id: payload.sub },
  select: { tokenVersion: true },
});
if (!user || user.tokenVersion !== payload.ver) {
  throw new Error("token revoked");
}
```

**Never** claim tokens are revoked because the client deleted them. Deleting a
token client-side is a UI gesture, not a security control.

Refresh tokens must be **rotated on use**, and reuse of a consumed refresh token
must revoke the whole family — that is the signal a token was stolen.

---

# Transport and storage

- Send as `Authorization: Bearer <token>` over HTTPS only.
- In browsers, prefer an `HttpOnly; Secure; SameSite` cookie over `localStorage`.
  A token in `localStorage` is readable by any script, so any XSS becomes account
  takeover. If you use cookies, you must handle CSRF — see `Security/csrf`.
- **Never** put a JWT in a URL. It lands in access logs, `Referer` headers and
  browser history.
- The payload is **base64url, not encrypted**. Anyone holding the token can read
  every claim. Put no secrets, PII, or internal identifiers in it. If confidentiality
  is required, use JWE — or better, an opaque token.

---

# Anti-patterns

| Anti-pattern | Why it fails | Fix |
| --- | --- | --- |
| `jwt.verify(token, key)` without `algorithms` | `alg: none` and RS256→HS256 confusion | Explicit allow-list |
| `jwt.decode()` used to authenticate | Decodes without verifying the signature | `jwt.verify()` |
| Skipping `aud` | Token from one service accepted by another | Validate audience |
| 30-day access tokens | Nothing can be revoked in time | 5–15 min + refresh |
| Token in `localStorage` | Any XSS becomes account takeover | `HttpOnly` cookie |
| Secrets or PII in the payload | Base64url is encoding, not encryption | Keep claims minimal |
| Fetching the key from a URL in the token | Attacker chooses the verifying key | JWKS + `kid` allow-list |
| Refresh token reused silently | Theft goes undetected | Rotate on use; revoke family on reuse |

---

# Checklist

- [ ] Verify: An opaque session was considered and stateless verification is genuinely needed
- [ ] Verify: Verification passes an explicit `algorithms` allow-list; `none` never appears
- [ ] Verify: `HS256` used only where signer and verifier are the same service
- [ ] Verify: `exp`, `iss` and `aud` validated on every request; skew ≤ 60 s
- [ ] Verify: `jwt.decode()` is never used as an authentication step
- [ ] Verify: Access tokens expire in 5–15 minutes
- [ ] Verify: Signing keys come from a KMS or secret manager; HMAC secrets ≥ 256 bits
- [ ] Verify: Public keys published via JWKS and selected by `kid`, never by token URL
- [ ] Verify: Key rotation publishes before signing and keeps old keys verifiable
- [ ] Verify: A revocation strategy exists — deny-list, token version, or short expiry
- [ ] Verify: Refresh tokens rotate on use; reuse revokes the family
- [ ] Verify: Tokens never appear in URLs; payload contains no secrets or PII
