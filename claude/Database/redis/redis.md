---
targetModels:
  - "Claude Fable 5"
  - "Claude Opus 5"
  - "Claude Sonnet 5"
  - "Claude 5 Family"
  - "Future Claude Models"
name: redis
category: Database
description: Using Redis as a cache, lock and queue without losing data or correctness — eviction, persistence, atomicity, and the locking pattern that actually holds.
license: MIT
author: Agent.md maintainers
last-verified: 2026-08-23
reviewed-by: unreviewed
---
<!-- Generated from models/_canonical by scripts/build-model-variants.js.
     Edit the canonical source, not this file. Structure adapted for Claude per deep-research.md. -->
# Purpose

<purpose>
Rules for Redis. Redis is fast because it is in memory and single-threaded for
command execution. Both facts drive every rule here: memory is finite and must be
bounded, and one slow command blocks every other client.

Decide first what role Redis plays. A **cache** may lose data. A **queue** or
**session store** may not. Configure differently for each, and never mix roles in
one instance.

---
</purpose>

# Keys and memory

<rules>
Every key needs a TTL unless you can state why it must live forever.

```
namespace:entity:id:field        →  session:user:8fd2:data
```

A flat, prefixed namespace makes it possible to reason about, measure, and expire
whole classes of key. Untracked keys with no TTL are how an instance reaches
`maxmemory` at 3am.

```
maxmemory 4gb
maxmemory-policy allkeys-lru        # cache role
maxmemory-policy noeviction         # queue / session role — fail writes, don't drop data
```

| Policy | Use for |
| --- | --- |
| `allkeys-lru` | Pure cache — anything may be dropped |
| `volatile-lru` | Mixed, where only TTL'd keys are droppable |
| `noeviction` | Queues, locks, sessions — losing a key is a correctness bug |

**Never** run a queue or session store on `allkeys-lru`. Redis will evict a job or
a live session under memory pressure and report nothing.

**Never** run `KEYS *` against production. It is O(N) and blocks the single
command thread for the duration. Use `SCAN` with a cursor.

---
</rules>

# Atomicity

<rules>
Redis executes each command atomically, but a read-then-write in application code
is not atomic.

```js
// Race — two clients both read 5, both write 6
const n = await redis.get(k);
await redis.set(k, Number(n) + 1);

// Atomic
await redis.incr(k);
```

For anything multi-step, use a Lua script — it runs as a single atomic unit:

```lua
-- Release a lock only if we still own it. Compare-and-delete must be atomic;
-- a GET-then-DEL can delete a lock that expired and was re-acquired by another
-- client in between.
if redis.call("GET", KEYS[1]) == ARGV[1] then
  return redis.call("DEL", KEYS[1])
end
return 0
```

`MULTI`/`EXEC` batches commands but permits no logic between them. Use `WATCH`
for optimistic concurrency, or Lua when you need branching.

---
</rules>

# Distributed locks

<rules>
```js
// Acquire: atomic set-if-absent with an expiry and a unique owner token
const token = crypto.randomUUID();
const ok = await redis.set(key, token, { NX: true, PX: 30_000 });
```

Three requirements, all mandatory:

1. **`NX`** — set only if absent, in one command. A separate `EXISTS` check races.
2. **`PX`** — always an expiry. A lock without one survives a crashed holder forever.
3. **A unique token** — released via the compare-and-delete Lua script above.

**Never** release a lock with a bare `DEL`. If your work outran the TTL, the lock
is now held by someone else and you have just released theirs.

A single-instance Redis lock is not safe across failover — the lock lives only in
memory on the primary and is lost on election. For correctness-critical mutual
exclusion, use the database (`SELECT … FOR UPDATE`, or a unique constraint), not
Redis. Redis locks are appropriate for reducing duplicate work, not for
preventing double-spend.

---
</rules>

# Caching patterns

<rules>
Cache-aside is the default: read cache, miss → read source → write cache with TTL.

```js
const hit = await redis.get(k);
if (hit) return JSON.parse(hit);
const fresh = await loadFromDb();
await redis.set(k, JSON.stringify(fresh), { EX: 300 });
return fresh;
```

Two failure modes worth designing against:

- **Stampede.** A hot key expires and a thousand requests hit the database at
  once. Fix with a short lock around the recompute, or jittered TTLs
  (`EX: 300 + random(60)`).
- **Stale after write.** Invalidate on write; do not rely on TTL alone for data
  the user just changed and expects to see.

Every cache needs a stated invalidation mechanism before it is added.
→ `Performance/caching`

---
</rules>

# Persistence

<rules>
| Mode | Guarantee |
| --- | --- |
| None | Everything lost on restart |
| RDB snapshot | Lose everything since the last snapshot |
| AOF `everysec` | Lose at most one second |
| AOF `always` | No loss, significant throughput cost |

A cache needs no persistence. A queue needs AOF at minimum — and if losing a job
is genuinely unacceptable, it belongs in a durable broker or a database table,
not in Redis. Be explicit about which you have chosen.

---
</rules>

# Anti-patterns

<antipatterns>
| Anti-pattern | Why it fails | Fix |
| --- | --- | --- |
| `KEYS *` in production | O(N), blocks the single thread | `SCAN` |
| No TTL on cache keys | Memory grows to `maxmemory`, then evicts randomly | TTL on every cache key |
| `allkeys-lru` on a queue | Jobs silently evicted | `noeviction` for durable roles |
| Cache and queue in one instance | One eviction policy cannot serve both | Separate instances |
| GET-then-SET counter | Lost updates under concurrency | `INCR` |
| Lock without `PX` | Crashed holder deadlocks the system | Always set an expiry |
| Lock released with `DEL` | Releases someone else's lock after TTL expiry | Compare-and-delete in Lua |
| Redis lock for financial correctness | Lost on failover | Database lock or constraint |
| Uniform TTLs on hot keys | Synchronised stampede | Jitter the TTL |
| Large values (multi-MB) | Blocks the thread on transfer | Keep values small; paginate |
| Big `MGET`/pipeline of 100k keys | One slow command stalls all clients | Chunk the batch |

---
</antipatterns>

# Checklist

<checklist>
- [ ] The role of each instance (cache / queue / session) is explicit
- [ ] `maxmemory` and an appropriate `maxmemory-policy` are set for that role
- [ ] Durable roles run `noeviction`, never `allkeys-lru`
- [ ] Every cache key carries a TTL, with jitter on hot keys
- [ ] Keys follow a documented namespace convention
- [ ] `KEYS` is not used in application or operational code
- [ ] Read-modify-write sequences use atomic commands or Lua
- [ ] Locks use `SET NX PX` with a unique token
- [ ] Lock release is a compare-and-delete Lua script
- [ ] Correctness-critical exclusion uses the database, not Redis
- [ ] Persistence mode matches the durability the role requires
- [ ] Cache invalidation on write is implemented, not just TTL expiry
</checklist>
