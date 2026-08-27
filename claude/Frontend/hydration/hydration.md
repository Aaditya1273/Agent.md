---
targetModels:
  - "Claude Fable 5"
  - "Claude Opus 5"
  - "Claude Sonnet 5"
  - "Claude 5 Family"
  - "Future Claude Models"
name: hydration
category: Frontend
description: Hydration correctness — why server and client HTML must match, the values that reliably break it, and how to handle genuinely client-only content.
license: MIT
author: Agent.md maintainers
last-verified: 2026-08-23
reviewed-by: unreviewed
---
<!-- Generated from models/_canonical by scripts/build-model-variants.js.
     Edit the canonical source, not this file. Structure adapted for Claude per deep-research.md. -->
# Purpose

<purpose>
Rules for keeping server-rendered HTML and client-rendered output identical.

Hydration attaches React to existing server markup instead of recreating it. When
the two disagree, React discards the server tree and re-renders — you pay for
server rendering, get none of its benefit, and users can see wrong content before
the correction.

---
</purpose>

# The rule

<rules>
**Given the same props and state, the server and the first client render must
produce identical output.**

Everything below is a consequence. React does not compare the entire tree
byte-for-byte in production, so a mismatch can be silent — wrong text that
"corrects itself", a `<details>` that starts open, event handlers attached to the
wrong node.

---
</rules>

# What reliably breaks it

<rules>
| Cause | Why | Fix |
| --- | --- | --- |
| `new Date()`, `Date.now()` | Different instants | Render after mount, or pass a fixed timestamp as a prop |
| `Math.random()`, `crypto.randomUUID()` | Different values | `useId()`, or generate on the server and pass down |
| `window`, `document`, `navigator` | Undefined on the server | Effect or `useSyncExternalStore` |
| `localStorage` (theme, preferences) | Server cannot read it | Cookie, or a pre-hydration inline script |
| `matchMedia`, viewport size | No viewport on the server | CSS media queries, or `useSyncExternalStore` |
| Locale/timezone formatting | Server locale differs from the user's | Format on the client, or pass an explicit locale |
| Feature flags evaluated client-side | Different assignment per side | Resolve on the server, pass down |
| Invalid HTML nesting | The browser repairs it before React sees it | Valid nesting |
| Browser extensions | They mutate the DOM before hydration | Not fixable; ignore known cases |

Invalid nesting is the one that surprises people: `<p><div/></p>` is auto-corrected
by the parser, so the DOM no longer matches what React rendered. `<div>` inside
`<p>`, `<a>` inside `<a>`, and anything but `<tr>` directly inside `<table>` all
do this.

---
</rules>

# Correct patterns

<rules>
```tsx
// 1. Genuinely client-only content: render a placeholder first.
//    Two renders, but no mismatch and no layout shift if the placeholder matches.
const [mounted, setMounted] = useState(false);
useEffect(() => setMounted(true), []);
return mounted ? <LocalTime value={ts} /> : <span suppressHydrationWarning>&nbsp;</span>;

// 2. External stores: the server snapshot must be deterministic
const theme = useSyncExternalStore(
  subscribe,
  () => localStorage.getItem("theme") ?? "light",   // client
  () => "light"                                     // server — always the same
);

// 3. Stable ids across the boundary
const id = useId();
return <><label htmlFor={id}>Email</label><input id={id} /></>;
```

For theme specifically, the two options that avoid a flash:

- Store the preference in a **cookie**, read it server-side, and render the correct
  markup on the first pass. This is the only approach with no flash and no
  mismatch.
- Or run a tiny **inline script before hydration** that sets a `data-theme`
  attribute from `localStorage`, and drive styling entirely from CSS so React
  never renders the difference.

`suppressHydrationWarning` silences the warning for **one element's text content
only**. It is correct for a timestamp; it is not a general fix, and it does not
make the mismatch go away — it only stops the message.

---
</rules>

# Streaming and Suspense

<rules>
With streaming SSR, hydration happens progressively per Suspense boundary. Two
consequences:

- A boundary whose fallback and content differ in size causes layout shift when it
  resolves. Size skeletons to match. → `Frontend/performance`
- Interaction before hydration completes is queued by React (selective
  hydration prioritises the boundary the user touched), but only for React
  handlers. Native behaviour on an unhydrated custom control does nothing — which
  is a reason to prefer real `<button>` and `<a href>` elements.

Errors thrown during hydration surface as client errors, not server ones. Wrap
risky subtrees in an error boundary so one broken widget does not blank the page.

---
</rules>

# Detection

<rules>
- Mismatches are logged in development. **Treat every hydration warning as a bug**,
  not noise — the production consequence is silent.
- Add an end-to-end test that loads key pages with JavaScript enabled and asserts
  no console error. → `Testing/e2e`
- Test with a cold cache and a throttled connection, where the pre-hydration
  window is long enough to see the wrong content.
- Check pages that depend on time, locale, authentication state and feature flags
  specifically — those are where mismatches concentrate.

```html
<!-- The only theme approach with no flash and no mismatch: React never renders
     the difference, because CSS does. Runs before first paint, before hydration. -->
<script>
  (function () {
    var t = localStorage.getItem("theme");
    if (!t) t = matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    document.documentElement.dataset.theme = t;
  })();
</script>
```

```css
:root[data-theme="dark"] { --bg: #111; --fg: #eee; }
```

The alternative — storing the preference in a cookie and reading it in the server
render — avoids the inline script entirely and is preferable where a session
already exists.

---
</rules>

# Anti-patterns

<antipatterns>
| Anti-pattern | Why it fails | Fix |
| --- | --- | --- |
| `new Date()` in render | Server and client differ | Pass a timestamp; format after mount |
| `Math.random()` for keys or ids | Different per render pass | `useId()` or server-generated |
| Reading `window` during render | Undefined on the server | Effect or external store |
| Theme read from `localStorage` in render | Server cannot see it; flash and mismatch | Cookie or pre-hydration script |
| `useState` + `useEffect` for an external store | Two renders and a visible flash | `useSyncExternalStore` |
| Non-deterministic server snapshot | Mismatch by construction | Constant server snapshot |
| Client-side feature flag evaluation | Different branch per side | Resolve server-side |
| Invalid HTML nesting | The parser rewrites the DOM | Valid structure |
| `suppressHydrationWarning` as a fix | Hides the mismatch, does not remove it | Fix the cause |
| Ignoring hydration warnings | Production failure is silent | Treat as a bug |
| Mis-sized Suspense fallbacks | Layout shift on resolve | Match content dimensions |
| Custom controls instead of native elements | No behaviour before hydration | `<button>`, `<a href>` |
| No error boundary around risky subtrees | One failure blanks the page | Add boundaries |

---
</antipatterns>

# Checklist

<checklist>
- [ ] Server and first client render produce identical output for the same props
- [ ] No date, random value or browser global is evaluated during render
- [ ] Generated ids come from `useId()`
- [ ] External stores are read with `useSyncExternalStore` and a constant server snapshot
- [ ] Theme and preferences come from a cookie or a pre-hydration script
- [ ] Feature flags are resolved server-side and passed down
- [ ] Locale and timezone formatting is explicit, not implicit
- [ ] HTML nesting is valid throughout
- [ ] `suppressHydrationWarning` is used only for single-element text, with a comment
- [ ] Hydration warnings are treated as bugs and fixed
- [ ] Suspense fallbacks match the dimensions of their content
- [ ] Interactive elements are native so they work before hydration
- [ ] Error boundaries wrap subtrees that may fail during hydration
- [ ] Key pages are tested for console errors with a throttled connection
</checklist>
