---
targetModels:
  - "Gemini 3.6 Flash"
  - "Gemini 3.5 Flash"
  - "Gemini 3.1 Pro"
  - "Gemini 3 Family"
  - "Future Gemini Models"
name: rate-limiting
category: Security
description: Limiting request rates without breaking legitimate users — algorithm choice, correct keys, distributed state, and the headers clients need.
license: MIT
author: Agent.md maintainers
last-verified: 2026-08-23
reviewed-by: unreviewed
---
<!-- Generated from models/_canonical by scripts/build-model-variants.js.
     Edit the canonical source, not this file. Structure adapted for Gemini per deep-research.md. -->


# Purpose

Rules for throttling requests to protect capacity and to slow abuse. Rate
limiting is a **control on volume**, not a substitute for authentication or
authorisation.

Get the **key** right before the algorithm. Limiting the wrong dimension is the
most common failure: per-IP alone does not stop distributed credential stuffing
against one account, and per-account alone lets one host spray many accounts.

---

# Choosing the key

| Key | Protects against | Weakness |
| --- | --- | --- |
| API key or user id | Per-tenant fairness, quota | Requires authentication first |
| Account identifier | Credential stuffing on one account | Attacker rotates accounts |
| Client IP | Single noisy source | NAT and CGNAT share IPs; IPv6 rotates cheaply |
| IP + account | Login endpoints | — |
| Endpoint cost class | Expensive operations | Needs per-route configuration |

For login, limit **per account and per IP independently** — a request is rejected
if either budget is exhausted.

**Never** trust `X-Forwarded-For` blindly. It is client-settable; an attacker
prepends a fake address and evades every per-IP limit. Configure `trust proxy` to
the exact number of proxies you run and take the correct position from the right.

```js
app.set("trust proxy", 1);      // exactly one proxy in front — not `true`
```

**Never** key on `User-Agent`, a cookie the client controls, or a request body
field. All are attacker-chosen.

---

# Algorithms

| Algorithm | Behaviour | Use |
| --- | --- | --- |
| **Token bucket** | Steady refill, allows bursts up to capacity | **Default** — matches real traffic |
| **Sliding window log** | Exact; stores each timestamp | Low volume, strict accuracy |
| **Sliding window counter** | Approximate, cheap | High volume |
| **Fixed window** | Simple counter per interval | Avoid — see below |
| **Leaky bucket** | Smooths output to a constant rate | Queue-shaped workloads |

**Avoid fixed windows.** They permit a double burst at the boundary: a client
spends the whole budget at `00:59` and the whole next budget at `01:01`, sending
two allowances within two seconds.

```js
// Token bucket in Redis — atomic, so concurrent requests cannot both pass.
const ALLOW = `
local key, rate, burst, now = KEYS[1], tonumber(ARGV[1]), tonumber(ARGV[2]), tonumber(ARGV[3])
local b = redis.call('HMGET', key, 'tokens', 'ts')
local tokens = tonumber(b[1]) or burst
local ts = tonumber(b[2]) or now
tokens = math.min(burst, tokens + (now - ts) * rate)
if tokens < 1 then
  redis.call('HMSET', key, 'tokens', tokens, 'ts', now)
  return 0
end
redis.call('HMSET', key, 'tokens', tokens - 1, 'ts', now)
redis.call('EXPIRE', key, math.ceil(burst / rate) * 2)
return 1
`;
const allowed = await redis.eval(ALLOW, 1, `rl:${key}`, rate, burst, Date.now() / 1000);
```

The Lua script matters: read-then-write from application code is a race, and under
concurrency more requests pass than the limit permits.

---

# Distributed state

- An in-memory counter per process means the real limit is `limit × instances`,
  and it resets on every deploy. Acceptable for a single instance; wrong for
  anything scaled.
- Use a shared store — Redis, or the platform's own limiter at the edge.
- Prefer limiting **at the edge** (CDN, API gateway) for volumetric abuse: it
  never reaches your origin. Keep application-level limits for per-account and
  per-endpoint rules the edge cannot see.
- **Fail open or closed deliberately.** If Redis is down, decide in advance
  whether to allow (availability) or deny (protection), and log the decision.
  Silently allowing because an exception was swallowed is the common accident.

---

# Responding

```
HTTP/1.1 429 Too Many Requests
RateLimit-Limit: 100
RateLimit-Remaining: 0
RateLimit-Reset: 30
Retry-After: 30
```

- Return **`429`**, not `403`. `403` tells a client it is forbidden forever.
- Always send **`Retry-After`**. Without it, well-behaved clients retry
  immediately and make the situation worse.
- Expose remaining budget so clients can self-pace.
- Apply **jitter** to any server-suggested backoff, or every throttled client
  returns simultaneously.
- **Never** leak whether an account exists through differing limits — see
  `Security/authentication`.

---

# Tuning

- Measure real traffic **before** setting a limit. A limit below the p99 of
  legitimate use is an outage you scheduled for yourself.
- Set different limits per endpoint class: a search or export endpoint costs
  orders of magnitude more than a health check.
- Run in **observe-only** first, logging what would have been rejected.
- Exempt health checks and internal service traffic explicitly, by credential —
  never by IP range alone.
- Alert on sustained `429` rates. A spike is either an attack or a broken client,
  and both are worth knowing about.

---

# Anti-patterns

| Anti-pattern | Why it fails | Fix |
| --- | --- | --- |
| Trusting `X-Forwarded-For` | Client-settable; trivially spoofed | Configure `trust proxy` precisely |
| In-memory counters across instances | Real limit is `limit × instances` | Shared store |
| Read-then-write without atomicity | Concurrent requests overshoot | Lua script or atomic primitive |
| Fixed window | Double burst at the boundary | Token bucket |
| Per-IP only on login | Distributed stuffing passes | Also limit per account |
| `403` instead of `429` | Reads as permanent denial | `429` with `Retry-After` |
| No `Retry-After` | Clients retry immediately | Always send it |
| Fail-open by swallowed exception | Limit silently disappears | Decide and log the mode |
| Limit set without measuring | Blocks legitimate users | Observe first |
| Permanent lockout on failures | Self-inflicted denial of service | Exponential backoff |

---

# Checklist

- [ ] Verify: Limits are keyed on account and IP independently for authentication routes
- [ ] Verify: `trust proxy` is set to the exact proxy count; `X-Forwarded-For` is not trusted raw
- [ ] Verify: Algorithm is token bucket or sliding window, never fixed window
- [ ] Verify: Counter updates are atomic under concurrency
- [ ] Verify: State is shared across instances, not per-process memory
- [ ] Verify: Store-unavailable behaviour is a deliberate, logged decision
- [ ] Verify: Responses return `429` with `Retry-After` and remaining budget
- [ ] Verify: Backoff guidance includes jitter
- [ ] Verify: Limits differ by endpoint cost class
- [ ] Verify: Limits were derived from measured traffic and trialled in observe-only mode
- [ ] Verify: Health checks and internal traffic are exempted by credential
- [ ] Verify: Sustained `429` rates raise an alert
