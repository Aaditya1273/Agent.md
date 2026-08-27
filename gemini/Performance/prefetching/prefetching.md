---
targetModels:
  - "Gemini 3.6 Flash"
  - "Gemini 3.5 Flash"
  - "Gemini 3.1 Pro"
  - "Gemini 3 Family"
  - "Future Gemini Models"
name: prefetching
category: Performance
description: Loading things before they are needed — resource hints, prefetch on intent, speculation rules, and not wasting a user's bandwidth or battery.
license: MIT
author: Agent.md maintainers
last-verified: 2026-08-23
reviewed-by: unreviewed
---
<!-- Generated from models/_canonical by scripts/build-model-variants.js.
     Edit the canonical source, not this file. Structure adapted for Gemini per deep-research.md. -->


# Purpose

Rules for fetching resources before the user asks. Done well, a navigation feels
instant. Done badly, prefetching competes with the resources that are actually
blocking the current page, and costs users money on metered connections.

The governing question for every hint: **does this compete with something the user
needs right now?** If yes, it is a regression, not an optimisation.

---

# The hints, and what each actually does

| Hint | Does | Cost if wrong |
| --- | --- | --- |
| `dns-prefetch` | Resolves DNS only | Negligible |
| `preconnect` | DNS + TCP + TLS | An idle connection; limited slots |
| `preload` | Fetches now, **high priority** | Competes with render-blocking work |
| `modulepreload` | Fetches and parses an ES module | Same |
| `prefetch` | Fetches at **lowest** priority for a future navigation | Bandwidth |
| `prerender` (speculation rules) | Renders the whole page in the background | CPU, memory, bandwidth |

```html
<link rel="preconnect" href="https://cdn.example.com" crossorigin />
<link rel="preload" href="/fonts/inter.woff2" as="font" type="font/woff2" crossorigin />
<link rel="prefetch" href="/checkout" as="document" />
```

Two frequent mistakes:

- **`preload` without `as`** — the browser cannot set a priority or reuse the
  response, and the resource is fetched **twice**.
- **`preload` for fonts without `crossorigin`** — fonts fetch in CORS mode, so the
  preload does not match and downloads again.

Preload only what blocks the first render: typically one font and the LCP image.
Everything else competes with them. → `Performance/fonts`

---

# Prefetch on intent, not on load

Prefetching every link on a page wastes bandwidth on the majority nobody clicks.
Use signals that precede the click:

```tsx
<Link href="/reports"
      onMouseEnter={() => router.prefetch("/reports")}
      onFocus={() => router.prefetch("/reports")} />
```

| Signal | Lead time | Accuracy |
| --- | --- | --- |
| Viewport entry | Seconds | Low — most visible links are not clicked |
| Hover | 200–300 ms | High |
| Focus (keyboard) | Similar | High |
| `pointerdown` | ~80 ms | Very high |
| Known flow step (cart → checkout) | Long | Very high |

Hover plus focus is the default: enough lead time to matter, high enough accuracy
not to be wasteful, and it covers keyboard users.

For known funnels, prefetch the next step as soon as the user enters the current
one — the checkout bundle should already be there when they finish the cart.

---

# Speculation rules

```html
<script type="speculationrules">
{
  "prerender": [{
    "where": { "href_matches": "/checkout" },
    "eagerness": "moderate"
  }],
  "prefetch": [{
    "where": { "href_matches": "/*" },
    "eagerness": "conservative"
  }]
}
</script>
```

`eagerness` controls the trigger: `conservative` on pointer-down, `moderate` on
hover, `eager` immediately. Start conservative and raise it only where the
conversion is genuinely predictable.

**Prerendering runs the page**, including its JavaScript. Consequences:

- Analytics will record a page view for a page nobody saw. Gate on the Page
  Visibility API or `document.prerendering`.
- Any side effect — a POST, a counter increment, a "mark as read" — executes.
  Never prerender a page that mutates state on load.
- It costs real CPU and memory on the user's device. Prerender one likely
  destination, not ten.

---

# Respect the user's constraints

```ts
const c = (navigator as any).connection;
if (c?.saveData || /2g/.test(c?.effectiveType ?? "")) return;   // do not prefetch
```

- Honour `Save-Data` and `prefers-reduced-data`. Prefetching on a metered
  connection spends the user's money on something they may never use.
- Skip prefetching on slow connections — the bandwidth is needed for the current
  page.
- Consider battery: speculative work on a low battery is a poor trade.
- Prefetched responses obey `Cache-Control`. A resource marked `no-store` is
  fetched and discarded — pure waste. Check the headers on anything you prefetch.
- **Never prefetch authenticated or personalised URLs speculatively** — the
  response may be cached, logged or attributed to the wrong session, and it
  creates load nobody asked for. → `Performance/caching`

---

# Anti-patterns

| Anti-pattern | Why it fails | Fix |
| --- | --- | --- |
| `preload` without `as` | No priority; fetched twice | Always specify `as` |
| Font preload without `crossorigin` | Downloaded twice | Add `crossorigin` |
| Preloading many resources | Competes with render-blocking work | One font, the LCP image |
| `preload` used for future navigations | Wrong hint; high priority now | `prefetch` |
| `preconnect` to many origins | Idle connections; limited slots | Only definite origins |
| Prefetching every link on load | Bandwidth for links nobody clicks | Prefetch on intent |
| Viewport-based prefetch on a link-dense page | Dozens of wasted requests | Hover/focus, or conservative eagerness |
| `eagerness: eager` by default | Speculative cost for most users | Start conservative |
| Prerendering a page with side effects | POSTs and counters fire unseen | Never prerender mutating pages |
| Prerender without visibility gating | Phantom analytics page views | `document.prerendering` |
| Prerendering many candidates | CPU and memory on the user's device | One likely destination |
| Ignoring `Save-Data` | Spends a metered user's money | Check and skip |
| Prefetching `no-store` responses | Fetched and discarded | Check cache headers |
| Prefetching authenticated URLs | Wrong-session caching; unnecessary load | Never speculatively |
| Prefetching without measuring | May be pure cost | Measure navigation timing |

---

# Checklist

- [ ] Verify: Every `preload` specifies `as`, and fonts include `crossorigin`
- [ ] Verify: Preloading is limited to render-blocking resources
- [ ] Verify: `preconnect` is used only for origins certain to be needed
- [ ] Verify: Future navigations use `prefetch`, not `preload`
- [ ] Verify: Prefetching is triggered by hover, focus or a known flow step
- [ ] Verify: Speculation rules start at conservative eagerness
- [ ] Verify: No page with load-time side effects is prerendered
- [ ] Verify: Prerendered pages gate analytics on visibility
- [ ] Verify: At most one or two destinations are prerendered
- [ ] Verify: `Save-Data` and slow connections disable prefetching
- [ ] Verify: Prefetch targets are cacheable, not `no-store`
- [ ] Verify: Authenticated and personalised URLs are never speculatively fetched
- [ ] Verify: The effect of prefetching on navigation timing is measured
