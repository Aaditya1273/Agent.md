---
targetModels:
  - "Gemini 3.6 Flash"
  - "Gemini 3.5 Flash"
  - "Gemini 3.1 Pro"
  - "Gemini 3 Family"
  - "Future Gemini Models"
name: disaster-recovery
category: DevOps
description: Planning and rehearsing recovery from a major failure — RTO and RPO, failure scenarios, runbooks, incident roles, and drills that find the gaps.
license: MIT
author: Agent.md maintainers
last-verified: 2026-08-23
reviewed-by: unreviewed
---
<!-- Generated from models/_canonical by scripts/build-model-variants.js.
     Edit the canonical source, not this file. Structure adapted for Gemini per deep-research.md. -->


# Purpose

Rules for surviving a major failure: a region outage, a destructive mistake, a
ransomware event, or the loss of a critical third party.

The plan is not the deliverable — the **rehearsed capability** is. A recovery
document that has never been executed is a hypothesis, and it is usually wrong in
ways only a drill reveals.

---

# Start with two numbers, per service

| Term | Question | Determines |
| --- | --- | --- |
| **RPO** | How much data may we lose? | Backup and replication strategy |
| **RTO** | How long may recovery take? | Standby architecture and cost |

Agree them with the business, per service tier, and write them down. They are the
only basis on which any of the following decisions can be made.

| Tier | Example | RPO | RTO | Architecture |
| --- | --- | --- | --- | --- |
| 0 | Payments, authentication | < 1 min | < 15 min | Multi-region active/active |
| 1 | Core product | < 5 min | < 1 hour | Warm standby |
| 2 | Reporting, admin | < 1 hour | < 8 hours | Backup restore |
| 3 | Internal tools | < 24 hours | Best effort | Backup restore |

If measured recovery time does not meet the stated RTO, either change the
architecture or change the number. An aspirational RTO nobody has measured is
worse than an honest one.

---

# Enumerate the scenarios

Plan for causes, because the response differs:

| Scenario | Response |
| --- | --- |
| Single instance or node failure | Automatic — health checks and replacement |
| Availability-zone failure | Automatic — multi-AZ, no human involvement |
| **Region failure** | Failover procedure; DNS or global load balancer |
| **Destructive human error** (`DROP TABLE`, bad migration) | PITR to just before the event |
| **Ransomware / account compromise** | Restore from immutable, isolated backups |
| Corrupted deploy | `kubectl rollout undo`, or a flag flip → `DevOps/rollback` |
| Third-party outage (payments, email, auth) | Degrade gracefully; queue and retry behind a circuit breaker |
| Expired certificate or domain | Prevention: alert on `probe_ssl_earliest_cert_expiry`, 30 and 7 days out |
| Loss of key personnel | Documented runbooks; no single-holder credentials |

Two are commonly missed and are the most likely to actually happen:

- **Human error is more frequent than infrastructure failure.** Point-in-time
  recovery matters more than multi-region, for most organisations. A delayed
  replica (an hour behind on purpose) is cheap insurance.
- **Account compromise** defeats every backup that shares the account.
  → `DevOps/backups`

A delayed replica is configured with `recovery_min_apply_delay = '1h'` in Postgres,
or `--delay` on a MySQL replica. It is an hour behind on purpose, so a `DROP TABLE`
or a destructive `UPDATE` can be caught before it applies — and the recovery is a
promotion rather than a multi-hour restore. → `Database/replication`

---

# Write runbooks that work at 3am

```markdown
# Runbook: Primary database region failure

## Detect
- `pg_up == 0` for 2 minutes in `eu-west-1`, or the RDS event stream shows failover
- Confirm: `pg_isready -h $PRIMARY_HOST` from a bastion outside the region

## Decide
- Promote if the primary is unreachable for > 5 minutes. Decision owner: on-call.
- No approval required.

## Act
1. Verify the standby's replay position:  SELECT pg_last_wal_replay_lsn();
2. Promote:  aws rds failover-db-cluster --db-cluster-identifier prod
3. Update the connection secret and restart consumers
4. Verify writes:  psql -c "INSERT INTO healthcheck …"
5. Re-point surviving replicas

## Verify
- Error rate returns to baseline within 5 minutes
- Write path confirmed by the synthetic check

## Communicate
- Status page within 10 minutes; update every 30
```

Rules: exact commands, no ambiguity, decision criteria before the incident, and
a named owner. Anything requiring judgement should be pre-decided.

| Runbook section | Must contain |
| --- | --- |
| Detect | The exact query or alert name (`pg_up == 0`, `probe_success == 0`) |
| Decide | A threshold, a time window, and a named decision owner |
| Act | Copy-pasteable commands (`aws rds failover-db-cluster`, `kubectl rollout undo`) |
| Verify | The specific signal proving recovery (`http_requests_total{status=~"5.."}` at baseline) |
| Communicate | Status-page timing and the update cadence |
| Rollback | What to do if the recovery action itself fails |

Runbooks live in version control **and** somewhere reachable when your systems are
down — a runbook hosted only in the wiki that runs in the failed cluster is
useless exactly when needed.

---

# Define incident roles

Under pressure, unassigned work does not happen and everyone debugs at once.

| Role | Responsibility |
| --- | --- |
| **Incident commander** | Coordinates; makes decisions; does **not** debug |
| Deputy | Takes over when the commander needs to hand off (`> 2h` incidents) |
| Operations lead | Executes technical actions |
| Communications lead | Status page, customers, internal updates |
| Scribe | Timeline of what was done and when — feeds the `postmortem` directly |

The commander not debugging is the rule people resist and the one that matters
most: someone must hold the overall picture and decide when to roll back.

Have a communications channel that does not depend on your infrastructure, and
know how to reach people out of hours.

| Dependency | Independent alternative |
| --- | --- |
| Chat hosted in the affected cloud | A second provider, or SMS/phone tree |
| Status page on the same CDN | A provider-hosted page (`statuspage.io`, `instatus`) |
| Runbooks in the internal wiki | A git repository plus an offline export |
| Paging via the monitored cluster | An external service (`PagerDuty`, `Opsgenie`) |
| SSO for the recovery console | Break-glass credentials, sealed and audited |

Break-glass credentials are the one people skip: if authentication itself is down,
every recovery action requiring SSO is blocked. Store them offline, require two
people to open them, and alert on use.

---

# Drill, or it does not work

| Drill | Frequency |
| --- | --- |
| Restore a database from backup to a scratch environment | Monthly |
| Fail over the primary database | Quarterly |
| Region failover (or a documented tabletop) | Annually |
| Restore a deleted object-storage prefix | Quarterly |
| Recover secrets and configuration from backup | Quarterly |
| Incident tabletop with a scenario nobody prepared for | Quarterly |

```bash
# Time every drill. The measured number replaces the aspirational RTO.
START=$(date -u +%s)
./runbooks/restore-db.sh --target-time "2026-08-23T14:32:59Z" --into scratch
psql "$SCRATCH_URL" -c "SELECT count(*) FROM orders;"        # sanity, not proof
./scripts/smoke-test.sh --base-url "$SCRATCH_APP_URL"        # proof
echo "measured RTO: $(( $(date -u +%s) - START ))s"
```

Run drills **against the runbook as written**, with someone who did not write it,
and time them. Every drill's output is a corrected runbook and a corrected RTO.

```yaml
# A chaos experiment states its hypothesis and its abort condition up front.
# Without both, it is not an experiment — it is an outage you caused.
hypothesis: "Losing one of three API pods does not raise the 5xx rate above 0.1%."
method:     { action: pod-delete, namespace: prod, label: app=api, count: 1 }
abort_if:   "sum(rate(http_requests_total{status=~'5..'}[1m])) / sum(rate(http_requests_total[1m])) > 0.01"
blast_radius: "one pod, staging first, then 1% of production traffic"
```

Chaos engineering — deliberately killing instances, injecting latency, blocking a
dependency — finds the assumptions nobody wrote down. Start in staging, with a
hypothesis and an abort condition.

After every real incident, write a **blameless** postmortem: timeline, impact,
contributing causes, and action items with owners and dates. Track them to
completion; a postmortem whose actions are never done is theatre.
→ `Review/postmortem`

---

# Anti-patterns

| Anti-pattern | Why it fails | Fix |
| --- | --- | --- |
| No stated RPO/RTO | No basis for any recovery decision | Agree and document per tier |
| RTO never measured | Aspirational; fails when tested | Time every drill |
| Planning only for infrastructure failure | Human error is more common | PITR and delayed replicas |
| Backups in the production account | Compromise takes both | Isolated, immutable copies |
| Plan never rehearsed | Fails the first time it is used | Scheduled drills |
| Drills run by their author | Tests one person's memory, not the document | Someone else executes |
| Runbooks only in the affected system | Unreachable during the outage | Off-platform copy |
| Vague runbook steps | Judgement required under pressure | Exact commands and criteria |
| No incident roles | Everyone debugs; nobody decides | Named commander |
| Commander also debugging | Nobody holds the overall picture | Separate the roles |
| Communications on affected infrastructure | Cannot coordinate | Independent channel |
| No status page updates | Support load multiplies | Communicate early and regularly |
| Blame-focused postmortems | People hide information | Blameless process |
| Action items never tracked | The same incident recurs | Owners and dates |

---

# Checklist

- [ ] Verify: RPO and RTO are agreed and documented per service tier
- [ ] Verify: The architecture actually meets the stated numbers, verified by drill
- [ ] Verify: Failure scenarios are enumerated, including human error and compromise
- [ ] Verify: Point-in-time recovery covers destructive mistakes
- [ ] Verify: Backups are isolated and immutable against account compromise
- [ ] Verify: Runbooks exist for every scenario with exact commands and decision criteria
- [ ] Verify: Runbooks are reachable when the primary platform is down
- [ ] Verify: Incident roles are defined, with a commander who does not debug
- [ ] Verify: A communications channel independent of the infrastructure exists
- [ ] Verify: Database restore is drilled monthly; failover quarterly
- [ ] Verify: Region failover is drilled or tabletopped annually
- [ ] Verify: Secret and configuration recovery is drilled
- [ ] Verify: Drills are executed by someone who did not write the runbook, and timed
- [ ] Verify: Every drill produces runbook corrections
- [ ] Verify: Chaos experiments run with a hypothesis and an abort condition
- [ ] Verify: Every incident produces a blameless postmortem with tracked actions
