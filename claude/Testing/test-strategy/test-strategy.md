---
targetModels:
  - "Claude Fable 5"
  - "Claude Opus 5"
  - "Claude Sonnet 5"
  - "Claude 5 Family"
  - "Future Claude Models"
name: test-strategy
category: Testing
description: Deciding what to test and at which level — the shape of a suite, what to do with legacy code, and the signals that a strategy is failing.
license: MIT
author: Agent.md maintainers
last-verified: 2026-08-23
reviewed-by: unreviewed
---
<!-- Generated from models/_canonical by scripts/build-model-variants.js.
     Edit the canonical source, not this file. Structure adapted for Claude per deep-research.md. -->
# Purpose

<purpose>
Rules for choosing what to test, at which level, and when to stop.

The purpose of a test suite is **confidence to change the code**. Any test that
does not increase that confidence — or that must be edited every time the code is
refactored without a behaviour change — is a liability on the balance sheet, not
an asset.

---
</purpose>

# The shape of the suite

<rules>
| Level | Share | Runtime | Catches |
| --- | --- | --- | --- |
| **Unit** | ~70% | milliseconds | Logic, edge cases, error paths |
| **Integration** | ~20% | seconds | Queries, migrations, HTTP contract, wiring |
| **E2E** | ~10% | minutes | Critical journeys, real browser behaviour |

Two failure modes:

- **Ice-cream cone** — mostly E2E. Slow, flaky, expensive to maintain; failures
  point at a page rather than a line. Usually appears when unit tests were hard to
  write, which is itself a design signal.
- **Hourglass** — many unit and E2E, no integration. Wiring bugs reach production
  because nothing tests the seam.

Match the shape to the risk, not to a rule. A payments service justifies more
integration tests than a marketing site.

```
        /\        E2E — few, critical journeys
       /  \
      /----\      Integration — queries, contracts, wiring
     /      \
    /--------\    Unit — logic, edges, errors
```

---
</rules>

# Choosing a level

<rules>
Ask what could break, then choose the cheapest test that would catch it.

Concretely: a discount calculation is `unit`; "does `findFirst` filter by
`organisationId`" is `integration`; "can a user complete checkout" is `e2e`. If
you can express the risk as a pure function of inputs, it is a unit test — reach
for `describe`/`it` and `expect`, not a browser.

| Risk | Level |
| --- | --- |
| A calculation is wrong | Unit |
| A query returns another tenant's rows | Integration |
| A migration fails on populated data | Integration |
| Checkout breaks after a deploy | E2E |
| A dependency upgrade changes behaviour | Integration + contract |
| A layout regresses | `Testing/visual` |
| The system falls over at load | `Testing/load` |

**Never** write an E2E test for something a unit test can catch. It costs 1,000×
the runtime for the same information.

---
</rules>

# What not to test

<rules>
Every test has a maintenance cost. Skip:

- **Framework and library behaviour.** Trust that `Array.map`, `JSON.parse` and
  `express.Router` work. Testing `zod` validates, or that `prisma.findMany`
  returns rows, tests someone else's suite.
- **Trivial getters and setters** with no logic.
- **Generated code**, unless you wrote the generator.
- **Exact log strings**, private methods, internal call counts.
- **Third-party internals** — test your adapter, not their SDK.

The question to ask: *if this test fails, will it be because of a real bug, or
because someone renamed something?*

---
</rules>

# Legacy code

<rules>
Do not attempt to retrofit coverage everywhere at once. It will not finish.

1. **Characterise before changing.** Write a test that asserts current behaviour,
   even where that behaviour is wrong. It is a safety net for the refactor.
2. **Cover the seam you are about to touch**, not the whole module.
3. **Add a test with every bug fix.** The regression test is the deliverable that
   outlives the fix.
4. **Ratchet coverage on changed lines**, not on the whole repository. A global
   threshold on a legacy codebase blocks every pull request until someone lowers
   it to zero and stops caring.

---
</rules>

# Enforcing the shape

<rules>
```yaml
</rules>

# Run the cheap tiers on every push; gate merges on the critical journey only.

<rules>
jobs:
  unit:         { run: "npm run test:unit -- --coverage" }
  integration:  { run: "npm run test:integration" }
  e2e-critical: { run: "npx playwright test --grep @critical" }
  e2e-full:     { if: "github.event_name == 'schedule'" }
```

```json
// Ratchet on changed lines, not the whole repository — a global threshold on a
// legacy codebase gets lowered to zero and then ignored.
{
  "coverageThreshold": {
    "global": { "branches": 0, "lines": 0 },
    "./src/billing/": { "branches": 80, "lines": 90 }
  }
}
```

Tools worth naming: `vitest` / `jest` for unit, `supertest` and `testcontainers`
for integration, `playwright` for E2E, `stryker` for mutation testing, and
`c8` / `istanbul` for coverage reporting.
</rules>

# Signals the strategy is failing

<rules>
Treat these as evidence, not as a reason to write more tests:

| Signal | Likely cause |
| --- | --- |
| Tests break on every refactor | Testing implementation, not behaviour |
| Nobody runs the suite locally | Too slow — usually the wrong shape |
| Bugs reach production despite green CI | Wrong level or missing integration layer |
| Tests are retried until they pass | Non-determinism → `Testing/unit` |
| Coverage is high, escapes are frequent | Assertions are weak; try mutation testing |
| Writing a test requires extensive mocking | The unit has too many collaborators |

That last one is the most valuable: **hard-to-test code is usually badly designed
code.** The instinct to reach for a heavier mocking framework is the wrong
response; extracting the dependency is the right one.

---
</rules>

# Practical rules

<rules>
- **Every bug fix ships with a failing-then-passing test.** No exceptions — this
  is the single highest-value rule in the document.
- Keep the unit suite under **a minute** so it runs on save — `vitest --watch`
  or `jest --watch` should be usable while writing code, not a CI-only step.
- Run unit and integration on **every pull request**; E2E critical-path on every
  merge; the full E2E suite less often.
- Make failures **legible**: a good name and a clear assertion diff mean a
  reviewer does not need to read the test to know what broke.
- Delete tests that no longer earn their keep. A deleted redundant test is a net
  gain.

---
</rules>

# Anti-patterns

<antipatterns>
| Anti-pattern | Why it fails | Fix |
| --- | --- | --- |
| Coverage percentage as a goal | Assertion-free tests reach 100% | Mutation testing; cover changed lines |
| E2E for logic a unit test could cover | 1,000× the cost, more flake | Push down the pyramid |
| No integration layer | Wiring bugs reach production | Test the seams |
| Retrofitting coverage everywhere | Never finishes; blocks delivery | Characterise the seam you touch |
| Global coverage gate on legacy code | Threshold gets lowered to zero | Ratchet on changed lines |
| Heavy mocking to make a test possible | Hides a design problem | Extract the dependency |
| Bug fixed without a regression test | The same bug returns | Test with every fix |
| Slow suite nobody runs | Feedback arrives after merge | Keep unit under a minute |
| Keeping every test forever | Maintenance cost compounds | Delete redundant tests |

---
</antipatterns>

# Checklist

<checklist>
- [ ] The suite shape matches the risk, not a fixed ratio
- [ ] Each test sits at the cheapest level that would catch its failure
- [ ] No E2E test covers logic a unit test could
- [ ] An integration layer exists and covers queries, migrations and HTTP contract
- [ ] Framework behaviour, trivial accessors and third-party internals are untested
- [ ] Every bug fix includes a test that failed before the fix
- [ ] Coverage is measured on changed lines, never as a global target
- [ ] Unit suite runs in under a minute
- [ ] Unit and integration run on every pull request
- [ ] Failure output identifies the problem without reading the test
- [ ] Hard-to-test code is treated as a design signal, not a mocking problem
</checklist>
