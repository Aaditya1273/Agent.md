---
targetModels:
  - "Claude Fable 5"
  - "Claude Opus 5"
  - "Claude Sonnet 5"
  - "Claude 5 Family"
  - "Future Claude Models"
name: monitoring
category: Backend
description: Metrics, traces and alerts for a backend service — the four golden signals, SLOs and error budgets, cardinality control, and alerts that mean act now.
license: MIT
author: Agent.md maintainers
last-verified: 2026-08-23
reviewed-by: unreviewed
---
<!-- Generated from models/_canonical by scripts/build-model-variants.js.
     Edit the canonical source, not this file. Structure adapted for Claude per deep-research.md. -->
# Purpose

<purpose>
Rules for instrumenting a service so that you can tell whether it is healthy, and
find out why when it is not.

Two different questions, two different tools:

- **Is it broken?** Metrics and alerts. Low cardinality, cheap, always on.
- **Why is it broken?** Traces and logs. High cardinality, expensive, sampled.

Instrumenting for the first and hoping it answers the second is the most common
mistake. → `Backend/logging`

---
</purpose>

# Measure the four golden signals

<rules>
| Signal | Metric | Alert on |
| --- | --- | --- |
| Latency | Histogram of request duration by route and status | p99 breaching the SLO |
| Traffic | Requests per second by route | Sudden absence — a dead service reports zero errors |
| Errors | `5xx` rate as a fraction of total | Ratio, never absolute count |
| Saturation | CPU, memory, connection pool, queue depth | Approaching a hard limit |

```ts
const httpDuration = new Histogram({
  name: "http_request_duration_seconds",
  help: "Request duration",
  labelNames: ["method", "route", "status"],   // route TEMPLATE, bounded set
  buckets: [0.01, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10],
});
```

**Measure a histogram, not an average.** An average hides the tail entirely: a
p50 of 40 ms and a p99 of 9 s average out to something that looks fine while 1% of
users cannot use the product.

Buckets must be chosen for your SLO — you cannot compute a p99 accurately if all
your data lands in one bucket.

Saturation is the leading indicator. A database connection pool at 95% utilisation
is an outage in a few minutes; latency has not moved yet.

---
</rules>

# Control cardinality

<rules>
A time series exists for every unique label combination. Cardinality is
multiplicative, and it is what makes monitoring bills explode and queries time out.

```ts
// 1 series per route — correct
{ route: "/orders/:id" }

// 1 series per order — millions of series, and the collector falls over
{ route: `/orders/${id}` }
```

**Never** use as a metric label: user id, order id, email, session id, full URL
path, raw error message, or a timestamp. Those are log fields and trace
attributes, where high cardinality is the point.

Keep total series per service in the thousands, not millions. Audit label sets in
review — a new label multiplies every existing series.

---
</rules>

# Instrument what the business cares about

<rules>
Infrastructure metrics tell you a host is unhealthy. Business metrics tell you the
product is broken, which is the thing users notice.

- `payments_captured_total`, `signups_completed_total`, `orders_created_total`
- Queue depth and oldest-message age per queue → `Backend/queues`
- Job success/failure counts and durations by job type
- Dependency call rate, error rate and latency, per dependency
- Cache hit ratio

A deploy that breaks checkout while every host stays green is a routine outage.
The business metric is what catches it.

---
</rules>

# Traces

<rules>
Distributed tracing is the only practical way to answer "where did the 4 seconds
go" across services.

- Use **OpenTelemetry**. Vendor-neutral, and every backend consumes it.
- Auto-instrument HTTP, database and queue clients; add manual spans for
  significant internal work.
- Propagate W3C `traceparent` across every service and queue boundary — a trace
  that stops at the first hop is nearly useless.
- Put high-cardinality identifiers on **span attributes** (`user.id`, `order.id`),
  which is exactly where they belong.
- Sample **tail-based** where available: keep 100% of errors and slow requests,
  a small fraction of fast successes.
- Record the `trace_id` in logs so the two link.

```ts
// OpenTelemetry: auto-instrument the edges, add spans for real work
const sdk = new NodeSDK({
  resource: resourceFromAttributes({
    [ATTR_SERVICE_NAME]: "orders-api",
    [ATTR_SERVICE_VERSION]: process.env.GIT_SHA,
    [ATTR_DEPLOYMENT_ENVIRONMENT_NAME]: process.env.ENV,
  }),
  traceExporter: new OTLPTraceExporter({ url: process.env.OTEL_EXPORTER_OTLP_ENDPOINT }),
  instrumentations: [getNodeAutoInstrumentations()],
});
sdk.start();

await tracer.startActiveSpan("order.price", async (span) => {
  span.setAttribute("order.id", orderId);        // high cardinality belongs here
  span.setAttribute("tenant.id", tenantId);
  try { return await price(order); }
  catch (err) { span.recordException(err); span.setStatus({ code: SpanStatusCode.ERROR }); throw err; }
  finally { span.end(); }
});
```

| Environment variable | Purpose |
| --- | --- |
| `OTEL_SERVICE_NAME` | Groups every signal under one service |
| `OTEL_EXPORTER_OTLP_ENDPOINT` | Collector address |
| `OTEL_TRACES_SAMPLER` / `_ARG` | `parentbased_traceidratio`, `0.05` |
| `OTEL_RESOURCE_ATTRIBUTES` | `service.version`, `deployment.environment.name` |
| `OTEL_PROPAGATORS` | `tracecontext,baggage` — W3C by default |

---
</rules>

# SLOs and alerts

<rules>
Define the objective before the alert. An alert with no SLO behind it is a
threshold someone guessed.

```yaml
</rules>

# 99.9% of checkout requests succeed within 500ms over 28 days.

# Error budget: 0.1% ≈ 40 minutes per month.

<rules>
```

Alert on **burn rate**, not on instantaneous thresholds:

| Window | Burn rate | Meaning | Route to |
| --- | --- | --- | --- |
| 1h | 14.4× | Budget gone in 2 days | Page |
| 6h | 6× | Budget gone in 5 days | Page |
| 3d | 1× | On track to exhaust | Ticket |

This is what removes the 3am page for a two-minute blip while still catching a
slow burn that a static threshold never trips.

Every paging alert must satisfy all four:

1. A **user is affected** — not a proxy metric.
2. It is **actionable** — there is something the responder can do now.
3. It is **urgent** — it cannot wait until morning.
4. It links to a **runbook** with the first three diagnostic steps.

Anything failing one of these is a ticket or a dashboard, not a page. Review
alerts monthly and delete the ones nobody acted on — an alert nobody trusts makes
every other alert weaker. → `DevOps/monitoring`

---
</rules>

# Health checks

<rules>
Separate the two, because they mean different things to the orchestrator:

- **Liveness** — is the process wedged? Must not check dependencies. A liveness
  check that fails when the database is down makes Kubernetes restart every pod
  during a database incident, turning a degradation into a full outage.
- **Readiness** — can it serve traffic now? May check the database and required
  dependencies, and should fail during startup and graceful shutdown.

---
</rules>

# Anti-patterns

<antipatterns>
| Anti-pattern | Why it fails | Fix |
| --- | --- | --- |
| Averages instead of percentiles | Hides the tail entirely | Histograms, p95/p99 |
| Unbounded metric labels | Cardinality explosion; collector fails | Route templates; ids on spans |
| Alerting on absolute error counts | Meaningless as traffic changes | Alert on ratio |
| Static thresholds | Pages at 3am for a blip; misses slow burns | Multi-window burn rate |
| No traffic-absence alert | A dead service reports zero errors | Alert on unexpected zero |
| Only infrastructure metrics | Green hosts, broken checkout | Business metrics |
| No SLO | Thresholds are guesses | Define objective and budget first |
| Alerts without runbooks | Responder starts from nothing at 3am | Link the first three steps |
| Alerts nobody acts on | Erodes trust in every alert | Monthly review and deletion |
| Liveness probe checking the database | Mass restarts during a dependency outage | Liveness is process-local |
| No trace context propagation | Traces stop at the first hop | W3C `traceparent` everywhere |
| Head-based sampling only | Loses the errors you needed | Tail-based, keep all errors |
| Metrics derived from log lines | Expensive; breaks under sampling | Emit counters directly |
| Dashboards nobody opens | Effort with no consumer | Build from the on-call's questions |

---
</antipatterns>

# Checklist

<checklist>
- [ ] Latency, traffic, errors and saturation are instrumented for every service
- [ ] Latency is a histogram with buckets chosen for the SLO
- [ ] Metric labels are bounded; no ids or raw paths as labels
- [ ] Business-level metrics exist alongside infrastructure metrics
- [ ] Dependency call rate, errors and latency are tracked per dependency
- [ ] Queue depth and oldest-message age are monitored
- [ ] OpenTelemetry traces cover every service, with context propagated
- [ ] High-cardinality identifiers are span attributes, not metric labels
- [ ] Sampling keeps all errors and slow requests
- [ ] Logs carry the `trace_id`
- [ ] An SLO with an explicit error budget is defined for each critical journey
- [ ] Alerts fire on multi-window burn rate, not static thresholds
- [ ] An alert fires on unexpected absence of traffic
- [ ] Every paging alert is user-affecting, actionable, urgent and has a runbook
- [ ] Alerts are reviewed monthly and unused ones deleted
- [ ] Liveness and readiness probes are separate; liveness checks no dependencies
</checklist>
