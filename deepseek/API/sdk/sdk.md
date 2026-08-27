---
targetModels:
  - "DeepSeek V4"
  - "DeepSeek V3.2"
  - "DeepSeek R1"
  - "DeepSeek V3 Family"
  - "Future DeepSeek Models"
name: sdk
category: API
description: Publishing client SDKs that stay correct — generation from the spec, retries and idempotency, typed errors, versioning, and release automation.
license: MIT
author: Agent.md maintainers
last-verified: 2026-08-23
reviewed-by: unreviewed
---
<!-- Generated from models/_canonical by scripts/build-model-variants.js.
     Edit the canonical source, not this file. Structure adapted for DeepSeek per deep-research.md. -->


# Purpose

Rules for shipping client libraries for your API. An SDK is a second public
contract with a second deprecation cycle, so the only sustainable approach is to
**generate it from the specification** and hand-write as little as possible.

An SDK's job is to remove work the caller would otherwise repeat badly: auth,
retries, pagination, error typing, and idempotency. It is not a place for
business logic. → `API/open-api`

---

# Generate, do not maintain

```bash
# Types only — smallest surface, no runtime dependency
npx openapi-typescript spec/openapi.json -o src/schema.d.ts

# Full typed client
npx orval --config orval.config.ts
```

| Language | Generator |
| --- | --- |
| TypeScript | `openapi-typescript`, `orval`, `@hey-api/openapi-ts` |
| Python | `openapi-python-client`, `datamodel-code-generator` |
| Go | `oapi-codegen` |
| Java / Kotlin | `openapi-generator` |
| Rust | `progenitor` |
| Multi-language, commercial | Stainless, Speakeasy, Fern |

The hand-written layer is a thin wrapper: transport, auth, retries, pagination
helpers, error classes. Everything shaped by the API is generated.

- Regenerate in CI on every spec change, and fail if the committed output differs.
- **Never** hand-edit generated files. The next regeneration discards the edit;
  fix the spec or the generator template.
- Method names come from `operationId`, so renaming one is a breaking SDK change.
  → `API/versioning`

---

# What the SDK must handle

```ts
const client = new Acme({
  apiKey: process.env.ACME_API_KEY,   // never a hard-coded default
  baseUrl: process.env.ACME_BASE_URL ?? "https://api.acme.com",
  timeout: 30_000,
  maxRetries: 3,
});
```

| Concern | Behaviour |
| --- | --- |
| Retries | `429`, `5xx`, connection errors and timeouts only. Exponential backoff **with jitter**, honouring `Retry-After` |
| Idempotency | Generate and attach an `Idempotency-Key` on every retryable write, **stable across retries of the same call** |
| Timeouts | A default request timeout, overridable per call |
| Pagination | An async iterator, so callers never hand-roll cursor loops |
| Errors | Typed classes carrying status, machine code and `requestId` |
| Auth | From the environment by default; never logged, never in a URL |
| User agent | `acme-node/2.3.1 node/22.4` — makes support and deprecation outreach possible |

```ts
// The auto-generated idempotency key must not change between retries, or a
// timeout-then-retry creates two charges.
for await (const order of client.orders.list({ status: "paid" })) { … }
```

**Never** retry a non-idempotent request without an idempotency key. The default
retry policy plus a `POST /payments` is how a customer is charged twice.

**Never** retry `4xx` other than `429` and `408` — the request is wrong, not late.

---

# Errors

```ts
try {
  await client.payments.create({ amountCents: 5000, currency: "EUR" });
} catch (e) {
  if (e instanceof InsufficientFundsError) { … }        // typed, branchable
  if (e instanceof RateLimitError) { await sleep(e.retryAfterMs); }
  if (e instanceof AcmeApiError) console.error(e.requestId, e.code, e.status);
}
```

- One base error class, with subclasses per category (auth, validation, rate
  limit, server, network).
- Always expose `status`, `code` and `requestId`. The `requestId` is what makes a
  support ticket resolvable.
- Never swallow an error into a `null` return. The caller cannot distinguish
  "absent" from "failed".
- Never include the API key in an error message or a serialised request dump.

---

# Versioning and release

- **SemVer**, judged from the SDK consumer's perspective: a new optional API field
  is a minor bump; a renamed method is a major one even if the API call is
  unchanged.
- Record the API version the SDK targets, and send it as a header.
- Publish a changelog with every release, generated from Conventional Commits.
- Automate publishing (`semantic-release`, `changesets`) — a manual release
  process produces skipped versions and unpublished fixes.
- Support the runtime versions your users actually run, declare them in
  `engines`/`python_requires`, and test the oldest in CI.
- Ship provenance/attestation (`npm publish --provenance`) so consumers can verify
  the artefact came from your repository.

---

# Packaging and ergonomics

- Zero or near-zero runtime dependencies. Every dependency is a supply-chain
  surface and a version conflict for the consumer.
- Ship ESM **and** CJS with correct `exports` conditions; ship type definitions.
- Support cancellation (`AbortSignal`, `context`) on every call.
- Allow injecting a custom `fetch`/transport for proxies and instrumentation.
- Make the first call work in under five minutes: install, set one environment
  variable, copy one runnable example from the README.
- Ship a runnable example per major workflow, tested in CI so it cannot rot.
  → `Documentation/api-docs`

---

# Anti-patterns

| Anti-pattern | Why it fails | Fix |
| --- | --- | --- |
| Hand-written client for a large API | Drifts from the spec immediately | Generate from OpenAPI |
| Hand-edited generated files | Lost on regeneration | Fix the spec or template |
| Generated output not committed | No diff, no review | Commit and check freshness in CI |
| Retrying non-idempotent writes | Duplicate charges | Idempotency key, stable across retries |
| Retrying all `4xx` | Hammering a permanently invalid request | `429`/`408` only |
| Fixed-interval retries | Synchronised thundering herd | Backoff with jitter |
| Ignoring `Retry-After` | Fights the server's own guidance | Honour it |
| No request timeout | Hangs forever on a stalled connection | Default timeout |
| Untyped errors | Callers parse message strings | Error class hierarchy |
| No `requestId` on errors | Support tickets unresolvable | Expose it |
| Manual cursor loops left to callers | Everyone implements it differently, some wrongly | Async iterator |
| API key in the user agent or URL | Leaks into logs | `Authorization` header only |
| Heavy dependency tree | Supply-chain surface and version conflicts | Near-zero dependencies |
| Manual publishing | Skipped versions, unpublished fixes | Automated release |
| No deprecation signalling | Users discover removal at runtime | Warn on deprecated methods |

---

# Checklist

- [ ] The API-shaped surface is generated from the OpenAPI/proto specification
- [ ] Generated output is committed and CI fails when it is stale
- [ ] No generated file is hand-edited
- [ ] Retries cover only `429`, `408`, `5xx`, timeouts and connection errors
- [ ] Backoff is exponential with jitter and honours `Retry-After`
- [ ] Retryable writes carry an idempotency key that is stable across retries
- [ ] A default request timeout exists and is overridable per call
- [ ] Pagination is exposed as an async iterator
- [ ] Errors are typed and expose `status`, `code` and `requestId`
- [ ] Credentials are read from the environment, never logged or placed in URLs
- [ ] A descriptive user agent identifies SDK and runtime versions
- [ ] Cancellation is supported on every call
- [ ] Runtime dependencies are minimal and declared support ranges are tested
- [ ] SemVer is applied from the consumer's perspective, with a published changelog
- [ ] Releases are automated, with provenance attestation
- [ ] A runnable quickstart example is tested in CI
