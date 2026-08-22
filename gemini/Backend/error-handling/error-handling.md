---
targetModels:
  - "Gemini 3.6 Flash"
  - "Gemini 3.5 Flash"
  - "Gemini 3.1 Pro"
  - "Gemini 3 Family"
  - "Future Gemini Models"
version: "1.0.0"


---

# error-handling.md

Version: 1.0.0

Target Models

- Gemini 3.6 Flash
- Gemini 3.5 Flash
- Gemini 3.1 Pro
- Gemini 3 Family
- Future Gemini Models

---

# Purpose

This document defines how Gemini should design, implement, review, optimize, and maintain Error Handling systems.

Error handling is not simply catching exceptions.

Error handling is the systematic process of detecting, classifying, recovering from, reporting, and learning from failures while maintaining system stability, security, observability, and user trust.

The objective is to build error handling systems that are predictable, resilient, maintainable, observable, and capable of recovering gracefully whenever possible.

Errors are inevitable.

Poor error handling is optional.

---

# Core Philosophy

Detect Failure

↓

Classify Error

↓

Contain Impact

↓

Recover When Possible

↓

Report Clearly

↓

Log Context

↓

Improve System

↓

Approve

Failures should be expected.

Systems should be designed accordingly.

---

# Primary Objective

Every error handling system should answer one question.

"Can failures be detected, isolated, communicated, and recovered from without compromising users, data integrity, or system reliability?"

If the answer is uncertain,

the error handling strategy requires improvement.

---

# Error Handling Principles

Every implementation should maximize

Reliability

↓

Predictability

↓

Recoverability

↓

Observability

↓

Security

↓

Maintainability

↓

Developer Experience

↓

User Experience

Errors should be intentional.

Never accidental.

---

# Error Handling Workflow

Failure Occurs

↓

Detect Error

↓

Classify Severity

↓

Recover or Fail

↓

Log Context

↓

Notify Systems

↓

Respond Safely

↓

Approve

---

# Stage 1 — Error Identification

Identify possible failures.

Examples

Validation failures

↓

Authentication failures

↓

Authorization failures

↓

Business rule violations

↓

Database failures

↓

Queue failures

↓

Worker failures

↓

External API failures

↓

Infrastructure failures

↓

Unexpected exceptions

Every failure should have an owner.

---

# Stage 2 — Error Classification

Separate errors into categories.

Client Errors

↓

Business Errors

↓

Validation Errors

↓

Authentication Errors

↓

Authorization Errors

↓

Dependency Errors

↓

Infrastructure Errors

↓

Unexpected System Errors

Different errors require different handling strategies.

---

# Stage 3 — Expected vs Unexpected

Expected

Validation failure

↓

Permission denied

↓

Duplicate email

↓

Resource not found

Unexpected

Null reference

↓

Database unavailable

↓

Memory exhaustion

↓

Programming bug

Expected errors are part of normal application behavior.

Unexpected errors indicate defects or infrastructure problems.

---

# Stage 4 — Error Types

Prefer domain-specific error types.

Examples

ValidationError

AuthenticationError

AuthorizationError

ConflictError

NotFoundError

RateLimitError

DependencyError

InternalServerError

Meaningful error types simplify recovery.

---

# Stage 5 — Fail Fast

Detect invalid conditions early.

Validate

Input

↓

Configuration

↓

Dependencies

↓

Permissions

↓

Business rules

Early failure reduces system complexity.

---

# Stage 6 — Recovery Strategy

Determine whether recovery is possible.

Retry

↓

Fallback

↓

Circuit breaker

↓

Cached response

↓

Graceful degradation

↓

Fail immediately

Recovery depends on failure type.

---

# Stage 7 — Exception Handling

Catch exceptions

Only where they can be handled.

Avoid

Catching everything

↓

Ignoring exceptions

↓

Empty catch blocks

↓

Silent failures

Unhandled errors should propagate to centralized handlers.

---

# Stage 8 — User Responses

Return

Consistent responses

↓

Meaningful messages

↓

Appropriate HTTP status

↓

Request ID

↓

Error Code

↓

Recovery guidance

Users should understand what happened.

Without exposing implementation details.

---

# Stage 9 — Error Codes

Every public error should have

Stable error code

↓

Human-readable message

↓

Documentation reference

↓

Machine-readable structure

↓

Correlation ID

Error codes improve debugging and support.

---

# Stage 10 — Logging

Log

Error ID

↓

Correlation ID

↓

Stack trace

↓

Request context

↓

User ID (when appropriate)

↓

Environment

↓

Service

↓

Timestamp

Never log

Passwords

Tokens

Secrets

Sensitive personal information

---

# Stage 11 — Security

Never expose

Stack traces

↓

SQL queries

↓

Internal paths

↓

Infrastructure details

↓

Secrets

↓

Environment variables

↓

Configuration

Internal failures should remain internal.

---

# Stage 12 — Observability

Track

Error rate

↓

Failure trends

↓

Recovery rate

↓

Dependency failures

↓

Unhandled exceptions

↓

Service degradation

↓

Incident frequency

Errors should become operational signals.

---

# Stage 13 — Dependency Failures

Handle

Database unavailable

↓

Cache unavailable

↓

Message broker unavailable

↓

Email provider failure

↓

Payment provider failure

↓

External API timeout

Applications should remain resilient despite dependency failures.

---

# Stage 14 — Retry Strategy

Retry only transient failures.

Examples

Timeout

↓

Temporary network failure

↓

Rate limiting

↓

Service unavailable

Implement

Exponential backoff

↓

Retry limits

↓

Jitter

↓

Circuit breaker

Never retry permanent failures.

---

# Stage 15 — Graceful Degradation

When full functionality is unavailable,

consider

Cached responses

↓

Reduced functionality

↓

Read-only mode

↓

Partial results

↓

Feature disabling

Systems should remain usable whenever possible.

---

# Stage 16 — Monitoring & Alerting

Monitor

Unhandled exceptions

↓

High error rates

↓

Dependency failures

↓

Repeated retries

↓

Recovery failures

↓

Service outages

Critical failures should trigger alerts immediately.

---

# Stage 17 — Testing

Verify

Validation failures

↓

Business failures

↓

Dependency failures

↓

Network failures

↓

Timeouts

↓

Retries

↓

Recovery

↓

Unexpected exceptions

Failure scenarios deserve as much testing as successful scenarios.

---

# Stage 18 — Documentation

Document

Error types

↓

Error codes

↓

Recovery strategy

↓

Retry policy

↓

Failure examples

↓

Operational procedures

↓

Runbooks

Documentation accelerates troubleshooting.

---

# Stage 19 — Incident Learning

Review

Production incidents

↓

Root causes

↓

Recovery effectiveness

↓

Detection time

↓

Resolution time

↓

Preventive actions

Every incident should improve the system.

---

# Stage 20 — Continuous Improvement

Review

Failure patterns

↓

Code quality

↓

Recovery strategies

↓

Monitoring

↓

Developer feedback

↓

Infrastructure evolution

↓

Architecture improvements

Error handling should continuously mature.

---

# Error Handling Quality Attributes

Evaluate

Reliability

Recoverability

Security

Observability

Maintainability

Scalability

Consistency

Developer Experience

---

# Error Handling Questions

Before approval ask

Can every failure be classified?

↓

Can users receive consistent responses?

↓

Can operators diagnose failures quickly?

↓

Can transient failures recover automatically?

↓

Can permanent failures fail safely?

↓

Is sensitive information always protected?

↓

Would another engineering team trust this error handling architecture during a production incident?

---

# Severity Levels

Critical

Unhandled exception

Data corruption

Sensitive information exposure

Infinite retry loop

Application crash

Major

Poor recovery strategy

Missing centralized handler

Inconsistent responses

Weak logging

Missing monitoring

Medium

Documentation improvements

Recovery optimization

Better error classification

Minor

Message consistency

Naming improvements

Developer ergonomics

Future enhancements

---

# Error Handling Checklist

✓ Error categories defined

✓ Domain-specific error types implemented

✓ Centralized error handler configured

✓ Consistent API responses

✓ Stable error codes assigned

✓ Sensitive information protected

✓ Logging standardized

✓ Monitoring enabled

✓ Retry strategy reviewed

✓ Graceful degradation implemented

✓ Dependency failures handled

✓ Security reviewed

✓ Testing completed

✓ Documentation complete

✓ Incident review process established

---

# Anti-Patterns

Avoid

Empty catch blocks

Ignoring exceptions

Generic error messages everywhere

Leaking stack traces

Leaking SQL errors

Retrying permanent failures

Infinite retry loops

Duplicated error handling logic

Returning different error formats

Business logic inside exception handlers

Logging sensitive information

Swallowing dependency failures

Treating all exceptions identically

---

# Definition of Done

Error handling review is complete when

- All expected and unexpected failures are clearly identified and classified.
- Domain-specific errors communicate meaningful information without exposing implementation details.
- Centralized error handling produces consistent responses across the entire application.
- Recovery strategies distinguish between transient and permanent failures using retries, fallbacks, circuit breakers, or graceful degradation where appropriate.
- Logging, monitoring, and alerting provide complete visibility into application failures and recovery behavior.
- Sensitive information is never exposed through responses, logs, or diagnostic output.
- Error codes, recovery procedures, and operational runbooks are fully documented.
- Comprehensive testing validates normal operation, failure scenarios, dependency outages, and recovery mechanisms.
- Production incidents feed continuous improvements to architecture, monitoring, and operational procedures.
- The system remains reliable, predictable, and maintainable even when failures occur.

Exceptional error handling makes resilient systems.

Failures are detected quickly, contained safely, communicated consistently, recovered automatically whenever possible, and transformed into opportunities for improving reliability rather than sources of operational chaos.