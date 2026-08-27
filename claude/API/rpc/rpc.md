---
targetModels:
  - "Claude Fable 5"
  - "Claude Opus 5"
  - "Claude Sonnet 5"
  - "Claude 5 Family"
  - "Future Claude Models"
name: rpc
category: API
description: gRPC and typed RPC — protobuf evolution rules, deadlines and cancellation, streaming, error models, and when RPC beats REST.
license: MIT
author: Agent.md maintainers
last-verified: 2026-08-23
reviewed-by: unreviewed
---
<!-- Generated from models/_canonical by scripts/build-model-variants.js.
     Edit the canonical source, not this file. Structure adapted for Claude per deep-research.md. -->
# Purpose

<purpose>
Rules for RPC-style APIs — gRPC, Connect, tRPC, Twirp. RPC models **procedures**,
not resources: the unit is an operation with a typed request and response.

Use RPC for internal service-to-service traffic where you control both ends and
want a schema-enforced contract, low overhead and streaming. Use REST for public
APIs consumed by clients you do not control. → `API/rest`

---
</purpose>

# Schema evolution is the whole contract

<rules>
Protobuf's wire format is positional: **field numbers are the contract**, names
are not.

```proto
message Order {
  string id            = 1;
  int64  total_cents   = 2;
  string currency      = 3;
  reserved 4;                        // was `amount`, removed 2026-08 — never reuse
  reserved "amount";
  OrderStatus status   = 5;
}
```

| Change | Safe |
| --- | --- |
| Adding a new field with a new number | Yes |
| Renaming a field (same number) | Yes on the wire; breaks JSON mapping and generated code |
| Removing a field | Only with `reserved` on its number **and** name |
| **Reusing a field number** | **Never** — old clients decode garbage into the new field |
| Changing a field's type | No, except within the documented compatible sets |
| Changing `optional`/`repeated` | No |
| Adding an enum value | Wire-safe; clients must have a default branch |
| Renaming a service or method | Breaking — it is the wire path |

Reusing a retired field number is the classic protobuf data-corruption bug: a
stale client sends its old meaning, and the new server accepts it as the new
field. `reserved` makes it a compile error instead.

Gate it in CI:

```bash
buf breaking --against '.git#branch=main'
buf lint
```

Every enum reserves `0` as `*_UNSPECIFIED`. Proto3 cannot distinguish an unset
scalar from its zero value, so `0` must never be a meaningful state.

---
</rules>

# Deadlines and cancellation

<rules>
**Every RPC call sets a deadline.** This is not optional and it is the single most
common gRPC production failure: a call with no deadline waits forever, holds a
connection and a goroutine, and cascades into a fleet-wide hang.

```go
ctx, cancel := context.WithTimeout(ctx, 2*time.Second)
defer cancel()
resp, err := client.GetOrder(ctx, &pb.GetOrderRequest{Id: id})
```

- **Propagate the deadline** through every downstream call. gRPC does this via
  context automatically — do not create a fresh `context.Background()` mid-chain,
  which severs cancellation.
- Give each hop **less** budget than its caller, leaving room for the response.
- **Honour cancellation** server-side: check `ctx.Err()` before expensive work and
  between loop iterations. A client that gave up should not still be costing you.
- Set a **server-side maximum** as a backstop against clients that omit deadlines.

Retries must only apply to idempotent methods, with backoff and jitter, and a
budget (`retryThrottling`) so a struggling service is not retried into collapse.
→ `System Design/resilience`

---
</rules>

# Errors

<rules>
Use the standard status codes; they carry retry semantics that generated clients
and service meshes act on.

| Code | Meaning | Client retries |
| --- | --- | --- |
| `INVALID_ARGUMENT` | Request is malformed regardless of state | No |
| `FAILED_PRECONDITION` | Valid, but system state forbids it | No, until state changes |
| `NOT_FOUND` | Absent, or hidden from this caller | No |
| `PERMISSION_DENIED` | Authenticated, not authorized | No |
| `UNAUTHENTICATED` | Missing or invalid credentials | After re-auth |
| `RESOURCE_EXHAUSTED` | Quota or rate limit | With backoff |
| `ABORTED` | Concurrency conflict | Yes, at a higher level |
| `UNAVAILABLE` | Transient — the only safely auto-retried code | Yes |
| `DEADLINE_EXCEEDED` | Ran out of time | Only if idempotent |
| `INTERNAL` | Server bug | No |

Attach machine-readable detail with `google.rpc.ErrorInfo` and `BadRequest`
rather than encoding structure into the message string.

**Never** return `INTERNAL` for a client mistake — it is unretryable, alerts your
on-call, and tells the caller nothing actionable.

---
</rules>

# Streaming

<rules>
| Pattern | Use for |
| --- | --- |
| Unary | Default. Use it unless you have a reason not to |
| Server streaming | Large result sets, live feeds |
| Client streaming | Bulk upload, telemetry |
| Bidirectional | Interactive sessions |

Streams are stateful and complicate load balancing, retries and deployments — a
long-lived stream pins a client to one pod across a rollout.

- Bound stream lifetime and message size (`grpc.max_receive_message_length`).
- Apply flow control; an unbounded producer will exhaust the consumer's memory.
- Design reconnection with resume tokens, because streams **will** break.
- Server streaming is not a substitute for pagination when the client wants a
  page. → `API/pagination`

---
</rules>

# Operational rules

<rules>
- **Connection-level load balancing fails with HTTP/2.** gRPC multiplexes over one
  long-lived connection, so an L4 balancer pins all traffic to one backend. Use an
  L7 proxy (Envoy, Linkerd) or client-side load balancing with resolver updates.
- Implement the standard **health checking protocol** (`grpc.health.v1.Health`)
  and wire it to readiness probes.
- Enable **reflection in development only**; it exposes the full service surface.
- Use **TLS everywhere**, mTLS between internal services.
- Instrument with interceptors: request id propagation, structured logging,
  metrics by method and status code, tracing. → `Backend/monitoring`
- For browser clients, gRPC needs a proxy (grpc-web) — Connect speaks both
  protocols and is usually the better choice there.

---
</rules>

# Anti-patterns

<antipatterns>
| Anti-pattern | Why it fails | Fix |
| --- | --- | --- |
| Reusing a retired field number | Old clients corrupt new data | `reserved` number and name |
| Removing a field without `reserved` | Number becomes reusable by accident | Always reserve |
| Meaningful enum `0` | Indistinguishable from unset in proto3 | `*_UNSPECIFIED = 0` |
| No breaking-change gate | Incompatible schemas ship | `buf breaking` in CI |
| Calls without deadlines | Hangs cascade fleet-wide | Deadline on every call |
| Fresh `context.Background()` mid-chain | Cancellation and deadline lost | Propagate the context |
| Ignoring `ctx.Err()` server-side | Work continues for a gone client | Check between steps |
| Retrying non-idempotent methods | Duplicate side effects | Retry only idempotent calls |
| Retries without a budget | Retry storm collapses the service | Backoff, jitter, throttling |
| `INTERNAL` for bad input | Unretryable, pages on-call, unactionable | `INVALID_ARGUMENT` |
| Error detail encoded in the message | Clients parse prose | `ErrorInfo` details |
| L4 load balancer in front of gRPC | All traffic pins to one backend | L7 proxy or client-side LB |
| Streaming where unary would do | Stateful, breaks rollouts and balancing | Unary by default |
| Unbounded stream or message size | Memory exhaustion | Explicit limits and flow control |
| Reflection enabled in production | Full surface disclosed | Development only |

---
</antipatterns>

# Checklist

<checklist>
- [ ] Field numbers are never reused; removals use `reserved` for number and name
- [ ] Every enum reserves `0` as `UNSPECIFIED`
- [ ] `buf lint` and `buf breaking` run in CI against the merge base
- [ ] Every client call sets an explicit deadline
- [ ] Deadlines propagate through the call chain with a shrinking budget
- [ ] Servers check for cancellation before and during expensive work
- [ ] A server-side maximum deadline exists as a backstop
- [ ] Retries apply only to idempotent methods, with backoff, jitter and a budget
- [ ] Status codes are used correctly, with structured error details
- [ ] Unary is the default; streaming is justified per method
- [ ] Message size and stream lifetime are bounded; flow control is applied
- [ ] Streams have a documented reconnection and resume strategy
- [ ] Load balancing is L7 or client-side, not L4
- [ ] The standard health-checking service is implemented and wired to probes
- [ ] Reflection is disabled in production; TLS/mTLS is enforced
- [ ] Interceptors provide request ids, structured logs, metrics and traces
</checklist>
