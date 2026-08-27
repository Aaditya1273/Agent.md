---
targetModels:
  - "Gemini 3.6 Flash"
  - "Gemini 3.5 Flash"
  - "Gemini 3.1 Pro"
  - "Gemini 3 Family"
  - "Future Gemini Models"
name: cicd
category: DevOps
description: Pipelines that catch real problems fast — stage ordering, caching, build-once promotion, secrets handling, and gates that are worth blocking a merge for.
license: MIT
author: Agent.md maintainers
last-verified: 2026-08-23
reviewed-by: unreviewed
---
<!-- Generated from models/_canonical by scripts/build-model-variants.js.
     Edit the canonical source, not this file. Structure adapted for Gemini per deep-research.md. -->


# Purpose

Rules for continuous integration and delivery. A pipeline has one job: **give a
trustworthy answer about whether this change is safe to ship, quickly.**

Two ways it fails. Too slow, and people stop waiting for it. Too flaky, and people
stop believing it — a red build that gets re-run rather than investigated is worse
than no build.

---

# Order stages by cost and by what they catch

```
lint + typecheck   (~30s, parallel)     → fails fast on the cheapest problems
unit tests         (~2min, parallel)
build              (~3min)              → produces the artefact everything else uses
integration tests  (~5min)
security scans     (parallel with above)
e2e tests          (~10min, sharded)
deploy             (staging → production)
```

Run independent stages in parallel and fail the whole run early. A developer
should learn about a lint error in under a minute, not after ten minutes of tests.

Target under ten minutes for the pull-request pipeline. Above that, people batch
changes and context-switch away, and both make debugging harder.

---

# Build once, promote the artefact

```yaml
build:
  outputs: { digest: ${{ steps.push.outputs.digest }} }
deploy-staging:
  needs: build
  run: kubectl set image deploy/api api=$REGISTRY/api@${{ needs.build.outputs.digest }}
deploy-production:
  needs: [deploy-staging, verify]
  run: kubectl set image deploy/api api=$REGISTRY/api@${{ needs.build.outputs.digest }}
```

Rebuilding per environment means staging and production run **different bytes**,
so "it worked in staging" proves nothing. Build one artefact, promote that exact
digest.

Environment differences belong in configuration injected at runtime, never in the
build. → `DevOps/environments`

---

# Make it reproducible

- Pin the toolchain: language version in `.nvmrc`/`.tool-versions`, and the same
  version in CI as in production.
- Install from the lockfile (`npm ci`, `pip install -r requirements.lock`,
  `cargo build --locked`). `npm install` can resolve differently on two runs.
- Pin action and image versions by SHA, not by a floating tag — a mutable tag is
  arbitrary code execution in your pipeline.
- Cache dependencies keyed on the lockfile hash, never on a branch name:

```yaml
- uses: actions/cache@v4
  with:
    path: ~/.npm
    key: npm-${{ hashFiles('**/package-lock.json') }}
```

A cache keyed loosely serves stale dependencies and produces failures that
disappear when the cache expires — the hardest kind of pipeline bug to diagnose.

---

# Secrets

- Secrets come from the platform's secret store, never from the repository, never
  from a `.env` committed "temporarily".
- Prefer **OIDC federation** over long-lived cloud credentials: the pipeline
  exchanges its identity for a short-lived token, and there is no static key to
  leak or rotate.
- Scope tokens to the minimum: a deploy token cannot read source, a registry token
  is push-only for one repository.
- **Never expose secrets to workflows triggered by forks.** `pull_request_target`
  and similar triggers run with repository secrets against untrusted code — this is
  a well-known and repeatedly exploited pattern.
- Scan for committed secrets (`gitleaks`, `trufflehog`) in CI and pre-commit.
  → `Security/secret-management`
- Assume anything printed is public: mask secrets in logs and never `echo` a
  variable to debug it.

---

# Gates worth blocking on

| Gate | Blocks | Rationale |
| --- | --- | --- |
| Lint and format | Merge | Cheap, deterministic |
| Type check | Merge | Catches real errors |
| Unit and integration tests | Merge | The point of the pipeline |
| Build | Merge | A broken build must not land |
| Dependency audit (high/critical) | Merge | Known vulnerabilities |
| Secret scanning | Merge | Leaks are irreversible |
| Bundle-size budget | Merge | Regressions are invisible otherwise |
| Migration safety check | Merge | → `Database/migration` |
| Coverage **threshold** | Warn | Gameable; use trend, not a number |
| Flaky test | **Quarantine** | Never re-run and merge |

A flaky test must be quarantined with an owner and a deadline, not retried. Retry
logic on a flaky suite hides real intermittent failures — the exact class of bug
that only appears in production.

Require branch protection: no direct pushes to the default branch, status checks
required, and review required.

| Tool | Gate it provides |
| --- | --- |
| `eslint` / `ruff` / `golangci-lint` | Style and correctness lint |
| `tsc --noEmit` / `mypy` | Type checking a bundler would skip |
| `vitest` / `pytest` / `go test` | Unit and integration tests |
| `npm audit` / `pip-audit` / `osv-scanner` | Known-vulnerable dependencies |
| `gitleaks` / `trufflehog` | Committed secrets |
| `trivy image` / `grype` | Container CVEs → `DevOps/docker` |
| `size-limit` / `bundlesize` | Bundle regressions |
| `oasdiff breaking` / `buf breaking` | API contract breaks → `API/versioning` |
| `squawk` / `atlas lint` | Unsafe migrations → `Database/migration` |
| `terraform plan` / `tflint` | Infrastructure drift and misconfiguration |

---

# Deployment

- **Automatic to staging** on merge; production either automatic or one-click,
  with the same pipeline.
- Deploy strategy that can fail safely: rolling with health checks, blue/green, or
  canary with automatic rollback on error-rate breach. → `DevOps/rollback`
- Run migrations as a separate, ordered step that is safe to run against the
  currently-deployed code — expand, deploy, contract.
- Smoke-test after deploying, before declaring success.
- Tag the release with the commit SHA and record which SHA is in each environment.
  During an incident the first question is what is actually running.

---

# Anti-patterns

| Anti-pattern | Why it fails | Fix |
| --- | --- | --- |
| Rebuilding per environment | Staging and production differ | Build once, promote the digest |
| Environment differences baked into the build | One artefact cannot be promoted | Runtime configuration |
| Expensive stages first | Slow feedback on trivial errors | Cheapest first, fail fast |
| Sequential independent stages | Wall-clock time wasted | Parallelise |
| Pipelines over ~10 minutes | People stop waiting; changes batch up | Parallelise, shard, cache |
| `npm install` in CI | Non-reproducible resolution | Install from the lockfile |
| Floating action or image tags | Arbitrary code execution risk | Pin by SHA |
| Cache keyed on branch | Stale dependencies; phantom failures | Key on the lockfile hash |
| Long-lived cloud credentials | A leak is permanent until noticed | OIDC federation |
| Secrets exposed to fork triggers | Untrusted code reads them | Never on fork-triggered runs |
| Retrying flaky tests | Hides intermittent real bugs | Quarantine with an owner |
| Coverage percentage as a hard gate | Gamed with meaningless tests | Track the trend |
| No branch protection | Unreviewed code reaches the default branch | Require checks and review |
| Migrations coupled to the deploy | Rollback becomes impossible | Expand-migrate-contract |
| No post-deploy smoke test | Broken deploys reported by users | Verify before declaring success |
| Deployed version not recorded | Incident response starts blind | Tag and record per environment |

---

# Checklist

- [ ] Verify: Cheap checks run first and the pipeline fails fast
- [ ] Verify: Independent stages run in parallel
- [ ] Verify: Pull-request feedback arrives in under ten minutes
- [ ] Verify: One artefact is built and promoted by digest across environments
- [ ] Verify: All environment differences are injected at runtime
- [ ] Verify: Toolchain versions are pinned and match production
- [ ] Verify: Dependencies install from a committed lockfile
- [ ] Verify: Actions and images are pinned by SHA
- [ ] Verify: Caches are keyed on lockfile hashes
- [ ] Verify: Secrets come from the platform store; none are committed
- [ ] Verify: Cloud access uses short-lived OIDC credentials
- [ ] Verify: No secret is available to fork-triggered workflows
- [ ] Verify: Secret scanning runs in CI
- [ ] Verify: Lint, types, tests, build, audit and size budgets block merges
- [ ] Verify: Flaky tests are quarantined with an owner, never retried into green
- [ ] Verify: Branch protection requires status checks and review
- [ ] Verify: Migrations run as an ordered step compatible with the running code
- [ ] Verify: Deploys are health-checked and smoke-tested before being declared successful
- [ ] Verify: The deployed commit SHA is recorded per environment
