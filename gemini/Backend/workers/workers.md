---
targetModels:
  - "Gemini 3.6 Flash"
  - "Gemini 3.5 Flash"
  - "Gemini 3.1 Pro"
  - "Gemini 3 Family"
  - "Future Gemini Models"
name: workers
category: Backend
description: Worker processes — pool sizing, concurrency against downstream limits, graceful shutdown, isolation, and autoscaling on the right signal.
license: MIT
author: Agent.md maintainers
last-verified: 2026-08-23
reviewed-by: unreviewed
---
<!-- Generated from models/_canonical by scripts/build-model-variants.js.
     Edit the canonical source, not this file. Structure adapted for Gemini per deep-research.md. -->


# Purpose

Rules for the processes that consume queues and run background work. Job design
is `Backend/background-jobs`; queue semantics are `Backend/queues`. This package
covers the runtime: how many workers, how much concurrency, and how they start and
stop.

A worker is different from an API server in one way that drives everything: **it
pulls its own load.** An overloaded API server sheds requests; an overloaded
worker pool keeps pulling until something downstream breaks.

---

# Concurrency is bounded by the narrowest downstream resource

```
worker replicas × per-worker concurrency  ≤  available capacity of the slowest dependency
```

Almost always the database connection pool:

```ts
// 6 replicas × 8 concurrency = 48 concurrent handlers.
// The pool must have ≥ 48 free connections, alongside the API's usage.
new Worker("orders", handler, { connection, concurrency: 8 });
```

| Dependency | Limit to respect |
| --- | --- |
| Database | Pool size, and `max_connections` across all consumers → `Database/postgres` |
| Partner API | Their published rate limit, not your throughput |
| Object storage | Per-prefix request rate |
| CPU-bound work | Physical cores; more concurrency only adds context switching |
| Memory | Peak per handler × concurrency must fit the container limit |

Raising concurrency to clear a backlog usually makes it worse — the pool
saturates, every query slows, and throughput falls. Measure before raising it.

For CPU-bound work in a single-threaded runtime, concurrency does nothing. Use
worker threads or more replicas, and keep the event loop free.

---

# Graceful shutdown is not optional

Every deploy, autoscale-down and node rotation sends `SIGTERM`. Without a handler,
the process dies mid-job and relies on redelivery — which means duplicate work
several times a day.

```ts
let shuttingDown = false;
process.on("SIGTERM", async () => {
  shuttingDown = true;
  await worker.close();          // stop fetching, wait for in-flight handlers
  await db.$disconnect();
  process.exit(0);
});
```

- Stop fetching new work **first**, then drain.
- The platform's grace period must exceed the longest job timeout, or the drain is
  killed halfway: `terminationGracePeriodSeconds` in Kubernetes, `stopTimeout` in
  ECS. → `DevOps/deployment`
- Long-running handlers should check a shutdown flag at checkpoints and stop
  cleanly rather than being cut off.
- After the grace period the runtime sends `SIGKILL`. Design so that is survivable
  — at-least-once redelivery plus idempotent handlers.

---

# Isolate workloads

One pool for everything means the slowest job type sets the latency for all of
them.

| Pool | Characteristics |
| --- | --- |
| Interactive | Emails, notifications — seconds, high volume, low memory |
| Bulk | Exports, imports, reports — minutes, high memory |
| External | Partner API calls — rate-limited, slow, retry-heavy |
| Critical | Payments, provisioning — small, must not queue behind anything |

Separate pools give independent concurrency, independent scaling, independent
failure, and stop a 40-minute export from delaying a password-reset email.

Run **untrusted or customer-supplied code** in a separate, network-restricted,
resource-capped pool. → `Security/command-injection`

---

# Autoscale on the right signal

CPU is the wrong metric for a worker. A worker waiting on I/O has low CPU and a
growing backlog — CPU-based autoscaling scales **down** exactly when it should
scale up.

| Signal | Use |
| --- | --- |
| **Oldest message age** | Best. Directly expresses "are we keeping up?" |
| Queue depth per worker | Good, and simple to reason about |
| CPU | Only for genuinely CPU-bound pools |

```yaml
# KEDA: scale on backlog, with a floor that keeps latency low for a quiet queue
triggers:
  - type: aws-sqs-queue
    metadata: { queueURL: …, queueLength: "20" }
minReplicaCount: 2
maxReplicaCount: 40
```

Cap `maxReplicaCount` at what the database and downstream partners can absorb —
otherwise autoscaling turns a backlog into a downstream outage. Scale down slowly
so a bursty queue does not thrash.

---

# Health, restarts and failure

- **Readiness**: can it reach the broker and the database?
- **Liveness**: is the process wedged? Track a `last_progress_timestamp` updated
  by the handler loop and fail liveness if it stalls beyond a threshold — an
  always-`200` liveness endpoint never detects a stuck worker.
- **Never** check dependencies in liveness. A database blip would restart the
  entire pool mid-job. → `Backend/monitoring`
- Set a memory limit and let the platform restart on OOM rather than degrading.
  Investigate a repeating OOM as a leak or an unbounded batch.
- A crash loop must not silently retry a poison message forever — bound attempts
  and dead-letter it. → `Backend/queues`

---

# Configuration and observability

- Concurrency, pool size, timeouts and rate limits from environment variables, so
  they can be tuned without a code change.
- Validate configuration at startup and refuse to boot on a bad value.
- Emit: `jobs_processed_total` by type and outcome, `job_duration_seconds`,
  `worker_inflight_jobs`, `db_pool_in_use`, and `queue_oldest_message_seconds`
  per queue.
- `db_pool_in_use` sitting at `DB_POOL_SIZE` means every handler is queueing for a
  connection — the symptom looks like a slow database and is actually
  over-concurrency.
- `worker_inflight_jobs` stuck below `WORKER_CONCURRENCY` while a backlog grows
  means the broker fetch is the bottleneck, not the handler.
- Log worker start and stop with the version and configuration in effect — during
  an incident the first question is which build is running.

```bash
WORKER_QUEUES=orders,receipts     # which pools this process serves
WORKER_CONCURRENCY=8              # handlers in flight per process
WORKER_JOB_TIMEOUT_MS=120000      # below the broker ack deadline
WORKER_SHUTDOWN_TIMEOUT_MS=150000 # below terminationGracePeriodSeconds
DB_POOL_SIZE=10                   # ≥ concurrency, with headroom
OTEL_SERVICE_NAME=orders-worker
```

```yaml
# The grace period must exceed the longest job, or the drain is cut off.
spec:
  terminationGracePeriodSeconds: 180
  containers:
    - name: worker
      resources:
        requests: { cpu: "500m", memory: "512Mi" }
        limits:   { memory: "1Gi" }
      livenessProbe:
        exec: { command: ["node", "bin/healthcheck.js", "--stalled-after=300"] }
```

---

# Anti-patterns

| Anti-pattern | Why it fails | Fix |
| --- | --- | --- |
| Concurrency set independently of the pool | Connection exhaustion; every query slows | Size against the narrowest dependency |
| Raising concurrency to clear a backlog | Saturation reduces throughput | Measure; scale replicas instead |
| High concurrency for CPU-bound work | Context switching only | Worker threads or more replicas |
| No `SIGTERM` handler | Jobs cut off on every deploy | Drain then exit |
| Grace period below the job timeout | Drain killed halfway | Grace period exceeds the longest job |
| One pool for all job types | Slow jobs starve fast ones | Separate pools |
| Untrusted code in the main pool | Escapes affect everything | Isolated, restricted pool |
| Autoscaling on CPU | Scales down while the backlog grows | Oldest-message age or depth |
| Unbounded max replicas | Autoscaling causes a downstream outage | Cap at downstream capacity |
| Liveness checking dependencies | Mass restarts during a dependency blip | Process-local liveness |
| Always-`200` liveness | A stuck worker is never restarted | Progress-timestamp check |
| Concurrency hard-coded | Cannot tune without a deploy | Environment configuration |
| No per-queue backlog metric | Backlogs discovered by customers | Alert on oldest-message age |

---

# Checklist

- [ ] Verify: Total concurrency is sized against the narrowest downstream resource
- [ ] Verify: Database pool capacity accounts for both API and worker usage
- [ ] Verify: CPU-bound work uses threads or replicas rather than async concurrency
- [ ] Verify: Peak memory per handler × concurrency fits the container limit
- [ ] Verify: `SIGTERM` stops fetching, drains in-flight work, then exits
- [ ] Verify: The platform grace period exceeds the longest job timeout
- [ ] Verify: Long handlers check a shutdown flag at checkpoints
- [ ] Verify: Handlers are idempotent so a `SIGKILL` is survivable
- [ ] Verify: Workloads are separated into pools by shape and criticality
- [ ] Verify: Untrusted work runs in an isolated, network-restricted pool
- [ ] Verify: Autoscaling uses backlog age or depth, not CPU
- [ ] Verify: Maximum replicas are capped at downstream capacity
- [ ] Verify: Liveness detects a stalled handler loop and checks no dependencies
- [ ] Verify: Memory limits are set and repeated OOMs are investigated
- [ ] Verify: Concurrency and timeouts are environment-configurable and validated at boot
- [ ] Verify: Throughput, duration, in-flight count and backlog age are all emitted
