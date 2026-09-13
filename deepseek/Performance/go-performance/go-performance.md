---
targetModels:
  - "DeepSeek V4"
  - "DeepSeek V3.2"
  - "DeepSeek R1"
  - "DeepSeek V3 Family"
  - "Future DeepSeek Models"
name: go-performance
category: Performance
description: Making Go fast with evidence — pprof first, allocations and escape analysis, preallocation, strings.Builder, sync.Pool where it pays, GC tuning basics, and benchmarks before and after every change.
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

Rules for performance work in Go. Go is fast by default; most slow Go programs
are slow because of allocations, not arithmetic. Every rule here starts with
measurement — an optimisation without a profile is a guess that makes the code
harder to read.

Caching is `Performance/caching`; concurrency is `Backend/go-concurrency`.

---

# Profile before touching anything

```go
import _ "net/http/pprof"      // registers /debug/pprof on http.DefaultServeMux

// Then, against a running service:
//   go tool pprof -http=:6060 http://localhost:8080/debug/pprof/profile?seconds=30   (CPU)
//   go tool pprof -http=:6060 http://localhost:8080/debug/pprof/heap               (memory)
//   go tool pprof -http=:6060 http://localhost:8080/debug/pprof/allocs             (allocations)
```

1. Mount `pprof` on an internal port, never on the public listener.
2. Read the CPU profile's flame graph top-down; the widest frames are the
  targets. If `runtime.mallocgc` is wide, the problem is allocations, not your
  algorithm.
3. The `allocs` profile sorted by `alloc_space` is usually the highest-value
  view in a service.
4. `go test -cpuprofile cpu.out -bench .` profiles a benchmark without a server.

---

# Benchmarks with benchstat

```sh
go test -bench BenchmarkParse -benchmem -count 10 > old.txt
# make the change
go test -bench BenchmarkParse -benchmem -count 10 > new.txt
benchstat old.txt new.txt
```

1. `-benchmem` adds `B/op` and `allocs/op` — the numbers that predict GC cost.
2. `-count 10` and `benchstat` give you a p-value. A 3% difference from a single
  run is noise on a laptop with a browser open.
3. Keep benchmark inputs realistic in size. A parser benchmarked on a 20-byte
  string tells you nothing about a 2 MB payload.
4. **Never** optimise without a benchmark that reproduces the profile's hot spot.
  The benchmark is the regression test for the speed-up.

---

# Allocations and escape analysis

```sh
go build -gcflags=-m ./... 2>&1 | grep "escapes to heap"
```

```go
// Escapes: the pointer outlives the frame.
func newUser() *User { return &User{} }

// Stays on the stack: value returned, no pointer taken.
func newUser() User { return User{} }
```

1. Heap allocations cost twice: once to allocate, once for the GC to trace them.
  Stack allocations are free.
2. A value escapes when its address is stored beyond the function, passed
  through an interface (`fmt.Println(x)` boxes `x`), or captured by a closure that
  outlives the call.
3. Small structs returned by value are cheaper than pointers. Pointers are for
  mutation and large structs, not "efficiency".
4. `-gcflags=-m` on a hot package shows exactly which lines allocate; fix the
  ones the `allocs` profile says matter.

---

# Slices, maps, strings

```go
out := make([]Item, 0, len(in))          // preallocate: one allocation, not log2(n)
for _, x := range in { out = append(out, convert(x)) }

m := make(map[string]int, expected)     // maps grow in steps too

var sb strings.Builder
sb.Grow(estimate)
for _, p := range parts { sb.WriteString(p) }
s := sb.String()                         // one allocation for the result
```

1. `append` on a nil slice reallocates at every power of two. When the size is
  known or estimable, `make` with capacity.
2. `s += piece` in a loop is O(n²) allocation. `strings.Builder` or
  `bytes.Buffer`.
3. `[]byte(s)` and `string(b)` copy. In hot paths, work in one representation;
  `strings` and `bytes` packages mirror each other for this reason.
4. Convert with `strconv.Itoa`, not `fmt.Sprintf("%d")`. `fmt` reflects and boxes;
  `strconv` does not.
5. Prefer iterating with an index or `for i := range` over copying large structs in
  `for _, v := range` — each iteration copies `v`.

---

# sync.Pool, and when not to

```go
var bufPool = sync.Pool{New: func() any { return new(bytes.Buffer) }}

func encode(v any) ([]byte, error) {
    buf := bufPool.Get().(*bytes.Buffer)
    defer func() { buf.Reset(); bufPool.Put(buf) }()
    if err := json.NewEncoder(buf).Encode(v); err != nil { return nil, err }
    return append([]byte(nil), buf.Bytes()...), nil    // copy out; the buffer is reused
}
```

1. A pool pays for short-lived, uniformly sized, frequently allocated objects —
  buffers in a hot encoder, scratch slices in a parser.
2. Reset before `Put`. Never return the pooled object's memory to a caller.
3. The pool is cleared on every GC cycle; it is a cache, not storage.
4. If the profile does not show the allocation as hot, a pool adds complexity for
  nothing. Most code should never touch `sync.Pool`.

---

# GC and runtime knobs

1. `GOGC` (default 100) trades memory for CPU: `GOGC=200` halves GC frequency at
  the cost of a larger heap. Set it per service from a measured heap profile,
  not by folklore.
2. `GOMEMLIMIT` (1.19+) is a soft ceiling: set it just under the container's
  memory limit so the GC runs harder before the OOM killer does. Use it with a
  high `GOGC` in memory-constrained containers.
3. `GOMAXPROCS` defaults to the host's CPUs, which in a CPU-limited container is
  wrong; `go.uber.org/automaxprocs` or a manual value from the cgroup limit
  prevents throttling.
4. Reduce garbage before tuning the collector. A 30% allocation cut beats any
  `GOGC` setting.

---

# Anti-patterns

| Anti-pattern | Why it fails | Fix |
| --- | --- | --- |
| Optimising from intuition | Wrong target; slower, uglier code | Profile with `pprof` first |
| One benchmark run as proof | Noise masquerading as a result | `-count 10` + `benchstat` |
| `pprof` on the public port | Exposes internals; DoS vector | Internal listener only |
| Returning pointers "for speed" | Forces heap allocation | Values for small structs |
| `fmt.Sprintf` in hot paths | Reflection and boxing | `strconv`, `strings.Builder` |
| `s += x` in a loop | Quadratic allocation | `strings.Builder` |
| `append` from nil for a known size | log2(n) reallocations | `make` with capacity |
| `for _, v := range bigStructs` | Copies each element | Index or range by pointer |
| `sync.Pool` everywhere | Complexity without measured gain | Only where the profile shows it |
| Pooled buffer's bytes returned to caller | Corruption on reuse | Copy out before `Put` |
| `GOGC` tuned by folklore | Wrong trade for your heap | Measure; set `GOMEMLIMIT` in containers |
| `GOMAXPROCS` = host CPUs in a limited container | CPU throttling, latency spikes | Match the cgroup limit |

---

# Checklist

- [ ] Every optimisation started from a `pprof` profile showing the hot spot
- [ ] `pprof` is served on an internal port, not the public listener
- [ ] Before/after benchmarks with `-benchmem -count 10` are compared via `benchstat`
- [ ] Benchmark inputs are realistic in size
- [ ] Hot-path allocations are identified with the `allocs` profile and `-gcflags=-m`
- [ ] Slices and maps of known size are preallocated
- [ ] String building in loops uses `strings.Builder`
- [ ] `strconv` replaces `fmt.Sprintf` for scalar conversions in hot code
- [ ] `sync.Pool` is used only where profiling justified it, with `Reset` before `Put`
- [ ] Pooled memory is never handed to callers
- [ ] `GOMEMLIMIT` is set in memory-limited containers; `GOGC` is set from measurement
- [ ] `GOMAXPROCS` matches the container's CPU limit
