---
targetModels:
  - "Claude Fable 5"
  - "Claude Opus 5"
  - "Claude Sonnet 5"
  - "Claude 5 Family"
  - "Future Claude Models"
name: node
category: Backend
description: Node.js server rules — the event loop, async correctness, streams and backpressure, process configuration, and the supply chain.
license: MIT
author: Agent.md maintainers
last-verified: 2026-08-23
reviewed-by: unreviewed
---
<!-- Generated from models/_canonical by scripts/build-model-variants.js.
     Edit the canonical source, not this file. Structure adapted for Claude per deep-research.md. -->
# Purpose

<purpose>
Rules specific to running Node.js as a backend. Node's model — one thread running
an event loop — is the source of both its throughput and every performance
surprise it produces.

Framework-level concerns are `Backend/express`; this is the runtime.

---
</purpose>

# Never block the event loop

<rules>
One thread serves every request. A synchronous operation stops **all** of them.

```js
// Blocks every concurrent request for the duration
const data = fs.readFileSync("./large.json");
const hash = crypto.pbkdf2Sync(pw, salt, 600_000, 32, "sha512");

// Non-blocking
const data = await fs.promises.readFile("./large.json");
const hash = await promisify(crypto.pbkdf2)(pw, salt, 600_000, 32, "sha512");
```

Common blockers, in order of how often they appear in production:

| Operation | Cost |
| --- | --- |
| `JSON.parse` on a multi-MB payload | Tens to hundreds of ms, synchronous |
| Synchronous crypto (`pbkdf2Sync`, `scryptSync`) | Hundreds of ms by design |
| `readFileSync` in a request path | Disk latency, blocking |
| A regex with catastrophic backtracking | Unbounded — a ReDoS vector |
| A large `Array.sort` or `for` loop | Milliseconds per 100k elements |
| `zlib` sync variants | Proportional to payload size |

Startup is the exception: `readFileSync` at module load is fine, because nothing is
being served yet.

For genuinely CPU-bound work use `worker_threads` or a separate service. Adding
concurrency to a blocked event loop does nothing. Monitor event-loop delay
(`perf_hooks.monitorEventLoopDelay`) — a p99 above ~50 ms means something is
blocking. → `Backend/monitoring`

---
</rules>

# Async correctness

<rules>
```js
// Sequential — 3× slower than necessary when the calls are independent
const a = await getA(); const b = await getB(); const c = await getC();

// Concurrent, and it does not lose an error when one rejects
const [a, b, c] = await Promise.all([getA(), getB(), getC()]);
```

- `Promise.all` rejects on the first failure; `Promise.allSettled` when you need
  every result. Use `Promise.all` unless partial success is meaningful.
- **Never** use `forEach` with an async callback — it does not await, so the
  function returns before the work finishes and errors are unhandled. Use
  `for…of` for sequential, `Promise.all(map(...))` for concurrent.
- Bound concurrent fan-out (`p-limit`, a semaphore). `Promise.all` over 10,000
  items opens 10,000 sockets.
- An unawaited promise that rejects becomes an `unhandledRejection`, which
  terminates the process by default in current Node. Await it or attach a handler.
- Wrap `EventEmitter` callbacks: an exception thrown inside one is not caught by
  the surrounding `try`.

---
</rules>

# Streams and backpressure

<rules>
Reading a large file or response body into memory works in testing and OOMs in
production.

```js
// Buffers the whole file into memory
res.send(await fs.promises.readFile(path));

// Streams it, and `pipeline` propagates errors and destroys sockets correctly
await pipeline(fs.createReadStream(path), res);
```

`pipeline` (not `.pipe()`) handles error propagation and cleanup — a `.pipe()`
chain leaks file descriptors when the destination errors.

Backpressure is the reason streams exist: if you ignore the return value of
`write()`, a fast producer will fill memory until the process dies. `pipeline`
handles it for you.

---
</rules>

# Process configuration

<rules>
```dockerfile
ENV NODE_ENV=production
</rules>

# Set the heap below the container limit, or the OOM killer arrives before GC does

<rules>
ENV NODE_OPTIONS="--max-old-space-size=768"
```

| Setting | Why |
| --- | --- |
| `NODE_ENV=production` | Frameworks skip development-only work; error pages stop leaking traces |
| `--max-old-space-size` | Default heap ignores cgroup limits; set it ~75% of the container limit |
| `UV_THREADPOOL_SIZE` | Default 4 threads serve fs, dns and crypto — raise if those queue |
| Process manager | One process per core (Kubernetes replicas, not `cluster`, in containers) |
| `--enable-source-maps` | Readable stack traces from compiled TypeScript |

Handle `SIGTERM`: stop accepting connections, drain in-flight requests with a
bounded timeout, close the database pool, exit. Without it every deploy severs
live requests. → `DevOps/deployment`

`unhandledRejection` and `uncaughtException` should log and exit — after an
uncaught exception the process state is unknown. → `Backend/error-handling`

---
</rules>

# Dependencies

<rules>
Node's supply chain is the largest of any ecosystem, and it is a real attack path.

- **Commit the lockfile** and install with `npm ci`, never `npm install`, in CI
  and in Docker builds.
- Pin the Node version in `.nvmrc` and `engines`, and run the same major in CI as
  in production.
- Audit in CI (`npm audit --audit-level=high`, Dependabot, Snyk) and treat a
  critical finding as a build failure.
- Prefer the standard library. `node:crypto`, `node:test`, `fetch`, `AbortSignal`
  and `structuredClone` are built in — a dependency for what a few lines can do is
  a permanent liability.
- Use `--ignore-scripts` where feasible; postinstall scripts are the most common
  malicious-package vector.
- Never run the process as root in a container; use a non-root user and a
  read-only filesystem. → `DevOps/docker`

---
</rules>

# Anti-patterns

<antipatterns>
| Anti-pattern | Why it fails | Fix |
| --- | --- | --- |
| Sync I/O or crypto in a request path | Blocks every concurrent request | Async variants |
| Adding concurrency to CPU-bound work | The event loop is still one thread | `worker_threads` or a separate service |
| `forEach` with an async callback | Does not await; errors unhandled | `for…of` or `Promise.all` |
| Sequential independent awaits | Latency adds up needlessly | `Promise.all` |
| Unbounded `Promise.all` fan-out | Thousands of sockets at once | Concurrency limiter |
| Floating promises | Process-terminating unhandled rejection | Await or handle |
| `.pipe()` without error handling | Leaked descriptors on failure | `pipeline` |
| Reading large files into memory | OOM at production sizes | Stream |
| No `--max-old-space-size` | OOM killer before GC runs | Set below the container limit |
| Missing `NODE_ENV=production` | Development error pages leak traces | Set it explicitly |
| No `SIGTERM` handler | Every deploy severs live requests | Graceful shutdown |
| Continuing after `uncaughtException` | Unknown process state | Log and exit |
| `npm install` in CI | Ignores the lockfile; irreproducible builds | `npm ci` |
| Running as root in a container | Container escape has full privileges | Non-root user |
| A dependency for a one-liner | Supply-chain surface for nothing | Standard library |

---
</antipatterns>

# Checklist

<checklist>
- [ ] No synchronous I/O, crypto or compression in request paths
- [ ] CPU-bound work runs in worker threads or a separate service
- [ ] Event-loop delay is monitored and alerted on
- [ ] Independent async work uses `Promise.all`, with bounded fan-out
- [ ] No async callbacks passed to `forEach`
- [ ] No floating promises; rejections are handled
- [ ] Large payloads are streamed with `pipeline`, not buffered
- [ ] `NODE_ENV=production` is set in production images
- [ ] Heap size is set below the container memory limit
- [ ] `UV_THREADPOOL_SIZE` is tuned if fs/dns/crypto work queues
- [ ] `SIGTERM` triggers a graceful drain and clean exit
- [ ] `unhandledRejection` and `uncaughtException` log and exit
- [ ] The lockfile is committed and CI installs with `npm ci`
- [ ] The Node version is pinned and matches between CI and production
- [ ] Dependency audits run in CI and fail on high-severity findings
- [ ] The container runs as a non-root user
</checklist>
