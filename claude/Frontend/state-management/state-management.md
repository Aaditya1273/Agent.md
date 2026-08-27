---
targetModels:
  - "Claude Fable 5"
  - "Claude Opus 5"
  - "Claude Sonnet 5"
  - "Claude 5 Family"
  - "Future Claude Models"
name: state-management
category: Frontend
description: Choosing where state lives — server cache versus client state, URL as state, and picking a library only when local state genuinely cannot serve.
license: MIT
author: Agent.md maintainers
last-verified: 2026-08-23
reviewed-by: unreviewed
---
<!-- Generated from models/_canonical by scripts/build-model-variants.js.
     Edit the canonical source, not this file. Structure adapted for Claude per deep-research.md. -->
# Purpose

<purpose>
Rules for deciding where application state lives. Most "state management problems"
are really one mistake: **treating server data as client state.**

Server data is a cache of something you do not own. It goes stale, it needs
revalidation, it can fail and retry. Client state is yours and is always correct.
Managing the first with the tools for the second produces most of the complexity
people attribute to React.

---
</purpose>

# Classify first, then choose

<rules>
| Kind | Example | Where it belongs |
| --- | --- | --- |
| Server data | Orders, profile, search results | A server-cache library |
| URL state | Filters, page, tab, selected id | The URL |
| Form state | Field values while editing | The form, locally |
| Local UI state | Dropdown open, hover | `useState` in the component |
| Shared UI state | Theme, sidebar, toasts | Context, or a small store |
| Session identity | Current user, permissions | Server-provided; cached, never authoritative |

Walk down this list before reaching for a library. Most applications need **no**
global state library once server data moves to a cache and filters move to the
URL.

---
</rules>

# Server data belongs in a server cache

<rules>
```tsx
// Manual: no deduplication, no revalidation, no retry, no cache — reimplemented
// slightly differently in every component that needs orders.
const [orders, setOrders] = useState([]);
useEffect(() => { fetch("/api/orders").then(r => r.json()).then(setOrders); }, []);

// A cache: deduplicated, revalidated, retried, shared across components
const { data, error, isPending } = useQuery({
  queryKey: ["orders", { status }],
  queryFn: () => api.orders.list({ status }),
  staleTime: 30_000,
});
```

`@tanstack/react-query`, SWR, Apollo, RTK Query, or a framework loader
(Next.js server components, Remix loaders) all solve this. What they give you and
hand-rolled effects do not:

- Request deduplication across components mounting simultaneously
- Background revalidation and stale-while-revalidate
- Retry with backoff, and error and loading states as data
- Cache invalidation by key after a mutation
- Race-condition handling for out-of-order responses

**Never** copy fetched data into a global store. You then own invalidation,
and the store and the server diverge silently.

The query key **is** the cache identity: include every parameter that changes the
result, or two different filters will share one cache entry.

---
</rules>

# The URL is state

<rules>
Filters, sort, pagination, the open tab, the selected record — all belong in the
URL.

```tsx
const [params, setParams] = useSearchParams();
const status = params.get("status") ?? "all";
```

If it is not in the URL, the user cannot bookmark it, share it, or use the back
button — and a refresh loses it. This is a user-facing bug that appears as
"the link I sent shows something different".

Keep it clean: omit defaults rather than serialising `?status=all&page=1`, and
never put a secret or personal data in a query string, where it lands in logs and
`Referer` headers. → `API/api-security`

---
</rules>

# Client state: local first

<rules>
Start with `useState` in the component that owns it. Lift only when a second
component genuinely needs the same value, and only to the lowest common parent.

**Context is not a state manager.** Every consumer re-renders when the value
changes, so a single context holding everything re-renders the whole tree on any
change.

- Split contexts by update frequency: a rarely-changing `ThemeContext` and a
  frequently-changing one should not be the same provider.
- Memoise the context value, or every provider render invalidates all consumers.
- Context is right for dependency injection (theme, locale, the current user) and
  wrong for high-frequency state.

| Library | Model | Reach for it when |
| --- | --- | --- |
| `@tanstack/react-query` | Server cache | Any remote data — this is the default |
| `zustand` | Single store, selector subscriptions | Shared client state, minimal boilerplate |
| `jotai` | Atomic, bottom-up | Many independent pieces of fine-grained state |
| `@reduxjs/toolkit` | Single store, reducers, devtools | Large apps needing traceable transitions |
| `xstate` | Explicit state machines | Multi-step flows with complex legal transitions |
| React `useReducer` + context | Built in | A handful of values, low update frequency |

When a store is genuinely warranted — shared, frequently updated client state
across distant components — pick a small one with selector-based subscriptions
(`zustand`, `jotai`, `valtio`). Redux Toolkit remains reasonable for large
applications that need strict traceability of every transition.

---
</rules>

# Keep state modelling honest

<rules>
```ts
// Permits { isLoading: true, error: Error, data: Data } — three impossible states
{ isLoading: boolean; error: Error | null; data: Data | null }

// One value; illegal combinations cannot be represented
type State = { status: "idle" } | { status: "loading" }
           | { status: "error"; error: Error } | { status: "success"; data: Data };
```

- Never store derived data. Compute it. A `totalCents` alongside `items` will
  diverge.
- Never duplicate the same value in two stores.
- Normalise collections by id rather than nesting the same entity in several
  places, so one update does not need to find every copy.
- Persisted state (`localStorage`) must be **versioned and migrated**, or a
  returning user with an old shape crashes the application. Never persist tokens
  or personal data there. → `Frontend/hooks`

Optimistic updates need a rollback path. Applying the change and only then
discovering the mutation failed, with no way back, is worse than a spinner.

---
</rules>

# Anti-patterns

<antipatterns>
| Anti-pattern | Why it fails | Fix |
| --- | --- | --- |
| Server data in a global store | You own invalidation; it diverges | Server-cache library |
| `useEffect` + `useState` fetching | No dedup, retry, cache or race handling | Query library or loader |
| Query key missing a parameter | Two filters share one cache entry | Include everything that affects the result |
| Filters and pagination in local state | Not shareable, lost on refresh, back button broken | Put them in the URL |
| Secrets in query strings | Logged and leaked via `Referer` | Never |
| Reaching for Redux by default | Large surface for a problem you may not have | Local state first |
| One context for everything | Whole tree re-renders on any change | Split by update frequency |
| Unmemoised context value | Every provider render invalidates consumers | Memoise |
| Context for high-frequency state | Re-render storms | A store with selectors |
| Boolean flags for a state machine | Impossible states become reachable | Discriminated union |
| Derived data stored | Two sources of truth diverge | Compute it |
| Same value in two stores | Guaranteed to diverge | One owner |
| Deeply nested entity copies | One update must find every copy | Normalise by id |
| Unversioned persisted state | An old shape crashes returning users | Version and migrate |
| Tokens in `localStorage` | XSS becomes account takeover | `HttpOnly` cookie |
| Optimistic update with no rollback | Failed mutations leave wrong UI | Roll back on error |

---
</antipatterns>

# Checklist

<checklist>
- [ ] Every piece of state is classified before choosing where it lives
- [ ] Server data lives in a server-cache library or framework loader
- [ ] Query keys include every parameter that affects the result
- [ ] Fetched data is not copied into a global store
- [ ] Filters, sort, pagination and selection live in the URL
- [ ] Default values are omitted from the URL; no secrets appear in it
- [ ] Client state starts local and is lifted only when genuinely shared
- [ ] Contexts are split by update frequency and their values memoised
- [ ] High-frequency shared state uses a store with selector subscriptions
- [ ] A global state library is introduced only after local state proved insufficient
- [ ] Related state is modelled as a discriminated union
- [ ] No derived data is stored; no value is duplicated across stores
- [ ] Collections are normalised by id
- [ ] Persisted state is versioned with a migration path
- [ ] No tokens or personal data are persisted client-side
- [ ] Optimistic updates roll back on failure
</checklist>
