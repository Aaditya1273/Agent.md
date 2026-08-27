---
targetModels:
  - "DeepSeek V4"
  - "DeepSeek V3.2"
  - "DeepSeek R1"
  - "DeepSeek V3 Family"
  - "Future DeepSeek Models"
name: images
category: Performance
description: Image delivery — modern formats, responsive sizes, reserved space, lazy loading, and the LCP image that must never be deferred.
license: MIT
author: Agent.md maintainers
last-verified: 2026-08-23
reviewed-by: unreviewed
---
<!-- Generated from models/_canonical by scripts/build-model-variants.js.
     Edit the canonical source, not this file. Structure adapted for DeepSeek per deep-research.md. -->


# Purpose

Rules for delivering images. Images are usually the largest bytes on a page, the
LCP element, and the main cause of layout shift — so they affect all three Core
Web Vitals at once.

Four levers, in order of impact: **format**, **dimensions**, **loading priority**,
**reserved space**.

---

# Format and compression

| Format | Use for | Relative size |
| --- | --- | --- |
| **AVIF** | Photographs, complex images | ~50% of JPEG |
| **WebP** | General fallback | ~70% of JPEG |
| JPEG | Legacy fallback only | Baseline |
| **SVG** | Icons, logos, diagrams | Tiny, resolution-independent |
| PNG | Only when lossless raster is required | Large |
| **WebP/AVIF animated** | Replaces GIF | ~10% of GIF |

```html
<picture>
  <source srcset="hero.avif" type="image/avif" />
  <source srcset="hero.webp" type="image/webp" />
  <img src="hero.jpg" width="1200" height="630" alt="…" fetchpriority="high" />
</picture>
```

- **Never ship GIF for animation.** An animated WebP or a muted, looping,
  `playsinline` MP4 is a fraction of the size.
- Quality 75–85 is visually indistinguishable from 100 for most photographs at
  roughly half the bytes.
- Strip metadata (EXIF) — it adds kilobytes and can leak GPS coordinates from
  user uploads. That is a privacy issue, not only a size one.
- SVGs are XML and can contain scripts: sanitise any user-supplied SVG before
  serving it inline. → `Security/xss`

---

# Serve the right size

A 3000px image displayed at 400px wastes roughly 98% of its bytes — and mobile
users pay for it.

```html
<img src="photo-800.avif"
     srcset="photo-400.avif 400w, photo-800.avif 800w, photo-1600.avif 1600w"
     sizes="(max-width: 768px) 100vw, 800px"
     width="800" height="600" alt="…" />
```

`sizes` is the part that is usually wrong or missing. Without it the browser
assumes `100vw` and downloads the largest candidate — so `srcset` alone does not
help. `sizes` must describe the image's **rendered** width at each breakpoint.

Generate variants at build time or through an image service (Cloudinary, imgix,
Next.js Image, Cloudflare Images). Do not resize in the browser; the full-size
bytes have already been downloaded.

Serve at the device pixel ratio the display needs, not blindly at 2× — the
difference above 2× is imperceptible and doubles the bytes again.

---

# Priority: the LCP image is special

```html
<!-- Above the fold: load it first, never lazily -->
<img src="hero.avif" width="1200" height="630" alt="…"
     fetchpriority="high" decoding="async" />

<!-- Below the fold -->
<img src="card.avif" width="400" height="300" alt="…" loading="lazy" />
```

- `loading="lazy"` on the LCP image **delays the metric it defines**. This is the
  most common self-inflicted LCP regression, and it usually arrives via a blanket
  "lazy-load all images" change.
- `fetchpriority="high"` on the LCP image so it is not queued behind other
  requests.
- A hero image inside a JavaScript carousel is not discoverable by the preload
  scanner — either render the first slide in HTML or `preload` it explicitly.
- Background images in CSS are discovered late, after the stylesheet parses. Do
  not use one for the LCP element.

---

# Reserve the space

```html
<img src="…" width="800" height="600" />        <!-- intrinsic ratio reserved -->
```

```css
img { max-width: 100%; height: auto; aspect-ratio: attr(width) / attr(height); }
```

Always set `width` and `height` (or `aspect-ratio`). Without them the browser does
not know the image's shape until it downloads, so the layout jumps when it
arrives — the primary cause of poor CLS.

This applies to responsive images too: the attributes provide the **ratio**; CSS
controls the rendered size.

Avoid layout-shifting placeholders. A low-quality image placeholder (LQIP) or a
dominant-colour block at the correct aspect ratio is better than empty space, and
does not shift when replaced.

---

# Delivery

- Serve from a CDN with long-lived, immutable caching on content-hashed URLs.
  → `Performance/caching`
- Use an image service that negotiates format on `Accept` so a browser supporting
  AVIF gets AVIF without duplicated markup.
- **Restrict which origins your optimiser will fetch** — an open image proxy is
  free compute for anyone who finds it, and a common source of surprise bills.
  → `DevOps/vercel`
- Cap upload size and validate type by **magic bytes**, not by extension or
  `Content-Type`. → `Backend/validation`
- Process user uploads out of band, in a job, with bounded memory — decoding a
  hostile image can allocate far more than its file size.
  → `Backend/background-jobs`

---

# Anti-patterns

| Anti-pattern | Why it fails | Fix |
| --- | --- | --- |
| JPEG/PNG only | Twice the bytes of AVIF | `<picture>` with modern formats |
| Animated GIF | 10× an equivalent video | Animated WebP or MP4 |
| One size for all viewports | Mobile downloads desktop images | `srcset` with `sizes` |
| `srcset` without `sizes` | Browser assumes `100vw`; largest downloaded | Always provide `sizes` |
| Resizing in CSS only | Full-size bytes already downloaded | Serve the right size |
| Missing `width`/`height` | Layout shift; poor CLS | Always set them |
| Lazy-loading the LCP image | Delays the metric it defines | `fetchpriority="high"` |
| Blanket lazy-loading | Catches the hero image | Exclude above-the-fold |
| LCP image as a CSS background | Discovered late | Use `<img>` or preload |
| Hero inside a JS carousel | Invisible to the preload scanner | Render the first slide in HTML |
| Quality 100 | Double the bytes, no visible gain | 75–85 |
| EXIF retained on user uploads | Bytes, and GPS location leaks | Strip metadata |
| Unsanitised user SVG | Script execution | Sanitise or serve as an image only |
| Open image-optimisation proxy | Free compute for strangers | Restrict source origins |
| Upload type from extension | Trivially spoofed | Magic-byte detection |
| Synchronous upload processing | Memory spikes; blocked requests | Background job with limits |
| No CDN | Every image crosses the ocean | Edge delivery with immutable caching |

---

# Checklist

- [ ] Images are served as AVIF or WebP with a fallback
- [ ] Icons and logos are SVG
- [ ] No animated GIFs are served
- [ ] Quality settings are 75–85, not 100
- [ ] Metadata is stripped from generated and uploaded images
- [ ] `srcset` provides multiple widths and `sizes` describes rendered width
- [ ] Variants are generated at build time or by an image service
- [ ] Every image sets `width` and `height` or an explicit aspect ratio
- [ ] The LCP image is not lazy-loaded and carries `fetchpriority="high"`
- [ ] The LCP element is a real `<img>` discoverable by the preload scanner
- [ ] Below-the-fold images use `loading="lazy"`
- [ ] Placeholders preserve the aspect ratio and do not shift
- [ ] Images are served from a CDN with immutable caching on hashed URLs
- [ ] The image optimiser only fetches from allowlisted origins
- [ ] Uploads are size-capped and type-checked by content
- [ ] User uploads are processed in a background job with bounded memory
- [ ] User-supplied SVGs are sanitised
