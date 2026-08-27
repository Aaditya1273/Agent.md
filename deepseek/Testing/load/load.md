---
targetModels:
  - "DeepSeek V4"
  - "DeepSeek V3.2"
  - "DeepSeek R1"
  - "DeepSeek V3 Family"
  - "Future DeepSeek Models"
name: load
category: Testing
description: Load testing that predicts production behaviour — modelling real traffic, measuring percentiles not averages, and finding the knee before users do.
license: MIT
author: Agent.md maintainers
last-verified: 2026-08-23
reviewed-by: unreviewed
---
<!-- Generated from models/_canonical by scripts/build-model-variants.js.
     Edit the canonical source, not this file. Structure adapted for DeepSeek per deep-research.md. -->


# Purpose

Rules for testing how a system behaves under load: capacity, latency under
pressure, and the point at which it degrades.

The governing principle: **a load test is only useful if its traffic resembles
real traffic.** Hammering one cached endpoint measures your CDN. Real load has a
mix of endpoints, realistic think time, cache misses, and a working set larger
than memory.

---

# Test types — pick the question first

| Type | Question | Shape |
| --- | --- | --- |
| **Smoke** | Does it work at all under minimal load? | 1–5 users, short |
| **Load** | Does it meet its target at expected traffic? | Expected peak, sustained |
| **Stress** | Where does it break, and how? | Ramp until failure |
| **Soak** | Does it survive hours? | Moderate load, 4–24 h |
| **Spike** | Does it survive a sudden surge? | Instant 10× then drop |
| **Breakpoint** | What is the maximum capacity? | Gradual ramp to saturation |

Soak tests find what nothing else does: memory leaks, connection-pool exhaustion,
disks filling with logs, and token caches that never evict.

---

# Measure percentiles, never averages

An average hides the users having a bad time. If 95% of requests take 50ms and 5%
take 8s, the average is 450ms — a number describing nobody's experience.

| Metric | Report |
| --- | --- |
| Latency | `p50`, `p95`, `p99`, `max` — never the mean alone |
| Throughput | Requests/sec **completed**, not attempted |
| Errors | Rate by status class, separated from timeouts |
| Saturation | CPU, memory, connection pool, queue depth, IO wait |

```js
// k6 — assert on percentiles and fail the run when they regress
export const options = {
  stages: [
    { duration: "2m", target: 100 },   // ramp
    { duration: "5m", target: 100 },   // sustain — this is where you measure
    { duration: "2m", target: 0 },     // ramp down
  ],
  thresholds: {
    http_req_duration: ["p(95)<500", "p(99)<1500"],
    http_req_failed: ["rate<0.01"],
    checks: ["rate>0.99"],
  },
};
```

**Never** report only the numbers from the ramp phase. Measure during the
sustained plateau, after caches and pools have warmed.

---

# Making the load realistic

- **Model the endpoint mix** from production logs. If 70% of real traffic is a
  read and 5% is checkout, the test should reflect that.
- **Include think time.** Users pause between actions; removing it produces a
  benchmark of your loop, not of your service.
- **Vary the data.** Requesting the same record repeatedly measures cache hit
  rate. Use a realistic key distribution — often a long tail with hot spots.
- **Match data volume.** A query that is fast against 1,000 rows may table-scan
  against 10 million. Load-test against production-scale data or the result is
  meaningless.
- **Do not skip authentication.** Token issuance and session lookup are real work
  and often the first thing to saturate.
- Ramp gradually. An instant jump to full load tests your autoscaler's cold start
  rather than steady-state capacity.

---

# Tooling

| Tool | Notes |
| --- | --- |
| `k6` | JavaScript scenarios, good thresholds, CI-friendly |
| `gatling` | Scala/Java DSL, strong reporting |
| `locust` | Python, easy to model complex user journeys |
| `vegeta` | Constant-rate HTTP, excellent for latency histograms |
| `wrk2` | Corrects coordinated omission — matters for accurate tails |
| `artillery` | YAML scenarios, quick to start |

Be aware of **coordinated omission**: a generator that waits for a slow response
before issuing the next request under-reports the tail, sometimes by an order of
magnitude. `wrk2` and `vegeta` model an open workload — a fixed arrival rate
regardless of response time — which is what real traffic does. Prefer them when
the tail is the thing you care about.

```bash
# Open-workload generator: a fixed arrival rate, immune to coordinated omission.
echo "GET https://api.example.com/invoices" \
  | vegeta attack -rate=500/s -duration=5m -header "Authorization: Bearer $TOKEN" \
  | vegeta report -type='hist[0,10ms,50ms,100ms,500ms,1s,5s]'
```

```sql
-- Find what actually hurt during the run, ordered by total time not call count.
SELECT calls, mean_exec_time, max_exec_time, query
FROM pg_stat_statements
ORDER BY total_exec_time DESC
LIMIT 10;
```

Server-side, pair the run with `pg_stat_statements`, `EXPLAIN ANALYZE` on the
slowest queries, and traces from OpenTelemetry so client latency maps to a span.

# Where the bottleneck usually is

In order of frequency:

1. **Database connections.** The pool (`max` in `pg.Pool`, `maximumPoolSize` in
   HikariCP) is smaller than the concurrency. Requests queue invisibly; latency
   climbs while CPU stays low — the classic signature. Watch `pg_stat_activity`
   for sessions in `idle in transaction`.
2. **N+1 queries.** Invisible at 10 users, fatal at 1,000. → `Performance/queries`
3. **Missing index.** Sequential scan on a table that outgrew memory.
4. **External calls without timeouts.** One slow dependency exhausts every worker.
   Set `connectTimeout`, `requestTimeout` and a circuit breaker; an unbounded
   `fetch` is a queue with no limit.
5. **Synchronous work in the request path** — image processing, PDF generation,
   email — that belongs in a queue.
6. **Lock contention** on a hot row or a global mutex — visible as `pg_locks`
   waits or a rising `p99` with flat throughput.

Saturation signals worth graphing alongside latency: `cpu`, `rss`,
`event_loop_lag`, `active_connections`, `queue_depth`, `gc_pause`.

Instrument the system under test before running. A load test that only produces
client-side numbers tells you *that* it slowed down, never *where*.

---

# Environment

- Test against an environment **shaped like production** — same instance classes,
  same database tier, same replica count. Results from a half-size staging
  environment do not scale linearly.
- Generate load from **outside** the target network so the path includes the load
  balancer, TLS termination and any proxy.
- Run the generator on enough machines that **it** is not the bottleneck. A client
  pinned at 100% CPU reports the client's limits as the server's.
- **Never** load-test production without explicit agreement, a documented blast
  radius, and a kill switch. If you do, mark synthetic traffic so it can be
  excluded from analytics and billing.

---

# Anti-patterns

| Anti-pattern | Why it fails | Fix |
| --- | --- | --- |
| Reporting the mean | Hides the tail where users suffer | `p95`, `p99`, `max` |
| One endpoint, one record | Measures cache, not the system | Realistic mix and key spread |
| No think time | Benchmarks your loop | Model real pacing |
| Tiny dataset | Queries behave differently at scale | Production-scale data |
| Measuring during ramp | Cold caches and pools skew results | Measure the plateau |
| Undersized load generator | Client limit reported as server limit | Distribute; watch client CPU |
| Half-size staging | Does not scale linearly | Production-shaped environment |
| No server-side instrumentation | You learn *that*, never *where* | Trace and metric the target |
| Skipping authentication | Omits real work that saturates first | Include the full flow |
| Load-testing production unannounced | Real outage, polluted analytics | Agreement, blast radius, kill switch |

---

# Checklist

- [ ] The question is chosen first — load, stress, soak, spike or breakpoint
- [ ] Endpoint mix and pacing are derived from production traffic
- [ ] Test data volume matches production scale
- [ ] Authentication is part of the tested flow
- [ ] Results report `p50`, `p95`, `p99` and `max`, never the mean alone
- [ ] Measurements come from the sustained plateau, not the ramp
- [ ] Throughput counts completed requests; errors separate timeouts
- [ ] Saturation metrics include connection pool and queue depth
- [ ] The load generator is verified not to be the bottleneck
- [ ] The environment is production-shaped and load arrives over the real path
- [ ] Thresholds are asserted so a regression fails the run
- [ ] Production tests, if any, are agreed, bounded and reversible
