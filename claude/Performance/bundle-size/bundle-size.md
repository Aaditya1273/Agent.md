---
targetModels:
  - "Claude Fable 5"
  - "Claude Opus 5"
  - "Claude Sonnet 5"
  - "Claude 5 Family"
  - "Future Claude Models"
name: bundle-size
category: Performance
description: Keeping JavaScript small — measuring before cutting, dependency discipline, tree shaking that actually works, and budgets enforced in CI.
license: MIT
author: Agent.md maintainers
last-verified: 2026-08-23
reviewed-by: unreviewed
---
<!-- Generated from models/_canonical by scripts/build-model-variants.js.
     Edit the canonical source, not this file. Structure adapted for Claude per deep-research.md. -->
# Purpose

<purpose>
Rules for controlling shipped JavaScript. A byte of JavaScript costs far more than
a byte of image: it must be downloaded, parsed, compiled and executed **on the
main thread**, on a device you do not control.

Two rules govern everything: **measure before cutting**, and **enforce a budget**,
because bundles grow one innocuous pull request at a time.

---
</purpose>

# Budget first, in CI

<rules>
```json
// .size-limit.json
[
  { "path": "dist/assets/index-*.js", "limit": "160 KB" },
  { "path": "dist/assets/vendor-*.js", "limit": "120 KB" }
]
```

- Measure **compressed** size (Brotli/gzip) — that is what users download — and
  track uncompressed too, because parse and execute cost scales with the
  uncompressed bytes.
- Fail the build on a regression. A warning is ignored; a failing check is
  discussed.
- Report the delta on every pull request, so the cost of a dependency is visible
  at the moment someone proposes it.

Reasonable starting targets for an application shell: **< 160 KB compressed**
initial JavaScript, and **< 100 KB** for a content site. Treat them as budgets to
defend, not achievements to reach once.

---
</rules>

# Analyse before optimising

<rules>
```bash
npx vite-bundle-visualizer                 # Vite/Rollup
ANALYZE=true next build                    # Next.js
npx source-map-explorer 'dist/**/*.js'     # any bundler with source maps
```

It is almost always one or two dependencies, not a hundred small things. Look for:

- The single largest module.
- **Duplicate copies** of one library at different versions — check with
  `npm ls <pkg>` and deduplicate in the lockfile.
- Anything in the initial chunk not needed for first paint.
- Polyfills for browsers you no longer support: check the `browserslist` target,
  which frequently still says something from years ago.

---
</rules>

# Dependency discipline

<rules>
The highest-value habit: **check the cost before adding, not after**.

| Instead of | Use |
| --- | --- |
| `moment` (~70 KB) | `Intl.DateTimeFormat`, or `date-fns`/`dayjs` |
| `lodash` (whole) | Named imports, or the three lines you need |
| `axios` | `fetch` with a small wrapper |
| `uuid` | `crypto.randomUUID()` |
| A deep-clone package | `structuredClone()` |
| A charting suite for one sparkline | Inline SVG |

```ts
import _ from "lodash";               // ❌ pulls the whole library
import debounce from "lodash/debounce";   // ✅ one function
import { debounce } from "lodash-es";     // ✅ tree-shakeable build
```

The platform has absorbed most small utilities. Before adding a dependency, check
`bundlephobia.com` for its cost including transitive dependencies, and check
whether a standard API already does it.

**Never ship a library for one function.** A 70 KB dependency imported for
`debounce` is the most common single avoidable regression.

---
</rules>

# Make tree shaking work

<rules>
Tree shaking removes unused exports — but only when the bundler can prove removal
is safe. It silently fails to shake when:

- The package ships **CommonJS** only. `require()` is dynamic, so nothing can be
  proven. Prefer ESM builds.
- The package has **side effects** at module scope and no `"sideEffects": false`
  in its `package.json`.
- You `import * as x` and then index dynamically.
- A barrel file (`index.ts` re-exporting everything) pulls in a module chain the
  bundler cannot prune. Barrel files are a common and invisible cause.

```json
// In your own package: tell bundlers it is safe to drop unused modules
{ "sideEffects": ["*.css"] }
```

Verify rather than assume: build, then search the output for a symbol you believe
was removed. Tree shaking is frequently believed to be working when it is not.

---
</rules>

# What else to cut

<rules>
- **Polyfills**: target modern browsers and let older ones get a separate legacy
  bundle, rather than serving everyone the polyfills the oldest needs.
- **Locale and timezone data**: import the active locale, not all forty.
- **Source maps**: generate them, upload them to your error tracker, and do not
  serve them publicly.
- **Development-only code**: assert that `NODE_ENV` is `production` so
  development branches are eliminated.
- **Duplicated framework runtimes**: two versions of React in one bundle is both a
  size problem and a runtime bug.
- **Third-party scripts** are not in your bundle but are on your critical path —
  analytics and tag managers are frequently the largest script on the page and
  nobody owns them. Inventory and defer them. → `Frontend/performance`

Then split what remains, so the initial download is only what the first screen
needs. → `Frontend/code-splitting`

---
</rules>

# Anti-patterns

<antipatterns>
| Anti-pattern | Why it fails | Fix |
| --- | --- | --- |
| No size budget in CI | Growth is invisible until it is large | `size-limit` gate |
| Measuring uncompressed only | Not what users download | Track compressed |
| Cutting before analysing | Effort on the wrong modules | Bundle analysis first |
| Adding a library for one utility | Tens of KB for a few lines | Platform API or inline |
| Default-importing lodash | Whole library included | Named or `lodash-es` |
| Assuming tree shaking works | CommonJS and side effects silently prevent it | Verify the output |
| Barrel files re-exporting everything | Pulls in unprunable chains | Import directly |
| No `sideEffects` field | Bundler cannot drop unused modules | Declare it |
| Stale `browserslist` | Polyfills for browsers nobody uses | Update the target |
| All locales bundled | Users download forty languages to read one | Load the active locale |
| Duplicate library versions | Same code shipped twice | Deduplicate the lockfile |
| Source maps served publicly | Source disclosure | Upload to the error tracker only |
| Development code in production builds | Dead branches shipped | `NODE_ENV=production` |
| Unaudited third-party scripts | Often the largest script on the page | Inventory and defer |
| One giant vendor chunk | Any update invalidates all of it | Group by change frequency |

---
</antipatterns>

# Checklist

<checklist>
- [ ] A compressed-size budget is enforced in CI and fails the build
- [ ] Uncompressed size is tracked for parse and execute cost
- [ ] Pull requests report the bundle-size delta
- [ ] The bundle has been analysed and the largest modules identified
- [ ] No duplicate copies of a library exist at different versions
- [ ] Dependency cost is checked before adding, not after
- [ ] No dependency is included for a single small utility
- [ ] Imports are named, from tree-shakeable ESM builds
- [ ] `sideEffects` is declared in first-party packages
- [ ] Tree shaking is verified against the built output, not assumed
- [ ] Barrel files are not on hot import paths
- [ ] `browserslist` reflects actually supported browsers
- [ ] Only the active locale's data is bundled
- [ ] Source maps are uploaded to error tracking, not served publicly
- [ ] Development-only code is eliminated in production builds
- [ ] Third-party scripts are inventoried, deferred and owned
- [ ] Remaining code is split so the initial chunk serves the first screen only
</checklist>
