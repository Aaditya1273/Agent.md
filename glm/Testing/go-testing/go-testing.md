---
targetModels:
  - "GLM-5.3"
  - "GLM-5.2"
  - "GLM-5 Family"
  - "GLM-4.6"
  - "Future GLM Models"
name: go-testing
category: Testing
description: Testing in Go with the standard toolchain — table-driven subtests, t.Helper, httptest and fstest, golden files, benchmarks, the race detector, fuzzing, and interfaces instead of mock frameworks.
license: MIT
author: Agent.md maintainers
last-verified: 2026-09-13
reviewed-by: unreviewed
---
<!-- Generated from models/_canonical by scripts/build-model-variants.js.
     Edit the canonical source, not this file. Behavioural profile for GLM: scripts/model-profiles.json -->

## Task boundary
1. Implement only what the task names; no extra abstractions or files.
2. English-only comments and identifiers.
3. Stop when the checklist passes.

---

# Purpose

Rules for tests in Go. The `testing` package is deliberately small; the
patterns below are how the community fills the gap without a framework.
Reach for a dependency only after the standard library has demonstrably
failed you.

General testing principles are `Testing/unit`; HTTP handler design is
`Backend/go-http`.

---

# Table-driven subtests

```go
func TestDiscount(t *testing.T) {
    tests := []struct {
        name string
        qty  int
        want int
    }{
        {"below threshold", 9, 0},
        {"at threshold", 10, 100},
        {"above threshold", 11, 110},
    }
    for _, tc := range tests {
        t.Run(tc.name, func(t *testing.T) {
            t.Parallel()
            if got := Discount(tc.qty); got != tc.want {
                t.Errorf("Discount(%d) = %d, want %d", tc.qty, got, tc.want)
            }
        })
    }
}
```

1. One table, one `t.Run` per case, named so `go test -run TestDiscount/at_threshold`
  isolates it.
2. `t.Errorf` reports and continues; `t.Fatalf` stops the subtest. Use `Fatal`
  only when continuing is meaningless (setup failed).
3. The failure message states input, got, want. `"wrong result"` tells the reader
  nothing at 3am.
4. `t.Parallel()` inside subtests runs cases concurrently and is the cheapest way
  to make `-race` see something. From 1.22 the loop variable is per-iteration;
  before that, `tc := tc`.

---

# Helpers and cleanup

```go
func newStore(t *testing.T) *Store {
    t.Helper()                                  // failures point at the caller
    db := openTestDB(t)
    t.Cleanup(func() { db.Close() })            // runs after the test, in LIFO order
    return NewStore(db)
}
```

1. `t.Helper()` as the first line of every helper that can fail. Without it, the
  reported line is inside the helper, not the test.
2. `t.Cleanup` instead of `defer` in helpers: `defer` runs when the helper
  returns, which is before the test uses the thing.
3. `t.TempDir()` for files — created per test, removed automatically.
4. `t.Setenv` sets an environment variable for the test's duration and is
  incompatible with `t.Parallel()` by design; if you need both, inject config
  instead of reading the environment.

---

# HTTP handlers with httptest

```go
func TestGetOrder(t *testing.T) {
    h := New(fakeStore{orders: map[string]Order{"o1": {ID: "o1"}}}, slog.Default())

    req := httptest.NewRequest(http.MethodGet, "/orders/o1", nil)
    rec := httptest.NewRecorder()
    h.ServeHTTP(rec, req)

    if rec.Code != http.StatusOK {
        t.Fatalf("status = %d, want %d; body: %s", rec.Code, http.StatusOK, rec.Body)
    }
}
```

1. `httptest.NewRequest` + `httptest.NewRecorder` test a handler with no port and
  no network. Use this for every handler test.
2. `httptest.NewServer` is for testing an HTTP *client* against a real listener.
  Do not use it to test your own handlers.
3. Assert the denial cases — unauthenticated, wrong tenant, malformed body —
  before the happy path. They are the tests that catch a missing check.

---

# Fakes over mocks

```go
// The consumer's interface is small, so a fake is ten lines. No framework.
type fakeStore struct{ orders map[string]Order }

func (f fakeStore) Get(_ context.Context, id string) (Order, error) {
    o, ok := f.orders[id]
    if !ok { return Order{}, ErrNotFound }
    return o, nil
}
```

1. Small consumer-side interfaces make hand-written fakes trivial. A generated
  mock with call-count assertions couples the test to the implementation.
2. Fake the boundary you own (`Store`), not the library underneath (`*sql.DB`).
  For the database itself, run a real one in Docker: `Testing/integration`.
3. `testing/fstest.MapFS` fakes a filesystem; `io.Reader` from `strings.NewReader`
  fakes input. Design for interfaces and most mocking needs disappear.

---

# Golden files

```go
var update = flag.Bool("update", false, "rewrite golden files")

func TestRender(t *testing.T) {
    got := Render(input)
    golden := filepath.Join("testdata", t.Name()+".golden")
    if *update {
        os.WriteFile(golden, got, 0o644)
    }
    want, _ := os.ReadFile(golden)
    if !bytes.Equal(got, want) {
        t.Errorf("output differs from %s\n%s", golden, diff(want, got))
    }
}
```

1. Large expected outputs (rendered templates, generated code, JSON) live in
  `testdata/`, which `go build` ignores by convention.
2. `go test -update` regenerates them; the diff in the PR is the review.

---

# Benchmarks, race, fuzz

```go
func BenchmarkParse(b *testing.B) {
    for i := 0; i < b.N; i++ {          // or `for range b.N` from 1.24
        Parse(sample)
    }
}

func FuzzParse(f *testing.F) {
    f.Add("valid input")
    f.Fuzz(func(t *testing.T, s string) {
        _, _ = Parse(s)                 // must not panic on any input
    })
}
```

1. `go test -bench . -benchmem` reports ns/op and allocs/op. Run
  `benchstat` on before/after output; a single run is noise.
2. `go test -race ./...` in CI, always. → `Backend/go-concurrency`
3. Fuzz anything that parses untrusted bytes. `go test -fuzz FuzzParse` for
  ten minutes finds panics a table never would; keep found crashers in
  `testdata/fuzz/` as regression cases.

---

# Anti-patterns

| Anti-pattern | Why it fails | Fix |
| --- | --- | --- |
| One giant test function with `if` chains | First failure hides the rest | Table-driven subtests |
| Helper without `t.Helper()` | Failure points into the helper | First line of every helper |
| `defer` cleanup inside a helper | Runs before the test uses the resource | `t.Cleanup` |
| `httptest.NewServer` for handler tests | Slow, port-bound, unnecessary | `NewRequest` + `NewRecorder` |
| Mocking `*sql.DB` | Tests your guess about the driver | Fake your `Store`; real DB for integration |
| Mock framework with call counts | Couples tests to implementation | Hand-written fakes |
| `time.Sleep` to wait for goroutines | Flaky under load | Channels, `sync.WaitGroup`, or `errgroup` |
| Reading `time.Now()` in code under test | Non-deterministic | Inject a clock |
| `t.Setenv` with `t.Parallel()` | Panics — by design | Inject config |
| Skipping `-race` | Data races ship | Gate CI on it |
| Golden files edited by hand | Drift from real output | `-update` flag regenerates them |
| Benchmarking once and trusting the number | Noise | `benchstat` across runs |

---

# Checklist

- [ ] Tests are table-driven with named `t.Run` subtests
- [ ] Failure messages include input, got, and want
- [ ] Subtests call `t.Parallel()` where the code under test is pure or safe
- [ ] Every helper starts with `t.Helper()` and uses `t.Cleanup`
- [ ] Temporary files use `t.TempDir()`
- [ ] Handlers are tested with `httptest.NewRequest` and `NewRecorder`
- [ ] Denial and error paths are asserted, not only the happy path
- [ ] Fakes implement the consumer's small interface; no `*sql.DB` mocks
- [ ] Large expected outputs are golden files under `testdata/` with an `-update` flag
- [ ] `go test -race ./...` runs in CI
- [ ] Parsers of untrusted input have a `Fuzz` target with crashers kept as regressions
- [ ] Benchmarks are compared with `benchstat`, never a single run
