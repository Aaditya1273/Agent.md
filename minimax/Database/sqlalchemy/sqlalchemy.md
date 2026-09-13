---
targetModels:
  - "MiniMax M3"
  - "MiniMax M2"
  - "MiniMax M Family"
  - "Future MiniMax Models"
name: sqlalchemy
category: Database
description: SQLAlchemy 2.0 done properly — declarative models with typed columns, one session per unit of work, explicit transactions, loading strategies that avoid N+1, Alembic migrations that are reviewed, and the async engine without the deadlocks.
license: MIT
author: Agent.md maintainers
last-verified: 2026-09-13
reviewed-by: unreviewed
---
<!-- Generated from models/_canonical by scripts/build-model-variants.js.
     Edit the canonical source, not this file. Behavioural profile for MiniMax: scripts/model-profiles.json -->

## Scope contract
FILE_ISOLATION: Modify only files inside the scope the task names; report any out-of-scope change instead of making it.

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

- `Mapped[...]` + `mapped_column()` — typed, and the type checker sees it.
  `Column()` on a declarative class is the 1.x style.
- Constraints and indexes are named. Auto-generated names differ per backend and
  make Alembic diffs unstable.
- `server_default` for timestamps so rows inserted outside the ORM get one too.
- `ondelete` on the foreign key, explicitly. `RESTRICT` makes deletion a decision;
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

- **One session per unit of work**, opened by the caller (request, job, CLI
  command) and passed in. A module-level session shared across requests is a
  race and a memory leak.
- `sessionmaker.begin()` is the transaction. Do not sprinkle `session.commit()`
  through the service; one commit at the boundary means partial writes cannot
  happen.
- `expire_on_commit=False` when you return ORM objects past the commit;
  otherwise the first attribute access after commit issues a `SELECT`, or fails
  if the session is closed.
- `flush()` to get generated keys mid-transaction; never `commit()` for that.
- The engine is created once per process, at startup, with a pool sized to the
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

- Lazy loading is the N+1. Declare loads on the statement, or set
  `lazy="raise"` on relationships so an unplanned load fails loudly in tests
  instead of silently costing 500 queries in production.
- `session.scalars(select(...))` returns ORM objects; `session.execute()` returns
  rows. Do not `.all()` a million rows — `yield_per(1000)` for streaming.
- Bulk changes: `session.execute(update(Order).where(...).values(...))`, not a
  loop of loads and saves.
- Assert query counts in tests with an event listener on `before_cursor_execute`;
  it is the only reliable N+1 detector. → `Database/query-optimization`

---

# Migrations with Alembic

```bash
alembic revision --autogenerate -m "orders: add status index"
# then READ the generated file before committing it
```

- Autogenerate is a draft. It misses `CHECK` constraints on some backends,
  renames appear as drop+add (data loss), and enum changes need hand-written
  `ALTER TYPE`. Review every revision.
- Every revision has a working `downgrade()`; "irreversible" is a decision that
  needs a comment, not a `pass`.
- Adding an index on a large Postgres table: `op.create_index(...,
  postgresql_concurrently=True)` inside `with op.get_context().autocommit_block()`.
  A plain `CREATE INDEX` locks writes for the duration.
- Data migrations use `op.get_bind()` with core statements, not the ORM models —
  the models describe the schema *after* the migration.
- `alembic check` (or `--autogenerate` producing an empty diff) in CI catches a
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

- `expire_on_commit=False` is mandatory: an expired attribute would trigger an
  implicit **sync** load inside async code and raise `MissingGreenlet`.
- Lazy loading does not work in async. Every relationship you touch must be
  eager-loaded on the statement, or explicitly `await session.refresh(obj,
  ["items"])`.
- The async driver must be async: `asyncpg` or `psycopg` v3 async. A sync driver
  behind `create_async_engine` fails at connect.
- Do not share an `AsyncSession` across tasks; one session per task, sessions
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

- [ ] Verify: Models use `Mapped[...]`/`mapped_column`; queries use `select()`
- [ ] Verify: Every constraint and index has an explicit name
- [ ] Verify: Foreign keys set `ondelete` deliberately
- [ ] Verify: Engine created once per process with a sized pool
- [ ] Verify: One session per unit of work, passed in, transaction via `begin()`
- [ ] Verify: `expire_on_commit=False` where objects outlive the commit
- [ ] Verify: Loading strategies declared per statement; `lazy="raise"` in tests
- [ ] Verify: Bulk writes use `update()`/`insert()` statements
- [ ] Verify: Query counts asserted in integration tests
- [ ] Verify: Every Alembic revision is read, named, and has a `downgrade()`
- [ ] Verify: Large-table indexes created concurrently
- [ ] Verify: `alembic check` runs in CI
- [ ] Verify: Async sessions never lazy-load and are never shared across tasks
- [ ] Verify: Tests run against the production engine inside a rolled-back transaction
