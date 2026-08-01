# csrf.md

Version: 1.0.0

Target Models

- Claude 5 Family
- Claude 4.8
- Claude 4.7
- Claude 4.x Family
- Future Claude Models

---

# Purpose

This document defines engineering principles, Cross-Site Request Forgery (CSRF) prevention methodologies, request validation frameworks, trust boundary protection strategies, browser security practices, and long-term best practices for designing secure, scalable, maintainable, and production-ready applications that resist CSRF attacks.

It applies to

- Web Applications
- SaaS Platforms
- Enterprise Applications
- APIs
- Administrative Dashboards
- Cloud Platforms
- Browser-Based Systems
- Developer Platforms
- Production Software

CSRF protection is not adding a hidden token to forms.

CSRF protection is the engineering discipline of ensuring that every state-changing request originates intentionally from an authenticated and trusted user within the expected security context while preventing unauthorized cross-origin request execution.

CSRF answers one question:

**Did this authenticated user intentionally perform this action from a trusted context?**

---

# Core Philosophy

Understand Trust Boundaries

↓

Protect User Sessions

↓

Validate Request Origin

↓

Verify User Intent

↓

Protect State Changes

↓

Monitor Abuse

↓

Respond Securely

↓

Continuously Improve

Authenticated requests should never be trusted solely because they include valid session credentials.

---

# Primary Objective

Every CSRF defense should maximize

Request Authenticity

+

Session Integrity

+

User Trust

+

Reliability

+

Maintainability

+

Scalability

+

Operational Simplicity

+

Long-Term Sustainability

Every state-changing request should prove legitimate user intent.

---

# Engineering Principles

Always prioritize

Explicit Request Validation

↓

Origin Verification

↓

Least Trust

↓

Defense in Depth

↓

Secure Browser Behavior

↓

Continuous Validation

↓

Operational Simplicity

↓

Continuous Improvement

User authentication does not automatically imply request authenticity.

---

# CSRF Engineering Lifecycle

Identify Protected Operations

↓

Analyze Trust Boundaries

↓

Protect Sessions

↓

Validate Requests

↓

Monitor Activity

↓

Detect Abuse

↓

Review Security

↓

Continuously Improve

Every state-changing operation requires independent verification.

---

# Stage 1 — Protected Resource Analysis

Identify

User Accounts

↓

Administrative Functions

↓

Financial Operations

↓

Configuration Changes

↓

Sensitive APIs

↓

Profile Updates

↓

Permission Changes

↓

Business Operations

Not every request requires CSRF protection, but every state-changing request should be evaluated.

---

# Stage 2 — Threat Analysis

Identify

Cross-Site Requests

↓

Session Abuse

↓

Browser Trust

↓

Malicious Websites

↓

Social Engineering

↓

Embedded Resources

↓

Cross-Origin Requests

↓

Emerging Threats

Understanding browser behavior is essential for preventing CSRF.

---

# Stage 3 — Trust Boundary Analysis

Define

User Browser

↓

Application

↓

Origin

↓

Session Cookies

↓

Third-Party Services

↓

Embedded Content

↓

Administrative Interfaces

↓

Future Integrations

Trust boundaries should remain explicit.

---

# Stage 4 — Request Architecture

Design

Session Strategy

↓

Token Strategy

↓

Origin Validation

↓

Header Validation

↓

Cookie Policy

↓

State Protection

↓

Monitoring

↓

Future Expansion

Every request should be independently verifiable.

---

# Stage 5 — Protection Strategy

Define

CSRF Tokens

↓

SameSite Cookies

↓

Origin Validation

↓

Referer Validation

↓

Secure Cookies

↓

Session Management

↓

User Confirmation

↓

Operational Limits

Protection should combine multiple defensive layers.

---

# Stage 6 — Session Protection

Protect

Session Cookies

↓

Authentication Cookies

↓

CSRF Tokens

↓

Browser Storage

↓

Credential Transmission

↓

Session Lifetime

↓

Token Rotation

↓

Operational Security

Session integrity directly affects CSRF resistance.

---

# Stage 7 — Request Validation

Validate

CSRF Token

↓

Origin

↓

Referer

↓

Session Integrity

↓

User Context

↓

Business Rules

↓

Protected Operation

↓

Engineering Quality

Every state-changing request should undergo complete validation.

---

# Stage 8 — Security Measurement

Measure

Protected Requests

↓

Validation Failures

↓

Blocked Requests

↓

Session Lifetime

↓

Token Rotation

↓

Suspicious Activity

↓

Operational Stability

↓

Engineering Quality

CSRF defenses should remain measurable.

---

# Stage 9 — Attack Detection

Identify

Missing Tokens

↓

Origin Violations

↓

Referer Violations

↓

Session Abuse

↓

Automated Requests

↓

Browser Anomalies

↓

Unexpected Request Patterns

↓

Operational Threats

Detection should identify abuse before compromise.

---

# Stage 10 — Architecture Review

Evaluate

Trust Boundaries

↓

Request Flow

↓

Browser Security

↓

Session Architecture

↓

Token Lifecycle

↓

Monitoring

↓

Maintainability

↓

Future Evolution

Architecture determines long-term resilience.

---

# Stage 11 — Scalability

Validate

Growing Users

↓

Growing Sessions

↓

Distributed Systems

↓

Multiple Domains

↓

Cloud Infrastructure

↓

Operational Growth

↓

Future Expansion

↓

Engineering Sustainability

CSRF protection should scale without degrading user experience.

---

# Stage 12 — Reliability

Verify

Session Reliability

↓

Request Validation

↓

Operational Stability

↓

Failure Handling

↓

Monitoring

↓

Recovery

↓

Browser Compatibility

↓

Engineering Quality

Reliable validation preserves application integrity.

---

# Stage 13 — Documentation

Document

Protected Resources

↓

Validation Strategy

↓

Session Model

↓

Cookie Policy

↓

Engineering Decisions

↓

Trade-Offs

↓

Operational Standards

↓

Future Improvements

Documentation preserves security consistency.

---

# Stage 14 — Risk Assessment

Identify

Session Risks

↓

Browser Risks

↓

Origin Risks

↓

Cookie Risks

↓

Operational Risks

↓

Infrastructure Risks

↓

Business Risks

↓

Technical Debt

Browser security evolves continuously.

---

# Stage 15 — Trade-Off Analysis

Evaluate

Security

↓

Usability

↓

Performance

↓

Maintainability

↓

Scalability

↓

Operational Cost

↓

Reliability

↓

Future Evolution

Every CSRF defense introduces engineering trade-offs.

---

# Stage 16 — Validation

Validate

Request Authenticity

↓

Session Integrity

↓

Architecture

↓

Implementation

↓

Documentation

↓

Testing

↓

Evidence

↓

Engineering Quality

CSRF defenses require continuous validation.

---

# Stage 17 — Reporting

Produce

Protection Summary

↓

Threat Analysis

↓

Validation Metrics

↓

Operational Health

↓

Risk Assessment

↓

Recommendations

↓

Future Improvements

↓

Lessons Learned

Reports strengthen engineering governance.

---

# Stage 18 — Production Readiness

Validate

Production Configuration

↓

Cookie Policies

↓

HTTPS Enforcement

↓

Monitoring

↓

Logging

↓

Incident Response

↓

Documentation

↓

Operational Stability

CSRF protection should remain dependable in production.

---

# Stage 19 — Governance

Maintain

Security Standards

↓

Request Reviews

↓

Architecture Reviews

↓

Documentation

↓

Ownership

↓

Continuous Monitoring

↓

Knowledge Sharing

↓

Engineering Discipline

CSRF defenses require continuous governance.

---

# Stage 20 — Long-Term Sustainability

Continuously improve

Request Validation

↓

Session Security

↓

Browser Protection

↓

Operational Excellence

↓

Reliability

↓

Engineering Discipline

↓

Security Maturity

↓

Software Longevity

Exceptional CSRF protection continuously strengthens request authenticity while preserving usability, maintainability, and operational simplicity.

---

# CSRF Quality Attributes

Evaluate

Request Authenticity

Session Integrity

Browser Security

Reliability

Maintainability

Scalability

Observability

Long-Term Sustainability

---

# Engineering Questions

Before approving ask

Does every state-changing request require independent validation?

↓

Can requests from untrusted origins be rejected consistently?

↓

Are session credentials protected throughout their lifecycle?

↓

Are browser security mechanisms used effectively?

↓

Can CSRF defenses evolve with modern browser behavior?

↓

Will future engineers understand the protection strategy?

↓

Would experienced Security Engineers, Staff Engineers, Principal Engineers, Browser Security Specialists, and Engineering Leadership confidently approve this CSRF implementation?

---

# Severity Levels

Critical

CSRF vulnerability

Administrative request forgery

Financial transaction forgery

Privilege-changing request forgery

Major

Weak request validation

Session weaknesses

Cookie misconfiguration

Origin validation failures

Medium

Architecture weaknesses

Documentation gaps

Security improvement opportunities

Minor

Formatting

Naming consistency

Documentation quality

---

# CSRF Checklist

✓ Protected resources identified

✓ Threats analyzed

✓ Trust boundaries defined

✓ Request architecture designed

✓ Protection strategy selected

✓ Sessions protected

✓ Requests validated

✓ Security measured

✓ Attacks monitored

✓ Architecture reviewed

✓ Scalability validated

✓ Reliability verified

✓ Documentation completed

✓ Risks assessed

✓ Trade-offs documented

✓ Validation completed

✓ Reports produced

✓ Production readiness verified

✓ Governance established

✓ Long-term sustainability protected

---

# Anti-Patterns

Avoid

Trusting authenticated requests automatically

Ignoring browser security features

Protecting only login forms

Missing origin validation

Weak cookie configuration

Long-lived sessions

Ignoring SameSite behavior

Relying on a single defensive mechanism

Disabling browser protections

Treating CSRF as only a frontend concern

Ignoring administrative interfaces

Optimizing convenience over request authenticity

---

# Definition of Done

A CSRF protection strategy is considered complete when

- Protected operations, browser trust boundaries, session management, request validation mechanisms, cookie policies, monitoring capabilities, governance processes, and operational controls have been systematically designed using secure engineering principles and evidence-based methodologies.
- Every state-changing request is independently validated using multiple defensive mechanisms that verify request authenticity, preserve session integrity, prevent cross-origin request forgery, and maintain reliable protection throughout the software lifecycle.
- The protection architecture supports scalable distributed systems, secure browser behavior, maintainable engineering practices, continuous monitoring, operational resilience, sustainable governance, and long-term software evolution without introducing unnecessary complexity or technical debt.
- Engineering reviews validate request validation consistency, session protection, browser compatibility, documentation completeness, maintainability, scalability, production readiness, operational resilience, auditability, and long-term engineering sustainability before deployment.
- Documentation clearly explains browser trust boundaries, request validation strategy, session architecture, cookie policies, engineering rationale, governance expectations, operational procedures, validation evidence, trade-offs, and future CSRF improvements.
- CSRF protection decisions remain implementation-independent, vendor-neutral, measurable, reproducible, evidence-based, and applicable across evolving browser platforms, web architectures, cloud infrastructure, and future web security technologies.
- The resulting application demonstrates engineering discipline, strong request authenticity, resilient browser security, predictable validation behavior, operational excellence, maintainability, scalability, continuous observability, and sustainable software security throughout its lifetime.

Exceptional CSRF protection is not measured by the number of security tokens implemented.

It is measured by how reliably software verifies user intent, protects authenticated sessions from unauthorized cross-origin actions, minimizes browser trust abuse, withstands evolving web security threats, and continuously delivers secure, maintainable, and resilient request validation throughout the lifetime of the software.