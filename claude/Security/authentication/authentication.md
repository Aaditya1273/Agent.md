---
targetModels:
  - "Claude Fable 5"
  - "Claude Opus 5"
  - "Claude Sonnet 5"
  - "Claude 5 Family"
  - "Future Claude Models"
name: authentication
category: Security
description: Password storage, session handling and login-flow rules for building authentication that survives a credential-stuffing campaign and a database leak.
license: MIT
author: Agent.md maintainers
last-verified: 2026-08-23
reviewed-by: unreviewed
---
<!-- Generated from models/_canonical by scripts/build-model-variants.js.
     Edit the canonical source, not this file. Structure adapted for Claude per deep-research.md. -->
# Purpose

<purpose>
Rules for implementing authentication: how to store credentials, how to issue and
end sessions, and how to fail safely. Scope is **proving who a user is**.
Deciding what they may then do is `Security/authorization`.

Assume the database will leak. Every rule here is chosen so that a full dump of
your `users` table does not hand an attacker working credentials.

---
</purpose>

# Password storage

## Use a memory-hard KDF. Never a general-purpose hash.

<purpose>
Correct, in order of preference:

| Algorithm | Parameters | Notes |
| --- | --- | --- |
| `argon2id` | `m=19456` (19 MiB), `t=2`, `p=1` | Default choice. OWASP-recommended baseline. |
| `scrypt` | `N=2^17`, `r=8`, `p=1` | Use when `argon2id` is unavailable. |
| `bcrypt` | `cost=12` minimum | Acceptable. **Truncates at 72 bytes** — pre-hash longer inputs. |
| `PBKDF2-HMAC-SHA256` | `600000` iterations | Only when FIPS compliance forces it. |

```js
// Node — argon2id with explicit parameters, never the library defaults alone.
import argon2 from "argon2";

const hash = await argon2.hash(password, {
  type: argon2.argon2id,
  memoryCost: 19456, // KiB
  timeCost: 2,
  parallelism: 1,
});
```

**Never** use `md5`, `sha1`, `sha256`, or any bare digest for passwords. They are
designed to be fast, which is the opposite of what is required. A commodity GPU
tries billions of SHA-256 candidates per second.

**Never** implement your own salting scheme. `argon2id`, `scrypt` and `bcrypt`
generate and embed a per-password salt in the output string. A separate `salt`
column is a sign the KDF is being misused.

**Never** apply a "pepper" stored in the same database as the hashes. If it is
in the dump, it is not a secret.
</purpose>

## Verify in constant time

<rules>
Use the library's own verifier — `argon2.verify()`, `bcrypt.compare()`. Never
compare hashes with `===` or `==`. For any other secret comparison (API keys,
tokens) use `crypto.timingSafeEqual`.
</rules>

## Rehash on login when parameters change

<rules>
Store the full encoded hash string (`$argon2id$v=19$m=19456,t=2,p=1$...`), which
carries its own parameters. On successful login, if the stored parameters are
weaker than current policy, rehash the plaintext you already have in memory and
update the row. This is the only moment the plaintext is available.

---
</rules>

# Password policy

<rules>
- **Minimum 8 characters. Maximum at least 64.** A low maximum is a strong signal
  the password is being stored in a fixed-width column, unhashed.
- **Accept every Unicode character**, including spaces and emoji. Normalise to
  `NFKC` before hashing so the same typed password verifies across platforms.
- **Check against a breach corpus** (Have I Been Pwned range API, or a local
  copy). Rejecting known-breached passwords prevents more account takeover than
  any composition rule.
- **No composition rules.** Do not require a symbol, a digit and mixed case.
  They push users toward `Password1!` and provide no measurable benefit.
- **No forced rotation** on a schedule. Rotate on evidence of compromise only.

---
</rules>

# Sessions

## Prefer opaque server-side sessions

<rules>
A random session identifier in a cookie, with state held server-side, is the
default. It can be revoked instantly. Use `JWT` only when statelessness is a
real requirement — and then read `Security/jwt` for its failure modes.

```
Set-Cookie: sid=<128-bit random>; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=1209600
```

Every attribute above is load-bearing:

| Attribute | Prevents |
| --- | --- |
| `HttpOnly` | Token theft via XSS — JavaScript cannot read the cookie |
| `Secure` | Transmission over plaintext HTTP |
| `SameSite=Lax` | Most CSRF, while keeping top-level navigation logins working |
| `Path=/` | Scope confusion across sub-applications |

**Never store a session token in `localStorage`.** It is readable by any script
on the page, which converts any XSS into full account takeover. This is the most
common authentication mistake in single-page applications.

Generate identifiers with a CSPRNG — `crypto.randomBytes(32)`, not
`Math.random()`, not a timestamp, not a UUIDv1 (which encodes MAC and time).
</rules>

## Rotate on privilege change

<rules>
Issue a **new** session identifier on login, on logout, and on any privilege
elevation. Reusing the pre-login identifier is session fixation: an attacker who
plants a known identifier before login holds a valid session after it.
</rules>

## Expire on two clocks

<rules>
Enforce both an **idle timeout** and an **absolute lifetime**. Idle timeout alone
lets a stolen token live indefinitely under automated use.
</rules>

## Logout must destroy server-side state

<rules>
Clearing the cookie is not logout. Delete the session record. Otherwise a
captured token remains valid until natural expiry.

---
</rules>

# Login flow

## Fail identically for every cause

<rules>
```
</rules>

# Correct — one message, one status, one timing profile

<rules>
401  "Invalid email or password."
```

Never distinguish "no such user" from "wrong password", in the body, the status
code, or the response time. Any difference is a user-enumeration oracle. Where
the code paths differ in cost, perform a dummy KDF verification against a fixed
hash so both branches take comparable time.

Apply the same rule to password reset and signup: **"If that address exists, we
have sent a link"** — always, regardless.
</rules>

## Rate limit on two keys

<rules>
Limit per-account and per-IP independently. Per-IP alone does not stop a
distributed credential-stuffing run against one account; per-account alone lets
one IP spray many accounts.

Prefer exponential backoff or a temporary lock over a permanent one — a
permanent lock triggered by failed attempts is a denial-of-service primitive
against your own users.
</rules>

## Multi-factor

<rules>
Offer TOTP (`RFC 6238`) or WebAuthn. **Prefer WebAuthn** — it is phishing-resistant
because the credential is bound to the origin.

- SMS is a weak factor (SIM swap). Offer it only as a fallback, never as the only
  option.
- Verify TOTP against a **±1 step** window, no wider.
- **Burn each TOTP code once.** Without single-use enforcement, a code is replayable
  for its full validity window.
- Generate single-use recovery codes at enrolment and hash them like passwords.

---
</rules>

# Password reset

<rules>
- Tokens must be **single-use**, **short-lived** (≤ 60 minutes), and CSPRNG-generated.
- **Store the hash of the reset token**, not the token. A leaked database must not
  yield working reset links.
- Invalidate all existing sessions on password change, except optionally the one
  performing the change.
- Never send the new or existing password by email.

---
</rules>

# Anti-patterns

<antipatterns>
| Anti-pattern | Why it fails | Fix |
| --- | --- | --- |
| `sha256(password + salt)` | GPU-fast; billions of guesses per second | `argon2id` |
| Session token in `localStorage` | Any XSS becomes account takeover | `HttpOnly` cookie |
| "User not found" vs "wrong password" | User-enumeration oracle | One identical failure response |
| Reusing the session id after login | Session fixation | Rotate on every privilege change |
| Reset token stored in plaintext | DB leak yields working reset links | Store its hash |
| `Math.random()` for tokens | Predictable; not a CSPRNG | `crypto.randomBytes(32)` |
| Max password length of 16 | Implies storage, not hashing | Accept ≥ 64 characters |
| Forced 90-day rotation | Drives predictable increments | Rotate on compromise only |

---
</antipatterns>

# Checklist

<checklist>
- [ ] Passwords hashed with `argon2id` (`m=19456, t=2, p=1`) or an approved alternative
- [ ] No bare `md5` / `sha1` / `sha256` anywhere in the credential path
- [ ] Verification uses the library comparator, never `===`
- [ ] Hashes upgraded on login when parameters are below policy
- [ ] Maximum password length ≥ 64; all Unicode accepted; `NFKC` normalised
- [ ] Candidate passwords checked against a breach corpus
- [ ] Session cookie carries `HttpOnly`, `Secure`, `SameSite`
- [ ] No session token in `localStorage` or `sessionStorage`
- [ ] Session identifier rotated on login, logout and privilege change
- [ ] Both idle and absolute session expiry enforced
- [ ] Logout deletes server-side session state
- [ ] Login, signup and reset return identical responses for unknown accounts
- [ ] Rate limiting keyed on both account and IP
- [ ] Reset tokens single-use, ≤ 60 minutes, stored hashed
- [ ] All sessions invalidated on password change
- [ ] MFA available; WebAuthn preferred; TOTP codes single-use
</checklist>
