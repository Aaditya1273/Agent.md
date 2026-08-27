---
targetModels:
  - "Claude Fable 5"
  - "Claude Opus 5"
  - "Claude Sonnet 5"
  - "Claude 5 Family"
  - "Future Claude Models"
name: error-handling
category: Backend
description: Error handling in a server — the boundary that converts failures to responses, typed domain errors, retries, and what must never reach the client.
license: MIT
author: Agent.md maintainers
last-verified: 2026-08-23
reviewed-by: unreviewed
---
<!-- Generated from models/_canonical by scripts/build-model-variants.js.
     Edit the canonical source, not this file. Structure adapted for Claude per deep-research.md. -->
# Purpose

<purpose>
Rules for handling errors in a backend service. Two categories, handled
completely differently:

- **Expected failures** — validation, not found, insufficient funds, conflict.
  These are part of the domain. Model them, return them, do not log them as
  errors.
- **Unexpected failures** — a null dereference, a dead connection, a bug. These
  are alerts. They get a generic response and a full trace in the logs.

Conflating the two produces alert fatigue on one side and silent data loss on the
other.

---
</purpose>

# One boundary converts errors to responses

<rules>
Handlers throw. **One** place converts.

```ts
// Domain layer: throws typed errors, knows nothing about HTTP
class AppError extends Error {
  constructor(readonly code: string, readonly status: number, message: string,
              readonly details?: unknown) { super(message); }
}
class NotFound          extends AppError { constructor(what: string) { super("not_found", 404, `${what} not found`); } }
class ValidationFailed  extends AppError { constructor(details: unknown) { super("validation_failed", 422, "Validation failed", details); } }
class InsufficientFunds extends AppError { constructor() { super("insufficient_funds", 422, "Insufficient funds"); } }

// Edge: the single translation point
app.use((err, req, res, _next) => {
  const requestId = req.id;
  if (err instanceof AppError) {
    req.log.info({ code: err.code, requestId }, "handled failure");
    return res.status(err.status).json({ code: err.code, message: err.message,
                                         details: err.details, requestId });
  }
  req.log.error({ err, requestId }, "unhandled error");     // full stack, once
  res.status(500).json({ code: "internal_error",
                         message: "An unexpected error occurred.", requestId });
});
```

- Every response carries a `requestId`, success or failure. It is what turns a
  support ticket into a log query. → `API/rest`
- Expected failures log at `info`/`warn`. Only unexpected ones log at `error`, so
  the error rate means something.
- The handler logs **once**. Logging at every frame produces five entries for one
  failure and makes the real trace unfindable.

---
</rules>

# Never leak internals

<rules>
```
❌ "ER_DUP_ENTRY: Duplicate entry 'a@b.com' for key 'users.email_unique'"
❌ TypeError: Cannot read properties of undefined (reading 'tenantId')
     at OrderService.load (/srv/app/dist/order.js:112:29)
✅ { "code": "email_taken", "message": "That email is already registered.",
     "requestId": "req_01J8Z…" }
```

Stack traces, SQL fragments, driver error codes, internal hostnames, file paths
and library versions all go to the logs and never to the client. They map the
system for an attacker and mean nothing to a legitimate caller.
→ `API/api-security`

Be careful that framework defaults do not do this for you — many development error
pages ship enabled if `NODE_ENV` is not set correctly in the container.

---
</rules>

# Fail fast, and fail at the boundary

<rules>
- **Validate input at the edge**, before any business logic. A parse that fails
  should fail immediately with a `422` and a field list, not three layers deep.
  → `Backend/validation`
- **Validate configuration at startup.** A missing environment variable should
  crash the process at boot, not produce a `500` at 3am on one code path.
- **Never swallow an error.** `catch {}` and `catch (e) { return null }` convert a
  failure into wrong data. If you catch, either handle it meaningfully or rethrow
  with context.
- Add context when rethrowing, and preserve the original:
  `throw new AppError("charge_failed", 502, "…", { cause: err })`.
- Prefer a returned result type over exceptions for genuinely expected outcomes
  in hot paths — but be consistent; a codebase that does both randomly is worse
  than either.

---
</rules>

# Process-level safety

<rules>
```ts
process.on("unhandledRejection", (reason) => { log.fatal({ reason }); shutdown(1); });
process.on("uncaughtException",  (err)    => { log.fatal({ err });    shutdown(1); });
```

After an uncaught exception the process state is unknown. **Log, then exit** — let
the supervisor restart a clean process. Continuing serves requests from corrupted
state.

Shutdown must be graceful: stop accepting new connections, finish in-flight
requests with a bounded timeout, close the database pool, then exit.
→ `DevOps/deployment`

---
</rules>

# Transient failures and retries

<rules>
| Failure | Retry |
| --- | --- |
| Connection reset, DNS failure, timeout | Yes, with backoff |
| `5xx` from a dependency | Yes, with backoff |
| `429` | Yes, honour `Retry-After` |
| Database deadlock / serialization failure | Yes, immediately, bounded |
| `4xx` other than `429`/`408` | No — the request is wrong |
| Non-idempotent write with no idempotency key | **No** |

Retries need exponential backoff **with jitter**, a bounded attempt count, and a
budget so a struggling dependency is not retried into collapse. Add a circuit
breaker for a dependency that fails persistently — retrying a dead service turns
its outage into yours. → `System Design/resilience`

Any operation that is retried must be idempotent, or carry an idempotency key.
→ `API/webhooks`

---
</rules>

# Errors are a product surface

<rules>
The message a user sees is part of the product. Say what happened, and what to do
next.

```
❌ "Error 422"
❌ "Invalid input"
✅ "Card declined by your bank. Try a different card or contact your bank."
```

Keep the machine `code` stable across releases — clients branch on it — while the
human `message` stays free to improve.

---
</rules>

# Anti-patterns

<antipatterns>
| Anti-pattern | Why it fails | Fix |
| --- | --- | --- |
| `catch {}` | Turns a failure into wrong data | Handle or rethrow |
| Returning `null` on error | Caller cannot distinguish absent from failed | Throw, or a result type |
| Error handling in every handler | Inconsistent responses; drifts | One boundary |
| Logging at every catch | Five entries per failure; noise | Log once, at the boundary |
| Expected failures logged as `error` | Alert fatigue; real errors buried | `info`/`warn` for domain failures |
| Stack traces in responses | Maps the system for attackers | Generic message + `requestId` |
| Driver errors surfaced verbatim | Leaks schema and constraint names | Translate to domain errors |
| No `requestId` | Support tickets are unresolvable | Echo one on every response |
| Continuing after `uncaughtException` | Unknown process state | Log and exit |
| Config errors surfacing at request time | Fails at 3am, not at deploy | Validate at startup |
| Retrying `4xx` | Hammering a permanently invalid request | Retry only transient classes |
| Retries without jitter or a budget | Thundering herd; retry storm | Backoff, jitter, circuit breaker |
| Machine codes changed between releases | Silently breaks client branching | Codes are contract |

---
</antipatterns>

# Checklist

<checklist>
- [ ] Expected failures are modelled as typed domain errors
- [ ] One boundary converts errors to responses
- [ ] Every response carries a `requestId`
- [ ] Unexpected errors log a full trace exactly once, at `error`
- [ ] Expected failures do not log at `error`
- [ ] No stack traces, SQL, driver codes or paths reach the client
- [ ] Machine-readable codes are stable; human messages are actionable
- [ ] No empty `catch`; every catch handles or rethrows with context
- [ ] Configuration is validated at startup and crashes on failure
- [ ] `unhandledRejection` and `uncaughtException` log and exit
- [ ] Shutdown drains in-flight work with a bounded timeout
- [ ] Retries are limited to transient failures, with backoff and jitter
- [ ] Retried operations are idempotent or carry an idempotency key
- [ ] A circuit breaker protects persistently failing dependencies
</checklist>
