---
targetModels:
  - "DeepSeek V4"
  - "DeepSeek V3.2"
  - "DeepSeek R1"
  - "DeepSeek V3 Family"
  - "Future DeepSeek Models"
name: migration
category: Database
description: Schema changes that deploy without downtime — expand-contract, locks that block writes, and backfilling large tables safely.
license: MIT
author: Agent.md maintainers
last-verified: 2026-08-23
reviewed-by: unreviewed
---
<!-- Generated from models/_canonical by scripts/build-model-variants.js.
     Edit the canonical source, not this file. Structure adapted for DeepSeek per deep-research.md. -->


# Purpose

Rules for changing a database schema in a running system.

The governing constraint: **during a deploy, old and new application code run at
the same time.** Every migration must therefore be compatible with the code
before it and the code after it. A migration that is only valid with the new code
causes errors for the duration of the rollout.

---

# Expand, migrate, contract

Never change a column in place. Split it across releases:

| Phase | Deploy | Schema | Code |
| --- | --- | --- | --- |
| **Expand** | 1 | Add the new nullable column or table | Write to both, read from old |
| **Migrate** | 2 | Backfill in batches | Read from new, still write both |
| **Contract** | 3 | Drop the old column | Write and read new only |

Each phase deploys independently and is individually reversible. Compressing
them into one release is how a rename takes the site down.

**Renaming a column is three deploys, not one.** `ALTER TABLE … RENAME COLUMN`
breaks every running instance of the old code the instant it commits.

---

# Locks are the danger

The migration that reads harmlessly is often the one that takes an
`ACCESS EXCLUSIVE` lock and queues every query behind it.

Safe in PostgreSQL (brief lock, no table rewrite):

```sql
ALTER TABLE users ADD COLUMN nickname text;                    -- no default
ALTER TABLE users ALTER COLUMN nickname DROP NOT NULL;
CREATE INDEX CONCURRENTLY idx_users_email ON users (email);
ALTER TABLE users VALIDATE CONSTRAINT users_email_check;
```

Dangerous (rewrites the table or blocks writes for its duration):

```sql
ALTER TABLE users ADD COLUMN status text NOT NULL DEFAULT 'a'; -- rewrite on PG < 11
ALTER TABLE users ALTER COLUMN id TYPE bigint;                 -- full rewrite
CREATE INDEX idx_users_email ON users (email);                 -- blocks writes
ALTER TABLE orders ADD CONSTRAINT fk_user FOREIGN KEY …;        -- scans both tables
```

Two rules that prevent most incidents:

- **`CREATE INDEX CONCURRENTLY`** on any table large enough to matter. It cannot
  run inside a transaction, so the migration tool must be told not to wrap it.
- **Add constraints `NOT VALID`, then `VALIDATE` separately.** The first takes a
  brief lock; the second scans without blocking writes.

```sql
ALTER TABLE orders ADD CONSTRAINT fk_user
  FOREIGN KEY (user_id) REFERENCES users (id) NOT VALID;
ALTER TABLE orders VALIDATE CONSTRAINT fk_user;   -- separate transaction
```

Always set a short `lock_timeout` so a migration fails fast rather than queueing
every request behind it:

```sql
SET lock_timeout = '3s';
SET statement_timeout = '30s';
```

---

# Backfilling

**Never** issue a single `UPDATE` across a large table. It holds a long
transaction, bloats the table, and blocks vacuum.

```sql
-- Batch by primary key, commit between batches, pause to let replicas catch up.
UPDATE users SET nickname = split_part(email, '@', 1)
WHERE id IN (
  SELECT id FROM users WHERE nickname IS NULL ORDER BY id LIMIT 1000
);
```

- Batch size in the low thousands; tune from observed replication lag.
- Make it **resumable** — the `WHERE … IS NULL` above restarts safely after a
  failure.
- Make it **idempotent**, so re-running cannot double-apply.
- Run it **outside the deploy**, as a job. A backfill inside a migration blocks
  the release for its full duration.
- Watch replication lag while it runs and pause when it grows.

---

# Reversibility

- Every migration needs a **tested** `down`. An untested rollback is a rollback
  that fails during an incident.
- **Destructive steps are irreversible in practice.** `DROP COLUMN` loses the data;
  the `down` recreates an empty column. Contract only after the new path has run
  in production long enough to trust.
- Prefer **forward fixes** for data problems. Rolling a schema back under live
  traffic is usually more dangerous than fixing forward.
- Take a backup before any destructive migration and **verify it restores** — an
  unverified backup is a hope.

---

# Practice

- Migrations live **in version control** beside the code and run in CI on a
  restored copy of production-shaped data. That is how you learn migration 47
  fails on a table with real rows. → `Testing/integration`
- **Never edit a migration that has run** anywhere. Add a new one; editing leaves
  environments permanently divergent.
- One logical change per migration. A file doing four things cannot be partially
  rolled back.
- Separate **schema** changes from **data** changes, so each can be timed
  independently.
- Guard against two instances migrating at once — most tools take an advisory
  lock; confirm yours does.

---

# Anti-patterns

| Anti-pattern | Why it fails | Fix |
| --- | --- | --- |
| `RENAME COLUMN` in one deploy | Old code breaks instantly | Expand-migrate-contract |
| `CREATE INDEX` without `CONCURRENTLY` | Blocks writes for the build | `CONCURRENTLY`, outside a transaction |
| `ADD COLUMN NOT NULL DEFAULT` on old PG | Full table rewrite under lock | Add nullable, backfill, then set |
| Adding a foreign key directly | Scans both tables under lock | `NOT VALID` then `VALIDATE` |
| One `UPDATE` over millions of rows | Long transaction, bloat, replica lag | Batch, commit, pause |
| Backfill inside the migration | Deploy blocked for its duration | Separate job |
| No `lock_timeout` | Migration queues all traffic | Set lock and statement timeouts |
| Editing an applied migration | Environments diverge permanently | Add a new migration |
| Untested `down` | Rollback fails mid-incident | Test both directions in CI |
| Contracting in the same release | No safe window to revert | Wait; drop later |

---

# Checklist

- [ ] Every change is compatible with both old and new application code
- [ ] Renames and type changes are split across expand, migrate and contract
- [ ] Indexes are created `CONCURRENTLY` and outside a transaction
- [ ] Constraints are added `NOT VALID` and validated separately
- [ ] `lock_timeout` and `statement_timeout` are set
- [ ] Backfills are batched, resumable, idempotent and run outside the deploy
- [ ] Replication lag is monitored during backfills
- [ ] Every migration has a `down` that has been executed in CI
- [ ] Migrations run in CI against production-shaped data
- [ ] No applied migration is ever edited
- [ ] Destructive steps happen only after the new path is proven
- [ ] A verified backup exists before any destructive change
