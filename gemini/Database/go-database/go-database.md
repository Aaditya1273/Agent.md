---
targetModels:
  - "Gemini 3.8 Flash"
  - "Gemini 3.7 Flash"
  - "Gemini 3.1 Pro"
  - "Gemini 3 Family"
  - "Future Gemini Models"
name: go-database
category: Database
description: Database access from Go — database/sql and pgx, pool sizing, transactions that always resolve, sqlc versus ORMs, migrations, scanning, and context deadlines on every query.
license: MIT
author: Agent.md maintainers
last-verified: 2026-09-13
reviewed-by: unreviewed
---
<!-- Generated from models/_canonical by scripts/build-model-variants.js.
     Edit the canonical source, not this file. Structure adapted for Gemini per deep-research.md. -->


# Purpose

Rules for talking to a relational database from Go. The standard library gives
you a pool and a driver interface; the mistakes come from treating the pool
like a connection, forgetting that a transaction must end, and reaching for an
ORM to avoid writing SQL you were going to write anyway.

Schema and index design are `Database/schema-design` and `Database/indexes`;
Postgres specifics are `Database/postgres`.

---

# The pool is the connection

```go
db, err := sql.Open("pgx", cfg.DatabaseURL)     // does NOT connect
if err != nil { return err }
db.SetMaxOpenConns(20)
db.SetMaxIdleConns(10)
db.SetConnMaxLifetime(30 * time.Minute)
db.SetConnMaxIdleTime(5 * time.Minute)
if err := db.PingContext(ctx); err != nil {     // this connects; fail fast at startup
    return fmt.Errorf("database: %w", err)
}
```

- `*sql.DB` is a pool, safe for concurrent use, created once in `main` and
  passed down. **Never** open one per request or per package.
- `sql.Open` validates nothing. `PingContext` at startup turns a wrong URL into
  a startup failure instead of a first-request failure.
- Size `MaxOpenConns` below the server's limit divided by your replica count.
  Postgres defaults to 100 connections total; ten replicas at 20 each is already
  200.
- `ConnMaxLifetime` under the load balancer's or proxy's idle timeout prevents
  "connection reset" on a stale socket.

---

# Every query takes a context

```go
ctx, cancel := context.WithTimeout(ctx, 3*time.Second)
defer cancel()

var o Order
err := db.QueryRowContext(ctx,
    `SELECT id, total_cents FROM orders WHERE id = $1 AND tenant_id = $2`,
    id, tenantID,
).Scan(&o.ID, &o.TotalCents)
switch {
case errors.Is(err, sql.ErrNoRows):
    return Order{}, ErrNotFound
case err != nil:
    return Order{}, fmt.Errorf("get order %s: %w", id, err)
}
```

- Use the `…Context` variants exclusively. `db.Query` with no context cannot be
  cancelled and will hold a pool slot while a client waits on a dead request.
- Parameters are always placeholders (`$1` in pgx, `?` in MySQL). String
  concatenation into SQL is injection, full stop. → `Security/sql-injection`
- Translate `sql.ErrNoRows` to your own sentinel at the store boundary.
  → `Backend/go-errors`
- `rows.Close()` after `Query`, and check `rows.Err()` after the loop — an error
  mid-iteration is otherwise silent.

---

# Transactions must always resolve

```go
func (s *Store) Place(ctx context.Context, o Order) (err error) {
    tx, err := s.db.BeginTx(ctx, &sql.TxOptions{Isolation: sql.LevelReadCommitted})
    if err != nil { return err }
    defer func() {
        if err != nil { _ = tx.Rollback() }      // rollback on any error path
    }()

    if _, err = tx.ExecContext(ctx, insertOrder, o.ID, o.TenantID); err != nil { return err }
    if _, err = tx.ExecContext(ctx, decrementStock, o.SKU, o.Qty); err != nil { return err }
    return tx.Commit()
}
```

- A transaction that is neither committed nor rolled back holds a connection
  and its locks until the context ends. The `defer` with a named `err` is the
  idiom that guarantees resolution.
- Keep transactions short: no HTTP calls, no waiting on channels inside one.
- Pass `tx` (or a small interface both `*sql.DB` and `*sql.Tx` satisfy) into the
  functions that must run inside it. **Never** stash a transaction in a context.
- Choose the isolation level deliberately. `Serializable` needs retry logic on
  `40001`; `ReadCommitted` needs explicit `SELECT … FOR UPDATE` where you read
  then write.

---

# sqlc, pgx, or an ORM

| Need | Use |
| --- | --- |
| Type-safe queries from SQL you write | `sqlc` — generates Go from `.sql` files |
| Postgres-specific features, best performance | `pgx` directly (`pgx/v5`, `pgxpool`) |
| Portable across databases with `database/sql` | `pgx/v5/stdlib` as the driver |
| Dynamic query building | `squirrel` or hand-built with placeholders |
| A full ORM | Only if the team already knows it well; `gorm` hides N+1 and locking |

- Default to `sqlc`: the SQL is reviewable, the generated code is boring, and a
  schema change breaks the build instead of production.
- `pgxpool` has its own pool; do not wrap it in `database/sql` unless you need
  the portable interface.
- ORMs earn their cost on CRUD-heavy admin tools. On hot paths, the query they
  generate is the query you must read anyway.

---

# Scanning and nulls

```go
type Order struct {
    ID        string
    Note      sql.NullString      // nullable column: say so in the type
    ShippedAt *time.Time          // or a pointer
}
```

- Scan a `NULL` into a plain `string` and the query fails at runtime. Nullable
  columns get `sql.Null*` or pointer fields.
- Scan into named fields in a known column order; `SELECT *` breaks silently
  when a column is added. List the columns.
- Time columns: store `timestamptz`, scan into `time.Time`, and set the pool's
  session time zone to UTC.

---

# Migrations

```
migrations/
  0001_orders.up.sql
  0001_orders.down.sql
  0002_orders_tenant_index.up.sql
```

- Migrations are versioned SQL files applied in order by a tool (`golang-migrate`,
  `goose`, `atlas`), never by the application on startup in a multi-replica
  deployment — two replicas racing to migrate is a corrupted schema.
- Every migration has a tested `down`, or an explicit comment that it is
  irreversible and why.
- Additive first: add the column, deploy code that writes both, backfill, then
  remove the old column in a later migration. → `Database/migration`
- `CREATE INDEX CONCURRENTLY` in Postgres cannot run inside a transaction; mark
  that migration as non-transactional in your tool.

---

# Anti-patterns

| Anti-pattern | Why it fails | Fix |
| --- | --- | --- |
| `sql.Open` per request | Pool churn, connection exhaustion | One `*sql.DB` in `main` |
| No `PingContext` at startup | Bad config fails on first request | Ping, fail fast |
| `db.Query` without a context | Cannot be cancelled; pool slot leaks | `QueryContext` with a deadline |
| SQL built by string concatenation | Injection | Placeholders always |
| Transaction without a rollback path | Locks held until the context dies | `defer` rollback on error |
| HTTP call inside a transaction | Locks held for network latency | Do I/O outside, then transact |
| `*sql.Tx` stored in a context | Invisible, misused across requests | Pass it explicitly |
| `SELECT *` | Breaks on schema change; scans wrong columns | List columns |
| Plain `string` for a nullable column | Runtime scan error on `NULL` | `sql.NullString` or `*string` |
| Ignoring `rows.Err()` | Mid-iteration failures vanish | Check after the loop |
| Auto-migrate on app start | Replicas race; schema corrupts | Migration tool in the deploy step |
| ORM on the hot path without reading its SQL | N+1, missing locks | `sqlc` or explicit SQL |

---

# Checklist

- [ ] Verify: Exactly one `*sql.DB` (or `pgxpool.Pool`) is created in `main` and injected
- [ ] Verify: `PingContext` runs at startup and a failure exits
- [ ] Verify: Pool limits are set relative to the server's connection cap and replica count
- [ ] Verify: Every query uses a `…Context` method with a deadline
- [ ] Verify: All SQL uses placeholders; no string concatenation of values
- [ ] Verify: `sql.ErrNoRows` is translated to a package sentinel at the store
- [ ] Verify: `rows.Close()` is deferred and `rows.Err()` is checked
- [ ] Verify: Every transaction is committed or rolled back on every path
- [ ] Verify: No network I/O happens inside a transaction
- [ ] Verify: Nullable columns scan into `sql.Null*` or pointers
- [ ] Verify: Queries list columns explicitly; no `SELECT *`
- [ ] Verify: Migrations are versioned files run by a tool in the deploy step, not by the app
