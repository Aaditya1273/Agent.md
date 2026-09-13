---
targetModels:
  - "DeepSeek V4"
  - "DeepSeek V3.2"
  - "DeepSeek R1"
  - "DeepSeek V3 Family"
  - "Future DeepSeek Models"
name: secret-management
category: Security
description: Keeping credentials out of source, configuration and images — storage, injection, rotation, and what to do once a secret has leaked.
license: MIT
author: Agent.md maintainers
last-verified: 2026-08-23
reviewed-by: unreviewed
---
<!-- Generated from models/_canonical by scripts/build-model-variants.js.
     Edit the canonical source, not this file. Behavioural profile for DeepSeek: scripts/model-profiles.json -->

## Task boundary
1. Implement exactly the task as stated. Do not add abstractions, options, config, or files the task did not name.
2. Comments, identifiers, commit messages and log strings are English only.
3. Stop when the checklist at the end passes. Do not refactor or "improve" surrounding code.
4. Every checklist item below is backed by an assertion in a test or by pasted command output, never by a sentence.

---

# Purpose

Rules for handling API keys, database passwords, signing keys and tokens.

The operating assumption: **a secret in source control is already compromised.**
Git history is permanent, forks are uncontrolled, and scanners crawl public
repositories continuously. Treat "we will remove it later" as "we have rotated
it" — because removing it without rotating changes nothing.

---

# Where secrets live

| Location | Verdict |
| --- | --- |
| Secret manager (Vault, AWS Secrets Manager, GCP Secret Manager, 1Password) | **Preferred** — audited, rotatable, access-controlled |
| KMS / HSM for signing and encryption keys | **Preferred** — the key never leaves the boundary |
| Platform-injected environment variables | **Acceptable** — the common baseline |
| CI/CD provider secret store | **Acceptable** for build-time credentials |
| `.env` file, gitignored, local development only | **Tolerable** — never in an image or a deployed host |
| Committed `.env`, config file, or source constant | **Never** |
| Client bundle, mobile app, browser storage | **Never** — shipped to every user |

**Never** commit a secret "temporarily". **Never** paste one into an issue, a
pull request, a chat message, or a support ticket — those systems are searchable
and often exportable.

---

# Environment variables — the caveats

Environment variables are the common baseline, and they leak in specific ways
worth knowing:

1. **They appear in crash dumps and error reporters.** Scrub `process.env` before
  sending a report to Sentry or similar.
2. **They are readable by every process the user runs**, and on Linux via
  `/proc/<pid>/environ` for the same user.
3. **`docker inspect` shows them** for a running container.
4. **They land in shell history** when set inline on a command.
5. **Child processes inherit them.** A build step that shells out passes every
  secret along.

```js
// Fail fast and loudly at startup rather than sending `undefined` as a key.
const required = ["DATABASE_URL", "JWT_SIGNING_KEY", "STRIPE_SECRET_KEY"];
const missing = required.filter((k) => !process.env[k]);
if (missing.length) {
  throw new Error(`Missing required secrets: ${missing.join(", ")}`);
}
```

**Never** log `process.env`, and never interpolate a secret into a log line, a
URL, or an error message.

---

# Keeping them out of the repository

```gitignore
.env
.env.*
!.env.example
*.pem
*.key
*.p12
credentials.json
service-account*.json
```

Commit a `.env.example` with **keys and empty values only** — never real values —
so a contributor knows what is required.

Run a secret scanner in CI and as a pre-commit hook (`gitleaks`, `trufflehog`,
`detect-secrets`, or GitHub push protection). Scan the **full history**, not just
the diff, when onboarding an existing repository.

**Never** rely on `.gitignore` alone. It does not protect a file already tracked,
and `git add -f` bypasses it.

---

# Containers and builds

1. **Never** use `ENV SECRET=…` or `ARG SECRET=…` in a `Dockerfile`. Both persist
  in the image layers and are readable with `docker history` by anyone who can
  pull the image.
2. Use **build secrets** that are not committed to a layer:

```dockerfile
# syntax=docker/dockerfile:1
RUN --mount=type=secret,id=npm_token \
    NPM_TOKEN=$(cat /run/secrets/npm_token) npm ci
```

3. Inject runtime secrets through the orchestrator — Kubernetes `Secret` mounted
  as a file, ECS task secrets, systemd credentials.
4. A Kubernetes `Secret` is **base64, not encrypted**, at rest by default. Enable
  encryption at rest, restrict RBAC on the `secrets` resource, and prefer an
  external-secrets operator backed by a real manager.

---

# Rotation

1. **Rotate on a schedule** and **immediately on any suspicion** of exposure.
2. Design every integration to support **two valid credentials at once**, so
  rotation is: issue new → deploy → verify → revoke old. Without overlap,
  rotation means downtime, and rotation that means downtime does not happen.
3. Prefer **short-lived, automatically issued credentials** over long-lived static
  ones: IAM roles, workload identity, OIDC federation from CI. The best secret is
  the one that expires in an hour without anyone acting.
4. Keep an inventory: what exists, who can read it, when it was last rotated. An
  unrotatable secret nobody owns is the one that ends up in an incident report.

---

# When a secret leaks

In this order:

1. **Revoke or rotate first.** Not "remove the commit" — revoke. The old value is
   already cloned, cached and indexed.
2. **Check for use.** Review provider audit logs from before the leak was noticed.
3. **Then** clean history if you wish (`git filter-repo`, BFG) and force-push.
   This is cosmetic; it does not un-leak anything and does not reach existing
   clones or forks.
4. **Record it.** What leaked, how, for how long, and what changed to prevent a
   repeat.

**Never** treat a history rewrite as remediation. Rotation is remediation.

---

# Anti-patterns

| Anti-pattern | Why it fails | Fix |
| --- | --- | --- |
| API key committed "temporarily" | History is permanent; scanners are fast | Rotate; use a secret manager |
| `ENV SECRET=` in a `Dockerfile` | Readable via `docker history` | `--mount=type=secret` |
| Secret in a client bundle or mobile app | Shipped to every user | Proxy through your backend |
| `console.log(process.env)` | Secrets land in log aggregation | Never log the environment |
| Same key across dev, staging and prod | One compromise takes everything | Separate credentials per environment |
| No rotation because it causes downtime | Rotation never happens | Support two valid credentials |
| Deleting the commit instead of rotating | Clones and forks retain it | Revoke first |
| Kubernetes `Secret` assumed encrypted | Base64 is encoding | Encryption at rest + RBAC |
| Secret in a URL query string | Access logs, `Referer`, history | Header or request body |

---

# Checklist

- [ ] No secret appears in source, config, or committed `.env` files
- [ ] `.gitignore` covers `.env*`, `*.pem`, `*.key`, service-account JSON
- [ ] `.env.example` lists keys with empty values only
- [ ] A secret scanner runs in CI and over full history
- [ ] Production secrets come from a secret manager or orchestrator injection
- [ ] Required secrets are validated at startup with a clear failure
- [ ] `process.env` is never logged and is scrubbed from error reports
- [ ] No `ENV`/`ARG` secrets in Dockerfiles; build secrets use `--mount=type=secret`
- [ ] Kubernetes secrets have encryption at rest and restricted RBAC
- [ ] Each environment has distinct credentials
- [ ] Every integration supports two valid credentials for zero-downtime rotation
- [ ] Short-lived federated credentials used where the platform supports them
- [ ] A written leak procedure exists that starts with revocation
