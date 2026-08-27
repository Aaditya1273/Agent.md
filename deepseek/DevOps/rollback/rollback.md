---
targetModels:
  - "DeepSeek V4"
  - "DeepSeek V3.2"
  - "DeepSeek R1"
  - "DeepSeek V3 Family"
  - "Future DeepSeek Models"
name: rollback
category: DevOps
description: Reversing a bad release quickly — what makes a deploy reversible, database changes that block rollback, feature flags, and rehearsing the procedure.
license: MIT
author: Agent.md maintainers
last-verified: 2026-08-23
reviewed-by: unreviewed
---
<!-- Generated from models/_canonical by scripts/build-model-variants.js.
     Edit the canonical source, not this file. Structure adapted for DeepSeek per deep-research.md. -->


# Purpose

Rules for undoing a release. The relevant measure of a deployment system is not
how rarely it fails — it is **how quickly a failure is reversed**.

The target: any release can be reverted in minutes, by one person, without a
meeting. Everything below serves that.

---

# Detect before you can reverse

You cannot roll back what you have not noticed. Automate the decision.

```yaml
# Abort and revert if the new version breaches its budget during the bake window
- alert: DeployErrorBudgetBurn
  expr: |
    sum(rate(http_requests_total{status=~"5..", version="$NEW"}[5m]))
      / sum(rate(http_requests_total{version="$NEW"}[5m])) > 0.02
  for: 3m
```

- Compare the **new version against the old**, not against an absolute threshold —
  a 2% error rate may be normal for one service and catastrophic for another.
- Bake for a defined window before promoting further.
- Automate the rollback trigger. Relying on someone watching a dashboard fails at
  2am, which is when it matters.
- Tag every metric and log line with the version (`version`, `git_sha`,
  `deployment_id`), or you cannot attribute a regression to a deploy at all.
  The same label must appear on `http_requests_total`, `http_request_duration_seconds`
  and every business counter, or the comparison above cannot be written.
  → `Backend/monitoring`

---

# Rolling back code is the easy part

```bash
kubectl rollout undo deployment/api                    # previous ReplicaSet
kubectl set image deployment/api api=$REGISTRY/api@sha256:<known-good>
```

Requirements for this to be fast and safe:

- **Immutable, digest-addressed artefacts.** Rebuilding from a git revert takes
  ten minutes you do not have and may produce different bytes.
- Keep the previous N versions available in the registry and, where applicable, in
  the platform's revision history.
- The rollback path must be the **same mechanism** as the deploy path. A separate
  emergency procedure is one nobody has practised.
- **Revert the commit too**, so the next deploy does not reintroduce the fault.

| Platform | Roll back with | Retention setting |
| --- | --- | --- |
| Kubernetes | `kubectl rollout undo deployment/api` | `revisionHistoryLimit` (default 10) |
| Kubernetes (pinned) | `kubectl set image … api@sha256:…` | Registry tag retention |
| Helm | `helm rollback api <revision>` | `--history-max` |
| Argo CD | `argocd app rollback api <id>` | Git history |
| ECS | `aws ecs update-service --task-definition api:41` | Task definition revisions |
| Vercel | `vercel rollback <deployment-url>` | Immutable deployments → `DevOps/vercel` |
| Lambda | `aws lambda update-alias --function-version 41` | Published versions |
| Terraform | `git revert` then `terraform apply` | State history |

`revisionHistoryLimit: 0` is a configuration that removes your ability to roll
back at all — check it, because some Helm charts set it to save etcd space.

---

# Database changes are what actually block rollback

Code rolls back in seconds. A schema change frequently cannot roll back at all —
a dropped column's data is gone.

The rule: **make every migration backward compatible with the currently deployed
code**, then rolling back the code never requires rolling back the database.

```
Deploy 1  Expand    add column, nullable; new code writes both, reads old
Deploy 2  Migrate   backfill; new code reads new
Deploy 3  Contract  drop the old column — only once deploy 2 is proven
```

Each deploy is independently reversible because the schema at every point serves
both versions. → `Database/migration`

| Change | Reversible | Note |
| --- | --- | --- |
| Add a nullable column | Yes | Safe |
| Add an index (concurrently) | Yes | Safe |
| Add a `NOT NULL` column with a default | Usually | Old code ignores it |
| Rename a column | **No** | Add, backfill, drop across three deploys |
| Drop a column | **No** | Data is gone; contract only after proving |
| Change a column type | **No** | New column, backfill, switch |
| Add a constraint | Depends | Old code may write violating rows |

A destructive migration must be separated from the deploy that stops using the
data, by enough time to prove the new code works.

---

# Feature flags make rollback instant

```ts
if (await flags.enabled("new-checkout", { userId })) return newCheckout();
return legacyCheckout();
```

A flag decouples deploy from release. The fix for a bad feature becomes a
configuration change — seconds, no rollout, no rebuild — instead of a redeploy.

- Kill-switch anything risky: a new payment path, a rewritten flow, an expensive
  query.
- Roll out by percentage so a fault affects 1% of users, not everyone.
- Keep both paths working while the flag exists, and **remove the flag** once the
  new path is proven. Stale flags become dead branches nobody dares delete, and an
  untested legacy path is not a rollback target.
- Flag state changes are audited: who turned what on, when.

| Mechanism | Reversal time | Cost |
| --- | --- | --- |
| Feature flag (`flags.enabled`) | Seconds | Both code paths must stay working |
| Traffic shift (canary weight, `istio` `VirtualService`) | Seconds | Needs both versions running |
| `kubectl rollout undo` | ~1 minute | Previous ReplicaSet must exist |
| Redeploy a known-good digest | 2–5 minutes | Registry retention |
| Rebuild from a git revert | 10+ minutes | Slowest; may differ from what shipped |
| Restore from backup | Hours | Data loss between the backup and now |

The list is ordered deliberately: reach for the fastest mechanism the failure
allows, and design so the fast ones are available. A change that can only be
reversed by the last row is a change that has no rollback.

---

# Rehearse it

A rollback procedure that has never been executed is a document, not a capability.

- Roll back in staging on a schedule, timed, following the runbook as written.
- Include the awkward cases: a rollback with a migration in flight, a rollback of
  a queue-consumer change with messages in the new format.
- Write down the decision criteria in advance — what error rate, over what window,
  triggers a rollback — so the choice is not made under pressure by whoever
  happens to be online.
- Prefer rolling back over fixing forward during an incident. Diagnosis takes
  longer than reversal, and users are affected throughout.

A written trigger looks like this, and belongs in the runbook before the
incident, not in a chat thread during it:

```
Roll back immediately if, during the 15-minute bake window:
  - 5xx rate on the new version exceeds 2× the old version's, for 3 minutes, or
  - p99 latency on any critical route exceeds 1.5× its pre-deploy value, or
  - any `payment.*` or `auth.*` error counter is non-zero above its baseline.
Decision owner: the deployer. No approval required to roll back.
```

"No approval required to roll back" is the load-bearing line. A rollback that
needs someone to be found is not a minutes-scale rollback.

---

# Anti-patterns

| Anti-pattern | Why it fails | Fix |
| --- | --- | --- |
| No version label on metrics | A regression cannot be attributed to a deploy | Tag every signal |
| Absolute error thresholds | Wrong for most services | Compare new against old |
| Manual dashboard watching | Nobody is watching at 2am | Automated trigger |
| Rebuilding to roll back | Slow, and possibly different bytes | Promote a known-good digest |
| Old artefacts deleted | Nothing to roll back to | Retain previous versions |
| A separate emergency procedure | Unpractised under pressure | Same mechanism as deploy |
| Rolling back without reverting the commit | The next deploy reintroduces the fault | Revert too |
| Destructive migration with the deploy | Rollback becomes impossible | Expand-migrate-contract |
| Dropping a column early | Data is gone | Contract only after proving |
| No feature flags on risky changes | Rollback needs a redeploy | Kill switches |
| Stale flags never removed | Dead branches; untested fallback path | Remove after proving |
| Rollback never rehearsed | It fails the first time it is needed | Scheduled drills |
| Criteria decided during the incident | Slow, inconsistent decisions | Written thresholds |
| Fixing forward by default | Users affected throughout diagnosis | Roll back, then diagnose |

---

# Checklist

- [ ] Every metric and log line carries the deployed version
- [ ] Deploy health compares the new version against the previous one
- [ ] A bake window precedes full promotion
- [ ] Rollback triggers automatically on an error-budget breach
- [ ] Artefacts are immutable and addressed by digest
- [ ] Previous versions remain available for rollback
- [ ] Rollback uses the same mechanism as deployment
- [ ] Rolling back is accompanied by reverting the commit
- [ ] Every migration is backward compatible with the running code
- [ ] Destructive schema changes are separated from the deploy that stops using them
- [ ] Risky changes ship behind a kill switch
- [ ] Feature rollout is percentage-based
- [ ] Flags are removed once the new path is proven
- [ ] Flag changes are audited
- [ ] The rollback procedure is rehearsed on a schedule and timed
- [ ] Rollback decision criteria are written down in advance
