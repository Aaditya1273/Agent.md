---
targetModels:
  - "Claude Fable 5"
  - "Claude Opus 5"
  - "Claude Sonnet 5"
  - "Claude 5 Family"
  - "Future Claude Models"
name: webhooks
category: API
description: Sending and receiving webhooks reliably — HMAC signatures, replay protection, at-least-once delivery, retries with backoff, and idempotent consumers.
license: MIT
author: Agent.md maintainers
last-verified: 2026-08-23
reviewed-by: unreviewed
---
<!-- Generated from models/_canonical by scripts/build-model-variants.js.
     Edit the canonical source, not this file. Structure adapted for Claude per deep-research.md. -->
# Purpose

<purpose>
Rules for webhooks in both directions. A webhook is an HTTP request to a server
you do not control, about an event that already happened. Two facts drive
everything:

- **Delivery is at-least-once.** Duplicates are normal, not a bug.
- **The receiver's endpoint is public.** Anyone can POST to it, so the payload
  must be cryptographically attributable.

---
</purpose>

# Signing (sender)

<rules>
```
POST /hooks/acme HTTP/1.1
Webhook-Id: evt_01J8ZQ3M7K
Webhook-Timestamp: 1756392779
Webhook-Signature: v1,k3Yb2Q…base64…
Content-Type: application/json
```

Sign `id.timestamp.body` with HMAC-SHA256 over the **raw request bytes**:

```ts
const signed = `${id}.${timestamp}.${rawBody}`;
const sig = crypto.createHmac("sha256", secret).update(signed).digest("base64");
```

Requirements:

- Include the **timestamp inside the signed payload**, so it cannot be altered.
- Include a unique **event id**, so receivers can deduplicate.
- Support **multiple active signatures** (`v1,sigA v1,sigB`) so a secret can be
  rotated without a coordinated cutover.
- One secret per endpoint, generated with a CSPRNG, shown once.
  → `Security/secret-management`

**Never** sign a re-serialised body. `JSON.stringify(req.body)` reorders keys and
changes whitespace; the receiver's HMAC will not match. Sign and verify the exact
bytes on the wire.

---
</rules>

# Verifying (receiver)

<rules>
```ts
// Express: the raw body is required, so capture it before JSON parsing
app.post("/hooks/acme", express.raw({ type: "application/json" }), (req, res) => {
  const ts = Number(req.get("Webhook-Timestamp"));
  if (Math.abs(Date.now() / 1000 - ts) > 300) return res.sendStatus(400);  // replay window

  const expected = crypto
    .createHmac("sha256", process.env.WEBHOOK_SECRET)
    .update(`${req.get("Webhook-Id")}.${ts}.${req.body}`)
    .digest();
  const given = Buffer.from(parseSignature(req.get("Webhook-Signature")), "base64");

  if (expected.length !== given.length ||
      !crypto.timingSafeEqual(expected, given)) return res.sendStatus(401);

  enqueue(JSON.parse(req.body));    // hand off, do not process inline
  res.sendStatus(200);              // acknowledge fast
});
```

Four things this gets right, each of which is commonly wrong:

1. **Raw body.** Verification against a parsed-and-restringified body fails
   intermittently and inexplicably.
2. **Timestamp window** (±5 minutes) — without it a captured request is replayable
   forever.
3. **`timingSafeEqual`**, with a length check first (it throws on mismatched
   lengths). `===` on a signature leaks it byte by byte under timing analysis.
4. **Acknowledge, then process.** Do the work in a background job.
   → `Backend/queues`

**Never** trust any field in the body — including a `user_id` or an amount —
before the signature verifies. And never process an unverified payload "just to
log it": that is still parsing attacker-controlled input.

---
</rules>

# Consumers must be idempotent

<rules>
Duplicates arrive because the sender retried after your `200` was lost in transit.
The event id is the deduplication key.

```sql
INSERT INTO webhook_events (id, received_at) VALUES ($1, now())
ON CONFLICT (id) DO NOTHING;      -- zero rows affected means already processed
```

Ordering is **not** guaranteed. A `subscription.updated` may arrive before
`subscription.created`. Handle it:

- Include a monotonic `sequence` or the resource's `updated_at` in the payload and
  discard events older than the state you already hold.
- Or treat the webhook as a **notification only** and re-fetch current state from
  the sender's API. This is the most robust pattern and sidesteps ordering
  entirely.

---
</rules>

# Delivery (sender)

<rules>
| Concern | Rule |
| --- | --- |
| Retries | Exponential backoff with jitter: 1m, 5m, 30m, 2h, 6h, 24h |
| Retry on | Timeouts, connection errors, `5xx`, `429` |
| Do not retry | `4xx` other than `429` and `408` — the request is wrong, not late |
| Timeout | 5–10 seconds. A slow receiver must not hold your worker |
| Disable | After N consecutive days of failure, with notification first |
| Concurrency | Bound per endpoint so one slow receiver cannot starve the fleet |

Provide a **dead-letter view and manual replay** in the dashboard. Every
integration eventually needs to reprocess a window of events, and without a replay
button that becomes a support engineering task.

Publish your **source IP ranges** so receivers can allowlist them, and keep them
stable.

Log every attempt with the response status, latency and body prefix, and expose
that log to the customer. This is the single highest-value support feature a
webhook system has.

---
</rules>

# Endpoint design

<rules>
- Return `200`/`204` quickly — under a second. A `202` is also fine.
- Any non-2xx means "retry"; be sure that is what you intend.
- Receivers should respond `200` to an event type they do not recognise, not
  `400` — otherwise adding a new event type breaks existing integrations.
- Guard against SSRF when a customer supplies the destination URL: reject private
  address ranges, link-local addresses, and redirects to them, resolving DNS at
  request time.

---
</rules>

# Anti-patterns

<antipatterns>
| Anti-pattern | Why it fails | Fix |
| --- | --- | --- |
| No signature | Anyone can POST forged events | HMAC over raw bytes |
| Signing a re-serialised body | Key order and whitespace differ | Sign the wire bytes |
| No timestamp in the signature | Captured requests replay forever | Signed timestamp + window |
| `===` on signatures | Timing side channel | `timingSafeEqual` |
| Processing before verifying | Attacker-controlled input in business logic | Verify first |
| Processing inline | Sender times out and retries; duplicates multiply | Enqueue, then `200` |
| Assuming exactly-once | Duplicates are normal | Deduplicate by event id |
| Assuming ordered delivery | Out-of-order updates corrupt state | Sequence check or re-fetch |
| Retrying on `4xx` | Hammering a permanently broken endpoint | Retry only `5xx`/`429`/timeouts |
| Fixed-interval retries | Synchronised thundering herd | Exponential backoff with jitter |
| No replay tooling | Every gap becomes a support escalation | Dead-letter view + replay |
| `400` on unknown event types | New event types break integrations | Ignore and return `200` |
| Unvalidated customer-supplied URL | SSRF into internal networks | Reject private/link-local ranges |

---
</antipatterns>

# Checklist

<checklist>
- [ ] Every delivery is HMAC-signed over the raw body, id and timestamp
- [ ] Multiple concurrent signatures are supported for secret rotation
- [ ] Receivers verify against the raw bytes, before parsing
- [ ] A timestamp tolerance window rejects replays
- [ ] Signature comparison is constant-time with a length check
- [ ] Receivers acknowledge fast and process asynchronously
- [ ] Every event carries a unique id, and consumers deduplicate on it
- [ ] Out-of-order delivery is handled by sequence check or state re-fetch
- [ ] Retries use exponential backoff with jitter, only on retryable statuses
- [ ] Per-endpoint concurrency is bounded and a delivery timeout is set
- [ ] Failing endpoints are disabled after notification, not silently
- [ ] Delivery attempts are logged and visible to the customer
- [ ] A dead-letter view with manual replay exists
- [ ] Unknown event types are ignored rather than rejected
- [ ] Customer-supplied destination URLs are validated against SSRF
</checklist>
