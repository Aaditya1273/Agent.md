---
targetModels:
  - "Gemini 3.6 Flash"
  - "Gemini 3.5 Flash"
  - "Gemini 3.1 Pro"
  - "Gemini 3 Family"
  - "Future Gemini Models"
name: transactions
category: Database
description: Using transactions correctly — isolation levels and what each permits, keeping them short, and handling the retries serialisable mode requires.
license: MIT
author: Agent.md maintainers
last-verified: 2026-08-23
reviewed-by: unreviewed
---
<!-- Generated from models/_canonical by scripts/build-model-variants.js.
     Edit the canonical source, not this file. Structure adapted for Gemini per deep-research.md. -->


# Purpose

Rules for transaction boundaries, isolation and concurrency control.

The two failures that account for most incidents: **transactions held open too
long**, which exhausts the connection pool and blocks vacuum, and **assuming
`READ COMMITTED` prevents anomalies it does not** — the read-modify-write race
that silently corrupts a balance.

---

# Isolation levels and what each permits

| Level | Dirty read | Non-repeatable read | Phantom | Lost update |
| --- | --- | --- | --- | --- |
| `READ UNCOMMITTED` | Possible* | Possible | Possible | Possible |
| **`READ COMMITTED`** (PG default) | No | **Possible** | **Possible** | **Possible** |
| `REPEATABLE READ` | No | No | No† | No |
| `SERIALIZABLE` | No | No | No | No |

\* PostgreSQL treats `READ UNCOMMITTED` as `READ COMMITTED`.
† PostgreSQL's `REPEATABLE READ` uses snapshot isolation and prevents phantoms,
unlike the SQL standard's minimum guarantee.

The row that matters: **`READ COMMITTED` permits lost updates.** Two concurrent
transactions each read a balance of 100, each subtract 30, and the result is 70
instead of 40. No error is raised.

---

# The read-modify-write race

```js
// BROKEN under READ COMMITTED — two concurrent runs both read the old value
const account = await tx.account.findUnique({ where: { id } });
await tx.account.update({ where: { id }, data: { balance: account.balance - 30 } });
```

Three correct fixes, in order of preference:

```sql
-- 1. Atomic update — no read-then-write at all. Prefer this.
UPDATE accounts SET balance = balance - 30
WHERE id = $1 AND balance >= 30
RETURNING balance;

-- 2. Pessimistic lock — serialises the readers on this row
SELECT balance FROM accounts WHERE id = $1 FOR UPDATE;

-- 3. Optimistic lock — no lock held; retry on conflict
UPDATE accounts SET balance = $2, version = version + 1
WHERE id = $1 AND version = $3;      -- 0 rows affected means someone else won
```

Option 1 is best where the operation is expressible in SQL. `FOR UPDATE` costs
concurrency on hot rows. Optimistic locking suits low-contention data and requires
the caller to handle the retry.

**Never** rely on reading a value, checking it in application code, and writing it
back without one of these.

---

# Keep transactions short

A transaction holds locks and a connection for its entire life.

**Never** do these inside a transaction:

- An HTTP call to a third party. A 30-second timeout becomes a 30-second lock.
- Sending an email or publishing to a queue — if the transaction rolls back, the
  message has already gone. Use the outbox pattern.
- Waiting for user input.
- Processing a large file.

```js
// Right: read, close, do slow work, reopen for the write
const order = await db.order.findUnique({ where: { id } });
const charge = await stripe.charges.create({ amount: order.total });   // outside

await db.$transaction(async (tx) => {
  await tx.order.update({ where: { id }, data: { chargeId: charge.id } });
  await tx.ledger.create({ data: { orderId: id, amount: order.total } });
});
```

Watch `idle in transaction` in `pg_stat_activity` — a non-zero steady count means
transactions are open with nothing running, which is the pool exhaustion signature.
Set `idle_in_transaction_session_timeout` so a leaked transaction cannot hold a
connection indefinitely.

---

# Serialisable and retries

`SERIALIZABLE` gives correctness without manual locking, at the cost of
**serialisation failures the caller must retry**.

```js
async function withRetry(fn, attempts = 3) {
  for (let i = 0; i < attempts; i++) {
    try {
      return await db.$transaction(fn, { isolationLevel: "Serializable" });
    } catch (e) {
      // 40001 serialization_failure, 40P01 deadlock_detected
      if (!["40001", "40P01"].includes(e.code) || i === attempts - 1) throw e;
      await sleep(Math.random() * 2 ** i * 50);      // backoff with jitter
    }
  }
}
```

A `SERIALIZABLE` transaction **without** retry handling is worse than
`READ COMMITTED` — it converts a rare silent anomaly into a frequent visible error.

Deadlocks: the database detects and kills one participant. Reduce them by always
acquiring locks in a **consistent order** (for example, always the lower account
id first).

---

# Boundaries and correctness

- One transaction per **unit of business work** — not per statement, not per
  request. If two writes must both succeed or both fail, they share a transaction.
- **Never** nest transactions expecting independent rollback. Most drivers map an
  inner "transaction" to a savepoint or ignore it.
- Anything with an external side effect belongs in an **outbox**: write the
  intent inside the transaction, deliver it afterwards from a worker.
- Make retried operations **idempotent** — a retry after an ambiguous timeout must
  not charge twice. Use an idempotency key.

---

# Anti-patterns

| Anti-pattern | Why it fails | Fix |
| --- | --- | --- |
| Read, modify, write under `READ COMMITTED` | Lost update, silently | Atomic `UPDATE` or `FOR UPDATE` |
| HTTP call inside a transaction | Locks held for the remote latency | Call outside the boundary |
| Email or publish inside a transaction | Sent even when the transaction rolls back | Outbox pattern |
| `SERIALIZABLE` with no retry | Frequent visible `40001` errors | Retry with jitter |
| Locking rows in varying order | Deadlocks | Consistent lock ordering |
| Transaction per statement | No atomicity across the unit of work | One per business operation |
| Nested transactions assumed independent | Inner rollback discards outer work | Savepoints, explicitly |
| No `idle_in_transaction` timeout | One leak exhausts the pool | Set the timeout |
| Retry without idempotency | Double charge after an ambiguous timeout | Idempotency key |
| Long-running report in a transaction | Blocks vacuum; bloat grows | Read outside, or a replica |

---

# Checklist

- [ ] Verify: The isolation level is chosen deliberately, and its anomalies are understood
- [ ] Verify: No read-modify-write happens without an atomic update or an explicit lock
- [ ] Verify: Transactions contain no HTTP calls, emails, queue publishes or user waits
- [ ] Verify: External side effects go through an outbox
- [ ] Verify: `SERIALIZABLE` transactions are wrapped in retry with backoff and jitter
- [ ] Verify: Locks are always acquired in a consistent order
- [ ] Verify: One transaction spans one unit of business work
- [ ] Verify: Nested transaction behaviour in the driver is known, not assumed
- [ ] Verify: `idle_in_transaction_session_timeout` is set
- [ ] Verify: Retryable operations carry an idempotency key
- [ ] Verify: `idle in transaction` connection counts are monitored
