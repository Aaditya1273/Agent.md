---
targetModels:
  - "Claude Fable 5.1"
  - "Claude Opus 5"
  - "Claude Sonnet 5"
  - "Claude 5 Family"
  - "Future Claude Models"
name: flask
category: Backend
description: Flask application structure — the app factory, blueprints by feature, config classes, extension initialisation, request lifecycle hooks, error handlers, and when to reach for FastAPI instead.
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

Rules for a Flask service that is testable and does not collapse into one
`app.py`. Flask is a microframework: it decides nothing for you, so every
structural decision below is one it left open.

Python conventions are `Backend/python-conventions`; if the service is mostly
JSON with typed models, read the last section before choosing Flask.

---

</purpose>

# The app factory

<rules>

```python
# app/__init__.py
def create_app(config: type[Config] = ProdConfig) -> Flask:
    app = Flask(__name__)
    app.config.from_object(config)
    db.init_app(app)                       # extensions are module-level, bound here
    app.register_blueprint(orders_bp, url_prefix="/v1/orders")
    register_error_handlers(app)
    return app

# wsgi.py — the only place an app is instantiated for serving
app = create_app()
```

- No `app = Flask(__name__)` at module level anywhere else. A global app is
  configured at import time, cannot be built twice with different config, and
  makes every test share state.
- Extensions (`SQLAlchemy()`, `Migrate()`, `LoginManager()`) are created without
  an app and bound in the factory with `init_app`.
- Tests call `create_app(TestConfig)`.

---

</rules>

# Blueprints by feature

<rules>

```
app/
  orders/
    __init__.py     # bp = Blueprint("orders", __name__)
    routes.py       # HTTP only
    services.py     # rules; no `request` imported here
    schemas.py      # marshmallow / pydantic
  extensions.py     # db = SQLAlchemy(); migrate = Migrate()
```

```python
@bp.post("")
def create_order():
    data = OrderSchema().load(request.get_json(force=False, silent=False))
    order = services.create_order(actor=current_user, **data)
    return OrderSchema().dump(order), 201
```

The rule: **`request` and `g` do not leave `routes.py`.** A service that reads
`request.json` cannot run from a CLI command or a worker. Pass values in.

---

</rules>

# Config

<rules>

```python
class Config:
    SECRET_KEY = os.environ["SECRET_KEY"]                   # fail fast if missing
    SQLALCHEMY_DATABASE_URI = os.environ["DATABASE_URL"]
    MAX_CONTENT_LENGTH = 1 * 1024 * 1024                   # 1 MiB request cap
    SESSION_COOKIE_SECURE = True
    SESSION_COOKIE_HTTPONLY = True
    SESSION_COOKIE_SAMESITE = "Lax"

class TestConfig(Config):
    TESTING = True
    SQLALCHEMY_DATABASE_URI = "sqlite://"
```

- `os.environ["X"]` not `os.environ.get("X")` for required values; a `KeyError`
  at boot beats a `None` secret key in production.
- `MAX_CONTENT_LENGTH` is unset by default — set it, or a single request can
  exhaust memory.
- Never `app.config["DEBUG"] = True` in a config that could reach production;
  the Werkzeug debugger is remote code execution.

---

</rules>

# Request lifecycle

<rules>

```python
@app.before_request
def attach_request_id():
    g.request_id = request.headers.get("X-Request-Id") or uuid4().hex

@app.teardown_appcontext
def shutdown_session(exc):
    db.session.remove()            # return the connection; roll back on error
```

- `g` is per-request; use it for the request id, the current tenant, timing.
  Module globals for the same purpose leak between requests under threading.
- `teardown_appcontext` runs even when the view raised — put cleanup there, not
  in `after_request`, which is skipped on unhandled exceptions.
- Behind a proxy, wrap with `ProxyFix(app.wsgi_app, x_for=1, x_proto=1)` with the
  exact hop count; otherwise `request.remote_addr` is the proxy and rate limits
  key on one address for everyone. → `API/rate-limiting`

---

</rules>

# Error handlers

<rules>

```python
def register_error_handlers(app: Flask) -> None:
    @app.errorhandler(ValidationError)
    def bad_input(e):
        return {"error": "validation", "fields": e.messages}, 400

    @app.errorhandler(HTTPException)
    def http_error(e):
        return {"error": e.name.lower().replace(" ", "_")}, e.code

    @app.errorhandler(Exception)
    def unhandled(e):
        app.logger.exception("unhandled", extra={"request_id": g.get("request_id")})
        return {"error": "internal"}, 500
```

- Register a handler for `HTTPException` so `abort(404)` returns your JSON
  envelope, not Werkzeug's HTML page.
- The catch-all logs the traceback with the request id and returns a fixed body.
  A default 500 in a JSON API returns HTML to the client.
- Domain exceptions are raised in services and mapped here, once.
  → `Backend/error-handling`

---

</rules>

# Testing

<rules>

```python
@pytest.fixture
def client():
    app = create_app(TestConfig)
    with app.app_context():
        db.create_all()
        yield app.test_client()
        db.drop_all()

def test_create_order_requires_items(client):
    r = client.post("/v1/orders", json={"items": []})
    assert r.status_code == 400
    assert r.get_json()["error"] == "validation"
```

`app.test_client()` drives the WSGI app in-process — no port, parallel-safe.
Assert the error envelope, not just the status. → `Testing/pytest`

---

</rules>

# Flask or FastAPI

<rules>

| Choose Flask when | Choose FastAPI when |
| --- | --- |
| Server-rendered HTML with Jinja and sessions | The service is JSON-first |
| A large existing Flask codebase and team | You want typed models, DI and OpenAPI built in |
| Sync everything, simple deployment (gunicorn) | Endpoints await async drivers or fan out I/O |
| Extensions you already depend on | You would otherwise bolt on marshmallow + apispec |

Flask 2.x can `async def` a view, but it runs each one in a thread via
`asgiref`; it is not an async framework. If half your views are `async`, you
picked the wrong one. → `Backend/fastapi`

---

</rules>

# Anti-patterns

<antipatterns>

| Anti-pattern | Why it fails | Fix |
| --- | --- | --- |
| Module-level `app = Flask(__name__)` | Untestable, single config | App factory |
| Extensions bound at import | Same problem, plus circular imports | `init_app` in the factory |
| `request` used inside services | Not callable from CLI or workers | Pass values in |
| `os.environ.get("SECRET_KEY")` | `None` secret in production | `os.environ["..."]` |
| No `MAX_CONTENT_LENGTH` | Memory exhaustion by one request | Set a cap |
| `debug=True` reachable in prod | Remote code execution via debugger | Never in a prod config |
| Module globals for request state | Cross-request leakage | `g` |
| Cleanup in `after_request` | Skipped on exceptions | `teardown_appcontext` |
| No `HTTPException` handler | HTML error pages from a JSON API | Register one |
| Bare `except` returning 200 | Errors disappear | Handler that logs and returns 500 |
| No `ProxyFix` behind a proxy | Wrong client IP everywhere | `ProxyFix` with hop count |
| Fifty routes in `app.py` | Unnavigable | Blueprints by feature |
| `async def` views everywhere | Thread-per-view, not async | FastAPI |

---

</antipatterns>

# Checklist

<checklist>

- [ ] `create_app(config)` factory; no module-level app
- [ ] Extensions created bare and bound with `init_app`
- [ ] One blueprint per feature with `routes.py`/`services.py` split
- [ ] `request` and `g` never imported by services
- [ ] Required config read with `os.environ["X"]`
- [ ] `MAX_CONTENT_LENGTH` and secure cookie flags set
- [ ] Debug mode impossible in production config
- [ ] Request id attached in `before_request` and logged
- [ ] Session cleanup in `teardown_appcontext`
- [ ] `ProxyFix` applied with the exact proxy count
- [ ] Handlers registered for `ValidationError`, `HTTPException`, `Exception`
- [ ] Tests use `create_app(TestConfig)` and `test_client()`
- [ ] Framework choice justified against the Flask/FastAPI table

</checklist>
