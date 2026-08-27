---
targetModels:
  - "Claude Fable 5"
  - "Claude Opus 5"
  - "Claude Sonnet 5"
  - "Claude 5 Family"
  - "Future Claude Models"
name: https
category: Security
description: TLS configuration that holds up — protocol and cipher selection, certificate automation, HSTS, and terminating TLS without losing it internally.
license: MIT
author: Agent.md maintainers
last-verified: 2026-08-23
reviewed-by: unreviewed
---
<!-- Generated from models/_canonical by scripts/build-model-variants.js.
     Edit the canonical source, not this file. Structure adapted for Claude per deep-research.md. -->
# Purpose

<purpose>
Rules for transport security. Encryption of stored data is `Security/encryption`;
the response headers that accompany TLS are `Security/headers`.

**HTTPS is not optional for any endpoint.** Not for static pages, not for health
checks, not for internal services. Plaintext anywhere permits downgrade,
injection of content, and theft of any credential that traverses it.

---
</purpose>

# Protocol versions

<rules>
| Version | Setting |
| --- | --- |
| **TLS 1.3** | Enable. Preferred — fewer round trips, no legacy ciphers, forward secrecy always |
| **TLS 1.2** | Enable for compatibility, restricted to AEAD suites |
| TLS 1.1 / 1.0 | **Disable.** Deprecated; CBC and RC4 weaknesses |
| SSL 3.0 / 2.0 | **Disable.** POODLE and worse |

```nginx
ssl_protocols TLSv1.2 TLSv1.3;
ssl_prefer_server_ciphers off;          # correct for TLS 1.3
ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-CHACHA20-POLY1305;

ssl_session_timeout 1d;
ssl_session_cache shared:SSL:10m;
ssl_session_tickets off;                # tickets can undermine forward secrecy

ssl_stapling on;                        # OCSP stapling
ssl_stapling_verify on;
```

Require **ECDHE** key exchange so every session has forward secrecy — recording
traffic today must not become readable if the private key leaks later. Static RSA
key exchange does not provide this and is absent from TLS 1.3 for that reason.

**Never** enable compression (CRIME) or renegotiation initiated by the client.

---
</rules>

# Certificates

<rules>
- Automate issuance and renewal with ACME (`certbot`, `lego`, `caddy`, or your
  platform's manager). **Manual renewal is how outages happen** — the certificate
  expires on a weekend and nobody is paged until users are.
- Alert at **30 days** before expiry, independently of the renewal automation. The
  alert exists to catch the automation failing.
- Prefer **ECDSA P-256** — smaller and faster than RSA-2048 — and serve an RSA
  chain alongside only if you must support very old clients.
- Serve the **full chain**, not just the leaf. A missing intermediate works in
  browsers that cache it and fails in `curl`, mobile apps and server-to-server
  calls — an intermittent failure that is painful to diagnose.
- Keep private keys at `0600`, owned by the service user, never in the repository.
- Add a **CAA record** so only your chosen authority may issue for the domain.

---
</rules>

# HSTS

<rules>
```
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
```

- Send it **only over HTTPS**. Browsers ignore it on plaintext responses.
- Start with a short `max-age`, confirm nothing breaks, then raise to a year.
- `preload` is **effectively irreversible on a useful timescale**. Every present
  and future subdomain must serve HTTPS before you submit. → `Security/headers`

---
</rules>

# Redirects and mixed content

<rules>
- Redirect HTTP to HTTPS with **`301`**, and redirect to the same path. Sending
  every plaintext request to `/` loses the user's destination.
- The redirect is a **fallback, not the control** — the first plaintext request is
  already interceptable. HSTS is what removes it for return visitors.
- Serve every subresource over HTTPS. One `http://` script tag blocks on mixed
  content; one `http://` image degrades the lock icon and leaks the URL.
- Set cookies `Secure` so they are never transmitted in plaintext.

---
</rules>

# Internal traffic

<rules>
Terminating TLS at a load balancer and speaking plaintext behind it is only
acceptable when that internal network is genuinely trusted — and in a shared
cloud VPC it usually is not.

- Prefer **mutual TLS** between services, or a service mesh that provides it.
- Verify certificates on internal calls too. Disabling verification "because it is
  internal" is how a compromised pod reads everything.
- **Never** set `NODE_TLS_REJECT_UNAUTHORIZED=0` or `rejectUnauthorized: false`.
  That disables verification globally and turns TLS into obfuscation.

```js
// If a private CA is the reason for the temptation, trust the CA — do not
// disable verification.
const agent = new https.Agent({ ca: fs.readFileSync("/etc/ssl/internal-ca.pem") });
```

---
</rules>

# Verifying

<rules>
```bash
</rules>

# Protocol, cipher, chain and expiry from the live endpoint

<rules>
openssl s_client -connect app.example.com:443 -servername app.example.com < /dev/null
</rules>

# Confirm weak protocols are actually refused

<rules>
openssl s_client -tls1_1 -connect app.example.com:443 < /dev/null   # expect failure
```

Test the **deployed origin**, not the configuration file. Then run an external
scan (SSL Labs, `testssl.sh`) and re-run it after any proxy or platform change.

---
</rules>

# Anti-patterns

<antipatterns>
| Anti-pattern | Why it fails | Fix |
| --- | --- | --- |
| TLS 1.0 / 1.1 still enabled | Deprecated; CBC and RC4 weaknesses | TLS 1.2 + 1.3 only |
| Manual certificate renewal | Expiry outage at the worst moment | ACME automation plus expiry alert |
| Serving only the leaf certificate | Fails for `curl` and mobile clients | Serve the full chain |
| `rejectUnauthorized: false` | Disables verification entirely | Trust the private CA |
| Plaintext between internal services | A compromised pod reads everything | mTLS or a service mesh |
| HSTS sent over HTTP | Ignored by browsers | HTTPS responses only |
| `preload` before auditing subdomains | Effectively irreversible | Verify every subdomain |
| Redirecting all HTTP to `/` | Loses the requested path | `301` to the same path |
| Mixed-content subresources | Blocked or leaking | All subresources over HTTPS |
| Static RSA key exchange | No forward secrecy | Require ECDHE |

---
</antipatterns>

# Checklist

<checklist>
- [ ] Only TLS 1.2 and 1.3 are enabled; older protocols refused and verified refused
- [ ] Cipher suites are AEAD with ECDHE key exchange
- [ ] TLS compression and client-initiated renegotiation are disabled
- [ ] Certificates renew automatically, with an independent 30-day expiry alert
- [ ] The full chain is served and verified with `openssl s_client`
- [ ] Private keys are `0600` and never committed
- [ ] A CAA record restricts which authority may issue
- [ ] HSTS is sent over HTTPS only, with `includeSubDomains`
- [ ] `preload` used only after auditing every subdomain
- [ ] HTTP redirects `301` to the same path over HTTPS
- [ ] No mixed content; all cookies are `Secure`
- [ ] Internal service traffic uses mTLS or verified TLS, never disabled verification
</checklist>
