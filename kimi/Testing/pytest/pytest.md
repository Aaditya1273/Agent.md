---
targetModels:
  - "Kimi K3"
  - "Kimi K2.6"
  - "Kimi K2 Family"
  - "Future Kimi Models"
name: pytest
category: Testing
description: A pytest suite that stays fast and trustworthy — layout, fixtures with the right scope, parametrize instead of loops, markers that mean something, mocking only at boundaries you own, coverage as a diagnostic, async tests, and keeping the whole run under a minute.
license: MIT
author: Agent.md maintainers
last-verified: 2026-09-13
reviewed-by: unreviewed
---
<!-- Generated from models/_canonical by scripts/build-model-variants.js.
     Edit the canonical source, not this file. Behavioural profile for Kimi: scripts/model-profiles.json -->

## Scope contract
FILE_ISOLATION: Modify only files inside the scope the task names; report any out-of-scope change instead of making it.

---

# Purpose

Rules for organising and writing tests with pytest. What to assert is
`Testing/unit`; this package is about the harness: how tests are found, shared,
isolated and kept fast.

---

# Layout and configuration

```
tests/
  conftest.py            # shared fixtures, no tests
  unit/test_money.py
  integration/conftest.py  test_orders_repo.py
  e2e/test_checkout.py
```

```toml
[tool.pytest.ini_options]
testpaths = ["tests"]
addopts = "-q --strict-markers --strict-config -ra"
xfail_strict = true
filterwarnings = ["error"]
markers = ["slow: takes >1s", "integration: needs the database"]
```

- `--strict-markers`: a typo'd `@pytest.mark.integraton` is an error, not a
  silently unselected test.
- `filterwarnings = ["error"]`: deprecation warnings fail the suite while they
  are cheap to fix.
- `xfail_strict`: an `xfail` that starts passing fails, so fixed bugs get their
  marker removed.
- `src/` layout with the package installed editable, so `import orders` in tests
  is the installed package. → `Backend/python-conventions`

---

# Fixtures and scope

```python
@pytest.fixture(scope="session")
def engine():                          # expensive: once per run
    e = create_engine(TEST_URL); yield e; e.dispose()

@pytest.fixture
def session(engine):                   # cheap and isolating: once per test
    conn = engine.connect(); tx = conn.begin()
    s = Session(bind=conn, join_transaction_mode="create_savepoint")
    yield s
    s.close(); tx.rollback(); conn.close()

@pytest.fixture
def order(session) -> Order:
    return OrderFactory(session=session)
```

- Default scope is `function`. Widen it only for things that are expensive to
  build **and** immutable (an engine, a compiled schema, a loaded model). A
  session-scoped fixture that holds mutable state is order-dependent flakiness.
- Fixtures compose: `order` depends on `session`, which depends on `engine`.
  Ask for what you need by name; do not build the world in one mega-fixture.
- `yield` fixtures for teardown; the code after `yield` runs even when the test
  fails.
- `conftest.py` per directory for fixtures that belong to that layer; a
  600-line root `conftest.py` is a sign the layers are not separated.
- `autouse=True` is a global; use it for things every test genuinely needs
  (freezing the clock, disabling network) and nothing else.

---

# Parametrize, don't loop

```python
@pytest.mark.parametrize(("qty", "discount"), [
    (0, 0), (1, 0), (9, 0), (10, 100), (11, 110),
], ids=["zero", "one", "below", "threshold", "above"])
def test_bulk_discount(qty: int, discount: int) -> None:
    assert discount_for(qty) == discount
```

- One case per parameter set, each reported and re-runnable by id
  (`-k threshold`). A `for` loop inside a test stops at the first failure and
  hides the rest.
- `ids=` for readable failures; the default `qty0-discount0` tells you nothing.
- `pytest.param(..., marks=pytest.mark.xfail(reason="#123"))` for a known
  failing case inside the table, instead of deleting it.

---

# Markers and selection

```bash
pytest -m "not slow and not integration"     # the pre-commit run
pytest -m integration                        # CI job with the database
pytest --lf                                  # only what failed last time
pytest -x --ff                               # stop at first, run failures first
```

- Declare every marker in config. Markers are the contract between the suite
  and CI; undeclared ones are noise.
- `@pytest.mark.skipif(sys.platform == "win32", reason="...")` with a reason,
  always. A bare `skip` is a test that quietly stopped existing.

---

# Mocking at boundaries you own

```python
def test_sends_receipt(order, mailer_spy):                 # fake of OUR interface
    send_receipt(order, mailer=mailer_spy)
    assert mailer_spy.sent == [Receipt(order.id)]

def test_retries_on_timeout(monkeypatch):
    monkeypatch.setattr(payments, "charge", AsyncMock(side_effect=[TimeoutError, "ok"]))
```

- Fake the interface *you* defined (`Mailer`, `PaymentGateway`), not the vendor
  SDK. Mocking `stripe.Charge.create` tests your guess about Stripe's API.
- `monkeypatch` over `unittest.mock.patch` decorators: it undoes itself, works on
  env vars and attributes, and reads top-to-bottom.
- `AsyncMock` for async callables; a `Mock` returns a non-awaitable and the test
  passes for the wrong reason.
- Block real network in the suite (`pytest-socket`, or an autouse fixture that
  raises on `socket.connect`). A test that hits a real API is an outage waiting
  for CI. → `Testing/unit`

---

# Async tests

```toml
asyncio_mode = "auto"      # pytest-asyncio: every `async def test_*` just runs
```

```python
async def test_fetch_times_out(monkeypatch):
    with pytest.raises(TimeoutError):
        async with asyncio.timeout(0.01):
            await fetch_slow()
```

Await events and futures; never `await asyncio.sleep(0.2)` to let something
finish. Use `pytest.raises` with the specific exception, not `Exception`.
→ `Backend/python-async`

---

# Coverage and speed

```bash
pytest --cov=src --cov-report=term-missing --cov-fail-under=80   # a floor, not a target
pytest -n auto                                                    # pytest-xdist
pytest --durations=10                                             # find the slow ones
```

- Coverage is a diagnostic for *untested* code; 100% with assertion-free tests
  is worse than 70% with real assertions. Set a floor to stop regressions, then
  ignore the number.
- The unit run should finish in seconds. Anything slower is I/O leaking in:
  find it with `--durations`, mark it `slow` or `integration`, move the real
  work behind a fake.
- `-n auto` requires tests that do not share state — which the fixture rules
  above already guarantee.
- Freeze time (`freezegun`/`time-machine`) and seed randomness; a test that
  depends on the wall clock fails at midnight.

---

# Anti-patterns

| Anti-pattern | Why it fails | Fix |
| --- | --- | --- |
| Undeclared markers | Typos silently unselect tests | `--strict-markers` |
| Warnings allowed | Deprecations pile up until removal | `filterwarnings = ["error"]` |
| Session-scoped mutable fixture | Order-dependent flakes | Function scope, or immutable |
| One giant root `conftest.py` | Layers tangled | Per-directory `conftest.py` |
| `autouse` for convenience | Hidden global behaviour | Explicit fixture args |
| `for` loop over cases | First failure hides the rest | `parametrize` with `ids` |
| Bare `@pytest.mark.skip` | Test silently vanishes | `skipif` with a reason |
| Mocking the vendor SDK | Tests an assumption | Fake your own interface |
| `mock.patch` decorators stacked five deep | Unreadable, order-sensitive | `monkeypatch` |
| `Mock()` for async code | Returns non-awaitable | `AsyncMock` |
| Real network in tests | Flaky, slow, outages | Block sockets |
| `asyncio.sleep()` to wait | Slow and still flaky | Await an event |
| `pytest.raises(Exception)` | Passes on the wrong error | Specific exception |
| Coverage as a target | Assertion-free tests | Floor + mutation testing |
| Unit run over a minute | I/O leaked in | `--durations`, mark and move |
| Wall clock in tests | Fails at midnight/DST | Freeze time |

---

# Checklist

- [ ] Verify: `pyproject.toml` sets `--strict-markers`, `--strict-config`, `filterwarnings = ["error"]`, `xfail_strict`
- [ ] Verify: Every marker declared and used to split unit from integration runs
- [ ] Verify: Fixtures default to function scope; wider scope only for immutable, expensive resources
- [ ] Verify: Database tests run inside a rolled-back transaction fixture
- [ ] Verify: `conftest.py` per layer; `autouse` reserved for clock and network guards
- [ ] Verify: Tables of cases use `parametrize` with `ids`
- [ ] Verify: Every skip has a reason; every `xfail` references an issue
- [ ] Verify: Fakes target interfaces we own; vendor SDKs are never mocked directly
- [ ] Verify: `monkeypatch` and `AsyncMock` used; real network blocked
- [ ] Verify: `asyncio_mode = "auto"`; no real sleeps in async tests
- [ ] Verify: Coverage floor enforced; number treated as diagnostic
- [ ] Verify: Unit run finishes in seconds; `-n auto` works
- [ ] Verify: Time and randomness are controlled
