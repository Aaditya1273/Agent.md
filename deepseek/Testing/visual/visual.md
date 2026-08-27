---
targetModels:
  - "DeepSeek V4"
  - "DeepSeek V3.2"
  - "DeepSeek R1"
  - "DeepSeek V3 Family"
  - "Future DeepSeek Models"
name: visual
category: Testing
description: Visual regression testing that is not permanently red — deterministic rendering, masking dynamic content, and reviewing diffs instead of regenerating them.
license: MIT
author: Agent.md maintainers
last-verified: 2026-08-23
reviewed-by: unreviewed
---
<!-- Generated from models/_canonical by scripts/build-model-variants.js.
     Edit the canonical source, not this file. Structure adapted for DeepSeek per deep-research.md. -->


# Purpose

Rules for catching unintended visual change by comparing rendered output against
approved baselines.

Visual tests catch what assertions cannot: a CSS change that breaks an unrelated
page, a font fallback, a component overlapping at one breakpoint. They fail badly
when non-determinism makes them noisy — **the common outcome is a suite that is
always slightly red and therefore approved without looking**, which is worse than
having none.

---

# Determinism is the whole problem

Every source of variation must be removed or masked before the first baseline.

| Source | Fix |
| --- | --- |
| Dates and times | Freeze the clock; inject a fixed timestamp |
| Random data | Seed the generator; use fixed fixtures |
| Animations and transitions | Disable globally in the test stylesheet |
| Font loading | Wait for `document.fonts.ready`; self-host fonts |
| Images from a network | Stub them or use local fixtures |
| Scrollbars | Consistent OS or a container-based screenshot |
| GPU and font rendering | **Render in a container** — the biggest single fix |
| Carousels, skeletons, spinners | Mask the region |
| Blinking text caret | `caret-color: transparent` |
| Lazy images below the fold | `loading="eager"` in the test build |
| `Math.random()` in components | Inject a seeded generator |
| Locale-dependent formatting | Pin `TZ=UTC` and `LANG=en_US.UTF-8` |

```css
/* Loaded only in visual tests: nothing may be mid-animation at capture time */
*, *::before, *::after {
  animation: none !important;
  transition: none !important;
  caret-color: transparent !important;
  scroll-behavior: auto !important;
}
```

**Never** generate baselines on a developer laptop and compare them in CI. Font
hinting and GPU rasterisation differ, so every screenshot differs. Generate and
compare in the **same container image**, pinned by digest.

---

Tooling: `@playwright/test` `toHaveScreenshot`, `percy`, `chromatic`,
`argos-ci`, `backstopjs`, `loki`. Playwright's built-in comparison needs no
service and stores baselines in the repository; hosted tools add review
workflows and cross-browser rendering at a cost.

Pin the runner explicitly — `mcr.microsoft.com/playwright:v1.49.0-jammy` by
digest, not `:latest`. A browser or font-package update inside the image
invalidates every baseline at once.

# Capture

```js
test("invoice card renders", async ({ page }) => {
  await page.goto("/components/invoice-card");
  await page.evaluate(() => document.fonts.ready);      // fonts settled

  await expect(page.getByTestId("invoice-card")).toHaveScreenshot("invoice-card.png", {
    maxDiffPixelRatio: 0.01,        // absorb sub-pixel noise, catch real change
    animations: "disabled",
    mask: [page.getByTestId("relative-time")],   // dynamic region excluded
  });
});
```

- **Screenshot the component, not the page**, where possible. A page-level
  baseline fails for every unrelated change and tells you nothing about which.
- Set a **small but non-zero** diff tolerance. Zero is brittle; anything above a
  percent or two hides real regressions.
- **Mask** genuinely dynamic regions rather than trying to freeze them.
- Cover the states that break in production: `empty`, `loading`, `error`,
  `overflow` and `long-text`. A component tested only with a two-word label
  passes forever and breaks on the first real customer name.
- Test the **breakpoints that matter** — typically 375px, 768px and 1280px — plus
  dark mode if you support it. Every extra viewport is another baseline to review.

---

```yaml
# Pin the image by digest. A font or browser update inside :latest silently
# invalidates every baseline in the repository.
jobs:
  visual:
    container:
      image: mcr.microsoft.com/playwright@sha256:<digest>
    steps:
      - run: npx playwright test --grep @visual
      - uses: actions/upload-artifact@v4
        if: failure()
        with:
          name: visual-diffs
          path: test-results/**/*-diff.png    # reviewers need the diff image
```

# Reviewing diffs

This is where the practice succeeds or fails.

- **Every baseline update is a code review.** The diff image goes in the pull
  request and someone looks at it.
- **Never** run the update command to make CI green. Doing so commits the
  regression as the new expected appearance — the exact failure mode this suite
  exists to prevent.
- Approvals belong to the person who **owns the visual change**, not whoever is
  unblocking the build.
Commands worth knowing: `--update-snapshots` regenerates (dangerous — see above),
`--grep @visual` runs only this tier, and `--reporter=html` produces the side-by-side
`expected` / `actual` / `diff` view that makes review possible at all.

- Store baselines in the repository (Git LFS if they grow) or in the tool's
  managed store — but they must be **versioned with the code**, so checking out an
  old commit gives its correct baselines.

---

# Scope

| Worth a visual test | Not worth it |
| --- | --- |
| Design-system components in each state | Every page of a content site |
| Critical pages: pricing, checkout, landing | Text-only changes |
| Complex layouts: tables, grids, dashboards | Anything a unit test asserts better |
| Dark mode and RTL variants | Rapidly iterating prototypes |
| Empty, loading, error and overflow states | |

Component-level baselines in a Storybook-style harness give the best ratio: they
are stable, fast, and the failure points directly at the component.

**Never** treat a visual test as an accessibility check. Identical pixels can hide
a missing label or an unreachable control → `Testing/accessibility`.

---

# Anti-patterns

| Anti-pattern | Why it fails | Fix |
| --- | --- | --- |
| Baselines from a laptop, compared in CI | Font and GPU differences | Same pinned container |
| Zero diff tolerance | Sub-pixel noise fails every run | Small `maxDiffPixelRatio` |
| Updating baselines to go green | Commits the regression as expected | Review every diff image |
| Full-page shots for everything | One change fails every test | Component-level captures |
| No animation disabling | Captures mid-transition | Global disable stylesheet |
| Live dates and random data | Different every run | Freeze and seed |
| Screenshotting every page | Enormous review burden | Target components and key pages |
| Baselines outside version control | Old commits fail against new baselines | Version alongside the code |
| Treating pixels as accessibility | Identical pixels hide missing labels | Run `axe` separately |
| Ignoring a persistently red test | Real regressions become invisible | Fix determinism or delete it |

---

# Checklist

- [ ] Baselines are generated and compared in the same pinned container image
- [ ] Animations, transitions and carets are disabled during capture
- [ ] Clocks are frozen and random data seeded
- [ ] Fonts are self-hosted and awaited before capture
- [ ] Dynamic regions are masked rather than left to vary
- [ ] Captures target components; page-level shots are reserved for key pages
- [ ] Diff tolerance is small but non-zero
- [ ] Key breakpoints and dark mode are covered
- [ ] Every baseline update is reviewed as a diff image by the change owner
- [ ] Baselines are versioned with the code
- [ ] Accessibility is tested separately, never inferred from pixels
