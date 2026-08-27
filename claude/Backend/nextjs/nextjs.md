---
targetModels:
  - "Claude Fable 5"
  - "Claude Opus 5"
  - "Claude Sonnet 5"
  - "Claude 5 Family"
  - "Future Claude Models"
name: nextjs
category: Backend
description: Next.js as a backend — server/client boundaries, route handlers, caching semantics, Server Actions, and keeping secrets out of the bundle.
license: MIT
author: Agent.md maintainers
last-verified: 2026-08-23
reviewed-by: unreviewed
---
<!-- Generated from models/_canonical by scripts/build-model-variants.js.
     Edit the canonical source, not this file. Structure adapted for Claude per deep-research.md. -->
# Purpose

<purpose>
Rules for the server side of a Next.js App Router application: route handlers,
server components as data loaders, Server Actions, caching, and the boundary that
decides what ends up in the browser bundle.

Rendering and component concerns are `Frontend/nextjs` and
`Frontend/server-components`.

---
</purpose>

# The server/client boundary is a security boundary

<rules>
```ts
// lib/db.ts — poisoned so an accidental client import fails at build time
import "server-only";
export const db = new PrismaClient();
```

- `server-only` turns "this secret leaked into the browser bundle" from a
  production incident into a build error. Put it in every module that touches
  secrets, the database, or internal services.
- Anything referenced by a `"use client"` module — including transitively — ends
  up in the bundle. **Never** import a module holding secrets from a client
  component.
- Only `NEXT_PUBLIC_*` environment variables reach the browser, and they are
  inlined at build time. Everything else is server-side; never prefix a secret.
- Data returned from a server component to a client component is **serialised into
  the HTML**. Returning a full user row sends the password hash to the browser.
  Project explicit fields. → `Security/secret-management`

Validate environment variables at startup and fail the boot on a missing one,
rather than discovering it on one code path at 3am. → `Backend/error-handling`

---
</rules>

# Route handlers

<rules>
```ts
// app/api/orders/route.ts
export async function POST(req: Request) {
  const session = await auth();                        // never trust a header
  if (!session) return Response.json({ code: "unauthenticated" }, { status: 401 });

  const parsed = CreateOrder.safeParse(await req.json());
  if (!parsed.success) return Response.json(toFieldErrors(parsed.error), { status: 422 });

  const order = await createOrder(session.user, parsed.data);
  return Response.json(order, { status: 201, headers: { "Cache-Control": "no-store" } });
}
```

- Authenticate and authorize **inside every handler**. Middleware is a coarse
  filter running on a different runtime — it is not the authorization layer.
- Validate every body, query and route parameter against a schema.
  → `Backend/validation`
- Set `Cache-Control: no-store` on any authenticated response. A cached
  authenticated response served to another user is a real and recurring bug class.
- Return proper status codes and one consistent error shape. → `API/rest`
- Declare `export const runtime = "nodejs"` or `"edge"` deliberately — the edge
  runtime has no Node APIs and most database drivers do not work there.

---
</rules>

# Caching: know which cache you are in

<rules>
Next.js caches at several layers, and the defaults change between versions. Be
explicit rather than relying on them.

| Layer | Controls |
| --- | --- |
| `fetch` memoisation | Per-request deduplication of identical calls |
| Data cache | `fetch(url, { cache, next: { revalidate, tags } })` |
| Full route cache | Static rendering of a route at build time |
| Router cache | Client-side, per navigation |

```ts
const res = await fetch(url, { next: { revalidate: 60, tags: ["orders"] } });
revalidateTag("orders");     // after a mutation — precise invalidation

// Anything user-specific must never be cached
const res = await fetch(url, { cache: "no-store" });
```

- **Any request whose response depends on the user must be `no-store`.** Caching a
  personalised response and serving it to another visitor is the highest-impact
  Next.js caching bug.
- Reading `cookies()` or `headers()` makes a route dynamic. That is correct — do
  not work around it to force static rendering of authenticated content.
- Use `revalidateTag`/`revalidatePath` after mutations. Stale data after a
  successful write is what users report as "it didn't save".
- Verify with `next build` output which routes are static (`○`) and which are
  dynamic (`ƒ`). A route you expected to be dynamic rendering statically is a
  correctness bug, not a performance note.

---
</rules>

# Server Actions are public endpoints

<rules>
```ts
"use server";
export async function deleteOrder(orderId: string) {
  const session = await auth();                          // required
  if (!session) throw new Error("unauthenticated");

  const parsed = z.string().uuid().parse(orderId);       // required
  const deleted = await db.order.deleteMany({
    where: { id: parsed, tenantId: session.user.tenantId },   // scoped
  });
  if (deleted.count === 0) throw new Error("not found");
  revalidatePath("/orders");
}
```

A Server Action compiles to an HTTP endpoint that anyone can call with any
arguments. The fact that your UI only calls it from an admin page is not a
control.

**Every** action authenticates, authorizes, and validates its arguments — exactly
like a route handler. Scope the query by tenant rather than checking after the
fetch. → `Backend/authorization`

Actions are for mutations. Fetch data in server components.

---
</rules>

# Deployment and runtime

<rules>
- Serverless means **no shared process state**. In-memory caches, rate limiters
  and counters are per-instance and reset constantly. Use Redis.
  → `Database/redis`
- Database connections: one module-scope client, a pooled connection string, and
  a transaction-mode pooler. A client per invocation exhausts `max_connections`.
  → `Database/prisma`
- Long work does not belong in a request — serverless functions have hard
  execution limits. Enqueue it. → `Backend/background-jobs`
- `middleware.ts` runs on every matched request including static assets; scope its
  `matcher` tightly and keep it free of blocking I/O.
- Set security headers in `next.config.js` headers or middleware, and use a
  nonce-based CSP rather than `unsafe-inline`. → `Security/headers`

---
</rules>

# Anti-patterns

<antipatterns>
| Anti-pattern | Why it fails | Fix |
| --- | --- | --- |
| Secret module imported by a client component | Secret ships in the browser bundle | `server-only` |
| Secret in a `NEXT_PUBLIC_` variable | Inlined into client JavaScript | Server-side variable |
| Returning a full database row to a client component | Serialised into the HTML | Project explicit fields |
| Authorization only in `middleware.ts` | Coarse, different runtime, easily bypassed | Check in every handler and action |
| Server Action without auth or validation | It is a public endpoint | Authenticate, authorize, validate |
| Fetch-then-check ownership | One missed branch leaks data | Scope inside the query |
| Caching a personalised response | Served to another user | `no-store` for authenticated data |
| No revalidation after mutation | Users see stale data | `revalidateTag` / `revalidatePath` |
| Relying on default cache behaviour | Changes between versions | Explicit `cache` and `revalidate` |
| In-memory rate limiter | Per-instance, resets constantly | Shared store |
| New database client per request | Connection exhaustion | Module-scope client + pooler |
| Long-running work in a handler | Hits the execution limit | Background job |
| Broad middleware `matcher` | Runs on every asset | Scope tightly |
| `unsafe-inline` CSP | Defeats the point of a CSP | Nonce-based |
| Runtime not declared | Edge runtime breaks database drivers | Declare it explicitly |

---
</antipatterns>

# Checklist

<checklist>
- [ ] Server-only modules are marked with `server-only`
- [ ] No secret is exposed through a `NEXT_PUBLIC_` variable
- [ ] Environment variables are validated at startup
- [ ] Data crossing to client components is explicitly projected
- [ ] Every route handler authenticates and authorizes independently of middleware
- [ ] Every route handler validates its input against a schema
- [ ] Authenticated responses set `Cache-Control: no-store`
- [ ] The runtime (`nodejs` / `edge`) is declared per route
- [ ] Cache behaviour is explicit; personalised data is never cached
- [ ] Mutations call `revalidateTag` or `revalidatePath`
- [ ] `next build` output has been checked for unexpectedly static routes
- [ ] Every Server Action authenticates, authorizes and validates its arguments
- [ ] Queries are scoped by tenant inside the `where` clause
- [ ] No in-memory state is relied on across invocations
- [ ] One module-scope database client behind a connection pooler
- [ ] Long-running work is queued, not run in a request
- [ ] `middleware.ts` has a tight matcher and no blocking I/O
- [ ] Security headers and a nonce-based CSP are configured
</checklist>
