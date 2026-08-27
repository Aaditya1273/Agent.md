---
targetModels:
  - "Gemini 3.6 Flash"
  - "Gemini 3.5 Flash"
  - "Gemini 3.1 Pro"
  - "Gemini 3 Family"
  - "Future Gemini Models"
name: cors
category: Security
description: Configuring cross-origin resource sharing without opening your API — explicit origins, why reflection is dangerous, and what CORS does not protect.
license: MIT
author: Agent.md maintainers
last-verified: 2026-08-23
reviewed-by: unreviewed
---
<!-- Generated from models/_canonical by scripts/build-model-variants.js.
     Edit the canonical source, not this file. Structure adapted for Gemini per deep-research.md. -->


# Purpose

Rules for configuring CORS deliberately.

First, the correction that prevents most CORS mistakes: **CORS is a relaxation of
the same-origin policy, not a security control.** It decides whether a browser
lets page JavaScript *read* a cross-origin response. It does not stop the request
being sent, does not protect non-browser clients, and does not prevent CSRF —
see `Security/csrf`.

Loosening CORS can only ever weaken your position. Start closed.

---

# Explicit origins

```js
const ALLOWED = new Set([
  "https://app.example.com",
  "https://admin.example.com",
]);

app.use((req, res, next) => {
  const origin = req.get("Origin");
  if (origin && ALLOWED.has(origin)) {
    res.set("Access-Control-Allow-Origin", origin);
    res.set("Vary", "Origin");                 // required — see caching below
    res.set("Access-Control-Allow-Credentials", "true");
  }
  next();
});
```

- Compare against an **exact set**. The header takes one origin, so with several
  allowed you must echo the matched one — and `Vary: Origin` is then mandatory.
- **Never reflect an arbitrary `Origin`.** `res.set("Access-Control-Allow-Origin",
  req.get("Origin"))` with credentials enabled means every site can read every
  authenticated response. This is the single most damaging CORS misconfiguration.
- **Never** match with `startsWith`, `endsWith` or a loose regex.
  `https://app.example.com.evil.tld` passes a prefix check;
  `https://evil-app.example.com` passes a naive suffix check. Compare full origins.
- **Never** allow `null`. It is sent by sandboxed iframes and `file://` documents
  and is attacker-reachable.

## Credentials

`Access-Control-Allow-Origin: *` and `Access-Control-Allow-Credentials: true` are
rejected together by browsers. Code that "fixes" this by reflecting the origin has
deliberately built the vulnerability the rule exists to prevent.

If the API uses bearer tokens rather than cookies, you may not need credentials
at all — and then `*` for genuinely public, unauthenticated endpoints is fine.

---

# Preflight

A preflight `OPTIONS` request is sent when the request is not "simple" — a method
beyond `GET`/`HEAD`/`POST`, a `Content-Type` other than the three form types, or
custom headers.

```
Access-Control-Allow-Methods: GET, POST, PUT, DELETE
Access-Control-Allow-Headers: Content-Type, Authorization
Access-Control-Max-Age: 600
```

- List **only** the methods and headers you actually accept. `Allow-Headers: *`
  is ignored when credentials are used, and permissive otherwise.
- `Max-Age` caches the preflight. Keep it modest so a policy change takes effect;
  browsers cap it regardless.
- The preflight response must not require authentication — the browser sends it
  without credentials.

```js
// Answer the preflight explicitly. It must not require authentication —
// the browser sends OPTIONS without credentials.
app.options("*", (req, res) => {
  const origin = req.get("Origin");
  if (!origin || !ALLOWED.has(origin)) return res.status(403).end();

  res.set({
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Allow-Credentials": "true",
    "Access-Control-Max-Age": "600",
    Vary: "Origin, Access-Control-Request-Headers",
  });
  res.status(204).end();
});
```

**Requiring `application/json` is useful**: it forces a preflight, which a simple
cross-site form cannot perform. That is a genuine CSRF benefit, though it comes
from the content type rather than from CORS itself.

---

# Caching and proxies

`Vary: Origin` is not optional when the allowed origin varies. Without it a CDN or
proxy may serve a response containing
`Access-Control-Allow-Origin: https://app.example.com` to a request from another
origin — cross-origin data disclosure through a cache.

The same applies to `Vary: Access-Control-Request-Headers` for preflight
responses that differ by requested headers.

---

# What CORS does not do

- **It does not protect non-browser clients.** `curl`, a server, or a mobile app
  ignores CORS entirely. Authorisation must be enforced server-side regardless.
- **It does not prevent the request.** A cross-site `POST` still executes and
  still changes state; the attacker merely cannot read the reply.
- **It is not authentication.** An origin is not an identity. Anyone can send an
  `Origin` header of their choosing outside a browser.

---

# Anti-patterns

| Anti-pattern | Why it fails | Fix |
| --- | --- | --- |
| Reflecting any `Origin` with credentials | Every site reads authenticated responses | Exact allow-list |
| `origin.endsWith("example.com")` | `evil-example.com` passes | Full-origin equality |
| Allowing `Origin: null` | Reachable from sandboxed iframes | Never allow `null` |
| Omitting `Vary: Origin` | Caches serve one origin's response to another | Always set it |
| `Allow-Origin: *` on an authenticated API | Public reads of private data | Explicit origins |
| Treating CORS as CSRF protection | CORS gates reading, not sending | Tokens and `SameSite` |
| Wide CORS to "fix" a local dev error | Ships to production | Environment-specific config |
| Long `Max-Age` | Policy changes take days to apply | Keep it short |

---

# Checklist

- [ ] Verify: Allowed origins are an exact set, compared by full-origin equality
- [ ] Verify: No reflection of arbitrary `Origin` values
- [ ] Verify: `Origin: null` is never allowed
- [ ] Verify: `Vary: Origin` is set whenever the allowed origin varies
- [ ] Verify: `Allow-Credentials` is enabled only where cookies are genuinely required
- [ ] Verify: `Allow-Methods` and `Allow-Headers` list only what is accepted
- [ ] Verify: `Max-Age` is modest
- [ ] Verify: Preflight responses do not require authentication
- [ ] Verify: Server-side authorisation is enforced independently of CORS
- [ ] Verify: Development origins are not present in the production configuration
