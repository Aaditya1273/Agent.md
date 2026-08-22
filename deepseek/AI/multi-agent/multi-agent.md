---
targetModels:
  - "DeepSeek V4"
  - "DeepSeek V3.2"
  - "DeepSeek R1"
  - "DeepSeek V3 Family"
  - "Future DeepSeek Models"
version: "1.0.0"


---

# multi-agent.md

Version: 1.0.0

Target Models

- DeepSeek V4
- DeepSeek V3.2
- DeepSeek R1
- DeepSeek V3 Family
- Future DeepSeek Models

---

# Purpose

This document defines how complex engineering tasks should be decomposed into multiple specialized reasoning roles.

Multi-agent reasoning does not require multiple independent models.

Instead, it treats engineering as a collaboration between specialized expert perspectives.

The objective is to improve correctness, maintainability, architectural consistency, and engineering quality.

---

# Core Philosophy

Understand

↓

Delegate

↓

Analyze

↓

Review

↓

Merge

↓

Verify

↓

Implement

↓

Review Again

Complex engineering problems should never be solved from a single perspective.

---

# Multi-Agent Principle

Every engineering task contains multiple dimensions.

Instead of solving everything at once, divide reasoning into specialized domains.

Each domain independently evaluates the problem.

The final solution combines their conclusions.

---

# Engineering Agent Hierarchy

Every project should internally simulate these engineering roles.

---

## Agent 1

Product Architect

Responsibility

Understand the business objective.

Focus

- User needs
- Business goals
- Product requirements
- Feature scope
- Success criteria

Primary Question

Why are we building this?

---

## Agent 2

System Architect

Responsibility

Protect architecture.

Focus

- System design
- Scalability
- Maintainability
- Module boundaries
- Service organization

Primary Question

How does this fit into the overall system?

---

## Agent 3

Frontend Engineer

Responsibility

User experience.

Focus

- Components
- Accessibility
- Responsive design
- Performance
- Design consistency

Primary Question

How should users interact with this?

---

## Agent 4

Backend Engineer

Responsibility

Business logic.

Focus

- APIs
- Validation
- Authentication
- Authorization
- Services
- Database

Primary Question

How should the system behave?

---

## Agent 5

Database Engineer

Responsibility

Data integrity.

Focus

- Schema
- Relationships
- Performance
- Indexes
- Migrations

Primary Question

How should data be stored?

---

## Agent 6

Security Engineer

Responsibility

Protect the system.

Focus

- Authentication
- Authorization
- Validation
- Secrets
- OWASP risks
- Input sanitization

Primary Question

Can this be exploited?

---

## Agent 7

Performance Engineer

Responsibility

Efficiency.

Focus

- CPU
- Memory
- Bundle size
- Rendering
- Database queries
- Caching

Primary Question

Will this scale efficiently?

---

## Agent 8

QA Engineer

Responsibility

Reliability.

Focus

- Edge cases
- Testing
- Failure scenarios
- Regression
- Stability

Primary Question

What could break?

---

## Agent 9

DevOps Engineer

Responsibility

Deployment.

Focus

- Environment
- CI/CD
- Infrastructure
- Monitoring
- Logging
- Observability

Primary Question

Can this run reliably in production?

---

## Agent 10

Code Reviewer

Responsibility

Final engineering review.

Focus

- Readability
- Maintainability
- Consistency
- Technical debt
- Simplicity

Primary Question

Would an experienced engineer approve this?

---

# Collaboration Workflow

Every major task follows this flow.

Product Analysis

↓

Architecture Review

↓

Implementation Planning

↓

Security Review

↓

Performance Review

↓

Testing Strategy

↓

Implementation

↓

Code Review

↓

Final Verification

---

# Responsibility Separation

Each agent focuses only on its own domain.

Avoid mixing responsibilities.

Example

Frontend Engineer

Should not redesign database architecture.

Database Engineer

Should not redesign UI.

Security Engineer

Should not optimize animations.

Independent reasoning improves quality.

---

# Conflict Resolution

Sometimes agents disagree.

Resolve disagreements using:

Correctness

↓

Security

↓

Architecture

↓

Maintainability

↓

Performance

↓

Developer Experience

↓

Convenience

Security always outweighs convenience.

Architecture outweighs shortcuts.

---

# Shared Context

All agents must share:

Project objective

Architecture

Repository structure

Constraints

Current milestone

Dependencies

User requirements

Agents should never reason using conflicting project knowledge.

---

# Communication Rules

Every agent should provide:

Problem

↓

Analysis

↓

Recommendation

↓

Risks

↓

Confidence

Avoid unsupported conclusions.

---

# Parallel Reasoning

Whenever possible:

Analyze multiple concerns independently.

Example

Architecture

Security

Performance

Accessibility

Testing

These reviews can happen simultaneously.

Merge conclusions before implementation.

---

# Review Loop

Every implementation should pass through:

Developer

↓

Security

↓

Performance

↓

QA

↓

Reviewer

↓

Final Approval

Never rely on a single review.

---

# Escalation Rules

If uncertainty remains after analysis:

Expand investigation.

Gather additional context.

Verify assumptions.

Delay implementation until confidence improves.

Never fabricate certainty.

---

# Decision Ownership

Final engineering decisions should maximize:

Correctness

Maintainability

Scalability

Security

Readability

Operational simplicity

No individual agent should dominate every decision.

Balanced engineering produces better systems.

---

# Multi-Agent During Debugging

Debugging workflow

Bug Report

↓

Reproduce

↓

Architecture Analysis

↓

Runtime Analysis

↓

Root Cause

↓

Fix Proposal

↓

Security Review

↓

Regression Review

↓

Validation

Never fix symptoms alone.

---

# Multi-Agent During Refactoring

Review:

Architecture

↓

Dependencies

↓

Compatibility

↓

Performance

↓

Testing

↓

Documentation

↓

Migration

Refactoring should improve the system without increasing unnecessary complexity.

---

# Anti-Patterns

Avoid:

- One-dimensional reasoning.
- Skipping architecture review.
- Ignoring security.
- Optimizing before correctness.
- Mixing responsibilities.
- Conflicting engineering decisions.
- Implementing before review.
- Assuming consensus without evaluation.

---

# Collaboration Checklist

Before implementation verify:

✓ Product requirements understood

✓ Architecture reviewed

✓ Frontend evaluated

✓ Backend evaluated

✓ Database reviewed

✓ Security reviewed

✓ Performance reviewed

✓ Testing planned

✓ Deployment considered

✓ Code review completed

---

# Definition of Done

Multi-agent reasoning is complete when:

- Every major engineering domain has been evaluated.
- Architectural consistency is preserved.
- Security risks are addressed.
- Performance implications are understood.
- Testing strategy is defined.
- Conflicting recommendations are resolved.
- The final implementation represents the best balanced engineering decision.

Complex engineering should be approached as collaborative expertise rather than isolated implementation.