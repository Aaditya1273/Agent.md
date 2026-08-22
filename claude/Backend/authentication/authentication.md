# authentication.md

Version: 1.0.0

Target Models

- Claude Fable 5
- Claude Opus 5
- Claude Sonnet 5
- Claude 5 Family
- Future Claude Models

---

# Purpose

This document defines how Claude should design, implement, review, secure, and maintain authentication systems.

Authentication is not simply logging users into an application.

It is the process of verifying identity before granting access to protected resources, services, and operations.

The objective is to build authentication systems that are secure, scalable, reliable, user-friendly, and resilient against modern attacks while maintaining excellent developer experience.

Authentication answers one question.

"Who is making this request?"

---

# Core Philosophy

Verify Identity

↓

Establish Trust

↓

Issue Credentials

↓

Protect Sessions

↓

Validate Every Request

↓

Monitor Activity

↓

Improve Continuously

↓

Approve

Trust should never be assumed.

Every request must earn it.

---

# Primary Objective

Every authentication system should answer one question.

"Can the system reliably identify legitimate users while preventing unauthorized access under realistic attack conditions?"

If the answer is uncertain,

the authentication design requires improvement.

---

# Authentication Principles

Every implementation should maximize

Security

↓

Reliability

↓

Usability

↓

Scalability

↓

Privacy

↓

Observability

↓

Developer Experience

Authentication should protect users without creating unnecessary friction.

---

# Authentication Workflow

Identify User

↓

Verify Credentials

↓

Issue Identity

↓

Create Session

↓

Validate Requests

↓

Monitor Activity

↓

Revoke When Necessary

↓

Approve

---

# Stage 1 — Identity Design

Determine

Who can authenticate?

↓

Users

↓

Administrators

↓

Organizations

↓

Services

↓

Machines

↓

Third-party Applications

Every identity should have a unique identifier.

---

# Stage 2 — Authentication Methods

Choose the appropriate mechanism.

Examples

Email & Password

OAuth 2.0

OpenID Connect

Magic Links

Passkeys

WebAuthn

API Keys

Mutual TLS

Single Sign-On

Service Accounts

Use the simplest secure method that satisfies business requirements.

---

# Stage 3 — Credential Management

Credentials should

Be unique

↓

Be revocable

↓

Be rotatable

↓

Be encrypted

↓

Never be logged

↓

Never be hardcoded

Secrets should only exist where absolutely necessary.

---

# Stage 4 — Password Security

Passwords should

Meet minimum complexity

↓

Be hashed

↓

Use Argon2id or bcrypt

↓

Use unique salts

↓

Never be encrypted

↓

Never be reversible

Store password hashes.

Never passwords.

---

# Stage 5 — Multi-Factor Authentication

Support

Authenticator Apps

↓

Passkeys

↓

Hardware Keys

↓

SMS (only when necessary)

↓

Email Verification

↓

Backup Codes

MFA should protect sensitive accounts.

---

# Stage 6 — Session Management

Review

Session creation

↓

Expiration

↓

Renewal

↓

Revocation

↓

Idle timeout

↓

Absolute timeout

Sessions should have limited lifetime.

---

# Stage 7 — Token Design

Review

JWT

Opaque Tokens

Refresh Tokens

Access Tokens

Short-lived Tokens

Rotation

Tokens should represent identity.

Not authorization logic.

---

# Stage 8 — Token Validation

Validate

Signature

↓

Expiration

↓

Issuer

↓

Audience

↓

Subject

↓

Nonce

↓

Clock skew

Every request should validate token integrity.

---

# Stage 9 — Refresh Strategy

Implement

Short-lived Access Tokens

↓

Long-lived Refresh Tokens

↓

Rotation

↓

Revocation

↓

Reuse Detection

Compromised refresh tokens should be detected immediately.

---

# Stage 10 — Account Protection

Protect against

Brute Force

Credential Stuffing

Password Spraying

Replay Attacks

Enumeration

Automation

Authentication systems are attack targets.

---

# Stage 11 — Identity Verification

Support

Email Verification

Phone Verification

Identity Confirmation

Device Verification

Risk-based Authentication

New Device Detection

Identity should be verified before granting trust.

---

# Stage 12 — Login Experience

Review

Clear errors

↓

Remember device

↓

Password reset

↓

Magic links

↓

Session continuation

↓

Graceful failures

Security should not unnecessarily reduce usability.

---

# Stage 13 — Password Recovery

Recovery should require

Identity verification

↓

Temporary tokens

↓

Expiration

↓

Single use

↓

Audit logging

Password recovery must be as secure as login.

---

# Stage 14 — Logout

Logout should

Invalidate sessions

↓

Revoke refresh tokens

↓

Clear cookies

↓

Invalidate caches

↓

Support global logout

Users should always be able to terminate access.

---

# Stage 15 — Device Management

Allow users to

View devices

↓

Revoke devices

↓

Rename devices

↓

View login history

↓

Receive new device alerts

Users should control their authenticated devices.

---

# Stage 16 — Monitoring

Monitor

Login failures

↓

Successful logins

↓

Password changes

↓

Token reuse

↓

Suspicious devices

↓

Geographic anomalies

Authentication events provide valuable security signals.

---

# Stage 17 — Logging

Log

Authentication attempts

↓

Session creation

↓

Session revocation

↓

Password changes

↓

MFA enrollment

↓

Recovery requests

Never log

Passwords

Tokens

Secrets

Authentication codes

---

# Stage 18 — Security Review

Review

Transport security

↓

Cookie security

↓

CSRF

↓

Replay attacks

↓

Session fixation

↓

Timing attacks

↓

Secret rotation

Authentication security should assume hostile environments.

---

# Stage 19 — Testing

Verify

Valid login

↓

Invalid credentials

↓

Expired tokens

↓

Revoked tokens

↓

Session expiration

↓

Password recovery

↓

MFA

↓

Concurrency

Authentication should fail safely.

---

# Stage 20 — Continuous Improvement

Review

Authentication methods

↓

Threat landscape

↓

Cryptography

↓

Dependencies

↓

Monitoring

↓

User feedback

Authentication evolves continuously.

---

# Authentication Quality Attributes

Evaluate

Security

Reliability

Scalability

Privacy

Availability

Maintainability

Usability

Developer Experience

---

# Authentication Questions

Before approval ask

Can every identity be verified securely?

↓

Can compromised credentials be revoked immediately?

↓

Are secrets protected throughout their lifecycle?

↓

Can attackers bypass authentication?

↓

Can users recover accounts safely?

↓

Are authentication events observable?

↓

Would an independent security audit approve this implementation?

---

# Severity Levels

Critical

Authentication bypass

Credential exposure

Token forgery

Session hijacking

Password leakage

Major

Weak hashing

Missing MFA

Weak token validation

Poor session handling

Recovery vulnerabilities

Medium

Monitoring improvements

Documentation gaps

Configuration weaknesses

Minor

Examples

Documentation

Developer experience

Operational improvements

Future authentication methods

---

# Authentication Checklist

✓ Identity model defined

✓ Secure authentication method selected

✓ Password hashing implemented

✓ MFA supported

✓ Sessions managed securely

✓ Tokens validated correctly

✓ Refresh token rotation implemented

✓ Account recovery secured

✓ Logout invalidates sessions

✓ Monitoring enabled

✓ Logging configured

✓ Security reviewed

✓ Testing completed

✓ Documentation complete

✓ Production ready

---

# Anti-Patterns

Avoid

Plaintext passwords

Reversible encryption

Long-lived access tokens

Hardcoded secrets

Weak password hashing

Token storage in localStorage (when avoidable)

Missing MFA

Unlimited login attempts

Detailed authentication errors

Session fixation

Ignoring refresh token rotation

Logging credentials

Trusting client-side authentication

Treating authentication as authorization

---

# Definition of Done

Authentication review is complete when

- Every identity is verified using secure, modern authentication mechanisms.
- Credentials are protected through industry-standard hashing and secret management.
- Sessions and tokens are short-lived, validated, rotatable, and revocable.
- Multi-factor authentication protects sensitive accounts and privileged operations.
- Account recovery, logout, and device management maintain the same security standards as login.
- Monitoring and logging provide complete visibility into authentication activity without exposing sensitive information.
- The implementation resists common attacks including brute force, credential stuffing, replay attacks, and session hijacking.
- Documentation clearly explains authentication flows, token lifecycles, and operational procedures.
- The authentication system scales with users, devices, and services without sacrificing security.
- Developers and users experience a secure, reliable, and intuitive authentication process.

Exceptional authentication systems disappear into the background.

Legitimate users authenticate effortlessly, attackers encounter multiple layers of defense, and every request begins with a verified, trusted identity.