---
targetModels:
  - "Gemini 3.6 Flash"
  - "Gemini 3.5 Flash"
  - "Gemini 3.1 Pro"
  - "Gemini 3 Family"
  - "Future Gemini Models"
name: client-components
category: Frontend
description: Client components — when interactivity justifies the bundle, hydration correctness, browser-API access, and keeping the boundary small.
license: MIT
author: Agent.md maintainers
last-verified: 2026-08-23
reviewed-by: unreviewed
---
<!-- Generated from models/_canonical by scripts/build-model-variants.js.
     Edit the canonical source, not this file. Structure adapted for Gemini per deep-research.md. -->


# Purpose

Rules for `"use client"` components. Every one of them costs download, parse and
execution time on the user's device, so each should exist for a reason that can be
named: state, an event handler, a browser API, or an effect.

The server side is `Frontend/server-components`; hydration specifics are
`Frontend/hydration`.

---

# `"use client"` is an entry point, not a file marker

```tsx
"use client";
import { Chart } from "heavy-charting-lib";     // 180 KB — now in the bundle
import { formatMoney } from "@/lib/format";     // and this, and its imports
```

The directive marks the **start of the client boundary**. Everything reachable
from it — transitively — is bundled and shipped.

Consequences worth remembering:

- One `"use client"` at the top of a layout ships that entire subtree.
- A utility imported by both server and client code ends up in the bundle.
- Marking a file that needs no interactivity costs bytes for nothing.

Keep the boundary at the leaf:

```tsx
// The page stays on the server; only the button is a client component
export default async function Page() {
  const product = await getProduct(id);
  return <article><ProductDetails product={product} /><AddToCart id={product.id} /></article>;
}
```

---

# Justify each one

A client component needs at least one of:

| Reason | Example |
| --- | --- |
| State that changes from interaction | A dropdown, a form field |
| An event handler | `onClick`, `onChange`, `onSubmit` |
| A browser API | `localStorage`, `matchMedia`, `IntersectionObserver` |
| An effect synchronising with something external | An analytics SDK, a map library |
| A third-party library that uses any of the above | Most UI kits |

If none applies, it is a server component.

Split rather than escalating: a card whose only interactive element is a "copy"
button should be a server component containing a small client `<CopyButton>`, not
a client component containing a card.

---

# Hydration must match

React renders on the server and then attaches on the client. If the two produce
different HTML, React discards the server markup and re-renders — losing the
performance benefit and, in some cases, producing visibly wrong content.

```tsx
// Mismatch: the server and client evaluate these at different moments
<span>{new Date().toLocaleTimeString()}</span>
<span>{Math.random()}</span>
<span>{window.innerWidth}</span>        // window does not exist on the server
```

Correct patterns:

```tsx
// Values that genuinely differ: render after mount
const [mounted, setMounted] = useState(false);
useEffect(() => setMounted(true), []);
if (!mounted) return <Placeholder />;

// Reading an external store: the server snapshot must be deterministic
const theme = useSyncExternalStore(subscribe, getClientSnapshot, () => "light");
```

**Never** read `window`, `document`, `localStorage` or `navigator` during render.
They are undefined on the server. Read them in an effect or through
`useSyncExternalStore`.

Use `useId()` for generated ids that must be stable across the boundary — a random
id will differ between server and client. → `Frontend/hydration`

---

# Props and data

- Props from a server component are **serialised into the HTML**. Pass the minimum,
  and never pass anything the user should not see.
- Functions cannot cross the boundary, except Server Action references.
- Server data belongs in a server component or a query cache, not fetched again on
  mount. Refetching on the client duplicates work and creates a waterfall.
  → `Frontend/state-management`
- A client component receiving `children` from a server component does **not**
  bundle those children — that is the composition escape hatch for heavy content.

---

# Keep the bundle honest

- Lazy-load heavy interactive components so they are not in the initial payload:

```tsx
const Editor = dynamic(() => import("./Editor"), { ssr: false, loading: () => <Skeleton /> });
```

- `ssr: false` for anything that genuinely cannot render on the server (a map, a
  canvas visualisation) — but it also means nothing renders until the JavaScript
  arrives, so reserve it.
- Check what a `"use client"` file actually pulls in with a bundle analyser. A
  single icon import can drag in an entire library.
- Prefer platform APIs over dependencies inside client components — every byte is
  paid by the user, on their device. → `Frontend/performance`

---

# Anti-patterns

| Anti-pattern | Why it fails | Fix |
| --- | --- | --- |
| `"use client"` on a layout or page | The whole subtree ships to the browser | Mark interactive leaves |
| Marking a file that needs no interactivity | Bytes for nothing | Leave it on the server |
| A client component wrapping static content | Ships content that could be HTML | Invert: server wraps client |
| Reading `window` during render | Undefined on the server; hydration error | Effect or `useSyncExternalStore` |
| `Date`/`Math.random` in render | Server and client differ; mismatch | Render after mount |
| Random or index-derived ids | Differ across the boundary | `useId()` |
| Suppressing hydration warnings | Hides a real mismatch | Fix the cause |
| Refetching server data on mount | Duplicate work; waterfall | Pass it down or use a cache |
| Passing whole records as props | Serialised into the HTML | Project explicit fields |
| Heavy component in the initial bundle | Slow time-to-interactive | `dynamic` import |
| `ssr: false` by default | Nothing renders until JS loads | Only where genuinely required |
| Not checking what a client file imports | One icon drags in a library | Bundle analysis |

---

# Checklist

- [ ] Verify: Every `"use client"` file has a named reason: state, handler, browser API or effect
- [ ] Verify: The directive sits at interactive leaves, never at layouts or pages
- [ ] Verify: Static content is not wrapped inside client components
- [ ] Verify: No browser global is read during render
- [ ] Verify: Time, randomness and environment-dependent values render after mount
- [ ] Verify: Generated ids use `useId()`
- [ ] Verify: No hydration warning is suppressed without fixing the cause
- [ ] Verify: Server data is passed down or cached, not refetched on mount
- [ ] Verify: Props crossing the boundary are minimal and explicitly projected
- [ ] Verify: Heavy interactive components are dynamically imported
- [ ] Verify: `ssr: false` is used only where server rendering is genuinely impossible
- [ ] Verify: The client bundle has been analysed for unexpected dependencies
