---
targetModels:
  - "DeepSeek V4"
  - "DeepSeek V3.2"
  - "DeepSeek R1"
  - "DeepSeek V3 Family"
  - "Future DeepSeek Models"
name: optimization
category: Performance
description: A method for making software faster — measure, profile, find the bottleneck, change the complexity not the constant, and prove the improvement.
license: MIT
author: Agent.md maintainers
last-verified: 2026-08-23
reviewed-by: unreviewed
---
<!-- Generated from models/_canonical by scripts/build-model-variants.js.
     Edit the canonical source, not this file. Structure adapted for DeepSeek per deep-research.md. -->


# Purpose

The method that applies to every performance problem, regardless of layer. The
specific techniques live in the other Performance packages; this is how to decide
which one you need.

The failure this prevents: spending a week on a 40 KB bundle saving while the p99
is dominated by a 3-second unindexed query.

---

# The loop

```
1. Define the target      "checkout p95 under 800ms, from 2.4s"
2. Measure the baseline   in production, at p95/p99, not p50
3. Profile               find where the time actually goes
4. Change ONE thing      the biggest contributor
5. Measure again         same conditions, same percentile
6. Keep or revert        no measured gain → revert
```

Never skip step 3. Intuition about where time goes is unreliable even for people
who do this daily, because the bottleneck is usually somewhere nobody was
thinking about: connection pool wait, DNS, a serialisation step, a lock.

Never do step 4 twice at once. Two simultaneous changes give you one number and no
attribution.

---

# Measure at the right percentile, in the right place

| Statistic | Hides |
| --- | --- |
| Mean | Everything. A p50 of 40 ms with a p99 of 9 s averages out fine |
| p50 | The 1% of users who cannot use the product |
| **p95 / p99** | Little — this is what to target |
| p99.9 | Useful for fan-out services, where one request touches many backends |

- **Field data over lab data.** A local run on a fast machine with a warm cache
  and 200 rows does not resemble production.
- Segment by device class, connection, region and tenant. An aggregate p95 hides a
  region or a large customer having a completely different experience.
- Set a **budget**, not a vague goal: `checkout_p95 < 800ms` is testable and can
  be enforced in CI. "Make it faster" cannot.

In fan-out systems, remember that a p99 in a dependency becomes a p50 for a
request that calls it a hundred times.

---

# Profile before optimising

| Layer | Tool |
| --- | --- |
| Database | `EXPLAIN (ANALYZE, BUFFERS)`, `pg_stat_statements`, `pg_stat_activity` → `Performance/queries` |
| Backend CPU | Sampling profiler, flame graph (`0x`, `pprof`, `py-spy`, `async-profiler`) |
| Backend latency | Distributed tracing → `Backend/monitoring` |
| Frontend | DevTools Performance panel, React Profiler, `web-vitals` → `Performance/rendering` |
| Network | Waterfall, `Server-Timing` headers → `Performance/network` |
| Memory | Heap snapshot, allocation timeline, `--inspect` → `Performance/memory` |
| Event loop | `perf_hooks.monitorEventLoopDelay` → `Backend/node` |
| Queues | `queue_oldest_message_seconds` → `Backend/queues` |

A flame graph answers "where is CPU time" in seconds. A trace answers "where is
wall-clock time" — and for most web services the answer is **waiting**, not
computing: waiting on a query, a lock, a connection, or a dependency.

If CPU is flat while latency is high, you are queueing somewhere. Look at pool
utilisation and lock waits before touching any code.

```bash
# Where is the time? Three commands that answer it faster than reading code.
psql -c "SELECT calls, round(total_exec_time) ms, query
         FROM pg_stat_statements ORDER BY total_exec_time DESC LIMIT 10;"

npx 0x -- node dist/server.js        # flame graph of CPU time
curl -w '@curl-format.txt' -o /dev/null -s "$URL"   # DNS/TCP/TLS/TTFB breakdown
```

```
# Server-Timing makes the breakdown visible in browser devtools for every request
Server-Timing: db;dur=412;desc="14 queries", render;dur=38, cache;desc="miss"
```

---

# Change complexity, not constants

Ranked by typical payoff:

| Change | Effect |
| --- | --- |
| **Do it not at all** — remove the work | Unbeatable |
| **Do it once** — cache, memoise, batch | Often 10–100× |
| **Do it in parallel** — concurrent independent calls | Up to the slowest |
| **Do it later** — background job, defer, lazy-load | Removes it from the critical path |
| **Do it faster** — better algorithm or index | 10–1000× when complexity changes |
| **Do it on better hardware** | 2–3×, and pays rent forever |

Micro-optimisation belongs last and usually never. Replacing an O(n²) scan with a
hash lookup beats every constant-factor tweak combined, and an N+1 fixed by a join
beats making a hundred fast queries slightly faster.
→ `Database/query-optimization`

Common single-fix wins, in the order they usually appear:

1. N+1 queries — one request issuing hundreds.
2. A missing index — a sequential scan on a large table.
3. Serial awaits on independent work.
4. Unbounded result sets — no `LIMIT`, no pagination.
5. Work in a request that belongs in a job.

---

# Prove it, then keep it

- Re-measure under the **same** conditions. A "50% improvement" measured at a
  different time of day is noise.
- No measured improvement means **revert**. Complexity added for an unproven gain
  is a permanent cost.
- Add a regression guard: a `size-limit` budget, a query-count assertion, a `k6`
  threshold in CI. Performance gains erode silently otherwise.
  → `Testing/performance`
- Record what you changed and what it bought, in the pull request. The next person
  needs to know what has already been tried.

Optimisation trades away simplicity. Keep the readable version until it is
demonstrably too slow, and comment the fast version with what it replaced and why.

---

# Anti-patterns

| Anti-pattern | Why it fails | Fix |
| --- | --- | --- |
| Optimising without measuring | Effort on the wrong thing | Profile first |
| Optimising the mean | The tail is the user experience | Target p95/p99 |
| Local benchmarks only | Wrong data, wrong hardware, warm cache | Production field data |
| Aggregate metrics only | Hides a region, device class or tenant | Segment |
| Several changes at once | No attribution | One at a time |
| Micro-optimisation first | Constant factors on the wrong code | Change complexity |
| Caching before indexing | Hides the problem until the cache misses | Fix the query |
| Assuming CPU is the bottleneck | Most web latency is waiting | Trace wall-clock time |
| Ignoring pool and lock waits | Looks like a slow query; is not | Check saturation first |
| No re-measurement | The change may have done nothing | Same conditions, same percentile |
| Keeping unproven optimisations | Permanent complexity, no benefit | Revert |
| No regression guard | Gains erode silently | Budgets and assertions in CI |
| Vague goals | Cannot tell when you are done | Numeric budget per journey |
| Scaling hardware to hide a bug | Pays rent forever | Fix the cause |

---

# Checklist

- [ ] A numeric performance target exists per critical journey
- [ ] The baseline is measured in production at p95/p99
- [ ] Metrics are segmented by device, connection, region and tenant
- [ ] The bottleneck is identified by profiling or tracing, not by intuition
- [ ] Saturation (pools, locks, queues) is ruled out before optimising code
- [ ] One change is made at a time
- [ ] Complexity-level changes are preferred over constant-factor tuning
- [ ] N+1 queries, missing indexes and serial awaits are checked first
- [ ] The change is re-measured under identical conditions
- [ ] Changes without a measured gain are reverted
- [ ] A regression guard is added in CI for each fixed problem
- [ ] The change and its measured effect are recorded in the pull request
- [ ] Non-obvious optimised code carries a comment explaining what it replaced
