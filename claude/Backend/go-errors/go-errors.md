---
targetModels:
  - "Claude Fable 5.1"
  - "Claude Opus 5"
  - "Claude Sonnet 5"
  - "Claude 5 Family"
  - "Future Claude Models"
name: go-errors
category: Backend
description: Go error handling — wrapping with %w, errors.Is and errors.As, sentinel versus typed errors, when panic is correct, message conventions, and handling each error exactly once at the edge.
license: MIT
author: Agent.md maintainers
last-verified: 2026-09-13
reviewed-by: unreviewed
---
<!-- Generated from models/_canonical by scripts/build-model-variants.js.
     Edit the canonical source, not this file. Structure adapted for Claude per deep-research.md. -->
# Purpose

<purpose>
Rules for errors in Go. Errors are values; the language gives you no exceptions
and no stack unwinding, and the code that results is only as good as the
discipline around `if err != nil`.

The governing rule: **handle every error exactly once.** Either return it
(wrapped) or handle it (log, retry, respond) — never both.

---
</purpose>

# Wrap with %w, and only %w

<rules>
```go
// Bad: %v flattens the chain. errors.Is/As stop working past this point.
return fmt.Errorf("load order %s: %v", id, err)

// Good: %w keeps the chain. Add what THIS frame knows and nothing more.
return fmt.Errorf("load order %s: %w", id, err)
```

- Every `return err` that crosses a package boundary should add context. A bare
  `return err` from six frames deep produces `sql: no rows in result set` with no
  idea which query.
- Add the operation and the identifiers this frame has. Do **not** repeat what
  the callee already said — `"load order: load order: query: …"` is the sign of
  wrapping at every line.
- Messages are lowercase, no trailing punctuation, joined by `: `. The chain reads
  top-down as a sentence.
- **Never** wrap with `%v` or `%s`. They are only correct when you deliberately
  want to hide the cause from callers.

---
</rules>

# errors.Is and errors.As

<rules>
```go
var ErrNotFound = errors.New("not found")          // sentinel: identity matters

type ValidationError struct {                       // typed: carries data
    Field string
    Msg   string
}
func (e *ValidationError) Error() string { return e.Field + ": " + e.Msg }

// Checking — never string-compare, never ==
if errors.Is(err, ErrNotFound) { return http.StatusNotFound }
var ve *ValidationError
if errors.As(err, &ve) { return respondField(ve.Field, ve.Msg) }
```

- `errors.Is` walks the wrap chain comparing identity. Use it for sentinels.
- `errors.As` walks the chain looking for a type. Use it when the caller needs
  fields from the error.
- **Never** `err == ErrNotFound`. It fails the moment anyone wraps the error.
- **Never** `strings.Contains(err.Error(), "not found")`. Messages are for humans
  and change without notice.
- Map library errors to your own at the boundary: `sql.ErrNoRows` becomes
  `orders.ErrNotFound` inside the store. Callers should not import
  `database/sql` to interpret your errors.

---
</rules>

# Sentinel or typed?

<rules>
| Need | Use | Example |
| --- | --- | --- |
| Caller branches on *which* error | Sentinel `var Err… = errors.New` | `ErrNotFound`, `ErrConflict` |
| Caller needs *data* from the error | Typed `struct` implementing `error` | field name, retry-after, status |
| Nobody will inspect it | Plain `fmt.Errorf` with `%w` | most internal errors |
| Several failures at once | `errors.Join(errs...)` | validating every field |

- Export sentinels only when a caller has a reason to check them. An exported
  error is API; removing it is a breaking change.
- Typed errors use pointer receivers and are matched with `errors.As(err, &ptr)`.
  A value receiver with a pointer target silently never matches.
- `errors.Join` (1.20+) returns an error that `errors.Is` matches against any
  member. Use it to report all validation failures, not just the first.

---
</rules>

# Handle once, at the edge

<rules>
```go
// Inside: return, don't log. The caller decides.
func (s *Store) Get(ctx context.Context, id string) (Order, error) {
    row := s.db.QueryRowContext(ctx, q, id)
    var o Order
    if err := row.Scan(&o.ID, &o.Total); err != nil {
        if errors.Is(err, sql.ErrNoRows) {
            return Order{}, ErrNotFound
        }
        return Order{}, fmt.Errorf("get order %s: %w", id, err)
    }
    return o, nil
}

// Edge: the HTTP handler logs once and translates to a response.
o, err := store.Get(r.Context(), id)
switch {
case errors.Is(err, orders.ErrNotFound):
    http.Error(w, "not found", http.StatusNotFound)
case err != nil:
    logger.Error("get order", "err", err, "id", id)
    http.Error(w, "internal error", http.StatusInternalServerError)
}
```

- Log **or** return. A function that logs and then returns the error causes the
  same failure to appear once per frame in the logs.
- The edge (handler, job, `main`) is the one place that logs, maps to a status,
  and decides whether to retry.
- Never leak internal error text to clients. `err.Error()` in a JSON response
  exposes table names, hosts, and file paths.

---
</rules>

# panic is for bugs, not failures

<rules>
```go
// Correct: a programmer error that cannot happen with valid code.
func MustCompile(pattern string) *regexp.Regexp   // panics at init on a bad literal

// Wrong: a runtime condition. Return an error.
if user == nil { panic("no user") }
```

- Panic when the program is in a state that indicates a bug: an impossible enum
  value, a nil that the type system should have prevented, a failed `init`.
- **Never** panic on I/O, user input, network, or anything an operator could
  cause. Those are errors.
- `recover` belongs in exactly two places: the top of a goroutine you spawn
  (so one bug does not kill the process) and HTTP middleware that turns a panic
  into a `500` with a stack trace in the log. Nowhere else.
- A `Must…` prefix is the only acceptable signal that a function panics.

---
</rules>

# Checking and shadowing

<rules>
```go
// Shadowing bug: the outer err is never assigned; the check below is dead.
if v, err := parse(s); err != nil { … }
if err != nil { … }               // ← checks the outer, still-nil err

// Wrap the error, keep it in scope
v, err := parse(s)
if err != nil {
    return fmt.Errorf("parse %q: %w", s, err)
}
```

- `go vet` and `staticcheck` catch some shadowing; `errcheck` catches ignored
  returns. Run them.
- **Never** discard an error with `_` unless the comment beside it says why:
  `_ = f.Close() // read-only; nothing to flush`.
- `defer f.Close()` on a file you wrote to swallows the write error. Check it:
  `defer func() { err = errors.Join(err, f.Close()) }()`.

---
</rules>

# Anti-patterns

<antipatterns>
| Anti-pattern | Why it fails | Fix |
| --- | --- | --- |
| `fmt.Errorf("…: %v", err)` | Breaks the chain; `errors.Is` stops matching | `%w` |
| `err == ErrNotFound` | False once anything wraps it | `errors.Is` |
| `strings.Contains(err.Error(), …)` | Messages change; silent breakage | Sentinels or typed errors |
| Log then return | Same failure logged per frame | Return inside, log at the edge |
| `err.Error()` in an API response | Leaks internals to clients | Map to a status and a safe message |
| Wrapping with no added context | `"query: query: query: …"` | Add what this frame knows |
| `panic` on user or network input | Crashes on routine failures | Return an error |
| `recover` sprinkled through code | Hides bugs, corrupts state | Top of goroutines and HTTP middleware only |
| Shadowed `err` in `if … :=` | Outer check is dead code | Declare once; let linters run |
| `_ = doThing()` with no comment | Silent data loss | Handle it or justify ignoring it |
| Exporting every error variable | API surface nobody asked for | Export only what callers check |
| Returning `sql.ErrNoRows` from a store | Callers must import `database/sql` | Translate to `ErrNotFound` |

---
</antipatterns>

# Checklist

<checklist>
- [ ] Every wrapped error uses `%w`, never `%v`
- [ ] Each wrap adds this frame's context and does not repeat the callee's
- [ ] Error messages are lowercase, unpunctuated, and joined by `: `
- [ ] Errors are matched with `errors.Is` / `errors.As`, never `==` or string search
- [ ] Sentinels are exported only when a caller branches on them
- [ ] Typed errors use pointer receivers and are matched by pointer
- [ ] Library errors are translated to package errors at the boundary
- [ ] Errors are logged once, at the edge, never at every layer
- [ ] No API response contains raw `err.Error()` text
- [ ] `panic` is reserved for programmer errors; `recover` only in goroutine roots and HTTP middleware
- [ ] `errcheck` / `staticcheck` run in CI; ignored errors carry a comment
- [ ] Deferred `Close` on writers has its error checked
</checklist>
