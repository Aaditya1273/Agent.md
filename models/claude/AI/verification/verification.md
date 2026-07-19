# verification.md

Version: 1.0.0

Target Models

- Claude 5 Family
- Claude 4.x Family
- Future Claude Models

---

# Purpose

This document defines the verification methodology for software engineering tasks.

Verification ensures that an implementation is correct, complete, reliable, maintainable, secure, and production-ready.

Verification is the final engineering gate before delivery.

Never assume an implementation is correct simply because it compiles or appears to work.

---

# Core Philosophy

Understand

↓

Plan

↓

Implement

↓

Review

↓

Verify

↓

Deliver

Verification is independent from implementation.

Every assumption must be validated.

---

# Verification Objectives

The verification process should confirm:

✓ Requirements satisfied

✓ Correct implementation

✓ Architecture preserved

✓ Security maintained

✓ Performance acceptable

✓ No regressions introduced

✓ Production readiness achieved

---

# Verification Layers

Every engineering task should pass through multiple verification layers.

Layer 1

Requirement Verification

Layer 2

Architecture Verification

Layer 3

Implementation Verification

Layer 4

Security Verification

Layer 5

Performance Verification

Layer 6

Testing Verification

Layer 7

Documentation Verification

Layer 8

Production Verification

Every layer must pass before completion.

---

# Layer 1 — Requirement Verification

Verify:

Every requested feature exists.

No required feature is missing.

Behavior matches the specification.

Business objectives are satisfied.

No unrelated functionality has been introduced.

---

# Layer 2 — Architecture Verification

Confirm:

Existing architecture remains intact.

Folder structure remains consistent.

Existing abstractions are reused.

No duplicate logic exists.

No unnecessary complexity was introduced.

New code integrates naturally into the project.

---

# Layer 3 — Implementation Verification

Inspect:

Logic correctness

Control flow

Data flow

Function responsibilities

State management

API contracts

Database interactions

Error handling

The implementation should behave predictably.

---

# Layer 4 — Dependency Verification

Review every dependency.

Determine:

Is it necessary?

Is it maintained?

Is it secure?

Does it duplicate existing functionality?

Does it increase operational complexity?

Prefer minimal dependencies.

---

# Layer 5 — Security Verification

Verify:

Authentication

Authorization

Input validation

Output encoding

Sensitive data handling

Secret management

Rate limiting

Access control

Error exposure

Never assume security.

Explicitly validate it.

---

# Layer 6 — Performance Verification

Evaluate:

CPU usage

Memory usage

Network efficiency

Rendering cost

Database performance

Caching

Bundle size

Scalability

Only optimize verified bottlenecks.

---

# Layer 7 — Error Verification

Confirm every failure path.

Examples:

Invalid input

Missing data

Network failure

Authentication failure

Permission denial

Timeout

Unexpected exceptions

Every failure should produce predictable behavior.

---

# Layer 8 — Edge Case Verification

Test beyond normal usage.

Examples:

Empty input

Large input

Null values

Duplicate data

Race conditions

Offline mode

High latency

Unexpected user behavior

Engineering quality is determined by edge cases.

---

# Layer 9 — UI Verification

Verify:

Visual hierarchy

Typography

Spacing

Responsiveness

Accessibility

Keyboard navigation

Loading states

Empty states

Error states

Consistency

UI should remain usable across devices.

---

# Layer 10 — API Verification

Confirm:

Request validation

Response consistency

Authentication

Authorization

HTTP status codes

Pagination

Versioning

Backward compatibility

Error responses

Never expose inconsistent APIs.

---

# Layer 11 — Database Verification

Verify:

Schema integrity

Relationships

Indexes

Constraints

Migration safety

Rollback strategy

Query performance

Data consistency

Protect data integrity.

---

# Layer 12 — Testing Verification

Confirm:

Unit tests

Integration tests

End-to-end tests

Regression tests

Manual verification

Testing should validate expected behavior.

---

# Layer 13 — Documentation Verification

Ensure documentation includes:

Purpose

Usage

Configuration

Architecture notes

Limitations

Future extension points

Documentation should reflect reality.

---

# Layer 14 — Production Verification

Confirm:

Production configuration

Environment variables

Logging

Monitoring

Observability

Deployment readiness

Security configuration

Scalability

Recovery strategy

Production readiness extends beyond code.

---

# Verification Questions

Before completion ask:

Did every requirement pass?

↓

Can another engineer maintain this?

↓

Does architecture remain consistent?

↓

Can this safely scale?

↓

Have assumptions been validated?

↓

Would this survive production traffic?

↓

Would this pass professional code review?

If uncertainty remains:

Continue verification.

---

# Evidence-Based Verification

Verification should rely on evidence.

Examples:

Passing tests

Successful builds

Static analysis

Type checking

Manual inspection

Performance profiling

Security review

Avoid relying on intuition alone.

---

# Verification Matrix

| Area | Status |
|------|--------|
| Requirements | ✓ |
| Architecture | ✓ |
| Implementation | ✓ |
| Security | ✓ |
| Performance | ✓ |
| Accessibility | ✓ |
| Testing | ✓ |
| Documentation | ✓ |
| Production Readiness | ✓ |

Every category should be evaluated independently.

---

# Confidence Levels

High

Multiple independent verification methods confirm correctness.

Medium

Minor uncertainty exists but operational risk is low.

Low

Critical assumptions remain unverified.

Never present low-confidence implementations as production-ready.

---

# Verification Workflow

Requirements

↓

Architecture

↓

Implementation

↓

Security

↓

Performance

↓

Testing

↓

Documentation

↓

Production

↓

Final Approval

Each stage should increase confidence.

---

# Anti-Patterns

Avoid:

- Assuming generated code is correct.
- Verifying only successful scenarios.
- Ignoring edge cases.
- Skipping architecture review.
- Ignoring production deployment.
- Treating compilation as proof of correctness.
- Delivering unverified assumptions.
- Declaring completion without evidence.

---

# Final Verification Checklist

✓ Requirements verified

✓ Scope complete

✓ Architecture preserved

✓ Existing patterns reused

✓ Security reviewed

✓ Performance acceptable

✓ Error handling complete

✓ Edge cases considered

✓ Accessibility verified

✓ Testing completed

✓ Documentation updated

✓ Production readiness confirmed

✓ No known regressions

✓ Technical debt minimized

---

# Definition of Done

Verification is complete only when:

- Every engineering requirement has been independently validated.
- The implementation behaves as intended.
- Architecture remains consistent.
- Security has been reviewed.
- Performance meets project expectations.
- Edge cases are handled.
- Documentation reflects implementation.
- The solution is supported by evidence rather than assumptions.
- The implementation is suitable for production deployment.

Verification transforms an implementation into a production-ready engineering deliverable.