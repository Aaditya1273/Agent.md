---
targetModels:
  - "Claude Fable 5"
  - "Claude Opus 5"
  - "Claude Sonnet 5"
  - "Claude 5 Family"
  - "Future Claude Models"
name: queues
category: Backend
description: Message queues that do not lose or duplicate work — acknowledgement, idempotent consumers, retries with backoff, dead-letter queues, and ordering.
license: MIT
author: Agent.md maintainers
last-verified: 2026-08-23
reviewed-by: unreviewed
---
<!-- Generated from models/_canonical by scripts/build-model-variants.js.
     Edit the canonical source, not this file. Structure adapted for Claude per deep-research.md. -->
# Purpose

<purpose>
Rules for producing and consuming messages. A queue decouples a slow or unreliable
operation from a request, and in exchange hands you a distributed-systems problem:
at-least-once delivery, no ordering guarantees across partitions, and failures
that happen after the work but before the acknowledgement.

Design for the two facts that are always true:

- **Every message may be delivered more than once.**
- **Every message may arrive out of order.**

---
</purpose>

# Acknowledge after the work, not before

<rules>
```ts
// Wrong — a crash after ack loses the job silently
await ack(msg);
await process(msg);

// Right — a crash before ack redelivers it
await process(msg);
await ack(msg);
```

This is why duplicates exist, and it is the correct trade: at-least-once with
idempotent consumers is achievable; exactly-once is not, across a network.

Set the acknowledgement deadline (`visibilityTimeout`, `ackDeadline`,
`lockDuration`) above the p99 processing time, and **extend it** for long jobs
rather than setting a very large default — a large default means a crashed
consumer's message is invisible for that long.

---
</rules>

# Consumers must be idempotent

<rules>
Deduplicate on a **business** key, not a delivery id.

```sql
-- The unique constraint is the guarantee; the check is the nice error.
INSERT INTO processed_messages (idempotency_key, processed_at)
VALUES ($1, now())
ON CONFLICT (idempotency_key) DO NOTHING
RETURNING id;                     -- no row returned means already processed
```

Better still, make the effect itself idempotent — `UPDATE orders SET status =
'shipped' WHERE id = $1 AND status = 'paid'` is safe to run twice by construction.

Where the handler both writes to the database and enqueues another message, use
the **transactional outbox**: write the message to a table inside the same
transaction as the state change, and publish from that table asynchronously.
Otherwise the two can diverge — the row commits and the publish fails, or the
reverse. → `Database/transactions`

---
</rules>

# Retries and dead letters

<rules>
| Aspect | Rule |
| --- | --- |
| Backoff | Exponential with **jitter** — fixed intervals synchronise a herd |
| Attempts | Bounded (5–10), then dead-letter |
| Retryable | Timeouts, `5xx`, connection failures, deadlocks |
| Not retryable | Malformed payload, validation failure, permanent `4xx` |
| Poison message | Dead-letter immediately; do not retry a message that cannot parse |
| DLQ | Every queue has one. A queue without a DLQ discards failures |

A **dead-letter queue with no alert and no replay tool is a data-loss bucket.**
Alert on DLQ depth greater than zero, and provide a way to inspect, fix and replay
messages. Every system eventually needs to reprocess a window.

Distinguish the failure classes: retrying a message that will never parse burns
your retry budget and delays healthy work behind it.

---
</rules>

# Ordering

<rules>
Most queues guarantee ordering only within a partition or group key, and only when
a single consumer processes that key at a time.

- If order matters, use an ordering key (`MessageGroupId`, Kafka partition key,
  RabbitMQ single active consumer) — and accept that it caps parallelism for that
  key.
- Better: make handlers **order-independent**. Include a version or `updated_at`
  in the payload and discard messages older than the state you already hold.
- Best for entity updates: treat the message as a **notification** and re-read
  current state from the source. Ordering stops mattering entirely.

**Never** assume that publishing A then B means A is processed first. With
multiple consumers, it usually is not.

---
</rules>

# Payloads

<rules>
- **Small.** Send an id and a version, not a 2 MB document. Large payloads hit
  broker limits and become stale between publish and consume.
- Where the body is genuinely large, use the **claim-check pattern**: store the
  blob in object storage and send its key.
- **Versioned and additive.** Consumers deploy at different times to producers, so
  a new required field breaks in-flight messages. Add optional fields; never
  repurpose an existing one.
- Include `messageId`, `idempotencyKey`, `occurredAt`, `traceparent` and a schema
  version in every message.
- Propagate trace context so a job links back to the request that created it.
  → `Backend/monitoring`

---
</rules>

# Operations

<rules>
Monitor these four; the first two are the ones that matter:

| Metric | Meaning |
| --- | --- |
| **Oldest message age** | The real measure of whether consumers are keeping up |
| **DLQ depth** | Any non-zero value needs a human |
| Queue depth | Useful, but a growing depth with low age is just a burst |
| Processing duration by job type | Where the time goes |

```ts
// BullMQ: bounded concurrency, backoff with jitter, and a real ack window
new Worker("orders", handler, {
  connection,
  concurrency: 8,                       // ≤ free slots in the database pool
  lockDuration: 60_000,                 // > p99 handler duration
  limiter: { max: 100, duration: 1000 },
});
await queue.add("send-receipt", { orderId }, {
  jobId: `receipt:${orderId}`,          // deduplication key
  attempts: 6,
  backoff: { type: "exponential", delay: 2000 },
  removeOnComplete: { age: 86_400, count: 10_000 },
});
```

| Broker | Ack window setting | DLQ mechanism |
| --- | --- | --- |
| SQS | `VisibilityTimeout`, `ChangeMessageVisibility` | `RedrivePolicy` → DLQ, plus redrive-back |
| RabbitMQ | `consumer_timeout`, manual `basic_ack` | Dead-letter exchange (`x-dead-letter-exchange`) |
| Kafka | `max.poll.interval.ms`, offset commit | Retry topics plus a `.DLT` topic |
| Google Pub/Sub | `ackDeadlineSeconds`, `modifyAckDeadline` | `deadLetterPolicy` with `maxDeliveryAttempts` |
| BullMQ / Redis | `lockDuration`, `stalledInterval` | Failed set with `attempts` exhausted |
| SNS/SQS fan-out | Per-subscription queue | Per-queue DLQ |

- Bound consumer concurrency, especially where the handler touches the database —
  a queue is very good at exhausting a connection pool. → `Database/postgres`
- Handle shutdown gracefully: stop fetching, finish in-flight messages, then exit.
  A `SIGKILL` mid-handler relies on redelivery to avoid losing work.
- Separate queues by priority and by workload shape. One slow job type must not
  block a fast one behind it.
- Rate-limit calls to external services from consumers; a backlog draining at full
  speed will exceed a partner's rate limit instantly.

---
</rules>

# Anti-patterns

<antipatterns>
| Anti-pattern | Why it fails | Fix |
| --- | --- | --- |
| Acknowledging before processing | Crash loses the job silently | Ack after success |
| Assuming exactly-once delivery | Duplicates are guaranteed | Idempotent consumers |
| No deduplication key | Repeated side effects | Business idempotency key |
| Write and publish outside a transaction | State and messages diverge | Transactional outbox |
| Retrying unparseable messages | Burns budget; blocks healthy work | Dead-letter immediately |
| Fixed-interval retries | Synchronised thundering herd | Exponential backoff with jitter |
| No dead-letter queue | Failures vanish | DLQ on every queue |
| DLQ without alerting or replay | Silent data loss | Alert on depth; build replay |
| Assuming global ordering | Untrue with multiple consumers | Ordering key, or order-independent handlers |
| Large payloads | Broker limits; stale data | Send ids; claim-check for blobs |
| Breaking payload changes | In-flight messages fail on deploy | Additive, versioned schemas |
| Unbounded consumer concurrency | Exhausts the database pool | Explicit concurrency limits |
| Monitoring depth but not age | A backlog can hide behind a steady depth | Alert on oldest-message age |
| No graceful shutdown | In-flight work relies on redelivery | Drain before exit |
| One queue for every job type | Slow jobs block fast ones | Separate by priority and shape |

---
</antipatterns>

# Checklist

<checklist>
- [ ] Messages are acknowledged only after successful processing
- [ ] Acknowledgement deadlines exceed p99 processing time, extended for long jobs
- [ ] Every consumer is idempotent, keyed on a business identifier
- [ ] State changes and message publication share a transaction via an outbox
- [ ] Retries use exponential backoff with jitter and a bounded attempt count
- [ ] Retryable and non-retryable failures are distinguished
- [ ] Every queue has a dead-letter queue
- [ ] DLQ depth alerts, and a replay path exists
- [ ] Ordering requirements are explicit; handlers are order-independent by default
- [ ] Payloads are small, versioned and additively evolved
- [ ] Every message carries id, idempotency key, timestamp, schema version and trace context
- [ ] Consumer concurrency is bounded against downstream capacity
- [ ] Oldest-message age is monitored and alerted on
- [ ] Consumers shut down gracefully, draining in-flight work
- [ ] Queues are separated by priority and workload shape
</checklist>
