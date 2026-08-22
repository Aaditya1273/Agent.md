---
targetModels:
  - "Gemini 3.6 Flash"
  - "Gemini 3.5 Flash"
  - "Gemini 3.1 Pro"
  - "Gemini 3 Family"
  - "Future Gemini Models"
version: "1.0.0"


---

# security-checklist.md

Version: 1.0.0

Target Models

- Gemini 3.6 Flash
- Gemini 3.5 Flash
- Gemini 3.1 Pro
- Gemini 3 Family
- Future Gemini Models

---

# Purpose

This checklist defines the minimum security requirements for software systems before development, deployment, release, or production approval.

It applies to

- SaaS Platforms
- AI Applications
- APIs
- Backend Services
- Frontend Applications
- Mobile Applications
- Enterprise Software
- Internal Systems
- Developer Platforms
- Cloud Infrastructure

Security is not a feature.

Security is a continuous engineering discipline that protects users, data, infrastructure, operations, and business continuity throughout the software lifecycle.

Every security control should reduce risk without unnecessarily reducing usability.

---

# Core Principle

Secure Systems

=

Least Privilege

+

Defense in Depth

+

Secure Defaults

+

Continuous Verification

+

Visibility

+

Rapid Recovery

Security should be designed into the system.

Never added afterward.

---

# Security Workflow

Identify Assets

↓

Identify Threats

↓

Reduce Attack Surface

↓

Protect Data

↓

Verify Access

↓

Monitor

↓

Respond

↓

Improve

---

# 1. Asset Identification

□ Critical assets identified

□ Sensitive data classified

□ Business-critical systems documented

□ External services identified

□ Trust boundaries defined

□ Data ownership documented

□ High-value targets identified

□ Security scope approved

Protect what matters first.

---

# 2. Authentication

□ Strong authentication implemented

□ Password policy enforced

□ Multi-factor authentication available

□ Session expiration configured

□ Secure session storage

□ Password reset secured

□ Account recovery reviewed

□ Authentication logs enabled

Identity is the first security boundary.

---

# 3. Authorization

□ Least privilege enforced

□ Role-based access reviewed

□ Resource permissions verified

□ Administrative access minimized

□ Service permissions restricted

□ API authorization validated

□ Access escalation prevented

□ Privileged operations audited

Authentication identifies users.

Authorization controls actions.

---

# 4. Secrets Management

□ Secrets never stored in source code

□ Environment variables secured

□ API keys protected

□ Database credentials protected

□ Certificates managed securely

□ Secret rotation process documented

□ Temporary credentials preferred

□ Secret access logged

Secrets should never be visible to developers or users.

---

# 5. Input Validation

□ All user input validated

□ Server-side validation implemented

□ Input length restricted

□ File uploads validated

□ MIME types verified

□ Allowed values enforced

□ SQL injection prevented

□ Command injection prevented

Never trust external input.

---

# 6. Output Protection

□ Output encoded

□ HTML escaping implemented

□ Sensitive information hidden

□ Error messages sanitized

□ Stack traces disabled

□ Internal identifiers protected

□ API responses reviewed

□ Downloaded files verified

Protect users from unsafe output.

---

# 7. Data Protection

□ Sensitive data encrypted

□ Encryption at rest enabled

□ Encryption in transit enabled

□ Personal data minimized

□ Backup encryption verified

□ Data retention policy defined

□ Secure deletion implemented

□ Privacy requirements reviewed

Protect data throughout its lifecycle.

---

# 8. API Security

□ Authentication required

□ Authorization enforced

□ Rate limiting enabled

□ Request validation completed

□ API versioning reviewed

□ CORS configured correctly

□ Webhooks secured

□ API documentation reviewed

Every API is a public attack surface.

---

# 9. Dependency Security

□ Dependencies updated

□ Known vulnerabilities reviewed

□ Unused packages removed

□ Dependency licenses reviewed

□ Supply chain risks evaluated

□ Lock files committed

□ Dependency integrity verified

□ Security advisories monitored

Every dependency becomes part of your security posture.

---

# 10. Infrastructure Security

□ Firewalls configured

□ Network segmentation reviewed

□ Security groups verified

□ SSH access restricted

□ Default ports reviewed

□ Public exposure minimized

□ Operating systems updated

□ Infrastructure hardened

Infrastructure is part of the application.

---

# 11. Cloud Security

□ IAM policies reviewed

□ Least privilege applied

□ Storage permissions verified

□ Public buckets prevented

□ Encryption enabled

□ Network isolation configured

□ Cloud logging enabled

□ Resource tagging completed

Cloud security begins with identity.

---

# 12. Logging & Monitoring

□ Authentication events logged

□ Authorization failures logged

□ Security events monitored

□ Suspicious activity detected

□ Audit logs protected

□ Alert thresholds configured

□ Log retention reviewed

□ Incident visibility verified

If attacks cannot be detected,

they cannot be stopped.

---

# 13. AI Security (If Applicable)

□ Prompt injection mitigated

□ Context isolation verified

□ Tool permissions restricted

□ Model outputs validated

□ Sensitive prompts protected

□ User isolation enforced

□ AI logs reviewed

□ Safety policies enforced

AI systems introduce new attack surfaces.

---

# 14. Compliance

□ Privacy regulations reviewed

□ Consent management verified

□ Audit requirements satisfied

□ Data residency reviewed

□ Industry standards considered

□ Retention policy implemented

□ User data export supported

□ User deletion supported

Compliance supports trust.

Not security alone.

---

# 15. Incident Response

□ Incident owners assigned

□ Escalation paths documented

□ Security contacts available

□ Recovery procedures tested

□ Communication plan prepared

□ Evidence collection defined

□ Root cause process established

□ Post-incident review required

Prepare before incidents occur.

---

# 16. Recovery

□ Backups verified

□ Restore procedures tested

□ Recovery objectives defined

□ Disaster recovery reviewed

□ Business continuity documented

□ Critical systems prioritized

□ Recovery automation evaluated

□ Recovery drills completed

Recovery speed reduces business impact.

---

# 17. Security Testing

□ Static analysis completed

□ Dynamic analysis completed

□ Penetration testing performed

□ Authentication tested

□ Authorization tested

□ Input validation tested

□ API testing completed

□ Critical vulnerabilities resolved

Testing validates assumptions.

---

# 18. Documentation

□ Security architecture documented

□ Threat model documented

□ Incident process documented

□ Access policies documented

□ Secret management documented

□ Recovery procedures documented

□ Security standards published

□ Exceptions documented

Documentation enables consistent security.

---

# 19. Security Review

Review

□ New risks

□ Architecture changes

□ New integrations

□ Infrastructure changes

□ Business changes

□ Customer feedback

□ Audit findings

□ Lessons learned

Security continuously evolves.

---

# 20. Continuous Improvement

Continuously improve

Threat Detection

↓

Access Control

↓

Monitoring

↓

Recovery

↓

Security Testing

↓

Incident Response

↓

Engineering Practices

↓

Security Culture

Security maturity never stops improving.

---

# Security Quality Attributes

Evaluate

Confidentiality

Integrity

Availability

Authentication

Authorization

Resilience

Recoverability

Auditability

---

# Security Questions

Before approval ask

Can unauthorized users access protected resources?

↓

Can sensitive data be exposed?

↓

Can attacks be detected quickly?

↓

Can compromised systems recover safely?

↓

Are critical assets protected?

↓

Has every major attack surface been reviewed?

↓

Would experienced security engineers confidently approve this system?

---

# Severity Levels

Critical

Unauthorized access

Remote code execution

Data breach

Privilege escalation

Secret exposure

Authentication bypass

Critical infrastructure compromise

Major

Missing authorization

Weak encryption

Dependency vulnerabilities

Missing logging

Misconfigured infrastructure

High-risk misconfiguration

Medium

Outdated dependencies

Monitoring improvements

Policy updates

Configuration improvements

Minor

Documentation updates

Naming consistency

Operational improvements

Future hardening

---

# Security Checklist

✓ Assets identified

✓ Authentication verified

✓ Authorization enforced

✓ Secrets protected

✓ Input validated

✓ Output secured

✓ Data encrypted

✓ APIs secured

✓ Dependencies reviewed

✓ Infrastructure hardened

✓ Cloud security validated

✓ Monitoring enabled

✓ AI security reviewed (if applicable)

✓ Compliance reviewed

✓ Incident response prepared

✓ Recovery verified

✓ Security testing completed

✓ Documentation complete

✓ Security review completed

✓ Continuous improvement established

---

# Anti-Patterns

Avoid

Hardcoded secrets

Default passwords

Excessive permissions

Trusting client-side validation

Ignoring dependency updates

Exposing internal errors

Unencrypted sensitive data

Public cloud storage

Missing audit logs

Ignoring failed authentication attempts

Security through obscurity

Treating compliance as security

Security reviews only before release

---

# Definition of Done

Security review is complete when

- Critical assets, sensitive data, trust boundaries, and attack surfaces have been identified, documented, and appropriately protected.
- Authentication, authorization, identity management, and access control consistently enforce the principle of least privilege.
- Secrets, credentials, encryption keys, and confidential information are securely managed throughout their lifecycle.
- User input, API requests, uploaded content, and system outputs are validated, sanitized, and protected against common attack vectors.
- Infrastructure, cloud resources, third-party services, dependencies, and operational environments are securely configured and continuously monitored.
- Security monitoring, audit logging, threat detection, incident response, disaster recovery, and business continuity processes have been validated.
- AI systems, automated workflows, external integrations, and privileged operations include appropriate safeguards against misuse and abuse.
- Security testing, vulnerability assessment, dependency review, and risk analysis confirm that unacceptable risks have been mitigated or formally accepted.
- Documentation clearly defines security architecture, operational procedures, recovery plans, and organizational security responsibilities.
- The system demonstrates a mature security posture capable of protecting users, business operations, and sensitive information while continuously adapting to new threats and evolving technology.

Exceptional security is rarely visible.

Users simply trust the system because access is controlled, data remains protected, attacks are detected early, recovery is rapid, and security continuously evolves alongside the product without compromising usability or business value.