---
targetModels:
  - "DeepSeek V4"
  - "DeepSeek V3.2"
  - "DeepSeek R1"
  - "DeepSeek V3 Family"
  - "Future DeepSeek Models"
name: go-errors
category: Backend
description: Go error handling — wrapping with %w, errors.Is and errors.As, sentinel versus typed errors, when panic is correct, message conventions, and handling each error exactly once at the edge.
license: MIT
author: Agent.md maintainers
last-verified: 2026-09-13
reviewed-by: unreviewed
---
<!-- Generated from models/_canonical by scripts/build-model-variants.js.
     Edit the canonical source, not this file. Behavioural profile for DeepSeek: scripts/model-profiles.json -->

## Task boundary
1. Implement exactly the task as stated. Do not add abstractions, options, config, or files the task did not name.
2. Comments, identifiers, commit messages and log strings are English only.
3. Stop when the checklist at the end passes. Do not refactor or "improve" surrounding code.
4. Every checklist item below is backed by an assertion in a test or by pasted command output, never by a sentence.

---

# Purpose

Rules for errors in Go. Errors are values; the language gives you no exceptions
and no stack unwinding, and the code that results is only as good as the
discipline around `if err != nil`.

The governing rule: **handle every error exactly once.** Either return it
(wrapped) or handle it (log, retry, respond) — never both.

---

# Wrap with %w, and only %w

```go
// Bad: %v flattens the chain. errors.Is/As stop working past this point.
return fmt.Errorf("load order %s: %v", id, err)

// Good: %w keeps the chain. Add what THIS frame knows and nothing more.
return fmt.Errorf("load order %s: %w", id, err)
```

1. Every `return err` that crosses a package boundary should add context. A bare
  `return err` from six frames deep produces `sql: no rows in result set` with no
  idea which query.
2. Add the operation and the identifiers this frame has. Do **not** repeat what
  the callee already said — `"load order: load order: query: …"` is the sign of
  wrapping at every line.
3. Messages are lowercase, no trailing punctuation, joined by `: `. The chain reads
  top-down as a sentence.
4. **Never** wrap with `%v` or `%s`. They are only correct when you deliberately
  want to hide the cause from callers.

---

# errors.Is and errors.As

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

1. `errors.Is` walks the wrap chain comparing identity. Use it for sentinels.
2. `errors.As` walks the chain looking for a type. Use it when the caller needs
  fields from the error.
3. **Never** `err == ErrNotFound`. It fails the moment anyone wraps the error.
4. **Never** `strings.Contains(err.Error(), "not found")`. Messages are for humans
  and change without notice.
5. Map library errors to your own at the boundary: `sql.ErrNoRows` becomes
  `orders.ErrNotFound` inside the store. Callers should not import
  `database/sql` to interpret your errors.

---

# Sentinel or typed?

| Need | Use | Example |
| --- | --- | --- |
| Caller branches on *which* error | Sentinel `var Err… = errors.New` | `ErrNotFound`, `ErrConflict` |
| Caller needs *data* from the error | Typed `struct` implementing `error` | field name, retry-after, status |
| Nobody will inspect it | Plain `fmt.Errorf` with `%w` | most internal errors |
| Several failures at once | `errors.Join(errs...)` | validating every field |

1. Export sentinels only when a caller has a reason to check them. An exported
  error is API; removing it is a breaking change.
2. Typed errors use pointer receivers and are matched with `errors.As(err, &ptr)`.
  A value receiver with a pointer target silently never matches.
3. `errors.Join` (1.20+) returns an error that `errors.Is` matches against any
  member. Use it to report all validation failures, not just the first.

---

# Handle once, at the edge

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

1. Log **or** return. A function that logs and then returns the error causes the
  same failure to appear once per frame in the logs.
2. The edge (handler, job, `main`) is the one place that logs, maps to a status,
  and decides whether to retry.
3. Never leak internal error text to clients. `err.Error()` in a JSON response
  exposes table names, hosts, and file paths.

---

# panic is for bugs, not failures

```go
// Correct: a programmer error that cannot happen with valid code.
func MustCompile(pattern string) *regexp.Regexp   // panics at init on a bad literal

// Wrong: a runtime condition. Return an error.
if user == nil { panic("no user") }
```

1. Panic when the program is in a state that indicates a bug: an impossible enum
  value, a nil that the type system should have prevented, a failed `init`.
2. **Never** panic on I/O, user input, network, or anything an operator could
  cause. Those are errors.
3. `recover` belongs in exactly two places: the top of a goroutine you spawn
  (so one bug does not kill the process) and HTTP middleware that turns a panic
  into a `500` with a stack trace in the log. Nowhere else.
4. A `Must…` prefix is the only acceptable signal that a function panics.

---

# Checking and shadowing

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

1. `go vet` and `staticcheck` catch some shadowing; `errcheck` catches ignored
  returns. Run them.
2. **Never** discard an error with `_` unless the comment beside it says why:
  `_ = f.Close() // read-only; nothing to flush`.
3. `defer f.Close()` on a file you wrote to swallows the write error. Check it:
  `defer func() { err = errors.Join(err, f.Close()) }()`.

---

# Anti-patterns

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

# Checklist

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
