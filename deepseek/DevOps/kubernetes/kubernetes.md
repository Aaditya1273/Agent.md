---
targetModels:
  - "DeepSeek V4"
  - "DeepSeek V3.2"
  - "DeepSeek R1"
  - "DeepSeek V3 Family"
  - "Future DeepSeek Models"
name: kubernetes
category: DevOps
description: Running workloads on Kubernetes — resource requests and limits, probes, disruption budgets, security context, and the configuration that decides stability.
license: MIT
author: Agent.md maintainers
last-verified: 2026-08-23
reviewed-by: unreviewed
---
<!-- Generated from models/_canonical by scripts/build-model-variants.js.
     Edit the canonical source, not this file. Structure adapted for DeepSeek per deep-research.md. -->


# Purpose

Rules for deploying applications to Kubernetes. Kubernetes will run almost any
manifest — the difference between a stable cluster and a thrashing one is a small
set of fields most manifests omit.

Deployment strategy is `DevOps/deployment`; images are `DevOps/docker`.

---

# Requests and limits decide scheduling and eviction

```yaml
resources:
  requests: { cpu: "250m", memory: "512Mi" }    # what the scheduler reserves
  limits:   {              memory: "512Mi" }    # the hard ceiling
```

| Field | Effect |
| --- | --- |
| `requests.cpu` | Scheduling, and the share under contention |
| `requests.memory` | Scheduling, and eviction priority |
| `limits.memory` | Exceeding it is an immediate OOM kill |
| `limits.cpu` | **Throttling**, not killing — and it is where latency goes to die |

Two rules that are widely misapplied:

- **Always set memory requests and limits, and set them equal.** Equal
  request/limit gives the pod `Guaranteed` QoS, so it is evicted last under node
  pressure. Memory is incompressible: a limit is a kill, not a slowdown.
- **Usually omit the CPU limit.** CPU is compressible; the request already
  guarantees a share. A CPU limit throttles the process even when the node is idle,
  which shows up as unexplained p99 latency. Set one only for genuinely untrusted
  or noisy workloads.

Pods with no requests are `BestEffort` and are evicted first — which is exactly the
wrong outcome for your most important service.

Runtime memory settings must respect the limit: a Node heap or JVM sized from host
memory will be OOM-killed in a limited container. → `Backend/node`

---

# Probes: three questions, three answers

```yaml
startupProbe:   { httpGet: { path: /healthz, port: 3000 }, failureThreshold: 30, periodSeconds: 2 }
readinessProbe: { httpGet: { path: /readyz,  port: 3000 }, periodSeconds: 5 }
livenessProbe:  { httpGet: { path: /healthz, port: 3000 }, periodSeconds: 10, failureThreshold: 3 }
```

- **Startup** — has it booted? Its `failureThreshold × periodSeconds` must cover the
  slowest cold start, or a slow-starting pod is killed in a loop forever.
- **Readiness** — can it serve *now*? May check dependencies. Failing it removes
  the pod from the Service without killing it.
- **Liveness** — is the process wedged? **Must not check dependencies.** A liveness
  probe hitting the database restarts every pod during a database incident,
  converting a degradation into a total outage. This is the most damaging
  misconfiguration in this package.

Point liveness at a trivial handler; put dependency checks in readiness only.

---

# Survive disruption

```yaml
spec:
  replicas: 3
  strategy:
    rollingUpdate: { maxSurge: 25%, maxUnavailable: 0 }
  minReadySeconds: 10
---
apiVersion: policy/v1
kind: PodDisruptionBudget
spec:
  minAvailable: 2                # a node drain cannot take the service below this
  selector: { matchLabels: { app: api } }
```

- A `PodDisruptionBudget` is what stops a routine node drain or cluster upgrade
  removing every replica at once. Without one, voluntary disruptions cause
  outages nobody planned.
- Spread replicas across nodes and zones with `topologySpreadConstraints`; three
  replicas on one node survive nothing.
- `preStop` sleep plus a grace period longer than the drain time, or every rollout
  drops in-flight requests. → `DevOps/deployment`

---

# Security context

```yaml
securityContext:
  runAsNonRoot: true
  runAsUser: 10001
  allowPrivilegeEscalation: false
  readOnlyRootFilesystem: true
  capabilities: { drop: ["ALL"] }
  seccompProfile: { type: RuntimeDefault }
```

- `runAsNonRoot: true` is verifiable only when the image declares a **numeric**
  UID.
- `readOnlyRootFilesystem` with an `emptyDir` mounted at `/tmp` for scratch space.
- Default-deny `NetworkPolicy` per namespace, then allow the specific flows. A
  cluster with no network policy lets any compromised pod reach every service.
- Never mount the default ServiceAccount token unless the pod calls the API
  (`automountServiceAccountToken: false`).
- Enforce Pod Security Admission at `restricted` on application namespaces.
  → `Security/headers`

Secrets are base64, **not encrypted**, in etcd by default. Enable encryption at
rest, or use an external store (External Secrets Operator, Vault, cloud secret
manager) and never commit a `Secret` manifest.
→ `Security/secret-management`

---

# Configuration and scaling

- `ConfigMap` for non-sensitive configuration, `Secret` for the rest, both injected
  as environment variables or files — never baked into the image.
- A ConfigMap change does **not** restart pods. Either checksum it into the pod
  template annotation so a change rolls the deployment, or reload in-process.
- `HorizontalPodAutoscaler` on the signal that reflects load: CPU for CPU-bound
  services, a custom metric (requests in flight, queue backlog age) for I/O-bound
  ones. CPU-based scaling on an I/O-bound worker scales **down** while the backlog
  grows. → `Backend/workers`
- Set `minReplicas ≥ 2` for anything that must stay available.
- Cap `maxReplicas` at what downstream dependencies can absorb — autoscaling
  otherwise converts a backlog into a database outage.

---

# Anti-patterns

| Anti-pattern | Why it fails | Fix |
| --- | --- | --- |
| No resource requests | `BestEffort` QoS; evicted first | Always set requests |
| No memory limit | One leak takes down the node | Limit equal to request |
| CPU limit on a latency-sensitive service | Throttled even on an idle node | Omit the CPU limit |
| Runtime heap sized from host memory | OOM-killed under the limit | Configure against the limit |
| Liveness probe checking dependencies | Mass restarts during a blip | Process-local liveness |
| No startup probe on a slow starter | Liveness kills it in a loop | Startup probe with headroom |
| Readiness that never fails | Traffic sent to broken pods | Check real dependencies |
| No PodDisruptionBudget | A node drain takes the whole service | `minAvailable` |
| Replicas on one node | Node failure is total failure | Topology spread constraints |
| No `preStop` or short grace period | Every rollout drops requests | Drain window |
| Running as root | Escape has host-level privilege | `runAsNonRoot` with a numeric UID |
| No NetworkPolicy | Any pod reaches any service | Default-deny, then allow |
| ServiceAccount token mounted by default | Unnecessary API credentials in every pod | Disable unless needed |
| Secrets committed as manifests | Plain base64 in version control | External secret store |
| ConfigMap change expected to restart pods | Stale configuration persists | Checksum annotation |
| CPU-based HPA on I/O-bound work | Scales down as the backlog grows | Scale on backlog |
| Unbounded `maxReplicas` | Autoscaling causes a downstream outage | Cap at downstream capacity |
| `latest` image tags | Restart pulls a different build | Pin by digest |

---

# Checklist

- [ ] Every container declares CPU and memory requests
- [ ] Memory limit equals memory request
- [ ] CPU limits are omitted unless the workload is untrusted or noisy
- [ ] Runtime heap settings respect the container memory limit
- [ ] Startup, readiness and liveness probes are distinct
- [ ] The startup probe covers the slowest observed cold start
- [ ] Liveness checks nothing external
- [ ] A PodDisruptionBudget protects every user-facing service
- [ ] Replicas are spread across nodes and zones
- [ ] `preStop` and the grace period cover the full drain
- [ ] Containers run as a non-root numeric UID with capabilities dropped
- [ ] Root filesystems are read-only with explicit writable volumes
- [ ] A default-deny NetworkPolicy exists per namespace
- [ ] ServiceAccount tokens are mounted only where needed
- [ ] Secrets come from an external store; none are committed
- [ ] ConfigMap changes trigger a rollout via a checksum annotation
- [ ] Autoscaling uses a signal that reflects real load
- [ ] `minReplicas` is at least 2 and `maxReplicas` is capped at downstream capacity
- [ ] Images are pinned by digest
