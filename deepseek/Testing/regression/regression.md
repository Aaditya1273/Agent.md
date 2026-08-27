---
targetModels:
  - "DeepSeek V4"
  - "DeepSeek V3.2"
  - "DeepSeek R1"
  - "DeepSeek V3 Family"
  - "Future DeepSeek Models"
name: regression
category: Testing
description: Preventing bugs from returning — the failing test that must come first, choosing what to keep, and stopping a suite from becoming archaeology.
license: MIT
author: Agent.md maintainers
last-verified: 2026-08-23
reviewed-by: unreviewed
---
<!-- Generated from models/_canonical by scripts/build-model-variants.js.
     Edit the canonical source, not this file. Structure adapted for DeepSeek per deep-research.md. -->


# Purpose

Rules for regression testing: ensuring a fixed bug stays fixed and existing
behaviour survives change.

The single rule that matters most: **write the failing test before the fix.** A
test written afterwards proves the code does what it currently does. A test
written first proves it catches the bug — because you watched it fail.

---

# The workflow

```
1. Reproduce      — a test that fails for the reported reason
2. Confirm        — run it; watch it fail with the right error
3. Fix            — change the code
4. Confirm        — the same test passes, nothing else broke
5. Keep           — commit the test with the fix, in the same change
```

Step 2 is the one people skip. A test that passes before the fix was never
testing the bug.

```js
// Named for the behaviour, with the issue referenced for context — not
// "test bug 4471", which tells a future reader nothing.
test("refund of a partially captured payment returns only the captured amount", async () => {
  // Regression: #4471 — refunded the authorised total, over-refunding by the
  // uncaptured remainder.
  const payment = await createPayment({ authorised: 10_000, captured: 4_000 });

  const refund = await refundPayment(payment.id);

  expect(refund.amount).toBe(4_000);
});
```

Reference the issue in a **comment**, not the test name. The name must describe
the behaviour so a failure is legible without opening the tracker.

---

# What to keep as a regression test

Not every bug needs a permanent test. Keep it when:

- The bug reached **production**
- It involved **money, data loss, security or privacy**
- It was **subtle** — an off-by-one, a timezone, a race, a rounding rule
- It has **recurred before**
- The fix is in code that changes often

Skip a permanent test when the bug was a typo caught in review, or the fix removes
the possibility structurally — a type change or a database constraint is a
stronger guarantee than any test.

---

Useful helpers when reproducing: `test.only` to isolate the case while you work
(never committed), `test.each` when the bug is one row in a table of inputs,
`vi.setSystemTime` for date-dependent bugs, and `--runInBand` / `--pool=forks`
when a bug only appears under parallel execution.

For a race, `Promise.all` over the same operation is usually the shortest
reproduction:

```js
test("concurrent claims cannot double-spend a credit", async () => {
  const credit = await createCredit({ amount: 100 });

  const results = await Promise.allSettled([
    claimCredit(credit.id), claimCredit(credit.id), claimCredit(credit.id),
  ]);

  expect(results.filter((r) => r.status === "fulfilled")).toHaveLength(1);
});
```

# Choosing the level

Put the regression test at the **lowest level that reproduces it**:

Concretely: a rounding bug is `expect(total).toBe(4000)` in a unit test; a
tenant-leak bug is a `findFirst` assertion in an integration test; a silently
broken button is a `getByRole` assertion in an E2E test.

| Bug | Level |
| --- | --- |
| Wrong rounding in a total | Unit |
| Query returned another tenant's rows | Integration |
| Migration failed on populated data | Integration |
| Checkout button silently no-oped | E2E |
| Layout collapsed at 320px | `Testing/visual` |

An E2E test for a rounding bug costs a thousand times the runtime and is flakier.
The exception is worth stating: if the bug was **the wiring between components**,
it must be tested at the level where those components meet — that is exactly the
seam a unit test cannot see.

---

# Snapshot tests

Snapshots are regression tests that are cheap to create and easy to misuse.

```js
// Fragile — any markup change churns it; reviewers approve blindly
expect(render(<Invoice {...props} />)).toMatchSnapshot();

// Focused — asserts the thing that must not regress
expect(screen.getByTestId("total")).toHaveTextContent("£40.00");
```

- Keep snapshots **small and targeted**. A 600-line snapshot is never reviewed;
  it is regenerated.
- **Never** run `--update-snapshots` to make CI green without reading the diff.
  That is the mechanism by which a real regression gets committed as expected
  behaviour.
- Prefer explicit assertions for anything with business meaning. Reserve snapshots
  for shapes with no better expression.

---

# Guarding against silent regressions

Some regressions are better prevented structurally than tested:

| Guard | Prevents |
| --- | --- |
| A `NOT NULL` or `CHECK` constraint | Invalid rows regardless of code path |
| A `UNIQUE` index | Duplicate records under concurrency |
| A non-nullable type | An entire class of `undefined` bugs |
| An exhaustive `switch` on a union | A new case silently unhandled |
| `zod` / `pydantic` at the boundary | Malformed input reaching business logic |

```ts
// The compiler now fails when a new status is added and left unhandled —
// stronger and cheaper than a test asserting the same thing.
function label(status: Status): string {
  switch (status) {
    case "draft": return "Draft";
    case "sent": return "Sent";
    default: {
      const _exhaustive: never = status;
      return _exhaustive;
    }
  }
}
```

# Keeping the suite honest

A regression suite accumulates. Without maintenance it becomes archaeology — tests
nobody understands, guarding behaviour nobody wants.

- Run the full suite before shipping a fix — `npm test` locally, not just the one
  file. A fix that repairs `refundPayment` and breaks `capturePayment` is caught
  only by the rest of the suite.
- **Delete tests for removed features.** A test for deleted code is pure cost.
- **Consolidate** when six tests cover one rule through slightly different paths.
- **Fix or quarantine flaky tests immediately.** One test retried until green
  teaches the team to ignore red, which is how a real failure ships.
- **Never** comment out or `.skip` a failing test to unblock a release without an
  issue and an owner. A skipped test is deleted coverage that still looks present.
- Re-read the suite when a module is rewritten. Tests asserting the old design
  block the new one for no benefit.

---

# Anti-patterns

| Anti-pattern | Why it fails | Fix |
| --- | --- | --- |
| Test written after the fix | Never proven to catch the bug | Watch it fail first |
| `test("bug 4471")` | Illegible failure output | Name the behaviour |
| E2E test for a unit-level bug | 1,000× cost, more flake | Lowest reproducing level |
| Huge snapshots | Reviewed by regeneration | Small, targeted assertions |
| `-u` to make CI pass | Commits the regression as expected | Read every snapshot diff |
| `.skip` to unblock a release | Silent loss of coverage | Fix, or quarantine with an owner |
| Retrying until green | Trains the team to ignore red | Fix determinism |
| Keeping tests for deleted features | Pure maintenance cost | Delete them |
| A test per bug, forever | Suite becomes unmaintainable | Keep only what earns it |
| Fixing without reproducing | Often fixes a different thing | Reproduce first |

---

# Checklist

- [ ] Every bug fix ships with a test in the same change
- [ ] The test was observed failing before the fix was applied
- [ ] Test names describe behaviour; issue references live in comments
- [ ] Each regression test sits at the lowest level that reproduces the bug
- [ ] Wiring bugs are tested at the seam, not below it
- [ ] Snapshots are small, targeted and diff-reviewed
- [ ] Snapshot updates are never applied blindly to make CI pass
- [ ] Flaky tests are fixed or quarantined with an owner, never skipped silently
- [ ] Tests for removed features are deleted
- [ ] Structural fixes — types, constraints — are preferred over tests where possible
