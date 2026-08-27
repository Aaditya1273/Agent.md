---
targetModels:
  - "DeepSeek V4"
  - "DeepSeek V3.2"
  - "DeepSeek R1"
  - "DeepSeek V3 Family"
  - "Future DeepSeek Models"
name: performance
category: Frontend
description: Frontend performance — Core Web Vitals, bundle discipline, image and font strategy, rendering cost, and measuring on the devices users actually have.
license: MIT
author: Agent.md maintainers
last-verified: 2026-08-23
reviewed-by: unreviewed
---
<!-- Generated from models/_canonical by scripts/build-model-variants.js.
     Edit the canonical source, not this file. Structure adapted for DeepSeek per deep-research.md. -->


# Purpose

Rules for making a web application fast. Performance work is worth doing only
against measurements — and against the right ones: field data from real users, not
a local build on a fast laptop.

Optimising what you have not measured is how teams ship a 40 KB saving on a page
whose problem is a 3-second server response.

---

# Measure the right things

| Metric | Target | What it reflects |
| --- | --- | --- |
| **LCP** | < 2.5s | When the main content appears |
| **INP** | < 200ms | Responsiveness to interaction |
| **CLS** | < 0.1 | Visual stability |
| TTFB | < 800ms | Server and network before anything renders |
| Total JS | < 200 KB compressed | The dominant cost on mobile |

Field data (Chrome UX Report, `web-vitals` in production) beats lab data
(Lighthouse). Lab data is reproducible; field data is true.

```ts
import { onLCP, onINP, onCLS } from "web-vitals";
onLCP(send); onINP(send); onCLS(send);      // report p75 by route and device class
```

Track **p75, segmented by device class and connection**. A p50 on desktop hides
the experience of the median mobile user entirely. Test on a mid-range Android
device with CPU throttling, not on your development machine.

---

# JavaScript is the expensive part

A byte of JavaScript costs far more than a byte of image: it must be downloaded,
parsed, compiled and executed, on the main thread.

- **Measure the bundle in CI** and fail the build on a regression
  (`size-limit`, `bundlesize`). Growth is otherwise invisible until it is large.
- **Analyse before optimising** (`@next/bundle-analyzer`, `rollup-plugin-visualizer`).
  It is usually one dependency, not a hundred small things.
- Route-level code splitting first, then component-level for genuinely heavy
  things — a chart library, a rich text editor, a date picker.
- Check for duplicate copies of the same library at different versions.
- Prefer platform APIs: `Intl.DateTimeFormat` instead of a date library,
  `fetch` instead of a client, `structuredClone` instead of a deep-clone helper.
- Load third-party scripts with `defer` or `async`, from a consent gate, and
  audit them regularly — analytics and tag managers are frequently the largest
  script on the page and nobody owns them.

```tsx
const Chart = lazy(() => import("./Chart"));   // loaded when rendered, not at boot
```

**Never** ship a library for one function. A 70 KB dependency imported for
`debounce` is the most common single avoidable regression.

---

# Images and fonts

Images are usually the LCP element, and fonts are usually the cause of layout
shift.

```html
<img src="hero.avif" width="1200" height="630" alt="…"
     fetchpriority="high" decoding="async" />
<img src="below.avif" width="400" height="300" alt="…" loading="lazy" />
```

- **Always set `width` and `height`** (or `aspect-ratio`). Without them the layout
  shifts when the image loads — the main cause of CLS.
- `loading="lazy"` on everything below the fold; **never** on the LCP image, which
  needs `fetchpriority="high"`.
- Serve AVIF or WebP with `srcset`/`sizes` so a phone does not download a
  desktop-sized image.
- Fonts: `font-display: swap`, `preload` the one font used above the fold, subset
  it, and self-host. `@import` from a third party costs an extra connection and
  round trip before any text renders.
- Declare `size-adjust`/`ascent-override` on the fallback font so the swap does not
  shift the layout.

---

# Rendering cost

- Virtualise long lists (`@tanstack/virtual`). Rendering 10,000 rows is slow no
  matter how cheap each row is.
- Keep the main thread free: heavy computation belongs in a web worker.
- Debounce or throttle high-frequency handlers; use `useDeferredValue` to keep
  input responsive while an expensive list catches up.
- Avoid layout thrash — batch DOM reads and writes rather than interleaving them.
- Animate `transform` and `opacity` only; animating `width`, `top` or `box-shadow`
  triggers layout or paint on every frame.
- Prefer CSS to JavaScript for animation, and honour
  `prefers-reduced-motion`. → `Frontend/react`

---

# Network and delivery

- Cache static assets immutably with content hashes:
  `Cache-Control: public, max-age=31536000, immutable`.
- HTML is `no-cache` or short-lived; it is what points at the hashed assets.
- Serve from a CDN close to users; compress with Brotli.
- `preconnect` to critical third-party origins; `preload` genuinely critical
  resources only — over-preloading competes with the resources that matter.
- Prefetch the next likely route on intent (hover, viewport), not everything.
- Server-render or statically generate content-heavy pages; a client-rendered page
  cannot have a good LCP because nothing renders until the JavaScript arrives.
  → `Frontend/server-components`

---

# Anti-patterns

| Anti-pattern | Why it fails | Fix |
| --- | --- | --- |
| Optimising without measuring | Effort on the wrong thing | Field data first |
| Lab data only | Hides the real user experience | RUM at p75 by device class |
| Testing on a development machine | Users are on mid-range phones | Throttled real devices |
| No bundle budget in CI | Growth is invisible until it hurts | `size-limit` gate |
| A library for one utility | Tens of KB for a few lines | Platform API or inline it |
| Everything in one bundle | Long time-to-interactive | Route and component splitting |
| Images without dimensions | Layout shift; poor CLS | `width`/`height` or `aspect-ratio` |
| Lazy-loading the LCP image | Delays the metric it defines | `fetchpriority="high"` |
| Unoptimised formats and sizes | Megabytes over mobile networks | AVIF/WebP with `srcset` |
| Third-party fonts via `@import` | Extra connection before text renders | Self-host and preload |
| No `font-display` | Invisible text, then a shift | `swap` plus metric overrides |
| Rendering huge lists | Slow render and interaction | Virtualise |
| Heavy computation on the main thread | Blocks interaction; ruins INP | Web worker |
| Animating layout properties | Layout and paint every frame | `transform` and `opacity` |
| Preloading everything | Competes with what matters | Preload deliberately |
| Unaudited third-party scripts | Often the largest script; nobody owns them | Inventory and review |
| Client-rendering content pages | LCP cannot be good | Server-render |

---

# Checklist

- [ ] LCP, INP and CLS are collected from real users and reviewed at p75
- [ ] Metrics are segmented by device class and route
- [ ] Testing includes a throttled mid-range mobile device
- [ ] A bundle-size budget is enforced in CI
- [ ] The bundle has been analysed and large dependencies justified
- [ ] Routes are code-split; heavy components load on demand
- [ ] No dependency is included for a single small utility
- [ ] Third-party scripts are inventoried, deferred and consent-gated
- [ ] Every image declares dimensions or an aspect ratio
- [ ] The LCP image is prioritised and never lazy-loaded
- [ ] Images are served in modern formats with responsive sizes
- [ ] Fonts are self-hosted, subset, preloaded, with `font-display: swap`
- [ ] Fallback font metrics are adjusted to avoid swap shift
- [ ] Long lists are virtualised
- [ ] Expensive computation runs off the main thread
- [ ] Animations use only `transform` and `opacity`, honouring reduced motion
- [ ] Static assets are content-hashed and cached immutably
- [ ] Content-heavy pages are server-rendered or statically generated
