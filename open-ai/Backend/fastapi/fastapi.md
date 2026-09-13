---
targetModels:
  - "GPT-6 Astra"
  - "GPT-5.6"
  - "GPT-5.5"
  - "GPT-5 Family"
  - "Future GPT Models"
name: fastapi
category: Backend
description: FastAPI application structure — routers by feature, dependency injection, Pydantic at the boundary, async versus sync endpoints, background work, error handling, and an OpenAPI spec worth publishing.
license: MIT
author: Agent.md maintainers
last-verified: 2026-09-13
reviewed-by: unreviewed
---
<!-- Generated from models/_canonical by scripts/build-model-variants.js.
     Edit the canonical source, not this file. Structure adapted for ChatGPT per deep-research.md. -->


# Purpose

Rules for building a FastAPI service that stays fast and testable past the first
hundred endpoints. FastAPI gives you validation, DI and docs for free; the cost is
that a wrong choice about `async` or a leaked ORM model is invisible until load.

Model design is `Backend/pydantic`; event-loop rules are `Backend/python-async`;
the ORM is `Database/sqlalchemy`.

---

# App factory and feature routers

```python
# app/main.py — builds the app. No engine creation at import time.
def create_app(settings: Settings) -> FastAPI:
    app = FastAPI(title="Orders", version=settings.version, lifespan=lifespan)
    app.include_router(orders.router, prefix="/v1/orders", tags=["orders"])
    app.include_router(health.router)
    return app

# app/orders/router.py
router = APIRouter()

@router.post("", status_code=201, response_model=OrderOut)
async def create_order(body: OrderIn, svc: OrderService = Depends(get_order_service)) -> OrderOut:
    return await svc.create(body)
```

- One `APIRouter` per feature; mount with `prefix` and `tags` at include time,
  not inside the router, so the same router can be mounted under `/v2` later.
- Open connections in `lifespan`, never at module import: importing `main.py`
  from a test must not connect to Postgres.
- Return `create_app(...)` from a factory so tests build an app with test settings.

---

# Dependencies, not globals

```python
def get_session(request: Request) -> Iterator[Session]:
    with request.app.state.sessionmaker() as session:
        yield session            # code after yield runs after the response

def get_order_service(session: Session = Depends(get_session)) -> OrderService:
    return OrderService(OrderRepo(session))

# tests
app.dependency_overrides[get_session] = lambda: fake_session
```

`Depends` is the seam. A handler that reaches for a module-level `engine` cannot be
tested without one, and cannot be given a per-request transaction. Put the
`commit` in the dependency's teardown or the service — never in the handler.

`Annotated[Session, Depends(get_session)]` is the modern spelling and lets you
alias it once: `SessionDep = Annotated[Session, Depends(get_session)]`.

---

# Pydantic at the boundary, ORM in the middle

```python
class OrderIn(BaseModel):
    model_config = ConfigDict(extra="forbid")
    items: list[LineItem] = Field(min_length=1)

class OrderOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    total_cents: int

@router.get("/{order_id}", response_model=OrderOut)
async def get_order(order_id: int, svc: ServiceDep) -> OrderOut: ...
```

- Separate `In` and `Out` models. Returning the ORM model leaks columns the
  moment someone adds one (`password_hash`, `internal_notes`).
- `extra="forbid"` on input: a typo'd field is a `422`, not silently ignored.
- Always set `response_model` (or the return annotation) — it is what filters the
  output and what the OpenAPI schema documents.

---

# `async def` versus `def`

| Handler body | Declare as | Why |
| --- | --- | --- |
| `await`s an async driver (`asyncpg`, `httpx.AsyncClient`) | `async def` | Runs on the loop |
| Calls a sync library (`requests`, sync SQLAlchemy, `boto3`) | `def` | FastAPI runs it in the threadpool |
| Pure CPU work (hashing, PDF render) | `def`, or offload | Anything else blocks the loop |

An `async def` handler that calls `requests.get()` blocks **every** request on
the server for the duration of that call. This is the most common FastAPI
performance bug and it does not show up until concurrency. If in doubt, use
`def`; the threadpool default is 40 workers.

`await run_in_threadpool(cpu_bound)` for the occasional blocking call inside an
otherwise async handler. → `Backend/python-async`

---

# Background work

```python
@router.post("/{order_id}/receipt", status_code=202)
async def send_receipt(order_id: int, tasks: BackgroundTasks, mailer: MailerDep):
    tasks.add_task(mailer.send_receipt, order_id)
    return {"queued": True}
```

`BackgroundTasks` runs **in-process after the response**; it dies with the
worker and has no retry. Use it for best-effort work under a second. Anything
that must happen — payments, emails that matter, exports — goes to a real queue.
→ `Backend/background-jobs`

---

# Errors

```python
class OrderNotFound(Exception): ...

@app.exception_handler(OrderNotFound)
async def order_not_found(_: Request, exc: OrderNotFound) -> JSONResponse:
    return JSONResponse(status_code=404, content={"detail": "order not found"})
```

- Raise domain exceptions in services; map them to HTTP in one exception handler
  per type. `raise HTTPException(...)` inside a service couples it to HTTP.
- Override the `RequestValidationError` handler if your API has an error envelope;
  otherwise clients get FastAPI's default shape for `422` and yours for
  everything else.
- Never let a raw `500` traceback reach the client: `debug=False` in production
  and a catch-all handler that logs with the request id. → `Backend/error-handling`

---

# Settings

```python
class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_prefix="APP_", env_file=".env")
    database_url: PostgresDsn
    debug: bool = False

@lru_cache
def get_settings() -> Settings:
    return Settings()
```

Read the environment once, validate it once, inject it with `Depends(get_settings)`.
A missing `APP_DATABASE_URL` should fail at startup, not on the first query.

---

# OpenAPI hygiene

- Every route: `summary`, `response_model`, and `responses={404: {...}}` for the
  error codes it actually returns. The generated spec is your client contract.
- Use `tags` per feature and `operation_id`s that make good client method names
  (`create_order`, not `create_order_v1_orders_post`); set
  `generate_unique_id_function` once on the app.
- Disable `/docs` and `/openapi.json` on internal services that should not be
  enumerable: `FastAPI(docs_url=None, openapi_url=None)`.

---

# Testing

```python
@pytest.fixture
def client(fake_session):
    app = create_app(Settings(database_url="postgresql://test"))
    app.dependency_overrides[get_session] = lambda: fake_session
    with TestClient(app) as c:      # runs lifespan
        yield c

def test_create_order_rejects_unknown_field(client):
    r = client.post("/v1/orders", json={"items": [], "bogus": 1})
    assert r.status_code == 422
```

`TestClient` as a context manager runs `lifespan`; without the `with` your
startup code never executes. For async handlers that need a real loop, use
`httpx.AsyncClient(transport=ASGITransport(app=app))`. → `Testing/pytest`

---

# Anti-patterns

| Anti-pattern | Why it fails | Fix |
| --- | --- | --- |
| Engine or client created at import | Tests and imports hit the network | Create in `lifespan` |
| Module-level `engine` used in handlers | Untestable, no per-request transaction | `Depends(get_session)` |
| `async def` calling `requests` or sync ORM | Blocks the event loop for everyone | `def`, or an async driver |
| Returning the ORM object | Leaks new columns automatically | Separate `Out` model |
| No `extra="forbid"` on input | Typos silently ignored | Forbid extras |
| `HTTPException` raised in a service | Service coupled to HTTP | Domain exception + handler |
| `BackgroundTasks` for must-happen work | Lost on worker death, no retry | A real queue |
| `Settings()` constructed per request | Re-reads env and files each call | `@lru_cache` |
| `TestClient(app)` without `with` | `lifespan` never runs | Context manager |
| Commit inside the handler | Duplicated in every route | Dependency teardown or service |
| Auto-generated `operation_id`s | Unusable client method names | Set an id function |
| `/docs` exposed on internal services | Free API enumeration | `docs_url=None` |

---

# Checklist

- [ ] `create_app(settings)` factory; no connections at import time
- [ ] One `APIRouter` per feature, mounted with `prefix` and `tags`
- [ ] Resources opened in `lifespan` and injected via `Depends`
- [ ] Every input model sets `extra="forbid"`
- [ ] Every route has a `response_model` distinct from the ORM model
- [ ] Handlers calling sync libraries are `def`, not `async def`
- [ ] `BackgroundTasks` used only for best-effort work
- [ ] Domain exceptions mapped to HTTP in exception handlers
- [ ] `RequestValidationError` handler matches the API's error envelope
- [ ] Settings validated once at startup and cached
- [ ] Routes declare `summary`, `responses`, and stable `operation_id`s
- [ ] Docs disabled on services that must not be enumerable
- [ ] Tests use `dependency_overrides` and `TestClient` as a context manager
