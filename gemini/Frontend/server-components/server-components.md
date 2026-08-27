---
targetModels:
  - "Gemini 3.6 Flash"
  - "Gemini 3.5 Flash"
  - "Gemini 3.1 Pro"
  - "Gemini 3 Family"
  - "Future Gemini Models"
name: server-components
category: Frontend
description: React Server Components — what runs where, the serialisation boundary, data fetching without waterfalls, and keeping secrets off the client.
license: MIT
author: Agent.md maintainers
last-verified: 2026-08-23
reviewed-by: unreviewed
---
<!-- Generated from models/_canonical by scripts/build-model-variants.js.
     Edit the canonical source, not this file. Structure adapted for Gemini per deep-research.md. -->


# Purpose

Rules for React Server Components. The model: components render on the server by
default, ship no JavaScript, and can read data directly. Interactivity opts in
with `"use client"`.

The two things worth internalising: **the boundary is a security boundary**, and
**everything crossing it is serialised into the HTML**.

Client-component specifics are `Frontend/client-components`; framework wiring is
`Backend/nextjs`.

---

# What belongs where

| Server component | Client component |
| --- | --- |
| Data fetching, database access | `useState`, `useReducer`, `useEffect` |
| Secrets and API keys | Event handlers (`onClick`, `onChange`) |
| Large dependencies (markdown, syntax highlighting) | Browser APIs (`window`, `localStorage`) |
| Static content and layout | Animation, focus, scroll |
| Authorization decisions | Anything needing interactivity |

Default to a server component. Push `"use client"` **down** the tree, to the
smallest interactive leaf:

```tsx
// Bad: the whole page becomes a client component, and every child ships to the browser
"use client";
export default function ProductPage() { … }

// Good: the page stays on the server; only the button is interactive
export default async function ProductPage({ id }) {
  const product = await db.product.findUnique({ where: { id } });   // server-only
  return (<article><h1>{product.name}</h1><AddToCart id={product.id} /></article>);
}
```

`"use client"` marks an **entry point**, not a single file: everything it imports
also ends up in the bundle. One `"use client"` at the top of a layout ships the
entire tree below it.

---

# The boundary is a security boundary

```ts
// lib/db.ts
import "server-only";        // importing this from a client component fails the build
export const db = new PrismaClient();
```

- Mark every module holding secrets, database access or internal service calls
  with `server-only`. It converts a silent leak into a build error.
- **Props passed to a client component are serialised into the HTML** and visible
  in view-source. Passing a whole user record sends the password hash to the
  browser.

```tsx
// Leaks every column, including internal flags and hashes
<Profile user={user} />

// Explicit projection
<Profile user={{ id: user.id, name: user.name, avatarUrl: user.avatarUrl }} />
```

- Only serialisable values cross: primitives, plain objects, arrays, `Date`, `Map`,
  `Set`, and Server Action references. Functions, class instances and `Symbol`s do
  not — a Prisma model with methods will fail or silently lose them.
- Authorization is enforced on the server, in the component or the data layer.
  A client component conditionally rendering nothing still received the data.
  → `Backend/authorization`

---

# Fetch without waterfalls

Server components can `await` directly, which removes the client-side
fetch-on-render waterfall. It also makes it easy to create a **server-side**
waterfall by awaiting sequentially.

```tsx
// Sequential — 300ms + 400ms
const user = await getUser(id);
const orders = await getOrders(id);

// Parallel — max(300ms, 400ms)
const [user, orders] = await Promise.all([getUser(id), getOrders(id)]);
```

- Start independent requests together.
- Fetch **where the data is used**, not high in the tree and drilled down.
  React deduplicates identical `fetch` calls within a render pass, so two
  components asking for the same thing cost one request.
- Stream slow sections with `<Suspense>` so the fast part of the page appears
  immediately:

```tsx
<Suspense fallback={<OrdersSkeleton />}>
  <Orders userId={id} />       {/* the rest of the page does not wait */}
</Suspense>
```

- Provide a real skeleton with the same dimensions as the content, or streaming
  trades a slow page for a shifting one. → `Frontend/performance`

---

# Composition across the boundary

A client component cannot import a server component — but it can **render one
passed as `children`**:

```tsx
// Server component page
<ClientTabs>
  <ServerRenderedPanel />     {/* stays on the server; only its output crosses */}
</ClientTabs>
```

This is the pattern that keeps a heavy dependency out of the bundle while still
using an interactive shell around it. Use it before restructuring the tree.

Other rules:

- A server component cannot use hooks, state, effects, or browser APIs. If you
  need one, you need a client component.
- Context providers must be client components, but they can wrap server-rendered
  `children`.
- Server components re-render on navigation and revalidation, not on interaction.
  Anything that must change on click belongs in a client component.

---

# Anti-patterns

| Anti-pattern | Why it fails | Fix |
| --- | --- | --- |
| `"use client"` at the top of a page or layout | The entire subtree ships to the browser | Push it to interactive leaves |
| Secret module imported by a client component | The secret is in the bundle | `server-only` |
| Passing a whole database row as a prop | Serialised into the HTML | Explicit projection |
| Passing a function or class instance | Not serialisable; fails or silently degrades | Plain data, or a Server Action |
| Sequential independent `await`s | Server-side waterfall | `Promise.all` |
| Fetching high and prop-drilling | Couples the tree; blocks streaming | Fetch where used |
| No `<Suspense>` around slow sections | The whole page waits for the slowest query | Stream with boundaries |
| Skeletons of the wrong size | Streaming causes layout shift | Match the content dimensions |
| Hiding data with a client-side condition | The data still reached the browser | Authorize on the server |
| Hooks in a server component | Not supported | Client component |
| Duplicating a fetch instead of relying on dedup | Extra load for no reason | Let React deduplicate |
| Restructuring instead of `children` composition | Heavy dependencies pushed to the client | Pass server output as `children` |

---

# Checklist

- [ ] Verify: Components are server components by default
- [ ] Verify: `"use client"` appears at the smallest interactive leaves, not at layouts
- [ ] Verify: Every server-only module is marked with `server-only`
- [ ] Verify: No secret, database client or internal service is reachable from client code
- [ ] Verify: Props crossing to client components are explicitly projected
- [ ] Verify: Only serialisable values cross the boundary
- [ ] Verify: Authorization is enforced on the server, not by conditional rendering
- [ ] Verify: Independent data fetches run in parallel
- [ ] Verify: Data is fetched where it is used, relying on request deduplication
- [ ] Verify: Slow sections are wrapped in `<Suspense>` with correctly sized fallbacks
- [ ] Verify: Server content is passed to interactive shells as `children`
- [ ] Verify: No hooks, state or browser APIs appear in server components
