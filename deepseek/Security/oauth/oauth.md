---
targetModels:
  - "DeepSeek V4"
  - "DeepSeek V3.2"
  - "DeepSeek R1"
  - "DeepSeek V3 Family"
  - "Future DeepSeek Models"
name: oauth
category: Security
description: Implementing OAuth 2.1 and OIDC correctly — authorization code with PKCE, redirect URI exactness, state, and the flows that are now forbidden.
license: MIT
author: Agent.md maintainers
last-verified: 2026-08-23
reviewed-by: unreviewed
---
<!-- Generated from models/_canonical by scripts/build-model-variants.js.
     Edit the canonical source, not this file. Structure adapted for DeepSeek per deep-research.md. -->


# Purpose

Rules for OAuth 2.0/2.1 and OpenID Connect as a client and as a provider.

The distinction that prevents most mistakes: **OAuth is authorisation
(delegated access). OIDC is authentication (who the user is).** An access token
says a client may call an API. It does not say who is logged in. If you need
identity, use OIDC and validate the **ID token**.

---

# Use authorization code with PKCE. Nothing else.

```
GET /authorize
  ?response_type=code
  &client_id=abc123
  &redirect_uri=https://app.example.com/callback
  &scope=openid%20profile%20email
  &state=<csprng>
  &nonce=<csprng>
  &code_challenge=<BASE64URL(SHA256(verifier))>
  &code_challenge_method=S256
```

PKCE is **required for every client type** in OAuth 2.1, including confidential
server-side clients. It binds the authorization code to the client that started
the flow, so an intercepted code cannot be redeemed by anyone else.

```js
const verifier = crypto.randomBytes(32).toString("base64url");
const challenge = crypto.createHash("sha256").update(verifier).digest("base64url");
// Store `verifier` server-side against the session; send only `challenge`.
```

**Never** use `code_challenge_method=plain`. Always `S256`.

## Flows that are removed or forbidden

| Flow | Status |
| --- | --- |
| **Implicit** (`response_type=token`) | **Removed in 2.1.** Token in the URL fragment leaks via history, `Referer` and logs |
| **Resource Owner Password Credentials** | **Removed in 2.1.** The client handles the password; defeats MFA and federation |
| Authorization code **without** PKCE | Forbidden — code interception |
| Client credentials | Valid, but machine-to-machine only. Never for a user session |

---

# Redirect URI

The redirect URI is the most attacked parameter in OAuth.

- Register the **exact, full URI**. Compare by **exact string match**.
- **Never** allow wildcards, prefix matching, or open subpaths.
  `https://app.example.com/cb` must not match
  `https://app.example.com/cb/../../evil` or
  `https://app.example.com.evil.tld/cb`.
- **Never** reflect a redirect target from a query parameter after the callback —
  that reintroduces an open redirect and leaks the code.
- Require HTTPS. `http://localhost` may be permitted for development only, with
  the port ignored per the native-app guidance.

---

# `state` and `nonce`

Both are required and they do different jobs.

| Parameter | Purpose | Validated |
| --- | --- | --- |
| `state` | CSRF protection for the callback | Compare to the value stored in the session |
| `nonce` | Replay protection for the ID token | Compare to the `nonce` claim in the ID token |

Generate both with a CSPRNG, bind them to the session, and make them **single-use**.

**Never** skip `state` because "the code is single-use". Without it, an attacker
completes a flow with their own code in the victim's browser and links the
victim's session to the attacker's account.

---

# Validating tokens

An **ID token** is a JWT and must be validated as one — see `Security/jwt`:

- Signature against the provider's JWKS, with an explicit `algorithms` allow-list
- `iss` exactly equals the provider's issuer
- `aud` contains your `client_id`
- `exp` not passed, `iat` reasonable
- `nonce` matches the value you sent
- `azp` equals your `client_id` when present

An **access token** is opaque to the client. **Never** parse it, and never make
authorisation decisions from its contents in the client. On the resource server,
validate it by introspection or as a JWT with full claim validation, and check the
`scope` and `aud` are for **your** API.

**Never** use the `/userinfo` response as proof of authentication on its own — it
is fetched with an access token that may have been issued to a different client.
That is the confused-deputy problem OIDC's ID token exists to solve.

---

```js
// Redeem the code. The verifier proves this is the client that began the flow;
// without PKCE an intercepted `code` would be enough on its own.
const res = await fetch(`${ISSUER}/token`, {
  method: "POST",
  headers: { "Content-Type": "application/x-www-form-urlencoded" },
  body: new URLSearchParams({
    grant_type: "authorization_code",
    code,
    redirect_uri: REDIRECT_URI,          // must match the authorize request exactly
    client_id: CLIENT_ID,
    code_verifier: session.pkceVerifier,
  }),
});

const { id_token, access_token } = await res.json();
const claims = await verifyIdToken(id_token, { nonce: session.nonce });
```

# Tokens, scopes and storage

- Request the **narrowest scopes** that work, and request them incrementally as
  features need them.
- Access tokens short-lived (**5–15 minutes**); refresh tokens rotated on use,
  with reuse of a consumed refresh token revoking the whole family.
- In a browser, keep tokens in an `HttpOnly; Secure; SameSite` cookie via a
  backend-for-frontend, not in `localStorage` → `Security/xss`.
- Store the client secret server-side only. A "confidential" client in a SPA or
  mobile app is a public client — the secret ships to every user.
- Support **revocation** (`/revoke`) and honour it on logout. Clearing the client's
  copy is not revocation.

---

# Anti-patterns

| Anti-pattern | Why it fails | Fix |
| --- | --- | --- |
| Implicit flow | Token in the URL fragment; removed in 2.1 | Code + PKCE |
| Password grant | Client sees the password; defeats MFA | Code + PKCE |
| Code flow without PKCE | Intercepted code is redeemable | Always `S256` |
| Wildcard or prefix redirect matching | Code sent to an attacker origin | Exact string match |
| Omitting `state` | Session fixation via the callback | CSPRNG, session-bound, single-use |
| Treating an access token as identity | It authorises; it does not authenticate | Validate the ID token |
| Parsing an access token in the client | Opaque by contract; format may change | Use the ID token or `/userinfo` |
| `/userinfo` alone as login proof | Confused deputy across clients | Validate the ID token's `aud` |
| Client secret in a SPA or mobile app | Shipped to every user | Public client + PKCE |
| Tokens in `localStorage` | Any XSS becomes account takeover | `HttpOnly` cookie via BFF |

---

# Checklist

- [ ] Authorization code with PKCE `S256` is the only user-facing flow
- [ ] Implicit and password grants are disabled
- [ ] Redirect URIs are registered in full and compared by exact string match
- [ ] `state` and `nonce` are CSPRNG-generated, session-bound and single-use
- [ ] ID token signature, `iss`, `aud`, `exp` and `nonce` are all validated
- [ ] The resource server validates `scope` and `aud` for its own API
- [ ] Access tokens are never parsed by the client
- [ ] Scopes requested are the narrowest that work
- [ ] Access tokens expire in 5–15 minutes; refresh tokens rotate on use
- [ ] Refresh-token reuse revokes the family
- [ ] No client secret exists in any browser or mobile bundle
- [ ] Logout calls the revocation endpoint
