---
targetModels:
  - "DeepSeek V4"
  - "DeepSeek V3.2"
  - "DeepSeek R1"
  - "DeepSeek V3 Family"
  - "Future DeepSeek Models"
name: mysql
category: Database
description: MySQL and MariaDB specifics — InnoDB, charset and collation, gap locks, online DDL, and the defaults that silently corrupt data.
license: MIT
author: Agent.md maintainers
last-verified: 2026-08-23
reviewed-by: unreviewed
---
<!-- Generated from models/_canonical by scripts/build-model-variants.js.
     Edit the canonical source, not this file. Structure adapted for DeepSeek per deep-research.md. -->


# Purpose

Rules specific to MySQL/MariaDB with InnoDB. Portable schema design is
`Database/schema-design`. This package covers the defaults that differ from every
other engine and the ones that lose data quietly.

---

# Non-negotiable defaults

```sql
-- Verify before shipping anything
SELECT @@sql_mode, @@character_set_server, @@collation_server,
       @@innodb_file_per_table, @@transaction_isolation;
```

| Setting | Required value | Why |
| --- | --- | --- |
| `sql_mode` | includes `STRICT_TRANS_TABLES`, `NO_ENGINE_SUBSTITUTION` | Without strict mode, over-long strings are **truncated** and invalid dates become `0000-00-00` — silently |
| `character_set_server` | `utf8mb4` | `utf8` in MySQL is 3-byte and cannot store emoji or many CJK characters |
| `collation_server` | `utf8mb4_0900_ai_ci` (8.0+) or `utf8mb4_unicode_ci` | `utf8mb4_general_ci` sorts incorrectly |
| `default_storage_engine` | `InnoDB` | MyISAM has no transactions and no crash recovery |
| `innodb_file_per_table` | `ON` | Otherwise space is never returned to the filesystem |

**Never** ship on a server where `sql_mode` omits strict mode. It is the single
largest source of silent data corruption in MySQL deployments — an `INSERT` of a
300-character value into `varchar(255)` succeeds, truncated, with a warning
nobody reads.

**Never** use `utf8`/`utf8mb3`. It is a three-byte subset that rejects any
four-byte codepoint. Use `utf8mb4` for every column, table, connection, and
client.

---

# InnoDB and the clustered index

InnoDB stores the table **in** the primary key. Two consequences follow, and they
drive most MySQL schema decisions:

1. **Every secondary index stores the primary key** as its row pointer. A wide
   primary key inflates every index in the table.
2. **Insert order matters.** A monotonically increasing key appends to the right
   edge of the B-tree; a random key (`uuid` v4) writes everywhere, causing page
   splits and fragmentation.

```sql
-- Preferred: compact, monotonic
id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY

-- If UUIDs are required, store them ordered and binary
id BINARY(16) NOT NULL PRIMARY KEY   -- UUIDv7, or UUID_TO_BIN(uuid, 1) on 8.0
```

`UUID_TO_BIN(x, 1)` swaps the time-low and time-high fields so v1 UUIDs sort
chronologically. Storing a UUID as `char(36)` costs 36 bytes in the table and 36
more in **every** secondary index.

---

# Locking

InnoDB's default isolation is `REPEATABLE READ`, which is unusual — most engines
default to `READ COMMITTED`. At `REPEATABLE READ`, InnoDB takes **gap locks**:
locking not only matching rows but the ranges between them.

```sql
-- Locks a gap; a concurrent INSERT into the same range blocks
SELECT * FROM orders WHERE created_at > '2026-01-01' FOR UPDATE;
```

This causes deadlocks that do not appear on other engines. Options, in order:

- Lock by primary key where possible, and always in a consistent order.
- Keep transactions short — never hold one across an HTTP call.
- Set `transaction_isolation = READ-COMMITTED` if gap locks are causing
  contention and your application does not rely on repeatable reads.

Diagnose with:

```sql
SHOW ENGINE INNODB STATUS\G           -- LATEST DETECTED DEADLOCK section
SELECT * FROM performance_schema.data_locks;
```

Deadlocks are normal under concurrency. **Retry** the losing transaction — do not
try to eliminate deadlocks entirely. → `Database/transactions`

---

# Schema changes

MySQL 8.0 supports `ALGORITHM=INSTANT` for a growing set of operations (adding a
nullable column at the end, renaming, changing a default). Anything else copies
or rebuilds the table, holding a metadata lock.

```sql
ALTER TABLE orders ADD COLUMN note text NULL, ALGORITHM=INSTANT;
```

If `INSTANT` is rejected, the operation is not instant — use `gh-ost` or
`pt-online-schema-change` on a large table rather than accepting the rebuild.
Both work by building a shadow table and replaying binlog changes, then swapping.

**Never** run a blocking `ALTER` on a large table in business hours. A metadata
lock queues behind any open transaction and then blocks every subsequent query on
that table, including reads. → `Database/migration`

---

# Replication

| Setting | Value | Why |
| --- | --- | --- |
| `binlog_format` | `ROW` | `STATEMENT` diverges on non-deterministic functions |
| `gtid_mode` | `ON` | Failover without hand-tracking binlog positions |
| `sync_binlog` | `1` | Durability of the binlog on crash |
| `innodb_flush_log_at_trx_commit` | `1` | Full ACID; `2` trades durability for throughput |

Replicas are asynchronous by default: a read immediately after a write may not
see it. Route read-after-write to the primary, or use semi-synchronous
replication. → `Database/replication`

---

# Anti-patterns

| Anti-pattern | Why it fails | Fix |
| --- | --- | --- |
| Non-strict `sql_mode` | Silent truncation and zero dates | `STRICT_TRANS_TABLES` |
| `utf8` charset | Three bytes; drops emoji and some CJK | `utf8mb4` everywhere |
| `char(36)` UUID primary key | Bloats the clustered index and every secondary index | `BINARY(16)`, time-ordered |
| Random UUID primary key | Page splits and fragmentation | `AUTO_INCREMENT` or UUIDv7 |
| MyISAM tables | No transactions, no crash recovery | InnoDB |
| Long transactions | Gap locks; deadlocks; blocked DDL | Short transactions, no I/O inside |
| Blocking `ALTER` on a big table | Metadata lock blocks all reads | `gh-ost` / `pt-online-schema-change` |
| `binlog_format = STATEMENT` | Replicas diverge | `ROW` |
| Reading own write from a replica | Async lag | Route to primary |
| Treating deadlocks as bugs to eliminate | Unavoidable under concurrency | Retry with backoff |

---

# Checklist

- [ ] `sql_mode` includes `STRICT_TRANS_TABLES`
- [ ] Server, database, table, column and connection charset are all `utf8mb4`
- [ ] Collation is `utf8mb4_0900_ai_ci` or `utf8mb4_unicode_ci`, not `general_ci`
- [ ] All tables use InnoDB with `innodb_file_per_table = ON`
- [ ] Primary keys are compact and monotonically increasing
- [ ] UUID keys, where used, are `BINARY(16)` and time-ordered
- [ ] Transactions are short and contain no network calls
- [ ] Deadlock retry with backoff is implemented
- [ ] Large `ALTER`s use `ALGORITHM=INSTANT` or an online schema-change tool
- [ ] `binlog_format = ROW` and GTIDs are enabled
- [ ] Read-after-write traffic is routed to the primary
