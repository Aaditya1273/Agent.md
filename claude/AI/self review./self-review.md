# self-review.md

Version: 1.0.0

Target Models

- Claude 5 Family
- Claude 4.x Family
- Future Claude Models

---

# Purpose

This document defines the self-review methodology for engineering tasks.

Self-review is the final quality control stage before delivering any implementation.

The objective is to detect mistakes, inconsistencies, architectural violations, unnecessary complexity, and incomplete work before presenting the final solution.

Implementation is not complete until it has been reviewed.

---

# Core Philosophy

Plan

↓

Implement

↓

Review

↓

Improve

↓

Verify

↓

Deliver

Every implementation should assume it contains mistakes until proven otherwise.

---

# Self-Review Mindset

Review as if you are:

- The original developer
- A senior code reviewer
- A security engineer
- A QA engineer
- A future maintainer

Every perspective should evaluate the implementation independently.

---

# Review Workflow

Understand Final Objective

↓

Compare Against Requirements

↓

Review Architecture

↓

Review Implementation

↓

Review Edge Cases

↓

Review Security

↓

Review Performance

↓

Review Readability

↓

Review Maintainability

↓

Deliver

---

# Stage 1 — Requirement Review

Verify:

✓ Every requested feature exists

✓ No requested feature is missing

✓ No unnecessary functionality was added

✓ User objective has been satisfied

---

# Stage 2 — Architecture Review

Verify:

Architecture remains consistent.

No duplicate systems exist.

Existing project patterns are preserved.

Folder structure remains logical.

Shared utilities are reused.

No unnecessary abstractions were introduced.

---

# Stage 3 — Code Quality Review

Review:

Naming

Structure

Readability

Consistency

Modularity

Simplicity

Avoid code that is difficult to understand.

---

# Stage 4 — Logic Review

Question every decision.

Ask:

Does this actually solve the problem?

↓

Could this fail?

↓

Are assumptions correct?

↓

Can it be simplified?

↓

Would another engineer understand it?

---

# Stage 5 — Security Review

Inspect:

Authentication

Authorization

Input validation

Output encoding

Secrets

Permissions

Sensitive data

Injection risks

Never assume security is correct.

Verify it.

---

# Stage 6 — Performance Review

Evaluate:

Database queries

Rendering

Memory

CPU

Network requests

Bundle size

Caching

Avoid unnecessary optimization.

Focus on meaningful improvements.

---

# Stage 7 — Accessibility Review

Verify:

Semantic HTML

Keyboard navigation

ARIA usage

Color contrast

Responsive layouts

Focus handling

Accessible software is production-ready software.

---

# Stage 8 — Error Handling

Review:

Validation

Exceptions

Timeouts

Fallbacks

Loading states

Empty states

Recovery mechanisms

Every failure should produce predictable behavior.

---

# Stage 9 — Edge Case Review

Ask:

What if input is empty?

↓

What if API fails?

↓

What if data is missing?

↓

What if user has no permissions?

↓

What if latency increases?

↓

What if dependencies fail?

Review beyond the happy path.

---

# Stage 10 — Testing Review

Verify:

Unit testing possible

Integration considered

Regression risk minimized

Manual verification possible

Testing strategy documented

---

# Stage 11 — Dependency Review

Review:

New packages

Version compatibility

Security

Maintenance

Bundle impact

Existing alternatives

Avoid unnecessary dependencies.

---

# Stage 12 — Documentation Review

Confirm:

Purpose documented

Usage documented

Configuration explained

Limitations noted

Future extension points identified

Documentation should match implementation.

---

# Stage 13 — Maintainability Review

Evaluate:

Will another engineer understand this?

↓

Can this be extended?

↓

Is responsibility clear?

↓

Is duplication minimized?

↓

Is future maintenance easy?

Maintainability is more valuable than cleverness.

---

# Stage 14 — Consistency Review

Verify consistency across:

Naming

Architecture

Coding style

Components

APIs

Database

Documentation

User experience

Consistency reduces cognitive load.

---

# Stage 15 — Final Engineering Questions

Before completion ask:

Did I solve the real problem?

Did I preserve architecture?

Did I introduce technical debt?

Can this scale?

Is security acceptable?

Is testing sufficient?

Would I approve this in production?

If any answer is uncertain:

Review again.

---

# Self-Review Checklist

Requirements

✓ Complete

Architecture

✓ Consistent

Security

✓ Reviewed

Performance

✓ Acceptable

Accessibility

✓ Verified

Testing

✓ Planned

Documentation

✓ Updated

Maintainability

✓ High

Technical Debt

✓ Minimal

Production Readiness

✓ Acceptable

---

# Review Confidence Levels

High

Implementation verified from multiple perspectives.

Medium

Minor uncertainty remains but risk is low.

Low

Critical assumptions remain unverified.

Never present uncertain work as production-ready.

---

# Anti-Patterns

Avoid:

- Delivering without review.
- Reviewing only syntax.
- Ignoring architecture.
- Ignoring edge cases.
- Reviewing only happy paths.
- Assuming generated code is correct.
- Optimizing before verifying correctness.
- Skipping documentation review.

---

# Definition of Done

Self-review is complete when:

- Every requirement has been verified.
- Architecture remains consistent.
- Security risks have been reviewed.
- Performance has been evaluated.
- Edge cases have been considered.
- Documentation reflects implementation.
- Maintainability is preserved.
- The solution would confidently pass a professional engineering code review.

The implementation is complete only when the review finds no significant issues requiring correction.