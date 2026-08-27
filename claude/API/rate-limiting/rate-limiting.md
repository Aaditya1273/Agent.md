---
targetModels:
  - "Claude Fable 5"
  - "Claude Opus 5"
  - "Claude Sonnet 5"
  - "Claude 5 Family"
  - "Future Claude Models"
name: rate-limiting
category: API
description: Rate limiting that protects the service without punishing legitimate clients — algorithm choice, key selection, headers, and distributed enforcement.
license: MIT
author: Agent.md maintainers
last-verified: 2026-08-23
reviewed-by: unreviewed
---
<!-- Generated from models/_canonical by scripts/build-model-variants.js.
     Edit the canonical source, not this file. Structure adapted for Claude per deep-research.md. -->
# Purpose

<purpose>
Rules for limiting request rates. Two distinct goals, often conflated:

- **Protection** — keep one caller from exhausting capacity for everyone.
- **Fairness / monetisation** — enforce plan quotas.

They need different keys, different windows, and different responses. Decide
which one each limiter serves before configuring it.

---
</purpose>

# Algorithms

<rules>
| Algorithm | Burst | Memory per key | Boundary problem |
| --- | --- | --- | --- |
| Fixed window | 2× at the boundary | 1 counter | **Yes** — 2× the limit across a boundary |
| Sliding window log | None | O(n) timestamps | No, but memory grows with traffic |
| Sliding window counter | Slight | 2 counters | Negligible |
| Token bucket | Configurable, intended | 2 values | No |
| Leaky bucket | None; smooths output | 1 queue | No |

**Token bucket is the default.** It expresses the real requirement — a sustained
rate plus an allowance for bursts — in two numbers, and it costs two values per
key.

```lua
-- Atomic token bucket in Redis. Read-then-write in application code races.
local bucket = redis.call("HMGET", KEYS[1], "tokens", "ts")
local tokens = tonumber(bucket[1]) or tonumber(ARGV[3])
local ts     = tonumber(bucket[2]) or tonumber(ARGV[4])
local delta  = math.max(0, tonumber(ARGV[4]) - ts)
tokens = math.min(tonumber(ARGV[3]), tokens + delta * tonumber(ARGV[1]))
if tokens < 1 then return {0, tokens} end
redis.call("HMSET", KEYS[1], "tokens", tokens - 1, "ts", ARGV[4])
redis.call("EXPIRE", KEYS[1], tonumber(ARGV[2]))
return {1, tokens - 1}
```

Fixed windows are tempting because they are trivial, but a client can send the
full limit at `59.9s` and again at `60.1s` — twice the intended rate. Do not use
them for anything protective. → `Database/redis`

---
</rules>

# Choose the key deliberately

<rules>
| Key | Limits | Weakness |
| --- | --- | --- |
| API key / account | Fairness, quotas | Absent for unauthenticated traffic |
| User id | Per-user fairness | Same |
| IP address | Unauthenticated abuse | NAT and mobile carriers share one IP; IPv6 is cheap to rotate |
| IP + route | Login brute force | Distributed attacks bypass it |
| Account + route | Credential stuffing on one account | — |
| Global | Backstop against overload | Blunt |

Limit on **more than one key at once**. Per-IP alone does not stop a distributed
credential-stuffing run against one account; per-account alone lets one host spray
many accounts. → `Security/authentication`

Determine the client IP correctly. Behind a proxy, `X-Forwarded-For` is
client-controlled unless you take the value at a known hop count from a trusted
proxy set. Trusting the leftmost value lets any caller forge an unlimited number
of identities and bypass the limiter entirely.

Weight expensive routes rather than counting all requests as one. A report
endpoint costing 30 database seconds should consume more tokens than a health
check.

---
</rules>

# Respond correctly

<rules>
```
HTTP/1.1 429 Too Many Requests
Retry-After: 30
RateLimit-Limit: 1000
RateLimit-Remaining: 0
RateLimit-Reset: 30
```

- **`429`**, never `403` — clients and SDKs retry on `429` and give up on `403`.
- **`Retry-After` is mandatory.** Without it, well-behaved clients retry
  immediately and make the overload worse.
- Send `RateLimit-*` headers on **successful** responses too, so clients can slow
  down before they are blocked.
- Use `503` with `Retry-After` for whole-service overload, distinct from a
  per-caller `429`.

Publish the limits in your documentation. An undocumented limit is discovered
during an integration's launch.

---
</rules>

# Distributed enforcement

<rules>
Per-instance counters mean the effective limit is `limit × instances`, and it
changes when you autoscale.

- Use a shared store (Redis) with an **atomic** check-and-decrement — the Lua
  script above, not `GET` then `SET`.
- Decide the failure mode explicitly: if the limiter's store is unavailable, do
  you **fail open** (serve traffic, unprotected) or **fail closed** (reject
  everything)? Fail open is usually right for an API, fail closed for a login
  endpoint. Write the decision down.
- Prefer enforcement at the edge (CDN/WAF/API gateway) for volumetric abuse —
  a request rejected at the edge costs you nothing.
- Local in-process limiting is a reasonable second layer, never the only one.

```nginx
</rules>

# Edge layer: reject volumetric abuse before it reaches an application process

<rules>
limit_req_zone $binary_remote_addr zone=api:20m rate=20r/s;
limit_req      zone=api burst=40 nodelay;
limit_req_status 429;
```

```ts
// Application layer: quota per API key, atomic, shared across instances
const { allowed, remaining } = await bucket.take(`rl:key:${apiKey}:${route}`, {
  refillPerSecond: 10,
  capacity: 100,
  cost: ROUTE_COST[route] ?? 1,
});
if (!allowed) return res.status(429)
  .set({ "Retry-After": "30", "RateLimit-Remaining": "0" }).end();
```

| Layer | Enforces | Store |
| --- | --- | --- |
| CDN / WAF (Cloudflare, Fastly) | Volumetric floods, bot traffic | Edge-local |
| API gateway (Kong, Envoy, APISIX) | Per-consumer plan quotas | Redis |
| Application middleware | Route-weighted business limits | Redis |
| Database / connection pool | Final backstop | `statement_timeout` |

---
</rules>

# Do not punish legitimate clients

<rules>
- **Warn before enforcing.** Ship a new limit in log-only mode, measure who would
  have been blocked, then enforce.
- Give a higher burst allowance than the sustained rate; real clients are bursty.
- Exempt health checks, and internal service-to-service traffic that has its own
  backpressure.
- Never permanently lock an account on rate-limit breach — that is a
  denial-of-service primitive against your own users. Use temporary backoff.
- Provide a documented path to a raised limit.

---
</rules>

# Anti-patterns

<antipatterns>
| Anti-pattern | Why it fails | Fix |
| --- | --- | --- |
| Fixed window for protection | 2× the limit across the boundary | Token or sliding window |
| Read-then-write counter | Races under concurrency | Atomic Lua / `INCR` |
| Per-instance counters | Effective limit scales with instance count | Shared store |
| Trusting leftmost `X-Forwarded-For` | Forgeable; limiter fully bypassed | Trusted-proxy hop count |
| IP-only limiting | NAT punishes many; attackers rotate | Multiple keys together |
| Account-only limiting | One host sprays many accounts | Add per-IP |
| `403` for rate limits | Clients do not retry | `429` |
| `429` without `Retry-After` | Immediate retries worsen overload | Always include it |
| Headers only on rejection | Clients cannot self-regulate | Send on success too |
| All routes weighted equally | Expensive routes dominate cost | Weighted token cost |
| Undocumented limits | Discovered during a customer launch | Publish them |
| Permanent lockout | Self-inflicted DoS | Temporary backoff |
| Enforcing a new limit without measuring | Breaks existing integrations | Log-only rollout first |
| Undefined store-failure behaviour | Unpredictable under partial outage | Explicit fail-open/closed |

---
</antipatterns>

# Checklist

<checklist>
- [ ] Each limiter's purpose — protection or quota — is stated
- [ ] The algorithm is token bucket or sliding window, not a fixed window
- [ ] Counter updates are atomic
- [ ] Limits are enforced from a shared store, not per instance
- [ ] Limiting keys on both identity and network address
- [ ] Client IP is derived from a trusted-proxy hop count
- [ ] Expensive routes consume proportionally more budget
- [ ] `429` is returned with `Retry-After`
- [ ] `RateLimit-*` headers are sent on successful responses
- [ ] Service-wide overload returns `503`, distinct from per-caller `429`
- [ ] Store-unavailable behaviour is an explicit, documented decision
- [ ] Volumetric abuse is rejected at the edge
- [ ] New limits ship in log-only mode first
- [ ] Limits are documented, with a path to request an increase
</checklist>
