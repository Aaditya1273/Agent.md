---
targetModels:
  - "Grok 4.6"
  - "Grok 4.5"
  - "Grok 4 Family"
  - "Grok Code Fast"
  - "Future Grok Models"
name: go-http
category: Backend
description: HTTP servers in Go with the standard library — the 1.22 ServeMux patterns, handler and middleware shape, context propagation, timeouts, graceful shutdown, JSON encoding, and request validation.
license: MIT
author: Agent.md maintainers
last-verified: 2026-09-13
reviewed-by: unreviewed
---
<!-- Generated from models/_canonical by scripts/build-model-variants.js.
     Edit the canonical source, not this file. Behavioural profile for Grok: scripts/model-profiles.json -->

## Non-negotiable
The constraints hoisted below override anything later in this document. Read them first; the rest is rationale.

---

# Purpose

Rules for building HTTP services on `net/http`. Since Go 1.22 the standard
mux routes by method and path pattern, which removes the main reason people
reached for a router package. Use the standard library unless you can name the
feature it lacks.

Errors are `Backend/go-errors`; testing handlers is `Testing/go-testing`.

---

# Routing with the 1.22 mux

```go
mux := http.NewServeMux()
mux.HandleFunc("GET /orders/{id}", h.getOrder)
mux.HandleFunc("POST /orders", h.createOrder)
mux.HandleFunc("GET /healthz", h.healthz)
mux.Handle("GET /static/", http.StripPrefix("/static/", http.FileServer(http.Dir("static"))))

func (h *Handler) getOrder(w http.ResponseWriter, r *http.Request) {
    id := r.PathValue("id")
    …
}
```

- Patterns are `"METHOD /path/{param}"`. A pattern without a method matches all
  methods; always specify one for API routes.
- `r.PathValue("id")` reads a wildcard. `{id...}` matches the rest of the path;
  `{$}` anchors an exact match (`"GET /{$}"` is the root only).
- Most specific pattern wins; two patterns that overlap ambiguously panic at
  registration, which is the behaviour you want — at startup, not in production.
- **Never** switch on `r.Method` inside a handler. That is what the pattern is for.

---

# Handlers and dependencies

```go
type Handler struct {
    store  orders.Store
    logger *slog.Logger
}

func New(store orders.Store, logger *slog.Logger) http.Handler {
    h := &Handler{store: store, logger: logger}
    mux := http.NewServeMux()
    mux.HandleFunc("GET /orders/{id}", h.getOrder)
    return mux
}
```

- Handlers are methods on a struct that holds dependencies. **Never** reach for
  package-level variables for the database or logger.
- `New` returns `http.Handler`, not `*http.ServeMux`. Callers wrap it in
  middleware and pass it to `http.Server`; they do not need the mux type.
- Keep the handler thin: decode, validate, call a service, encode. Business rules
  in a handler cannot be reused from a job or tested without HTTP.

---

# Middleware

```go
func requestID(next http.Handler) http.Handler {
    return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        id := r.Header.Get("X-Request-Id")
        if id == "" { id = rand.Text() }
        ctx := context.WithValue(r.Context(), ctxKeyRequestID{}, id)
        w.Header().Set("X-Request-Id", id)
        next.ServeHTTP(w, r.WithContext(ctx))
    })
}

handler := recoverer(logging(requestID(mux)))   // outermost runs first
```

- Middleware is `func(http.Handler) http.Handler`. No framework type needed.
- Order matters and reads inside-out: `recoverer` must be outermost so it
  catches panics from every layer, including logging.
- Context keys are unexported struct types (`type ctxKeyRequestID struct{}`),
  never strings — string keys from two packages collide silently.
- Use context values for request-scoped metadata only (request id, auth
  principal). **Never** pass function parameters through the context.

---

# Timeouts and the server

```go
srv := &http.Server{
    Addr:              cfg.Addr,
    Handler:           handler,
    ReadHeaderTimeout: 5 * time.Second,
    ReadTimeout:       10 * time.Second,
    WriteTimeout:      30 * time.Second,
    IdleTimeout:       120 * time.Second,
}
```

- `http.ListenAndServe(addr, h)` has **no timeouts**. A slow client holds a
  connection forever. Always construct `http.Server` and set all four.
- `ReadHeaderTimeout` alone defeats slowloris; set it even when the others are
  generous.
- Per-request deadlines come from the context: `ctx, cancel :=
  context.WithTimeout(r.Context(), 5*time.Second)` around downstream calls, and
  pass `ctx` to the database and outbound HTTP.
- Outbound: **never** use `http.DefaultClient` in production; it has no timeout.
  Construct one `http.Client{Timeout: …}` per dependency and reuse it.

---

# Graceful shutdown

```go
func run(ctx context.Context, srv *http.Server) error {
    errCh := make(chan error, 1)
    go func() { errCh <- srv.ListenAndServe() }()

    select {
    case err := <-errCh:
        return err
    case <-ctx.Done():                                   // SIGTERM via signal.NotifyContext
        shutdownCtx, cancel := context.WithTimeout(context.Background(), 15*time.Second)
        defer cancel()
        return srv.Shutdown(shutdownCtx)
    }
}
```

- `signal.NotifyContext(context.Background(), os.Interrupt, syscall.SIGTERM)` in
  `main` gives you the context.
- `srv.Shutdown` stops accepting, waits for in-flight requests up to the
  deadline, then returns. Without it, a deploy severs live requests.
- Readiness (`/readyz`) should start failing *before* shutdown so the load
  balancer drains you; liveness (`/healthz`) stays green until exit.

---

# JSON in and out

```go
func decode[T any](r *http.Request) (T, error) {
    var v T
    dec := json.NewDecoder(http.MaxBytesReader(nil, r.Body, 1<<20))   // 1 MiB cap
    dec.DisallowUnknownFields()
    if err := dec.Decode(&v); err != nil {
        return v, fmt.Errorf("decode body: %w", err)
    }
    return v, nil
}

func respond(w http.ResponseWriter, status int, v any) {
    w.Header().Set("Content-Type", "application/json")
    w.WriteHeader(status)
    _ = json.NewEncoder(w).Encode(v)   // client gone is not our error
}
```

- Cap request bodies with `http.MaxBytesReader`. Without it, one client can
  allocate as much memory as it likes.
- `DisallowUnknownFields` turns typos into `400`s instead of silently ignored
  fields.
- Set `Content-Type` before `WriteHeader`; headers written after the status are
  dropped.
- Validate after decoding: required fields, ranges, enums. Return all field
  errors together (`errors.Join`), not the first.
- Use `time.Time` with RFC 3339 and `int64` cents for money; never `float64` for
  currency.

---

# Anti-patterns

| Anti-pattern | Why it fails | Fix |
| --- | --- | --- |
| `http.ListenAndServe` directly | No timeouts; slow clients pin connections | `http.Server` with all four timeouts |
| `http.DefaultClient` for outbound calls | No timeout; hangs forever | A configured `http.Client` per dependency |
| `switch r.Method` in a handler | Duplicates what the mux does | `"GET /path"` patterns |
| Package-level `db` variable | Untestable, hidden coupling | Handler struct with dependencies |
| String context keys | Collide across packages | Unexported struct key types |
| Parameters passed via context | Invisible API; nil at runtime | Function arguments |
| No `MaxBytesReader` | Unbounded allocation from one request | Cap every body |
| Business logic in handlers | Unreusable, untestable without HTTP | Thin handler, service underneath |
| `WriteHeader` before setting headers | Headers silently dropped | Headers first, then status |
| No `Shutdown` on SIGTERM | Deploys cut live requests | `signal.NotifyContext` + `srv.Shutdown` |
| `recover` middleware innermost | Panics in outer middleware escape | Outermost layer |
| `float64` for money | Rounding errors | `int64` minor units |

---

# Checklist

- [ ] Verify: Routes use `"METHOD /path/{param}"` patterns on `http.NewServeMux`
- [ ] Verify: Every API route specifies a method
- [ ] Verify: Handlers are methods on a struct that receives dependencies
- [ ] Verify: `New` returns `http.Handler`
- [ ] Verify: Middleware is `func(http.Handler) http.Handler`, recoverer outermost
- [ ] Verify: Context keys are unexported struct types
- [ ] Verify: `http.Server` sets `ReadHeaderTimeout`, `ReadTimeout`, `WriteTimeout`, `IdleTimeout`
- [ ] Verify: Downstream calls receive a context with a deadline
- [ ] Verify: Outbound clients are constructed with a `Timeout`, never `http.DefaultClient`
- [ ] Verify: Request bodies are capped with `http.MaxBytesReader`
- [ ] Verify: Decoding uses `DisallowUnknownFields` and validation reports all errors
- [ ] Verify: `SIGTERM` triggers `srv.Shutdown` with a deadline
- [ ] Verify: Readiness fails before shutdown; liveness stays green until exit
