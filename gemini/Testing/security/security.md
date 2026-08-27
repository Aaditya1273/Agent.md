---
targetModels:
  - "Gemini 3.6 Flash"
  - "Gemini 3.5 Flash"
  - "Gemini 3.1 Pro"
  - "Gemini 3 Family"
  - "Future Gemini Models"
name: security
category: Testing
description: Testing for security defects — what SAST, DAST and dependency scanning each catch, and the abuse-case tests only a human writes.
license: MIT
author: Agent.md maintainers
last-verified: 2026-08-23
reviewed-by: unreviewed
---
<!-- Generated from models/_canonical by scripts/build-model-variants.js.
     Edit the canonical source, not this file. Structure adapted for Gemini per deep-research.md. -->


# Purpose

Rules for testing security as part of the normal suite, not as an annual audit.

The framing that matters: **a functional test proves the feature works; a security
test proves it cannot be misused.** Both are needed, and only the second catches
the user who deliberately sends the wrong thing.

Reviewing a change by hand is `Security/security-review`. This package is about
tests that run automatically.

---

# The layers, and what each actually catches

| Layer | Catches | Misses |
| --- | --- | --- |
| **SAST** (`semgrep`, CodeQL) | Injection patterns, dangerous APIs, taint flows | Business-logic abuse, authorisation |
| **DAST** (`ZAP`, `nuclei`) | Missing headers, exposed endpoints, reflected XSS | Anything requiring domain understanding |
| **SCA** (`npm audit`, `osv-scanner`) | Known-vulnerable dependencies | Zero-days, your own code |
| **Secret scanning** (`gitleaks`) | Committed credentials | Secrets already rotated but still valid |
| **Container scanning** (`trivy`) | Base-image CVEs | Runtime misconfiguration |
| **Your own abuse tests** | Authorisation, tenancy, business rules | Nothing — this is the gap the tools leave |

Automated tools do not find broken access control, which is the most common and
most damaging category → `Security/owasp`. That gap is filled by tests you write.

---

# Abuse-case tests

The highest-value security tests in any suite. Write them exactly like functional
tests, but assert that the wrong thing is **refused**.

```js
test("a user cannot read another tenant's invoice", async () => {
  const { token: attacker } = await createUser({ tenant: "org_a" });
  const victim = await createInvoice({ tenant: "org_b" });

  const res = await request(app)
    .get(`/api/invoices/${victim.id}`)
    .set("Authorization", `Bearer ${attacker}`);

  expect(res.status).toBe(404);          // 404, not 403 — no existence oracle
});

test("role cannot be escalated through the profile endpoint", async () => {
  const { token, id } = await createUser({ role: "member" });

  await request(app)
    .patch(`/api/users/${id}`)
    .set("Authorization", `Bearer ${token}`)
    .send({ name: "New", role: "admin" });        // mass-assignment attempt

  const user = await db.user.findUnique({ where: { id } });
  expect(user.role).toBe("member");               // the field was ignored
});
```

Write one abuse test for each of these, per resource:

- Another tenant's object by id (**IDOR**)
- A privileged field in an update body (**mass assignment**)
- A missing or expired token
- A token for a different audience
- A nested or bulk operation where only the parent is authorised
- A `GET` that should have been a `POST`

---

# Wiring the tools into CI

```yaml
- name: Dependencies
  run: npm audit --omit=dev --audit-level=high

- name: Static analysis
  run: semgrep --config=p/owasp-top-ten --error --severity=ERROR

- name: Secrets
  run: gitleaks detect --no-banner --redact

- name: Container
  run: trivy image --exit-code 1 --severity HIGH,CRITICAL "$IMAGE"
```

- **Fail the build** on high and critical. A scan that only reports is a scan
  nobody reads.
- Scan **on every pull request**, not nightly. A dependency introduced on Monday
  should not ship because the scan runs on Friday.
- Every suppression needs an **owner and an expiry**. A permanent unowned
  exception is how a known CVE stays shipped for two years.
- Tune the rules. A tool producing 400 findings, 390 of them irrelevant, trains
  everyone to ignore all 400.

---

Useful rule packs to start from rather than writing your own: `p/owasp-top-ten`,
`p/nodejs`, `p/react`, `p/secrets` for `semgrep`; the `security-extended` suite for
CodeQL; and `--severity HIGH,CRITICAL` with `--ignore-unfixed` for `trivy` so the
build is not blocked by a CVE with no available patch.

# Testing the security controls themselves

Controls decay silently. Assert them:

```js
test("security headers are present on every response", async () => {
  const res = await request(app).get("/");

  expect(res.headers["content-security-policy"]).toBeDefined();
  expect(res.headers["strict-transport-security"]).toMatch(/max-age=\d{7,}/);
  expect(res.headers["x-content-type-options"]).toBe("nosniff");
  expect(res.headers["x-powered-by"]).toBeUndefined();
});

test("login is rate limited per account", async () => {
  const attempts = await Promise.all(
    Array.from({ length: 20 }, () =>
      request(app).post("/login").send({ email: "a@example.com", password: "wrong" })
    )
  );
  expect(attempts.some((r) => r.status === 429)).toBe(true);
});
```

Also assert: session cookies carry `HttpOnly` and `Secure`; errors do not include
a stack trace; an unauthenticated request to a protected route returns `401`.

---

# Anti-patterns

| Anti-pattern | Why it fails | Fix |
| --- | --- | --- |
| Scans that only report | Nobody reads the output | Fail the build on high/critical |
| Nightly scanning | Vulnerable code ships during the day | Run on every pull request |
| Trusting SAST for access control | It cannot model your domain | Write abuse tests |
| Suppression with no expiry | Known issues ship indefinitely | Owner plus expiry date |
| Testing only the happy path | Misuse is the security case | Assert the refusal |
| Asserting `403` for hidden objects | Confirms existence | Assert `404` |
| Annual penetration test only | Findings are months old | Continuous scanning plus abuse tests |
| Unfiltered noisy rulesets | 400 findings, all ignored | Tune to your stack |
| No test for security headers | Controls silently disappear | Assert them in the suite |
| Real credentials in test fixtures | Leaks through the repository | Generated per-test values |

---

# Checklist

- [ ] Verify: Dependency, SAST, secret and container scans run on every pull request
- [ ] Verify: Each gates the build on high and critical severity
- [ ] Verify: Suppressions carry an owner and an expiry
- [ ] Verify: Abuse tests cover IDOR, mass assignment and cross-tenant access per resource
- [ ] Verify: Unauthorised object access asserts `404`, not `403`
- [ ] Verify: Missing, expired and wrong-audience tokens are all tested
- [ ] Verify: Nested and bulk operations are tested for partial authorisation
- [ ] Verify: Security headers are asserted in the test suite
- [ ] Verify: Rate limiting on authentication routes is asserted
- [ ] Verify: Error responses are asserted to contain no stack trace
- [ ] Verify: No real credential appears in any fixture
