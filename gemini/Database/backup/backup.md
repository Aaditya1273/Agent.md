---
targetModels:
  - "Gemini 3.6 Flash"
  - "Gemini 3.5 Flash"
  - "Gemini 3.1 Pro"
  - "Gemini 3 Family"
  - "Future Gemini Models"
name: backup
category: Database
description: Backups that actually restore — point-in-time recovery, retention, encryption, and the restore drill that is the only proof a backup exists.
license: MIT
author: Agent.md maintainers
last-verified: 2026-08-23
reviewed-by: unreviewed
---
<!-- Generated from models/_canonical by scripts/build-model-variants.js.
     Edit the canonical source, not this file. Structure adapted for Gemini per deep-research.md. -->


# Purpose

Rules for backing up a database. The only meaningful definition: **a backup is
something you have restored.** Everything else is a file of unknown quality.

Start by writing down two numbers, because every decision below follows from them:

- **RPO** — recovery point objective: how much data may be lost, in minutes.
- **RTO** — recovery time objective: how long a restore may take, in minutes.

An RPO of five minutes rules out nightly dumps. An RTO of fifteen minutes rules
out restoring a 2 TB dump on a fresh host. If you cannot meet the numbers, change
the architecture or change the numbers — do not leave them aspirational.

---

# Point-in-time recovery, not just dumps

| Method | RPO | Restores to | Suitable for |
| --- | --- | --- | --- |
| `pg_dump` nightly | 24 hours | The dump instant | Small databases, dev seeding |
| Base backup + WAL archive | Seconds | **Any** instant in the window | Production |
| Filesystem/EBS snapshot | Snapshot interval | The snapshot instant | Fast large restores, with WAL for PITR |
| Managed provider PITR | Seconds | Any instant in the window | Default when available |

PITR is what lets you restore to 14:32:59 — one second before the migration that
deleted the column.

```bash
# Postgres: continuous archiving
archive_mode = on
archive_command = 'pgbackrest --stanza=main archive-push %p'

# Base backup, then restore to a moment
pgbackrest --stanza=main backup --type=full
pgbackrest --stanza=main --type=time --target='2026-08-23 14:32:59+00' restore
```

Use `pgbackrest`, `wal-g`, or `barman` — not hand-rolled `cp` in
`archive_command`. A failing `archive_command` silently stops WAL from being
archived while `pg_wal` grows until the disk fills.

MySQL equivalent: `xtrabackup` for the base plus binlogs for the replay window.
→ `Database/mysql`

**Never** rely on `pg_dump` alone for a production database. It is a logical
snapshot of one instant with no way to reach any other instant, and restoring one
is slow because it rebuilds every index.

**Never** treat a replica as a backup. `DROP TABLE` replicates in milliseconds.
→ `Database/replication`

---

# The restore drill

An untested backup has a failure rate that is unknown and, empirically, high.

Run a restore on a schedule — monthly at minimum — into a scratch environment,
and record:

- [ ] Verify: Wall-clock time from decision to a serving database (this is your real RTO)
- [ ] Verify: Row counts on the largest tables against expectation
- [ ] Verify: Application boots and passes a smoke test against the restored data
- [ ] Verify: The most recent restorable timestamp (this is your real RPO)

Automate the drill in CI if the dataset allows it. A restore that only a
particular person can perform, from memory, is not a recovery capability.

**Never** count a backup as verified because the job exited zero. Verify the
restore, not the backup.

---

# Retention and the 3-2-1 rule

Three copies, on two media types, one off-site — and, for ransomware, one
**immutable**.

| Tier | Retention | Purpose |
| --- | --- | --- |
| PITR window | 7–35 days | Operator error, bad migration |
| Daily | 30 days | Recent recovery |
| Monthly | 12 months | Compliance, audit |
| Yearly | As legally required | Retention obligations |

```
# pgbackrest — expiry is declarative; the tool prunes, not a cron job with rm
repo1-retention-full=4
repo1-retention-diff=14
repo1-retention-archive=7
repo1-cipher-type=aes-256-cbc
repo1-s3-bucket=acme-db-backups
repo1-s3-kms-key-id=arn:aws:kms:eu-west-1:…:key/…
```

Store off-site backups in a **separate account or subscription** with separate
credentials. A backup in the same account as production is deleted by the same
compromised key that deleted production.

Use object-lock / immutability (`s3:ObjectLockMode=COMPLIANCE`, or the equivalent)
so that even a valid admin credential cannot delete backups inside the retention
window. This is the control that survives ransomware.

Backups also inherit deletion obligations — a GDPR erasure request applies to
data in backups. Document how it is honoured, usually by policy: the request is
re-applied on restore rather than by editing backup archives.

---

# Encryption and secrets

- Encrypt at rest and in transit. Managed KMS, not a key file beside the archive.
- Store the decryption key **outside** the backup system, and outside the
  database it protects.
- The restore procedure must be executable by someone who is not the person who
  set it up — including access to the key. Document where the key lives.
  → `Security/secret-management`

**Never** back up production data into a developer's environment unmasked. Restore
to staging through an anonymisation step, or restore into an access-controlled
environment.

---

# Monitoring

Alert on the **absence** of a recent successful backup, not on job failure. A job
that stops running emits no failures at all — this is how teams discover, during
an incident, that backups stopped three months ago.

```sql
-- Is WAL archiving actually working? failed_count climbing is the alarm.
SELECT archived_count, last_archived_time, failed_count, last_failed_time
FROM pg_stat_archiver;
```

```bash
# Backup age in seconds — export this as a gauge, alert above 26h for a daily job
pgbackrest --stanza=main --output=json info \
  | jq '.[0].backup[-1].timestamp.stop'
```

| Metric | Alert when |
| --- | --- |
| `backup_age_seconds` | > 1.25 × the backup interval |
| `wal_archive_age_seconds` | > 300 |
| `pg_stat_archiver.failed_count` | Increasing at all |
| `backup_size_bytes` | Deviates > 30% from trend — a sudden drop means an empty backup |
| `restore_drill_age_days` | > 35 |
| `pg_wal` directory size | Growing steadily — archiving has stalled |

---

# Anti-patterns

| Anti-pattern | Why it fails | Fix |
| --- | --- | --- |
| Never restoring | Unknown, high failure rate | Scheduled restore drill |
| Replica treated as backup | Deletes replicate instantly | Independent PITR backups |
| `pg_dump` only, nightly | 24-hour RPO; slow restore | Base backup + WAL archive |
| Backups in the production account | One compromised credential loses both | Separate account, immutable storage |
| No immutability | Ransomware deletes the backups too | Object lock for the retention window |
| Alerting only on job failure | A job that stops running is silent | Alert on backup age |
| Undocumented restore procedure | Only one person can recover | Written, drilled runbook |
| Encryption key in the backup system | Circular dependency at restore time | External KMS |
| Unmasked production restore to dev | Data exposure | Anonymise on restore |
| RPO/RTO never written down | No basis for any of these decisions | Write both numbers first |
| Hand-rolled `archive_command` | Silent archive failure fills the disk | `pgbackrest` / `wal-g` |

---

# Checklist

- [ ] Verify: RPO and RTO are written down and agreed with the business
- [ ] Verify: Point-in-time recovery is configured, not just periodic dumps
- [ ] Verify: Archiving uses a proven tool, and archive failures alert
- [ ] Verify: Backups are stored in a separate account with separate credentials
- [ ] Verify: At least one copy is immutable for its retention window
- [ ] Verify: Retention tiers cover operational, compliance and legal needs
- [ ] Verify: Backups are encrypted, with keys held outside the backup system
- [ ] Verify: A restore drill runs at least monthly and its duration is recorded
- [ ] Verify: Measured restore time meets the stated RTO
- [ ] Verify: Alerts fire on backup **age**, not only on job failure
- [ ] Verify: The restore runbook is written and has been followed by a second person
- [ ] Verify: Restores into lower environments pass through anonymisation
