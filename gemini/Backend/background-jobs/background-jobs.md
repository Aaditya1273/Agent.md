---
targetModels:
  - "Gemini 3.6 Flash"
  - "Gemini 3.5 Flash"
  - "Gemini 3.1 Pro"
  - "Gemini 3 Family"
  - "Future Gemini Models"
name: background-jobs
category: Backend
description: Running work outside the request — job design, scheduling, idempotency, timeouts, observability, and the failure modes of cron in a distributed system.
license: MIT
author: Agent.md maintainers
last-verified: 2026-08-23
reviewed-by: unreviewed
---
<!-- Generated from models/_canonical by scripts/build-model-variants.js.
     Edit the canonical source, not this file. Structure adapted for Gemini per deep-research.md. -->


# Purpose

Rules for work that happens outside an HTTP request: emails, exports, imports,
webhooks, nightly reconciliation, cleanup. Transport mechanics are
`Backend/queues`; this package is about designing the jobs themselves.

Move work into a job when it is slow, retryable, or must survive the caller
disconnecting. Keep it in the request when the user needs the result now.

---

# Enqueue after commit

```ts
// Broken — the job may run before (or without) the transaction committing.
// The worker reads a row that does not exist yet.
await db.$transaction(async (tx) => {
  const order = await tx.order.create({ data });
  await queue.add("send-receipt", { orderId: order.id });   // ← wrong
});

// Correct — write the intent inside the transaction, publish after it commits
await db.$transaction(async (tx) => {
  const order = await tx.order.create({ data });
  await tx.outbox.create({ data: { type: "send-receipt", payload: { orderId: order.id } } });
});
```

The race is real and intermittent: with a fast worker, the job starts before the
commit lands. Use a transactional outbox, or enqueue strictly after the
transaction returns and accept that a crash in between loses the job.
→ `Database/transactions`

**Pass identifiers, not objects.** A serialised entity in a payload is stale by
the time the worker runs, and it grows without bound as the model grows.

---

# Design of a job

| Property | Rule |
| --- | --- |
| Idempotent | It **will** run twice. Guard with a business key or a conditional update |
| Small | One unit of work. Fan out rather than one job that processes 100,000 rows |
| Bounded | An explicit timeout; a job with no timeout hangs a worker forever |
| Resumable | Checkpoint progress so a retry does not restart from zero |
| Independent | Do not depend on another job having run first |

```ts
// Fan-out: the parent job enqueues children and finishes fast.
// One failure retries one item, not the whole batch.
for (const id of await findDueSubscriptionIds({ limit: 10_000 })) {
  await queue.add("renew-subscription", { id }, { jobId: `renew:${id}:${period}` });
}
```

The deterministic `jobId` is the deduplication: enqueuing the same renewal twice
for the same period is a no-op.

**Never** write a job that processes an unbounded set in one execution. It will
eventually exceed every timeout you have, and a failure at 90% loses all of it.

---

# Scheduling

Cron in a distributed system has three failure modes that a single server does not:

1. **Multiple instances run it.** N replicas means N executions. Use the
   scheduler's own leader election, a distributed lock with a TTL, or a platform
   scheduler that guarantees a single invocation.
2. **A missed window is silent.** If the scheduler was down at 02:00, nothing
   reports that the job never ran. Alert on **absence of a successful run**, not
   only on failure.
3. **Overlap.** A run that takes longer than the interval collides with the next.
   Configure non-overlapping execution explicitly.

Other rules:

- Schedule in **UTC**. A cron in local time runs twice or zero times on
  daylight-saving transitions.
- **Jitter** schedules across tenants and instances. Every job at `0 0 * * *`
  creates a thundering herd at midnight.
- Prefer event-driven work to polling. Where you must poll, poll a marker
  (`WHERE processed_at IS NULL`), not the whole table.

| Scheduler | Single-execution guarantee | Notes |
| --- | --- | --- |
| Kubernetes `CronJob` | `concurrencyPolicy: Forbid` | Set `startingDeadlineSeconds`; `successfulJobsHistoryLimit` for auditing |
| AWS `EventBridge Scheduler` | Yes, per invocation | `FlexibleTimeWindow` gives free jitter |
| `pg_cron` | Yes — runs on the primary only | Job and data share a failure domain |
| BullMQ `repeatable` jobs | Yes, via Redis-held schedule | Needs `removeOnComplete` or the key set grows |
| Quartz / Sidekiq-cron | Via a database lock | Verify the lock has a TTL |
| In-process `node-cron` | **No** — one run per replica | Only safe on a single instance |

An in-process cron in a horizontally scaled deployment is the most common version
of this bug: it works in staging on one replica and triple-charges customers in
production on three.

---

# Timeouts, resources and failure

- Set a timeout per job type, and make it shorter than the acknowledgement
  deadline so a hung job is reclaimed rather than run twice concurrently.
- Bound worker concurrency against the **narrowest** downstream resource — usually
  the database connection pool, sometimes a partner's rate limit.
- Cap memory: a job that loads a whole table into memory works in staging and OOMs
  in production. Stream and paginate.
- Isolate workloads. Long exports and quick emails on the same worker pool means
  the export starves the email.
- On repeated failure, dead-letter with the full context needed to diagnose it,
  and alert. → `Backend/queues`

---

# Observability

A job that fails silently is worse than no job — the system appears to work.

Emit for every job: type, id, outcome, duration, attempt number, and the trace
context of the request that created it.

| Alert | Condition |
| --- | --- |
| Job failure rate | Above the type's normal baseline |
| Oldest pending job age | Above the SLO for that job type |
| Scheduled job absence | No successful run in the expected window |
| Duration p99 | Trending toward the timeout |
| DLQ depth | Greater than zero |

Log at start and completion with the same job id so a run can be reconstructed,
and propagate `traceparent` from the enqueuing request.

```ts
const jobDuration = new Histogram({
  name: "job_duration_seconds",
  labelNames: ["job_type", "outcome"],          // bounded label set
  buckets: [0.1, 0.5, 1, 5, 15, 60, 300],
});
const jobAttempts = new Counter({ name: "job_attempts_total", labelNames: ["job_type", "outcome"] });
const oldestPending = new Gauge({ name: "job_oldest_pending_seconds", labelNames: ["job_type"] });
```

```yaml
# Alert on a scheduled job that never ran — failure alerts cannot catch absence.
- alert: NightlyReconciliationMissing
  expr: |
    time() - max(job_last_success_timestamp_seconds{job_type="reconcile"}) > 93600
  for: 15m
  annotations:
    runbook: https://runbooks.example.com/reconcile-missing
```

→ `Backend/monitoring`

---

# Operating

- **Deploys** must drain: stop accepting new jobs, finish in-flight work with a
  bounded timeout, then exit. Workers being `SIGKILL`ed mid-job relies on
  redelivery every single deploy.
- **Version compatibility**: workers and producers deploy at different times, so a
  worker must tolerate both the old and new payload shape during the rollout.
- Keep a **manual replay and cancel** path. Every system eventually needs to
  re-run yesterday's failed batch or stop a runaway job.
- Retain job history long enough to answer "did this customer's export run?" —
  usually 7–30 days. In BullMQ that is `removeOnComplete: { age }`; in Sidekiq it
  is the `dead_max_jobs` and `dead_timeout_in_seconds` settings. Unbounded history
  is a slow memory leak in the broker.

| Runtime concern | Setting to check |
| --- | --- |
| Drain on shutdown | `worker.close()` on `SIGTERM`, before process exit |
| Grace period | `terminationGracePeriodSeconds` must exceed the longest job timeout |
| Memory ceiling | Container `resources.limits.memory`, plus `--max-old-space-size` |
| Stuck-job reclaim | `stalledInterval`, `maxStalledCount` |
| Backpressure | `limiter.max` per second against the slowest dependency |

---

# Anti-patterns

| Anti-pattern | Why it fails | Fix |
| --- | --- | --- |
| Enqueuing inside a transaction | Worker reads uncommitted state | Outbox, or enqueue after commit |
| Serialised objects in the payload | Stale data; unbounded growth | Pass identifiers |
| Non-idempotent jobs | Retries duplicate side effects | Business key or conditional update |
| One job processing everything | Exceeds timeouts; failure loses all progress | Fan out, checkpoint |
| No per-job timeout | A hung job holds a worker forever | Explicit timeout |
| Cron without leader election | Runs once per replica | Distributed lock or platform scheduler |
| Alerting only on failure | A job that never ran is silent | Alert on missing success |
| Local-time schedules | Runs twice or zero times on DST | UTC |
| Unjittered schedules | Midnight thundering herd | Spread with jitter |
| Polling whole tables | Cost grows with total rows | Marker column with an index |
| Unbounded worker concurrency | Exhausts the connection pool | Limit to downstream capacity |
| Loading a table into memory | OOM at production scale | Stream and paginate |
| Shared pool for fast and slow jobs | Slow work starves fast work | Separate pools |
| No drain on deploy | Every deploy interrupts jobs | Graceful shutdown |
| Payload changed without compatibility | In-flight jobs break during rollout | Tolerate both shapes |
| No replay or cancel | Failures become manual database work | Build the tooling |

---

# Checklist

- [ ] Verify: Jobs are enqueued after commit, or via a transactional outbox
- [ ] Verify: Payloads carry identifiers and a schema version, not serialised entities
- [ ] Verify: Every job is idempotent under repeated execution
- [ ] Verify: Large workloads fan out into small, independently retryable jobs
- [ ] Verify: Long jobs checkpoint progress so retries resume
- [ ] Verify: Every job type has an explicit timeout below the ack deadline
- [ ] Verify: Scheduled jobs run once across all replicas
- [ ] Verify: Schedules are in UTC, jittered, and non-overlapping
- [ ] Verify: Absence of a successful scheduled run raises an alert
- [ ] Verify: Worker concurrency is bounded by the narrowest downstream resource
- [ ] Verify: Memory use is bounded; large datasets are streamed
- [ ] Verify: Fast and slow workloads run on separate pools
- [ ] Verify: Job type, outcome, duration and attempt are emitted as metrics
- [ ] Verify: Trace context propagates from the enqueuing request
- [ ] Verify: Workers drain gracefully on deploy
- [ ] Verify: Workers tolerate both payload versions during a rollout
- [ ] Verify: A manual replay and cancel path exists
