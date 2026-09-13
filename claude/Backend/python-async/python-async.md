---
targetModels:
  - "Claude Fable 5.1"
  - "Claude Opus 5"
  - "Claude Sonnet 5"
  - "Claude 5 Family"
  - "Future Claude Models"
name: python-async
category: Backend
description: asyncio without the foot-guns — when async is worth it, keeping the loop unblocked, TaskGroup over gather, cancellation and timeouts done correctly, choosing async-native libraries, and testing coroutines deterministically.
license: MIT
author: Agent.md maintainers
last-verified: 2026-09-13
reviewed-by: unreviewed
---
<!-- Generated from models/_canonical by scripts/build-model-variants.js.
     Edit the canonical source, not this file. Behavioural profile for Claude: scripts/model-profiles.json -->

<critical_constraints>
FORBIDDEN: Truncating code or writing placeholders such as "// ... existing code ..." or "# rest unchanged". Every edit is complete and applies as written.
FORBIDDEN: Reporting a check as passed without showing the command and its output.
REQUIRED: Reason through the rules below before the first edit; when two rules conflict, the one stated first wins.
</critical_constraints>

---

# Purpose

<purpose>

Rules for Python 3.12+ `asyncio` code. Async in Python is cooperative: one blocking
call stalls every coroutine on the loop, and nothing warns you. Most "async is
slow" reports are a sync call hiding inside an `async def`.

Framework specifics are `Backend/fastapi`; ORM async is `Database/sqlalchemy`.

---

</purpose>

# When to use it

<rules>

| Use asyncio | Do not |
| --- | --- |
| Many concurrent network calls (HTTP fan-out, DB pools, websockets) | CPU-bound work (parsing, hashing, ML) |
| Long-lived connections you must hold cheaply | A script that makes three sequential requests |
| Your framework and drivers are already async | The rest of the codebase and its libraries are sync |

Threads or `multiprocessing` beat asyncio for CPU; sync code beats it for
simplicity. Choose it for I/O concurrency, and then go all the way — a half-async
codebase gets the costs of both.

---

</rules>

# Never block the loop

<rules>

```python
async def handler():
    data = requests.get(url).json()     # blocks the loop for the whole request
    time.sleep(1)                        # blocks every coroutine for 1s
    rows = session.execute(stmt)         # sync SQLAlchemy: blocks

async def handler():
    async with httpx.AsyncClient() as c:
        data = (await c.get(url)).json()
    await asyncio.sleep(1)
    rows = await asession.execute(stmt)
    report = await asyncio.to_thread(render_pdf, rows)   # CPU/sync → thread
```

- Every library call inside `async def` must be either awaited or wrapped in
  `asyncio.to_thread`. `requests`, `boto3`, `psycopg2`, `open()` on a network
  mount — all blocking.
- Enable debug mode in development: `asyncio.run(main(), debug=True)` or
  `PYTHONASYNCIODEBUG=1` logs any callback that ran longer than 100 ms. This is
  how you find the hidden sync call.
- `to_thread` is bounded by the default executor (min(32, cpus+4) threads).
  Offloading thousands of calls to it serialises them; that is a sign to use an
  async driver instead.

---

</rules>

# Structured concurrency: `TaskGroup`

<rules>

```python
async with asyncio.TaskGroup() as tg:
    t1 = tg.create_task(fetch_user(uid))
    t2 = tg.create_task(fetch_orders(uid))
user, orders = t1.result(), t2.result()
```

- `TaskGroup` (3.11+) cancels the siblings when one fails and re-raises as an
  `ExceptionGroup`. `gather()` by default lets the others keep running after one
  fails, and `gather(return_exceptions=True)` hands you exceptions as values you
  can forget to check.
- Fire-and-forget `asyncio.create_task(coro())` without keeping a reference: the
  task can be garbage-collected mid-flight. Keep a reference or use a group.
- `except* ValueError:` to handle one member type of an `ExceptionGroup`.

---

</rules>

# Cancellation and timeouts

<rules>

```python
async with asyncio.timeout(5):                 # 3.11+; raises TimeoutError
    await fetch()

try:
    await work()
except asyncio.CancelledError:
    await cleanup()                            # allowed: short, itself awaitable
    raise                                       # always re-raise
```

- `asyncio.timeout()` over `wait_for()`: it is a context manager, composes, and
  does not create an extra task.
- Every `await` is a cancellation point. Code that must not be interrupted
  (commit-then-ack) goes in `asyncio.shield()` or a finally block — and the
  finally block must be short, because cancellation can arrive again.
- Swallowing `CancelledError` breaks shutdown and `TaskGroup` semantics. Catch,
  clean up, re-raise.
- Timeouts on every external call, without exception. An unbounded await is a
  leaked connection under a network partition. → `Backend/error-handling`

---

</rules>

# Async-native libraries

<rules>

| Sync | Async replacement |
| --- | --- |
| `requests` | `httpx.AsyncClient`, `aiohttp` |
| `psycopg2` | `asyncpg`, `psycopg` (v3, async) |
| `redis` (sync client) | `redis.asyncio` |
| `open()` for large files | `aiofiles`, or `to_thread` |
| `time.sleep` | `asyncio.sleep` |
| `subprocess.run` | `asyncio.create_subprocess_exec` |

Create one client per process and reuse it; a new `httpx.AsyncClient` per
request discards the connection pool and pays TLS every time. Close it in the
application's shutdown hook.

---

</rules>

# Sync boundaries

<rules>

```python
def cli_entry() -> None:
    asyncio.run(main())           # exactly one asyncio.run per process

# Calling async from sync code that is already inside a running loop:
# you cannot. Refactor the caller to be async, or run in a separate thread.
```

- `asyncio.run()` once, at the top. Nested `run()` calls raise; `get_event_loop()`
  in library code is deprecated behaviour.
- Semaphores for concurrency limits: `sem = asyncio.Semaphore(20)` around
  fan-out, or you will open 10,000 connections to a service that allows 100.
- Async generators need `async with aclosing(gen)` or explicit `aclose()`; an
  abandoned one holds its resources until finalised.

---

</rules>

# Testing

<rules>

```python
# pyproject.toml → [tool.pytest.ini_options] asyncio_mode = "auto"

async def test_timeout_cancels_and_cleans_up(monkeypatch):
    async def slow(): await asyncio.sleep(10)
    with pytest.raises(TimeoutError):
        async with asyncio.timeout(0.01):
            await slow()
```

- `pytest-asyncio` in `auto` mode so every `async def test_*` just runs.
- Never `await asyncio.sleep(0.5)` to "let things settle" — assert on an event
  or a future. Real sleeps make the suite slow and still flaky on loaded CI.
- `unittest.mock.AsyncMock` for async dependencies; a plain `Mock` returns a
  non-awaitable and the test passes for the wrong reason. → `Testing/pytest`

---

</rules>

# Anti-patterns

<antipatterns>

| Anti-pattern | Why it fails | Fix |
| --- | --- | --- |
| `requests`/`time.sleep`/sync ORM inside `async def` | Stalls every coroutine | Async driver or `to_thread` |
| asyncio for CPU-bound work | No parallelism, loop blocked | Threads/processes |
| `gather()` for related tasks | Siblings continue after a failure | `TaskGroup` |
| `gather(return_exceptions=True)` | Exceptions become unchecked values | `TaskGroup` + `except*` |
| `create_task()` without a reference | Task can be collected mid-run | Keep it, or a group |
| `except CancelledError: pass` | Shutdown and groups break | Clean up, re-raise |
| `wait_for()` | Extra task, awkward composition | `asyncio.timeout()` |
| No timeout on an external call | Hangs forever on partition | Timeout everywhere |
| New `httpx.AsyncClient` per request | No pooling, TLS each call | One client, reused |
| Unbounded fan-out | Thousands of connections | `Semaphore` |
| Nested `asyncio.run()` | `RuntimeError` | One `run` at the top |
| `await asyncio.sleep(x)` in tests | Slow and flaky | Await an event |
| `Mock()` for an async dependency | Returns non-awaitable | `AsyncMock` |

---

</antipatterns>

# Checklist

<checklist>

- [ ] Async chosen for I/O concurrency, not for CPU work
- [ ] No blocking call inside any `async def`; debug mode used to find them
- [ ] Sync work offloaded with `asyncio.to_thread`, sparingly
- [ ] Related tasks run under `TaskGroup`; no bare `gather`
- [ ] Every `create_task` result is retained
- [ ] `CancelledError` is cleaned up and re-raised, never swallowed
- [ ] Every external await has a timeout via `asyncio.timeout()`
- [ ] Non-interruptible sections use `shield` or a short `finally`
- [ ] Async-native drivers used; clients created once and closed at shutdown
- [ ] Fan-out bounded with a `Semaphore`
- [ ] Exactly one `asyncio.run()` per process
- [ ] Tests run in `asyncio_mode = "auto"` with `AsyncMock`; no real sleeps

</checklist>
