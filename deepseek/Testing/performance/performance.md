---
targetModels:
  - "DeepSeek V4"
  - "DeepSeek V3.2"
  - "DeepSeek R1"
  - "DeepSeek V3 Family"
  - "Future DeepSeek Models"
name: performance
category: Testing
description: Testing performance as a regression gate — budgets in CI, lab versus field data, and measuring the metrics users actually feel.
license: MIT
author: Agent.md maintainers
last-verified: 2026-08-23
reviewed-by: unreviewed
---
<!-- Generated from models/_canonical by scripts/build-model-variants.js.
     Edit the canonical source, not this file. Structure adapted for DeepSeek per deep-research.md. -->


# Purpose

Rules for catching performance regressions before users do. Capacity under
concurrency is `Testing/load`; this package is about the speed of a single
experience and keeping it from decaying.

Performance degrades one pull request at a time. **A budget enforced in CI is the
only mechanism that stops it**, because nobody notices 40ms.

---

# Measure what users feel

For web interfaces, the Core Web Vitals plus one:

| Metric | Good | Measures |
| --- | --- | --- |
| **LCP** — Largest Contentful Paint | < 2.5s | When the main content appears |
| **INP** — Interaction to Next Paint | < 200ms | Responsiveness to input |
| **CLS** — Cumulative Layout Shift | < 0.1 | Visual stability |
| **TTFB** — Time to First Byte | < 800ms | Server and network |

INP replaced FID because it measures **every** interaction, not just the first —
a page that responds instantly once and stutters afterwards now scores honestly.

For APIs, latency percentiles at the boundary: `p50`, `p95`, `p99`. Never the mean
— see `Testing/load`.

---

# Lab and field are both required

| | Lab (synthetic) | Field (RUM) |
| --- | --- | --- |
| Source | Lighthouse, WebPageTest, CI | Real users, `web-vitals` |
| Strength | Reproducible; can gate a PR | Truthful; real devices and networks |
| Weakness | Idealised device and network | Cannot block a regression pre-merge |

Use lab data as the **gate** and field data as the **truth**. A lab score of 98 on
a simulated fast connection tells you nothing about a mid-range Android on 4G,
which is what most of the world is using.

```js
// Field collection — send real user measurements, don't guess at them
import { onLCP, onINP, onCLS, onTTFB } from "web-vitals";

const send = (metric) =>
  navigator.sendBeacon("/rum", JSON.stringify({
    name: metric.name, value: metric.value, rating: metric.rating,
    id: metric.id, path: location.pathname,
  }));

onLCP(send); onINP(send); onCLS(send); onTTFB(send);
```

`navigator.sendBeacon` survives page unload; a `fetch` in `visibilitychange`
frequently does not.

---

# Budgets in CI

A budget only works if crossing it **fails the build**.

```js
// lighthouserc.js — assert, don't just report
module.exports = {
  ci: {
    collect: { url: ["http://localhost:3000/", "http://localhost:3000/checkout"], numberOfRuns: 3 },
    assert: {
      assertions: {
        "categories:performance": ["error", { minScore: 0.9 }],
        "largest-contentful-paint": ["error", { maxNumericValue: 2500 }],
        "cumulative-layout-shift": ["error", { maxNumericValue: 0.1 }],
        "total-byte-weight": ["error", { maxNumericValue: 500_000 }],
      },
    },
  },
};
```

- Run **at least 3 iterations** and take the median. Single runs on shared CI
  runners are too noisy to gate on.
- Budget the **bundle** as well as the timings — `size-limit` or
  `bundlesize` catches a 300 KB dependency at the pull request that added it,
  which is the only time it is cheap to remove.
- Set budgets from **current measured values**, slightly tightened. An aspirational
  budget that fails on day one gets disabled on day two.

---

# Comparing fairly

Performance numbers are noisy; most reported "regressions" are measurement error.

- Compare against the **base commit**, not against an absolute from last quarter.
- Pin CPU throttling and network conditions so runs are comparable.
- Prefer a **relative threshold** ("no more than 10% slower than base") over an
  absolute one for CI gating.
- Re-run before believing a single failure. Then look at a trend, not a point.
- For microbenchmarks use a real harness — `benchmark.js`, `mitata`, `hyperfine` —
  which handles warmup and statistical significance. A `Date.now()` difference
  around a loop measures the JIT warming up.

---

# Profile before optimising

A regression test tells you *that* it slowed down. Finding *where* needs a profile.

| Symptom | Tool |
| --- | --- |
| Slow page load | Chrome DevTools Performance, WebPageTest filmstrip |
| Slow interaction | Performance panel, React Profiler, `INP` attribution |
| Large bundle | `webpack-bundle-analyzer`, `source-map-explorer` |
| Slow endpoint | APM traces, flame graph, `--cpu-prof` |
| Slow query | `EXPLAIN ANALYZE`, `pg_stat_statements` |

```bash
# Node: capture a CPU profile of the real workload, then read the flame graph
node --cpu-prof --cpu-prof-dir=./profiles server.js
npx speedscope ./profiles/*.cpuprofile
```

**Never** optimise from a guess. The bottleneck is routinely somewhere nobody
predicted, and the time spent on the wrong thing is unrecoverable.

---

# Anti-patterns

| Anti-pattern | Why it fails | Fix |
| --- | --- | --- |
| Lab data only | Idealised device and network | Collect field RUM |
| Reporting the mean | Hides the tail | `p95`, `p99` |
| Budgets that only warn | Nobody reads a warning | Fail the build |
| A single CI run | Runner noise reads as regression | Median of 3+ |
| Absolute budget on noisy CI | Flaky gate gets disabled | Relative to base commit |
| Aspirational budget | Fails immediately, gets removed | Set from measured values |
| `Date.now()` microbenchmarks | Measures JIT warmup | Use a real harness |
| Optimising without a profile | Effort spent on the wrong code | Profile first |
| No bundle budget | Dependencies accrete unnoticed | `size-limit` in CI |
| Measuring only the homepage | Regressions hide on other routes | Budget key routes |

---

# Checklist

- [ ] LCP, INP, CLS and TTFB are measured, not just a Lighthouse score
- [ ] Field data is collected from real users via `web-vitals` and `sendBeacon`
- [ ] Lab budgets run in CI and fail the build when exceeded
- [ ] At least three runs are taken and the median used
- [ ] Budgets were derived from current measurements, then tightened
- [ ] Bundle size is budgeted separately and gated per pull request
- [ ] Comparisons are relative to the base commit
- [ ] Key routes are budgeted, not only the homepage
- [ ] API latency is reported as percentiles
- [ ] Microbenchmarks use a harness that handles warmup
- [ ] Optimisation follows a profile, never a guess
