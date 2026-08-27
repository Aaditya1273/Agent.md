---
targetModels:
  - "Gemini 3.6 Flash"
  - "Gemini 3.5 Flash"
  - "Gemini 3.1 Pro"
  - "Gemini 3 Family"
  - "Future Gemini Models"
name: security-review
category: Security
description: Reviewing a change for security — the diff patterns that matter, questions that find real bugs, and what to automate instead of eyeballing.
license: MIT
author: Agent.md maintainers
last-verified: 2026-08-23
reviewed-by: unreviewed
---
<!-- Generated from models/_canonical by scripts/build-model-variants.js.
     Edit the canonical source, not this file. Structure adapted for Gemini per deep-research.md. -->


# Purpose

How to review a code change for security, and how to spend that attention where
it pays.

The governing principle: **review the trust boundaries, not the whole diff.** A
2,000-line refactor that touches no input handling, no query, no authorisation
check and no dependency is a smaller security event than a three-line change to a
`WHERE` clause.

---

# Triage the diff first

Ask what the change touches before reading it line by line:

| Signal in the diff | Attention |
| --- | --- |
| New route, endpoint or handler | **High** — new attack surface |
| `WHERE`, `findFirst`, raw SQL | **High** — authorisation and injection |
| Authentication, session, token, cookie | **High** |
| File path, upload, archive extraction | **High** |
| `exec`, `spawn`, `child_process` | **High** |
| Outbound `fetch` to a dynamic URL | **High** — SSRF |
| New dependency | **High** — supply chain |
| `innerHTML`, `dangerouslySetInnerHTML`, `v-html` | **High** |
| CI workflow, `Dockerfile`, IaC | **High** — often unreviewed, always privileged |
| Copy, styling, tests only | Low |

A useful heuristic: **security bugs cluster where data crosses a boundary** —
network to application, application to database, application to shell,
application to filesystem, one tenant to another.

---

# Questions that find real bugs

Ask these of the change, in order:

1. **Where does input enter, and what is it trusted to be?**
   Query params, body, headers, cookies, uploaded filenames, webhook payloads, and
   values read back from the database that were once user input.

2. **Is the data access scoped to the caller?**
   A new query must filter by owner or tenant. → `Security/authorization`

   ```js
   // The review question: what stops user A passing user B's id?
   await db.invoice.findUnique({ where: { id: req.params.id } });
   ```

3. **Does any string become code?**
   SQL, shell, HTML, a template, a deserializer.
   → `Security/sql-injection`, `Security/command-injection`, `Security/xss`

4. **What happens on the error path?**
   Does a failure return a stack trace, leak a schema, or — worse — fall through
   and continue as though it succeeded?

5. **What is logged?** Does the diff add a credential, token or personal data to a
   log line? → `Security/audit-log`

6. **Is this endpoint rate limited?** New authentication or expensive endpoints
   need an explicit answer. → `Security/rate-limiting`

7. **Did the blast radius change?** New permission, broader database grant, new
   outbound network destination, new secret.

---

# Patterns that deserve a comment every time

```js
// 1. Authorisation by route, data access unscoped
if (!req.user) return res.status(401).end();
const doc = await db.doc.findUnique({ where: { id: req.params.id } });

// 2. Interpolation into a query or a command
db.query(`SELECT * FROM t WHERE id = ${id}`);
exec(`convert ${file} out.png`);

// 3. Verification disabled to make something work
const agent = new https.Agent({ rejectUnauthorized: false });

// 4. A comparison that should be constant-time
if (providedToken === storedToken) { … }

// 5. Randomness that is not cryptographic
const token = Math.random().toString(36);

// 6. A silenced error
try { await verify(sig); } catch { /* ignore */ }
```

Each of these is a defect, not a style preference. The last is the most dangerous
because it looks tidy.

---

# Automate what humans read badly

Humans are poor at scanning for known patterns and good at reasoning about intent.
Give each the work it suits.

| Automate | Tool |
| --- | --- |
| Known-vulnerable dependencies | `npm audit`, Dependabot, `osv-scanner` |
| Committed secrets | `gitleaks`, `trufflehog`, push protection |
| Injection and taint patterns | `semgrep`, CodeQL |
| Insecure IaC defaults | `checkov`, `tfsec` |
| Container CVEs | `trivy`, `grype` |

Fail the build on **high and critical**, and require an explicit, expiring
exception with an owner for anything suppressed. A permanent suppression with no
owner is how a known CVE ships for two years.

```yaml
# Gate the build. An exception must name an owner and an expiry, so a
# suppression cannot quietly become permanent.
- name: Dependency and secret scan
  run: |
    npm audit --omit=dev --audit-level=high
    gitleaks detect --no-banner --redact
    semgrep --config=p/owasp-top-ten --error --severity=ERROR
```

Reserve human review for: authorisation logic, business-rule abuse, error paths,
trust assumptions, and whether the feature should exist in this shape at all.

---

# Reviewing the review

- **Say what you checked**, not only what you found. "Verified the new query is
  tenant-scoped and the upload path is resolved before use" is far more useful to
  the next reviewer than a silent approval.
- **Be specific about severity.** Distinguish "this is exploitable today" from
  "this weakens a defence in depth". Treating both as blockers trains people to
  ignore you.
- **Suggest the fix**, not just the flaw. `Security/*` packages exist to be linked.
- **Never approve a security-relevant change you did not understand.** Ask. An
  approval is an assertion.

---

# Anti-patterns

| Anti-pattern | Why it fails | Fix |
| --- | --- | --- |
| Reviewing line count rather than boundaries | Attention on the harmless 2,000 lines | Triage by what is touched |
| Trusting the ORM to prevent injection | Every ORM has an unsafe escape hatch | Check the raw-query APIs |
| Approving CI and IaC changes unread | Highest-privilege code in the repo | Review them as production code |
| Treating every finding as a blocker | Reviewers get ignored | Grade severity honestly |
| Manual scanning for known CVEs | Humans are bad at this; tools are good | Automate and fail the build |
| Suppressions with no owner or expiry | Known issues ship indefinitely | Expiring, owned exceptions |
| Silent approval | No record of what was verified | State what you checked |
| Reviewing only added lines | Deleted checks are invisible | Read removals too |
| "It's internal" as a justification | Internal networks are not trusted | Require the same controls |

---

# Checklist

- [ ] Verify: The diff was triaged for trust-boundary changes before line-by-line reading
- [ ] Verify: Every new data access is scoped by owner or tenant
- [ ] Verify: No input is interpolated into SQL, a shell command, HTML or a template
- [ ] Verify: Error paths fail closed and leak no schema or stack trace
- [ ] Verify: No credential, token or personal data was added to a log line
- [ ] Verify: New or expensive endpoints have an explicit rate-limiting answer
- [ ] Verify: Deleted lines were read, not just added ones
- [ ] Verify: CI, `Dockerfile` and IaC changes were reviewed as privileged code
- [ ] Verify: Dependency, secret and SAST scans run and gate on high or critical
- [ ] Verify: Any suppression has an owner and an expiry
- [ ] Verify: The review states what was verified, with severity graded honestly
