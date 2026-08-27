---
targetModels:
  - "Claude Fable 5"
  - "Claude Opus 5"
  - "Claude Sonnet 5"
  - "Claude 5 Family"
  - "Future Claude Models"
name: notifications
category: Backend
description: A notification system across email, push, SMS and in-app — one event model, user preferences, deduplication, digests, and delivery you can debug.
license: MIT
author: Agent.md maintainers
last-verified: 2026-08-23
reviewed-by: unreviewed
---
<!-- Generated from models/_canonical by scripts/build-model-variants.js.
     Edit the canonical source, not this file. Structure adapted for Claude per deep-research.md. -->
# Purpose

<purpose>
Rules for notifying users across channels. The engineering problem is not sending
to any one channel — it is having **one event produce the right message on the
right channels for each user**, without duplicates and without becoming noise.

Channel-specific delivery is `Backend/email`. This package is the layer above.

---
</purpose>

# One event, many channels

<rules>
Producers emit an **event**. They do not decide the channel, the copy, or whether
the user wants it.

```ts
await notify({
  type: "order.shipped",              // the event, not "send an email"
  recipientId: order.userId,
  tenantId: order.tenantId,
  data: { orderId: order.id, carrier, trackingUrl },
  idempotencyKey: `order.shipped:${order.id}`,
  occurredAt: new Date(),
});
```

The notification service then resolves, in order:

1. **Preferences** — does this user want `order.shipped`, on which channels?
2. **Templates** — copy per event type per channel, per locale.
3. **Deduplication** — has this `idempotencyKey` already been delivered?
4. **Batching** — immediate, or held for a digest?
5. **Delivery** — enqueue per channel, with per-channel retry.

Calling `sendEmail()` from a business service couples the domain to a channel and
guarantees that the next channel means editing every call site.

---
</rules>

# Preferences, and the ones you cannot override

<rules>
A preference matrix of event type × channel, with sane defaults:

| | In-app | Push | Email | SMS |
| --- | --- | --- | --- | --- |
| `order.shipped` | on | on | on | off |
| `comment.mention` | on | on | digest | off |
| `security.new_login` | on | on | **forced** | off |
| `billing.payment_failed` | on | off | **forced** | off |

Two categories can never be disabled: **security** notices and **legal/billing**
notices. Everything else is the user's choice, and the default must be
conservative — a noisy default trains users to mute the whole channel, including
the ones that matter.

- Honour quiet hours in the **user's** timezone, not the server's.
- Every non-forced notification carries an unsubscribe path that works in one
  click and is honoured immediately. `List-Unsubscribe` for email is required by
  major providers at volume.
- Store preference changes with a timestamp — "I never agreed to this" is a
  compliance question. → `Security/audit-log`

---
</rules>

# Deduplication and batching

<rules>
Duplicate notifications are the fastest route to a muted channel.

- Deduplicate on `idempotencyKey` within a window. Retries, replays and
  at-least-once queues all cause repeats. → `Backend/queues`
- **Collapse** related events: fifteen comments on one thread is one notification
  saying "15 new comments", not fifteen pushes.
- **Digest** low-urgency types: hold and send hourly or daily, at a time chosen
  in the user's timezone.
- Suppress a notification about an action the user just performed themselves.
- Rate-limit per user per channel as a hard backstop, regardless of event volume.

Concretely: a `collapseKey` groups events that supersede one another
(`thread:${threadId}`), a `digestWindow` holds them (`PT1H`, `P1D`), and a
`maxPerHour` per `(recipientId, channel)` caps the total. FCM's `collapse_key`
and APNs' `apns-collapse-id` do the equivalent at the device, replacing an
undelivered notification rather than stacking another one on the lock screen.

Urgency decides the path:

| Urgency | Channel | Timing |
| --- | --- | --- |
| Critical (security, payment failed) | Push + email | Immediate, ignores digest |
| Actionable (mention, assignment) | Push + in-app | Immediate, collapsible |
| Informational (weekly summary) | Email | Digest |

---
</rules>

# Channel realities

<rules>
| Channel | Constraint |
| --- | --- |
| Push | Tokens expire and are revoked; a `NotRegistered` response means delete the token, not retry |
| Push | Payload limits (~4 KB APNs); send an id and fetch detail in-app |
| SMS | Costly, regulated, and consent rules differ by country; use only for OTP and critical alerts |
| SMS | Always include the sender's identity; never include a link a phishing victim could follow blindly |
| In-app | Needs read state, pagination and a bounded retention policy |
| Email | Deliverability, suppression lists → `Backend/email` |
| Web push | Requires an explicit permission prompt; ask in context, never on first load |

```ts
// Per-channel adapters behind one interface. A permanent rejection deletes the
// destination; a transient one retries. Conflating them is how dead tokens
// accumulate and how real failures get silently dropped.
const PERMANENT = new Set(["NotRegistered", "InvalidRegistration",
                           "Unregistered", "BadDeviceToken", "hard_bounce"]);

async function deliver(channel: Channel, msg: Message) {
  try {
    return await adapters[channel].send(msg);
  } catch (err) {
    if (PERMANENT.has(err.code)) { await suppress(msg.recipientId, channel, err.code); return; }
    throw err;                                  // transient — the queue retries
  }
}
```

Push token hygiene matters: an accumulating list of dead tokens slows every send
and skews delivery metrics. Delete on the first permanent rejection.

---
</rules>

# Observability and debugging

<rules>
"Did the customer get the email?" must be answerable in one query.

Record per notification: event type, recipient, channel, template version,
decision (sent / suppressed / deduplicated / digested), provider message id,
delivery status, and open or click where available.

| Alert | Meaning |
| --- | --- |
| Delivery failure rate per channel | A provider or credential problem |
| Suppression rate rising | Preferences or bugs are silencing real notifications |
| Unsubscribe rate rising | The notification is unwanted; copy or frequency is wrong |
| Queue age per channel | Notifications arriving too late to be useful |

```sql
-- One row per notification decision. This table is the answer to
-- "did the customer get it?", and it must be written even when nothing is sent.
CREATE TABLE notification_deliveries (
  id               uuid PRIMARY KEY,
  event_type       text        NOT NULL,
  recipient_id     uuid        NOT NULL,
  channel          text        NOT NULL,   -- email | push | sms | in_app
  decision         text        NOT NULL,   -- sent | suppressed | deduplicated | digested
  reason           text,                   -- 'preference_off', 'quiet_hours', 'hard_bounce'
  idempotency_key  text        NOT NULL,
  provider_msg_id  text,
  status           text,                   -- queued | delivered | bounced | failed
  created_at       timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX ON notification_deliveries (idempotency_key, channel);
CREATE INDEX ON notification_deliveries (recipient_id, created_at DESC);
```

The unique index on `(idempotency_key, channel)` is the deduplication mechanism
itself, not just a record of it — an `ON CONFLICT DO NOTHING` insert that affects
zero rows means the notification was already delivered.

Provide an internal view showing every notification for a user with the reason it
was or was not sent. Without it, every "I didn't get it" report becomes a
database archaeology session.

---
</rules>

# Anti-patterns

<antipatterns>
| Anti-pattern | Why it fails | Fix |
| --- | --- | --- |
| Business code calling `sendEmail()` | Couples domain to channel; new channels touch every call site | Emit an event |
| Channel chosen by the producer | Ignores user preference | Resolved by the notification service |
| No preference model | All-or-nothing; users mute everything | Event type × channel matrix |
| Security notices suppressible | User cannot detect account compromise | Forced categories |
| Noisy defaults | Users mute the channel entirely | Conservative defaults |
| Server timezone for quiet hours | 3am notifications | User's timezone |
| No deduplication | Retries and replays notify repeatedly | Idempotency key with a window |
| One notification per event | Fifteen pushes for one thread | Collapse and digest |
| Notifying the actor of their own action | Obvious noise | Suppress self-caused events |
| No per-user rate limit | A loop notifies hundreds of times | Hard backstop |
| Retrying dead push tokens | Wasted sends; skewed metrics | Delete on permanent rejection |
| Full payload in a push | Exceeds size limits; leaks on a lock screen | Send an id, fetch in-app |
| SMS for non-critical messages | Expensive and regulated | OTP and critical only |
| Unbounded in-app history | Table grows forever | Retention policy |
| No delivery record | "Did they get it?" is unanswerable | Log every decision and outcome |
| Unsubscribe that does not work immediately | Compliance exposure | Honour on the next send |

---
</antipatterns>

# Checklist

<checklist>
- [ ] Producers emit events; the notification service decides channels
- [ ] Preferences are modelled as event type × channel with conservative defaults
- [ ] Security and billing notices cannot be disabled
- [ ] Quiet hours use the user's timezone
- [ ] Unsubscribe is one click and honoured immediately
- [ ] Preference changes are recorded with timestamps
- [ ] Notifications are deduplicated on an idempotency key
- [ ] Related events collapse into a single notification
- [ ] Low-urgency types are digested; critical types bypass digesting
- [ ] Self-caused notifications are suppressed
- [ ] A per-user, per-channel rate limit exists as a backstop
- [ ] Push tokens are deleted on permanent rejection
- [ ] Push payloads carry identifiers, not full content
- [ ] SMS is reserved for OTP and critical alerts, with consent rules checked
- [ ] In-app notifications have read state and a retention policy
- [ ] Every notification records channel, decision, provider id and outcome
- [ ] Delivery failure, suppression and unsubscribe rates are alerted on
- [ ] An internal per-user view explains why each notification was or was not sent
</checklist>
