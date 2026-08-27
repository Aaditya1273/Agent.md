---
targetModels:
  - "DeepSeek V4"
  - "DeepSeek V3.2"
  - "DeepSeek R1"
  - "DeepSeek V3 Family"
  - "Future DeepSeek Models"
name: lazy-loading
category: Performance
description: Deferring work until it is needed — components, images, data and third-party scripts — without creating waterfalls or hurting the metrics you meant to improve.
license: MIT
author: Agent.md maintainers
last-verified: 2026-08-23
reviewed-by: unreviewed
---
<!-- Generated from models/_canonical by scripts/build-model-variants.js.
     Edit the canonical source, not this file. Structure adapted for DeepSeek per deep-research.md. -->


# Purpose

Rules for deferring work. Lazy loading trades a smaller initial payload for a
later request. That is a good trade when the deferred thing is genuinely not
needed yet, and a bad one when the user is now waiting for it.

The distinction that decides every case: **is this needed for the first screen?**
If yes, deferring it makes the page slower while appearing to optimise it.

---

# What to defer, and what never to

| Defer | Never defer |
| --- | --- |
| Below-the-fold images | The LCP image |
| Modal, drawer and tab content | The initially visible tab |
| Heavy editors, charts, maps, players | The application shell and router |
| Admin and feature-flagged code | Above-the-fold content |
| Analytics and chat widgets | Critical CSS |
| Non-active locale data | Fonts used in the first paint |

The LCP image is the recurring mistake. A blanket "lazy-load all images" change
adds `loading="lazy"` to the hero, which delays the very metric it defines:

```html
<img src="hero.avif" width="1200" height="630" alt="…" fetchpriority="high" />
<img src="card.avif" width="400" height="300" alt="…" loading="lazy" />
```

→ `Performance/images`

---

# Use the platform where it exists

```html
<img loading="lazy" decoding="async" width="400" height="300" />
<iframe loading="lazy" title="…"></iframe>
```

Native lazy loading needs no JavaScript, no observer, and no library. It only
works when **dimensions are set** — without them the browser cannot decide what is
below the fold, and layout shifts anyway.

For anything else, `IntersectionObserver` rather than scroll handlers:

```ts
const io = new IntersectionObserver(
  (entries) => entries.forEach((e) => e.isIntersecting && load(e.target)),
  { rootMargin: "200px" }        // start before it is visible
);
```

`rootMargin` is what makes deferred content feel instant: begin loading 200px
before it enters the viewport, so it has arrived by the time the user reaches it.
A zero margin means the user watches it load.

Scroll handlers fire constantly and force layout reads; `IntersectionObserver` is
both cheaper and more accurate.

---

# Components

```tsx
const Editor = lazy(() => import("./Editor"));

<Suspense fallback={<EditorSkeleton />}>
  {showEditor && <Editor />}
</Suspense>
```

- Every lazy boundary needs a `<Suspense>` fallback **and** an error boundary. A
  chunk request fails on a flaky network, and without a boundary the page blanks.
  Offer a retry.
- Fallbacks must match the content's dimensions, or lazy loading trades a slow
  page for a shifting one.
- Do not split small components: a 3 KB chunk costs a round trip to save 3 KB,
  which is a net loss on a high-latency connection.
- Do not nest lazy boundaries that are always needed together — that is a
  waterfall replacing one download. → `Frontend/code-splitting`

---

# Prefetch on intent

Deferring is only free if the thing arrives before the user needs it. Start it on
a signal of intent, not on the click:

```tsx
<button onMouseEnter={() => import("./Editor")}
        onFocus={() => import("./Editor")}
        onClick={openEditor}>Edit</button>
```

- Hover and focus precede a click by a few hundred milliseconds — usually enough.
- Viewport entry (`IntersectionObserver`) for links and route chunks.
- Predictable next steps in a flow: prefetch checkout from the cart.
- **Do not prefetch everything.** It competes with what is needed now and costs
  money on a metered connection. Respect `navigator.connection.saveData` and
  `prefers-reduced-data`.

---

# Data and third parties

- Paginate and load more on demand rather than fetching everything up front, but
  keep the first page in the initial response so the screen is not empty.
  → `API/pagination`
- Load data **with** the navigation (route loader, server component) rather than
  after the component mounts — mount-then-fetch is a waterfall.
  → `Frontend/routing`
- Third-party widgets — chat, maps, video, social embeds — are usually the largest
  scripts on a page. Defer them behind a facade: render a lightweight placeholder
  and load the real widget on interaction. A YouTube embed replaced by a
  thumbnail-plus-play-button saves hundreds of kilobytes for every user who never
  presses play.
- Consent-gate anything that sets cookies or tracks, and never load it before
  consent. → `Frontend/performance`

---

# Anti-patterns

| Anti-pattern | Why it fails | Fix |
| --- | --- | --- |
| Lazy-loading the LCP image | Delays the metric it defines | `fetchpriority="high"` |
| Blanket "lazy-load everything" | Catches above-the-fold content | Defer below the fold only |
| Native lazy loading without dimensions | Browser cannot judge; layout shifts | Set `width`/`height` |
| Scroll handlers for visibility | Fires constantly; forces layout | `IntersectionObserver` |
| `rootMargin: 0` | User watches content load | Start ~200px early |
| No prefetch on intent | User waits after clicking | Hover, focus, viewport |
| Prefetching everything | Competes with critical resources; costs data | Prefetch deliberately |
| Ignoring `saveData` | Wastes a metered connection | Respect the hint |
| `lazy()` without `<Suspense>` | Runtime error | Always pair them |
| No error boundary on a lazy chunk | A failed request blanks the page | Boundary with retry |
| Mis-sized fallbacks | Layout shift on resolve | Match content dimensions |
| Splitting tiny components | A round trip to save 3 KB | Only split real weight |
| Nested sequential lazy boundaries | Waterfall replaces one download | Load in parallel |
| Fetching after mount | Navigate, render, then fetch | Route loaders |
| Third-party widgets loaded eagerly | Hundreds of KB for a feature few use | Facade, load on interaction |
| Tracking loaded before consent | Compliance exposure | Consent gate |

---

# Checklist

- [ ] Above-the-fold content, the shell and critical CSS are never deferred
- [ ] The LCP image is prioritised, not lazy-loaded
- [ ] Below-the-fold images and iframes use native `loading="lazy"`
- [ ] Every lazily loaded image sets dimensions
- [ ] Visibility detection uses `IntersectionObserver` with a `rootMargin`
- [ ] Lazy components are wrapped in `<Suspense>` with correctly sized fallbacks
- [ ] Every lazy boundary has an error boundary with a retry path
- [ ] Small components are not split
- [ ] Chunks needed together load in parallel
- [ ] Routes and heavy components prefetch on hover, focus or viewport entry
- [ ] Prefetching respects `saveData` and does not compete with critical resources
- [ ] Data loads with navigation rather than after mount
- [ ] The first page of a list ships with the initial response
- [ ] Third-party widgets load behind a facade on interaction
- [ ] Tracking and cookie-setting scripts load only after consent
