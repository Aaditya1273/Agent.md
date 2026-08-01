# architecture-analysis.md

Version: 1.0.0

Target Models

- Claude 5 Family
- Claude 4.8
- Claude 4.7
- Claude 4.x Family
- Future Claude Models

---

# Purpose

This document defines engineering principles, systematic architectural evaluation methods, system decomposition techniques, dependency analysis strategies, design assessment standards, and long-term best practices for understanding software architecture before proposing modifications or improvements.

It applies to

- Open Source Projects
- Enterprise Applications
- SaaS Platforms
- Libraries
- Frameworks
- APIs
- Microservices
- Monoliths
- Distributed Systems
- Production Software

Architecture analysis is not reviewing code quality.

Architecture analysis is the engineering discipline of discovering how software is intentionally organized, why architectural decisions were made, how components collaborate, and whether the system can evolve without losing its integrity.

Implementation explains behavior.

Architecture explains intent.

---

# Core Philosophy

Understand the Problem

↓

Understand the System

↓

Discover Architectural Decisions

↓

Identify Design Constraints

↓

Understand Component Relationships

↓

Evaluate Evolution Capability

↓

Document Findings

↓

Recommend Improvements

Architecture should be understood before it is criticized.

---

# Primary Objective

Every architecture analysis should maximize

Architectural Understanding

+

Design Clarity

+

System Integrity

+

Maintainability

+

Scalability

+

Reliability

+

Evolution Readiness

+

Engineering Consistency

The objective is understanding architectural intent rather than identifying implementation mistakes.

---

# Engineering Principles

Always prioritize

Business Requirements

↓

Architectural Intent

↓

System Boundaries

↓

Separation of Concerns

↓

Dependency Direction

↓

Evolution

↓

Maintainability

↓

Continuous Improvement

Architecture exists to support change safely.

---

# Architecture Analysis Lifecycle

Understand Business Problem

↓

Identify Architectural Style

↓

Discover System Boundaries

↓

Analyze Dependencies

↓

Evaluate Quality Attributes

↓

Assess Risks

↓

Document Findings

↓

Recommend Improvements

Architecture should always be analyzed as a complete system.

---

# Stage 1 — Problem Domain

Understand

Business Objectives

↓

Primary Capabilities

↓

System Scope

↓

Users

↓

Constraints

↓

Operational Goals

↓

Success Criteria

↓

Future Growth

Architecture begins with business requirements.

---

# Stage 2 — Architectural Style

Identify

Monolith

↓

Modular Monolith

↓

Microservices

↓

Event-Driven

↓

Layered

↓

Hexagonal

↓

Clean Architecture

↓

Hybrid Approaches

Architecture style explains system organization.

---

# Stage 3 — System Boundaries

Discover

Core Domain

↓

Supporting Domains

↓

Infrastructure

↓

External Systems

↓

Integration Points

↓

Shared Services

↓

Ownership

↓

Responsibilities

Boundaries define architectural integrity.

---

# Stage 4 — Component Analysis

Identify

Major Components

↓

Responsibilities

↓

Interfaces

↓

Communication

↓

Dependencies

↓

Lifecycle

↓

Ownership

↓

Evolution

Every component should have one primary responsibility.

---

# Stage 5 — Dependency Analysis

Review

Dependency Direction

↓

Coupling

↓

Shared Contracts

↓

Abstractions

↓

Circular Dependencies

↓

Layer Isolation

↓

Integration Boundaries

↓

Maintainability

Dependencies should strengthen—not weaken—the architecture.

---

# Stage 6 — Data Flow

Analyze

Input Sources

↓

Transformation

↓

Validation

↓

Business Logic

↓

Persistence

↓

Output

↓

External Communication

↓

Feedback

Data movement should remain predictable.

---

# Stage 7 — Execution Flow

Understand

Initialization

↓

Request Processing

↓

Business Execution

↓

Infrastructure Calls

↓

State Changes

↓

Events

↓

Responses

↓

Completion

Execution should follow deterministic pathways.

---

# Stage 8 — Separation of Concerns

Evaluate

Presentation

↓

Application Logic

↓

Domain Logic

↓

Infrastructure

↓

Persistence

↓

Configuration

↓

Observability

↓

Automation

Responsibilities should never overlap unnecessarily.

---

# Stage 9 — Scalability

Review

Horizontal Scaling

↓

Vertical Scaling

↓

Independent Components

↓

Resource Isolation

↓

Concurrency

↓

Distributed Execution

↓

Future Expansion

↓

Operational Growth

Scalability should emerge from architecture.

---

# Stage 10 — Reliability

Assess

Fault Isolation

↓

Error Boundaries

↓

Recovery

↓

Retries

↓

Graceful Degradation

↓

Monitoring

↓

Resilience

↓

Operational Stability

Reliable systems tolerate failures.

---

# Stage 11 — Maintainability

Evaluate

Module Size

↓

Cohesion

↓

Coupling

↓

Readability

↓

Consistency

↓

Documentation

↓

Ownership

↓

Technical Debt

Architecture should become easier—not harder—to evolve.

---

# Stage 12 — Extensibility

Review

Plugin Capability

↓

Feature Expansion

↓

Module Replacement

↓

API Stability

↓

Configuration

↓

Version Evolution

↓

Backward Compatibility

↓

Long-Term Growth

Architecture should encourage safe extension.

---

# Stage 13 — Operational Architecture

Analyze

Deployment

↓

Configuration

↓

Monitoring

↓

Logging

↓

Automation

↓

Infrastructure

↓

Release Strategy

↓

Operations

Operational architecture is part of software architecture.

---

# Stage 14 — Documentation

Evaluate

Architecture Documentation

↓

Decision Records

↓

Diagrams

↓

Module Descriptions

↓

Trade-Offs

↓

Constraints

↓

Future Plans

↓

Knowledge Preservation

Architecture should be understandable without reading every source file.

---

# Stage 15 — Risk Assessment

Identify

Architectural Debt

↓

Coupling Risks

↓

Scalability Risks

↓

Reliability Risks

↓

Dependency Risks

↓

Operational Risks

↓

Maintenance Risks

↓

Evolution Risks

Architecture risks compound over time.

---

# Stage 16 — Trade-Off Analysis

Evaluate

Benefits

↓

Costs

↓

Complexity

↓

Performance

↓

Maintainability

↓

Scalability

↓

Operational Impact

↓

Long-Term Sustainability

Every architecture is a collection of intentional trade-offs.

---

# Stage 17 — Improvement Opportunities

Recommend

Boundary Refinement

↓

Dependency Simplification

↓

Modularization

↓

Performance Improvements

↓

Reliability Improvements

↓

Developer Experience

↓

Documentation

↓

Future Evolution

Recommendations should preserve architectural integrity.

---

# Stage 18 — Validation

Validate

Architectural Assumptions

↓

Boundaries

↓

Dependencies

↓

Responsibilities

↓

Quality Attributes

↓

Documentation

↓

Evidence

↓

Consistency

Architecture conclusions should always be evidence-based.

---

# Stage 19 — Reporting

Produce

Architecture Overview

↓

System Diagram

↓

Strengths

↓

Weaknesses

↓

Risks

↓

Recommendations

↓

Priorities

↓

Future Direction

Reports should support architectural decision-making.

---

# Stage 20 — Long-Term Sustainability

Evaluate

Architectural Stability

↓

Evolution Capacity

↓

Maintainability

↓

Scalability

↓

Reliability

↓

Knowledge Preservation

↓

Engineering Quality

↓

Software Longevity

Exceptional architectures evolve without losing their identity.

---

# Architecture Quality Attributes

Evaluate

Modularity

Scalability

Reliability

Maintainability

Extensibility

Operational Readiness

Engineering Consistency

Long-Term Sustainability

---

# Engineering Questions

Before approving ask

Does the architecture clearly solve the intended business problem?

↓

Are responsibilities separated appropriately?

↓

Are component boundaries explicit?

↓

Do dependencies flow in predictable directions?

↓

Can the architecture evolve without major redesign?

↓

Are trade-offs documented and intentional?

↓

Would experienced Staff or Principal Engineers confidently approve this architectural analysis?

---

# Severity Levels

Critical

Broken architecture

Undefined boundaries

Circular architecture

Critical coupling

Major

Weak modularity

Architecture drift

Poor dependency direction

Scalability limitations

Medium

Documentation gaps

Weak abstractions

Inconsistent boundaries

Minor

Naming consistency

Formatting

Documentation quality

---

# Architecture Analysis Checklist

✓ Business problem understood

✓ Architectural style identified

✓ System boundaries analyzed

✓ Components documented

✓ Dependencies evaluated

✓ Data flow understood

✓ Execution flow analyzed

✓ Separation of concerns reviewed

✓ Scalability evaluated

✓ Reliability assessed

✓ Maintainability reviewed

✓ Extensibility analyzed

✓ Operational architecture evaluated

✓ Documentation reviewed

✓ Risks identified

✓ Trade-offs documented

✓ Improvements proposed

✓ Findings validated

✓ Report completed

✓ Long-term sustainability evaluated

---

# Anti-Patterns

Avoid

Analyzing architecture from individual files

Confusing frameworks with architecture

Ignoring business requirements

Assuming architectural intent

Overvaluing design patterns

Ignoring operational architecture

Making recommendations without evidence

Focusing only on implementation

Treating complexity as sophistication

Ignoring historical constraints

Reviewing modules independently

Optimizing without understanding trade-offs

---

# Definition of Done

An architecture analysis is considered complete when

- The business objectives, architectural style, system boundaries, component responsibilities, dependency relationships, execution model, operational characteristics, and evolution strategy are understood well enough to explain why the architecture exists in its current form.
- Architectural decisions are evaluated using objective engineering principles, evidence from the repository, documented constraints, and observable system behavior rather than implementation preferences or framework conventions.
- Component boundaries, dependency direction, communication models, scalability characteristics, maintainability, extensibility, reliability, operational readiness, and long-term sustainability have been systematically assessed as parts of a unified engineering system.
- Architectural strengths, weaknesses, risks, trade-offs, technical constraints, and future opportunities are clearly documented, prioritized by engineering impact, and supported by reproducible observations.
- Recommendations improve architectural quality without violating established system boundaries, introducing unnecessary complexity, weakening maintainability, or compromising operational stability.
- Documentation preserves architectural intent through clearly described responsibilities, boundary definitions, dependency relationships, design decisions, known constraints, trade-offs, and future evolution strategies.
- The resulting analysis demonstrates architectural thinking, systems reasoning, engineering discipline, objective evaluation, operational awareness, maintainability, scalability, and long-term software sustainability.

Exceptional architecture analysis is not measured by the number of diagrams produced.

It is measured by how accurately it explains why a system is organized the way it is, how objectively it evaluates engineering decisions, and how confidently it enables future architectural evolution while preserving the integrity, maintainability, and long-term sustainability of the software system.