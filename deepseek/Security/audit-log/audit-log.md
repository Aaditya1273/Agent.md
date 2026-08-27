---
targetModels:
  - "DeepSeek V4"
  - "DeepSeek V3.2"
  - "DeepSeek R1"
  - "DeepSeek V3 Family"
  - "Future DeepSeek Models"
name: audit-log
category: Security
description: Recording security-relevant events so a breach is detectable — what to log, what never to log, and making the record tamper-evident.
license: MIT
author: Agent.md maintainers
last-verified: 2026-08-23
reviewed-by: unreviewed
---
<!-- Generated from models/_canonical by scripts/build-model-variants.js.
     Edit the canonical source, not this file. Structure adapted for DeepSeek per deep-research.md. -->


# Purpose

Rules for the audit trail: the record of who did what, to which object, and when.

This is distinct from application logging. Debug logs exist to fix bugs and may be
sampled, truncated or dropped. **An audit log is evidence** — it must be complete,
attributable, immutable and retained.

OWASP lists insufficient logging as a Top 10 category precisely because attacks
are typically discovered months late, and the reason is usually that nothing
recorded them. → `Security/owasp`

---

# What to record

Every entry answers: **who, what, which object, when, from where, and did it
succeed.**

```json
{
  "timestamp": "2026-08-23T14:32:11.482Z",
  "actor": { "id": "usr_9f3", "type": "user", "ip": "203.0.113.9" },
  "action": "invoice.delete",
  "resource": { "type": "invoice", "id": "inv_44c", "tenant": "org_12" },
  "outcome": "denied",
  "reason": "insufficient_permission",
  "requestId": "req_7b2e",
  "userAgent": "Mozilla/5.0 …"
}
```

Name actions with a stable, hierarchical verb so the trail is queryable:
`auth.login`, `auth.mfa_challenge`, `user.role_change`, `invoice.delete`,
`apikey.issue`, `export.download`. Avoid free text like `"user did a thing"` —
during an incident you need `WHERE action = 'apikey.issue'` to return in
milliseconds.

Events that must always be recorded:

| Category | Examples |
| --- | --- |
| Authentication | Login success and failure, logout, MFA enrolment and challenge |
| Authorisation | **Denials** especially — a spike is an attack or a broken deploy |
| Account lifecycle | Creation, deletion, password change, email change, role change |
| Privilege | Grants, revocations, impersonation, break-glass access |
| Sensitive data | Reads and exports of regulated records |
| Configuration | Security settings, API key issuance and revocation, webhook changes |
| Administrative | Anything an operator does to another user's data |

**Never** log only failures. A successful unauthorised action is invisible without
the success record, and "who read this record" is the question an incident asks.

---

# What never to appear

| Never log | Why |
| --- | --- |
| Passwords, even failed attempts | Plaintext credentials in log storage |
| Session tokens, API keys, JWTs | The log becomes a credential store |
| Full card numbers, CVV | Regulatory violation |
| Government identifiers, health data | Regulatory violation; use a reference |
| Full request bodies on auth routes | Captures the credential |
| `process.env` | Every secret at once → `Security/secret-management` |

Redact at the point of writing, with an allow-list of fields to include rather
than a deny-list of fields to strip:

```js
const AUDIT_FIELDS = ["id", "email", "role", "tenantId"];   // allow-list

function auditSafe(obj) {
  return Object.fromEntries(
    Object.entries(obj).filter(([k]) => AUDIT_FIELDS.includes(k))
  );
}
```

A deny-list misses the field somebody adds next sprint. An allow-list fails closed.

---

# Integrity

An attacker's first move after gaining access is to remove the evidence.

- **Ship logs off-host immediately.** A log that only exists on the compromised
  machine is not evidence.
- Write to **append-only** storage — an S3 bucket with object lock, a
  write-once-read-many store, or a managed log service with retention locks.
- The application's own database credentials should be able to **insert** audit
  rows and not to `UPDATE` or `DELETE` them.
- For high-value trails, **chain the entries** so any edit is detectable:

```js
// Each entry commits to its predecessor — removing or altering one breaks
// every hash after it.
const entryHash = crypto
  .createHash("sha256")
  .update(previousHash + JSON.stringify(entry))
  .digest("hex");
```

Storage choices that make deletion hard by design:

| Store | Mechanism |
| --- | --- |
| S3 / GCS | `Object Lock` in `COMPLIANCE` mode with a retention period |
| PostgreSQL | Separate role holding `INSERT` only; no `UPDATE`/`DELETE` grant |
| CloudWatch / Stackdriver | Retention policy plus a resource policy denying `DeleteLogGroup` |
| SIEM | Ingest-only credential; the shipper cannot read or purge |

```sql
-- The application role can add to the trail and cannot rewrite it.
GRANT INSERT ON audit_log TO app_writer;
REVOKE UPDATE, DELETE, TRUNCATE ON audit_log FROM app_writer;
```

- Use a **trusted clock**. Timestamps from an unsynchronised host make a timeline
  unreconstructable; require NTP and record in UTC with an explicit offset.

---

# Making it useful

A log nobody reads is storage, not security.

Fields worth standardising across every service, because they are the ones an
incident query filters on: `timestamp`, `actor.id`, `actor.ip`, `action`,
`resource.type`, `resource.id`, `resource.tenant`, `outcome`, `requestId`,
`schemaVersion`. Emit them as structured JSON — `pino`, `zerolog`, `structlog` —
never as an interpolated string.

- Assign a **request id** at the edge and propagate it through every service so a
  single action can be reconstructed across a distributed call path.
- **Alert on patterns**, not on individual lines: a burst of authorisation
  denials, a first login from a new country, a privilege grant outside change
  hours, a spike in export volume.
- **Test detection.** Perform an unauthorised action in staging and confirm the
  alert fires. Detection that has never been exercised does not work.
- Set retention deliberately — often 1 year, longer where regulation requires it —
  and ensure deletion is automatic once the period lapses.
- Give the log a **schema and a version**. Ad-hoc string messages cannot be queried
  during the incident when queries matter most.

---

# Privacy

Audit logs contain personal data and are subject to the same regulation as any
other store.

- Restrict read access; log the reads of the audit log itself.
- Store a **user reference**, not a copy of the user's personal details.
- Have an answer for erasure requests before one arrives — usually pseudonymising
  the actor reference while retaining the event record, since the legal basis for
  keeping security records generally differs from that for the account.

---

# Anti-patterns

| Anti-pattern | Why it fails | Fix |
| --- | --- | --- |
| Logging failures only | Successful unauthorised actions are invisible | Log outcome on both paths |
| `console.log(req.body)` on login | Captures the password | Allow-list audit fields |
| Deny-list redaction | Misses the next field added | Allow-list |
| Logs kept only on the host | Attacker deletes the evidence | Ship off-host immediately |
| App credentials can `DELETE` audit rows | Trail is editable by the compromise | Insert-only permissions |
| No request id | Cannot reconstruct a distributed action | Propagate a correlation id |
| Free-text messages | Unqueryable during an incident | Structured, versioned schema |
| Alerts that have never fired | Detection unverified | Exercise it in staging |
| Local time, unsynchronised clocks | Timeline cannot be reconstructed | NTP, UTC, explicit offset |
| Indefinite retention | Regulatory exposure grows | Automatic deletion at term |

---

# Checklist

- [ ] Authentication, authorisation, privilege and account-lifecycle events are recorded
- [ ] Both successful and denied outcomes are logged
- [ ] Entries carry actor, action, resource, tenant, outcome, time and source IP
- [ ] Redaction is an allow-list; no credential or regulated identifier is ever written
- [ ] Logs are shipped off-host and stored append-only
- [ ] Application credentials cannot update or delete audit records
- [ ] High-value trails are hash-chained
- [ ] Timestamps are UTC from an NTP-synchronised clock
- [ ] A request id is propagated across services
- [ ] Alerts exist for denial bursts, privilege grants and export spikes
- [ ] At least one alert has been triggered deliberately and observed to fire
- [ ] Retention is defined, enforced automatically, and privacy-reviewed
