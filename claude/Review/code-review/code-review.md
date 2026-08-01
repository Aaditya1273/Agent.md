# code-review.md

Version: 1.0.0

Target Models

- Claude 5 Family
- Claude 4.x Family
- Future Claude Models

---

# Purpose

This document defines the professional code review methodology for engineering tasks.

Code review is not a syntax check.

It is a systematic engineering process that evaluates correctness, maintainability, architecture, security, performance, readability, and long-term software quality.

The objective is to review code with the same discipline expected from a senior software engineer before production deployment.

---

# Core Philosophy

Understand

↓

Inspect

↓

Analyze

↓

Verify

↓

Improve

↓

Approve

Never review code by reading line-by-line only.

Review how every change affects the entire system.

---

# Primary Objective

The goal of code review is to answer one question:

"Would this implementation be accepted into a production codebase maintained for the next five years?"

If the answer is uncertain,

do not approve.

---

# Engineering Review Priorities

Always evaluate in this order.

1. Correctness

↓

2. Security

↓

3. Architecture

↓

4. Maintainability

↓

5. Reliability

↓

6. Performance

↓

7. Readability

↓

8. Developer Experience

Never optimize readability while ignoring correctness.

---

# Review Workflow

Understand Requirements

↓

Understand Architecture

↓

Inspect Implementation

↓

Evaluate Risks

↓

Identify Improvements

↓

Verify Production Readiness

↓

Approve

---

# Stage 1 — Requirement Review

Verify:

✓ Every requested feature exists.

✓ Nothing requested is missing.

✓ No unrelated functionality was added.

✓ Business requirements are satisfied.

---

# Stage 2 — Correctness Review

Inspect:

Business logic

Control flow

Conditions

Loops

State transitions

Edge cases

Error handling

Data integrity

Every execution path should produce predictable behavior.

---

# Stage 3 — Architecture Review

Confirm:

The implementation follows existing architecture.

Existing abstractions are reused.

Responsibilities remain separated.

No duplicate systems were introduced.

No architectural shortcuts were taken.

---

# Stage 4 — Readability Review

Evaluate:

Function names

Variable names

Component names

Folder organization

File organization

Code formatting

Logical flow

Comments

Readable code reduces future maintenance costs.

---

# Stage 5 — Maintainability Review

Ask:

Can another engineer understand this in six months?

↓

Can this be extended safely?

↓

Can responsibilities be identified quickly?

↓

Is technical debt minimized?

Maintainability should increase after every review.

---

# Stage 6 — Complexity Review

Inspect:

Large functions

Nested conditions

Repeated logic

Unnecessary abstractions

Hidden side effects

Complex state

Prefer simplicity.

Complexity should always have clear justification.

---

# Stage 7 — Security Review

Review:

Authentication

Authorization

Validation

Secrets

Permissions

Injection risks

Sensitive data exposure

Never approve code that introduces avoidable security risks.

---

# Stage 8 — Performance Review

Evaluate:

Database queries

Network requests

Memory allocation

Rendering

Bundle size

Caching

Concurrency

Optimize only verified bottlenecks.

---

# Stage 9 — Error Handling

Verify:

Input validation

Exceptions

Fallbacks

Timeouts

Retries

Recovery

Logging

Every failure should be intentional.

---

# Stage 10 — Testing Review

Confirm:

Unit testing possible

Integration testing considered

Regression risks minimized

Edge cases identified

Testability is part of engineering quality.

---

# Stage 11 — Dependency Review

Review:

New libraries

Version compatibility

Security

Maintenance status

Bundle impact

Existing alternatives

Prefer fewer dependencies.

---

# Stage 12 — Documentation Review

Verify:

Purpose documented

Usage explained

Configuration updated

Architecture notes included

Limitations described

Documentation should evolve with implementation.

---

# Review Questions

Before approval ask:

Does this solve the real problem?

↓

Does this preserve architecture?

↓

Does this introduce unnecessary complexity?

↓

Can another engineer maintain this?

↓

Is production deployment safe?

↓

Would I confidently approve this in a professional code review?

---

# Severity Classification

## Critical

Must be fixed before merge.

Examples:

Security vulnerability

Data corruption

Breaking architecture

Incorrect implementation

---

## Major

Should be fixed before merge.

Examples:

Poor maintainability

Large duplication

Performance bottleneck

Missing validation

---

## Minor

Can be improved later.

Examples:

Naming

Formatting

Small refactoring

Documentation improvements

---

## Suggestion

Optional improvements.

Examples:

Cleaner abstraction

Improved readability

Alternative implementation

Developer experience improvements

---

# Review Checklist

Requirements

✓ Complete

Correctness

✓ Verified

Architecture

✓ Preserved

Security

✓ Reviewed

Performance

✓ Acceptable

Readability

✓ High

Maintainability

✓ High

Testing

✓ Considered

Documentation

✓ Updated

Production Readiness

✓ Confirmed

---

# Anti-Patterns

Avoid approving code that:

- Solves the wrong problem.
- Introduces duplicate logic.
- Ignores existing architecture.
- Contains hidden assumptions.
- Lacks validation.
- Increases technical debt.
- Optimizes prematurely.
- Reduces readability.
- Omits documentation.

---

# Definition of Done

Code review is complete only when:

- Requirements are fully satisfied.
- The implementation is correct.
- Architecture remains consistent.
- Security risks are addressed.
- Maintainability has been preserved or improved.
- Performance is acceptable.
- Documentation matches implementation.
- The code is suitable for production deployment.
- An experienced engineering team would confidently approve the change.

The purpose of code review is not to find faults—it is to increase the long-term quality, reliability, and sustainability of the software.