---
targetModels:
  - "DeepSeek V4"
  - "DeepSeek V3.2"
  - "DeepSeek R1"
  - "DeepSeek V3 Family"
  - "Future DeepSeek Models"
name: routing
category: Frontend
description: Client and app routing — URL as state, nested layouts, guards that are not security, loading and error boundaries, and scroll and focus on navigation.
license: MIT
author: Agent.md maintainers
last-verified: 2026-08-23
reviewed-by: unreviewed
---
<!-- Generated from models/_canonical by scripts/build-model-variants.js.
     Edit the canonical source, not this file. Structure adapted for DeepSeek per deep-research.md. -->


# Purpose

Rules for routing in a web application. The URL is the application's public
interface: it is what users bookmark, share, and return to. Treat it as a
contract, not an implementation detail.

Route-level code splitting is `Frontend/code-splitting`; metadata is
`Frontend/metadata`.

---

# The URL carries state

Anything that changes what the user sees belongs in the URL.

```
/orders?status=paid&sort=-createdAt&page=2      ✅ shareable, bookmarkable, back-button-correct
/orders                                          ❌ filters in component state
```

| In the URL | Not in the URL |
| --- | --- |
| Filters, sort, pagination | Whether a dropdown is open |
| Selected record or tab | Hover state, focus |
| Search query | In-progress form values (until submit) |
| View mode (list/grid) | Transient toasts |

If state is not in the URL, a refresh loses it and a shared link shows something
different — reported by users as "the link doesn't work".

Rules for the URL itself:

- Lowercase, hyphenated, plural collections: `/payment-methods/{id}`.
- Stable. A changed URL is a broken bookmark and a lost search ranking; when you
  must change one, `301` the old path. → `Frontend/seo`
- Never put a secret, token or personal data in a query string — it lands in
  server logs, browser history and `Referer` headers. → `API/api-security`
- Omit defaults (`?page=1` adds nothing) so the canonical URL is unambiguous.
- Validate and coerce every parameter: a route parameter is untrusted input.

---

# Structure with nested layouts

```
app/
  layout.tsx                 # shell: header, nav — never re-renders on child navigation
  orders/
    layout.tsx               # orders sidebar
    page.tsx                 # /orders
    [id]/page.tsx            # /orders/:id
    loading.tsx              # streamed fallback
    error.tsx                # boundary for this subtree
```

Nested layouts preserve state across navigation within a section — scroll
position in a sidebar, an open panel — which a flat route table cannot do.

- Colocate `loading` and `error` boundaries per segment, so a failure in one panel
  does not blank the page.
- Every route needs a `not-found` path for a bad or deleted id, returning a real
  `404` rather than an empty page.
- Keep dynamic segments shallow. `/users/:u/orders/:o/items/:i` exposes a
  hierarchy that will change; one level of nesting is usually enough.
  → `API/rest`

---

# Route guards are not authorization

```tsx
// A client-side redirect. The data was already fetched, or is one fetch away.
if (!user.isAdmin) return <Navigate to="/" />;
```

A client-side guard is a **user-experience feature**: it avoids showing a page
that will fail. It is not a control — the user can call the API directly, and the
JavaScript that decides is running on their machine.

- Enforce authorization on the server, on every request that returns data.
  → `Backend/authorization`
- Redirect unauthenticated users to a login page that preserves the intended
  destination (`?next=/orders/123`), and **validate that parameter against an
  allowlist of internal paths** — an unvalidated redirect target is an open-redirect
  vulnerability used in phishing.
- Never render protected content and hide it with CSS. It is in the DOM.

---

# Navigation must not lose the user

Client-side routing replaces a full page load, so the browser behaviours it
provided must be reimplemented.

| Behaviour | Requirement |
| --- | --- |
| Scroll | Reset to top on a new route; **restore** position on back/forward |
| Focus | Move to the main heading or `<main>` after navigation |
| Announcement | Screen readers get no page-change event — announce it in a live region |
| Title | Update `<title>` per route |
| Pending state | Show progress for navigations over ~200ms |
| Unsaved changes | Block navigation and confirm → `Frontend/forms` |

Focus and announcement are the ones most often missed, and they make an
application unusable with a screen reader — the user activates a link and nothing
tells them anything changed. → `Testing/accessibility`

Use real `<a href>` elements (or the router's `<Link>`, which renders one).
A `<div onClick={navigate}>` breaks middle-click, open-in-new-tab, copy-link, and
keyboard access.

---

# Data and transitions

- Fetch per route with the router's loader or a server component, so the request
  starts with the navigation rather than after the component mounts.
- Prefetch on hover, focus or viewport entry — the code **and** the data.
- Keep the old view visible during a pending navigation (`useTransition`,
  `startTransition`) rather than flashing a spinner over content that was fine.
- Handle a failed navigation: leave the user where they were with an error, not on
  a blank route.

---

# Anti-patterns

| Anti-pattern | Why it fails | Fix |
| --- | --- | --- |
| Filters in component state | Not shareable; lost on refresh; back button broken | Put them in the URL |
| Secrets in query strings | Logged, in history, leaked via `Referer` | Never |
| Defaults serialised into the URL | Multiple URLs for one view | Omit defaults |
| Unvalidated route parameters | Untrusted input reaching queries | Parse and coerce |
| URLs changed without redirects | Broken bookmarks and rankings | `301` the old path |
| Client-side guard as authorization | Runs on the attacker's machine | Server-side enforcement |
| Unvalidated `?next=` redirect | Open redirect used for phishing | Allowlist internal paths |
| Protected content hidden with CSS | Present in the DOM | Do not send it |
| `<div onClick={navigate}>` | Breaks middle-click, new tab, keyboard | `<a href>` / `<Link>` |
| No scroll restoration | Back button loses the user's place | Restore on pop navigation |
| No focus management | Screen reader users get no feedback | Focus `<main>` and announce |
| No route-level error boundary | One failure blanks the page | Boundary per segment |
| Missing `not-found` handling | Deleted records render an empty page | Real `404` route |
| Fetching after mount | Waterfall: navigate, render, then fetch | Route loaders |
| Spinner over good content | Flashing during fast navigations | Transitions |
| Deep dynamic nesting | Freezes a hierarchy that will change | Flatten |

---

# Checklist

- [ ] Filters, sort, pagination, tab and selection are all in the URL
- [ ] No secrets or personal data appear in URLs
- [ ] Default parameter values are omitted
- [ ] Every route parameter is validated and coerced
- [ ] URL changes are accompanied by permanent redirects
- [ ] Layouts are nested so shared shell state survives navigation
- [ ] Each segment has loading and error boundaries
- [ ] A `not-found` route exists and returns a real `404`
- [ ] Authorization is enforced server-side; client guards are UX only
- [ ] Post-login redirect targets are validated against an allowlist
- [ ] Navigation uses real anchor elements
- [ ] Scroll resets on new routes and restores on back/forward
- [ ] Focus moves to the main content after navigation
- [ ] Route changes are announced to assistive technology
- [ ] The document title updates per route
- [ ] Data loads with the navigation, not after mount
- [ ] Routes and their data are prefetched on intent
- [ ] Pending navigations keep the previous view visible
