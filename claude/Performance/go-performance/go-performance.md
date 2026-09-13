---
targetModels:
  - "Claude Fable 5.1"
  - "Claude Opus 5"
  - "Claude Sonnet 5"
  - "Claude 5 Family"
  - "Future Claude Models"
name: go-performance
category: Performance
description: Making Go fast with evidence — pprof first, allocations and escape analysis, preallocation, strings.Builder, sync.Pool where it pays, GC tuning basics, and benchmarks before and after every change.
license: MIT
author: Agent.md maintainers
last-verified: 2026-09-13
reviewed-by: unreviewed
---
<!-- Generated from models/_canonical by scripts/build-model-variants.js.
     Edit the canonical source, not this file. Structure adapted for Claude per deep-research.md. -->
# Purpose

<purpose>
Rules for performance work in Go. Go is fast by default; most slow Go programs
are slow because of allocations, not arithmetic. Every rule here starts with
measurement — an optimisation without a profile is a guess that makes the code
harder to read.

Caching is `Performance/caching`; concurrency is `Backend/go-concurrency`.

---
</purpose>

# Profile before touching anything

<rules>
```go
import _ "net/http/pprof"      // registers /debug/pprof on http.DefaultServeMux

// Then, against a running service:
//   go tool pprof -http=:6060 http://localhost:8080/debug/pprof/profile?seconds=30   (CPU)
//   go tool pprof -http=:6060 http://localhost:8080/debug/pprof/heap               (memory)
//   go tool pprof -http=:6060 http://localhost:8080/debug/pprof/allocs             (allocations)
```

- Mount `pprof` on an internal port, never on the public listener.
- Read the CPU profile's flame graph top-down; the widest frames are the
  targets. If `runtime.mallocgc` is wide, the problem is allocations, not your
  algorithm.
- The `allocs` profile sorted by `alloc_space` is usually the highest-value
  view in a service.
- `go test -cpuprofile cpu.out -bench .` profiles a benchmark without a server.

---
</rules>

# Benchmarks with benchstat

<rules>
```sh
go test -bench BenchmarkParse -benchmem -count 10 > old.txt
</rules>

# make the change

<rules>
go test -bench BenchmarkParse -benchmem -count 10 > new.txt
benchstat old.txt new.txt
```

- `-benchmem` adds `B/op` and `allocs/op` — the numbers that predict GC cost.
- `-count 10` and `benchstat` give you a p-value. A 3% difference from a single
  run is noise on a laptop with a browser open.
- Keep benchmark inputs realistic in size. A parser benchmarked on a 20-byte
  string tells you nothing about a 2 MB payload.
- **Never** optimise without a benchmark that reproduces the profile's hot spot.
  The benchmark is the regression test for the speed-up.

---
</rules>

# Allocations and escape analysis

<rules>
```sh
go build -gcflags=-m ./... 2>&1 | grep "escapes to heap"
```

```go
// Escapes: the pointer outlives the frame.
func newUser() *User { return &User{} }

// Stays on the stack: value returned, no pointer taken.
func newUser() User { return User{} }
```

- Heap allocations cost twice: once to allocate, once for the GC to trace them.
  Stack allocations are free.
- A value escapes when its address is stored beyond the function, passed
  through an interface (`fmt.Println(x)` boxes `x`), or captured by a closure that
  outlives the call.
- Small structs returned by value are cheaper than pointers. Pointers are for
  mutation and large structs, not "efficiency".
- `-gcflags=-m` on a hot package shows exactly which lines allocate; fix the
  ones the `allocs` profile says matter.

---
</rules>

# Slices, maps, strings

<rules>
```go
out := make([]Item, 0, len(in))          // preallocate: one allocation, not log2(n)
for _, x := range in { out = append(out, convert(x)) }

m := make(map[string]int, expected)     // maps grow in steps too

var sb strings.Builder
sb.Grow(estimate)
for _, p := range parts { sb.WriteString(p) }
s := sb.String()                         // one allocation for the result
```

- `append` on a nil slice reallocates at every power of two. When the size is
  known or estimable, `make` with capacity.
- `s += piece` in a loop is O(n²) allocation. `strings.Builder` or
  `bytes.Buffer`.
- `[]byte(s)` and `string(b)` copy. In hot paths, work in one representation;
  `strings` and `bytes` packages mirror each other for this reason.
- Convert with `strconv.Itoa`, not `fmt.Sprintf("%d")`. `fmt` reflects and boxes;
  `strconv` does not.
- Prefer iterating with an index or `for i := range` over copying large structs in
  `for _, v := range` — each iteration copies `v`.

---
</rules>

# sync.Pool, and when not to

<rules>
```go
var bufPool = sync.Pool{New: func() any { return new(bytes.Buffer) }}

func encode(v any) ([]byte, error) {
    buf := bufPool.Get().(*bytes.Buffer)
    defer func() { buf.Reset(); bufPool.Put(buf) }()
    if err := json.NewEncoder(buf).Encode(v); err != nil { return nil, err }
    return append([]byte(nil), buf.Bytes()...), nil    // copy out; the buffer is reused
}
```

- A pool pays for short-lived, uniformly sized, frequently allocated objects —
  buffers in a hot encoder, scratch slices in a parser.
- Reset before `Put`. Never return the pooled object's memory to a caller.
- The pool is cleared on every GC cycle; it is a cache, not storage.
- If the profile does not show the allocation as hot, a pool adds complexity for
  nothing. Most code should never touch `sync.Pool`.

---
</rules>

# GC and runtime knobs

<rules>
- `GOGC` (default 100) trades memory for CPU: `GOGC=200` halves GC frequency at
  the cost of a larger heap. Set it per service from a measured heap profile,
  not by folklore.
- `GOMEMLIMIT` (1.19+) is a soft ceiling: set it just under the container's
  memory limit so the GC runs harder before the OOM killer does. Use it with a
  high `GOGC` in memory-constrained containers.
- `GOMAXPROCS` defaults to the host's CPUs, which in a CPU-limited container is
  wrong; `go.uber.org/automaxprocs` or a manual value from the cgroup limit
  prevents throttling.
- Reduce garbage before tuning the collector. A 30% allocation cut beats any
  `GOGC` setting.

---
</rules>

# Anti-patterns

<antipatterns>
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
</antipatterns>

# Checklist

<checklist>
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
</checklist>
