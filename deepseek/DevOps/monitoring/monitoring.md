---
targetModels:
  - "DeepSeek V4"
  - "DeepSeek V3.2"
  - "DeepSeek R1"
  - "DeepSeek V3 Family"
  - "Future DeepSeek Models"
name: monitoring
category: DevOps
description: Infrastructure monitoring — what to collect from hosts, clusters and dependencies, SLO-based alerting, dashboards people use, and controlling the bill.
license: MIT
author: Agent.md maintainers
last-verified: 2026-08-23
reviewed-by: unreviewed
---
<!-- Generated from models/_canonical by scripts/build-model-variants.js.
     Edit the canonical source, not this file. Structure adapted for DeepSeek per deep-research.md. -->


# Purpose

Rules for monitoring infrastructure: nodes, clusters, databases, queues,
networking and third-party dependencies. Application instrumentation is
`Backend/monitoring`.

The distinction that matters: **infrastructure metrics tell you a component is
unhealthy; only user-facing signals tell you the product is broken.** Alert on the
second, use the first to diagnose.

---

# Collect the layers that fail

| Layer | Signals worth collecting |
| --- | --- |
| Node | CPU steal, memory pressure, disk usage and inode count, disk I/O wait, network errors |
| Cluster | Pending pods, node `NotReady`, `OOMKilled` count, evictions, `CrashLoopBackOff` |
| Database | Connection pool utilisation, replication lag, dead tuples, slow query rate, disk headroom |
| Queue | Oldest-message age, DLQ depth, consumer count |
| Cache | Hit ratio, eviction rate, memory utilisation |
| Load balancer | `5xx` by target, healthy target count, connection errors |
| TLS / DNS | Certificate expiry, domain expiry, resolution failures |
| Cloud quota | API rate limits, IP address exhaustion, service quotas |
| Dependencies | Third-party error rate and latency, from your side |

Two that are quietly fatal and routinely uncollected:

- **Disk and inode exhaustion.** A full disk stops writes, breaks logging, and can
  corrupt state. Inodes exhaust separately — a directory full of tiny files fills
  them while `df` still shows free space.
- **Certificate expiry.** An expired certificate is a total outage with a known
  date. Alert 30 and 7 days out.

Also monitor from outside: a synthetic check on the real user path, from another
network, catches DNS, CDN and certificate failures that internal metrics cannot
see.

---

# Alert on symptoms, page on user impact

An alert should mean **a user is affected, and you can do something now**. Define
the SLO first; the alert follows from it.

```yaml
# Multi-window burn rate: fast burn pages, slow burn opens a ticket
- alert: CheckoutFastBurn
  expr: |
    (1 - sum(rate(sli_good_total{journey="checkout"}[1h]))
       / sum(rate(sli_total{journey="checkout"}[1h]))) > 14.4 * 0.001
  for: 2m
  labels: { severity: page }
  annotations: { runbook: "https://runbooks.example.com/checkout" }
```

| Signal | Route to |
| --- | --- |
| Users cannot complete a critical journey | Page |
| Error budget burning fast (14.4× over 1h) | Page |
| Certificate expires in 7 days | Page |
| Disk will be full within 4 hours (predicted) | Page |
| Error budget burning slowly (1× over 3d) | Ticket |
| A single node unhealthy in a healthy cluster | Ticket |
| Certificate expires in 30 days | Ticket |
| Cost anomaly | Ticket |

Every paging alert needs: a **runbook link** with the first three diagnostic steps,
a clear owner, and a reason it cannot wait until morning. Anything failing those
is a ticket.

```promql
# Disk: predict, do not threshold. Four hours of warning is actionable.
predict_linear(node_filesystem_avail_bytes{mountpoint="/"}[6h], 4*3600) < 0

# Inodes exhaust independently of bytes — `df -h` still shows free space
node_filesystem_files_free / node_filesystem_files < 0.1

# Certificates: a scheduled outage with a known date
probe_ssl_earliest_cert_expiry - time() < 7 * 86400

# Replication lag, in seconds behind the primary → `Database/replication`
pg_stat_replication_replay_lag_seconds > 30
```

Predict rather than threshold where you can: `predict_linear` on disk usage warns
four hours ahead, which is actionable; "disk 90% full" on a slowly-growing volume
is noise, and on a fast-filling one it is already too late.

---

# Dashboards people actually open

Build from the questions asked during an incident, not from every available
metric.

1. **Service overview** — the four golden signals per service, one screen.
2. **Dependency health** — every downstream, with error rate and latency.
3. **Capacity** — saturation of each finite resource: pool, disk, memory, quota.
4. **Deploy correlation** — deploy markers annotated on the graphs, so "what
   changed?" is answerable in one glance.

```json
// Grafana: annotate every panel with deploy markers, so "what changed?"
// is answered without leaving the dashboard.
{ "annotations": { "list": [{
  "name": "Deploys",
  "datasource": "prometheus",
  "expr": "changes(kube_deployment_status_observed_generation{deployment=\"api\"}[1m]) > 0",
  "iconColor": "rgba(255, 96, 96, 1)"
}]}}
```

Rules: default to the last hour, keep the top row to what matters, and delete
dashboards nobody opens. A wall of unread graphs trains people to ignore all of
them.

---

# Cost and retention

Observability spend grows superlinearly with traffic, and metric cardinality is
the usual cause.

- **Cardinality kills.** A label with a pod name, request id or user id multiplies
  series by that value's range. Audit label sets; keep high-cardinality data in
  logs and traces where it belongs. → `Backend/logging`
- Retention by tier: high resolution for days, downsampled for months, aggregates
  for years. Nobody queries second-resolution data from March.
- Sample high-volume success paths; never sample errors.
- Alert on the observability bill itself — a cardinality explosion shipped on a
  Friday is discovered on the invoice otherwise.

---

# Operational hygiene

- Monitoring must not share a failure domain with what it monitors. An alerting
  system hosted in the cluster it watches goes down with it.
- Have a **dead-man's switch**: a heartbeat alert that fires when monitoring stops
  reporting. Silence is indistinguishable from health otherwise.
- Test alerts when you write them — trigger the condition and confirm the page
  arrives at the right person.
- Review alerts monthly: delete those nobody acted on, and add one for anything an
  incident revealed you were blind to.
- Define escalation: who is paged, after how long unacknowledged, and to whom it
  escalates. → `DevOps/disaster-recovery`

| Component | Exporter / source |
| --- | --- |
| Nodes | `node_exporter` — `node_filesystem_avail_bytes`, `node_memory_MemAvailable_bytes` |
| Kubernetes | `kube-state-metrics` — `kube_pod_container_status_restarts_total` |
| Postgres | `postgres_exporter` — `pg_stat_replication`, `pg_stat_database` |
| Redis | `redis_exporter` — `redis_evicted_keys_total`, `redis_memory_used_bytes` |
| Blackbox / TLS | `blackbox_exporter` — `probe_success`, `probe_ssl_earliest_cert_expiry` |
| Load balancer | Cloud provider metrics — `HTTPCode_Target_5XX_Count`, `HealthyHostCount` |
| Queues | Broker metrics — `ApproximateAgeOfOldestMessage` → `Backend/queues` |

---

# Anti-patterns

| Anti-pattern | Why it fails | Fix |
| --- | --- | --- |
| Alerting on CPU without user impact | Pages for something nobody notices | Alert on symptoms |
| Static thresholds | Page at 3am for a blip; miss slow burns | Multi-window burn rate |
| No SLO behind an alert | The threshold is a guess | Define the objective first |
| Alerts without runbooks | Responder starts from nothing | Link the first steps |
| Alerts nobody acts on | Erodes trust in every alert | Monthly review and deletion |
| No disk or inode monitoring | Silent, total failure | Predictive alerts on both |
| No certificate expiry alert | Scheduled outage with a known date | 30 and 7 days |
| No external synthetic check | DNS, CDN and TLS failures invisible internally | Probe from outside |
| Monitoring inside the monitored cluster | Fails exactly when needed | Separate failure domain |
| No dead-man's switch | Silence looks like health | Heartbeat alert |
| Alerts never tested | Discovered broken during an incident | Trigger and verify |
| High-cardinality metric labels | Cardinality explosion; huge bill | Ids in logs and traces |
| Uniform infinite retention | Cost with no consumer | Tiered retention |
| Dashboards of everything | Nobody reads them | Build from incident questions |
| No deploy annotations | "What changed?" takes ten minutes | Annotate deploys |
| No escalation policy | Unacknowledged pages go nowhere | Defined escalation chain |

---

# Checklist

- [ ] Node, cluster, database, queue, cache and load-balancer signals are collected
- [ ] Disk usage **and** inode usage are monitored with predictive alerts
- [ ] Certificate and domain expiry alert at 30 and 7 days
- [ ] Third-party dependency error rate and latency are measured from your side
- [ ] Synthetic checks run against the real user path from outside the network
- [ ] An SLO exists for each critical user journey
- [ ] Paging alerts fire on multi-window burn rate, not static thresholds
- [ ] Every paging alert is user-affecting, actionable and has a runbook
- [ ] Non-urgent conditions create tickets, not pages
- [ ] Alerts are tested when written and reviewed monthly
- [ ] A dead-man's switch detects monitoring failure
- [ ] Monitoring runs outside the failure domain it observes
- [ ] Metric label cardinality is bounded and audited
- [ ] Retention is tiered by resolution and age
- [ ] Observability cost is monitored and alerted on
- [ ] Dashboards answer specific incident questions and show deploy markers
- [ ] An escalation policy defines who is paged and when it escalates
