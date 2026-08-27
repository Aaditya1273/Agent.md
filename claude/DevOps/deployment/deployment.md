---
targetModels:
  - "Claude Fable 5"
  - "Claude Opus 5"
  - "Claude Sonnet 5"
  - "Claude 5 Family"
  - "Future Claude Models"
name: deployment
category: DevOps
description: Shipping without downtime — rolling, blue/green and canary strategies, graceful shutdown, backward-compatible changes, and verifying before declaring success.
license: MIT
author: Agent.md maintainers
last-verified: 2026-08-23
reviewed-by: unreviewed
---
<!-- Generated from models/_canonical by scripts/build-model-variants.js.
     Edit the canonical source, not this file. Structure adapted for Claude per deep-research.md. -->
# Purpose

<purpose>
Rules for getting a build into production safely. The measure of a good deployment
process is not that it never fails — it is that a failure is **detected quickly
and reversed quickly**.

Optimise for mean time to recovery over mean time between failures. Small, frequent
deploys are safer than large, rare ones: less changed, so less to bisect.

---
</purpose>

# Pick a strategy, and know its failure mode

<rules>
| Strategy | Downtime | Rollback | Cost | Note |
| --- | --- | --- | --- | --- |
| Recreate | Yes | Redeploy | Low | Only acceptable for internal tools |
| Rolling | No | Roll forward or back gradually | Low | **Both versions run simultaneously** |
| Blue/green | No | Instant traffic switch | 2× infrastructure | Database must serve both |
| Canary | No | Shift traffic back | Medium | Needs per-version metrics |

Rolling is the sensible default. The consequence people forget: during a rolling
deploy, **old and new code run at the same time**, against the same database and
the same queues. Every change must tolerate that.

Concretely, in Kubernetes terms: `maxSurge: 25%` adds capacity before removing
any, and `maxUnavailable: 0` guarantees no reduction in serving capacity during
the roll. Set `minReadySeconds` above your slowest warm-up so a pod that becomes
ready and then crashes does not take traffic.

Canary is worth the machinery when a bad deploy is expensive: route 5% of traffic
to the new version, compare error rate and latency against the old, and promote or
abort automatically on the comparison rather than on a human watching a dashboard.

---
</rules>

# Every change must be backward compatible

<rules>
Because both versions run together, a deploy is only safe if the new code works
with the old data and the old code survives the new schema.

```
Expand   → add the new column/field/endpoint, nullable and optional. Deploy.
Migrate  → backfill; write to both old and new. Deploy.
Contract → stop reading the old; drop it. Deploy.
```

Three deploys, not one. Renaming a column in a single step breaks every pod still
running the old code. → `Database/migration`

The same applies to:

- **Queue payloads** — consumers deploy at a different time from producers, so a
  new required field breaks in-flight messages. → `Backend/queues`
- **API responses** — clients cache and retry; removing a field breaks them.
- **Feature flags** — decouple deploy from release. Ship the code dark, enable it
  separately, and roll back by flipping the flag rather than redeploying.

---
</rules>

# Graceful shutdown, or every deploy drops requests

<rules>
```
SIGTERM → fail readiness → wait for the load balancer to stop sending traffic
        → finish in-flight requests → close pools → exit 0
```

The subtlety that causes most "deploys cause 502s" reports: **failing readiness
and closing the listener are not simultaneous.** The load balancer takes seconds to
notice. Fail readiness first, keep serving for a few seconds, *then* stop
accepting connections.

```yaml
lifecycle:
  preStop: { exec: { command: ["sleep", "10"] } }    # LB deregistration window
terminationGracePeriodSeconds: 60                     # > preStop + longest request
```

- The grace period must exceed the drain time, or the platform `SIGKILL`s mid-request.
- Workers drain differently: stop fetching, finish in-flight jobs.
  → `Backend/workers`

| Setting | Platform | Purpose |
| --- | --- | --- |
| `terminationGracePeriodSeconds` | Kubernetes | Hard ceiling before `SIGKILL` |
| `lifecycle.preStop` | Kubernetes | Deregistration window before `SIGTERM` |
| `maxSurge` / `maxUnavailable` | Kubernetes | Capacity during a rolling update |
| `minReadySeconds` | Kubernetes | Guards against a pod that crashes right after readiness |
| `PodDisruptionBudget` | Kubernetes | Stops node drains taking every replica |
| `deregistration_delay` | AWS ALB | Must be under the grace period |
| `stopTimeout` | ECS | The equivalent ceiling |
| `keepAliveTimeout` | Node/nginx | Above the LB idle timeout, or `502`s appear |

---
</rules>

# Health checks that mean the right thing

<rules>
| Probe | Question | May check dependencies |
| --- | --- | --- |
| Startup | Has it finished booting? | Yes |
| Readiness | Can it serve traffic **now**? | Yes |
| Liveness | Is the process wedged? | **No** |

A liveness probe that checks the database will restart every pod during a database
incident, turning a degradation into a full outage. This is the single most
damaging health-check mistake.

Readiness should fail during shutdown and during a dependency outage, so traffic
routes elsewhere without the pod being killed. → `Backend/monitoring`

---
</rules>

# Verify, then declare success

<rules>
A deploy is not finished when the rollout completes.

- **Smoke test** the critical path against the deployed environment.
- **Watch** error rate, latency and saturation for a bake period before promoting
  further. Automate the comparison; do not rely on someone remembering to look.
- **Automate rollback** on an error-budget breach during the bake window.
  → `DevOps/rollback`
- Record the deployed commit SHA per environment and annotate dashboards with
  deploy markers — the first question in an incident is "what changed?"

Deploy during working hours, when the people who wrote the change are available.
A Friday-evening deploy is a Saturday-morning incident with fewer responders.

---
</rules>

# Anti-patterns

<antipatterns>
| Anti-pattern | Why it fails | Fix |
| --- | --- | --- |
| Large, infrequent releases | Huge blast radius; hard to bisect | Small, frequent deploys |
| Assuming one version at a time | Rolling deploys run both | Backward-compatible changes |
| Schema rename in one step | Breaks pods running old code | Expand-migrate-contract |
| Migrations coupled to app deploy | Rollback becomes impossible | Separate, ordered step |
| New required queue field | In-flight messages fail | Additive payload evolution |
| No `SIGTERM` handling | Every deploy drops requests | Graceful drain |
| Closing the listener immediately | LB still routing; `502`s | Fail readiness, then wait |
| Grace period shorter than drain | `SIGKILL` mid-request | Grace exceeds drain time |
| Liveness probe checking dependencies | Mass restarts during a blip | Process-local liveness |
| No post-deploy verification | Users report the outage | Smoke test and bake |
| Manual dashboard watching | Nobody watches at 2am | Automated rollback on budget breach |
| No record of the deployed SHA | Incident response starts blind | Record and annotate |
| Deploy and release coupled | Cannot disable a bad feature quickly | Feature flags |
| Friday-evening deploys | Fewest responders available | Deploy in working hours |
| Different artefact per environment | Staging proves nothing | Promote one digest → `DevOps/cicd` |

---
</antipatterns>

# Checklist

<checklist>
- [ ] A deployment strategy is chosen and its failure mode understood
- [ ] Deploys are small and frequent
- [ ] Every change works with both the previous and current version running
- [ ] Schema changes follow expand-migrate-contract across separate deploys
- [ ] Migrations run as their own ordered step, independent of the app deploy
- [ ] Queue and API payload changes are additive
- [ ] Risky changes ship behind feature flags
- [ ] `SIGTERM` fails readiness, waits for deregistration, then drains
- [ ] The termination grace period exceeds the maximum drain time
- [ ] Startup, readiness and liveness probes are distinct
- [ ] Liveness checks nothing external
- [ ] A smoke test runs against the deployed environment
- [ ] Error rate and latency are watched for a bake period before promotion
- [ ] Rollback is automated on an error-budget breach
- [ ] The deployed commit SHA is recorded and dashboards are annotated
- [ ] The same artefact is promoted across environments
</checklist>
