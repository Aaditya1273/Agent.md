---
targetModels:
  - "Gemini 3.6 Flash"
  - "Gemini 3.5 Flash"
  - "Gemini 3.1 Pro"
  - "Gemini 3 Family"
  - "Future Gemini Models"
name: metadata
category: Frontend
description: Page metadata — titles, descriptions, Open Graph, icons and canonical tags generated on the server, per route, without duplication or leaks.
license: MIT
author: Agent.md maintainers
last-verified: 2026-08-23
reviewed-by: unreviewed
---
<!-- Generated from models/_canonical by scripts/build-model-variants.js.
     Edit the canonical source, not this file. Structure adapted for Gemini per deep-research.md. -->


# Purpose

Rules for the `<head>`: titles, descriptions, social cards, icons, canonical links
and robots directives.

Two constraints shape everything: metadata must be **in the server response**
(crawlers and social preview bots do not run your JavaScript), and it must be
**unique per page** (duplicated metadata is the most common technical SEO fault).

Search strategy is `Frontend/seo`.

---

# Generate it on the server, per route

```tsx
// Next.js App Router — resolved during the server render
export async function generateMetadata({ params }): Promise<Metadata> {
  const product = await getProduct(params.id);
  if (!product) return { title: "Not found", robots: { index: false } };

  return {
    title: product.name,                                  // template applies the suffix
    description: truncate(product.summary, 155),
    alternates: { canonical: `/products/${product.slug}` },
    openGraph: {
      title: product.name,
      images: [{ url: `/og/products/${product.slug}.png`, width: 1200, height: 630 }],
      type: "website",
    },
    twitter: { card: "summary_large_image" },
  };
}
```

A root layout defines the defaults and the title template:

```ts
export const metadata: Metadata = {
  metadataBase: new URL("https://example.com"),     // makes relative URLs absolute
  title: { default: "Acme", template: "%s — Acme" },
  description: "…",
};
```

`metadataBase` matters more than it looks: without it, Open Graph image paths stay
relative, and **every social preview silently fails**. Preview bots do not resolve
relative URLs.

**Never** set metadata in `useEffect` or with a client-side helper. It runs after
the crawler has already taken the response.

---

# Write it for the result, not for the page

| Tag | Limit | Rule |
| --- | --- | --- |
| `<title>` | ~60 characters | Most specific first: `Widget — Acme`, not `Acme — Widget` |
| `description` | ~155 characters | A sentence a human would click; not keyword filler |
| `og:title` | ~60 | May differ from `<title>` — social context is different |
| `og:image` | 1200×630, < 8 MB | **Absolute URL**, PNG or JPEG |
| `og:description` | ~200 | |
| `twitter:card` | — | `summary_large_image` for anything with an image |

Every page needs its own title and description. A catalogue where 400 products
share one description is a catalogue where 399 pages do not rank.

Truncate generated descriptions on a word boundary, and strip markup — a
description containing raw HTML is rendered literally in results.

Dynamic Open Graph images (`@vercel/og`, Satori) generate a per-page card from the
same data the page shows. Cache them immutably by content hash; regenerating an
image on every crawl is wasted work.

---

# Robots directives

```ts
robots: { index: false, follow: true }        // → <meta name="robots" content="noindex,follow">
```

Set `noindex` deliberately on: staging environments, search-result pages, filtered
and sorted views, thank-you and confirmation pages, user-specific pages, and
anything behind authentication.

**Guard against shipping `noindex` to production.** A staging default that leaks
into a production build removes a site from search results, and recovery takes
weeks. Make it explicit per environment and assert it in a smoke test:

```bash
curl -sI https://example.com/ | grep -i "x-robots-tag" && exit 1   # must be absent
```

`robots.txt` blocks crawling, not indexing — and a page blocked there can never
have its `noindex` read. To remove a page from the index, allow the crawl and use
the meta tag.

---

# Icons, manifest and language

```html
<link rel="icon" href="/favicon.ico" sizes="32x32" />
<link rel="icon" href="/icon.svg" type="image/svg+xml" />
<link rel="apple-touch-icon" href="/apple-touch-icon.png" />   <!-- 180×180 -->
<link rel="manifest" href="/manifest.webmanifest" />
<meta name="theme-color" content="#0b0b0c" media="(prefers-color-scheme: dark)" />
```

- `<html lang="en">` on every page, matching the actual content language.
  Screen readers choose pronunciation from it. → `Testing/accessibility`
- `<meta name="viewport" content="width=device-width, initial-scale=1">` — required
  for mobile rendering, and its absence is a mobile-usability failure.
- `dir="rtl"` where the content requires it.

---

# Do not leak through metadata

- Metadata is public. Never put an internal identifier, an email address, a draft
  title, or anything user-specific into a tag on a public page.
- Pages behind authentication should be `noindex` and should not generate social
  cards containing the user's data.
- A `404` must return a real `404` status **and** `noindex` — a soft 404 returning
  `200` with generic metadata gets indexed as a real page. → `Frontend/routing`
- Do not include version numbers, framework fingerprints or build paths in
  `<meta>` tags.

---

# Anti-patterns

| Anti-pattern | Why it fails | Fix |
| --- | --- | --- |
| Metadata set client-side | Crawlers and preview bots never see it | Server-generated |
| One title for the whole application | Every page competes with itself | Per-route metadata |
| Duplicate descriptions across a catalogue | Pages do not differentiate | Generate per record |
| No `metadataBase` | Relative OG images break every preview | Set it once at the root |
| Relative `og:image` | Social previews silently fail | Absolute URL |
| Titles over 60 characters | Truncated in results | Keep them short, specific first |
| Keyword-stuffed descriptions | Ignored or penalised; poor click-through | Write for a human |
| Raw HTML in a description | Rendered literally | Strip markup |
| `noindex` leaking to production | Site removed from search for weeks | Environment-explicit; smoke test |
| `robots.txt` used to deindex | `noindex` can never be read | Allow crawl, use the meta tag |
| Missing `<html lang>` | Wrong screen-reader pronunciation | Set it per locale |
| Missing viewport meta | Mobile rendering breaks | Add it |
| Soft 404 with generic metadata | Empty pages indexed | Real `404` plus `noindex` |
| User data in social cards | Public disclosure | `noindex`, no personalised cards |
| OG images regenerated per request | Wasted compute | Cache immutably |

---

# Checklist

- [ ] Verify: All metadata is produced in the server response
- [ ] Verify: A root default and title template are defined once
- [ ] Verify: `metadataBase` is set so relative URLs resolve absolutely
- [ ] Verify: Every route generates its own title and description
- [ ] Verify: Titles are within ~60 characters, most specific part first
- [ ] Verify: Descriptions are within ~155 characters, human-readable, markup-free
- [ ] Verify: Open Graph and Twitter tags are present with absolute image URLs
- [ ] Verify: Social images are 1200×630 and cached immutably
- [ ] Verify: `noindex` is applied deliberately and never leaks to production
- [ ] Verify: A smoke test asserts production pages are indexable
- [ ] Verify: Canonical URLs are set per page
- [ ] Verify: Icons, manifest and `theme-color` are configured
- [ ] Verify: `<html lang>` and the viewport meta tag are present on every page
- [ ] Verify: `404` responses carry a real status code and `noindex`
- [ ] Verify: No internal, user-specific or fingerprinting data appears in metadata
