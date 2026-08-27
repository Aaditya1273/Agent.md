---
targetModels:
  - "Claude Fable 5"
  - "Claude Opus 5"
  - "Claude Sonnet 5"
  - "Claude 5 Family"
  - "Future Claude Models"
name: nextjs
category: Frontend
description: Next.js App Router frontend rules — routing and layouts, rendering strategy per route, images and fonts, streaming, and the client boundary.
license: MIT
author: Agent.md maintainers
last-verified: 2026-08-23
reviewed-by: unreviewed
---
<!-- Generated from models/_canonical by scripts/build-model-variants.js.
     Edit the canonical source, not this file. Structure adapted for Claude per deep-research.md. -->
# Purpose

<purpose>
Rules for the frontend side of a Next.js App Router application: file
conventions, where each route renders, and the built-in components that exist
because the naive version is slow.

Server-side concerns — route handlers, Server Actions, caching semantics — are
`Backend/nextjs`.

---
</purpose>

# File conventions do real work

<rules>
```
app/
  layout.tsx            # root shell — <html>, <body>, providers. Never re-renders on navigation
  page.tsx              # /
  loading.tsx           # automatic Suspense boundary for this segment
  error.tsx             # client error boundary; must be a client component
  not-found.tsx         # 404 for this subtree
  products/
    layout.tsx          # persists across /products/* navigations
    page.tsx            # /products
    [slug]/page.tsx     # /products/:slug
    @modal/…            # parallel route — intercepted modals
```

- A layout **preserves state** across navigation within its subtree. Put the
  navigation, sidebar and providers there, not in each page.
- `loading.tsx` is a Suspense fallback the framework wires for you. Without it the
  navigation blocks until data resolves and nothing tells the user anything.
- `error.tsx` must be `"use client"` and receives a `reset()` function — offer a
  retry rather than a dead end.
- `not-found.tsx` plus `notFound()` returns a real `404` for a missing record.
  → `Frontend/routing`

Route groups `(marketing)` organise without affecting the URL; private folders
`_components` are excluded from routing entirely.

---
</rules>

# Decide rendering per route

<rules>
Next.js infers static or dynamic from what a route uses. Reading `cookies()`,
`headers()`, `searchParams` or an uncached `fetch` makes it dynamic.

```bash
next build      # ○ Static   ● SSG   ƒ Dynamic — read this output every release
```

| Route | Should be |
| --- | --- |
| Marketing, docs, blog | Static |
| Product catalogue | Static with revalidation (`revalidate`) |
| Personalised dashboard | Dynamic |
| Anything authenticated | Dynamic, uncached |

A page you expected to be dynamic rendering statically is a **correctness** bug —
it means one user's data was baked into a shared HTML file. Check the build output
rather than assuming.

`generateStaticParams` pre-renders known dynamic paths at build time; combine it
with `revalidate` for a large catalogue rather than generating every page on every
build. → `Backend/nextjs`

---
</rules>

# Push the client boundary down

<rules>
`"use client"` marks an entry point: everything it imports, transitively, ships to
the browser.

```tsx
// The page stays on the server; only the interactive control is a client component
export default async function ProductPage({ params }) {
  const product = await getProduct(params.slug);
  return (<article><ProductDetails product={product} /><AddToCart id={product.id} /></article>);
}
```

- Never put `"use client"` at the top of a layout or page.
- Pass server-rendered content into interactive shells as `children`, so heavy
  content stays out of the bundle.
- Props crossing the boundary are serialised into the HTML — project explicit
  fields, never a whole database row. → `Frontend/server-components`

---
</rules>

# Use the built-in components

<rules>
```tsx
import Image from "next/image";
import Link from "next/link";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"], display: "swap", variable: "--font-sans" });

<Image src={product.image} alt={product.name} width={800} height={600}
       priority sizes="(max-width: 768px) 100vw, 800px" />
<Link href={`/products/${slug}`} prefetch>…</Link>
```

| Component | What it does that plain HTML does not |
| --- | --- |
| `next/image` | Format negotiation, responsive `srcset`, reserved space, lazy by default |
| `next/link` | Client navigation plus prefetch on viewport entry |
| `next/font` | Self-hosts, subsets, and applies `size-adjust` so the swap does not shift layout |
| `next/script` | Loading strategies (`afterInteractive`, `lazyOnload`, `worker`) |

Rules that are easy to get wrong:

- `priority` on the LCP image, and **never** lazy-load it.
- Always supply `sizes` for a responsive image, or the browser downloads the
  largest candidate.
- `next/font` eliminates the third-party font request entirely — a Google Fonts
  `<link>` costs a connection and a round trip before any text renders.
- Third-party scripts through `next/script` with an explicit strategy; a bare
  `<script>` in the head blocks rendering. → `Frontend/performance`

---
</rules>

# Stream instead of blocking

<rules>
```tsx
export default async function Page() {
  return (
    <>
      <Header />                                   {/* renders immediately */}
      <Suspense fallback={<OrdersSkeleton />}>
        <Orders />                                 {/* streams when its query resolves */}
      </Suspense>
    </>
  );
}
```

Wrap slow sections so the fast part of the page is visible immediately. Size the
skeleton to match the content, or streaming trades a slow page for a shifting one.

Start independent fetches together (`Promise.all`) — sequential `await`s in a
server component create a server-side waterfall that streaming does not fix.

---
</rules>

# Anti-patterns

<antipatterns>
| Anti-pattern | Why it fails | Fix |
| --- | --- | --- |
| `"use client"` on a layout or page | The whole subtree ships to the browser | Mark interactive leaves |
| Whole database rows as client props | Serialised into the HTML | Explicit projection |
| Not checking `next build` output | Personalised routes rendered statically | Read static/dynamic per route |
| Providers in every page | State lost on navigation | Providers in a layout |
| No `loading.tsx` | Navigation blocks with no feedback | Add the boundary |
| `error.tsx` without `reset()` | Users hit a dead end | Offer a retry |
| Missing `not-found` handling | Deleted records render an empty page | `notFound()` plus the file |
| `<img>` instead of `next/image` | No responsive sizes, no reserved space | Use the component |
| Lazy-loading the LCP image | Delays the metric it defines | `priority` |
| `next/image` without `sizes` | Largest candidate downloaded on mobile | Provide `sizes` |
| Google Fonts via `<link>` | Extra connection before text renders | `next/font` |
| Bare third-party `<script>` | Blocks rendering | `next/script` with a strategy |
| No `<Suspense>` around slow data | The page waits for the slowest query | Stream |
| Sequential independent `await`s | Server-side waterfall | `Promise.all` |
| Mis-sized skeletons | Layout shift on resolve | Match content dimensions |

---
</antipatterns>

# Checklist

<checklist>
- [ ] Shared shell, navigation and providers live in layouts, not pages
- [ ] Every segment has `loading.tsx`, `error.tsx` and a `not-found` path
- [ ] `error.tsx` offers a working retry
- [ ] `next build` output is reviewed; each route's static/dynamic status is intended
- [ ] No authenticated or personalised route renders statically
- [ ] `generateStaticParams` is used for known dynamic paths
- [ ] `"use client"` appears only at interactive leaves
- [ ] Props crossing to client components are explicitly projected
- [ ] Server content is passed into client shells as `children`
- [ ] Images use `next/image` with dimensions and `sizes`
- [ ] The LCP image is `priority` and never lazy-loaded
- [ ] Fonts use `next/font` with `display: swap`
- [ ] Third-party scripts use `next/script` with an explicit strategy
- [ ] Slow sections are wrapped in `<Suspense>` with correctly sized fallbacks
- [ ] Independent data fetches run in parallel
</checklist>
