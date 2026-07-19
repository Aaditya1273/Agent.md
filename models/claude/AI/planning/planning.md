# planning.md

Version: 1.0.0

Target Models

- Claude 5 Family
- Claude 4.x Family
- Future Claude Models

---

# Purpose

This document defines the planning methodology for engineering tasks.

The objective is to ensure every implementation begins with a clear, structured plan before any code is written. Effective planning reduces technical debt, improves maintainability, and minimizes unnecessary revisions.

Planning is mandatory for all medium and large engineering tasks.

---

# Core Planning Principles

Planning should always:

- Clarify the objective.
- Understand the existing system.
- Define scope.
- Break work into manageable milestones.
- Identify risks.
- Determine success criteria.
- Reduce uncertainty before implementation.

Implementation should never begin without a coherent plan.

---

# Planning Workflow

Every task should follow this sequence:

Understand

↓

Analyze

↓

Define Scope

↓

Identify Constraints

↓

Design Solution

↓

Break into Milestones

↓

Estimate Risks

↓

Review Plan

↓

Implement

↓

Verify

---

# Step 1 — Understand the Objective

Clearly identify:

- What needs to be built?
- Why is it needed?
- Who benefits?
- What problem is being solved?
- What does success look like?

Avoid assuming intent.

---

# Step 2 — Analyze Existing Architecture

Understand the current system before proposing changes.

Review:

- Project structure
- Existing modules
- Components
- Utilities
- APIs
- State management
- Database schema
- Design system
- Configuration

Prefer extending existing architecture rather than introducing new patterns.

---

# Step 3 — Define Scope

Separate work into:

### In Scope

Features that must be completed.

### Out of Scope

Features intentionally excluded.

Prevent scope creep.

---

# Step 4 — Identify Constraints

Document all constraints.

Examples:

- Existing framework
- Existing API contracts
- Performance requirements
- Security requirements
- Browser compatibility
- Mobile support
- Accessibility
- Deployment environment
- Package restrictions

Every implementation must respect these constraints.

---

# Step 5 — Solution Design

Before implementation, determine:

Architecture

↓

Data Flow

↓

Component Structure

↓

API Design

↓

Error Handling

↓

Testing Strategy

↓

Deployment Impact

Design first.

Implement second.

---

# Step 6 — Break Into Milestones

Large work should be divided into independent milestones.

Example:

Milestone 1

Foundation

Milestone 2

Core Logic

Milestone 3

Integration

Milestone 4

User Interface

Milestone 5

Testing

Milestone 6

Optimization

Each milestone should produce measurable progress.

---

# Step 7 — Dependency Analysis

Identify dependencies before coding.

Examples:

- External packages
- Shared utilities
- Environment variables
- APIs
- Database changes
- Authentication
- Third-party services

Avoid discovering dependencies during implementation.

---

# Step 8 — Risk Assessment

Identify technical risks.

Examples:

- Breaking changes
- Performance bottlenecks
- Security vulnerabilities
- Migration complexity
- Browser incompatibility
- Race conditions
- Scalability concerns

Plan mitigation strategies early.

---

# Step 9 — Resource Planning

Estimate:

- Complexity
- Development effort
- Testing effort
- Documentation effort
- Refactoring needs

Balance implementation quality with practical delivery.

---

# Step 10 — Success Criteria

Define measurable outcomes.

Examples:

✓ Feature complete

✓ Production ready

✓ Type-safe

✓ Responsive

✓ Accessible

✓ Tested

✓ Documented

✓ Maintainable

---

# Frontend Planning

Before building UI, define:

- User flow
- Navigation
- Layout hierarchy
- Component structure
- State management
- Loading states
- Error states
- Empty states
- Responsive behavior
- Accessibility

Avoid designing screens independently from the overall user experience.

---

# Backend Planning

Before implementing backend logic:

Define:

- Responsibilities
- APIs
- Validation
- Authentication
- Authorization
- Database interactions
- Logging
- Monitoring
- Failure handling
- Scalability

---

# Database Planning

Before modifying data:

Determine:

- Schema impact
- Relationships
- Migrations
- Indexes
- Constraints
- Rollback strategy

Avoid unnecessary schema changes.

---

# API Planning

Before implementing endpoints:

Define:

- Purpose
- Inputs
- Validation
- Authentication
- Authorization
- Responses
- Errors
- Pagination
- Versioning

---

# Testing Plan

Every feature should define:

Unit Tests

↓

Integration Tests

↓

End-to-End Tests

↓

Manual Verification

Testing should be planned, not added afterward.

---

# Refactoring Plan

Before refactoring:

Identify:

- Existing issue
- Proposed improvement
- Expected impact
- Migration strategy
- Rollback plan

Avoid refactoring without measurable benefit.

---

# Documentation Plan

Determine:

- What changed?
- Why it changed?
- How to use it?
- Configuration updates
- Operational notes
- Future extension points

Documentation is part of implementation.

---

# Review Plan

Before coding begins, review:

✓ Objective understood

✓ Architecture analyzed

✓ Scope defined

✓ Constraints identified

✓ Risks documented

✓ Dependencies identified

✓ Milestones created

✓ Success criteria defined

Only proceed when the plan is internally consistent.

---

# Anti-Patterns

Avoid:

- Coding without planning.
- Mixing planning with implementation.
- Ignoring project architecture.
- Expanding scope during implementation.
- Planning only happy paths.
- Omitting testing strategy.
- Ignoring rollback considerations.
- Creating unnecessary abstractions.

---

# Definition of Done

Planning is complete only when:

- Objectives are clear.
- Scope is defined.
- Architecture is understood.
- Milestones are established.
- Risks are identified.
- Dependencies are known.
- Success criteria are measurable.
- The implementation path is unambiguous.

A complete plan should allow another engineer to implement the solution with minimal additional clarification.