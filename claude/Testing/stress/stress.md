---
targetModels:
  - "Claude Fable 5"
  - "Claude Opus 5"
  - "Claude Sonnet 5"
  - "Claude 5 Family"
  - "Future Claude Models"
name: stress
category: Testing
description: Pushing a system past its limit deliberately — finding the breaking point, verifying it degrades gracefully, and confirming it recovers.
license: MIT
author: Agent.md maintainers
last-verified: 2026-08-23
reviewed-by: unreviewed
---
<!-- Generated from models/_canonical by scripts/build-model-variants.js.
     Edit the canonical source, not this file. Structure adapted for Claude per deep-research.md. -->
# Purpose

<purpose>
Rules for testing beyond expected capacity. `Testing/load` answers "does it meet
its target". Stress testing answers three different questions:

1. **Where does it break?**
2. **How does it break** — gracefully, or catastrophically?
3. **Does it recover** when the pressure stops?

The third is the one most teams never test, and the one that turns a ten-minute
spike into a two-hour outage.

---
</purpose>

# Ramp to failure

<rules>
```js
// k6 — climb until something gives. No thresholds: failure is the point.
export const options = {
  stages: [
    { duration: "3m", target: 200 },
    { duration: "3m", target: 500 },
    { duration: "3m", target: 1000 },
    { duration: "3m", target: 2000 },
    { duration: "5m", target: 0 },      // the recovery window — do not skip
  ],
};
```

Watch these on the server, not only in the generator: `cpu`, `rss`,
`event_loop_lag`, `pg_stat_activity` connection counts, and `pg_locks` waits.

Record, at each step: `p95` and `p99` latency, error rate by class, throughput,
and saturation (`cpu`, `rss`, `active_connections`, `queue_depth`).

The **knee** is where latency climbs sharply while throughput stops rising. That
is your real capacity — not the point where the system falls over, which is well
past the point users abandoned it.

---
</rules>

# Graceful versus catastrophic

<rules>
| Graceful | Catastrophic |
| --- | --- |
| Latency rises smoothly | Latency stays flat, then everything times out |
| Excess requests get `429` or `503` quickly | Requests queue until every worker is stuck |
| Throughput plateaus | Throughput **collapses** below its peak |
| Errors are bounded and typed | Cascading failures across unrelated services |
| Recovers within seconds of load dropping | Stays down after load stops |

**Throughput collapse** is the signature of congestion. A system doing 1,000 rps
at peak and 200 rps under heavier load is spending its capacity on work nobody is
waiting for any more.

Fixes are architectural, not configuration:

- **Shed load** — reject early with `503` and `Retry-After` rather than queueing.
  → `Security/rate-limiting`
- **Bound every queue.** An unbounded queue converts a throughput problem into a
  memory problem and then a crash.
- **Set timeouts everywhere**, and make them shorter than the caller's. A 30s
  downstream timeout behind a 10s client timeout means 20s of work nobody reads.
- **Circuit-break** a failing dependency so its latency does not become yours.
- **Prioritise** — health checks and payments should survive when search does not.
  Separate pools or a dedicated `readiness` path keeps `/health` answering while
  the main pool is saturated, so the orchestrator does not restart a busy but
  healthy instance.

---

```js
// Bounded queue plus load shedding: reject fast rather than accepting work
// that will time out anyway.
const MAX_QUEUE = 500;

app.use((req, res, next) => {
  if (queue.length >= MAX_QUEUE) {
    res.set("Retry-After", "5");
    return res.status(503).json({ error: "overloaded" });
  }
  next();
});
```

```js
// Backoff with jitter. Without the random term every client retries at the
// same instant and recreates the original load.
const delay = Math.min(30_000, 2 ** attempt * 100);
const jittered = Math.random() * delay;        // full jitter
await setTimeout(jittered);
```

Tooling: `k6` and `vegeta` for volume, `toxiproxy` for injected latency and
partitions, `pumba` or `chaos-mesh` for killing containers, and `stress-ng` for
CPU, memory and IO pressure on a host.
</rules>

# Recovery

<rules>
Testing recovery is what distinguishes a stress test from a load test.

After the load drops to zero, watch for:

- Does latency return to baseline, and **how long** does that take?
- Do queues drain, or keep growing from retries?
- Do connection pools recover, or stay exhausted with `idle in transaction`?
- Does memory return, or did the peak leak?
- Do circuit breakers close again?
- Did any process get OOM-killed and restart into a cold cache — and did the cold
  cache then cause a second failure?

**Retry storms** are the usual reason recovery fails. Every client retrying
simultaneously reproduces the original load exactly when the system is weakest.
Require exponential backoff **with jitter** on every client, and cap total
attempts.

---
</rules>

# Failure injection

<rules>
Stress is not only volume. Test the failure modes you will actually meet:

| Injected | Expected |
| --- | --- |
| Database primary killed | Failover completes; requests error briefly, then recover |
| Dependency latency +5s | Circuit opens; the caller stays responsive |
| One instance killed | Traffic reroutes; no user-visible error |
| Network partition | Bounded, typed failure — not a hang |
| Disk fills | Clear failure and an alert — not silent corruption |
| Cache flushed | Survives the thundering herd on the cold cache |

Start in a staging environment. Only move to production experiments with a
hypothesis, a bounded blast radius, an abort condition, and someone watching.

---
</rules>

# Anti-patterns

<antipatterns>
| Anti-pattern | Why it fails | Fix |
| --- | --- | --- |
| Stopping at the first error | Misses how it breaks and whether it recovers | Ramp past failure, then to zero |
| No recovery window | The most valuable phase is skipped | Always ramp down and observe |
| Unbounded queues | Turns overload into OOM | Bound every queue; shed load |
| Timeouts longer than the caller's | Work completed for nobody | Shorter than the caller's |
| Retries without jitter | Retry storm re-creates the load | Exponential backoff plus jitter |
| Client is the bottleneck | Measures the generator | Distribute; watch client CPU |
| Only volume tested | Real incidents are dependency failures | Inject latency and faults |
| Chaos in production, unannounced | A real outage you caused | Hypothesis, blast radius, abort |
| Ignoring throughput collapse | The signature of congestion | Load shedding |
| Assuming recovery | Cold caches cause a second failure | Measure the return to baseline |

---
</antipatterns>

# Checklist

<checklist>
- [ ] Load ramps past the breaking point, not up to the first error
- [ ] The knee is identified and recorded as real capacity
- [ ] Failure mode is classified as graceful or catastrophic
- [ ] Throughput is checked for collapse, not only latency
- [ ] Every queue is bounded and load shedding returns `503` with `Retry-After`
- [ ] Timeouts are shorter at each layer moving downstream
- [ ] Circuit breakers open and later close under test
- [ ] A recovery window is included and time-to-baseline is measured
- [ ] Client retry logic uses exponential backoff with jitter and an attempt cap
- [ ] Dependency failure and instance loss are injected, not just volume
- [ ] Production experiments have a hypothesis, blast radius and abort condition
</checklist>
