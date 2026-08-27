---
targetModels:
  - "Gemini 3.6 Flash"
  - "Gemini 3.5 Flash"
  - "Gemini 3.1 Pro"
  - "Gemini 3 Family"
  - "Future Gemini Models"
name: logging
category: Backend
description: Structured logging that is searchable and safe — levels with meaning, correlation ids, redaction, sampling, and what belongs in metrics instead.
license: MIT
author: Agent.md maintainers
last-verified: 2026-08-23
reviewed-by: unreviewed
---
<!-- Generated from models/_canonical by scripts/build-model-variants.js.
     Edit the canonical source, not this file. Structure adapted for Gemini per deep-research.md. -->


# Purpose

Rules for application logging. A log line exists to answer a question during an
incident. If it cannot be found, filtered and correlated, it is noise you are
paying to store.

Logs are one of three signals and the most expensive per unit of insight. Rates
and distributions belong in metrics; causality across services belongs in traces.
→ `Backend/monitoring`

---

# Structured, always

```ts
// Unsearchable — the fields are trapped inside prose
log.info(`Order ${id} for user ${userId} failed after ${ms}ms`);

// Queryable: status:500 AND duration_ms:>1000 AND tenant_id:"acme"
log.info({ event: "order.create.failed", orderId, userId, tenantId,
           durationMs: ms, statusCode: 500 }, "order create failed");
```

JSON to stdout. The runtime collects and ships it — the application does not write
files, rotate them, or know about the log backend. → `DevOps/logging`

Use a real logger (`pino`, `zap`, `slog`, `structlog`, `serilog`), never
`console.log`. Loggers give you levels, child loggers, redaction and low overhead.

Keep field names consistent across every service: `request_id`, `trace_id`,
`user_id`, `tenant_id`, `duration_ms`, `status_code`. A field named three ways
cannot be queried, and a shared schema is what makes cross-service search work.

---

# Levels with a decision attached

| Level | Meaning | Action |
| --- | --- | --- |
| `error` | Unexpected failure; a human should look | Alert |
| `warn` | Degraded but handled — retry succeeded, fallback used | Review in aggregate |
| `info` | A business event worth reconstructing later | None |
| `debug` | Developer detail | Off in production |
| `trace` | Very fine detail | Off, enabled per-request when needed |

The error rate must mean something. An expected `404` or a validation failure is
**not** an `error` — it is a normal outcome, logged at `info`. Logging domain
failures at `error` produces alert fatigue and buries real ones.
→ `Backend/error-handling`

Make the level runtime-configurable per service, so `debug` can be raised during
an incident without a deploy.

---

# Correlation

Every log line carries a request id, and it propagates.

```ts
const id = req.get("x-request-id") ?? crypto.randomUUID();
req.log = log.child({ requestId: id, traceId: trace.getActiveSpan()?.spanContext().traceId });
res.set("x-request-id", id);          // echo it so support tickets carry it
```

- Propagate the id to every downstream call (`x-request-id`, W3C `traceparent`).
- Attach it via async context (`AsyncLocalStorage`, `context.Context`) so it does
  not have to be threaded through every function signature.
- Return it on every response. A customer quoting a request id turns an
  unreproducible report into one log query.
- Include `trace_id` so a log line links to its trace.

---

# Never log secrets or personal data

```ts
const log = pino({
  redact: {
    paths: ["req.headers.authorization", "req.headers.cookie",
            "*.password", "*.token", "*.apiKey", "*.card.number", "*.ssn"],
    censor: "[redacted]",
  },
});
```

**Never** log: passwords (even wrong ones), tokens, API keys, session ids, full
card numbers, CVVs, government identifiers, or full request/response bodies.

- Redact by **allowlist** for anything that carries user data. A denylist misses
  the field somebody added last week.
- Never log an entire object with a spread — `log.info({ user })` will include
  every field the model gains in future.
- Personal data in logs inherits retention and erasure obligations. Log a user
  **id**, not a name and email.
- A leaked credential in a log is a leaked credential: log storage is widely
  readable, replicated and backed up. Treat it as a disclosure and rotate.
  → `Security/secret-management`

---

# Log the right events

Log at **boundaries and decisions**, not inside loops.

Worth logging:

- One request-completion line per request: method, route (the **template**, not
  the interpolated path), status, duration, request id, actor.
- Outbound dependency calls: target, status, duration, retry count.
- State transitions with business meaning: `payment.captured`, `order.shipped`.
- Security events: authentication failure, authorization denial, rate-limit
  breach, privilege change. → `Security/audit-log`
- Background job start/finish with the outcome and duration.

Not worth logging: entry and exit of every function, "starting…" without a
matching "finished", raw payloads, anything already captured as a metric.

Use the route template (`/orders/:id`) as the field value. Interpolated paths make
grouping and cardinality control impossible.

---

# Cost and volume

Logs are the largest observability bill in most systems and the growth is
superlinear with traffic.

- **Sample** high-volume success paths (keep 1–10% of healthy `2xx` request lines,
  keep 100% of errors). Record the sampling rate in the line so counts can be
  reconstructed.
- Never derive a metric by counting log lines — it is expensive and breaks the
  moment sampling changes. Emit a counter. → `Backend/monitoring`
- Set retention by value: 7–30 days hot for debugging, longer and cheaper for
  audit and compliance.
- Keep cardinality out of field values that get indexed — a raw user id is fine to
  log, but not as a metric label.

---

# Anti-patterns

| Anti-pattern | Why it fails | Fix |
| --- | --- | --- |
| String-interpolated messages | Fields cannot be queried | Structured fields |
| `console.log` | No levels, no redaction, poor performance | A real logger |
| Inconsistent field names | Cross-service queries impossible | Shared field schema |
| Expected failures at `error` | Alert fatigue; real errors buried | `info`/`warn` for domain outcomes |
| No request id | Cannot follow one request | Correlation id, propagated and echoed |
| Threading the logger through every call | Noisy signatures; gets dropped | Async context |
| Logging full request bodies | Credentials and PII in log storage | Allowlist redaction |
| Logging whole objects | New sensitive fields leak automatically | Explicit fields |
| Denylist redaction | Misses the newest field | Allowlist |
| Interpolated paths as the route field | Unbounded grouping keys | Route template |
| Logging inside loops | Volume explosion, no added insight | Log at boundaries |
| Counting log lines as a metric | Expensive; breaks under sampling | Emit counters |
| No sampling on high-volume paths | Dominant cost driver | Sample success, keep all errors |
| Application writing and rotating files | Duplicates platform responsibility | stdout |
| Fixed log level requiring a deploy | Cannot debug during an incident | Runtime-configurable level |

---

# Checklist

- [ ] Verify: All logs are structured JSON written to stdout
- [ ] Verify: A real logging library is used, configured with redaction
- [ ] Verify: Field names follow one schema across all services
- [ ] Verify: Levels carry a decision; expected failures are not `error`
- [ ] Verify: Log level is runtime-configurable without a deploy
- [ ] Verify: Every line carries a request id and, where present, a trace id
- [ ] Verify: The request id propagates downstream and is echoed to the client
- [ ] Verify: Correlation context is carried in async context, not parameters
- [ ] Verify: No secrets, tokens, credentials or full bodies are ever logged
- [ ] Verify: Personal data is limited to identifiers, with retention defined
- [ ] Verify: Redaction is allowlist-based and covers headers and nested fields
- [ ] Verify: One completion line per request, using the route template
- [ ] Verify: Security-relevant events are logged with actor, target and source
- [ ] Verify: High-volume success paths are sampled; errors are never sampled out
- [ ] Verify: Metrics are emitted as counters, not derived from log lines
- [ ] Verify: Retention is set per log class and matches its actual value
