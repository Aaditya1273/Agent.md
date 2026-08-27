---
targetModels:
  - "Claude Fable 5"
  - "Claude Opus 5"
  - "Claude Sonnet 5"
  - "Claude 5 Family"
  - "Future Claude Models"
name: versioning
category: API
description: Versioning an HTTP API without stranding clients — what counts as breaking, where the version lives, and how to deprecate on a schedule people can plan around.
license: MIT
author: Agent.md maintainers
last-verified: 2026-08-23
reviewed-by: unreviewed
---
<!-- Generated from models/_canonical by scripts/build-model-variants.js.
     Edit the canonical source, not this file. Structure adapted for Claude per deep-research.md. -->
# Purpose

<purpose>
Rules for evolving a published API. The goal is not to avoid change — it is to
make change predictable, so integrators can plan. Every version you support is a
permanent maintenance cost, so the second goal is to need as few as possible.

---
</purpose>

# What is breaking

<rules>
| Change | Breaking |
| --- | --- |
| Adding an optional response field | No |
| Adding an optional request field | No |
| Adding a new endpoint | No |
| Adding a new enum value | **Yes** — clients with exhaustive switches fail |
| Removing or renaming a field | Yes |
| Changing a field's type or nullability | Yes |
| Making an optional request field required | Yes |
| Tightening validation on an existing field | Yes |
| Changing a default value | Yes |
| Changing pagination or sort order | Yes |
| Changing an error code for the same condition | Yes |
| Changing HTTP status for the same condition | Yes |

Two of these are routinely missed. **New enum values** break clients that switch
exhaustively — document from day one that clients must handle unknown values, and
ship an `"unknown"`/default branch in your own SDKs. **Tightened validation** turns
previously-accepted requests into `400`s; it is breaking even though the schema
looks unchanged.

Rule of thumb: if a request that worked yesterday now fails, or a response a
client parsed yesterday now fails to parse, it is breaking.

---
</rules>

# Where the version goes

<rules>
| Location | Example | Trade-off |
| --- | --- | --- |
| URL path | `/v1/orders` | Visible, cacheable, trivially routable. **Default.** |
| Header | `API-Version: 2026-08-23` | Clean URLs; invisible in logs and curl; easy to forget |
| Date-based header | Stripe-style, pinned per account | Best for large surfaces; most machinery to build |
| Query parameter | `?version=1` | Easy to drop accidentally; pollutes caching |
| `Accept` media type | `application/vnd.acme.v1+json` | Correct by the spec; awkward in practice |

Use a **major version in the path** unless you have a specific reason not to. It
survives proxies, appears in every log line, and a developer can read it off a
curl command.

Version the **API surface**, not each endpoint. Per-endpoint versions produce a
matrix nobody can reason about and a client that must track dozens of numbers.

Pin the version **per integration**, not per request, for large surfaces: the
account's version is recorded at signup and applied to all its calls, with an
explicit opt-in upgrade. This is what lets you ship breaking changes without
breaking anyone.

---
</rules>

# Prefer expansion to a new version

<rules>
A new major version doubles your test surface and your on-call burden. Before
cutting one, check whether the change fits inside the current version:

- **Add alongside.** Ship `amountCents` next to a deprecated `amount`, populate
  both, and remove the old one at the next major.
- **Opt-in behaviour.** A request field or header selects the new behaviour;
  absent means the old behaviour.
- **New endpoint.** `POST /v1/orders/bulk` beside `POST /v1/orders` avoids
  redefining an existing contract.

Reserve a major version for changes that genuinely cannot coexist — a
restructured resource model, a changed authentication scheme.

---
</rules>

# Deprecation

<rules>
Announce, signal, then remove. Never remove without all three.

```
Deprecation: Sun, 01 Mar 2026 00:00:00 GMT
Sunset: Wed, 01 Sep 2026 00:00:00 GMT
Link: <https://docs.example.com/migrate/v2>; rel="deprecation"
Warning: 299 - "v1 is deprecated; migrate to v2 by 2026-09-01"
```

`Deprecation` and `Sunset` are standard headers (RFC 8594 for `Sunset`) and
tooling reads them. Emit them from the moment of announcement.

A workable timeline for a public API:

| Stage | Timing |
| --- | --- |
| Announce, publish a migration guide | T |
| `Deprecation` / `Sunset` headers live | T |
| Direct email to identified users of the old version | T, T+3mo, T−1mo |
| Brownout: short scheduled outages of the old version | T+9mo |
| Removal | T+12mo minimum |

**Never** remove a version without per-consumer usage data. Log the version on
every request, aggregate by API key, and contact the remaining callers directly.
Removing a version you have not measured is how an unannounced outage happens.

Brownouts — deliberately failing the old version for ten minutes, announced in
advance — surface the integrations whose owners never read email, while the fix
is still cheap.

---
</rules>

# Contract enforcement

<rules>
Version drift is a testing problem before it is a policy problem.

```bash
</rules>

# Fail the build on a breaking OpenAPI change

<rules>
oasdiff breaking spec/v1.openapi.yaml spec/v1.openapi.new.yaml --fail-on ERR
```

- Keep an OpenAPI document per major version, generated from the code where
  possible, and diff it in CI. → `API/open-api`
- Contract tests run the previous version's recorded requests against the current
  build. A test suite that only tests today's shape cannot detect a break.
- Publish a changelog per version with dates, and link it from the docs.

```yaml
</rules>

# .github/workflows/api-contract.yml

<rules>
- name: Detect breaking API changes
  run: |
    git show origin/main:spec/v1.openapi.yaml > /tmp/base.yaml
    npx oasdiff breaking /tmp/base.yaml spec/v1.openapi.yaml \
      --fail-on ERR --format githubactions
```

| Tool | Role |
| --- | --- |
| `oasdiff` | Breaking-change detection between two OpenAPI documents |
| `openapi-diff` | Alternative differ; JSON output for dashboards |
| `pact` / `pactflow` | Consumer-driven contract tests across services |
| `schemathesis` | Property-based fuzzing against the OpenAPI document |
| `buf breaking` | The equivalent gate for gRPC/protobuf surfaces |

Record the version on every request as a structured log field
(`api_version="v1"`, `consumer_id=…`) so usage is queryable by consumer. That
field is what makes a removal decision defensible. → `Backend/logging`

---
</rules>

# Anti-patterns

<antipatterns>
| Anti-pattern | Why it fails | Fix |
| --- | --- | --- |
| No version at all | The first breaking change strands every client | Version from the first release |
| Version per endpoint | Unreasonable matrix for clients and tests | Version the surface |
| Adding an enum value silently | Exhaustive client switches fail | Document unknown-value handling; treat as breaking |
| Tightening validation in place | Previously valid requests start failing | New version or opt-in |
| Removing a field "nobody uses" | Nobody measured | Per-consumer usage logging |
| Deprecating without headers | Tooling and clients never see it | `Deprecation` + `Sunset` |
| Sunset date under six months | Integrators cannot plan | 12 months for a public API |
| Version only in a header | Invisible in logs and support tickets | Path version |
| Supporting versions indefinitely | Unbounded maintenance and security surface | Enforce the sunset |
| Cutting a major for an additive change | Doubles cost for nothing | Add alongside |
| No OpenAPI diff in CI | Breaks ship unnoticed | `oasdiff` gate |

---
</antipatterns>

# Checklist

<checklist>
- [ ] A version identifier is present from the first public release
- [ ] The major version is in the URL path, or a documented pinned-per-account scheme
- [ ] The API surface is versioned as a whole, not per endpoint
- [ ] The list of breaking changes is written down and agreed by the team
- [ ] Clients are documented as required to ignore unknown fields and enum values
- [ ] Additive changes are preferred over new major versions
- [ ] Version usage is logged per consumer and reviewed before any removal
- [ ] `Deprecation` and `Sunset` headers are emitted from announcement
- [ ] A migration guide is published alongside the deprecation
- [ ] The sunset window is at least 12 months for a public API
- [ ] Brownouts are scheduled and announced before removal
- [ ] CI fails on a breaking OpenAPI diff within a version
</checklist>
