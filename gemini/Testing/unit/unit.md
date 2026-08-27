---
targetModels:
  - "Gemini 3.6 Flash"
  - "Gemini 3.5 Flash"
  - "Gemini 3.1 Pro"
  - "Gemini 3 Family"
  - "Future Gemini Models"
name: unit
category: Testing
description: Writing unit tests that catch regressions without cementing implementation — what to assert, what to fake, and why most flaky tests are design feedback.
license: MIT
author: Agent.md maintainers
last-verified: 2026-08-23
reviewed-by: unreviewed
---
<!-- Generated from models/_canonical by scripts/build-model-variants.js.
     Edit the canonical source, not this file. Structure adapted for Gemini per deep-research.md. -->


# Purpose

Rules for unit tests: fast, isolated, deterministic checks of a single unit of
behaviour.

The governing principle: **test behaviour through the public interface, not
implementation.** A test that breaks when you rename a private method without
changing behaviour is a maintenance tax, not a safety net.

---

# Structure

Arrange, act, assert — with the act step being exactly one call:

```js
test("applies the bulk discount at ten units", () => {
  const cart = new Cart([{ sku: "A", price: 100, qty: 10 }]);   // arrange

  const total = cart.total();                                    // act

  expect(total).toBe(900);                                       // assert
});
```

- **Name the behaviour, not the method.** `"returns 404 when the invoice belongs
  to another tenant"` beats `"test findInvoice"`. The name is what you read when
  it fails at 3am.
- **One logical assertion per test.** Several `expect` calls checking one outcome
  are fine; testing two unrelated behaviours in one test is not — the first
  failure hides the second.
- **No branching.** An `if` or a loop in a test means it is testing more than one
  thing, or it is reimplementing the logic under test.

---

# What to assert

Assert the **observable outcome**, not the path taken to it.

```js
// Brittle — asserts implementation. Refactoring breaks it with no bug.
expect(repo.findById).toHaveBeenCalledWith(42);

// Durable — asserts the result the caller depends on
expect(await service.getInvoice(42)).toEqual({ id: 42, total: 900 });
```

Reserve interaction assertions (`toHaveBeenCalledWith`) for cases where the call
**is** the behaviour — an email being sent, a payment being captured, an event
being published. There, the side effect is the contract.

**Never** assert on log output, private fields, or the number of times an internal
helper ran. Those are free to change.

---

# Test doubles

Use the least powerful double that works:

| Double | Use | Risk |
| --- | --- | --- |
| **Real object** | Pure functions, value objects, in-memory structures | None — prefer this |
| **Fake** | An in-memory implementation of a real interface | Must stay behaviour-compatible |
| **Stub** | Returns canned data for a query | Low |
| **Mock** | Asserts an interaction happened | Couples the test to the design |
| **Spy on real** | Observes without replacing | Can hide broken collaborators |

**Never mock what you do not own.** Mocking a third-party SDK asserts your belief
about its behaviour, and your belief is what is wrong when it breaks. Wrap it in
your own interface and fake that instead.

**Never** mock the unit under test. If a test needs to stub a private method of
the class it is testing, the class is doing too much — that is design feedback,
not a mocking problem.

---

# Determinism

A flaky test is worse than no test: it trains the team to re-run CI until green,
which is how a real failure gets ignored.

The four common causes and their fixes:

```js
// 1. Time — inject or freeze it, never read the wall clock in logic under test
vi.useFakeTimers();
vi.setSystemTime(new Date("2026-01-15T00:00:00Z"));

// 2. Randomness — seed it or inject the generator
const rng = seededRandom(42);

// 3. Ordering — never depend on another test having run
//    Each test creates the state it needs; no shared mutable fixture.

// 4. Async — await everything; never assert inside an unawaited promise
await expect(service.process()).resolves.toEqual({ ok: true });
```

**Never** use `sleep` or a fixed timeout to wait for async work. Await the promise,
or use the framework's fake timers. A `setTimeout(200)` that passes on your laptop
fails on a loaded CI runner.

**Never** share mutable state between tests. Fresh fixtures per test; reset any
module-level state in `beforeEach`.

---

# Framework specifics

The assertion you choose changes what the failure tells you:

| Intent | Use | Not |
| --- | --- | --- |
| Deep value equality | `toEqual`, `toStrictEqual` | `toBe` on objects |
| Same reference | `toBe` | `toEqual` |
| A subset of fields | `toMatchObject` | asserting every field |
| An error is thrown | `toThrow(TypeError)` with the type | bare `toThrow()` |
| A rejected promise | `await expect(p).rejects.toThrow()` | `try`/`catch` with no assertion |
| Floating point | `toBeCloseTo` | `toBe` |

`toStrictEqual` also checks `undefined` keys and class identity — prefer it when
the shape matters. A bare `toThrow()` passes on *any* error, including the
`TypeError` from your own broken test setup.

Lifecycle hooks: prefer `beforeEach` over `beforeAll` for anything mutable.
`beforeAll` state leaks between tests and is a common source of order dependence.
Reset module state and doubles explicitly — `vi.restoreAllMocks()` or
`jest.restoreAllMocks()` in `afterEach`, and set `restoreMocks: true` in config so
it cannot be forgotten.

# Coverage

Coverage measures which lines ran, not whether they were checked. 100% coverage is
achievable by a suite with no assertions at all.

- Use it to **find untested code**, never as a target to hit.
- A useful floor is around **80% on changed lines**; chasing the last few percent
  drives tests of trivial getters.
- **Mutation testing** (`stryker`, `mutmut`) measures assertion quality directly:
  it changes the code and checks whether a test notices. A surviving mutant is a
  line that is covered but unverified.
- **Never** write a test purely to raise coverage. A test with no meaningful
  assertion is a maintenance cost pretending to be a safety net.

---

# What belongs in a unit test

| Test at unit level | Test elsewhere |
| --- | --- |
| Business rules, calculations, validation | Database queries → `Testing/integration` |
| Edge cases, boundaries, error paths | HTTP routing and middleware → `Testing/integration` |
| Pure transformations | User journeys → `Testing/e2e` |
| State machines | Real third-party calls → contract tests |

Boundaries are where bugs live: empty, one, many, maximum, negative, zero, `null`,
Unicode, and the value one past the limit. Table-driven tests keep these compact:

```js
test.each([
  [0, 0], [1, 0], [9, 0], [10, 100], [11, 110],
])("qty %i discounts by %i", (qty, expected) => {
  expect(discountFor(qty)).toBe(expected);
});
```

---

# Anti-patterns

| Anti-pattern | Why it fails | Fix |
| --- | --- | --- |
| Asserting on private methods | Breaks on refactor with no bug | Assert observable output |
| Mocking a third-party SDK | Tests your assumption, not reality | Wrap it; fake your interface |
| `sleep(200)` for async | Fails on loaded CI | Await, or fake timers |
| Shared mutable fixture | Order-dependent, flaky | Fresh state per test |
| Reading `Date.now()` in logic | Non-deterministic | Inject the clock |
| Coverage as a target | Assertion-free tests hit 100% | Mutation testing |
| One test, six behaviours | First failure hides the rest | One behaviour per test |
| `if` inside a test | Reimplements the logic under test | Table-driven cases |
| Skipping a flaky test | The bug it found stays | Fix the determinism |
| Testing the framework | No value; churns on upgrade | Test your code |

---

# Checklist

- [ ] Verify: Test names describe behaviour, not method names
- [ ] Verify: Each test exercises one behaviour with a single act step
- [ ] Verify: Assertions target observable output, not internal calls
- [ ] Verify: Interaction assertions used only where the side effect is the contract
- [ ] Verify: No third-party SDK is mocked directly
- [ ] Verify: Time, randomness and ordering are controlled, never ambient
- [ ] Verify: No `sleep` or fixed timeout is used to wait for async work
- [ ] Verify: Every test creates its own state; nothing is shared mutably
- [ ] Verify: Boundary cases are covered with table-driven tests
- [ ] Verify: Coverage is used diagnostically, not as a target
- [ ] Verify: No test is skipped to hide flakiness
