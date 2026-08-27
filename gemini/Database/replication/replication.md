---
targetModels:
  - "Gemini 3.6 Flash"
  - "Gemini 3.5 Flash"
  - "Gemini 3.1 Pro"
  - "Gemini 3 Family"
  - "Future Gemini Models"
name: replication
category: Database
description: Read replicas, failover and lag — what replication actually guarantees, how to route reads safely, and how to avoid promoting a replica that has lost data.
license: MIT
author: Agent.md maintainers
last-verified: 2026-08-23
reviewed-by: unreviewed
---
<!-- Generated from models/_canonical by scripts/build-model-variants.js.
     Edit the canonical source, not this file. Structure adapted for Gemini per deep-research.md. -->


# Purpose

Rules for running replicas. Replication solves two different problems — read
scaling and availability — and the configuration for each differs. Conflating
them produces a system that is neither.

Central fact: **asynchronous replication means a replica is always behind, and a
failover can lose the writes it had not yet received.** Every rule follows from
that.

---

# Modes and what they guarantee

| Mode | Commit waits for | Data loss on failover | Write latency |
| --- | --- | --- | --- |
| Asynchronous | Primary only | Up to the current lag | Lowest |
| Semi-synchronous (`remote_write`) | Replica received the WAL | Only on simultaneous failure | +1 network round trip |
| Synchronous (`remote_apply`) | Replica applied it | None | Highest; a slow replica stalls writes |

```
# PostgreSQL — durable, and tolerant of one replica being down
synchronous_commit = remote_write
synchronous_standby_names = 'ANY 1 (replica_a, replica_b)'
```

`ANY 1 (…)` is important: naming a single mandatory standby means that standby
going down **blocks every write on the primary**. Quorum form keeps writes flowing
while still guaranteeing one durable copy.

MySQL equivalent: `rpl_semi_sync_master_enabled = 1` with
`rpl_semi_sync_master_timeout` — note that on timeout MySQL silently falls back to
asynchronous. Alert on that fallback; it is the moment your durability guarantee
disappears. → `Database/mysql`

---

# Read routing

Not every read may go to a replica. Classify explicitly:

| Read | Route to |
| --- | --- |
| Immediately after the user's own write | Primary |
| Anything inside a write transaction | Primary |
| A read whose result drives a write | Primary |
| Authentication / authorization decisions | Primary |
| Dashboards, reports, search, feeds | Replica |
| Analytics and exports | A dedicated replica |

The failure this prevents: user saves a profile, is redirected, and sees the old
values because the read hit a lagging replica. Then they save again.

Two robust patterns, in preference order:

```sql
-- 1. Bound by LSN: read the replica only if it has caught up past your write
SELECT pg_current_wal_lsn();                    -- capture after the write
SELECT pg_last_wal_replay_lsn() >= $1;          -- on the replica, before reading
```

```
2. Sticky window: route this session's reads to the primary for N seconds after
   any write. Cruder, but needs no per-query coordination.
```

**Never** route reads to a replica based on the query looking read-only. The
question is whether the caller can tolerate stale data, and only the caller knows.

---

# Lag

Monitor lag in **bytes and seconds**, on the replica.

```sql
-- Postgres, on the replica
SELECT now() - pg_last_xact_replay_timestamp() AS replay_lag;

-- On the primary, per connected standby
SELECT client_addr, state, sent_lsn, replay_lsn,
       pg_wal_lsn_diff(sent_lsn, replay_lsn) AS replay_bytes
FROM pg_stat_replication;
```

Common causes of a lag spike, in order of frequency:

- A long-running query on the replica conflicting with WAL replay (Postgres will
  either cancel the query or pause replay, depending on
  `max_standby_streaming_delay`).
- A bulk write, index build, or `VACUUM` on the primary generating WAL faster than
  the replica can apply it.
- Single-threaded apply on the replica — enable parallel apply where available.
- Network saturation between regions.

Alert on lag **before** it matters — a replica three minutes behind is a
three-minute data-loss window if the primary fails now.

`hot_standby_feedback = on` stops the replica cancelling long queries, but at the
cost of holding the primary's vacuum horizon. Pick one deliberately.
→ `Database/postgres`

---

# Settings that govern behaviour

| Setting | Engine | Effect |
| --- | --- | --- |
| `wal_level = replica` | Postgres | Minimum for streaming; `logical` for logical replication |
| `max_wal_senders` | Postgres | One per standby plus headroom for `pg_basebackup` |
| `wal_keep_size` | Postgres | WAL retained for a lagging standby without a slot |
| `max_slot_wal_keep_size` | Postgres | Caps slot retention so a dead slot cannot fill the disk |
| `max_standby_streaming_delay` | Postgres | How long replay waits for a conflicting query before cancelling it |
| `recovery_min_apply_delay` | Postgres | Deliberate delayed replica — a window to catch a bad `DELETE` |
| `rpl_semi_sync_master_timeout` | MySQL | Fallback to async after this many ms |
| `slave_parallel_workers` | MySQL | Parallel apply; single-threaded apply is a common lag cause |
| `read_only` / `super_read_only` | MySQL | Must be `ON` on every replica to prevent accidental writes |

`max_slot_wal_keep_size` is the guard that stops an abandoned replication slot
from filling the primary's disk — the most common self-inflicted replication
outage. Set it, and alert on `pg_replication_slots.active = false`.

A **delayed replica** (`recovery_min_apply_delay = '1h'`) is cheap insurance
against operator error: it is one hour behind on purpose, so a destructive
statement can be caught before it applies.

---

# Failover

Automatic failover requires three things, and it is dangerous without all of them:

1. **A consensus-based manager** (Patroni, orchestrator, or the managed service's
   own) — never a script that pings and promotes.
2. **Fencing.** The old primary must be demoted or killed before the new one
   accepts writes. Without it you get split-brain: two primaries taking writes,
   and a manual merge afterwards.
3. **A tested procedure.** Failover that has never been exercised is a plan, not a
   capability.

After promotion, other replicas must be re-pointed at the new primary
(`pg_rewind` or a rebuild). A replica left following the old primary silently
stops receiving data.

**Never** promote a replica manually during an incident without checking its
replay position. Promoting the most-behind replica discards every write the
others had.

Rehearse: a scheduled failover drill in staging every quarter, timed, with the
runbook followed as written. → `DevOps/disaster-recovery`

---

# Replicas are not backups

Replication propagates `DROP TABLE` in milliseconds. It protects against hardware
and host failure, not against a bad migration, a buggy delete, or ransomware.

You need point-in-time recovery from base backups plus WAL archives, tested by
restore. → `Database/backup`

---

# Anti-patterns

| Anti-pattern | Why it fails | Fix |
| --- | --- | --- |
| Treating replicas as backups | Deletes replicate instantly | Independent PITR backups |
| All reads to replicas | Users see their own writes vanish | Classify reads explicitly |
| Routing by "looks read-only" | Staleness tolerance is the caller's property | Explicit routing per call site |
| No lag monitoring | Data-loss window is unknown | Alert on bytes and seconds |
| Single named synchronous standby | Its outage blocks all writes | `ANY 1 (…)` quorum |
| Ignoring semi-sync timeout fallback | Durability silently becomes async | Alert on the fallback |
| Promotion by ping script | Split-brain | Consensus manager with fencing |
| Untested failover | The drill happens during the outage | Quarterly rehearsal |
| Not re-pointing surviving replicas | They silently stop replicating | `pg_rewind` or rebuild |
| Long analytics queries on a serving replica | Cancels replay or stalls it | Dedicated analytics replica |

---

# Checklist

- [ ] Verify: Replication mode is chosen deliberately and its data-loss window is written down
- [ ] Verify: Synchronous standbys are configured as a quorum, not a single named node
- [ ] Verify: Semi-synchronous timeout fallback raises an alert
- [ ] Verify: Every read call site is classified as primary-required or replica-safe
- [ ] Verify: Read-after-write is handled by LSN check or a sticky primary window
- [ ] Verify: Replication lag is monitored in both bytes and seconds, with alerts
- [ ] Verify: `hot_standby_feedback` trade-off is a conscious decision
- [ ] Verify: Failover is managed by a consensus system with fencing
- [ ] Verify: Failover is rehearsed on a schedule and timed
- [ ] Verify: Surviving replicas are re-pointed after promotion
- [ ] Verify: Independent, restore-tested backups exist separately from replication
