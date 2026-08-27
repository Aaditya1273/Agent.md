---
targetModels:
  - "Gemini 3.6 Flash"
  - "Gemini 3.5 Flash"
  - "Gemini 3.1 Pro"
  - "Gemini 3 Family"
  - "Future Gemini Models"
name: encryption
category: Security
description: Encrypting data correctly — authenticated ciphers, nonce discipline, key management, and the primitives that must never be used.
license: MIT
author: Agent.md maintainers
last-verified: 2026-08-23
reviewed-by: unreviewed
---
<!-- Generated from models/_canonical by scripts/build-model-variants.js.
     Edit the canonical source, not this file. Structure adapted for Gemini per deep-research.md. -->


# Purpose

Rules for encrypting data at rest and in application code. Transport encryption is
`Security/https`; password hashing is `Security/authentication` — hashing is not
encryption and the two must never be confused.

The rule underneath everything: **use an authenticated cipher, use a library, and
never design a scheme.** Cryptography fails silently — code that produces
plausible ciphertext can be trivially breakable.

---

# Choose an authenticated cipher

Encryption without authentication permits an attacker to modify ciphertext
undetected. Always use AEAD.

| Use | Algorithm |
| --- | --- |
| General purpose | `AES-256-GCM` |
| No AES hardware acceleration | `ChaCha20-Poly1305` |
| Very large messages, nonce-misuse safety | `AES-GCM-SIV`, `XChaCha20-Poly1305` |
| Public-key | Hybrid — X25519 for key agreement, then AEAD |

```js
import crypto from "node:crypto";

function encrypt(plaintext, key) {
  const iv = crypto.randomBytes(12);                    // 96-bit nonce for GCM
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
  const ct = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  return { iv, ciphertext: ct, tag: cipher.getAuthTag() };
}

function decrypt({ iv, ciphertext, tag }, key) {
  const decipher = crypto.createDecipheriv("aes-256-gcm", key, iv);
  decipher.setAuthTag(tag);                             // must be set before final()
  return Buffer.concat([decipher.update(ciphertext), decipher.final()]).toString("utf8");
}
```

`decipher.final()` throws when the tag does not verify. **Never** catch that error
and continue with the partial plaintext — a failed tag means the data is not
authentic and must be discarded.

**Never** use these:

| Primitive | Why |
| --- | --- |
| `AES-ECB` | Identical blocks produce identical ciphertext; patterns leak |
| `AES-CBC` without a MAC | Padding-oracle attacks recover plaintext |
| `DES`, `3DES`, `RC4`, `Blowfish` | Broken or deprecated |
| `md5`, `sha1` for signatures | Collision-vulnerable |
| Any hand-written XOR or "custom" cipher | Broken by construction |
| RSA with PKCS#1 v1.5 encryption | Bleichenbacher; use OAEP |

---

# Nonce and IV discipline

This is where correct algorithm choices most often fail in practice.

- **Never reuse a nonce with the same key.** For `AES-GCM` this is catastrophic:
  two messages under one nonce leak the XOR of the plaintexts and allow forgery
  of the authentication tag.
- Generate with a **CSPRNG** — `crypto.randomBytes(12)` — or use a strictly
  increasing counter that cannot repeat across restarts or replicas.
- 96 bits is correct for GCM. Longer nonces are hashed internally and gain nothing.
- The nonce is **not secret**. Store it alongside the ciphertext.
- After roughly 2³² messages under one key with random nonces, rotate the key —
  collision probability becomes non-negligible.

---

# Keys

- Generate with a CSPRNG: `crypto.randomBytes(32)` for AES-256.
- **Never derive a key directly from a password** with a plain hash. Use a KDF —
  `argon2id`, `scrypt`, or `PBKDF2` with a high iteration count and a random salt.
- **Never hard-code a key**, commit one, or ship one in a client bundle.
  → `Security/secret-management`
- Use envelope encryption: a KMS holds the key-encryption key, which wraps a
  per-record data-encryption key. The master key never leaves the KMS boundary.
```js
// Envelope encryption: the master key never leaves the KMS.
const { Plaintext: dataKey, CiphertextBlob: wrappedKey } =
  await kms.generateDataKey({ KeyId: MASTER_KEY_ID, KeySpec: "AES_256" });

const record = encrypt(payload, dataKey);
dataKey.fill(0);                       // drop the plaintext key promptly

await db.secret.create({
  data: { ...record, wrappedKey, keyVersion: 3 },
});
```

- Version your keys. Store a key identifier with each ciphertext so rotation does
  not require decrypting everything at once.
- **Separate keys by purpose.** One key for encryption, a different one for
  signing. Reusing a key across algorithms invites cross-protocol attacks.

---

```js
// Blind index: HMAC under a separate key makes equality lookups possible
// without weakening the cipher or storing a searchable plaintext.
const indexKey = await kms.decrypt(WRAPPED_INDEX_KEY);
const blindIndex = crypto
  .createHmac("sha256", indexKey)
  .update(email.trim().toLowerCase())   // normalise before hashing
  .digest("base64");

await db.user.findFirst({ where: { emailIndex: blindIndex } });
```

# Encoding, comparison, randomness

- Base64 and hex are **encodings, not encryption**. A base64 string is plaintext.
- Compare secrets with `crypto.timingSafeEqual`, never `===`. Length-check first —
  it throws on mismatched lengths.
- Use `crypto.randomBytes` / `crypto.getRandomValues` for anything security
  relevant. `Math.random()` is a predictable PRNG and must never generate tokens,
  identifiers, salts or nonces.
- For hashing where speed is fine — checksums, cache keys — use `sha256`. For
  passwords, never.

---

# What to encrypt

Encryption is not free: it breaks indexing, search and sorting, and it moves the
problem to key management.

- Encrypt what regulation or blast radius demands: payment details, health data,
  government identifiers, credentials for third-party systems.
- Prefer **not storing** the data at all. Nothing protects a field like its
  absence.
- For lookups over encrypted values, store a separate **blind index** — an HMAC of
  the normalised value under a distinct key — rather than weakening the cipher.
- Full-disk and database-level encryption protect against stolen media. They do
  **not** protect against an application-level compromise, because the application
  reads plaintext.

---

# Anti-patterns

| Anti-pattern | Why it fails | Fix |
| --- | --- | --- |
| `AES-CBC` without a MAC | Padding oracle recovers plaintext | `AES-256-GCM` |
| `AES-ECB` | Leaks structure through repeated blocks | Any AEAD mode |
| Reusing a GCM nonce | Leaks plaintext XOR; enables forgery | Random 96-bit per message |
| `Math.random()` for an IV or salt | Predictable | `crypto.randomBytes` |
| Key derived by `sha256(password)` | No work factor; brute-forced | `argon2id` / `scrypt` |
| Ignoring a tag verification failure | Accepts tampered data | Discard on throw |
| Base64 treated as encryption | It is an encoding | Encrypt, then encode |
| One key for everything, forever | No blast-radius limit, no rotation path | Per-purpose, versioned keys |
| Hand-rolled cipher | Broken by construction | Use a vetted library |
| `===` on secrets | Timing oracle | `timingSafeEqual` |

---

# Checklist

- [ ] Verify: All encryption uses an AEAD mode (`AES-256-GCM` or `ChaCha20-Poly1305`)
- [ ] Verify: No `ECB`, unauthenticated `CBC`, `DES`, `3DES` or `RC4` anywhere
- [ ] Verify: Nonces are CSPRNG-generated, 96-bit for GCM, never reused under a key
- [ ] Verify: Authentication tag failures discard the data and are never swallowed
- [ ] Verify: Keys are CSPRNG-generated and never hard-coded or committed
- [ ] Verify: Password-derived keys use `argon2id`, `scrypt` or high-iteration `PBKDF2`
- [ ] Verify: Envelope encryption with a KMS-held key-encryption key
- [ ] Verify: Ciphertexts carry a key identifier so rotation is incremental
- [ ] Verify: Distinct keys per purpose; no key reused across algorithms
- [ ] Verify: Secret comparisons use `timingSafeEqual`
- [ ] Verify: Encrypted-field lookups use a blind index, not a weakened cipher
