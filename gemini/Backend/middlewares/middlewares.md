---
targetModels:
  - "Gemini 3.6 Flash"
  - "Gemini 3.5 Flash"
  - "Gemini 3.1 Pro"
  - "Gemini 3 Family"
  - "Future Gemini Models"
name: middlewares
category: Backend
description: HTTP middleware — correct ordering, per-route scoping, error propagation, async context, and keeping request-scoped state out of module scope.
license: MIT
author: Agent.md maintainers
last-verified: 2026-08-23
reviewed-by: unreviewed
---
<!-- Generated from models/_canonical by scripts/build-model-variants.js.
     Edit the canonical source, not this file. Structure adapted for Gemini per deep-research.md. -->


# Purpose

Rules for middleware — the functions that run before, around and after a request
handler. Middleware is where cross-cutting concerns belong: correlation ids,
authentication, rate limiting, body parsing, error translation.

It is also where two expensive bugs live: **wrong order**, which silently disables
a security control, and **module-scoped request state**, which leaks one user's
data into another's response.

---

# Order is a security control

Middleware runs in registration order. Registering authentication after a route
means the route is public.

```ts
app.use(requestId());              // 1. first — everything below logs with it
app.use(securityHeaders());        // 2. applies even to error responses
app.use(cors(corsOptions));        // 3. before auth: preflight carries no credentials
app.use(express.json({ limit: "100kb" }));  // 4. bounded body parsing
app.use(rateLimit());              // 5. before expensive work, after identification
app.use(authenticate());           // 6. establishes the identity
app.use(authorize());              // 7. uses it
app.use(routes);                   // 8. handlers
app.use(notFound());               // 9.
app.use(errorHandler());           // 10. last — Express identifies it by arity (4 args)
```

The reasoning behind each position:

| Position | Why |
| --- | --- |
| Request id first | Every later log line and error response needs it |
| Security headers early | They must apply to `4xx` and `5xx` too |
| CORS before auth | Preflight `OPTIONS` carries no credentials and must not `401` |
| Body limit before parsing | Otherwise a large body is read into memory first |
| Rate limit before handlers | The point is to avoid the expensive work |
| Authn before authz | You cannot authorize an unknown principal |
| Error handler last | It is the terminal handler for everything above |

**Never** register a route before the authentication middleware and assume the
route guards itself. That is one refactor away from a public endpoint.

---

# Scope it correctly

Global middleware runs for every request, including health checks and static
assets.

```ts
app.use("/api/admin", requireRole("admin"));       // path-scoped
router.post("/orders", validate(CreateOrder), createOrder);   // route-scoped
```

- Expensive middleware (session lookup, feature-flag fetch) should be scoped to
  the routes that need it, not global.
- **Default-deny is safer than default-allow.** Apply authentication globally and
  mark public routes explicitly, rather than protecting routes one by one — a
  forgotten `requireAuth` on a new route is an unauthenticated endpoint, whereas a
  forgotten `public()` marker is a visible `401`.
- Exempt health and metrics endpoints deliberately, and only those.

---

# Request-scoped state must not be module-scoped

```ts
// Catastrophic — one shared object across all concurrent requests.
// Under load, user A's request reads user B's identity.
let currentUser;
app.use((req, _res, next) => { currentUser = req.user; next(); });

// Correct — async context, isolated per request
const ctx = new AsyncLocalStorage<{ requestId: string; user: User }>();
app.use((req, res, next) => ctx.run({ requestId: req.id, user: req.user }, next));
```

`AsyncLocalStorage` (Node), `context.Context` (Go), `contextvars` (Python) exist
for exactly this. They let logging and tracing reach request context without
threading a parameter through every function.

Attach request-scoped resources — a per-request DataLoader, a database transaction
handle — to the context, never to a module variable. A module-scope DataLoader
caches across users and leaks data between them. → `API/graphql`

---

# Errors must reach the handler

```ts
// Express 4: a rejected promise in an async middleware is unhandled —
// the request hangs until the client times out.
app.use(async (req, res, next) => {
  try { req.user = await loadUser(req); next(); }
  catch (err) { next(err); }          // ← or use a wrapper / Express 5
});
```

- Express 5 forwards rejected promises automatically; Express 4 does not.
- Every middleware must either call `next()`, call `next(err)`, or send a
  response — **exactly one**. Calling `next()` after sending produces
  "headers already sent".
- One error-handling middleware, registered last, translates errors into
  responses. → `Backend/error-handling`
- Response-modifying middleware (compression, headers) must wrap or hook the
  response, not assume it runs before the handler.

---

# Keep it fast

Every global middleware runs on every request, so its cost is multiplied by
traffic.

- No blocking I/O in a middleware that could be lazy. Load the user's permissions
  when a handler asks, not on every request including health checks.
- Cache what is stable per process (JWKS, feature flags, configuration) with a
  refresh interval, not per request. → `Security/jwt`
- Do not parse a body the route does not use — scope the parser.
- Measure middleware cost: a 15 ms lookup in a global middleware is 15 ms on the
  p50 of every endpoint.

| Framework | Registration | Error handler signature |
| --- | --- | --- |
| Express 4/5 | `app.use(fn)` | `(err, req, res, next)` — arity is how it is detected |
| Fastify | `app.addHook("onRequest", fn)` | `setErrorHandler` |
| Koa | `app.use(async (ctx, next) => …)` | `try/catch` around `await next()` |
| Hono | `app.use("*", fn)` | `app.onError` |
| NestJS | Guards, interceptors, pipes, filters | `ExceptionFilter` |
| Go `net/http` | `func(http.Handler) http.Handler` | Recover middleware, outermost |

Koa-style onion middleware wraps `await next()`, so one function sees both the
request and the response — that is what makes timing and response rewriting
straightforward there and awkward in Express.

---

# Anti-patterns

| Anti-pattern | Why it fails | Fix |
| --- | --- | --- |
| Auth registered after routes | Routes are silently public | Order deliberately; test it |
| Per-route opt-in auth | One forgotten line is an open endpoint | Default-deny with explicit public routes |
| CORS after auth | Preflight `OPTIONS` gets `401` | CORS before auth |
| Body parsing without a limit | Memory exhaustion | `limit` on the parser |
| Module-scoped request state | Cross-request data leakage | `AsyncLocalStorage` |
| Module-scoped DataLoader | Caches across users | Create per request |
| Async middleware without a catch (Express 4) | Request hangs until timeout | `next(err)` or a wrapper |
| Calling `next()` after responding | "Headers already sent" | Exactly one outcome per middleware |
| Multiple error handlers | Inconsistent responses | One, registered last |
| Expensive lookups in global middleware | Cost on every request including probes | Scope it, or make it lazy |
| Per-request JWKS fetch | Network call per request | Cache with a refresh interval |
| Security headers after the handler | Missing on error responses | Register early |
| Order changed without a test | Silent security regression | Assert on unauthenticated access |

---

# Checklist

- [ ] Verify: Middleware order is explicit and documented in one place
- [ ] Verify: Request id is established first and reaches every log line
- [ ] Verify: Security headers apply to error responses as well as successes
- [ ] Verify: CORS handling precedes authentication
- [ ] Verify: Body parsing is bounded and scoped to routes that need it
- [ ] Verify: Rate limiting runs before expensive work
- [ ] Verify: Authentication precedes authorization
- [ ] Verify: Authentication is default-deny with explicitly marked public routes
- [ ] Verify: A test asserts that an unauthenticated request to a protected route fails
- [ ] Verify: Request-scoped state lives in async context, never module scope
- [ ] Verify: Per-request resources are created per request, not at module load
- [ ] Verify: Async middleware forwards rejections to the error handler
- [ ] Verify: Each middleware calls `next()`, `next(err)`, or responds — exactly one
- [ ] Verify: One error handler is registered last
- [ ] Verify: Global middleware performs no blocking I/O; stable data is cached per process
- [ ] Verify: Middleware latency is measured and reviewed
