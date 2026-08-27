---
targetModels:
  - "Claude Fable 5"
  - "Claude Opus 5"
  - "Claude Sonnet 5"
  - "Claude 5 Family"
  - "Future Claude Models"
name: rendering
category: Performance
description: Rendering performance — the frame budget, layout thrash, compositor-only animation, virtualised lists, and keeping interaction responsive.
license: MIT
author: Agent.md maintainers
last-verified: 2026-08-23
reviewed-by: unreviewed
---
<!-- Generated from models/_canonical by scripts/build-model-variants.js.
     Edit the canonical source, not this file. Structure adapted for Claude per deep-research.md. -->
# Purpose

<purpose>
Rules for keeping the browser's rendering work cheap. The measurable target is
**INP under 200 ms** and animations that hold their frame budget.

The frame budget is the whole constraint: at 60 Hz a frame is **16.7 ms**, and the
browser needs part of that for itself. Roughly 10 ms of your work per frame is the
ceiling. Exceed it and frames are dropped, which users perceive as jank.

---
</purpose>

# The pipeline, and where to stop

<rules>
```
JavaScript → Style → Layout → Paint → Composite
```

Every stage you avoid is time saved. Which stages run depends on **what property
you changed**:

| Changing | Triggers |
| --- | --- |
| `width`, `height`, `top`, `left`, `margin`, `padding`, `font-size` | Layout → Paint → Composite |
| `color`, `background-color`, `box-shadow`, `border-radius` | Paint → Composite |
| **`transform`, `opacity`, `filter`** | **Composite only** |

Animate `transform` and `opacity` and nothing else. Composite runs on the GPU, off
the main thread, and holds 60fps under load that would drop frames if layout were
involved.

```css
/* Layout on every frame — janky */
.slide { transition: left 300ms; }

/* Compositor only — smooth */
.slide { transition: transform 300ms; will-change: transform; }
```

Use `will-change` sparingly and remove it after the animation. Each hint promotes
an element to its own layer and consumes GPU memory; applying it broadly makes
things worse.

---
</rules>

# Avoid layout thrash

<rules>
Reading a layout property after writing one forces the browser to recompute layout
**synchronously**, in the middle of your loop.

```ts
// Forced synchronous layout on every iteration — O(n) layouts
for (const el of items) {
  el.style.height = el.offsetHeight + 10 + "px";   // read after write, repeatedly
}

// Batch: all reads, then all writes — one layout
const heights = items.map((el) => el.offsetHeight);
items.forEach((el, i) => { el.style.height = heights[i] + 10 + "px"; });
```

Layout-forcing reads include `offsetTop`, `offsetHeight`, `clientWidth`,
`scrollTop`, `getBoundingClientRect()` and `getComputedStyle()`. In the DevTools
Performance panel they appear as purple "Recalculate Style / Layout" bars inside a
script block — that pattern is the signature.

Prefer `ResizeObserver` and `IntersectionObserver` over polling geometry: they
deliver measurements without forcing layout.

---
</rules>

# Render less

<rules>
- **Virtualise long lists.** Rendering 10,000 rows is slow regardless of how cheap
  each row is. `@tanstack/virtual` or equivalent renders the visible window plus a
  small overscan.
- **Paginate** rather than rendering everything and hiding most of it with CSS —
  `display: none` still costs DOM nodes and memory.
- **`content-visibility: auto`** lets the browser skip rendering off-screen
  sections entirely; pair it with `contain-intrinsic-size` so the scrollbar does
  not jump.
- **CSS containment** (`contain: layout paint`) scopes recalculation to a subtree,
  so a change inside a widget cannot force layout of the whole page.
- Keep the DOM shallow. Deep trees make every style recalculation more expensive.

In React specifically: state placed too high re-renders subtrees that do not care,
and index keys make React reuse the wrong DOM nodes. Both show up as rendering
cost with no obvious cause. → `Frontend/react`

---
</rules>

# Keep interaction responsive

<rules>
INP measures the worst interaction latency users experience: input → processing →
next paint.

- **Never block the main thread with a long task.** A 300 ms synchronous handler is
  300 ms of unresponsive UI. Break long work with `scheduler.yield()`, or move it
  to a web worker.
- Mark non-urgent updates so typing stays responsive:

```tsx
const [query, setQuery] = useState("");
const deferred = useDeferredValue(query);      // list lags; input does not
```

- Debounce or throttle high-frequency handlers (`input`, `scroll`, `resize`,
  `mousemove`). Use `requestAnimationFrame` for anything that updates visuals.
- Add `{ passive: true }` to scroll and touch listeners so the browser does not
  wait to discover whether you will call `preventDefault()`.
- Respond immediately, even if the work is not finished: show a pending state on
  the first frame rather than after the work completes.
- Honour `prefers-reduced-motion` — for accessibility, and because it removes work.
  → `Testing/accessibility`

---
</rules>

# Measure, do not guess

<rules>
- **DevTools Performance panel** with 4–6× CPU throttling. Look for long tasks
  (> 50 ms), forced synchronous layout, and frames exceeding the budget.
- **React Profiler** for component render counts and durations — but confirm
  against the browser profile, since the cost is often in layout, not in React.
- **Field data** (`web-vitals`) for INP and CLS at p75, segmented by device class.
  A desktop profile does not represent a mid-range Android phone.
- Reproduce on a real low-end device before and after. Throttling approximates;
  hardware is the truth. → `Performance/optimization`

---
</rules>

# Anti-patterns

<antipatterns>
| Anti-pattern | Why it fails | Fix |
| --- | --- | --- |
| Animating `left`, `top`, `width`, `height` | Layout every frame | `transform` |
| Animating `box-shadow` or `background` | Repaint every frame | `opacity`, or pre-rendered layers |
| `will-change` on many elements | Layer explosion; GPU memory | Apply narrowly, remove after |
| Reading geometry after writing styles | Forced synchronous layout | Batch reads, then writes |
| Polling `getBoundingClientRect` in a loop | Layout per call | `ResizeObserver` |
| Rendering thousands of rows | Slow render and interaction | Virtualise |
| Hiding rendered content with CSS | DOM and memory cost remains | Do not render it |
| Deep DOM trees | Every recalculation is more expensive | Flatten |
| Long synchronous handlers | Unresponsive UI; poor INP | Yield or use a worker |
| Non-passive scroll listeners | Browser waits for `preventDefault` | `{ passive: true }` |
| Unthrottled high-frequency handlers | Work every event | Debounce, throttle, `rAF` |
| Waiting to show feedback | Feels broken even when fast | Immediate pending state |
| Ignoring `prefers-reduced-motion` | Accessibility failure and wasted work | Respect it |
| Profiling on a fast machine | Hides what most users experience | Throttle; test real devices |
| Trusting the React Profiler alone | The cost is often layout | Browser performance profile |

---
</antipatterns>

# Checklist

<checklist>
- [ ] Animations use only `transform` and `opacity`
- [ ] `will-change` is applied narrowly and removed after use
- [ ] DOM reads and writes are batched; no forced synchronous layout in loops
- [ ] Geometry is observed with `ResizeObserver`/`IntersectionObserver`, not polled
- [ ] Long lists are virtualised
- [ ] Off-screen content is not rendered, or uses `content-visibility`
- [ ] CSS containment scopes recalculation for independent widgets
- [ ] The DOM is shallow and no hidden content is rendered unnecessarily
- [ ] No task on the main thread exceeds 50 ms
- [ ] Heavy computation runs in a web worker
- [ ] Non-urgent updates are deferred so input stays responsive
- [ ] High-frequency handlers are throttled and use `requestAnimationFrame`
- [ ] Scroll and touch listeners are passive
- [ ] Interactions show feedback on the first frame
- [ ] `prefers-reduced-motion` is honoured
- [ ] Profiling is done with CPU throttling and verified on a real low-end device
- [ ] INP is tracked in the field at p75, segmented by device class
</checklist>
