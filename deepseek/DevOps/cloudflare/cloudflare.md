---
targetModels:
  - "DeepSeek V4"
  - "DeepSeek V3.2"
  - "DeepSeek R1"
  - "DeepSeek V3 Family"
  - "Future DeepSeek Models"
name: cloudflare
category: DevOps
description: Cloudflare as CDN, WAF and edge platform — DNS and proxying, cache rules that actually cache, origin protection, Workers limits, and rate limiting.
license: MIT
author: Agent.md maintainers
last-verified: 2026-08-23
reviewed-by: unreviewed
---
<!-- Generated from models/_canonical by scripts/build-model-variants.js.
     Edit the canonical source, not this file. Structure adapted for DeepSeek per deep-research.md. -->


# Purpose

Rules for putting Cloudflare in front of an application, and for running code at
its edge. Three jobs, in descending order of value:

1. **Caching** — serve static assets from the edge and never touch the origin.
2. **Protection** — absorb volumetric attacks and block abuse before it costs you.
3. **Compute** — Workers for logic that belongs at the edge, not for everything.

---

# Proxying and origin protection

A proxied (orange-cloud) record hides the origin IP. A grey-cloud record publishes
it, and an attacker who knows it bypasses every protection you configured.

- Proxy every public hostname. Audit for grey-cloud records — a legacy `direct.`
  or `origin.` record is the standard way the origin IP leaks.
- **Lock the origin down** so it only accepts Cloudflare traffic. Otherwise the WAF
  and rate limits are optional from an attacker's point of view:
  - Allow only Cloudflare IP ranges at the firewall, **or**
  - Use Cloudflare Tunnel (`cloudflared`) so the origin has no inbound ports at
    all — the stronger option, and it removes IP-range maintenance.
- Authenticated Origin Pulls (mTLS) so the origin can verify the request came from
  your Cloudflare account, not just from Cloudflare.
- SSL mode **Full (strict)**. `Flexible` means Cloudflare talks plaintext HTTP to
  your origin while showing users a padlock — it is unencrypted transport with a
  misleading indicator.

---

# Caching: the defaults cache almost nothing

By default Cloudflare caches a list of static file extensions and **nothing with a
query string or a cookie**. Most applications therefore see a low hit ratio and
conclude the CDN is not helping.

```
# Cache rule: hashed assets, cached hard, everywhere
When  URI Path matches ^/(assets|_next/static)/
Then  Cache eligibility: Eligible
      Edge TTL: 1 year   Browser TTL: 1 year
```

Set the origin headers to match:

```
Cache-Control: public, max-age=31536000, immutable      # content-hashed assets
Cache-Control: public, max-age=0, s-maxage=300, stale-while-revalidate=86400   # HTML
Cache-Control: private, no-store                        # authenticated responses
```

Rules that matter:

- `s-maxage` controls the CDN; `max-age` controls the browser. HTML usually wants
  a short shared TTL and no browser cache, so a deploy is visible immediately.
- **Never cache an authenticated response.** One user's page served to another is
  the highest-impact CDN bug there is, and it is entirely a `Cache-Control`
  mistake. → `API/api-security`
- `Vary` on any header that changes the response, but avoid `Vary: Cookie` — it
  fragments the cache per user and effectively disables it.
- **Purge by tag or URL on deploy**, never purge everything: a full purge sends
  every request to the origin at once.
- Tiered Cache reduces origin load; Cache Reserve helps for large, rarely-changing
  objects.

Measure the hit ratio. Below ~80% on static assets means the rules are wrong, not
that caching does not apply.

---

# WAF, bots and rate limiting

- Enable the managed WAF rulesets, then **watch the logs before enforcing**.
  Shipping a ruleset straight to block will break a legitimate integration whose
  payload looks like an attack.
- Rate limit at the edge for volumetric abuse — a request blocked here costs you
  nothing. Keep application-level limits too, for per-account quotas the edge
  cannot see. → `API/rate-limiting`
- Bot Fight Mode and challenges interact badly with API clients and webhooks:
  exempt `/api/*` and known partner paths, or expect a support ticket.
- **Never** rely on a Cloudflare-added header for authorization decisions unless
  the origin is locked to Cloudflare — otherwise a direct request forges it. This
  applies to `CF-Connecting-IP`, `CF-IPCountry` and Access JWTs.
- Take the client IP from `CF-Connecting-IP`, not the leftmost `X-Forwarded-For`,
  which is client-controlled.
- Cloudflare Access for internal tools: identity-aware proxy in front of the
  origin, so there is no public admin panel at all.

---

# Workers: know the constraints

| Constraint | Value | Consequence |
| --- | --- | --- |
| CPU time | ~10–30 ms typical, configurable | Not for heavy computation |
| Memory | 128 MB | No large in-memory work |
| Runtime | V8 isolates, **not** Node | Node built-ins need `nodejs_compat` |
| Subrequests | Bounded per request | Fan-out is limited |
| KV consistency | Eventually consistent, ~60s | Not for read-after-write |

- Workers suit routing, header rewriting, auth checks, A/B assignment, and
  personalisation at the edge. They do not suit image processing or anything
  CPU-heavy.
- Storage: **KV** for read-heavy, eventually-consistent data; **Durable Objects**
  for strongly-consistent coordination; **D1** for relational; **R2** for objects,
  with no egress fees.
- Secrets via `wrangler secret put`, never in `wrangler.toml` — which is committed.
- Version and roll back deployments (`wrangler versions`), and use gradual
  deployments for risky changes. → `DevOps/rollback`
```toml
# wrangler.toml — bindings, not secrets. Secrets go in `wrangler secret put`.
name = "edge-router"
main = "src/index.ts"
compatibility_date = "2026-08-01"
compatibility_flags = ["nodejs_compat"]

[[kv_namespaces]]
binding = "CONFIG"
id = "…"

[[durable_objects.bindings]]
name = "RATE_LIMITER"
class_name = "RateLimiter"

[observability]
enabled = true
```

- No global mutable state across requests: isolates are recycled unpredictably, so
  a module-scope cache is neither reliable nor per-user-safe.

---

# Anti-patterns

| Anti-pattern | Why it fails | Fix |
| --- | --- | --- |
| Grey-cloud DNS records | Origin IP published; protections bypassed | Proxy everything; audit records |
| Origin open to the internet | The WAF becomes optional | IP allowlist or Cloudflare Tunnel |
| SSL mode `Flexible` | Plaintext to origin behind a padlock | Full (strict) |
| Assuming defaults cache HTML | Low hit ratio; origin carries the load | Explicit cache rules |
| Caching authenticated responses | One user's data served to another | `private, no-store` |
| `Vary: Cookie` | Cache fragmented per user | Vary only on what matters |
| Purging everything on deploy | Origin stampede | Purge by tag or URL |
| WAF rules enforced without observation | Breaks legitimate integrations | Log-only first |
| Bot protection on API paths | Partner integrations and webhooks fail | Exempt them |
| Trusting `CF-*` headers with an open origin | Forgeable by a direct request | Lock the origin first |
| Leftmost `X-Forwarded-For` as client IP | Client-controlled; limits bypassable | `CF-Connecting-IP` |
| Heavy computation in a Worker | CPU limit exceeded | Origin or a queue |
| KV used for read-after-write | Eventually consistent | Durable Objects |
| Secrets in `wrangler.toml` | Committed to version control | `wrangler secret` |
| Module-scope state in a Worker | Isolates recycle; state is not yours | Stateless handlers |
| No cache-hit-ratio monitoring | The CDN silently does nothing | Track and alert |

---

# Checklist

- [ ] Every public hostname is proxied; no grey-cloud records remain
- [ ] The origin accepts traffic only from Cloudflare, or has no inbound ports
- [ ] Authenticated Origin Pulls are enabled
- [ ] SSL mode is Full (strict) end to end
- [ ] Cache rules explicitly cover static assets and HTML
- [ ] Origin `Cache-Control` distinguishes `max-age` from `s-maxage`
- [ ] Authenticated responses are never cacheable
- [ ] `Vary` is minimal and never varies on cookies
- [ ] Deploys purge by tag or URL, not globally
- [ ] Cache hit ratio is monitored and alerted on
- [ ] WAF rulesets ran in log-only mode before enforcement
- [ ] Edge rate limiting complements, not replaces, application limits
- [ ] Bot protection exempts API and webhook paths
- [ ] Client IP is read from `CF-Connecting-IP`
- [ ] No authorization decision trusts a `CF-*` header on an unlocked origin
- [ ] Internal tools sit behind Cloudflare Access
- [ ] Worker CPU, memory and subrequest limits are understood and respected
- [ ] Worker storage choice matches the consistency requirement
- [ ] Worker secrets are set with `wrangler secret`, not committed
- [ ] Worker deployments are versioned and rollable
