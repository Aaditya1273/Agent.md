---
targetModels:
  - "Claude Fable 5"
  - "Claude Opus 5"
  - "Claude Sonnet 5"
  - "Claude 5 Family"
  - "Future Claude Models"
name: secret-management
category: Security
description: Keeping credentials out of source, configuration and images — storage, injection, rotation, and what to do once a secret has leaked.
license: MIT
author: Agent.md maintainers
last-verified: 2026-08-23
reviewed-by: unreviewed
---
<!-- Generated from models/_canonical by scripts/build-model-variants.js.
     Edit the canonical source, not this file. Structure adapted for Claude per deep-research.md. -->
# Purpose

<purpose>
Rules for handling API keys, database passwords, signing keys and tokens.

The operating assumption: **a secret in source control is already compromised.**
Git history is permanent, forks are uncontrolled, and scanners crawl public
repositories continuously. Treat "we will remove it later" as "we have rotated
it" — because removing it without rotating changes nothing.

---
</purpose>

# Where secrets live

<rules>
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
</rules>

# Environment variables — the caveats

<rules>
Environment variables are the common baseline, and they leak in specific ways
worth knowing:

- **They appear in crash dumps and error reporters.** Scrub `process.env` before
  sending a report to Sentry or similar.
- **They are readable by every process the user runs**, and on Linux via
  `/proc/<pid>/environ` for the same user.
- **`docker inspect` shows them** for a running container.
- **They land in shell history** when set inline on a command.
- **Child processes inherit them.** A build step that shells out passes every
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
</rules>

# Keeping them out of the repository

<rules>
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
</rules>

# Containers and builds

<rules>
- **Never** use `ENV SECRET=…` or `ARG SECRET=…` in a `Dockerfile`. Both persist
  in the image layers and are readable with `docker history` by anyone who can
  pull the image.
- Use **build secrets** that are not committed to a layer:

```dockerfile
</rules>

# syntax=docker/dockerfile:1

<rules>
RUN --mount=type=secret,id=npm_token \
    NPM_TOKEN=$(cat /run/secrets/npm_token) npm ci
```

- Inject runtime secrets through the orchestrator — Kubernetes `Secret` mounted
  as a file, ECS task secrets, systemd credentials.
- A Kubernetes `Secret` is **base64, not encrypted**, at rest by default. Enable
  encryption at rest, restrict RBAC on the `secrets` resource, and prefer an
  external-secrets operator backed by a real manager.

---
</rules>

# Rotation

<rules>
- **Rotate on a schedule** and **immediately on any suspicion** of exposure.
- Design every integration to support **two valid credentials at once**, so
  rotation is: issue new → deploy → verify → revoke old. Without overlap,
  rotation means downtime, and rotation that means downtime does not happen.
- Prefer **short-lived, automatically issued credentials** over long-lived static
  ones: IAM roles, workload identity, OIDC federation from CI. The best secret is
  the one that expires in an hour without anyone acting.
- Keep an inventory: what exists, who can read it, when it was last rotated. An
  unrotatable secret nobody owns is the one that ends up in an incident report.

---
</rules>

# When a secret leaks

<rules>
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
</rules>

# Anti-patterns

<antipatterns>
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
</antipatterns>

# Checklist

<checklist>
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
</checklist>
