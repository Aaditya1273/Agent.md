---
targetModels:
  - "Claude Fable 5"
  - "Claude Opus 5"
  - "Claude Sonnet 5"
  - "Claude 5 Family"
  - "Future Claude Models"
name: express
category: Backend
description: Express application structure — router organisation, async error handling, security defaults, request context, and testing without a live server.
license: MIT
author: Agent.md maintainers
last-verified: 2026-08-23
reviewed-by: unreviewed
---
<!-- Generated from models/_canonical by scripts/build-model-variants.js.
     Edit the canonical source, not this file. Structure adapted for Claude per deep-research.md. -->
# Purpose

<purpose>
Rules for structuring an Express application. Express is unopinionated, which
means every decision it does not make for you is one you must make deliberately —
and the defaults it does ship are tuned for 2012.

Runtime concerns are `Backend/node`; middleware ordering is
`Backend/middlewares`.

---
</purpose>

# Separate the app from the server

<rules>
```js
// app.js — builds and returns the app. No listen(), no side effects.
export function createApp({ db, mailer, logger }) {
  const app = express();
  app.use(/* … */);
  app.use("/v1", routes({ db, mailer }));
  return app;
}

// server.js — the only file that binds a port
const server = createApp({ db, mailer, logger }).listen(PORT);
```

This one split makes integration testing possible without a live port
(`supertest(createApp({ db: testDb }))`), lets tests run in parallel, and keeps
dependency wiring in one place. → `Testing/integration`

Pass dependencies in. A module that imports its own database client cannot be
tested without one.

---
</rules>

# Structure by feature

<rules>
```
src/
  features/
    orders/
      orders.routes.js     # HTTP: parse, validate, call the service, format
      orders.service.js    # business rules — no req/res anywhere
      orders.repo.js       # data access, tenant-scoped
      orders.schema.js     # zod schemas
      orders.test.js
  middleware/
  lib/
```

The rule that matters: **`req` and `res` do not leave the route layer.** A service
that takes `req` cannot be called from a background job, a CLI, or a test without
constructing a fake request.

Routers compose — mount feature routers on the app rather than declaring a hundred
routes in one file.

---
</rules>

# Async errors

<rules>
```js
// Express 4: a rejected promise is NOT caught. The request hangs until timeout.
app.get("/orders/:id", async (req, res) => { throw new Error("boom"); });  // ← hangs

// Fix 1 — Express 5 forwards rejections automatically. Prefer this.
// Fix 2 — Express 4: a wrapper
const ah = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
app.get("/orders/:id", ah(async (req, res) => { … }));
```

This is the single most common Express bug: a route that throws asynchronously
never responds, the client times out, and nothing appears in the logs. Either
upgrade to Express 5, or apply the wrapper to **every** async handler — one missed
route is one hanging endpoint.

The error handler is identified by **arity**, not by position alone:

```js
app.use((err, req, res, next) => { … });   // four arguments, registered last
```

A three-argument function registered last is not an error handler and will be
skipped silently. → `Backend/error-handling`

---
</rules>

# Security defaults you must set

<rules>
Express ships with none of these.

```js
app.disable("x-powered-by");                       // stop advertising the stack
app.set("trust proxy", 1);                         // exact hop count, never `true`
app.use(helmet());                                 // security headers
app.use(express.json({ limit: "100kb" }));         // bounded body
app.use(cors({ origin: ALLOWED, credentials: true }));   // static allowlist
```

| Setting | Consequence of omitting it |
| --- | --- |
| `trust proxy` unset | `req.ip` is the proxy's — rate limiting keys on one value for everyone |
| `trust proxy: true` | `X-Forwarded-For` is fully client-controlled; the limiter is bypassable |
| No body limit | Default 100kb for JSON, but `express.urlencoded` and raw need their own |
| `helmet()` absent | No HSTS, no `nosniff`, no frame protection → `Security/headers` |
| `cors({ origin: true })` | Reflects any origin — with credentials this is total exposure |
| `x-powered-by` on | Version fingerprinting for attackers |

Set `trust proxy` to the **number of proxies** in front of you. `true` means trust
whatever the client sent. → `API/rate-limiting`

Validate every input at the boundary with a schema, and reject unknown fields.
→ `Backend/validation`

---
</rules>

# Request context and lifecycle

<rules>
- Attach a request id first and expose a child logger as `req.log`.
- Carry request-scoped state in `AsyncLocalStorage`, not on module variables — a
  module-scope `currentUser` leaks one request's identity into another's under
  concurrency.
- Set `server.keepAliveTimeout` above your load balancer's idle timeout, or you
  will see intermittent `502`s from races on connection close (a classic behind
  AWS ALB, whose default is 60s).
- Implement graceful shutdown: `server.close()`, drain in-flight requests, then
  exit.
- Add `/healthz` (liveness, no dependency checks) and `/readyz` (readiness, checks
  dependencies) before any auth middleware. → `Backend/monitoring`

---
</rules>

# Testing

<rules>
```js
const res = await request(createApp({ db: testDb }))
  .post("/v1/orders")
  .set("Cookie", sessionFor(user))
  .send({ items: [{ sku: "ABC-1", qty: 2 }] });
expect(res.status).toBe(201);
```

- `supertest` against the app object — no port, no fixed host, parallel-safe.
- Test the **denial** cases: unauthenticated, wrong tenant, malformed body. Those
  are the assertions that catch a missing check. → `Backend/authorization`
- One test that enumerates every registered route and asserts an unauthenticated
  request is rejected, with an explicit public allowlist, catches the endpoint
  somebody forgot to protect.

---
</rules>

# Anti-patterns

<antipatterns>
| Anti-pattern | Why it fails | Fix |
| --- | --- | --- |
| `listen()` in the same file as the app | Cannot test without binding a port | Split app and server |
| Modules importing their own database client | Untestable without a real database | Inject dependencies |
| `req`/`res` in service functions | Not reusable from jobs, CLIs or tests | Keep HTTP in the route layer |
| Async handler without a catch (Express 4) | Request hangs until client timeout | Express 5 or a wrapper |
| Three-argument error handler | Silently not an error handler | Four arguments, last |
| Multiple error handlers | Inconsistent responses | One, registered last |
| `trust proxy` unset behind a proxy | Every client shares the proxy's IP | Set the hop count |
| `trust proxy: true` | `X-Forwarded-For` becomes forgeable | Exact number |
| No body size limit | Memory exhaustion | `limit` on every parser |
| `cors({ origin: true })` with credentials | Any site reads authenticated responses | Static allowlist |
| No `helmet()` | Missing every security header | Add it early |
| `x-powered-by` left on | Free fingerprinting | `app.disable` |
| Module-scoped request state | Cross-request data leakage | `AsyncLocalStorage` |
| `keepAliveTimeout` below the LB's | Intermittent `502`s | Set it higher |
| Health checks behind auth | Probes fail; pods restart | Register before auth |
| No graceful shutdown | Deploys sever live requests | `server.close()` and drain |
| Only happy-path tests | Missing auth checks invisible | Assert denials |

---
</antipatterns>

# Checklist

<checklist>
- [ ] `createApp()` is separate from `listen()`
- [ ] Dependencies are injected, not imported inside modules
- [ ] Code is organised by feature, with routes, service and repository separated
- [ ] `req`/`res` never reach the service layer
- [ ] Every async handler forwards rejections (Express 5, or a wrapper everywhere)
- [ ] Exactly one four-argument error handler, registered last
- [ ] `x-powered-by` is disabled
- [ ] `trust proxy` is set to the exact number of proxies
- [ ] `helmet()` is applied early enough to cover error responses
- [ ] Every body parser has an explicit size limit
- [ ] CORS uses a static origin allowlist
- [ ] All input is schema-validated with unknown fields rejected
- [ ] A request id is attached first and available as `req.log`
- [ ] Request-scoped state lives in `AsyncLocalStorage`
- [ ] `keepAliveTimeout` exceeds the load balancer's idle timeout
- [ ] Liveness and readiness endpoints exist and bypass authentication
- [ ] `SIGTERM` drains in-flight requests before exit
- [ ] Tests run against the app object with `supertest`
- [ ] Denial cases and unauthenticated access are asserted per route
</checklist>
