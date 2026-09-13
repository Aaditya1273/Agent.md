---
targetModels:
  - "Qwen3.8-Max"
  - "Qwen3.8-Flash-Next"
  - "Qwen3.8-27B"
  - "Qwen3.8 Family"
  - "Future Qwen Models"
name: sqlalchemy
category: Database
description: SQLAlchemy 2.0 done properly — declarative models with typed columns, one session per unit of work, explicit transactions, loading strategies that avoid N+1, Alembic migrations that are reviewed, and the async engine without the deadlocks.
license: MIT
author: Agent.md maintainers
last-verified: 2026-09-13
reviewed-by: unreviewed
---
<!-- Generated from models/_canonical by scripts/build-model-variants.js.
     Edit the canonical source, not this file. Behavioural profile for Qwen: scripts/model-profiles.json -->

## Task boundary
1. Implement only what the task names; no extra abstractions or files.
2. English-only comments and identifiers.
3. Stop when the checklist passes.

---

# Purpose

Rules for SQLAlchemy 2.x. The 2.0 API is `select()`-based and typed; the 1.x
`session.query()` style still runs but hides the loading behaviour that causes
most production incidents.

Schema decisions are `Database/schema-design`; indexing is `Database/indexes`;
event-loop rules are `Backend/python-async`.

---

# Models

```python
class Base(DeclarativeBase): ...

class Order(Base):
    __tablename__ = "orders"
    __table_args__ = (
        CheckConstraint("total_cents >= 0", name="ck_orders_total_nonneg"),
        Index("ix_orders_tenant_created", "tenant_id", "created_at"),
    )
    id: Mapped[int] = mapped_column(primary_key=True)
    tenant_id: Mapped[int] = mapped_column(ForeignKey("tenants.id", ondelete="RESTRICT"), index=True)
    status: Mapped[OrderStatus] = mapped_column(Enum(OrderStatus, native_enum=False))
    total_cents: Mapped[int]
    created_at: Mapped[datetime] = mapped_column(server_default=func.now())
    items: Mapped[list["LineItem"]] = relationship(back_populates="order", cascade="all, delete-orphan")
```

1. `Mapped[...]` + `mapped_column()` — typed, and the type checker sees it.
  `Column()` on a declarative class is the 1.x style.
2. Constraints and indexes are named. Auto-generated names differ per backend and
  make Alembic diffs unstable.
3. `server_default` for timestamps so rows inserted outside the ORM get one too.
4. `ondelete` on the foreign key, explicitly. `RESTRICT` makes deletion a decision;
  a silent `CASCADE` from a tenant deletes history.

---

# Sessions and transactions

```python
SessionLocal = sessionmaker(engine, expire_on_commit=False)

def create_order(data: OrderIn) -> Order:
    with SessionLocal.begin() as session:      # commit on success, rollback on error
        order = Order(...)
        session.add(order)
        session.flush()                          # get order.id without committing
        session.add_all(LineItem(order_id=order.id, ...) for i in data.items)
        return order                             # committed when the block exits
```

1. **One session per unit of work**, opened by the caller (request, job, CLI
  command) and passed in. A module-level session shared across requests is a
  race and a memory leak.
2. `sessionmaker.begin()` is the transaction. Do not sprinkle `session.commit()`
  through the service; one commit at the boundary means partial writes cannot
  happen.
3. `expire_on_commit=False` when you return ORM objects past the commit;
  otherwise the first attribute access after commit issues a `SELECT`, or fails
  if the session is closed.
4. `flush()` to get generated keys mid-transaction; never `commit()` for that.
5. The engine is created once per process, at startup, with a pool sized to the
  database's connection limit divided by the number of processes.

---

# Queries and loading

```python
stmt = (
    select(Order)
    .where(Order.tenant_id == tenant_id, Order.status == OrderStatus.OPEN)
    .options(selectinload(Order.items).selectinload(LineItem.product))
    .order_by(Order.created_at.desc())
    .limit(50)
)
orders = session.scalars(stmt).all()
```

| Strategy | Use for | Effect |
| --- | --- | --- |
| `selectinload` | Collections (one-to-many, many-to-many) | 1 extra query per level, no row explosion |
| `joinedload` | Single objects (many-to-one, one-to-one) | One `JOIN` |
| `raiseload("*")` | Default in tests and services | Any unplanned lazy load raises |
| lazy (default) | Nothing in request code | N+1 |

1. Lazy loading is the N+1. Declare loads on the statement, or set
  `lazy="raise"` on relationships so an unplanned load fails loudly in tests
  instead of silently costing 500 queries in production.
2. `session.scalars(select(...))` returns ORM objects; `session.execute()` returns
  rows. Do not `.all()` a million rows — `yield_per(1000)` for streaming.
3. Bulk changes: `session.execute(update(Order).where(...).values(...))`, not a
  loop of loads and saves.
4. Assert query counts in tests with an event listener on `before_cursor_execute`;
  it is the only reliable N+1 detector. → `Database/query-optimization`

---

# Migrations with Alembic

```bash
alembic revision --autogenerate -m "orders: add status index"
# then READ the generated file before committing it
```

1. Autogenerate is a draft. It misses `CHECK` constraints on some backends,
  renames appear as drop+add (data loss), and enum changes need hand-written
  `ALTER TYPE`. Review every revision.
2. Every revision has a working `downgrade()`; "irreversible" is a decision that
  needs a comment, not a `pass`.
3. Adding an index on a large Postgres table: `op.create_index(...,
  postgresql_concurrently=True)` inside `with op.get_context().autocommit_block()`.
  A plain `CREATE INDEX` locks writes for the duration.
4. Data migrations use `op.get_bind()` with core statements, not the ORM models —
  the models describe the schema *after* the migration.
5. `alembic check` (or `--autogenerate` producing an empty diff) in CI catches a
  model change without a migration. → `Database/migration`

---

# Async engine

```python
engine = create_async_engine(url, pool_size=10, max_overflow=5)
AsyncSessionLocal = async_sessionmaker(engine, expire_on_commit=False)

async def get_open(session: AsyncSession, tenant_id: int) -> list[Order]:
    stmt = select(Order).where(...).options(selectinload(Order.items))
    return (await session.scalars(stmt)).all()
```

1. `expire_on_commit=False` is mandatory: an expired attribute would trigger an
  implicit **sync** load inside async code and raise `MissingGreenlet`.
2. Lazy loading does not work in async. Every relationship you touch must be
  eager-loaded on the statement, or explicitly `await session.refresh(obj,
  ["items"])`.
3. The async driver must be async: `asyncpg` or `psycopg` v3 async. A sync driver
  behind `create_async_engine` fails at connect.
4. Do not share an `AsyncSession` across tasks; one session per task, sessions
  are not concurrency-safe.

---

# Testing

```python
@pytest.fixture
def session(engine):
    conn = engine.connect(); tx = conn.begin()
    s = Session(bind=conn, join_transaction_mode="create_savepoint")
    yield s
    s.close(); tx.rollback(); conn.close()      # every test starts clean
```

Wrap each test in an outer transaction that rolls back; the service under test
can `commit()` freely inside a savepoint. Test against the real database engine
(Postgres in a container), not SQLite — constraints, enums and `RETURNING`
differ. → `Testing/integration`

---

# Anti-patterns

| Anti-pattern | Why it fails | Fix |
| --- | --- | --- |
| `Column()` / `session.query()` | 1.x style, weakly typed | `Mapped`, `select()` |
| Unnamed constraints and indexes | Unstable Alembic diffs | Name everything |
| Module-level shared session | Cross-request state, leaks | Session per unit of work |
| `commit()` scattered through services | Partial writes | One `begin()` at the boundary |
| `commit()` to get an id | Ends the transaction early | `flush()` |
| Default `expire_on_commit=True` with returned objects | Post-commit `SELECT` or error | `False` |
| Lazy loads in request code | N+1 | `selectinload`/`joinedload`, `raiseload` |
| `joinedload` on collections | Row explosion | `selectinload` |
| `.all()` on unbounded queries | Memory | `limit`, `yield_per` |
| Loop of load/modify/save | N updates | `update()` statement |
| Committing autogenerate unread | Drop+add renames lose data | Review every revision |
| `CREATE INDEX` without `CONCURRENTLY` | Locks writes on big tables | Concurrent index |
| ORM models in data migrations | Describe the wrong schema | Core statements via `get_bind()` |
| Async session with lazy loads | `MissingGreenlet` | Eager-load everything |
| One `AsyncSession` across tasks | Not concurrency-safe | Session per task |
| Tests on SQLite for a Postgres app | Different semantics | Real engine in a container |

---

# Checklist

- [ ] Models use `Mapped[...]`/`mapped_column`; queries use `select()`
- [ ] Every constraint and index has an explicit name
- [ ] Foreign keys set `ondelete` deliberately
- [ ] Engine created once per process with a sized pool
- [ ] One session per unit of work, passed in, transaction via `begin()`
- [ ] `expire_on_commit=False` where objects outlive the commit
- [ ] Loading strategies declared per statement; `lazy="raise"` in tests
- [ ] Bulk writes use `update()`/`insert()` statements
- [ ] Query counts asserted in integration tests
- [ ] Every Alembic revision is read, named, and has a `downgrade()`
- [ ] Large-table indexes created concurrently
- [ ] `alembic check` runs in CI
- [ ] Async sessions never lazy-load and are never shared across tasks
- [ ] Tests run against the production engine inside a rolled-back transaction
