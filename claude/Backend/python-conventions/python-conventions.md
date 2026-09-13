---
targetModels:
  - "Claude Fable 5.1"
  - "Claude Opus 5"
  - "Claude Sonnet 5"
  - "Claude 5 Family"
  - "Future Claude Models"
name: python-conventions
category: Backend
description: Modern Python project conventions — typing that pays for itself, pyproject.toml as the single manifest, uv and ruff, package layout, logging, exception design, when a dataclass is enough, and environments that are reproducible.
license: MIT
author: Agent.md maintainers
last-verified: 2026-09-13
reviewed-by: unreviewed
---
<!-- Generated from models/_canonical by scripts/build-model-variants.js.
     Edit the canonical source, not this file. Structure adapted for Claude per deep-research.md. -->
# Purpose

<purpose>
Rules for a Python 3.12+ codebase that a second engineer can pick up without
archaeology. Python will let you skip all of these; the cost arrives at the first
refactor.

Framework rules are `Backend/fastapi`, `Backend/django`, `Backend/flask`;
concurrency is `Backend/python-async`.

---
</purpose>

# One manifest: `pyproject.toml`

<rules>
```toml
[project]
name = "orders"
version = "1.4.0"
requires-python = ">=3.12"
dependencies = ["fastapi>=0.110,<1", "sqlalchemy>=2,<3"]

[project.optional-dependencies]
dev = ["pytest", "ruff", "mypy"]

[tool.ruff]
line-length = 100
[tool.ruff.lint]
select = ["E", "F", "I", "B", "UP", "S", "N"]

[tool.mypy]
strict = true
```

- `requirements.txt`, `setup.py`, `setup.cfg`, `.flake8`, `.isort.cfg` all fold
  into this one file. Two manifests drift.
- Pin a **lockfile** (`uv.lock`) and commit it; keep `dependencies` as ranges.
  A range without a lock is a different build every day; a pin without a range
  blocks every security patch.
- `uv` for installs and venvs (`uv sync`, `uv run pytest`); it is an order of
  magnitude faster than pip and produces the lock. If pip, then
  `pip-compile` — never hand-edit a lock.

---
</rules>

# Layout

<rules>
```
src/orders/          # src layout: tests cannot import the package by accident
  __init__.py
  api/  services/  repos/  models.py  settings.py
tests/
  conftest.py  test_orders.py
pyproject.toml  uv.lock  README.md
```

- `src/` layout, installed editable (`uv pip install -e .`). A flat layout lets
  `import orders` succeed from the repo root without installing, which hides
  packaging bugs until CI.
- No `utils.py`. A module named for what it does (`money.py`, `dates.py`) is
  findable; `utils` becomes a junk drawer by the third commit.
- `__init__.py` re-exports the public surface and nothing else; no side effects
  at import time (no connections, no config loading).

---
</rules>

# Typing

<rules>
```python
def total[T: (int, Decimal)](items: Sequence[LineItem[T]]) -> T: ...      # PEP 695

type OrderId = NewType("OrderId", int)                                    # PEP 695 alias
def load(id: OrderId) -> Order | None: ...                                # not Optional[Order]

def parse(raw: dict[str, Any]) -> Order: ...   # Any only at the untyped edge
```

- `mypy --strict` (or pyright strict) in CI from day one; retrofitting strictness
  onto an untyped codebase is a month of work.
- Builtin generics (`list[int]`, `dict[str, Any]`) and `X | None`; the `typing`
  spellings (`List`, `Optional`) are legacy.
- `Any` is an admission, not a type. It is acceptable at the boundary where data
  is genuinely untyped, and nowhere inside.
- `Protocol` for structural interfaces you own; `ABC` only when you need the
  runtime `isinstance`.
- `TypedDict` for dict-shaped data you cannot change; a `dataclass` or Pydantic
  model for data you can.

---
</rules>

# Dataclass or Pydantic

<rules>
| Use a `@dataclass` | Use a Pydantic model |
| --- | --- |
| Internal value objects built from trusted data | Anything parsed from a request, file, env, or queue |
| Performance-sensitive hot paths | You need `.model_dump()`/JSON schema |
| No validation needed beyond types | Constraints, coercion, aliases |

`@dataclass(frozen=True, slots=True)` is the default internal record: immutable,
memory-light, hashable. Reaching for Pydantic for every internal object taxes
every construction with validation you already did. → `Backend/pydantic`

---
</rules>

# Exceptions

<rules>
```python
class OrdersError(Exception): """Base for this package."""
class OrderNotFound(OrdersError): ...
class InsufficientStock(OrdersError):
    def __init__(self, sku: str, wanted: int, have: int) -> None:
        super().__init__(f"{sku}: wanted {wanted}, have {have}")
        self.sku, self.wanted, self.have = sku, wanted, have
```

- One base exception per package; callers catch the base, tests catch the leaf.
- Carry data as attributes, not only in the message string.
- `raise ... from err` to chain; a bare `raise` inside `except` to re-raise.
  `raise NewError(str(err))` throws away the traceback.
- Never `except Exception: pass`. Catch what you can handle; let the rest
  propagate to the one place that logs and converts. → `Backend/error-handling`

---
</rules>

# Logging

<rules>
```python
log = logging.getLogger(__name__)
log.info("order created", extra={"order_id": order.id, "tenant": tenant.id})
```

- `logging.getLogger(__name__)` per module; never `print` in library code.
- Structured fields via `extra`, formatted as JSON by one handler configured in
  the entrypoint (`dictConfig`), not in every module.
- `log.exception(...)` inside `except` — it attaches the traceback.
- Log at `INFO` for business events, `WARNING` for handled failures, `ERROR`
  for unhandled. `DEBUG` is for you, and off in production.

---
</rules>

# Environments

<rules>
- One virtualenv per project, created by `uv venv` or `python -m venv`; never
  install into the system interpreter.
- `.python-version` pins the interpreter; CI uses the same one.
- Secrets from the environment, never from a committed file. `.env` is for local
  development and is gitignored. → `Security/secret-management`

---
</rules>

# Tooling in CI

<rules>
```bash
uv sync --frozen            # fails if the lock is stale
ruff check . && ruff format --check .
mypy src
pytest -q
```

`ruff` replaces flake8, isort, pyupgrade and black; one tool, one config, sub-second.
Enable the `S` (bandit) and `B` (bugbear) rule sets — they catch real bugs, not
style. → `Testing/pytest`

---
</rules>

# Anti-patterns

<antipatterns>
| Anti-pattern | Why it fails | Fix |
| --- | --- | --- |
| `requirements.txt` + `setup.py` + `pyproject.toml` | Three sources of truth drift | `pyproject.toml` only |
| Ranges with no lockfile | Non-reproducible builds | Commit `uv.lock` |
| Exact pins as `dependencies` | Blocks every patch release | Ranges + lock |
| Flat layout | Untested packaging | `src/` layout |
| `utils.py` | Junk drawer | Modules named by purpose |
| Side effects in `__init__.py` | Import time does I/O | Move to an entrypoint |
| `Optional[X]`, `List[X]` | Legacy spellings | `X | None`, `list[X]` |
| `Any` inside the core | Type checker disabled by stealth | Only at the edge |
| Pydantic for every internal object | Validation tax on hot paths | `@dataclass(frozen=True, slots=True)` |
| `except Exception: pass` | Errors vanish | Catch what you handle |
| `raise NewError(str(e))` | Traceback lost | `raise ... from e` |
| `print()` for diagnostics | Unstructured, unfilterable | `logging` with `extra` |
| Installing into the system Python | Version conflicts across projects | A venv per project |
| Committed `.env` | Secrets in history | Environment + gitignore |

---
</antipatterns>

# Checklist

<checklist>
- [ ] `pyproject.toml` is the only manifest; `requires-python` set
- [ ] Lockfile committed; CI installs with `--frozen`
- [ ] `src/` layout, package installed editable
- [ ] No `utils.py`; no I/O at import time
- [ ] `mypy --strict` (or pyright strict) passes in CI
- [ ] Builtin generics and `X | None` throughout
- [ ] `Any` appears only at untyped boundaries
- [ ] Internal records are frozen, slotted dataclasses; boundaries use Pydantic
- [ ] One base exception per package; leaves carry data as attributes
- [ ] Exceptions chained with `from`; no silent `except`
- [ ] `logging.getLogger(__name__)` with structured `extra`; no `print`
- [ ] `ruff` with `S` and `B` rule sets enabled
- [ ] `.python-version` pinned; secrets come from the environment
</checklist>
