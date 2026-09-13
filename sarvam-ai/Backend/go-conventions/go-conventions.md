---
targetModels:
  - "Sarvam-105B"
  - "Sarvam-30B"
  - "Sarvam Family"
  - "Future Sarvam Models"
name: go-conventions
category: Backend
description: Go project conventions — module layout, package naming, interfaces at the consumer, zero values, receivers, the vet/staticcheck gate, config, and structured logging with log/slog.
license: MIT
author: Agent.md maintainers
last-verified: 2026-09-13
reviewed-by: unreviewed
---
<!-- Generated from models/_canonical by scripts/build-model-variants.js.
     Edit the canonical source, not this file. Structure adapted for Sarvam per deep-research.md. -->


# Purpose

Rules for organising a Go codebase so it reads like Go — not like Java or
TypeScript translated. Go rewards small packages, plain types, and code that
does the obvious thing. Most "Go is verbose" complaints come from fighting that.

Errors are `Backend/go-errors`; HTTP is `Backend/go-http`; concurrency is
`Backend/go-concurrency`.

---

# Module layout

```
go.mod                     # one module per repository, at the root
cmd/
  api/main.go              # one main per binary; wiring only
  worker/main.go
internal/
  orders/                  # a domain package: orders.go, service.go, store.go
  httpx/                   # shared HTTP helpers
  platform/postgres/
```

- `cmd/<binary>/main.go` parses flags, builds dependencies, calls `run(ctx)`,
  and exits. Nothing else lives in `main`.
- `internal/` is enforced by the compiler: no other module can import it. Put
  everything there unless you are deliberately publishing an API.
- **Never** create `pkg/`, `utils/`, `common/`, `helpers/`, or `models/`. A
  package named for what it *is* rather than what it *does* attracts everything
  and depends on everything.
- One module per repo. Nested modules exist for a reason (separate versioning),
  and that reason is rarely yours.

---

# Package naming

```go
// Bad: stutter. Callers write orders.OrdersService.
package orders
type OrdersService struct{}

// Good: the package is the namespace.
package orders
type Service struct{}
func New(store Store) *Service
```

- Short, lowercase, one word, no underscores: `orders`, `httpx`, `postgres`.
- The package name is part of every identifier. `orders.New`, `orders.Store`,
  `orders.ErrNotFound` — never `orders.NewOrdersStore`.
- Package `main` is for binaries only; nothing imports it.

---

# Interfaces belong to the consumer

```go
// In the package that USES storage, not the one that implements it.
package orders

type Store interface {
    Get(ctx context.Context, id string) (Order, error)
    Put(ctx context.Context, o Order) error
}
```

- Define the interface where it is consumed, sized to what that consumer calls.
  A two-method interface is easy to fake in a test; a twenty-method one is not.
- Return concrete types, accept interfaces: `func New(s Store) *Service`.
- **Never** write an interface with a single implementation "for testing" before
  a test needs it. `*postgres.Store` passed directly is fine until it isn't.
- The bigger the interface, the weaker the abstraction. `io.Reader` is one method.

---

# Zero values, receivers, constructors

```go
// A useful zero value: no constructor needed.
var mu sync.Mutex
var buf bytes.Buffer

// Pointer receiver when the method mutates or the struct is large; be consistent
// across the whole type — never mix pointer and value receivers.
func (s *Service) Place(ctx context.Context, o Order) error
```

- Design types so the zero value is usable. `sync.Mutex`, `bytes.Buffer`,
  `http.Client` all work uninitialised; aim for that.
- If a type needs invariants, give it a constructor `New…` and keep the struct
  fields unexported so callers cannot build an invalid one.
- Pass small structs by value; pass anything with a mutex, a channel, or more than
  a few words by pointer.
- **Never** store a `context.Context` in a struct. It is a parameter, always
  first: `func (s *Service) Get(ctx context.Context, id string)`.

---

# The tooling gate

```sh
gofmt -l .                     # must print nothing
go vet ./...
staticcheck ./...              # honnef.co/go/tools/cmd/staticcheck
go test -race ./...
```

- `gofmt` is not a style preference; unformatted code does not merge. Run it in
  CI, not in review comments.
- `go vet` catches printf mismatches, copied locks, unreachable code. `staticcheck`
  catches the rest. Both are cheap; both are mandatory.
- Pin the Go version in `go.mod` (`go 1.22`) and in CI. Use `go mod tidy` before
  every commit; a dirty `go.sum` in a PR is a review failure.
- Dependencies: `go get` only what the standard library cannot do. Check
  `net/http`, `encoding/json`, `log/slog`, `testing` first — they cover most of
  what people reach for a framework to get.

---

# Configuration

```go
type Config struct {
    Addr        string        `env:"ADDR" default:":8080"`
    DatabaseURL string        `env:"DATABASE_URL,required"`
    Timeout     time.Duration `env:"TIMEOUT" default:"5s"`
}
```

- Read config once in `main`, into a struct, and pass it down. **Never** call
  `os.Getenv` from inside a package — it hides the dependency and makes tests
  order-dependent.
- Fail at startup on missing required values with a message naming the variable.
  A service that starts with an empty `DATABASE_URL` fails at first request, at
  3am, with a worse message.
- Flags for things an operator changes per run; environment for deployment
  values; files only when the config is large and structured.

---

# Logging with log/slog

```go
logger := slog.New(slog.NewJSONHandler(os.Stdout, &slog.HandlerOptions{Level: slog.LevelInfo}))
logger.Info("order placed", "order_id", o.ID, "tenant", o.Tenant, "total_cents", o.Total)
logger.Error("payment failed", "err", err, "order_id", o.ID)
```

- `log/slog` is in the standard library since 1.21. Use it; do not add a logging
  dependency.
- Structured key-value pairs, never `fmt.Sprintf` into the message. The message
  is a constant; the variables are attributes.
- Pass a `*slog.Logger` down as a dependency or carry a request-scoped one via
  `logger.With("request_id", id)`. **Never** use the package-level default in
  library code.
- Log at the edge (handler, job runner), not at every layer. A wrapped error
  carries the context up; logging it three times on the way is noise.

---

# Anti-patterns

| Anti-pattern | Why it fails | Fix |
| --- | --- | --- |
| `pkg/utils` or `common/` | Becomes a dependency sink for everything | Name packages by what they do |
| `orders.OrdersService` | Stutters at every call site | `orders.Service` |
| Interface in the implementing package | Consumers get methods they never call | Define it where it is used |
| Interface with one implementation and no test | Indirection with no payoff | Use the concrete type |
| Mixed pointer and value receivers | Method set surprises, subtle copies | One receiver kind per type |
| `context.Context` stored in a struct | Lifetime bugs, cancelled contexts reused | Pass it as the first argument |
| `os.Getenv` inside a package | Hidden dependency, untestable | Read config once in `main` |
| `fmt.Sprintf` inside a log message | Unsearchable, unparseable logs | `slog` attributes |
| Logging at every layer | The same error appears four times | Wrap on the way up, log once at the edge |
| Nested modules by default | Version skew inside one repo | One `go.mod` at the root |
| Skipping `go vet` / `staticcheck` | Known bug classes ship | Run both in CI |
| Framework for what `net/http` does | Extra dependency, hidden behaviour | Standard library first |

---

# Checklist

- [ ] Verify: One `go.mod` at the repository root with a pinned `go` version
- [ ] Verify: Binaries live under `cmd/<name>/main.go` and contain wiring only
- [ ] Verify: Application code lives under `internal/`
- [ ] Verify: No `utils`, `common`, `helpers`, or `models` packages exist
- [ ] Verify: Package names are short, lowercase, and do not stutter with their types
- [ ] Verify: Interfaces are declared in the consuming package and are small
- [ ] Verify: Every type uses one receiver kind consistently
- [ ] Verify: `context.Context` is always the first parameter, never a struct field
- [ ] Verify: Configuration is read once in `main` and passed down
- [ ] Verify: Required config fails fast at startup with the variable name
- [ ] Verify: Logging uses `log/slog` with structured attributes
- [ ] Verify: `gofmt`, `go vet`, `staticcheck`, and `go test -race` run in CI
