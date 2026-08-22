---
targetModels:
  - "GPT-5.6"
  - "GPT-5.5"
  - "GPT-5.4"
  - "GPT-5 Family"
  - "Future GPT Models"
version: "1.0.0"


---

# email.md

Version: 1.0.0

Target Models

- GPT-5.6
- GPT-5.5
- GPT-5.4
- GPT-5 Family
- Future GPT Models

---

# Purpose

This document defines how ChatGPT should design, implement, review, optimize, and maintain Email systems.

Email is not simply sending messages.

Email is a reliable communication channel used for authentication, notifications, transactional workflows, business communication, compliance, and customer engagement.

The objective is to build email systems that are reliable, secure, scalable, observable, compliant, and capable of delivering the right message to the right recipient at the right time.

Emails are user communication.

Treat them as part of the product experience.

---

# Core Philosophy

Trigger Event

↓

Validate Request

↓

Generate Content

↓

Queue Email

↓

Send Email

↓

Track Delivery

↓

Handle Failures

↓

Approve

Email sending should never block business operations.

---

# Primary Objective

Every email system should answer one question.

"Can important emails be delivered reliably, securely, and observably without negatively affecting application performance or user experience?"

If the answer is uncertain,

the email architecture requires improvement.

---

# Email Principles

Every implementation should maximize

Reliability

↓

Deliverability

↓

Security

↓

Scalability

↓

Maintainability

↓

Observability

↓

Compliance

↓

Developer Experience

Emails should reach users.

Not spam folders.

---

# Email Workflow

Business Event

↓

Validate Recipient

↓

Generate Email

↓

Queue Message

↓

Send Email

↓

Track Delivery

↓

Handle Failures

↓

Approve

---

# Stage 1 — Email Classification

Identify email categories.

Examples

Account Verification

↓

Password Reset

↓

Magic Links

↓

Purchase Confirmation

↓

Invoice Delivery

↓

Security Alerts

↓

Welcome Emails

↓

Order Updates

↓

Marketing Campaigns

↓

Weekly Reports

Transactional and marketing emails should remain independent.

---

# Stage 2 — Trigger Design

Emails should be triggered by

Business events

↓

User actions

↓

Scheduled jobs

↓

Administrative actions

↓

System events

Avoid triggering emails directly from controllers whenever possible.

---

# Stage 3 — Recipient Validation

Validate

Email format

↓

Verified account

↓

Subscription status

↓

Bounce history

↓

Suppression list

↓

Recipient permissions

Never send to invalid recipients.

---

# Stage 4 — Template Design

Templates should be

Reusable

↓

Responsive

↓

Accessible

↓

Versioned

↓

Localized

↓

Brand consistent

↓

Maintainable

Business logic should never live inside templates.

---

# Stage 5 — Personalization

Support

User name

↓

Organization

↓

Language

↓

Time zone

↓

Preferences

↓

Dynamic data

Personalization should improve relevance without exposing sensitive information.

---

# Stage 6 — Localization

Support

Multiple languages

↓

Regional formatting

↓

Currencies

↓

Dates

↓

Time zones

↓

Localized templates

Global applications require localized communication.

---

# Stage 7 — Email Generation

Generate

Subject

↓

Plain text version

↓

HTML version

↓

Attachments (when required)

↓

Tracking metadata

↓

Headers

Every email should have a readable plain-text alternative.

---

# Stage 8 — Attachments

Review

File type

↓

File size

↓

Virus scanning

↓

Access permissions

↓

Download expiration

↓

Compression

Avoid unnecessary attachments.

Prefer secure download links for large files.

---

# Stage 9 — Queue Integration

Email delivery should use

Background jobs

↓

Queues

↓

Workers

↓

Retry policies

↓

Priority handling

Never block HTTP requests while sending email.

---

# Stage 10 — Deliverability

Review

SPF

↓

DKIM

↓

DMARC

↓

Sender reputation

↓

Bounce rate

↓

Spam score

↓

Domain alignment

Deliverability is part of system reliability.

---

# Stage 11 — Failure Handling

Handle

Temporary SMTP failures

↓

Provider outages

↓

Rate limiting

↓

Soft bounces

↓

Hard bounces

↓

Invalid recipients

Every delivery failure should be observable.

---

# Stage 12 — Retry Strategy

Retry only transient failures.

Implement

Exponential backoff

↓

Retry limits

↓

Dead Letter Queue

↓

Alerting

↓

Manual replay

Permanent failures should not be retried indefinitely.

---

# Stage 13 — Security

Review

Encrypted transport

↓

Secret management

↓

Signed links

↓

One-time tokens

↓

Sensitive content

↓

Phishing resistance

Security emails require the highest level of protection.

---

# Stage 14 — Compliance

Support

Unsubscribe

↓

Consent management

↓

Data retention

↓

Privacy regulations

↓

Audit logging

↓

Legal requirements

Compliance varies by jurisdiction and email category.

---

# Stage 15 — Observability

Monitor

Delivery rate

↓

Open rate

↓

Click rate

↓

Bounce rate

↓

Complaint rate

↓

Queue latency

↓

Provider latency

Every email should be traceable.

---

# Stage 16 — Logging

Log

Email ID

↓

Recipient ID

↓

Template

↓

Provider

↓

Delivery status

↓

Retry count

↓

Failure reason

Never log

Passwords

Reset tokens

Secrets

Sensitive email content

---

# Stage 17 — Scalability

Support

Bulk sending

↓

Multiple providers

↓

Provider failover

↓

Regional delivery

↓

Horizontal workers

↓

Auto scaling

Email infrastructure should scale independently of applications.

---

# Stage 18 — Testing

Verify

Successful delivery

↓

Template rendering

↓

Localization

↓

Retry behavior

↓

Bounce handling

↓

Attachments

↓

Large campaigns

↓

Failure recovery

Email systems require both functional and operational testing.

---

# Stage 19 — Documentation

Document

Email types

↓

Templates

↓

Trigger events

↓

Providers

↓

Retry policy

↓

Compliance rules

↓

Monitoring

↓

Recovery procedures

Documentation should support both developers and operations teams.

---

# Stage 20 — Continuous Improvement

Review

Delivery metrics

↓

Bounce trends

↓

Template performance

↓

Infrastructure cost

↓

Provider reliability

↓

User feedback

Email systems should improve continuously.

---

# Email Quality Attributes

Evaluate

Reliability

Deliverability

Performance

Scalability

Security

Compliance

Observability

Developer Experience

---

# Email Questions

Before approval ask

Can important emails always be delivered?

↓

Can failed emails recover automatically?

↓

Can users receive localized content?

↓

Can delivery be fully observed?

↓

Can infrastructure scale during peak demand?

↓

Can compliance requirements be satisfied?

↓

Would another engineering team trust this email architecture?

---

# Severity Levels

Critical

Lost transactional emails

Password reset failure

Verification email failure

Sensitive information leakage

Provider outage without recovery

Major

Poor deliverability

Weak retry strategy

Broken templates

High bounce rate

Missing monitoring

Medium

Localization improvements

Performance optimization

Template improvements

Minor

Formatting

Brand consistency

Operational enhancements

Future optimization

---

# Email Checklist

✓ Email categories identified

✓ Trigger events defined

✓ Recipient validation implemented

✓ Templates reusable

✓ Localization supported

✓ Plain-text version included

✓ Queue integration implemented

✓ Deliverability configured

✓ Retry strategy implemented

✓ Compliance reviewed

✓ Logging enabled

✓ Monitoring configured

✓ Security validated

✓ Testing completed

✓ Documentation complete

---

# Anti-Patterns

Avoid

Sending emails inside HTTP requests

Hardcoded email templates

Business logic inside templates

Sending to unverified recipients

Ignoring SPF, DKIM, and DMARC

Infinite retries

Logging email secrets

Large attachments without validation

Ignoring unsubscribe preferences

No plain-text alternative

Provider-specific implementation throughout the codebase

Ignoring bounce handling

Treating transactional and marketing emails identically

---

# Definition of Done

Email system review is complete when

- Transactional and marketing emails are clearly separated and independently managed.
- Email generation is asynchronous and does not affect request-response performance.
- Templates are reusable, localized, accessible, and version-controlled.
- Deliverability is protected through proper authentication, reputation management, and monitoring.
- Retry strategies recover from temporary failures without causing duplicate or excessive delivery.
- Sensitive emails use secure links, encrypted transport, and minimal exposure of confidential information.
- Logging and monitoring provide complete visibility into delivery, failures, and provider performance.
- Compliance requirements for consent, privacy, retention, and unsubscribe management are satisfied.
- Documentation explains email workflows, templates, providers, retries, and operational procedures.
- The email system continues delivering reliable communication despite provider outages, traffic spikes, infrastructure failures, or increasing business scale.

Exceptional email systems are nearly invisible.

Users receive timely, secure, and relevant communication, transactional messages arrive reliably, marketing campaigns remain compliant, operators have complete visibility into delivery health, and the platform communicates with confidence regardless of scale or infrastructure conditions.