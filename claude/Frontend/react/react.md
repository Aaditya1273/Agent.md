---
targetModels:
  - "Claude Fable 5"
  - "Claude Opus 5"
  - "Claude Sonnet 5"
  - "Claude 5 Family"
  - "Future Claude Models"
name: react
category: Frontend
description: React component rules — state placement, effects that are actually necessary, keys and identity, memoisation on evidence, and rendering untrusted content.
license: MIT
author: Agent.md maintainers
last-verified: 2026-08-23
reviewed-by: unreviewed
---
<!-- Generated from models/_canonical by scripts/build-model-variants.js.
     Edit the canonical source, not this file. Structure adapted for Claude per deep-research.md. -->
# Purpose

<purpose>
Rules for writing React components. Most React bugs are not rendering bugs — they
are **state-modelling bugs**: state that should have been derived, state
duplicated in two places, or an effect synchronising something that did not need
synchronising.

Hooks discipline is `Frontend/hooks`; global state is
`Frontend/state-management`.

---
</purpose>

# Derive, do not store

<rules>
```tsx
// Two sources of truth — they will diverge
const [items, setItems] = useState([]);
const [total, setTotal] = useState(0);          // must be updated everywhere items is

// One source. `total` cannot be stale by construction.
const [items, setItems] = useState([]);
const total = items.reduce((s, i) => s + i.priceCents * i.qty, 0);
```

Before adding state, ask whether it can be computed from props, existing state, or
the URL. Only add `useMemo` if that computation is measurably expensive.

Keep state at the **lowest common owner** of the components that read it. Lifting
state higher than necessary re-renders subtrees that do not care.

Model impossible states out of existence:

```tsx
// Permits { loading: true, error: Error, data: Data } — meaningless
const [loading, setLoading] = useState(false);
const [error, setError] = useState(null);
const [data, setData] = useState(null);

// One value; illegal combinations cannot be represented
type State =
  | { status: "idle" } | { status: "loading" }
  | { status: "error"; error: Error } | { status: "success"; data: Data };
```

---
</rules>

# Most effects are unnecessary

<rules>
`useEffect` synchronises with something **outside** React: the DOM, a
subscription, a timer, an analytics SDK. It is not a general-purpose "run this
after render" hook.

| Instead of an effect | Do this |
| --- | --- |
| Computing derived data | Calculate during render |
| Resetting state when a prop changes | Change the `key` so React remounts |
| Handling a user action | Do it in the event handler |
| Fetching data | Use a data library or a framework loader |
| Syncing two pieces of state | Remove one of them |

```tsx
// Effect chain: renders twice, and the intermediate state is visible
useEffect(() => { setFullName(`${first} ${last}`); }, [first, last]);

// Just compute it
const fullName = `${first} ${last}`;
```

When you do use an effect: include **every** referenced value in the dependency
array, return a cleanup function, and handle the fact that it may run twice in
development Strict Mode — which is a bug detector, not a bug.

Fetching in `useEffect` is where race conditions live: two requests, the slower
one resolving last and overwriting fresh data. Use an `AbortController` and ignore
stale results, or use a library that already does. → `Frontend/hooks`

---
</rules>

# Keys are identity, not position

<rules>
```tsx
// Index keys: deleting the first item makes React reuse the wrong DOM node.
// Input values, focus and scroll position follow the index, not the item.
{items.map((item, i) => <Row key={i} item={item} />)}

// Stable identity
{items.map((item) => <Row key={item.id} item={item} />)}
```

Index keys are safe **only** for a list that is never reordered, filtered, or
prepended to. Since that is rarely guaranteed, use the id.

The same mechanism is a feature: changing the `key` on a component discards its
state and remounts it — the correct way to reset a form when the selected record
changes.

---
</rules>

# Memoise on evidence

<rules>
`memo`, `useMemo` and `useCallback` are not free: they add allocation, comparison
cost and code that must stay correct.

- Profile first with the React DevTools Profiler. Optimise the component that
  actually shows up.
- The React Compiler handles most memoisation automatically. If it is enabled,
  manual memoisation is usually noise.
- `useMemo` for a genuinely expensive computation or a referentially-stable value
  passed to a memoised child — not for `{a: 1}`.
- Composition often beats memoisation: passing `children` through means the parent
  re-rendering does not re-render them.

**Never** memoise to fix an infinite loop. That is a dependency bug; fix the
dependency.

---
</rules>

# Rendering untrusted content

<rules>
```tsx
// React escapes this automatically — safe
<div>{userComment}</div>

// This bypasses every protection React gives you
<div dangerouslySetInnerHTML={{ __html: userComment }} />
```

If you must render HTML, sanitise it with `DOMPurify` on a strict allowlist,
server-side where possible.

Also unsafe: `href={userUrl}` permits `javascript:` — validate the scheme.
`<script src={userValue}>` and `style={{ background: userValue }}` are equally
injectable. → `Security/xss`

---
</rules>

# Accessibility is not optional

<rules>
- Semantic elements first: `<button>`, `<a href>`, `<nav>`, `<main>`. A `<div
  onClick>` is not keyboard-reachable and is invisible to a screen reader.
- Every input has a `<label>` associated by `htmlFor`.
- Focus must be visible and managed: on route change, on modal open, and returned
  on close.
- ARIA is a last resort. A correct native element needs none.
- Images have `alt`; decorative images have `alt=""`.
- Test with a keyboard only, and run `axe` in CI. → `Testing/accessibility`

---
</rules>

# Anti-patterns

<antipatterns>
| Anti-pattern | Why it fails | Fix |
| --- | --- | --- |
| State duplicating derived data | Two sources of truth diverge | Compute during render |
| Boolean flags for a state machine | Permits impossible combinations | A discriminated union |
| State lifted too high | Re-renders unrelated subtrees | Lowest common owner |
| Effect to compute derived state | Extra render; visible intermediate state | Compute during render |
| Effect to reset state on prop change | Runs after paint; flashes | Change the `key` |
| Fetching in an effect without cleanup | Race conditions overwrite fresh data | `AbortController` or a data library |
| Missing effect dependencies | Stale closures capture old values | Exhaustive deps lint rule |
| Index as key | Wrong DOM reused; input state follows position | Stable id |
| Memoising everything | Cost with no measured benefit | Profile first |
| Memoising to stop a loop | Hides a dependency bug | Fix the dependency |
| Mutating state directly | React does not re-render | Replace, never mutate |
| `dangerouslySetInnerHTML` with user content | XSS | Sanitise on an allowlist |
| Unvalidated `href` from input | `javascript:` execution | Validate the scheme |
| `<div onClick>` | Not keyboard or screen-reader accessible | `<button>` |
| Business logic inside components | Untestable without rendering | Extract to functions |

---
</antipatterns>

# Checklist

<checklist>
- [ ] No state stores what can be derived from other state or props
- [ ] State lives at the lowest common owner of its consumers
- [ ] Related state is modelled so impossible combinations cannot exist
- [ ] Effects are used only to synchronise with systems outside React
- [ ] Derived values are computed during render, not in effects
- [ ] State resets are done with `key`, not effects
- [ ] Every effect has exhaustive dependencies and a cleanup function
- [ ] Data fetching cancels or ignores stale responses
- [ ] List keys are stable identities, never array indices
- [ ] Memoisation is applied only where profiling showed a cost
- [ ] State is replaced, never mutated
- [ ] `dangerouslySetInnerHTML` is unused, or the input is sanitised
- [ ] URLs from user input are scheme-validated
- [ ] Interactive elements are semantic and keyboard-reachable
- [ ] Every input has an associated label; focus is managed on navigation
- [ ] Business logic lives outside components and is unit-tested
</checklist>
