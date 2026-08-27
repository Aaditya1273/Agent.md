---
targetModels:
  - "Gemini 3.6 Flash"
  - "Gemini 3.5 Flash"
  - "Gemini 3.1 Pro"
  - "Gemini 3 Family"
  - "Future Gemini Models"
name: e2e
category: Testing
description: End-to-end tests that are worth their cost — user-visible selectors, deterministic waiting, and keeping the suite small enough to trust.
license: MIT
author: Agent.md maintainers
last-verified: 2026-08-23
reviewed-by: unreviewed
---
<!-- Generated from models/_canonical by scripts/build-model-variants.js.
     Edit the canonical source, not this file. Structure adapted for Gemini per deep-research.md. -->


# Purpose

Rules for tests that drive a real browser against a running application.

E2E tests are the slowest, flakiest and most expensive tier. **Keep few of them
and make each one earn its place.** A suite of 400 end-to-end tests is a suite
nobody trusts, run on a schedule, ignored when red.

Test the journeys that generate revenue or lose data: signup, login, checkout,
the primary create-and-save path. Everything else belongs lower in the pyramid.

---

# Selectors

Selector choice is the single largest cause of E2E maintenance cost.

```js
// Best — how a user finds it; survives restyling and DOM changes
await page.getByRole("button", { name: "Place order" }).click();
await page.getByLabel("Email address").fill("a@example.com");

// Acceptable — explicit contract with the test
await page.getByTestId("checkout-submit").click();

// Fragile — breaks on any restyle or refactor
await page.click(".btn.btn-primary > span:nth-child(2)");
await page.click("//div[3]/form/button[1]");
```

Priority: **role and accessible name → label → text → test id → CSS → XPath.**
Role-based queries double as an accessibility check: if `getByRole` cannot find
your button, a screen reader cannot either.

**Never** select by CSS class or DOM position. Both encode presentation, which is
the thing most likely to change without any behaviour changing.

Where a test id is needed, use a dedicated attribute (`data-testid`) so it is
obviously a contract and nobody deletes it during a cleanup.

---

# Waiting

Flakiness in E2E is almost always a waiting bug.

```js
// WRONG — a fixed sleep is a race that passes locally and fails on CI
await page.waitForTimeout(2000);

// RIGHT — wait for the condition that actually matters
await expect(page.getByText("Order confirmed")).toBeVisible();
await page.waitForResponse((r) => r.url().includes("/api/orders") && r.ok());
```

Modern frameworks (Playwright, Cypress) **auto-wait** for actionability —
attached, visible, stable, enabled — before acting. Fighting that with manual
sleeps reintroduces the race they removed.

**Never** use a fixed timeout to wait for anything. If you cannot express the
condition, the application is missing an observable signal — add one rather than
guessing at a duration.

Watch for these specific races: animations still running, a toast that
auto-dismisses before the assertion, a list that re-renders after a background
refetch, and focus moving during a form fill.

---

# Test data and isolation

- **Create the data the test needs, in the test**, through an API or a factory
  endpoint — not through the UI. Signing up via the interface to test checkout
  makes checkout failures indistinguishable from signup failures, and triples the
  runtime.
- **Never** depend on a shared staging database. Another test, or a colleague,
  will change the row you assert on.
- Use a **unique identifier per run** (`user-${runId}@example.com`) so parallel
  runs cannot collide.
- **Seed authentication via storage state** rather than logging in through the
  form in every test:

```js
// Log in once, reuse the session for every test in the project
await page.context().storageState({ path: "auth.json" });
// playwright.config: use: { storageState: "auth.json" }
```

Keep exactly one test that exercises the real login form. The rest start
authenticated.

---

# Scope and structure

| Test at E2E level | Test lower |
| --- | --- |
| Signup, login, checkout, payment | Field validation rules → `Testing/unit` |
| Critical multi-page journeys | API status codes → `Testing/integration` |
| Third-party redirect flows (OAuth, payment) | Business calculations → `Testing/unit` |
| Anything that has broken in production before | Every permutation of a form |

- **One journey per test.** A test asserting six unrelated things fails opaquely
  and hides the later failures.
- Do not chain tests. Each starts from a known state and can run alone.
- Tag by criticality (`@smoke`, `@critical`) so a fast subset gates deployment and
  the full suite runs less often.

---

# Running in CI

- Run **headless** in CI, headed locally for debugging.
- Capture **trace, video and screenshot on failure**. A failed E2E test with no
  artifact costs an hour of local reproduction.
- **Never** paper over flakiness with blanket retries. One retry to absorb genuine
  infrastructure noise is defensible; three retries hide a real race, and the bug
  reaches production.
- **Quarantine, do not skip.** A flaky test moved to a quarantined suite still
  runs and still reports; a skipped test is deleted coverage nobody notices.
- Track flake rate per test. A test failing 5% of the time is not passing — it is
  costing every engineer who sees it red.
- Pin the browser version so an upstream update does not turn into a mystery
  failure.

---

# Configuration that matters

```js
// playwright.config.ts — the settings that decide flake rate
export default defineConfig({
  timeout: 30_000,                  // per test, not per action
  expect: { timeout: 5_000 },       // auto-retrying assertions
  retries: process.env.CI ? 1 : 0,  // one retry absorbs infra noise, not races
  fullyParallel: true,
  workers: process.env.CI ? 4 : undefined,
  use: {
    trace: "on-first-retry",        // artifact only when it matters
    video: "retain-on-failure",
    screenshot: "only-on-failure",
    baseURL: process.env.BASE_URL,
    actionTimeout: 10_000,
  },
});
```

Key APIs worth knowing: `getByRole`, `getByLabel`, `getByTestId`,
`toBeVisible`, `toHaveURL`, `waitForResponse`, `route` for request interception,
`storageState` for session reuse, and `test.step` to make traces readable.

In Cypress the equivalents are `cy.findByRole`, `cy.intercept`, `cy.session` and
`cy.wait("@alias")` — never `cy.wait(2000)`.

# Anti-patterns

| Anti-pattern | Why it fails | Fix |
| --- | --- | --- |
| `waitForTimeout(2000)` | Race that fails on loaded CI | Wait for the condition |
| CSS class or XPath selectors | Break on any restyle | `getByRole` / `getByLabel` |
| Creating data through the UI | Slow; couples unrelated features | API or factory setup |
| Logging in via the form in every test | Multiplies runtime and flake | Reuse `storageState` |
| Shared staging data | Another run changes your row | Unique data per run |
| Chained, order-dependent tests | One failure cascades | Independent tests |
| Retrying until green | Hides a real race | Fix it or quarantine it |
| Testing every form permutation E2E | Slow suite nobody trusts | Push down to unit tests |
| No trace or video on failure | Unreproducible failures | Capture artifacts |
| Skipping a flaky test | Silent loss of coverage | Quarantine and track |

---

# Checklist

- [ ] Verify: The suite covers critical journeys only, not exhaustive permutations
- [ ] Verify: Selectors use role, label or `data-testid` — never CSS position or XPath
- [ ] Verify: No fixed timeout appears anywhere; waits express a real condition
- [ ] Verify: Test data is created via API or factory, uniquely per run
- [ ] Verify: Authentication is seeded from stored state, with one real login test
- [ ] Verify: Each test is independent and can run in isolation
- [ ] Verify: Tests are tagged so a fast critical subset can gate deployment
- [ ] Verify: Trace, video and screenshots are captured on failure
- [ ] Verify: Retries are at most one, and flake rate is tracked per test
- [ ] Verify: Flaky tests are quarantined rather than skipped
- [ ] Verify: Browser versions are pinned in CI
