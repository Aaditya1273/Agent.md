---
targetModels:
  - "Gemini 3.6 Flash"
  - "Gemini 3.5 Flash"
  - "Gemini 3.1 Pro"
  - "Gemini 3 Family"
  - "Future Gemini Models"
name: memory
category: Performance
description: Finding and fixing memory problems — leaks versus growth, heap snapshots, streaming instead of buffering, and sizing a runtime inside a container.
license: MIT
author: Agent.md maintainers
last-verified: 2026-08-23
reviewed-by: unreviewed
---
<!-- Generated from models/_canonical by scripts/build-model-variants.js.
     Edit the canonical source, not this file. Structure adapted for Gemini per deep-research.md. -->


# Purpose

Rules for memory: keeping usage bounded, diagnosing growth, and configuring a
runtime so the platform's limits and the runtime's limits agree.

Distinguish two problems that look identical on a graph:

- **A leak** — memory that is referenced but never used again. Grows without
  bound, ends in an OOM kill.
- **Growth** — legitimately more data in memory than the container has. Fixed by
  streaming, paginating or sizing, not by finding a bug.

Confusing them wastes days. The distinguishing signal: after load stops, does
usage return to baseline? If yes, it is growth; if no, it is a leak.

---

# Bound everything that can grow

Almost every leak in application code is one of these:

| Pattern | Why it grows | Fix |
| --- | --- | --- |
| Module-scope `Map`/array cache | Keys added, never removed | Bounded LRU with a max size |
| Event listener not removed | The handler retains its whole closure | Remove on teardown |
| `setInterval` never cleared | Keeps the timer and its closure alive | `clearInterval` |
| Unbounded queue or buffer | Producer outpaces consumer | Backpressure and a cap |
| Request-scoped data on a module object | One entry per request, forever | Async context |
| Closures capturing large objects | The whole object is retained for one field | Extract the field |
| Global error/metric accumulator | One entry per occurrence | Aggregate, do not accumulate |

```ts
// Unbounded — one entry per unique key, forever
const cache = new Map<string, User>();

// Bounded — eviction is the point
import { LRUCache } from "lru-cache";
const cache = new LRUCache<string, User>({ max: 5_000, ttl: 60_000 });
```

A cache without a `max` or a TTL is a leak with a friendly name. And in a
multi-instance deployment an in-process cache is per-instance anyway — usually it
should be Redis. → `Performance/caching`

---

# Stream instead of buffering

```ts
// Buffers the entire file into memory. Works in testing, OOMs on a real upload.
const data = await fs.promises.readFile(path);
res.send(data);

// Constant memory regardless of size; `pipeline` also cleans up on error
await pipeline(fs.createReadStream(path), res);
```

The same rule applies everywhere size is caller-controlled:

- **Database result sets** — cursor or paginate; `SELECT *` with no `LIMIT` on a
  growing table is a scheduled OOM. → `Performance/queries`
- **HTTP request bodies** — set a size limit (`express.json({ limit: "100kb" })`),
  and a decompressed-size cap so a small gzip cannot expand to gigabytes.
- **CSV and export generation** — stream rows out; do not build the whole document
  in memory.
- **JSON parsing** — `JSON.parse` on a multi-megabyte payload allocates several
  times the payload size **and** blocks the event loop. → `Backend/node`

Backpressure exists for this. Ignoring `write()`'s return value lets a fast
producer fill memory until the process dies.

---

# Diagnose with snapshots, not guesses

```bash
node --inspect dist/server.js      # then Chrome DevTools → Memory
```

The method:

1. Take a heap snapshot at steady state.
2. Apply load.
3. Force a GC, wait for it to settle, take a second snapshot.
4. **Compare** — look at objects allocated between the two and still retained.
5. Follow the **retainer path** of the largest surviving group. That path names
   the bug.

The retainer path is the whole answer: it shows exactly which reference is keeping
the object alive. Reading allocation counts without it tells you what is big, not
what is wrong.

Distinguish growth from a leak first, with the question above: does usage return
to baseline after load stops?

Container memory is not process memory. `container_memory_working_set_bytes`
includes page cache and off-heap allocations; a process whose heap is flat can
still be OOM-killed by native buffers or a memory-mapped file.

---

# Configure the runtime against the container limit

The runtime does not read cgroup limits by default. It sizes its heap from **host**
memory, then gets killed.

```dockerfile
ENV NODE_OPTIONS="--max-old-space-size=768"     # container limit 1Gi, ~75%
```

| Runtime | Setting |
| --- | --- |
| Node | `--max-old-space-size` (MB) |
| JVM | `-XX:MaxRAMPercentage=75` |
| Python | No heap limit; control via worker count and batch size |
| Go | `GOMEMLIMIT` |

Leave headroom: the heap limit is not the process's total footprint. Native
buffers, the runtime itself, and page cache all live outside it.

Set the container memory **limit equal to the request** so the pod gets
`Guaranteed` QoS and is evicted last. Memory is incompressible — exceeding a limit
is an immediate kill, not a slowdown. → `DevOps/kubernetes`

Watch `container_memory_working_set_bytes` against `spec.containers.resources.limits.memory`,
and `nodejs_heap_size_used_bytes` against `--max-old-space-size`. A gap that grows
between the two means the leak is off-heap — a native buffer, not JavaScript.

Alert on the trend, not the threshold: memory rising steadily across a week with
no traffic increase is a leak, and it is visible long before the first OOM.

---

# Anti-patterns

| Anti-pattern | Why it fails | Fix |
| --- | --- | --- |
| Unbounded in-process cache | Grows until OOM | Bounded LRU with TTL |
| In-process cache in a multi-instance service | Per-instance and unbounded | Shared cache |
| Listeners and intervals never cleaned up | Closures retained forever | Teardown on unmount/shutdown |
| Request data on a module-scope object | One entry per request, forever | Async context |
| Reading files or responses fully into memory | OOM at production sizes | Stream with `pipeline` |
| No request body size limit | Trivial memory-exhaustion attack | Framework limit |
| No decompressed-size cap | Zip-bomb expansion | Ratio and absolute limits |
| Unpaginated result sets | Cost grows with the table | Cursor or paginate |
| Ignoring stream backpressure | Fast producer fills memory | Respect `write()` / use `pipeline` |
| Guessing at the leak | Days spent on the wrong object | Snapshot diff and retainer path |
| Reading allocation counts alone | Shows what is big, not what leaks | Follow retainers |
| Confusing growth with a leak | Wrong fix entirely | Check recovery after load |
| Heap sized from host memory | OOM-killed under the container limit | Set it below the limit |
| No headroom above the heap limit | Native allocations trigger the kill | Size to ~75% |
| Memory limit above request | `Burstable` QoS; evicted earlier | Limit equals request |
| Alerting only on a threshold | The leak is visible days earlier | Alert on the trend |

---

# Checklist

- [ ] Verify: Every in-process cache has a maximum size and a TTL
- [ ] Verify: Shared caches are used instead of per-instance ones where appropriate
- [ ] Verify: Listeners, intervals and subscriptions are removed on teardown
- [ ] Verify: No request-scoped data is stored on module-scope objects
- [ ] Verify: Files, uploads and large responses are streamed, not buffered
- [ ] Verify: Request body size and decompressed size are capped
- [ ] Verify: Database result sets are paginated or cursored
- [ ] Verify: Exports and reports stream rather than building in memory
- [ ] Verify: Stream backpressure is respected
- [ ] Verify: Leaks are diagnosed by snapshot comparison and retainer paths
- [ ] Verify: Growth and leaks are distinguished by recovery after load stops
- [ ] Verify: Container-level memory metrics are monitored, not only heap size
- [ ] Verify: The runtime heap is sized below the container limit with headroom
- [ ] Verify: Container memory limit equals the request
- [ ] Verify: Memory trend is alerted on, not just a threshold
