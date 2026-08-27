---
targetModels:
  - "Claude Fable 5"
  - "Claude Opus 5"
  - "Claude Sonnet 5"
  - "Claude 5 Family"
  - "Future Claude Models"
name: environments
category: DevOps
description: Managing dev, staging and production — configuration injected not baked, parity that matters, environment variable validation, and safe test data.
license: MIT
author: Agent.md maintainers
last-verified: 2026-08-23
reviewed-by: unreviewed
---
<!-- Generated from models/_canonical by scripts/build-model-variants.js.
     Edit the canonical source, not this file. Structure adapted for Claude per deep-research.md. -->
# Purpose

<purpose>
Rules for running the same software in several environments. The goal is that a
change verified in one environment behaves the same in the next — which requires
that the **only** difference between them is configuration.

If the artefact differs, the verification proved nothing. → `DevOps/cicd`

---
</purpose>

# One artefact, configuration injected

<rules>
```
Build once  →  image sha256:abc…  →  staging (config A)  →  production (config B)
```

- **Never** build a per-environment image. `docker build --build-arg ENV=prod`
  produces something staging never tested.
- Configuration arrives at **runtime**, from environment variables or a secret
  store, never from a file baked into the image.
- Frontend builds are the awkward case: `NEXT_PUBLIC_*` and equivalent are inlined
  at build time. Either build per environment for those specific values and accept
  it, or serve them from a runtime endpoint. Decide deliberately and document it.

---
</rules>

# Validate configuration at startup

<rules>
```ts
const Env = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]),
  DATABASE_URL: z.string().url(),
  SESSION_SECRET: z.string().min(32),
  STRIPE_KEY: z.string().startsWith("sk_"),
  LOG_LEVEL: z.enum(["debug", "info", "warn", "error"]).default("info"),
});

export const env = Env.parse(process.env);     // crash at boot, not at 3am
```

A missing or malformed variable should stop the process **at startup**, before it
accepts traffic. The alternative is discovering it when one rarely-used code path
runs at 3am, having reported healthy for days.

- **No defaults for secrets.** A fallback `SESSION_SECRET = "dev"` will reach
  production and will be found.
- Defaults are fine for genuinely optional tuning values.
- Fail on unknown variables in strict deployments to catch typos
  (`DATBASE_URL=…` silently ignored is a real outage).

---

```bash
</rules>

# A production shell should be unmistakable. Same idea in the app: a banner

# rendered whenever APP_ENV != "production".

<rules>
export PS1="\[\e[41;97m\] PRODUCTION \[\e[0m\] \w $ "
```
</rules>

# The environments and what each is for

<rules>
| Environment | Data | Purpose | External services |
| --- | --- | --- | --- |
| Local | Seeded, synthetic | Development | Stubbed or sandboxed |
| CI | Ephemeral, per run | Verification | Containers, mocks |
| Preview (per PR) | Seeded or shared | Review of one change | Sandbox |
| Staging | Production-**shaped**, anonymised | Pre-release verification | Sandbox |
| Production | Real | Users | Live |

Rules:

- **Every environment gets its own credentials.** A key shared between staging and
  production means a staging compromise is a production compromise.
- Staging uses the vendor's **sandbox** keys. A test run charging real cards or
  emailing real customers happens exactly once per organisation, and it is
  memorable.
- Preview environments per pull request are worth the cost — they catch what
  local development cannot, and they let reviewers see the change.
- Tear down preview environments on merge, or the cost and the credential surface
  grow without limit.

---
</rules>

# Parity that matters

<rules>
Full production parity is unaffordable. Match the things that change behaviour:

| Must match | Need not match |
| --- | --- |
| Database engine and **major version** | Instance size |
| Runtime version | Replica count |
| Operating system / base image | Region count |
| Feature flag mechanism | Data volume (but see below) |
| Authentication flow | CDN configuration |

Two that are commonly wrong:

- **SQLite locally, Postgres in production** guarantees behaviour differences in
  transactions, types, constraints and concurrency. Run the real engine locally in
  a container. → `Database/postgres`
- **Tiny staging datasets** hide every query-plan problem. Query plans depend on
  data distribution, so a query that is instant on 100 rows can be an outage on
  10 million. Use production-shaped volume where performance matters.
  → `Database/query-optimization`

---
</rules>

# Production data does not leave production

<rules>
- Never copy a production database into staging or a laptop unmasked. It is a data
  breach whether or not anyone notices.
- Restore through an **anonymisation** step: replace names, emails, phone numbers
  and payment details; keep the shape, cardinality and distribution so query plans
  stay representative.
- Access to production data requires a distinct, audited, time-limited grant.
- Deletion obligations follow the copy: a GDPR erasure request applies to the
  staging copy too. → `Database/backup`

---
</rules>

# Make the environment obvious

<rules>
Acting on production believing it is staging is a recurring and expensive class of
incident.

- Show the environment in the UI (a banner in anything non-production), in the CLI
  prompt, and in every log line as a field.
- Require an explicit confirmation for destructive production commands.
- Colour-code dashboards and terminal profiles.
- Never point a local development environment at the production database, however
  briefly.

| Variable | Purpose | Set per environment |
| --- | --- | --- |
| `APP_ENV` | The environment's own name — drives banners and log fields | Yes |
| `NODE_ENV` | Framework behaviour; only `production` in production | Yes |
| `DATABASE_URL` / `DATABASE_POOLER_URL` | Pooled connection string | Yes |
| `DIRECT_URL` | Unpooled, for migrations only → `Database/prisma` | Yes |
| `SESSION_SECRET` | Signing key; no default, ever | Yes |
| `LOG_LEVEL` | Runtime-tunable verbosity → `Backend/logging` | Yes |
| `OTEL_SERVICE_NAME` / `OTEL_RESOURCE_ATTRIBUTES` | Ties signals to a service and environment | Yes |
| `GIT_SHA` | The deployed commit, echoed in logs and health output | Yes |

`APP_ENV` rather than overloading `NODE_ENV`: frameworks treat `NODE_ENV` as a
binary production/development switch, so a staging deployment must still set
`NODE_ENV=production` while `APP_ENV=staging` drives everything you control.

---
</rules>

# Anti-patterns

<antipatterns>
| Anti-pattern | Why it fails | Fix |
| --- | --- | --- |
| Per-environment builds | Staging verified something else | Build once, promote |
| Configuration baked into the image | Cannot promote one artefact | Runtime injection |
| Missing variables discovered at runtime | Fails on one path, at 3am | Validate and crash at startup |
| Default value for a secret | The fallback reaches production | No secret defaults |
| Typo'd variable silently ignored | Feature silently off | Fail on unknown variables |
| Shared credentials across environments | Staging compromise reaches production | Separate credentials |
| Live vendor keys in staging | Real charges, real emails | Sandbox keys |
| Different database engine locally | Behaviour differences everywhere | Same engine and major version |
| Tiny staging dataset | Query plans differ; outages found in production | Production-shaped volume |
| Unmasked production data copied out | Data breach | Anonymise on restore |
| Persistent preview environments | Unbounded cost and credential surface | Tear down on merge |
| No visible environment indicator | Production commands run by mistake | Banner, prompt, log field |
| Local pointed at production | One typo destroys real data | Never |

---
</antipatterns>

# Checklist

<checklist>
- [ ] One artefact is built and promoted unchanged across environments
- [ ] All configuration is injected at runtime
- [ ] Build-time-inlined frontend values are an explicit, documented exception
- [ ] Environment variables are schema-validated at startup
- [ ] The process refuses to start on missing or malformed configuration
- [ ] No secret has a default value
- [ ] Unknown variables are rejected in strict deployments
- [ ] Each environment has its own credentials
- [ ] Staging uses sandbox keys for every external service
- [ ] Preview environments exist per pull request and are torn down on merge
- [ ] Database engine and major version match production everywhere
- [ ] Runtime and base image versions match production
- [ ] Performance-relevant environments carry production-shaped data volume
- [ ] Production data is anonymised before entering any other environment
- [ ] Production access is separately granted, time-limited and audited
- [ ] The environment is visible in the UI, the shell and every log line
- [ ] Destructive production commands require explicit confirmation
</checklist>
