---
targetModels:
  - "Gemini 3.6 Flash"
  - "Gemini 3.5 Flash"
  - "Gemini 3.1 Pro"
  - "Gemini 3 Family"
  - "Future Gemini Models"
name: open-api
category: API
description: OpenAPI specifications that stay true — generating from code, gating breaking changes in CI, and producing docs and SDKs from one source.
license: MIT
author: Agent.md maintainers
last-verified: 2026-08-23
reviewed-by: unreviewed
---
<!-- Generated from models/_canonical by scripts/build-model-variants.js.
     Edit the canonical source, not this file. Structure adapted for Gemini per deep-research.md. -->


# Purpose

Rules for OpenAPI (3.1). The value of a specification is entirely in whether it
matches the running service. A hand-written document that drifts is worse than no
document — it makes integrators confident and wrong.

Everything here serves one goal: **make drift impossible, mechanically.**

---

# One source of truth

Pick a direction and enforce it. Both work; maintaining the spec and the code
independently does not.

| Approach | Source | Generates | Best for |
| --- | --- | --- | --- |
| Code-first | Route + schema definitions | The OpenAPI document | Existing services, TypeScript/Python stacks |
| Spec-first | The OpenAPI document | Server stubs, types, clients | New APIs, multi-team contracts |

```ts
// Code-first: the validator and the spec come from the same zod schema,
// so a route that validates differently than it documents cannot exist.
const OrderSchema = z.object({ id: z.string(), totalCents: z.number().int() });
registry.registerPath({
  method: "get", path: "/v1/orders/{id}",
  responses: { 200: { content: { "application/json": { schema: OrderSchema } } } },
});
```

Tooling worth naming: `zod-to-openapi`, `@asteasolutions/zod-to-openapi`,
`fastapi` (spec is a by-product), `drf-spectacular`, `springdoc-openapi`,
`tsoa`, `huma`. Spec-first: `openapi-generator`, `orval`, `openapi-typescript`,
`oapi-codegen`.

**Never** hand-maintain a spec beside hand-written route handlers. It will drift
within one sprint, and nobody will notice until an integrator does.

---

# Write it so it is usable

```yaml
paths:
  /v1/orders/{id}:
    get:
      operationId: getOrder          # becomes the SDK method name — keep it stable
      summary: Fetch an order
      parameters:
        - { name: id, in: path, required: true, schema: { type: string } }
      responses:
        "200":
          description: The order
          content:
            application/json:
              schema: { $ref: "#/components/schemas/Order" }
              examples:
                paid: { $ref: "#/components/examples/PaidOrder" }
        "404": { $ref: "#/components/responses/NotFound" }
        "429": { $ref: "#/components/responses/RateLimited" }
```

| Rule | Why |
| --- | --- |
| `operationId` on every operation, stable | It is the generated SDK method name; renaming it breaks clients |
| `$ref` shared schemas in `components` | Inline duplicates diverge |
| Document error responses, not just `200` | Clients must handle `4xx`/`429` |
| Realistic `examples` | Placeholder `"string"` examples teach nothing |
| `securitySchemes` applied per operation | Readers must know what each call needs |
| `format`, `pattern`, `minimum`, `maxLength` | Generators emit validation from these |
| `deprecated: true` with a sunset note | → `API/versioning` |
| `nullable` explicit (3.1: `type: [string, "null"]`) | Ambiguity becomes a client crash |

Group with `tags`, and order them for a reader who has never seen the API.

---

# Gate it in CI

Four checks, all cheap:

```yaml
- run: npx @redocly/cli lint spec/openapi.yaml --format=github     # valid + style
- run: npx oasdiff breaking origin/main:spec/openapi.yaml spec/openapi.yaml --fail-on ERR
- run: npx @stoplight/spectral-cli lint spec/openapi.yaml          # house rules
- run: npx schemathesis run spec/openapi.yaml --base-url=$URL      # spec vs reality
```

1. **Validity and style** — `redocly lint` or `spectral`. Add house rules: every
   operation has an `operationId`, a description, and a documented `4xx`.
2. **Breaking-change diff** — `oasdiff breaking` against the merge base. This is
   the check that actually prevents outages.
3. **Spec matches the running service** — `schemathesis` generates requests from
   the spec and asserts responses conform. It finds drift no diff can.
4. **Regenerate and commit** — if the spec is generated, CI regenerates it and
   fails when the committed file differs. Same pattern as any generated artefact.

Contract tests between services close the loop: the consumer's recorded
expectations run against the provider's build. → `Testing/integration`

---

# Downstream artefacts

One spec should produce everything, so nothing is written twice:

- **Reference docs** — Redoc, Scalar, Stoplight Elements. Never a hand-written
  endpoint table.
- **Typed clients** — `openapi-typescript` for types, `orval`/`openapi-generator`
  for full SDKs. Publish them versioned alongside the API.
- **Mock servers** — Prism serves the spec, so frontend work starts before the
  backend exists.
- **Postman / Bruno collections** — imported from the spec, not curated by hand.

Publish the spec at a stable URL (`/openapi.json`), versioned. Integrators, their
code generators and their AI tooling all read it directly.

**Never** hand-edit a generated SDK. The next regeneration discards it; fix the
spec or the generator template.

---

# Anti-patterns

| Anti-pattern | Why it fails | Fix |
| --- | --- | --- |
| Spec maintained separately from code | Drifts within a sprint | Generate one from the other |
| No `operationId` | Generators emit unstable method names | Stable ids everywhere |
| Renaming an `operationId` | Breaks every generated SDK | Treat as breaking |
| Only `200` documented | Clients cannot handle failure | Document `4xx`, `429`, `5xx` |
| Inline duplicated schemas | Copies diverge | `$ref` into `components` |
| Placeholder examples | Teach nothing; hide required shapes | Realistic examples |
| No breaking-change gate | Breaks ship silently | `oasdiff` in CI |
| Never testing spec against reality | Documented behaviour is fiction | `schemathesis` |
| Generated spec not committed | Cannot diff, cannot review | Commit and check freshness in CI |
| Hand-written reference docs | Second source of truth | Render from the spec |
| Hand-edited generated SDK | Lost on regeneration | Fix spec or template |
| Unpublished spec | Integrators cannot generate clients | Serve at a stable versioned URL |

---

# Checklist

- [ ] Verify: One direction — code-first or spec-first — is chosen and enforced
- [ ] Verify: Request validation and the spec derive from the same schema definitions
- [ ] Verify: Every operation has a stable `operationId`, summary and description
- [ ] Verify: Error responses including `4xx` and `429` are documented
- [ ] Verify: Shared schemas live in `components` and are referenced, not duplicated
- [ ] Verify: Examples are realistic and reflect actual payloads
- [ ] Verify: `securitySchemes` are declared and applied per operation
- [ ] Verify: Constraints (`pattern`, `minimum`, `maxLength`) are expressed in the schema
- [ ] Verify: CI lints the spec against house rules
- [ ] Verify: CI fails on a breaking diff against the merge base
- [ ] Verify: The running service is tested against the spec
- [ ] Verify: A generated spec is committed and checked for freshness in CI
- [ ] Verify: Docs, SDKs and mocks are all generated from the spec
- [ ] Verify: The spec is published at a stable, versioned URL
