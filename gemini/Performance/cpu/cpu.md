---
targetModels:
  - "Gemini 3.6 Flash"
  - "Gemini 3.5 Flash"
  - "Gemini 3.1 Pro"
  - "Gemini 3 Family"
  - "Future Gemini Models"
name: cpu
category: Performance
description: CPU-bound work — profiling with flame graphs, algorithmic complexity, keeping event loops free, parallelism, and knowing when CPU is not the problem.
license: MIT
author: Agent.md maintainers
last-verified: 2026-08-23
reviewed-by: unreviewed
---
<!-- Generated from models/_canonical by scripts/build-model-variants.js.
     Edit the canonical source, not this file. Structure adapted for Gemini per deep-research.md. -->


# Purpose

Rules for CPU-bound performance. The first rule is a filter: **most web-service
latency is waiting, not computing.** Before optimising CPU, confirm it is actually
the constraint.

| Observation | Meaning |
| --- | --- |
| CPU near saturation, latency high | Genuinely CPU-bound — this package applies |
| CPU low, latency high | Waiting: I/O, locks, pool, dependency → `Performance/database` |
| CPU low, throughput capped | Concurrency limit or a serialisation point |
| CPU spiky with flat load | GC, a cron job, or a compaction |
| High `system` CPU, low `user` | Syscalls, context switching, or throttling |

---

# Profile with a flame graph

```bash
npx 0x -- node dist/server.js              # Node
py-spy record -o profile.svg -- python app.py
go tool pprof -http=: http://localhost:6060/debug/pprof/profile?seconds=30
java -jar async-profiler.jar -e cpu -d 30 -f flame.html <pid>
```

Read it as: **width is total time**, stacked bars are call depth. A wide plateau is
where the time goes; a tall thin spike is deep but cheap.

Two distinctions that change the diagnosis:

- **Self time versus total time.** A function with high total but low self time is
  not the problem; its callee is.
- **On-CPU versus off-CPU.** A standard profiler samples running threads only.
  Time spent blocked on a lock or I/O does not appear at all — which is why a
  flat-looking profile with high latency means you are looking at the wrong tool.
  Use tracing for wall-clock time. → `Backend/monitoring`

Profile under **realistic load and data**. A profile taken on ten rows shows
startup cost; a profile on production-shaped data shows the algorithm.

---

# Complexity beats constants

| Change | Typical gain |
| --- | --- |
| O(n²) → O(n) with a hash lookup | 100–10,000× at scale |
| Repeated work → computed once | 10–100× |
| Interpreted hot loop → native/SIMD library | 5–50× |
| Micro-optimising a tight loop | 1.1–2× |

```ts
// O(n × m) — nested scan, fine at 100 rows, quadratic at 100,000
const enriched = orders.map(o => ({ ...o, customer: customers.find(c => c.id === o.customerId) }));

// O(n + m) — build an index once
const byId = new Map(customers.map(c => [c.id, c]));
const enriched = orders.map(o => ({ ...o, customer: byId.get(o.customerId) }));
```

Look for these first, in order:

1. A `find`/`includes`/`indexOf` inside a loop — always a hash lookup instead.
2. Repeated computation of an invariant inside a loop — hoist it.
3. Re-parsing or re-compiling per call — a regex literal recompiled each
   invocation, a schema rebuilt per request. Build once at module scope.
4. Sorting inside a loop, or sorting when a single pass would do.
5. Deep copies (`structuredClone`, `JSON.parse(JSON.stringify(x))`) of large
   objects on a hot path.

Also cheap and frequently significant: **serialisation**. `JSON.stringify` of a
large response is real CPU time on the main thread, and it grows with payload
size — another reason to project only the fields you need.
→ `Performance/queries`

---

# Do not block a single-threaded runtime

In Node, one thread serves every request. A synchronous 200 ms operation adds
200 ms to **every** concurrent request, not just its own.

```ts
// Blocks the event loop for every concurrent request
const hash = crypto.pbkdf2Sync(pw, salt, 600_000, 32, "sha512");

// Off the event loop, onto the threadpool
const hash = await promisify(crypto.pbkdf2)(pw, salt, 600_000, 32, "sha512");
```

Common blockers: synchronous crypto, `JSON.parse` of megabyte payloads,
`readFileSync` in a handler, large sorts, `zlib` sync variants, and a regex with
catastrophic backtracking — which is also a denial-of-service vector, since input
controls the runtime.

Monitor event-loop delay (`perf_hooks.monitorEventLoopDelay`); a p99 above ~50 ms
means something is blocking. → `Backend/node`

For genuinely CPU-heavy work: `worker_threads`, a separate service, or a queue.
Adding async concurrency to a blocked event loop does nothing.

---

# Parallelism, and its limits

- Independent work runs concurrently: `Promise.all`, goroutines, a thread pool.
  Bound the fan-out — unbounded parallelism exhausts pools and adds context
  switching. → `Backend/workers`
- **Amdahl's law**: the serial fraction bounds the speedup. Work that is 10%
  serial cannot exceed 10× no matter how many cores. Find and shrink the serial
  part before adding cores.
- Adding cores to a lock-contended workload makes it **slower** — more threads,
  more contention.
- In containers, a CPU limit throttles the process even when the node is idle,
  which appears as unexplained p99 latency. Prefer requests without limits for
  latency-sensitive services. → `DevOps/kubernetes`

Check throttling explicitly before concluding you need more CPU:
`container_cpu_cfs_throttled_seconds_total` rising means the limit is the
constraint, not the code. `nproc` inside the container also does not reflect the
CPU limit, so runtimes that size thread pools from it (`GOMAXPROCS`,
`UV_THREADPOOL_SIZE`, JVM parallel GC threads) over-allocate and thrash — set them
explicitly.

Scaling out is a legitimate answer once the code is efficient — but it pays rent
forever, so establish the algorithm is not quadratic first.

---

# Anti-patterns

| Anti-pattern | Why it fails | Fix |
| --- | --- | --- |
| Optimising CPU when the service is I/O-bound | No gain; the wait is elsewhere | Confirm saturation first |
| Guessing at the hot path | Usually wrong | Flame graph |
| Profiling on toy data | Shows startup, not the algorithm | Realistic load and volume |
| Reading total time as self time | Blames the caller | Check self time |
| CPU profiler on a blocking problem | Off-CPU time is invisible | Trace wall-clock time |
| Micro-optimising first | Constant factors on the wrong code | Fix complexity |
| `find` inside a loop | Quadratic at scale | Build a `Map` |
| Recompiling regexes or schemas per call | Repeated setup cost | Hoist to module scope |
| Deep-cloning large objects on hot paths | Allocation and copy cost | Structural sharing |
| Synchronous crypto or I/O in a handler | Blocks every concurrent request | Async variants |
| Regex with catastrophic backtracking | Unbounded CPU; a DoS vector | Bounded patterns, timeouts |
| Async concurrency for CPU-bound work | The thread is still one thread | Worker threads |
| Unbounded parallel fan-out | Pool exhaustion, context switching | Bound it |
| Adding cores to contended code | Contention increases | Reduce the serial fraction |
| CPU limits on latency-sensitive services | Throttled on an idle node | Requests without limits |
| Scaling out to hide an O(n²) | Pays rent forever | Fix the algorithm |

---

# Checklist

- [ ] Verify: CPU is confirmed as the constraint before optimising it
- [ ] Verify: A flame graph identifies the hot path under realistic load and data
- [ ] Verify: Self time is distinguished from total time
- [ ] Verify: Off-CPU waiting is measured with tracing, not a CPU profiler
- [ ] Verify: Nested scans are replaced with hash lookups
- [ ] Verify: Invariant work is hoisted out of loops
- [ ] Verify: Regexes, schemas and compiled artefacts are built once at module scope
- [ ] Verify: Large deep copies are avoided on hot paths
- [ ] Verify: Response payloads are projected to reduce serialisation cost
- [ ] Verify: No synchronous crypto, file or compression call runs in a request path
- [ ] Verify: Regex patterns are checked for catastrophic backtracking
- [ ] Verify: Event-loop delay is monitored
- [ ] Verify: CPU-heavy work runs in worker threads, a separate service, or a queue
- [ ] Verify: Parallel fan-out is bounded
- [ ] Verify: The serial fraction is understood before adding cores
- [ ] Verify: CPU limits are omitted for latency-sensitive containers
- [ ] Verify: Scaling out follows algorithmic fixes rather than replacing them
