---
targetModels:
  - "DeepSeek V4"
  - "DeepSeek V3.2"
  - "DeepSeek R1"
  - "DeepSeek V3 Family"
  - "Future DeepSeek Models"
name: fonts
category: Performance
description: Web font delivery — self-hosting, subsetting, font-display, metric-compatible fallbacks, and eliminating the layout shift a font swap causes.
license: MIT
author: Agent.md maintainers
last-verified: 2026-08-23
reviewed-by: unreviewed
---
<!-- Generated from models/_canonical by scripts/build-model-variants.js.
     Edit the canonical source, not this file. Structure adapted for DeepSeek per deep-research.md. -->


# Purpose

Rules for web fonts. Fonts are render-blocking in effect — text either does not
appear or appears twice — so they affect LCP and CLS directly while usually being
a small share of total bytes.

Four decisions: **how many**, **where from**, **what happens while loading**, and
**how much the swap shifts the layout**.

---

# Ship fewer fonts

Each family, weight and style is a separate file and a separate request.

| Ship | Skip |
| --- | --- |
| One family, 2–3 weights | Five weights "for flexibility" |
| A variable font, one file | Nine static weights of the same family |
| Real italics if used | Italics that are never rendered |
| Latin subset by default | Full Unicode coverage nobody needs |

A **variable font** replaces many weights with one file and interpolates between
them. It is usually smaller than three static weights and always fewer requests.

Never rely on synthesised bold or italic (the browser skewing a regular face) for
a design that matters — but also do not ship a weight to avoid a synthesis nobody
notices.

Consider whether a system font stack is enough. It costs zero bytes and zero
requests, and for body text it is frequently indistinguishable to users:

```css
font-family: system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
```

---

# Self-host, always

```html
<link rel="preload" href="/fonts/inter-var.woff2" as="font" type="font/woff2" crossorigin />
```

A third-party font host costs a DNS lookup, a TCP connection and a TLS handshake
**before the font request begins** — three round trips on a cold connection,
roughly 300 ms on mobile, before any text can render in the intended face.

Cross-origin caches are also partitioned per site in modern browsers, so the
"someone else already downloaded it" argument no longer holds.

Self-hosting also removes a privacy and availability dependency: a font CDN sees
every one of your users, and its outage is your outage.

`crossorigin` on the preload is mandatory — fonts are fetched in CORS mode, and a
preload without it downloads the file **twice**.

Serve `woff2` only. It is universally supported and ~30% smaller than `woff`;
shipping `ttf` or `eot` fallbacks is dead weight.

---

# Subset

A full Latin + Cyrillic + Greek font is often 5–10× the size of the Latin subset
you actually render.

```bash
# pyftsubset from fonttools — keep only what the site uses
pyftsubset inter.ttf --output-file=inter-latin.woff2 --flavor=woff2 \
  --layout-features='kern,liga' \
  --unicodes="U+0000-00FF,U+0131,U+2000-206F,U+2122"
```

- Use `unicode-range` in `@font-face` so the browser downloads only the subsets a
  page needs.
- For icon fonts: do not use icon fonts. Inline SVG is smaller, accessible, and
  does not fail into unreadable glyph boxes. → `Performance/images`

---

# `font-display` and the swap

```css
@font-face {
  font-family: "Inter";
  src: url("/fonts/inter-var.woff2") format("woff2-variations");
  font-weight: 100 900;
  font-display: swap;
}
```

| Value | Behaviour | Use when |
| --- | --- | --- |
| `swap` | Fallback immediately, swap when loaded | **Default** — content is readable at once |
| `optional` | Fallback; use the font only if it arrives almost instantly | Zero CLS matters more than the typeface |
| `fallback` | Short block, then fallback, short swap window | Compromise |
| `block` | Invisible text up to 3s | Almost never — logos at most |
| `auto` | Browser default, effectively `block` | Never rely on it |

`swap` avoids invisible text (FOIT) but causes a visible reflow when the real font
arrives — which is a CLS contribution. Fix the reflow rather than reverting to
`block`:

```css
@font-face {
  font-family: "Inter Fallback";
  src: local("Arial");
  size-adjust: 107%;          /* match the real font's rendered size */
  ascent-override: 90%;
  descent-override: 22%;
  line-gap-override: 0%;
}
body { font-family: "Inter", "Inter Fallback", sans-serif; }
```

Metric overrides make the fallback occupy the **same space** as the real font, so
the swap changes glyph shapes without moving anything. Tools like `fontaine` and
Next.js `next/font` generate these automatically — which is the main reason to use
them.

Preload **only** the fonts used above the fold, typically one. Preloading every
weight competes with the resources that actually block rendering.

---

# Anti-patterns

| Anti-pattern | Why it fails | Fix |
| --- | --- | --- |
| Third-party font host | Three round trips before the font request | Self-host |
| `@import` for fonts | Serialised after CSS parsing; worst case | `<link>` or `@font-face` |
| Preload without `crossorigin` | Downloads the file twice | Add `crossorigin` |
| Preloading every weight | Competes with render-critical resources | Preload one |
| Shipping `ttf`/`woff`/`eot` | Dead weight | `woff2` only |
| Full Unicode coverage | 5–10× the needed size | Subset with `unicode-range` |
| Many static weights | One request each | Variable font |
| `font-display: block` | Invisible text for up to 3 seconds | `swap` |
| No `font-display` | Defaults to block-like behaviour | Set it explicitly |
| `swap` without metric overrides | Visible reflow; CLS | `size-adjust`, `ascent-override` |
| Icon fonts | Large, inaccessible, fail badly | Inline SVG |
| Fonts loaded via JavaScript | Delayed until scripts execute | CSS and preload |
| Synthesised bold used as design | Poor rendering | Ship the real weight, if needed |
| Ignoring the system font option | Bytes and requests for little gain | Consider `system-ui` |

---

# Checklist

- [ ] The number of families, weights and styles is minimal and justified
- [ ] A variable font replaces multiple static weights where applicable
- [ ] Using a system font stack was considered
- [ ] Fonts are self-hosted, not fetched from a third party
- [ ] Only `woff2` is served
- [ ] Fonts are subset to the characters actually rendered
- [ ] `unicode-range` limits downloads to needed subsets
- [ ] `font-display: swap` (or `optional`) is set on every `@font-face`
- [ ] A metric-compatible fallback with `size-adjust` and overrides is defined
- [ ] Only above-the-fold fonts are preloaded
- [ ] Preload links include `crossorigin`
- [ ] No icon font is used; icons are inline SVG
- [ ] Fonts are not loaded via JavaScript
- [ ] Fonts are served from a CDN with immutable, content-hashed caching
- [ ] CLS is measured after the font swap, not only before
