---
targetModels:
  - "Claude Fable 5"
  - "Claude Opus 5"
  - "Claude Sonnet 5"
  - "Claude 5 Family"
  - "Future Claude Models"
name: seo
category: Frontend
description: Technical SEO for web applications — rendering strategy, canonical URLs, structured data, sitemaps, and the Core Web Vitals that affect ranking.
license: MIT
author: Agent.md maintainers
last-verified: 2026-08-23
reviewed-by: unreviewed
---
<!-- Generated from models/_canonical by scripts/build-model-variants.js.
     Edit the canonical source, not this file. Structure adapted for Claude per deep-research.md. -->
# Purpose

<purpose>
Rules for making a web application discoverable. Scope is **technical** SEO — what
engineering controls. Content strategy and keyword research are not covered.

The order of impact, which is not the order teams usually work in:

1. Can crawlers reach and render the content at all?
2. Is each page's canonical identity unambiguous?
3. Is it fast on mobile?
4. Is it marked up so results can be rich?

---
</purpose>

# Rendering: content must exist without JavaScript

<rules>
A client-rendered page ships an empty `<div id="root">`. Google will usually render
it eventually; other crawlers, social preview bots and AI crawlers often will not,
and rendering is deferred and unreliable.

| Strategy | Use for |
| --- | --- |
| Static generation | Marketing, docs, blog — anything not per-user |
| Server rendering | Catalogues, listings, anything dynamic but public |
| Incremental regeneration | Large catalogues that change occasionally |
| Client rendering | Authenticated application screens — not indexed anyway |

Verify with `curl` rather than devtools, which shows the hydrated DOM:

```bash
curl -sL https://example.com/products/widget | grep -c "<h1"
```

If the content is not in that output, assume it may not be indexed.
→ `Frontend/server-components`

---
</rules>

# One canonical URL per page

<rules>
Duplicate URLs split ranking signals between copies and can cause the wrong one to
be indexed.

```html
<link rel="canonical" href="https://example.com/products/widget" />
```

Sources of accidental duplication, all common:

- `http` and `https`; `www` and apex — pick one and `301` the rest.
- Trailing slash inconsistency (`/about` and `/about/`).
- Tracking parameters (`?utm_source=…`) creating infinite variants.
- Uppercase and lowercase paths on a case-sensitive server.
- Pagination and filtered views of the same collection.

Rules:

- A self-referencing canonical on every indexable page, absolute, matching exactly
  the URL you want indexed.
- Filtered and sorted views (`?status=paid&sort=-createdAt`) canonicalise to the
  unfiltered collection, or are `noindex`.
- Never change a URL without a `301`. → `Frontend/routing`
- `hreflang` for localised variants, and every variant must point back at all the
  others including itself.

---
</rules>

# Metadata that actually renders

<rules>
```html
<title>Widget — Acme</title>                        <!-- ≤ 60 chars, unique per page -->
<meta name="description" content="…" />             <!-- ≤ 155 chars, unique -->
<meta property="og:title" content="Widget" />
<meta property="og:image" content="https://example.com/og/widget.png" />  <!-- absolute -->
<meta name="twitter:card" content="summary_large_image" />
```

- Generate metadata **server-side**. A `<title>` set in `useEffect` is not seen by
  most crawlers or by social preview bots at all.
- Unique per page. Duplicated titles and descriptions across a catalogue are one
  of the most common technical SEO faults.
- Open Graph images must be **absolute URLs** — relative ones silently fail in
  every social preview.
- `robots` meta only where you mean it. A stray `noindex` shipped to production
  will remove a site from search results, and it is a genuinely recurring
  incident. → `Frontend/metadata`

---
</rules>

# Structured data

<rules>
```json
{
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "Widget",
  "offers": { "@type": "Offer", "price": "24.99", "priceCurrency": "EUR",
              "availability": "https://schema.org/InStock" }
}
```

JSON-LD in a `<script type="application/ld+json">`, generated from the same data
the page renders. Types worth implementing: `Product`, `Article`, `FAQPage`,
`BreadcrumbList`, `Organization`, `Event`.

**Never** mark up data the page does not display. It is a policy violation and
attracts a manual penalty. Validate with the Rich Results Test before shipping.

---
</rules>

# Crawlability

<rules>
```
</rules>

# robots.txt

<rules>
User-agent: *
Disallow: /api/
Disallow: /admin/
Sitemap: https://example.com/sitemap.xml
```

- `robots.txt` blocks **crawling**, not indexing. A blocked URL can still be
  indexed from external links — and because it cannot be crawled, the `noindex`
  tag on it is never seen. To keep a page out of the index, allow crawling and use
  `noindex`.
- Generate the sitemap from the route table, include `lastmod`, and split above
  50,000 URLs.
- Never block CSS or JavaScript in `robots.txt` — crawlers need them to render.
- Fix crawl waste: infinite calendars, faceted-filter URL explosion, and session
  ids in URLs consume crawl budget that should go to real pages.
- Return real status codes: `404` for missing, `410` for permanently gone, `301`
  for moved. A "not found" page returning `200` is a soft 404 and gets indexed.

---
</rules>

# Speed and mobile

<rules>
Core Web Vitals are a ranking signal, measured from **field data at p75**, not
from a Lighthouse run.

| Metric | Target |
| --- | --- |
| LCP | < 2.5s |
| INP | < 200ms |
| CLS | < 0.1 |

Indexing is mobile-first: the mobile rendering is what is evaluated. A desktop
page that is fast and a mobile page that is not means the slow one counts.
→ `Frontend/performance`

---
</rules>

# Anti-patterns

<antipatterns>
| Anti-pattern | Why it fails | Fix |
| --- | --- | --- |
| Client-rendering public content | Crawlers may never see it | Server-render or generate |
| Metadata set in `useEffect` | Not seen by crawlers or preview bots | Server-side metadata |
| Duplicate titles and descriptions | Signals split; pages compete | Unique per page |
| Missing canonical tags | Duplicate URLs split ranking | Self-referencing canonical |
| Both `www` and apex serving | Two copies of every page | `301` to one host |
| Tracking parameters indexed | Infinite URL variants | Canonicalise; block in parameters |
| URL changed without a redirect | Ranking and bookmarks lost | `301` |
| Relative Open Graph image | Social previews silently break | Absolute URL |
| `noindex` shipped accidentally | Site removed from search | Guard in CI; verify in production |
| `robots.txt` used to deindex | Blocks crawling, so `noindex` is never seen | Allow crawl, use `noindex` |
| Blocking CSS/JS in `robots.txt` | Crawlers cannot render the page | Allow them |
| Soft 404s returning `200` | Empty pages get indexed | Real status codes |
| Structured data for hidden content | Policy violation; manual penalty | Mark up only what is visible |
| Sitemap hand-maintained | Drifts from the real route table | Generate it |
| Faceted filters generating infinite URLs | Crawl budget wasted | Canonicalise or `noindex` |
| Optimising only desktop | Indexing is mobile-first | Measure mobile field data |

---
</antipatterns>

# Checklist

<checklist>
- [ ] Public content is present in the server response, verified with `curl`
- [ ] Every indexable page has a unique, server-rendered title and description
- [ ] A self-referencing absolute canonical is on every indexable page
- [ ] One host and one trailing-slash convention, with `301`s enforcing them
- [ ] Filtered and sorted views canonicalise or are `noindex`
- [ ] URL changes are always accompanied by permanent redirects
- [ ] Open Graph and Twitter tags use absolute image URLs
- [ ] No accidental `noindex` reaches production; production is verified
- [ ] Structured data is JSON-LD, matches visible content, and validates
- [ ] `robots.txt` allows CSS and JavaScript and links the sitemap
- [ ] The sitemap is generated from routes, with `lastmod` and size splitting
- [ ] Missing pages return `404`/`410`, not `200`
- [ ] Crawl waste from filters, calendars and parameters is controlled
- [ ] `hreflang` is reciprocal and self-referencing for localised pages
- [ ] Core Web Vitals meet targets at p75 on mobile field data
</checklist>
