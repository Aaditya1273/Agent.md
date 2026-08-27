---
targetModels:
  - "DeepSeek V4"
  - "DeepSeek V3.2"
  - "DeepSeek R1"
  - "DeepSeek V3 Family"
  - "Future DeepSeek Models"
name: email
category: Backend
description: Sending transactional email that arrives — SPF/DKIM/DMARC, provider choice, templating, bounce handling, and keeping the sending domain reputable.
license: MIT
author: Agent.md maintainers
last-verified: 2026-08-23
reviewed-by: unreviewed
---
<!-- Generated from models/_canonical by scripts/build-model-variants.js.
     Edit the canonical source, not this file. Structure adapted for DeepSeek per deep-research.md. -->


# Purpose

Rules for transactional email — password resets, receipts, notifications. The hard
part is not sending; it is **arriving**. An email that lands in spam is worse than
one that fails loudly, because nothing tells you.

Marketing email is a different discipline with different consent rules. Keep it on
a different subdomain so its reputation cannot damage your password resets.

---

# Authenticate the domain, or nothing else matters

Three DNS records. Without all three, major providers will filter you regardless
of content.

```dns
; SPF — which servers may send as this domain. One record only.
example.com.  TXT  "v=spf1 include:_spf.provider.com -all"

; DKIM — the provider's public key; it signs each message
sel1._domainkey.example.com.  CNAME  sel1.domainkey.provider.com.

; DMARC — what to do when SPF and DKIM fail, and where to report
_dmarc.example.com.  TXT  "v=DMARC1; p=reject; rua=mailto:dmarc@example.com; pct=100"
```

| Record | Purpose | Common mistake |
| --- | --- | --- |
| SPF | Authorises sending servers | Two SPF records — this is a permanent failure; merge them |
| DKIM | Cryptographic signature over the message | Rotating keys without publishing the new selector first |
| DMARC | Policy plus reporting | Leaving `p=none` forever; it enforces nothing |
| BIMI | Logo display | Requires `p=quarantine`/`reject` first |

Roll DMARC out as `p=none` → `p=quarantine; pct=25` → `p=reject`, reading the
aggregate reports at each step. Going straight to `p=reject` will silently break
whatever legitimate sender you forgot about.

Use a **subdomain** for sending (`mail.example.com`). It isolates reputation and
keeps your root domain's DNS simpler.

---

# Use a provider, and one abstraction

Do not run your own SMTP server. Deliverability depends on IP reputation, feedback
loops and relationships with mailbox providers that a provider already has.

```ts
interface Mailer {
  send(msg: { to: string; template: TemplateId; data: Record<string, unknown>;
              idempotencyKey: string }): Promise<{ messageId: string }>;
}
```

One interface, one implementation per provider. Providers have outages and price
changes, and a direct SDK call from forty places is a migration nobody schedules.

- **Warm up** a new sending domain or dedicated IP gradually. A cold domain sending
  50,000 messages on day one is filtered as a spam source.
- A **shared IP pool** is usually better for low volume — you inherit the
  provider's reputation instead of building your own. A dedicated IP only pays off
  above a consistent high volume.

---

# Send asynchronously and idempotently

```ts
// The request must not depend on the provider's availability or latency
await queue.add("send-email", { userId, template: "password-reset" },
                { jobId: `pwreset:${userId}:${tokenId}` });
```

- Never send inline in a request handler. A slow provider becomes your latency,
  and an outage becomes your outage.
- Enqueue **after** the transaction commits — a receipt for an order that rolled
  back is a support ticket. → `Backend/background-jobs`
- Deduplicate: retries must not send the message twice. The deterministic job id
  above is the guard.
- Retry on `5xx` and timeouts only. A `4xx` for an invalid address is permanent —
  retrying it damages your reputation.

---

# Content and templating

- **Multipart: HTML and plain text.** A missing text part is a spam signal, and
  some clients only render text.
- Table-based layout with inline CSS. Email clients are twenty years behind
  browsers; `flexbox`, `grid` and external stylesheets do not work reliably.
- Width around 600px, images with `alt` text, and a design that still communicates
  with images blocked — which is the default in many clients.
- **Escape every interpolated value.** A user-controlled display name in an HTML
  email is an injection vector, especially where the email is later viewed in a
  web client. → `Security/xss`
- Never put a secret in a URL you also log, and never email a password.
- Localise using the recipient's stored preference, not the sending server's.
- Test rendering across clients (Litmus, Email on Acid, or at minimum Gmail,
  Outlook, Apple Mail) — Outlook's rendering engine will break a layout that works
  everywhere else.

---

# Handle bounces and complaints

Ignoring these is how a sending domain gets blocked.

| Event | Action |
| --- | --- |
| Hard bounce | Mark the address invalid; **never send to it again** |
| Soft bounce | Retry with backoff; after N, treat as hard |
| Spam complaint | Suppress immediately, all categories |
| Unsubscribe | Suppress for that category; honour `List-Unsubscribe` |

Consume the provider's webhooks and maintain a **suppression list** checked before
every send. → `API/webhooks`

Continuing to send to hard-bounced addresses is the fastest way to be classified
as a spam source, because it is exactly what a spammer's list looks like.

Watch bounce rate (< 2%), complaint rate (< 0.1%), and delivery rate. Alert when
they move — a deploy that breaks the unsubscribe link shows up here first.

| Header | Why it matters |
| --- | --- |
| `List-Unsubscribe` | Required by Gmail and Yahoo at volume; enables the native unsubscribe button |
| `List-Unsubscribe-Post: List-Unsubscribe=One-Click` | Makes that button one-click, as required |
| `Message-ID` | Correlates provider events back to your send record |
| `In-Reply-To` / `References` | Threads replies correctly in the client |
| `Reply-To` | A monitored address — `noreply@` discards real user replies |
| `Return-Path` | Where bounces go; the provider sets it, and it must align for SPF |
| `Precedence: bulk` | Suppresses vacation auto-responders on non-critical mail |

Verify your setup against a diagnostic tool (`mail-tester.com`, MXToolbox, or
`dig TXT _dmarc.example.com`) before launch, and re-verify after any DNS change.

---

# Anti-patterns

| Anti-pattern | Why it fails | Fix |
| --- | --- | --- |
| No SPF/DKIM/DMARC | Filtered regardless of content | All three, validated |
| Two SPF records | Permanent SPF failure | Merge into one |
| `p=none` indefinitely | DMARC enforces nothing | Progress to `reject` |
| Running your own SMTP | Reputation you cannot build | Use a provider |
| Marketing and transactional on one domain | Campaign complaints block password resets | Separate subdomains |
| Sending inline in a request | Provider latency and outages become yours | Queue it |
| Sending before commit | Receipts for rolled-back work | Enqueue after commit |
| No deduplication | Retries send duplicates | Deterministic job id |
| Retrying hard bounces | Reputation damage | Suppress permanently |
| No suppression list | Repeated sends to dead addresses | Consume bounce webhooks |
| HTML only | Spam signal; unreadable in text clients | Multipart |
| Modern CSS in email | Breaks in Outlook and others | Tables and inline styles |
| Unescaped user content | Injection in the recipient's client | Escape everything |
| Design that needs images | Images are blocked by default | Meaningful without them |
| Ignoring bounce and complaint rates | Blocked before you notice | Monitor and alert |
| Cold domain at full volume | Classified as a spam source | Warm up gradually |

---

# Checklist

- [ ] SPF, DKIM and DMARC are published and verified for the sending domain
- [ ] Exactly one SPF record exists
- [ ] DMARC has progressed beyond `p=none` and reports are reviewed
- [ ] Transactional and marketing mail use separate subdomains
- [ ] A provider is used; no self-hosted SMTP
- [ ] New domains and IPs are warmed up gradually
- [ ] All sending goes through one internal interface
- [ ] Email is sent from a background job, after the transaction commits
- [ ] Sends are deduplicated by a deterministic key
- [ ] Retries cover transient failures only
- [ ] Every message is multipart HTML and plain text
- [ ] Templates use table layout and inline CSS, tested in real clients
- [ ] Emails remain useful with images blocked
- [ ] All interpolated values are escaped
- [ ] Bounce, complaint and unsubscribe webhooks feed a suppression list
- [ ] The suppression list is checked before every send
- [ ] Bounce rate, complaint rate and delivery rate are monitored and alerted
