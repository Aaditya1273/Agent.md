# context.md

Version: 1.0.0

Target Models

- Claude 5 Family
- Claude 4.x Family
- Future Claude Models

---

# Purpose

This document defines how context should be collected, maintained, expanded, and utilized throughout an engineering session.

Context is the foundation of engineering reasoning.

Every implementation decision should originate from context rather than assumptions.

Good context reduces hallucinations, unnecessary rewrites, inconsistent architecture, and implementation mistakes.

---

# Core Philosophy

Understand

↓

Collect Context

↓

Expand Context

↓

Verify Context

↓

Reason

↓

Plan

↓

Implement

↓

Review

↓

Update Context

↓

Continue

Implementation should always be context-driven.

---

# Definition of Context

Context is every piece of information required to make an engineering decision.

Context includes:

- User objectives
- Existing architecture
- Repository structure
- Business requirements
- Technical constraints
- Dependencies
- Previous engineering decisions
- Active implementation state
- Future scalability requirements

Never assume context.

Always build it.

---

# Context Hierarchy

Every engineering task should understand context in layers.

Layer 1

User Context

Understand:

- What does the user actually want?
- What problem are they solving?
- Why is this feature required?
- What outcome matters most?

Business intent always comes first.

---

Layer 2

Repository Context

Understand:

- Folder structure
- Framework
- Languages
- Configuration
- Existing modules
- Utilities
- Components
- Shared logic

Never treat repositories as blank projects.

---

Layer 3

Architecture Context

Understand:

Application structure

↓

Component hierarchy

↓

Data flow

↓

State management

↓

API design

↓

Database design

↓

Infrastructure

Every implementation should reinforce architecture.

---

Layer 4

Implementation Context

Determine:

Current feature

Completed work

Pending work

Current milestone

Modified files

Dependencies

Testing state

Avoid isolated coding.

---

Layer 5

Operational Context

Understand:

Deployment

Environment

Authentication

Authorization

Caching

Monitoring

Logging

Infrastructure

Production context matters.

---

# Context Collection

Before implementation gather:

Project Goal

↓

Architecture

↓

Requirements

↓

Constraints

↓

Existing Patterns

↓

Dependencies

↓

Success Criteria

↓

Risks

Only after context is sufficient should implementation begin.

---

# Context Expansion

As work progresses continuously expand understanding.

Every modification should increase contextual awareness.

Update context whenever:

New files appear

Architecture changes

Requirements evolve

Assumptions are corrected

Dependencies change

User clarifies objectives

Context is dynamic.

---

# Context Verification

Before major implementation verify:

Current objective

↓

Architecture

↓

Constraints

↓

Dependencies

↓

Implementation strategy

↓

Expected outcome

If uncertainty exists:

Resolve it before continuing.

---

# Repository Awareness

Always understand:

Directory structure

Shared utilities

Reusable components

Configuration

Naming conventions

Project standards

Existing abstractions

Avoid duplicate implementations.

---

# File Context

Never modify files without understanding:

Purpose

↓

Dependencies

↓

Consumers

↓

Interfaces

↓

Responsibilities

↓

Relationships

Context exists beyond individual files.

---

# Component Context

For UI projects understand:

Parent hierarchy

Children

Shared state

Props

Reusable logic

Styling system

Accessibility

Responsive behavior

Components should never be designed independently.

---

# Backend Context

Understand:

Services

Controllers

Database

Authentication

Authorization

Validation

Caching

Logging

Monitoring

Every backend change affects the larger system.

---

# API Context

Before modifying APIs understand:

Purpose

Consumers

Authentication

Validation

Versioning

Error handling

Performance

Backward compatibility

Never break existing integrations unintentionally.

---

# Database Context

Understand:

Schema

Relationships

Indexes

Constraints

Migration history

Data lifecycle

Performance

Data consistency is critical.

---

# Dependency Context

Before introducing dependencies determine:

Does the project already solve this?

↓

Can existing utilities be reused?

↓

Is maintenance acceptable?

↓

Is bundle size acceptable?

↓

Is security acceptable?

Prefer simplicity.

---

# User Intent Context

Differentiate between:

Requested feature

↓

Underlying problem

↓

Desired outcome

↓

Business objective

Solve the actual problem—not merely the stated request.

---

# Historical Context

Remember:

Previous decisions

Previous bugs

Previous architecture

Previous refactors

Rejected approaches

Avoid repeating engineering mistakes.

---

# Future Context

Every implementation should consider:

Maintainability

Scalability

Extensibility

Future contributors

Operational complexity

Engineering decisions should age well.

---

# Context During Debugging

Collect:

Observed behavior

↓

Expected behavior

↓

Logs

↓

Stack traces

↓

Environment

↓

Recent changes

↓

Root cause

Avoid debugging from assumptions.

---

# Context During Refactoring

Understand:

Existing responsibility

↓

Current consumers

↓

Dependencies

↓

Potential regressions

↓

Migration strategy

↓

Rollback strategy

Refactor with complete awareness.

---

# Context Refresh

During long engineering sessions periodically review:

Current objective

Current milestone

Completed work

Remaining work

Architecture

Dependencies

Assumptions

Risks

Refreshing context prevents drift.

---

# Context Compression

Large repositories contain excessive information.

Compress context into:

Architecture summary

Current milestone

Important constraints

Critical dependencies

Active files

Pending tasks

Keep only information relevant to current engineering decisions.

---

# Missing Context Strategy

If required information is unavailable:

Identify exactly what is missing.

Estimate impact.

Minimize assumptions.

Request clarification if necessary.

Proceed only when confidence is acceptable.

---

# Anti-Patterns

Avoid:

Coding before understanding.

Ignoring repository architecture.

Making hidden assumptions.

Losing user intent.

Duplicating existing functionality.

Forgetting previous decisions.

Ignoring production constraints.

Treating every request independently.

---

# Context Checklist

Before implementation verify:

✓ User objective understood

✓ Repository explored

✓ Architecture understood

✓ Existing patterns identified

✓ Constraints documented

✓ Dependencies understood

✓ Current milestone known

✓ Risks identified

✓ Success criteria defined

---

# Definition of Done

Context management is complete when:

- The engineering objective is fully understood.
- Repository structure is known.
- Architecture is preserved.
- User intent remains consistent.
- Dependencies are understood.
- Constraints are respected.
- Assumptions are minimal and explicit.
- Every implementation decision is supported by sufficient context.

Context is the foundation upon which reasoning, planning, implementation, and verification are built.