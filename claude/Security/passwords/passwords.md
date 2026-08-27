---
targetModels:
  - "Claude Fable 5"
  - "Claude Opus 5"
  - "Claude Sonnet 5"
  - "Claude 5 Family"
  - "Future Claude Models"
name: passwords
category: Security
description: Password policy that reduces account takeover — length over composition, breach screening, and the rules that actively make things worse.
license: MIT
author: Agent.md maintainers
last-verified: 2026-08-23
reviewed-by: unreviewed
---
<!-- Generated from models/_canonical by scripts/build-model-variants.js.
     Edit the canonical source, not this file. Structure adapted for Claude per deep-research.md. -->
# Purpose

<purpose>
Rules for password policy and handling. Storage mechanics — `argon2id`
parameters, rehash-on-login — are in `Security/authentication`; this package is
about the policy that surrounds them.

Modern guidance (NIST SP 800-63B) reversed decades of common practice. **Length
and breach screening reduce compromise. Composition rules and forced rotation do
not, and they cause harm.**

---
</purpose>

# Policy

<rules>
| Rule | Setting | Why |
| --- | --- | --- |
| Minimum length | **8**, prefer **12** for privileged accounts | The only composition factor that reliably helps |
| Maximum length | **≥ 64** | A low cap implies storage rather than hashing |
| Character set | **All Unicode**, including spaces and emoji | Restrictions shrink the space |
| Normalisation | `NFKC` before hashing | Same typed password verifies across platforms |
| Breach screening | **Required** | Blocks the credentials attackers actually try |
| Composition rules | **None** | Produce `Password1!`, measurably not stronger |
| Forced rotation | **None**, on schedule | Produces `Summer2026` → `Summer2027` |
| Rotation on compromise | **Required** | Rotate on evidence, not on a calendar |
| Hints and security questions | **Never** | Guessable and publicly researchable |

```js
// Truncation before hashing is a footgun: bcrypt silently ignores bytes past 72.
// Pre-hash so a long passphrase is not quietly shortened.
import crypto from "node:crypto";

const normalised = password.normalize("NFKC");
const prepared = Buffer.byteLength(normalised) > 72
  ? crypto.createHash("sha256").update(normalised).digest("base64")
  : normalised;
```

**Never** silently truncate. If you must cap input, reject with a clear message
rather than hashing a prefix — the user will believe a password works that does
not.

---
</rules>

# Breach screening

<rules>
Check candidates against a corpus of known-compromised passwords at signup and at
change. This prevents more takeover than every composition rule combined, because
credential stuffing uses exactly these lists.

```js
// k-anonymity: send only the first 5 hex characters of the SHA-1 hash.
// The full password and full hash never leave your service.
const sha1 = crypto.createHash("sha1").update(password).digest("hex").toUpperCase();
const [prefix, suffix] = [sha1.slice(0, 5), sha1.slice(5)];

const res = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`);
const breached = (await res.text())
  .split("\n")
  .some((line) => line.split(":")[0] === suffix);
```

SHA-1 here is a lookup key for a public range API, not password storage — that
distinction matters. Storage still uses `argon2id`.

Host the corpus locally if you cannot make outbound calls. **Never** send the
full password or full hash to a third party.

---

```js
// Policy check at signup and change. Length and breach status are the gates;
// `zxcvbn` score is advisory only.
async function assessPassword(raw) {
  const password = raw.normalize("NFKC");
  if ([...password].length < 8) return { ok: false, reason: "too_short" };
  if (Buffer.byteLength(password) > 4096) return { ok: false, reason: "too_long" };
  if (await isBreached(password)) return { ok: false, reason: "breached" };

  const { score } = zxcvbn(password);        // 0–4, guidance not a gate
  return { ok: true, score };
}
```

Note what is absent: no `/[A-Z]/` test, no `/[0-9]/` test, no `/[!@#$%]/` test.
Those regexes are the composition rules this policy deliberately rejects.
</rules>

# Handling in transit and at rest

<rules>
- **Never** log a password, even at debug level, even on failure. Scrub request
  bodies before they reach an error reporter.
- **Never** email a password, new or existing. Send a single-use reset link.
- **Never** store a recoverable form — if you can display it, so can an attacker.
  "Forgot password" must reset, never reveal.
- Accept passwords only over HTTPS, and only via `POST` body — never a query
  string, where they reach logs and `Referer` headers.
- Set `autocomplete="current-password"` / `"new-password"` so password managers
  work correctly. Fighting managers pushes users toward weaker, memorable choices.
- **Never** disable paste on a password field. It exists to defeat password
  managers and achieves only weaker passwords.

---
</rules>

## Storage recap

<rules>
Policy and storage are separate concerns, and both must hold. Even a strong
policy is worthless behind a weak hash, so confirm the storage side too:
`argon2id` with `memoryCost` at least `19456`, `timeCost` `2`, verified with the
library's own comparator rather than `===`. Full parameters and the rehash-on-login
pattern are in `Security/authentication`.

Never store a password with `md5`, `sha1`, `sha256` or any bare digest, and never
keep a plaintext copy "for support" — there is no support workflow that justifies
a recoverable password column.
</rules>

# Rate limiting and lockout

<rules>
- Limit attempts per account **and** per IP — see `Security/authentication`.
- Prefer exponential backoff to a hard lock. A permanent lockout triggered by
  failures is a denial-of-service primitive against your own users.
- Apply the same limits to password *change* and *reset*, not only to login.
- Notify the user by email on password change, from an address they can act on.

---
</rules>

# Strength feedback

<rules>
Use an entropy estimator such as `zxcvbn` rather than a character-class meter. It
recognises `P@ssw0rd!` as weak and `correct horse battery staple` as strong,
which a class-counting meter inverts.

Show strength as guidance, not as a gate. The hard requirements are length and
breach screening.

---
</rules>

# Anti-patterns

<antipatterns>
| Anti-pattern | Why it fails | Fix |
| --- | --- | --- |
| Requiring symbol + digit + mixed case | Produces `Password1!` | Length plus breach screening |
| 90-day forced rotation | Produces predictable increments | Rotate on compromise |
| Maximum length of 16 | Signals storage, not hashing | Accept ≥ 64 |
| Silent truncation at 72 bytes | Users trust a password that is not theirs | Pre-hash or reject clearly |
| Blocking paste | Defeats password managers | Allow paste and autocomplete |
| Security questions | Publicly researchable | MFA and recovery codes |
| Emailing a password | Plaintext in an unowned mailbox | Single-use reset link |
| Class-based strength meters | Rank `P@ssw0rd!` above a passphrase | `zxcvbn` |
| Logging failed passwords | Plaintext credentials in log storage | Never log the field |
| Permanent lockout on failures | Attacker locks out every user | Exponential backoff |

---
</antipatterns>

# Checklist

<checklist>
- [ ] Minimum 8 characters; maximum at least 64
- [ ] All Unicode accepted; input `NFKC`-normalised before hashing
- [ ] No composition rules enforced
- [ ] Candidates screened against a breach corpus via k-anonymity or a local copy
- [ ] No scheduled forced rotation; rotation on compromise is supported
- [ ] Long inputs pre-hashed or clearly rejected, never silently truncated
- [ ] Passwords never logged, emailed, or placed in a URL
- [ ] Storage is one-way only; reset never reveals
- [ ] Paste and password-manager autocomplete both work
- [ ] Rate limiting covers login, change and reset, keyed by account and IP
- [ ] Users are emailed on password change
- [ ] Strength feedback uses an entropy estimator, as guidance not a gate
</checklist>
