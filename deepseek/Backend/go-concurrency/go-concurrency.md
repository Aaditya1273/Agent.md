---
targetModels:
  - "DeepSeek V4"
  - "DeepSeek V3.2"
  - "DeepSeek R1"
  - "DeepSeek V3 Family"
  - "Future DeepSeek Models"
name: go-concurrency
category: Backend
description: Go concurrency without leaks — goroutine ownership, channels versus mutexes, context cancellation, errgroup, bounded worker pools, and making the race detector a gate.
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

Rules for goroutines, channels, and shared state. Go makes starting concurrent
work trivial and stopping it correctly hard. Every rule here exists because of
a production incident where a goroutine never exited, a channel never closed,
or two writers touched one map.

The governing rule: **whoever starts a goroutine owns its lifetime.** Know how
it ends before you write `go`.

---

# Ownership and exit

```go
// Bad: fire and forget. Who stops it? Who sees its error?
go worker(jobs)

// Good: bounded, cancellable, and its error comes back.
g, ctx := errgroup.WithContext(ctx)
for i := 0; i < n; i++ {
    g.Go(func() error { return worker(ctx, jobs) })
}
if err := g.Wait(); err != nil {
    return fmt.Errorf("workers: %w", err)
}
```

1. Every `go` statement needs an answer to: how does this goroutine stop, and
  where does its error go? If there is no answer, do not write it.
2. `golang.org/x/sync/errgroup` is the standard answer for "run these, wait for
  all, first error cancels the rest". Use `g.SetLimit(n)` (1.20+) to bound
  parallelism.
3. Goroutines are not free: each one holds a stack and whatever it captured. A
  leak is a slow memory exhaustion that shows up days later.

---

# Context is the cancellation signal

```go
func worker(ctx context.Context, jobs <-chan Job) error {
    for {
        select {
        case <-ctx.Done():
            return ctx.Err()
        case j, ok := <-jobs:
            if !ok { return nil }           // producer closed: drain complete
            if err := process(ctx, j); err != nil { return err }
        }
    }
}
```

1. Every blocking operation selects on `ctx.Done()`. A goroutine blocked on a
  channel receive with no cancellation path cannot be stopped.
2. Pass `ctx` into anything that can block: database calls, HTTP, sleeps
  (`select` with `time.After`, not `time.Sleep`).
3. `context.WithTimeout` / `WithCancel` return a `cancel` you must call, usually
  with `defer`. Not calling it leaks the context's resources; `go vet` flags this.
4. **Never** use `context.Background()` inside request handling. Derive from the
  request's context so the work dies with the request.

---

# Channels versus mutexes

| Situation | Use |
| --- | --- |
| Handing off ownership of data between goroutines | Channel |
| Fan-out / fan-in pipelines, work queues | Channel |
| Protecting a struct's fields read and written in place | `sync.Mutex` |
| A counter or flag | `atomic.Int64`, `atomic.Bool` |
| Lazy one-time initialisation | `sync.Once` / `sync.OnceValue` |
| Read-mostly map | `sync.RWMutex` (or `sync.Map` only for the narrow case it documents) |

```go
type Cache struct {
    mu sync.RWMutex          // guards items
    items map[string]Entry
}

func (c *Cache) Get(k string) (Entry, bool) {
    c.mu.RLock()
    defer c.mu.RUnlock()
    e, ok := c.items[k]
    return e, ok
}
```

1. Document what a mutex guards with a comment beside it. Lock at the top of the
  method, `defer` the unlock, keep the critical section small.
2. **Never** copy a struct containing a mutex; pass by pointer. `go vet` catches
  it (`copylocks`).
3. A channel used as a mutex (buffered size 1) is a mutex with worse ergonomics.
4. Maps are not safe for concurrent write. One unsynchronised write with any other
  access is a crash, not a data race warning.

---

# Channel rules

```go
jobs := make(chan Job, 64)         // buffer: decoupling, not a queue of unbounded size
go func() {
    defer close(jobs)              // the sender closes, exactly once
    for _, j := range list { jobs <- j }
}()
for j := range jobs { … }          // range ends when closed and drained
```

1. The **sender** closes; receivers never do. Closing twice panics; sending on a
  closed channel panics.
2. Direction in signatures: `<-chan Job` for receivers, `chan<- Job` for senders.
  The compiler then prevents the wrong side from closing.
3. A buffer is for smoothing bursts, not for storage. If the buffer size is
  "large enough that it never fills", you have an unbounded queue with a crash
  waiting at the limit.
4. `nil` channels block forever — useful to disable a `select` case, a bug
  everywhere else.

---

# Worker pools and pipelines

```go
g, ctx := errgroup.WithContext(ctx)
g.SetLimit(runtime.GOMAXPROCS(0))
for _, item := range items {
    g.Go(func() error {               // 1.22: loop variable is per-iteration
        return handle(ctx, item)
    })
}
return g.Wait()
```

1. Bound concurrency explicitly. "One goroutine per item" over ten thousand items
  is ten thousand simultaneous database connections.
2. Before 1.22, capture loop variables (`item := item`). From 1.22 each iteration
  has its own; pin `go 1.22` in `go.mod` to get it.
3. Results from parallel work: collect via a channel or a pre-sized slice indexed
  by position — never append to a shared slice without a mutex.

---

# The race detector is a gate

```sh
go test -race ./...
go build -race ./cmd/api     # run a canary with it in staging
```

1. `-race` finds real bugs with near-zero false positives. Run it on every test
  run in CI; the 2–10× slowdown is worth it.
2. A race report is never "flaky". It is a bug that happened to be observed this
  time.
3. Tests should exercise concurrency: run the worker with several goroutines,
  not one, or the detector has nothing to see.

---

# Anti-patterns

| Anti-pattern | Why it fails | Fix |
| --- | --- | --- |
| `go f()` with no way to stop or observe it | Leaks; errors vanish | `errgroup` with a context |
| Blocking receive with no `ctx.Done()` case | Unstoppable goroutine | `select` on both |
| `time.Sleep` in cancellable code | Ignores cancellation | `select` with `time.After` |
| `context.Background()` in a request path | Work outlives the request | Derive from `r.Context()` |
| Forgetting `cancel()` | Context resources leak | `defer cancel()` |
| Receiver closes the channel | Panic on next send | Sender closes, once |
| Huge buffer "so it never blocks" | Unbounded memory, then a crash | Small buffer, bounded producers |
| Concurrent map writes | Runtime fatal error | Mutex or redesign |
| Copying a struct with a `sync.Mutex` | Two locks that guard nothing | Pointer receivers; `go vet` |
| Goroutine per item, unbounded | Resource exhaustion downstream | `g.SetLimit(n)` |
| `append` to a shared slice from goroutines | Data race, lost writes | Pre-sized slice by index, or a mutex |
| Skipping `-race` because it is slow | Races ship | Gate CI on it |

---

# Checklist

- [ ] Every goroutine has a defined owner, a stop signal, and an error path
- [ ] Parallel work uses `errgroup` with `SetLimit` where the fan-out is unbounded
- [ ] Every blocking `select` includes `ctx.Done()`
- [ ] Every derived context's `cancel` is deferred
- [ ] No `context.Background()` inside request or job handling
- [ ] Channels are closed by the sender, exactly once, and typed by direction
- [ ] Buffers are sized for burst smoothing, not storage
- [ ] Each mutex has a comment naming what it guards; structs with mutexes are never copied
- [ ] Counters and flags use `sync/atomic`, not a mutex around an `int`
- [ ] No map is written concurrently without synchronisation
- [ ] Results from parallel work are collected without a shared unguarded slice
- [ ] `go test -race ./...` runs in CI and a race report blocks the merge
