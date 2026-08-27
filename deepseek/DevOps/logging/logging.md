---
targetModels:
  - "DeepSeek V4"
  - "DeepSeek V3.2"
  - "DeepSeek R1"
  - "DeepSeek V3 Family"
  - "Future DeepSeek Models"
name: logging
category: DevOps
description: Log infrastructure — collection from stdout, structured pipelines, retention tiers, PII handling, and controlling the largest observability bill.
license: MIT
author: Agent.md maintainers
last-verified: 2026-08-23
reviewed-by: unreviewed
---
<!-- Generated from models/_canonical by scripts/build-model-variants.js.
     Edit the canonical source, not this file. Structure adapted for DeepSeek per deep-research.md. -->


# Purpose

Rules for the logging **platform**: how logs get from a process to somewhere
searchable, how long they are kept, and what they cost. What an application should
write is `Backend/logging`.

Logs are usually the largest observability line item and the one that grows
fastest. Most of these rules are about keeping them useful and affordable at the
same time.

---

# Applications write to stdout; the platform does the rest

```
process → stdout (JSON) → collector (Vector / Fluent Bit / OTel) → store → query
```

An application that opens log files, rotates them, or ships them directly is doing
the platform's job badly:

- File logging in a container writes to the ephemeral layer and disappears on
  restart — exactly when you need it.
- Unrotated files fill the disk, which takes the service down.
- A direct-to-backend shipper couples the application to a vendor and blocks on
  the network during an outage.

Write JSON to stdout, one object per line, and let the collector attach
`pod`, `namespace`, `node`, `service` and `version` metadata.

Handle multi-line output (stack traces) at the collector — a Java trace arriving
as forty separate lines is unsearchable. Most runtimes can emit the trace inside
one JSON field instead, which is better.

---

# Structure at the source, not with regex later

A collector-side regex parsing unstructured text is fragile, expensive, and breaks
the moment a message changes.

If a legacy system emits plain text you cannot change, parse it once at the
collector, keep the parser in version control, and test it. Otherwise: JSON at the
source.

```toml
# Vector: parse once, redact, drop noise, then route by class.
[transforms.parse]
type = "remap"
inputs = ["kubernetes_logs"]
source = '''
  . = parse_json!(.message)
  .service = .service || %kubernetes.pod_labels."app.kubernetes.io/name"
  del(.headers.authorization)
  del(.password)
'''

[transforms.drop_noise]
type = "filter"
inputs = ["parse"]
condition = '!match(string!(.http.path), r'''^/(healthz|readyz|metrics)$''')'
```

Enforce a **shared field schema** across services:

| Field | Purpose |
| --- | --- |
| `timestamp` | RFC 3339 UTC, from the application |
| `level` | `error`/`warn`/`info`/`debug` |
| `service`, `version`, `env` | Attribution |
| `request_id`, `trace_id` | Correlation → `Backend/monitoring` |
| `message` | Human-readable summary |
| `error.type`, `error.stack` | Structured error detail |

A field named three ways cannot be queried across services, which defeats the
purpose of centralising logs at all.

---

# Retention by value, not one policy for everything

| Class | Hot | Archive | Driver |
| --- | --- | --- | --- |
| Application debug | 3–7 days | none | Debugging is recent |
| Application info | 14–30 days | 90 days | Incident investigation |
| Access logs | 30 days | 1 year | Security investigation |
| Audit logs | 90 days hot | **7 years** | Compliance → `Security/audit-log` |
| Build/CI logs | 30 days | none | |

- Hot storage is indexed and expensive; archive is object storage and cheap.
- Audit logs are a separate stream with a separate lifecycle, **write-once** where
  possible. Never mix them with application logs whose retention is days.
- Deletion obligations apply: a GDPR erasure request covers logs containing
  personal data, which is the strongest argument for logging identifiers only.

---

# Control the cost

Logging bills grow with traffic **and** with verbosity, and both grow silently.

- **Sample** high-volume success paths — keep 1–10% of healthy `2xx` request lines,
  100% of errors. Record the sampling rate so counts can be reconstructed.
- Drop known-worthless lines at the collector: health-check requests, static asset
  hits, framework startup noise.
- **Never derive a metric by counting log lines.** It is expensive and breaks the
  moment sampling changes. Emit a counter.
- Make log level runtime-configurable per service, so `debug` can be raised during
  an incident and lowered afterwards — a permanently-`debug` service is usually the
  single largest cost line.
- Alert on log volume per service. A logging loop shipped on a Friday is otherwise
  discovered on the invoice.

---

# Access, PII and integrity

- Log storage is a **sensitive data store**. Access-control it, and audit reads —
  it frequently contains more personal data than the database does.
- Redact at the collector as a **second** line of defence; the application must
  redact first. Collector-side redaction alone means the secret already crossed the
  network. → `Security/secret-management`
- A credential in a log is a disclosed credential: log storage is replicated,
  backed up and widely readable. Rotate it.
- Audit logs need integrity: append-only, hash-chained or WORM storage, so a
  compromised account cannot erase its own trail.
- Ship logs off the host promptly, and cap the local buffer so a backend outage
  cannot fill the node disk:

```yaml
# Fluent Bit: bounded on-disk buffering, so a downstream outage degrades
# logging rather than taking the node down with a full filesystem.
[SERVICE]
    storage.path              /var/log/flb-storage/
    storage.max_chunks_up     128
[OUTPUT]
    Name                      opensearch
    storage.total_limit_size  2G
    Retry_Limit               5
```

 Logs that only exist on a node are lost with
  the node — which is common in exactly the incidents you most want to investigate.

---

# Anti-patterns

| Anti-pattern | Why it fails | Fix |
| --- | --- | --- |
| Application writing log files | Lost on restart; fills the disk | stdout plus a collector |
| Application shipping directly to a vendor | Coupling; blocks during outages | Collector layer |
| Unstructured text parsed by regex | Fragile, expensive, breaks on message changes | JSON at the source |
| Inconsistent field names | Cross-service queries impossible | Shared schema |
| Multi-line traces as separate lines | Unsearchable | Collector multi-line, or JSON field |
| One retention policy for everything | Pays hot rates for archive data | Tiered by class |
| Audit logs mixed with application logs | Compliance data deleted in days | Separate stream and lifecycle |
| No sampling on high-volume paths | The dominant cost driver | Sample success, keep errors |
| Sampling errors | Loses what you needed | Never sample errors out |
| Counting log lines as a metric | Expensive; breaks under sampling | Emit counters |
| Permanently `debug` in production | Enormous volume for no benefit | Runtime-configurable level |
| No volume alerting | A logging loop found on the invoice | Alert per service |
| Unrestricted log access | Often more PII than the database | Access control and read audit |
| Redaction only at the collector | The secret already crossed the network | Redact at the source too |
| Mutable audit logs | A compromised account erases its trail | Append-only or WORM |
| Logs only on the node | Lost with the node, during the incident | Ship promptly |

---

# Checklist

- [ ] Applications write structured JSON to stdout and nothing else
- [ ] A collector attaches environment, service and version metadata
- [ ] Multi-line stack traces arrive as a single record
- [ ] All services share one field schema
- [ ] Every record carries service, version, environment and correlation ids
- [ ] Retention is tiered by log class, hot and archive separated
- [ ] Audit logs are a separate stream with their own long retention
- [ ] High-volume success paths are sampled; errors never are
- [ ] Sampling rates are recorded in the records
- [ ] Worthless lines are dropped at the collector
- [ ] Metrics are emitted as counters, not derived from log lines
- [ ] Log level is runtime-configurable per service
- [ ] Log volume per service is monitored and alerted on
- [ ] Log storage is access-controlled and reads are audited
- [ ] Redaction happens at the source and again at the collector
- [ ] Audit logs are append-only or stored in WORM storage
- [ ] Logs are shipped off the host promptly
