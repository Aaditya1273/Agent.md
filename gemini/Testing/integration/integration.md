---
targetModels:
  - "Gemini 3.6 Flash"
  - "Gemini 3.5 Flash"
  - "Gemini 3.1 Pro"
  - "Gemini 3 Family"
  - "Future Gemini Models"
name: integration
category: Testing
description: Testing across real boundaries — real databases in containers, isolation between tests, and faking third parties without faking their behaviour.
license: MIT
author: Agent.md maintainers
last-verified: 2026-08-23
reviewed-by: unreviewed
---
<!-- Generated from models/_canonical by scripts/build-model-variants.js.
     Edit the canonical source, not this file. Structure adapted for Gemini per deep-research.md. -->


# Purpose

Rules for tests that exercise more than one component together — your code plus a
real database, a real HTTP layer, a real queue.

Integration tests exist to catch what unit tests structurally cannot: wrong SQL,
a missing migration, a serialisation mismatch, a transaction that does not roll
back, middleware ordering. **Every one of those bugs passes a suite of green unit
tests**, because the mock agreed with the misunderstanding.

---

# Use the real dependency

Run the actual database, not an in-memory substitute.

```js
// SQLite standing in for Postgres will not catch: JSONB operators, array
// columns, `ON CONFLICT` semantics, partial indexes, or citext behaviour.
const container = await new PostgreSqlContainer("postgres:16").start();
process.env.DATABASE_URL = container.getConnectionUri();
await migrate();                       // run real migrations, not a schema dump
```

- Use **Testcontainers**, Docker Compose, or a dedicated test instance. Pin the
  **same major version** as production.
- **Run the real migrations** in the test setup. This is how you learn that
  migration 47 fails on a table with data — a class of failure no other test
  catches.
- **Never** substitute SQLite for Postgres or MySQL. The dialects differ where
  bugs live.

---

# Isolation

Tests must not see each other's data, and must be safe to run in parallel.

| Strategy | Speed | Isolation | Notes |
| --- | --- | --- | --- |
| **Transaction rollback** | Fastest | Strong | Cannot test code that commits or uses its own transactions |
| **Truncate between tests** | Fast | Strong | Simple and predictable; the sane default |
| **Schema per worker** | Fast | Strong | Best for parallel runs |
| **Database per worker** | Slower | Strongest | Heaviest, most faithful |
| Shared database, no cleanup | — | **None** | Order-dependent; never do this |

```js
afterEach(async () => {
  // Truncate every table in one statement; RESTART IDENTITY keeps ids stable
  await db.$executeRawUnsafe(`
    TRUNCATE TABLE ${tables.join(", ")} RESTART IDENTITY CASCADE
  `);
});
```

**Never** rely on tests running in a particular order, and **never** let one test
depend on data another created. Each test builds what it needs.

Prefer **factories** over shared fixtures — a function that creates a valid record
with sensible defaults and accepts overrides. A fixture file that every test reads
becomes a coupling point nobody dares change.

---

# Third parties

Do not call real external APIs from tests. They are slow, rate-limited, and turn
an unrelated outage into a red build.

| Approach | When |
| --- | --- |
| **HTTP-level fake** (`msw`, `nock`, WireMock) | Default — intercepts at the boundary, exercises your real client code |
| **Provider sandbox** (Stripe test mode) | Where behaviour is complex and the sandbox is faithful |
| **Contract tests** (Pact) | Where both sides are yours and can be verified |
| Mocking the SDK object | Avoid — tests your assumption about the SDK |

Record real responses once and replay them, so the fake reflects what the provider
actually returns rather than what the documentation claims:

```js
server.use(
  http.post("https://api.stripe.com/v1/charges", () =>
    HttpResponse.json(recordedChargeResponse, { status: 200 })
  )
);
```

**Always fake the failure modes too** — timeout, `429`, `500`, malformed body,
partial response. Untested error paths are where integration bugs hide, and the
happy path is the one part unit tests already covered.

---

# Tooling

| Need | Options |
| --- | --- |
| Ephemeral dependencies | `testcontainers`, `docker-compose`, `dockertest` |
| HTTP-level faking | `msw`, `nock`, `WireMock`, `responses` |
| Driving the API | `supertest`, `hurl`, `httpx`, `RestAssured` |
| Contract verification | `pact`, `spring-cloud-contract` |
| Fixtures | `fishery`, `factory_bot`, `factory_boy` |

Transaction-rollback isolation in practice: open a transaction in `beforeEach`,
hand the transaction-scoped client to the code under test, and `ROLLBACK` in
`afterEach`. It is the fastest strategy, but it breaks the moment the code under
test issues its own `BEGIN`/`COMMIT`, or relies on `pg_notify`, advisory locks, or
a connection pool that hands out a second connection. When that happens, fall back
to `TRUNCATE` rather than fighting it.

# What to test at this level

| Test here | Do not test here |
| --- | --- |
| Query correctness against a real schema | Business rules → `Testing/unit` |
| Migrations applying cleanly to seeded data | Pure calculations → `Testing/unit` |
| Transaction and rollback behaviour | Full user journeys → `Testing/e2e` |
| Authorisation scoping across tenants | CSS and layout → `Testing/visual` |
| HTTP contract: status, shape, headers | Third-party internals |
| Serialisation round-trips | |

Test the API through its real HTTP surface, not by calling handlers directly:

```js
const res = await request(app)
  .get("/api/invoices/inv_44c")
  .set("Authorization", `Bearer ${tokenForOtherTenant}`);

expect(res.status).toBe(404);          // not 403 — see Security/authorization
```

That test catches middleware ordering, serialisation and authorisation together —
none of which a direct handler call exercises.

---

# Keeping them fast

Integration tests are slower by nature; keep them from becoming the reason nobody
runs the suite.

- **Start containers once per run**, not per test file. Reuse across the suite.
- **Parallelise by worker** with a schema or database each.
- Seed the **minimum** needed. A 500-row fixture where 2 rows suffice costs on
  every test.
- Keep the ratio sane: many unit tests, a meaningful layer of integration tests, a
  handful of end-to-end tests. Inverting that produces a suite that takes 40
  minutes and gets skipped.
- Run them on **every pull request**, not nightly. A failure found a day later has
  already been built on.

---

# Anti-patterns

| Anti-pattern | Why it fails | Fix |
| --- | --- | --- |
| SQLite standing in for Postgres | Dialect differences hide real bugs | Same engine and major version |
| Applying a schema dump, not migrations | Migration bugs never surface | Run real migrations |
| Shared database with no cleanup | Order-dependent and flaky | Truncate or transaction per test |
| Tests depending on seed data | Breaks when the seed changes | Factories per test |
| Calling real third-party APIs | Slow, rate-limited, externally flaky | HTTP-level fake |
| Mocking the SDK object | Tests your assumption of the SDK | Intercept at HTTP |
| Only faking success responses | Error paths untested | Fake `429`, `500`, timeout |
| Calling handlers directly | Skips middleware and serialisation | Drive the real HTTP surface |
| Container per test file | Suite takes minutes to start | One per run, reused |
| Integration tests nightly only | Failures found a day late | Run on every pull request |

---

# Checklist

- [ ] Verify: Tests run against the same database engine and major version as production
- [ ] Verify: Real migrations are applied in setup, not a schema dump
- [ ] Verify: Each test is isolated by transaction, truncation, or per-worker schema
- [ ] Verify: No test depends on another's data or on execution order
- [ ] Verify: Test data comes from factories with overrides, not shared fixtures
- [ ] Verify: No real external API is called; fakes intercept at the HTTP boundary
- [ ] Verify: Failure modes are faked as well as success
- [ ] Verify: The API is exercised through its real HTTP surface
- [ ] Verify: Cross-tenant authorisation is covered with two tenants
- [ ] Verify: Containers start once per run and tests parallelise by worker
- [ ] Verify: The suite runs on every pull request
