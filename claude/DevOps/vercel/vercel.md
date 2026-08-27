---
targetModels:
  - "Claude Fable 5"
  - "Claude Opus 5"
  - "Claude Sonnet 5"
  - "Claude 5 Family"
  - "Future Claude Models"
name: vercel
category: DevOps
description: Deploying to Vercel — environment configuration, serverless and edge constraints, connection pooling, caching, preview deployments and cost control.
license: MIT
author: Agent.md maintainers
last-verified: 2026-08-23
reviewed-by: unreviewed
---
<!-- Generated from models/_canonical by scripts/build-model-variants.js.
     Edit the canonical source, not this file. Structure adapted for Claude per deep-research.md. -->
# Purpose

<purpose>
Rules for running an application on Vercel. The platform removes most deployment
work; what remains is the set of constraints its execution model imposes —
statelessness, cold starts, connection limits, and a build step that inlines
values you may not want inlined.

Framework specifics are `Backend/nextjs` and `Frontend/nextjs`.

---
</purpose>

# Environment variables: build-time versus runtime

<rules>
| Prefix | Available in | Baked into the client bundle |
| --- | --- | --- |
| `NEXT_PUBLIC_*` | Browser and server | **Yes**, at build time |
| Everything else | Server only | No |

- **Never** prefix a secret with `NEXT_PUBLIC_`. It is inlined into JavaScript
  served to every visitor, and rotating it requires a rebuild.
- `NEXT_PUBLIC_*` values are captured at **build** time. Changing one in the
  dashboard does nothing until a redeploy — a recurring source of "I changed it and
  nothing happened".
- Scope variables per environment (Production, Preview, Development). A preview
  deployment holding production credentials means every pull request can write to
  production.
- Validate all variables at startup and fail the build or boot on a missing one.
  → `DevOps/environments`

---
</rules>

# Serverless constraints

<rules>
Every request may hit a cold instance. There is **no shared process state**.

| Assumption that breaks | Reality | Fix |
| --- | --- | --- |
| In-memory cache | Per-instance, discarded constantly | Redis / KV |
| In-memory rate limiter | Resets per instance | Shared store → `API/rate-limiting` |
| Background work after the response | Instance is frozen | `waitUntil`, or a queue |
| Long-running request | Hard execution limit | Background job → `Backend/background-jobs` |
| Local filesystem writes | Read-only except `/tmp`, ephemeral | Object storage |
| Cron in-process | Not running between requests | Vercel Cron |
| WebSocket server | Not supported by functions | A managed realtime service |

**Database connections are the classic failure.** Each concurrent function instance
opens its own connection, and a traffic spike exhausts `max_connections` in
seconds:

```
DATABASE_URL="postgres://…/db?pgbouncer=true&connection_limit=1&pool_timeout=20"
DIRECT_URL="postgres://…/db"     # migrations bypass the pooler
```

Use a transaction-mode pooler (PgBouncer, Supavisor, Neon or Prisma Accelerate),
instantiate the client once at module scope, and never inside a handler.
→ `Database/prisma`

---
</rules>

# Node runtime or Edge runtime

<rules>
| | Node | Edge |
| --- | --- | --- |
| APIs | Full Node standard library | Web APIs only |
| Cold start | Higher | Very low |
| Location | Region-pinned | Distributed |
| Database drivers | Work | Mostly do not (no TCP) |
| Size limit | Larger | Small bundle required |

```ts
export const runtime = "nodejs";     // declare it; do not rely on the default
```

Edge suits middleware, redirects, geolocation, header rewriting and auth checks.
Anything using a database driver, a Node built-in, or a large dependency belongs
on Node.

Place functions in the **region nearest the database**. An edge function in
Sydney querying a database in Frankfurt pays that round trip on every query — edge
compute helps only when the data is also close.

---
</rules>

# Caching and revalidation

<rules>
- Static and ISR pages are served from the edge; dynamic ones execute per request.
  Read the `next build` output and confirm each route's mode is what you intended.
  A personalised route rendered statically is a data-leak bug, not a performance
  note.
- Use `revalidateTag`/`revalidatePath` after mutations; stale content after a
  successful write is what users report as "it didn't save".
- Set `Cache-Control: no-store` on authenticated responses. A cached authenticated
  response served to another visitor is the worst failure mode here.
- Static assets are content-hashed and cached immutably by the platform — do not
  fight it with custom headers.

---
</rules>

# Previews, protection and cost

<rules>
- Every pull request gets a preview deployment. Treat them as **publicly reachable
  unless protected**: enable Deployment Protection (Vercel Authentication or a
  password) for anything containing real data.
- Give previews their own database, or a seeded branch database. Pointing previews
  at production means an untested migration runs against real data.
- Deployments are immutable, so rollback is instant: promote a previous
  deployment rather than redeploying. → `DevOps/rollback`
- Cost drivers, in order: function invocation and duration, edge middleware
  running on **every** request including assets, image optimisation on
  uncontrolled sources, and bandwidth.
  - Scope `middleware.ts` with a tight `matcher` — an unscoped middleware runs on
    every asset request and is frequently the largest single line item.
  - Restrict `next/image` `remotePatterns` to domains you control; an open
    configuration is an open image-optimisation proxy.
  - Set spend limits and usage alerts.

```ts
// middleware.ts — an unscoped matcher runs on every asset request.
// This one runs on pages only, and is frequently a 10× cost difference.
export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|svg|woff2)$).*)"],
};
```

---
</rules>

# Anti-patterns

<antipatterns>
| Anti-pattern | Why it fails | Fix |
| --- | --- | --- |
| Secret in `NEXT_PUBLIC_*` | Inlined into client JavaScript | Server-only variable |
| Expecting a public variable change to apply | Baked at build time | Redeploy |
| Preview using production credentials | Any pull request writes to production | Per-environment variables |
| Database client per request | Connection exhaustion under load | Module-scope client + pooler |
| No connection pooler | `max_connections` hit in seconds | Transaction-mode pooler |
| Migrations through the pooler | Fails or corrupts | `DIRECT_URL` |
| In-memory cache or rate limiter | Per-instance; resets constantly | Shared store |
| Work after the response returns | Instance frozen; work lost | `waitUntil` or a queue |
| Long-running request handler | Execution limit exceeded | Background job |
| Writing to the filesystem | Read-only and ephemeral | Object storage |
| Edge runtime with a database driver | No TCP support | Node runtime |
| Functions far from the database | Round-trip cost per query | Co-locate regions |
| Runtime not declared | Defaults change; surprises | Declare it explicitly |
| Personalised route rendered statically | One user's data served to all | Check the build output |
| Caching authenticated responses | Cross-user data exposure | `no-store` |
| Unscoped middleware matcher | Runs on every asset; dominates cost | Tight `matcher` |
| Open `remotePatterns` | Free image proxy for anyone | Restrict to your domains |
| Unprotected previews with real data | Publicly reachable | Deployment Protection |
| No spend limits | Cost discovered on the invoice | Limits and alerts |

---
</antipatterns>

# Checklist

<checklist>
- [ ] No secret is exposed through a `NEXT_PUBLIC_` variable
- [ ] Build-time inlining of public variables is understood; changes trigger redeploys
- [ ] Environment variables are scoped per environment
- [ ] Preview deployments use non-production credentials and data
- [ ] Environment variables are validated at startup
- [ ] One module-scope database client behind a transaction-mode pooler
- [ ] Migrations use a direct, unpooled connection
- [ ] No in-memory cache, rate limiter or session state is relied upon
- [ ] Post-response work uses `waitUntil` or a queue
- [ ] Long-running work runs as a background job
- [ ] Nothing writes to the filesystem outside `/tmp`
- [ ] Runtime (`nodejs`/`edge`) is declared per route
- [ ] Functions are co-located with the database region
- [ ] `next build` output is reviewed; no personalised route is static
- [ ] Authenticated responses set `no-store`
- [ ] Mutations trigger revalidation
- [ ] `middleware.ts` has a tight matcher
- [ ] `next/image` `remotePatterns` are restricted to controlled domains
- [ ] Preview deployments are protected
- [ ] Spend limits and usage alerts are configured
</checklist>
