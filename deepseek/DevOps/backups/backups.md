---
targetModels:
  - "DeepSeek V4"
  - "DeepSeek V3.2"
  - "DeepSeek R1"
  - "DeepSeek V3 Family"
  - "Future DeepSeek Models"
name: backups
category: DevOps
description: Backing up infrastructure and state — what is actually stateful, immutability against ransomware, cross-account isolation, and restore drills.
license: MIT
author: Agent.md maintainers
last-verified: 2026-08-23
reviewed-by: unreviewed
---
<!-- Generated from models/_canonical by scripts/build-model-variants.js.
     Edit the canonical source, not this file. Structure adapted for DeepSeek per deep-research.md. -->


# Purpose

Rules for backing up everything that is not the database. Database backups are
`Database/backup`; this covers object storage, cluster state, secrets,
configuration and the accounts that hold them.

The definition that governs everything: **a backup is something you have
restored.** Anything else is a file of unknown quality.

---

# Inventory the state first

Most teams can name the database and stop. The gaps are what break a recovery.

| Asset | Backed up by | Common gap |
| --- | --- | --- |
| Databases | PITR + base backups | → `Database/backup` |
| Object storage (uploads) | Versioning + cross-region replication | Assumed durable; deletion still propagates |
| Secrets and keys | Secret-manager backup, escrow | KMS key deleted → every backup unreadable |
| Cluster state | Git (declarative), etcd snapshots | Manual `kubectl` changes exist nowhere |
| CI/CD configuration | Git | Repository settings, secrets, runners are not in git |
| DNS zones | Zone export | Held only in a provider console |
| Certificates | Reissued, or backed up | Private keys not in any backup |
| Container registry | Registry replication | Base images deleted upstream |
| Message queues | Usually not backed up | In-flight jobs lost — decide deliberately |
| Third-party SaaS data | Provider export | No export path discovered during an incident |

Automate the discovery where you can: `aws resourcegroupstaggingapi get-resources`,
`terraform state list`, and `kubectl get all,secret,cm -A` each reveal state that
never made it into the plan.

Write the inventory down and re-derive it each quarter. State appears without
anyone deciding to add it.

Concretely, the assets that most often turn out to be unrecoverable are the ones
nobody provisioned with code: a `Secret` created with `kubectl create secret`, a
DNS record added in a console, a `SecurityGroup` rule opened during an incident, a
GitHub repository setting, a `KMS` key alias, and a webhook endpoint registered
with a payment provider.

**Anything created by hand is not backed up.** That is the strongest argument for
declarative infrastructure: if it is in git, it is recoverable.
→ `DevOps/environments`

---

# Isolate the copies

Backups in the same account as production are deleted by the same compromised
credential that deleted production. This is the ransomware playbook, and it works.

```
production account ──► backup account (separate credentials, separate root)
                          └─ Object Lock, COMPLIANCE mode, 35-day retention
```

- A **separate account or subscription**, with its own root credentials and no
  cross-trust that allows deletion.
- **Immutability**: `s3:ObjectLockMode=COMPLIANCE`, Azure immutable blob policy, or
  the equivalent. In compliance mode not even the account root can delete inside
  the retention window — that is the property you are buying.
- Write access one way only: production can write backups; it cannot delete them.
- Encrypt at rest with a key held **outside** the backup system. Storing the
  decryption key beside the backup is a circular dependency discovered at restore
  time.
- MFA-delete on the bucket where the platform supports it.

```hcl
# Terraform: the backup bucket, in the backup account. COMPLIANCE mode means
# not even the account root can delete inside the retention window.
resource "aws_s3_bucket" "backups" { bucket = "acme-backups-prod" }

resource "aws_s3_bucket_object_lock_configuration" "backups" {
  bucket = aws_s3_bucket.backups.id
  rule { default_retention { mode = "COMPLIANCE", days = 35 } }
}

resource "aws_s3_bucket_versioning" "backups" {
  bucket = aws_s3_bucket.backups.id
  versioning_configuration { status = "Enabled" }   # required for Object Lock
}

resource "aws_s3_bucket_lifecycle_configuration" "backups" {
  bucket = aws_s3_bucket.backups.id
  rule {
    id     = "expire-noncurrent"
    status = "Enabled"
    noncurrent_version_expiration { noncurrent_days = 90 }
  }
}
```

Object Lock cannot be enabled on an existing bucket in most providers — it is set
at creation. Discovering that during an incident response is too late.

`3-2-1-1`: three copies, two media types, one off-site, one immutable.

---

# Object storage is not a backup

Durability (`99.999999999%`, "eleven nines") protects against hardware failure and
media decay. It does not protect against a `DELETE` — yours, an attacker's, or a buggy cleanup job.

- Enable **versioning**, so an overwrite or delete is recoverable.
- Add a lifecycle rule to expire noncurrent versions, or storage grows without
  bound.
- Cross-region replication for regional failure — but note it replicates deletes
  unless configured otherwise.
- Delete markers plus versioning is the recovery path; test it:

```bash
# Recover a deleted object: remove the delete marker, do not re-upload.
aws s3api list-object-versions --bucket uploads --prefix "tenants/acme/" \
  --query 'DeleteMarkers[?IsLatest==`true`].{K:Key,V:VersionId}' --output text \
| while read -r key version; do
    aws s3api delete-object --bucket uploads --key "$key" --version-id "$version"
  done
```

Similarly, **replication is not a backup**: a `DROP TABLE` reaches the replica in
milliseconds. → `Database/replication`

---

# Test the restore, not the backup

An untested backup has an unknown and empirically high failure rate.

Run a full restore drill quarterly into an isolated environment, and record:

- [ ] Wall-clock time from decision to a serving system — this is your real RTO
- [ ] The most recent restorable point — this is your real RPO
- [ ] Whether the procedure was executable by someone who did not write it
- [ ] Whether every dependency was recoverable, including secrets and DNS
- [ ] What was missing from the inventory

The drill's output is a corrected runbook. A restore that only one person can
perform, from memory, is not a recovery capability. → `DevOps/disaster-recovery`

**Never** treat a backup as verified because the job exited zero. Verify the
restore.

---

# Monitor absence, not failure

A job that stops running emits no failures at all. This is how teams discover,
mid-incident, that backups stopped three months ago.

| Alert on | Threshold |
| --- | --- |
| Age of the last successful backup | > 1.25 × the interval |
| Backup size deviation from trend | > 30% — a sudden drop means an empty backup |
| Replication lag to the backup account | Above the RPO |
| Restore-drill recency | > 100 days |
| Object Lock retention configuration drift | Any change |

| Signal | Source |
| --- | --- |
| `backup_last_success_timestamp_seconds` | Emitted by the backup job itself |
| `backup_size_bytes` | Compared against a rolling trend |
| `aws_s3_bucket_size_bytes` | Growth means lifecycle rules stopped working |
| `ReplicationLatency` (S3 CRR) | Cross-region replication falling behind |
| `pg_stat_archiver.failed_count` | WAL archiving broken → `Database/backup` |
| `restore_drill_last_success_timestamp_seconds` | Written by the drill script |
| Object Lock configuration drift | `aws s3api get-object-lock-configuration` in CI |

Also monitor the **cost** of backup storage: a lifecycle rule that stops expiring
noncurrent versions shows up as a bill before it shows up anywhere else.

---

# Anti-patterns

| Anti-pattern | Why it fails | Fix |
| --- | --- | --- |
| Only the database is backed up | Secrets, DNS, uploads unrecoverable | Inventory all state |
| Hand-created infrastructure | Exists in no backup | Declarative, in git |
| Backups in the production account | One credential loses both | Separate account |
| No immutability | Ransomware deletes the backups too | Object Lock for the retention window |
| Encryption key in the backup system | Circular dependency at restore | External KMS |
| Durability mistaken for backup | Does not protect against deletion | Versioning plus replication |
| Replication treated as backup | Deletes replicate instantly | Independent PITR copies |
| Versioning without lifecycle rules | Storage grows without bound | Expire noncurrent versions |
| Never restoring | Unknown, high failure rate | Quarterly drills |
| Alerting only on job failure | A job that stops is silent | Alert on backup age |
| Undocumented restore procedure | Only one person can recover | Written, drilled runbook |
| RPO/RTO never stated | No basis for any decision | Write both numbers first |
| Queue state assumed backed up | In-flight work silently lost | Decide and document |
| No SaaS export path | Discovered during the incident | Test the export |

---

# Checklist

- [ ] A written inventory lists every stateful asset and how it is backed up
- [ ] The inventory is reviewed quarterly
- [ ] All infrastructure is declarative and in version control
- [ ] RPO and RTO are stated per asset class
- [ ] Backups live in a separate account with separate credentials
- [ ] At least one copy is immutable for its full retention window
- [ ] Production can write backups but cannot delete them
- [ ] Backups are encrypted with keys held outside the backup system
- [ ] Object storage has versioning plus lifecycle expiry of noncurrent versions
- [ ] Cross-region replication is configured where regional failure matters
- [ ] Secrets, DNS zones and cluster state are all recoverable
- [ ] A full restore drill runs at least quarterly and is timed
- [ ] The drill is performed by someone who did not write the procedure
- [ ] Alerts fire on backup **age**, not only on job failure
- [ ] Backup size deviation and configuration drift are alerted on
- [ ] Backup storage cost is monitored
