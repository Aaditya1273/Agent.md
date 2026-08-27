---
targetModels:
  - "DeepSeek V4"
  - "DeepSeek V3.2"
  - "DeepSeek R1"
  - "DeepSeek V3 Family"
  - "Future DeepSeek Models"
name: owasp
category: Security
description: The OWASP Top 10 as an engineering checklist — each category named, what it looks like in code, and the control that actually prevents it.
license: MIT
author: Agent.md maintainers
last-verified: 2026-08-23
reviewed-by: unreviewed
---
<!-- Generated from models/_canonical by scripts/build-model-variants.js.
     Edit the canonical source, not this file. Structure adapted for DeepSeek per deep-research.md. -->


# Purpose

A working pass over the OWASP Top 10 (2021 edition) categories. Each entry names
the risk, shows what it looks like in real code, and points at the control.

This is a triage map, not a substitute for the deep packages. Where a category
has one, follow the link — `A03` alone spans `Security/sql-injection`,
`Security/xss` and `Security/command-injection`.

---

# A01 — Broken Access Control

The most common category, and the one with the highest real-world impact.

An authenticated user reaches an object that is not theirs by changing an
identifier. Route-level checks do not prevent it; the query must be scoped.

```js
// Broken — the route is guarded, the row is not
const invoice = await db.invoice.findUnique({ where: { id: req.params.id } });

// Fixed — ownership is part of the lookup
const invoice = await db.invoice.findFirst({
  where: { id: req.params.id, organisationId: req.user.organisationId },
});
```

Controls: deny by default; scope every query; return `404` not `403`; never accept
`role` or tenant id from the client. → `Security/authorization`

# A02 — Cryptographic Failures

Sensitive data exposed through weak or absent cryptography.

Controls: TLS everywhere with HSTS; `argon2id` for passwords, never `md5`/`sha1`;
AES-GCM or ChaCha20-Poly1305 for data, never ECB; keys in a KMS; never invent a
scheme. → `Security/encryption`, `Security/https`

# A03 — Injection

Untrusted data parsed as code. SQL, OS commands, LDAP, XPath, template engines
and XSS all sit here.

Controls: parameterised queries; argument arrays instead of shells; contextual
output encoding; allow-list any dynamic identifier.
→ `Security/sql-injection`, `Security/command-injection`, `Security/xss`

# A04 — Insecure Design

A flaw in what was specified, not how it was built. No amount of correct
implementation fixes a design that permits unlimited password resets or trusts a
client-supplied price.

Controls: threat model before building; define abuse cases alongside use cases;
enforce business limits server-side; assume every client is hostile.

# A05 — Security Misconfiguration

Defaults left in place, debug enabled in production, verbose errors, unnecessary
features exposed.

```
# Wrong — a stack trace tells an attacker your framework, version and paths
NODE_ENV=development
```

Controls: harden defaults; disable directory listing; strip stack traces from
responses; remove sample apps and default accounts; review headers.
→ `Security/headers`

# A06 — Vulnerable and Outdated Components

The dependency with a known CVE that nobody upgraded.

```bash
npm audit --omit=dev          # fail the build on high and critical
```

Controls: an SBOM; automated dependency updates; audit in CI; remove unused
dependencies; track upstream advisories.

# A07 — Identification and Authentication Failures

Credential stuffing, weak recovery, session fixation, missing MFA.

Controls: breach-screen passwords; rate limit per account and per IP; rotate the
session identifier on login; identical responses for unknown accounts; offer
WebAuthn. → `Security/authentication`, `Security/passwords`

# A08 — Software and Data Integrity Failures

Trusting code or data whose provenance is unverified — unsigned updates,
untrusted CI plugins, insecure deserialization.

```js
// Never deserialize untrusted input into live objects
const data = JSON.parse(body);        // data, inert
// not: eval(body), or a deserializer that reconstructs arbitrary classes
```

Controls: lockfiles with integrity hashes; pin CI actions by commit SHA; sign
artifacts; never deserialize untrusted input into executable objects.

# A09 — Security Logging and Monitoring Failures

The breach nobody noticed. Median dwell time is measured in months precisely
because this control is missing.

Controls: log authentication outcomes, authorisation denials and privilege
changes with subject, object and action; ship logs off-host; alert on anomalies;
never log secrets, tokens or passwords. → `Security/audit-log`

# A10 — Server-Side Request Forgery

The server fetches a URL an attacker chose, reaching internal services the
attacker cannot.

```js
// The classic target: cloud instance metadata
// http://169.254.169.254/latest/meta-data/iam/security-credentials/
```

Controls: allow-list destination hosts; resolve DNS and check the resulting IP
against private ranges — including `169.254.169.254`, `127.0.0.0/8`, `10/8`,
`172.16/12`, `192.168/16`; block redirects or re-validate each hop; require IMDSv2.

---

# Using this list

- Treat it as **coverage**, not a ranking of your specific risk. Your threat model
  decides priority.
- The Top 10 is a **floor**. Passing it is not a security programme.
- Map each category to a **test**, not a document. `A01` becomes a test that user
  B cannot read user A's invoice.

---

# Anti-patterns

| Anti-pattern | Why it fails | Fix |
| --- | --- | --- |
| Treating the list as a compliance checkbox | Categories are broad; ticking is not testing | One test per category |
| Route-level access checks only | `A01` — IDOR via identifier change | Scope the query |
| `md5` or `sha1` for passwords | `A02` — GPU-fast | `argon2id` |
| Sanitising input instead of parameterising | `A03` — bypasses exist for every filter | Bind values |
| Debug mode or stack traces in production | `A05` — leaks framework, version, paths | Generic errors |
| Ignoring `npm audit` output | `A06` — known CVEs stay shipped | Fail the build |
| Deserializing untrusted input | `A08` — remote code execution | `JSON.parse` only |
| No log of authorisation denials | `A09` — attacks go unseen | Log subject, object, action |
| Fetching a user-supplied URL unchecked | `A10` — SSRF to instance metadata | Allow-list plus IP checks |

---

# Checklist

- [ ] Every data access is scoped by owner or tenant in the query (A01)
- [ ] Passwords use `argon2id`; transport is TLS with HSTS (A02)
- [ ] All queries parameterised; all output contextually encoded (A03)
- [ ] Abuse cases defined and business limits enforced server-side (A04)
- [ ] Debug disabled, stack traces stripped, defaults hardened (A05)
- [ ] Dependency audit runs in CI and fails on high or critical (A06)
- [ ] Breach screening, rate limiting and session rotation in place (A07)
- [ ] Lockfiles with integrity hashes; CI actions pinned by SHA (A08)
- [ ] Auth outcomes and authorisation denials logged and shipped off-host (A09)
- [ ] Outbound fetches allow-listed and checked against private IP ranges (A10)
