# security-review.md

Version: 1.0.0

Target Models

- Claude 5 Family
- Claude 4.x Family
- Future Claude Models

---

# Purpose

This document defines the Security Review methodology for software engineering.

Security review is not a final checklist performed before deployment.

Security is an engineering discipline that influences every architectural, implementation, and operational decision.

The objective is to identify, evaluate, and reduce security risks before software reaches production.

Every feature should be reviewed assuming an attacker will intentionally misuse it.

---

# Core Philosophy

Understand

↓

Identify Assets

↓

Identify Threats

↓

Analyze Risks

↓

Verify Controls

↓

Reduce Attack Surface

↓

Approve

Never assume software is secure.

Security must be verified.

---

# Primary Objective

Every security review should answer one question.

"If an experienced attacker had unlimited time to examine this implementation, what could they abuse?"

If the answer is uncertain,

the implementation requires additional review.

---

# Security Principles

Every implementation should maximize

Confidentiality

↓

Integrity

↓

Availability

↓

Least Privilege

↓

Defense in Depth

↓

Fail Secure

↓

Zero Trust

↓

Auditability

Security should exist by design.

Not as an afterthought.

---

# Security Review Workflow

Understand System

↓

Identify Assets

↓

Identify Entry Points

↓

Identify Trust Boundaries

↓

Analyze Threats

↓

Verify Controls

↓

Review Code

↓

Review Infrastructure

↓

Approve

---

# Stage 1 — Asset Review

Identify

User Data

Authentication Data

Financial Data

API Keys

Secrets

Infrastructure

Business Logic

Sensitive Files

Protect valuable assets first.

---

# Stage 2 — Threat Surface Review

Review

Public APIs

Forms

Uploads

Authentication

Admin Panels

Webhooks

Background Jobs

Third-party Integrations

Every exposed interface increases attack surface.

---

# Stage 3 — Authentication Review

Verify

Authentication required

Session management

Token expiration

Refresh tokens

Password hashing

MFA support

Account recovery

Logout behavior

Identity must always be verified.

---

# Stage 4 — Authorization Review

Inspect

Role validation

Permission checks

Ownership verification

Resource isolation

Admin operations

Privilege escalation

Horizontal access

Vertical access

Never trust client-side authorization.

---

# Stage 5 — Input Validation

Review

User input

Headers

Cookies

Files

Query parameters

JSON payloads

Forms

API requests

Every input is untrusted.

Validate before use.

---

# Stage 6 — Output Validation

Verify

Escaping

Encoding

Sanitization

Safe serialization

Safe rendering

Response filtering

Output should never expose sensitive information.

---

# Stage 7 — Injection Review

Inspect for

SQL Injection

Command Injection

NoSQL Injection

LDAP Injection

XPath Injection

Template Injection

Shell Injection

Never concatenate untrusted input.

---

# Stage 8 — Cross Site Review

Review

XSS

Stored XSS

Reflected XSS

DOM XSS

CSRF

Clickjacking

CSP

Cookie Security

Browser security is part of application security.

---

# Stage 9 — Secrets Review

Verify

Environment variables

API keys

Tokens

Passwords

Certificates

Private keys

Encryption keys

Secrets should never appear in source code.

---

# Stage 10 — Cryptography Review

Inspect

Hashing

Encryption

Key storage

Random generation

Token signing

Certificate validation

Only use proven cryptographic standards.

Never invent cryptography.

---

# Stage 11 — API Security Review

Verify

Authentication

Authorization

Rate limiting

Validation

Replay protection

Request signing

Versioning

Error responses

APIs should expose only what is necessary.

---

# Stage 12 — Database Security Review

Review

Parameterized queries

Access control

Encryption

Least privilege

Backups

Audit logs

Migration safety

Data integrity

Protect data at every layer.

---

# Stage 13 — File Upload Review

Verify

Type validation

Size validation

Virus scanning

Storage isolation

Filename sanitization

Execution prevention

Never trust uploaded files.

---

# Stage 14 — Dependency Review

Inspect

Known vulnerabilities

Maintenance status

Package reputation

License

Supply chain risks

Unused packages

Every dependency expands the attack surface.

---

# Stage 15 — Infrastructure Review

Review

Environment separation

Secrets management

Network segmentation

TLS

Firewalls

Reverse proxies

Containers

Infrastructure is part of the application.

---

# Stage 16 — Logging Review

Verify

Authentication events

Authorization failures

Admin actions

Audit logs

Sensitive operations

Incident tracking

Logs should support investigation without exposing secrets.

---

# Stage 17 — Error Handling Review

Review

Stack traces

Debug output

Sensitive errors

Information disclosure

Fallback behavior

Attackers should learn as little as possible.

---

# Stage 18 — Availability Review

Evaluate

Rate limiting

DoS protection

Caching

Timeouts

Retries

Circuit breakers

Resource exhaustion

Availability is part of security.

---

# Stage 19 — Privacy Review

Inspect

Personal data

Data minimization

Consent

Retention

Deletion

Export

Compliance

Collect only what is necessary.

---

# Stage 20 — Business Logic Review

Analyze

Workflow abuse

Discount abuse

Privilege abuse

Race conditions

State manipulation

Fraud scenarios

Many vulnerabilities exist in business logic rather than code.

---

# OWASP Verification

Review against

Broken Access Control

Cryptographic Failures

Injection

Insecure Design

Security Misconfiguration

Vulnerable Components

Authentication Failures

Integrity Failures

Logging Failures

SSRF

OWASP should guide security reviews.

---

# Threat Modeling

For every feature ask

What are we protecting?

↓

Who could attack it?

↓

How could they attack it?

↓

What would happen?

↓

How do we reduce the risk?

Threat modeling should precede implementation.

---

# Security Questions

Before approval ask

Can an attacker bypass authentication?

↓

Can permissions be escalated?

↓

Can sensitive data leak?

↓

Can input be abused?

↓

Can secrets be exposed?

↓

Would this survive a penetration test?

---

# Severity Levels

Critical

Remote Code Execution

Authentication bypass

Privilege escalation

Data breach

Major

Missing validation

Weak authorization

Sensitive logging

Dependency vulnerability

Medium

Weak configuration

Missing headers

Minor information disclosure

Minor

Documentation

Monitoring

Hardening improvements

Suggestion

Additional defense layers

Future security improvements

---

# Security Checklist

✓ Authentication verified

✓ Authorization verified

✓ Input validated

✓ Output encoded

✓ Secrets protected

✓ Dependencies reviewed

✓ APIs secured

✓ Database protected

✓ Logging configured

✓ Rate limiting implemented

✓ Attack surface minimized

✓ OWASP reviewed

✓ Threat model completed

---

# Anti-Patterns

Avoid

Hardcoded secrets

Client-side authorization

Trusting user input

Verbose error messages

Disabled security headers

Weak password storage

Missing rate limiting

Over-privileged services

Security by obscurity

Ignoring business logic attacks

---

# Definition of Done

Security review is complete when

- Authentication and authorization are verified.
- Every input is validated.
- Sensitive data is protected.
- Secrets are securely managed.
- Attack surfaces are minimized.
- Business logic abuse has been considered.
- Dependencies have been reviewed.
- Infrastructure follows security best practices.
- Logging supports auditing and incident response.
- The implementation satisfies modern secure engineering standards.

Secure software is not software that cannot be attacked.

Secure software is software that anticipates attacks, minimizes risk, limits damage, and enables rapid detection and recovery.