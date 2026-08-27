---
targetModels:
  - "DeepSeek V4"
  - "DeepSeek V3.2"
  - "DeepSeek R1"
  - "DeepSeek V3 Family"
  - "Future DeepSeek Models"
name: headers
category: Security
description: HTTP security headers that actually matter — CSP, HSTS, frame protection, and the deprecated ones still being copied from old blog posts.
license: MIT
author: Agent.md maintainers
last-verified: 2026-08-23
reviewed-by: unreviewed
---
<!-- Generated from models/_canonical by scripts/build-model-variants.js.
     Edit the canonical source, not this file. Structure adapted for DeepSeek per deep-research.md. -->


# Purpose

Rules for the response headers that constrain browser behaviour. Headers are
cheap and deployable independently of application changes — but they are
mitigations, not fixes. A strong CSP limits the damage of an XSS; it does not
remove it.

---

# The set worth sending

```
Content-Security-Policy: default-src 'self'; script-src 'self' 'nonce-{RANDOM}' 'strict-dynamic'; object-src 'none'; base-uri 'none'; frame-ancestors 'none'
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=()
Cross-Origin-Opener-Policy: same-origin
Cross-Origin-Resource-Policy: same-origin
```

| Header | Prevents | Notes |
| --- | --- | --- |
| `Content-Security-Policy` | XSS execution, injection of scripts | The highest-value header; see `Security/xss` |
| `Strict-Transport-Security` | Protocol downgrade, cookie interception | HTTPS only; see below |
| `X-Content-Type-Options` | MIME sniffing turning an upload into HTML | Always `nosniff` |
| `Referrer-Policy` | Leaking paths and tokens via `Referer` | `strict-origin-when-cross-origin` |
| `Permissions-Policy` | Unwanted device and API access | Deny by default, allow explicitly |
| `Cross-Origin-Opener-Policy` | Cross-window scripting; enables isolation | `same-origin` |
| `Cross-Origin-Resource-Policy` | Cross-origin embedding of your resources | `same-origin` |

## HSTS

`max-age=31536000` (one year) with `includeSubDomains`.

**Never** add `preload` casually. Submission to the browser preload list is
**effectively irreversible on a useful timescale** — every subdomain must serve
HTTPS forever. Verify every subdomain first, including internal and legacy hosts.

Send HSTS **only over HTTPS**. A browser ignores it on a plaintext response, and
sending it there suggests a misconfiguration.

## frame-ancestors over X-Frame-Options

`frame-ancestors 'none'` in CSP supersedes `X-Frame-Options: DENY`. Keep
`X-Frame-Options` only for very old browsers; it takes no list of origins and
its `ALLOW-FROM` value is not supported anywhere current.

---

# Deprecated — remove these

| Header | Status |
| --- | --- |
| `X-XSS-Protection` | **Remove.** The auditor is gone from every current browser. `1; mode=block` historically introduced its own vulnerabilities. Set `0` only if a legacy proxy adds it. |
| `Expect-CT` | **Remove.** Certificate Transparency is now enforced by default. |
| `Public-Key-Pins` (HPKP) | **Never use.** Removed from browsers; a mistake bricked sites for the pin lifetime. |
| `X-Frame-Options: ALLOW-FROM` | Unsupported. Use `frame-ancestors`. |

Copying a header block from an old article is how these persist. Check each
against current browser support before shipping it.

---

## Why CSP is the one that matters

Of the headers above, `Content-Security-Policy` is the only one that changes what
an attacker can achieve rather than merely what a browser reveals. The others
close narrow gaps; CSP constrains script execution itself, which is why it is
worth the deployment effort the rest do not require.

That effort is real. A strict policy will break inline scripts, inline styles and
third-party widgets that were working, which is why the report-only phase below
is not optional advice — it is how the policy gets deployed at all.

# Setting them

Set headers at one layer — the application, or the edge — not both. Duplicated
and conflicting headers behave inconsistently across browsers and proxies.

```js
import helmet from "helmet";

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", (req, res) => `'nonce-${res.locals.nonce}'`, "'strict-dynamic'"],
      objectSrc: ["'none'"],
      baseUri: ["'none'"],
      frameAncestors: ["'none'"],
    },
  },
  hsts: { maxAge: 31536000, includeSubDomains: true },
  referrerPolicy: { policy: "strict-origin-when-cross-origin" },
}));
```

The nonce must be **generated per response** with a CSPRNG and never reused:

```js
app.use((req, res, next) => {
  res.locals.nonce = crypto.randomBytes(16).toString("base64");
  next();
});
```

**Never** hard-code a nonce or derive it from anything predictable. A static
nonce is equivalent to `'unsafe-inline'`.

---

# Cookies

Cookie attributes are security headers by another name:

```
Set-Cookie: sid=…; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=1209600
```

Prefix a session cookie with `__Host-` where you can: the browser then enforces
`Secure`, `Path=/` and the absence of `Domain`, which prevents a subdomain from
setting a cookie your application will trust.

---

# Caching sensitive responses

```
Cache-Control: no-store
```

Authenticated responses must not be cached by browsers or shared proxies.
`no-store` is the correct directive; `no-cache` still permits storage with
revalidation.

---

# Verifying

Test the deployed origin, not the configuration file — a proxy may add, strip or
override headers:

```bash
curl -sI https://app.example.com | grep -iE 'content-security|strict-transport|x-content-type|referrer|permissions'
```

Then check the report from a scanner such as Mozilla Observatory or
securityheaders.com, and deploy CSP in `Report-Only` with a `report-to` endpoint
before enforcing.

---

# Anti-patterns

| Anti-pattern | Why it fails | Fix |
| --- | --- | --- |
| `script-src 'unsafe-inline'` | Disables most of CSP's value | Per-response nonce |
| Static or reused nonce | Equivalent to `unsafe-inline` | CSPRNG per response |
| `X-XSS-Protection: 1; mode=block` | Auditor removed; introduced its own bugs | Remove it |
| HSTS `preload` without auditing subdomains | Effectively irreversible | Verify every subdomain first |
| HSTS sent over HTTP | Ignored by browsers | HTTPS responses only |
| Headers set at both app and edge | Duplicates behave inconsistently | Choose one layer |
| Copying a 2016 header block | Ships deprecated headers | Check current support |
| `no-cache` on authenticated pages | Still permits storage | `no-store` |
| CSP enforced without a report phase | Breaks the site on deploy | `Report-Only` first |

---

# Checklist

- [ ] CSP set with a per-response CSPRNG nonce and `strict-dynamic`
- [ ] No `'unsafe-inline'` or `'unsafe-eval'` in `script-src`
- [ ] `object-src 'none'`, `base-uri 'none'`, `frame-ancestors 'none'` present
- [ ] HSTS `max-age` ≥ 1 year with `includeSubDomains`, HTTPS only
- [ ] `preload` used only after auditing every subdomain
- [ ] `X-Content-Type-Options: nosniff` on every response
- [ ] `Referrer-Policy` set to `strict-origin-when-cross-origin` or stricter
- [ ] `Permissions-Policy` denies unused device APIs
- [ ] `X-XSS-Protection`, `Expect-CT` and HPKP are absent
- [ ] Session cookies use `HttpOnly`, `Secure`, `SameSite` and `__Host-` where possible
- [ ] Authenticated responses send `Cache-Control: no-store`
- [ ] Headers are set at exactly one layer and verified against the live origin
