---
targetModels:
  - "Claude Fable 5"
  - "Claude Opus 5"
  - "Claude Sonnet 5"
  - "Claude 5 Family"
  - "Future Claude Models"
name: csrf
category: Security
description: Preventing cross-site request forgery with SameSite cookies, synchroniser tokens, and Origin validation — and knowing which one is actually load-bearing.
license: MIT
author: Agent.md maintainers
last-verified: 2026-08-23
reviewed-by: unreviewed
---
<!-- Generated from models/_canonical by scripts/build-model-variants.js.
     Edit the canonical source, not this file. Structure adapted for Claude per deep-research.md. -->
# Purpose

<purpose>
Rules for ensuring a state-changing request was intended by the user, not
triggered by another site using their ambient credentials.

CSRF exists because browsers attach cookies automatically. **If your API does not
authenticate with cookies, you very likely do not have CSRF exposure** — a bearer
token in an `Authorization` header is not attached automatically by a cross-site
form post. Establish which case you are in before adding machinery.

---
</purpose>

# Layer 1 — SameSite cookies

<rules>
The first and cheapest control. Set it explicitly; do not rely on browser defaults.

```
Set-Cookie: sid=<value>; HttpOnly; Secure; SameSite=Lax; Path=/
```

| Value | Behaviour | Use |
| --- | --- | --- |
| `Strict` | Never sent cross-site, including top-level navigation | Highest protection; breaks inbound links to authenticated pages |
| `Lax` | Sent on top-level `GET` navigation only | **Default choice** — blocks cross-site `POST` |
| `None` | Always sent; **requires `Secure`** | Only for deliberate cross-site flows (embedded widgets, SSO) |

`SameSite=Lax` blocks the classic attack — an auto-submitting form on another
origin issuing a `POST`.

**But `Lax` is not sufficient on its own:**

- It does not protect **`GET` requests that change state**. That is a reason to
  never mutate on `GET`, not a reason to trust `Lax`.
- Same-site is *site*, not *origin*. `evil.example.com` is same-site with
  `app.example.com`. A subdomain takeover, or any XSS on a sibling subdomain,
  defeats it.
- `SameSite=None` — needed for legitimate cross-site use — disables it entirely.

So: `Lax` by default, plus one of the token strategies below for state-changing
endpoints.

---
</rules>

# Layer 2 — synchroniser token

<rules>
The server issues a random token, stores it against the session, and requires it
back in the request body or a header.

```js
// Issue with the form / page
const csrf = crypto.randomBytes(32).toString("base64url");
req.session.csrf = csrf;

// Validate on any state-changing request
const supplied = req.get("X-CSRF-Token") ?? req.body._csrf;
const a = Buffer.from(String(supplied ?? ""), "utf8");
const b = Buffer.from(req.session.csrf ?? "", "utf8");
if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
  return res.status(403).send("CSRF validation failed");
}
```

- Generate with a **CSPRNG** — `crypto.randomBytes`, never `Math.random()`.
- Compare with **`timingSafeEqual`**, never `===`, and length-check first because
  `timingSafeEqual` throws on mismatched lengths.
- Bind the token to the **session**, not to a global value.
- Rotate on login and privilege change, for the same reason session identifiers
  rotate.

**Never** place the CSRF token in a `GET` query string — it leaks via `Referer`,
logs and history.
</rules>

## Double-submit cookie — only when signed

<rules>
Storing the token in a cookie and comparing it to a header avoids server state.
Naively, it is **broken**: any same-site attacker (subdomain XSS, subdomain
takeover) can set a cookie on the parent domain and choose both halves.

Use it only in the **signed / HMAC** form: the cookie value is
`token.HMAC(sessionId, token)` keyed server-side, so an attacker cannot forge a
pair that matches their victim's session. Prefer the session-bound synchroniser
token when you have a session store.

---
</rules>

# Layer 3 — Origin and Referer validation

<rules>
For state-changing requests, verify the request came from your own origin.

```js
const origin = req.get("Origin") ?? req.get("Referer");
if (!origin) return res.status(403).end();              // fail closed
if (new URL(origin).origin !== "https://app.example.com") {
  return res.status(403).end();
}
```

- `Origin` is sent on all cross-origin requests and on same-origin `POST` in
  modern browsers. It cannot be set by page JavaScript.
- **Fail closed** when the header is absent. Treating "missing" as "allowed" is
  the standard bypass.
- Compare the parsed `.origin`, never `startsWith` — `https://app.example.com.evil.tld`
  passes a prefix check.

This pairs well with `Sec-Fetch-Site: same-origin`, which is unforgeable by page
script where supported.

---
</rules>

# Method discipline

<rules>
- **`GET`, `HEAD` and `OPTIONS` must be side-effect free.** A state-changing `GET`
  is exploitable with an `<img src>` tag and is not protected by `SameSite=Lax`.
- Require `POST`, `PUT`, `PATCH` or `DELETE` for every mutation, and apply CSRF
  validation to all of them.
- Reject `POST` bodies of type `text/plain` or `application/x-www-form-urlencoded`
  on JSON APIs. Those content types are reachable from a simple cross-site form
  without a CORS preflight; requiring `application/json` forces a preflight the
  attacker cannot satisfy.

---
</rules>

# CORS is not CSRF protection

<rules>
They are frequently confused. **CORS governs whether the attacker can *read* the
response. CSRF is about the request being *sent* at all.** A cross-site form post
succeeds and changes state even though the attacker never sees the response.

Making CORS worse also makes CSRF worse:

- **Never** reflect an arbitrary `Origin` into `Access-Control-Allow-Origin`.
- **Never** combine `Access-Control-Allow-Origin: *` with
  `Access-Control-Allow-Credentials: true` — browsers reject the pair, and code
  that works around it has opened the door deliberately.
- Keep the allowed-origin list explicit and short.

---
</rules>

# Anti-patterns

<antipatterns>
| Anti-pattern | Why it fails | Fix |
| --- | --- | --- |
| Relying on `SameSite` alone | Subdomains are same-site; `None` disables it | Add a token or Origin check |
| State-changing `GET` | `<img src>` triggers it; `Lax` permits it | Mutations use `POST`/`PUT`/`DELETE` |
| Unsigned double-submit cookie | Same-site attacker sets both halves | Session-bound or HMAC-signed token |
| `csrf === supplied` | Timing oracle | `crypto.timingSafeEqual` after a length check |
| `Math.random()` token | Predictable | `crypto.randomBytes(32)` |
| Allowing a missing `Origin` | Standard bypass | Fail closed |
| `origin.startsWith("https://app.example.com")` | `…example.com.evil.tld` passes | Compare parsed `.origin` |
| Assuming CORS prevents CSRF | CORS gates reading, not sending | Validate the request itself |
| CSRF token in the query string | Leaks via `Referer`, logs, history | Header or request body |

---
</antipatterns>

# Checklist

<checklist>
- [ ] Established whether the API uses cookie authentication at all
- [ ] Session cookies set `SameSite=Lax` (or `Strict`) explicitly, plus `Secure` and `HttpOnly`
- [ ] Any `SameSite=None` cookie is deliberate and documented
- [ ] `GET`, `HEAD` and `OPTIONS` have no side effects
- [ ] State-changing endpoints validate a session-bound CSRF token
- [ ] Tokens are CSPRNG-generated and compared with `timingSafeEqual`
- [ ] Double-submit, if used, is HMAC-signed rather than naive
- [ ] `Origin` / `Referer` validated with parsed-origin equality, failing closed
- [ ] JSON APIs reject form-encoded and `text/plain` bodies
- [ ] `Access-Control-Allow-Origin` is an explicit list and never a reflected value
- [ ] CSRF tokens never appear in URLs
</checklist>
