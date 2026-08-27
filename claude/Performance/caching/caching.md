---
targetModels:
  - "Claude Fable 5"
  - "Claude Opus 5"
  - "Claude Sonnet 5"
  - "Claude 5 Family"
  - "Future Claude Models"
name: caching
category: Performance
description: Caching layers, invalidation strategies, stampede protection and the correctness rules that keep a cache from serving one user another user's data.
license: MIT
author: Agent.md maintainers
last-verified: 2026-08-23
reviewed-by: unreviewed
---
<!-- Generated from models/_canonical by scripts/build-model-variants.js.
     Edit the canonical source, not this file. Structure adapted for Claude per deep-research.md. -->
# Purpose

<purpose>
Rules for caching. A cache trades **freshness** for **speed**, and the trade is
only acceptable when you can state how stale data is allowed to be and how it is
invalidated.

The rule that precedes all others: **cache after the operation is correct and
indexed, never instead.** A cache in front of an unindexed query hides the problem
until the cache misses, which is exactly when load is highest.
→ `Database/query-optimization`

---
</purpose>

# Know which layer you are in

<rules>
| Layer | Scope | Invalidation | Typical TTL |
| --- | --- | --- | --- |
| Browser | One user | Impossible once sent | Immutable assets only |
| CDN | All users | Purge by URL or tag | Minutes to a year |
| Reverse proxy | All users | Purge | Seconds to minutes |
| Application (Redis) | All instances | Delete by key | Seconds to hours |
| In-process | One instance | Restart | Seconds |
| Database | Plan cache, `shared_buffers` | Automatic | — |

Each layer has a different invalidation cost. A browser cache **cannot** be
invalidated — once `max-age=86400` is sent, that client will not ask again for a
day. This is why HTML is short-lived and only content-hashed assets are cached
hard:

```
Cache-Control: public, max-age=31536000, immutable       # /assets/app.a1b2c3.js
Cache-Control: public, max-age=0, s-maxage=300, stale-while-revalidate=86400   # HTML
Cache-Control: private, no-store                         # authenticated responses
```

`max-age` is the browser; `s-maxage` is the shared cache. Confusing them is how a
deploy takes a day to reach users.

---
</rules>

# Never cache a personalised response in a shared cache

<rules>
This is the highest-impact caching bug in existence: one user's page served to
another.

- Authenticated responses get `Cache-Control: private, no-store`.
- If a response varies by user, either do not cache it in a shared layer, or make
  the user part of the **cache key** — not a `Vary` header, which fragments and
  is easy to get wrong.
- `Vary: Cookie` disables the cache in practice (every user has a different
  cookie) while looking like it works.
- Audit: does any cache key omit the tenant or user for a response that depends on
  them? → `API/api-security`

---
</rules>

# Invalidation: decide before you cache

<rules>
Three strategies, and every cached value uses one of them explicitly:

| Strategy | Correctness | Complexity |
| --- | --- | --- |
| **TTL only** | Stale for up to the TTL | Lowest — start here |
| **Write-through / delete-on-write** | Fresh immediately | Must find every write path |
| **Tag or event-based** | Fresh, handles fan-out | Highest |

```ts
// Cache-aside with explicit invalidation on write
async function getOrder(id: string) {
  const hit = await redis.get(`order:${id}`);
  if (hit) return JSON.parse(hit);
  const order = await db.order.findUnique({ where: { id } });
  await redis.set(`order:${id}`, JSON.stringify(order), { EX: 300 });
  return order;
}

async function updateOrder(id: string, data: Patch) {
  const order = await db.order.update({ where: { id }, data });
  await redis.del(`order:${id}`);          // delete, do not update
  await redis.del(`orders:list:${order.tenantId}`);   // derived views too
  return order;
}
```

**Delete rather than update** the cache on write: writing the new value races with
concurrent readers and can leave the cache permanently ahead of or behind the
database.

A cache with no stated invalidation mechanism is a bug with a delay fuse. Write
the mechanism down next to the TTL.

---
</rules>

# Stampede, and the failure that follows a success

<rules>
When a hot key expires, every concurrent request misses at once and hits the
origin together. The database that was comfortable at 5% miss rate is not
comfortable at 100%.

Three defences, in increasing order of effectiveness:

```ts
// 1. Jittered TTL — hot keys do not expire in lockstep
await redis.set(key, value, { EX: 300 + Math.floor(Math.random() * 60) });

// 2. Single-flight — one recompute, others wait or serve stale
const lock = await redis.set(`lock:${key}`, id, { NX: true, PX: 10_000 });
if (!lock) return staleValue ?? await waitForRecompute(key);

// 3. Stale-while-revalidate — always serve, refresh in the background
if (entry.expiresAt < now) refreshInBackground(key);
return entry.value;
```

Stale-while-revalidate is usually the right answer for read-heavy data: users
never wait, and the origin sees one request per key per refresh interval.

Also plan for the cache being **down**. Decide explicitly whether a Redis outage
means serve-from-origin (fail open, origin may collapse) or fail requests. Write
the decision down and rate-limit the origin accordingly.
→ `Database/redis`

---
</rules>

# Cache the right things

<rules>
| Good candidate | Poor candidate |
| --- | --- |
| Expensive aggregation, rarely changing | A primary-key lookup already sub-millisecond |
| Third-party API responses | Data that must be exact (balances, inventory) |
| Rendered fragments, config, feature flags | Anything personalised, in a shared cache |
| Session and permission lookups (short TTL) | Values whose staleness has legal meaning |

Caching a fast query adds a network hop, a serialisation cost and an invalidation
bug for no gain. Measure the operation first.

Name keys so a whole class can be found, measured and expired:

```
<entity>:<version>:<scope>:<id>[:<variant>]

order:v2:tenant_8fd2:ord_4a1b          # single entity
orders:v2:tenant_8fd2:status=paid:p1   # a derived list view
flags:v1:global                        # configuration
```

The `v2` segment is a **schema version**: bumping it invalidates every key of that
shape at once, which is the only practical way to deploy a changed value format
without serving old shapes to new code.

Monitor hit ratio, latency saved, eviction rate and memory. A `cache_hit_ratio` below
~80% usually means the key design is wrong, not that caching does not apply —
typically a key containing a `requestId`, a timestamp, or a full URL with tracking
parameters — something that varies more than the value does.

---
</rules>

# Anti-patterns

<antipatterns>
| Anti-pattern | Why it fails | Fix |
| --- | --- | --- |
| Caching to hide a slow query | Breaks under the load that caused it | Index first |
| No stated invalidation mechanism | Permanently stale data | Decide before caching |
| Caching personalised data in a shared layer | One user's data served to another | `private, no-store`, or key by user |
| `Vary: Cookie` | Cache fragmented per user; effectively disabled | Key explicitly |
| Updating the cache on write | Races with readers; drifts | Delete the key |
| Forgetting derived views on invalidation | List stale while the item is fresh | Invalidate every affected key |
| Uniform TTLs on hot keys | Synchronised stampede | Jitter |
| No single-flight on recompute | Every miss hits the origin at once | Lock, or stale-while-revalidate |
| Long browser `max-age` on HTML | A deploy takes a day to reach users | Short `s-maxage`, no browser cache |
| Caching a sub-millisecond lookup | Adds a hop and an invalidation bug | Do not cache it |
| Caching exact-value data | Users see wrong balances | Read through |
| No plan for cache unavailability | Origin collapses on a Redis restart | Explicit fail-open/closed |
| Unbounded cache growth | Memory exhaustion, then random eviction | `maxmemory` plus a policy |
| No hit-ratio monitoring | The cache may be doing nothing | Track and alert |
| Cache key missing the tenant | Cross-tenant data exposure | Include every varying dimension |

---
</antipatterns>

# Checklist

<checklist>
- [ ] The underlying operation is correct and indexed before any cache is added
- [ ] Each cached value names its layer, TTL and invalidation mechanism
- [ ] Authenticated and personalised responses are never in a shared cache
- [ ] Cache keys include every dimension the value varies on, including tenant
- [ ] `max-age` and `s-maxage` are set deliberately and differ where appropriate
- [ ] Immutable assets are content-hashed and cached for a year
- [ ] Writes delete cache entries rather than updating them
- [ ] Derived and list views are invalidated alongside item keys
- [ ] Hot-key TTLs are jittered
- [ ] Recomputation is single-flighted, or stale-while-revalidate is used
- [ ] Behaviour when the cache is unavailable is explicit and documented
- [ ] Origin load is bounded even at a 100% miss rate
- [ ] Memory limits and an eviction policy are configured
- [ ] Hit ratio, eviction rate and memory use are monitored
</checklist>
