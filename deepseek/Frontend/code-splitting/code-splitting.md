---
targetModels:
  - "DeepSeek V4"
  - "DeepSeek V3.2"
  - "DeepSeek R1"
  - "DeepSeek V3 Family"
  - "Future DeepSeek Models"
name: code-splitting
category: Frontend
description: Splitting the bundle so users download only what they need — route and component boundaries, prefetching on intent, and avoiding waterfalls.
license: MIT
author: Agent.md maintainers
last-verified: 2026-08-23
reviewed-by: unreviewed
---
<!-- Generated from models/_canonical by scripts/build-model-variants.js.
     Edit the canonical source, not this file. Structure adapted for DeepSeek per deep-research.md. -->


# Purpose

Rules for splitting JavaScript across chunks. The goal is not "smaller bundles"
in the abstract — it is that a user opening the login page does not download the
admin dashboard, the chart library and the rich text editor.

Split badly and you replace one large download with a chain of small sequential
ones, which is worse. Every rule here is about avoiding that.

---

# Measure before splitting

```bash
npx vite-bundle-visualizer            # or @next/bundle-analyzer, rollup-plugin-visualizer
npx source-map-explorer dist/*.js
```

Look for: the largest single dependency, duplicate copies of one library at
different versions, and anything in the initial chunk that is not needed for the
first paint.

The result is usually one or two offenders, not a hundred small things. Splitting
before looking produces a lot of `lazy()` calls and little improvement.

Enforce a budget in CI so the gain does not silently erode:

```json
// .size-limit.json — fails the build on regression
[{ "path": "dist/assets/index-*.js", "limit": "160 KB" }]
```

---

# Split at routes first

Route boundaries are natural: the user is already waiting for a navigation, and
each route's code is genuinely independent.

```tsx
const Dashboard = lazy(() => import("./routes/Dashboard"));
const Admin     = lazy(() => import("./routes/Admin"));

<Suspense fallback={<RouteSkeleton />}>
  <Routes>…</Routes>
</Suspense>
```

Most frameworks (Next.js, Remix, TanStack Router, Nuxt) do this automatically —
verify it is happening rather than assuming, by checking the build output for one
chunk per route.

Keep genuinely shared code in a common chunk so it is not duplicated per route,
but avoid a "vendor" chunk containing everything: a single dependency update then
invalidates the cache for all of it.

---

# Then split heavy components

Worth splitting individually:

| Component | Typical size |
| --- | --- |
| Rich text editor | 200–500 KB |
| Charting library | 100–300 KB |
| Map renderer | 200 KB+ |
| Video player | 100 KB+ |
| Date picker with locale data | 50–150 KB |
| PDF viewer, code editor | 300 KB+ |

```tsx
// Loads when the component renders, not at application boot
const Editor = lazy(() => import("./Editor"));
{showEditor && <Suspense fallback={<EditorSkeleton />}><Editor /></Suspense>}
```

Also split by **condition**: admin-only panels, feature-flagged experiments,
locale data, and anything behind a modal. A modal's content should not be in the
initial bundle — nobody has opened it yet.

Do **not** split small components. A 3 KB chunk costs a network round trip to save
3 KB, which is a net loss on a high-latency connection.

| Bundler | Dynamic import | Chunk naming / grouping |
| --- | --- | --- |
| Vite / Rollup | `import()` | `build.rollupOptions.output.manualChunks` |
| webpack | `import()` | `optimization.splitChunks.cacheGroups`, `webpackChunkName` |
| Next.js | `next/dynamic` | Automatic per route; `ssr: false` to skip server render |
| esbuild | `import()` | `splitting: true` with `format: "esm"` |
| Parcel | `import()` | Automatic |

Group `manualChunks` by **change frequency**, not by origin: a chunk of rarely
updated dependencies stays cached across deploys, while lumping everything into
`vendor` means one patch release invalidates the whole thing for every user.

---

# Prefetch on intent

A lazy chunk that only starts downloading when the user clicks means the user
waits. Start it earlier, on a signal that they are about to need it:

```tsx
// Hover and focus both precede the click by a few hundred milliseconds
<Link to="/reports"
      onMouseEnter={() => import("./routes/Reports")}
      onFocus={() => import("./routes/Reports")} />
```

- Prefetch links entering the viewport (`IntersectionObserver`), which is what
  Next.js `<Link>` does by default.
- Prefetch the likely next step of a known flow — checkout after the cart.
- Do **not** prefetch everything: it competes for bandwidth with what is needed
  now, and on a metered connection it costs the user money. Respect
  `navigator.connection.saveData`.

---

# Avoid the waterfall you just created

The failure mode of enthusiastic splitting is sequential loading: chunk A loads,
renders, and only then requests chunk B.

- Do not nest lazy boundaries where both are always needed together. Load them in
  parallel:
  ```tsx
  const [Chart, Table] = await Promise.all([import("./Chart"), import("./Table")]);
  ```
- Keep the **critical path** in the initial chunk: the shell, the router, and
  whatever renders above the fold. Splitting the LCP element out delays the metric
  it defines. → `Frontend/performance`
- Use `modulepreload` for chunks known to be needed immediately after the entry.
- Every `lazy()` needs a `<Suspense>` boundary and an error boundary — a chunk
  request can fail on a flaky network, and without a boundary the page blanks.
  Offer a retry.

---

# Anti-patterns

| Anti-pattern | Why it fails | Fix |
| --- | --- | --- |
| Splitting before measuring | Effort spread over the wrong modules | Analyse the bundle first |
| No CI size budget | Gains erode silently | `size-limit` gate |
| Splitting tiny components | A round trip to save 3 KB | Only split meaningful weight |
| Nested sequential lazy boundaries | Waterfall replaces one download | Parallel imports |
| Splitting above-the-fold content | Delays LCP | Keep the critical path inline |
| `lazy()` without `<Suspense>` | Runtime error | Always pair them |
| No error boundary around a lazy chunk | A failed request blanks the page | Boundary with retry |
| Prefetching everything | Competes with critical resources; costs data | Prefetch on intent |
| Ignoring `saveData` | Wastes a metered connection | Respect the hint |
| One giant vendor chunk | Any dependency update invalidates all of it | Group by change frequency |
| Duplicate library versions | The same code shipped twice | Deduplicate in the lockfile |
| Modal content in the initial bundle | Downloaded by everyone, opened by few | Split behind the trigger |
| Locale data all bundled | Users download 40 languages to read one | Load the active locale |

---

# Checklist

- [ ] The bundle has been analysed and the largest contributors identified
- [ ] A size budget is enforced in CI
- [ ] Each route produces its own chunk, verified in the build output
- [ ] Heavy components are split individually
- [ ] Conditional and admin-only code is behind a dynamic import
- [ ] Modal and drawer content is not in the initial bundle
- [ ] Only the active locale's data is loaded
- [ ] Small components are not split
- [ ] Above-the-fold content is not lazily loaded
- [ ] Chunks needed together load in parallel, not sequentially
- [ ] Every `lazy()` has a `<Suspense>` fallback matched to content size
- [ ] Every lazy boundary has an error boundary with a retry path
- [ ] Routes are prefetched on hover, focus or viewport entry
- [ ] Prefetching respects `saveData` and does not compete with critical resources
- [ ] Shared chunks are grouped by change frequency, not into one vendor blob
- [ ] No library is bundled twice at different versions
