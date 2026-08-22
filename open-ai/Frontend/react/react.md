---
targetModels:
  - "GPT-5.6"
  - "GPT-5.5"
  - "GPT-5.4"
  - "GPT-5 Family"
  - "Future GPT Models"
version: "1.0.0"


---

# react.md

Version: 1.0.0

Target Models

- GPT-5.6
- GPT-5.5
- GPT-5.4
- GPT-5 Family
- Future GPT Models

---

# Purpose

This document defines engineering principles, architectural patterns, development standards, lifecycle expectations, and long-term best practices for building React applications.

It applies to

- Single Page Applications
- Enterprise Frontends
- SaaS Platforms
- Dashboards
- Design Systems
- Component Libraries
- AI Applications
- Internal Tools
- Production Web Applications

React is not a collection of components.

React is a system for building predictable, maintainable, scalable user interfaces through composition, state management, and unidirectional data flow.

Components implement behavior.

Architecture determines maintainability.

---

# Core Philosophy

Understand Requirements

↓

Design Components

↓

Define State

↓

Compose UI

↓

Handle Events

↓

Optimize Rendering

↓

Validate Behavior

↓

Continuously Improve

Good React applications are built from reusable systems rather than isolated components.

---

# Primary Objective

Every React application should maximize

Clarity

+

Maintainability

+

Reusability

+

Predictability

+

Performance

+

Accessibility

+

Scalability

+

Long-Term Sustainability

The UI should remain understandable as the application grows.

---

# Engineering Principles

Always prioritize

Composition

↓

Single Responsibility

↓

Predictable State

↓

Reusable Components

↓

Explicit Data Flow

↓

Accessibility

↓

Performance

↓

Continuous Improvement

Every component should solve exactly one responsibility.

---

# React Development Lifecycle

Understand Requirements

↓

Design Component Hierarchy

↓

Define State Ownership

↓

Build Components

↓

Compose Features

↓

Optimize Rendering

↓

Review

↓

Continuously Improve

Architecture should evolve before implementation.

---

# Stage 1 — Requirements Analysis

Understand

Business Goals

↓

User Workflows

↓

Interaction Patterns

↓

Data Requirements

↓

Accessibility Needs

↓

Performance Expectations

↓

Scalability Goals

↓

Future Evolution

Components should solve user problems rather than mirror visual designs.

---

# Stage 2 — Component Architecture

Design

Component Hierarchy

↓

Responsibility Boundaries

↓

Composition Strategy

↓

Shared Components

↓

Reusable Patterns

↓

Feature Isolation

↓

Dependency Direction

↓

Long-Term Maintainability

Prefer composition over inheritance.

---

# Stage 3 — State Architecture

Identify

Local State

↓

Shared State

↓

Derived State

↓

Server State

↓

UI State

↓

Ownership

↓

Synchronization

↓

Predictability

State should exist in the lowest reasonable location.

---

# Stage 4 — Component Design

Ensure

Single Responsibility

↓

Clear Inputs

↓

Predictable Outputs

↓

Minimal Dependencies

↓

Explicit Interfaces

↓

Reusable Behavior

↓

Consistent Naming

↓

Maintainability

Small components are easier to understand and evolve.

---

# Stage 5 — Data Flow

Maintain

Top-Down Flow

↓

Explicit Props

↓

Controlled Updates

↓

Derived Values

↓

Minimal Mutation

↓

Stable References

↓

Predictable Rendering

↓

Consistent Behavior

Data should always move in predictable directions.

---

# Stage 6 — Hooks

Use hooks to

Share Logic

↓

Manage Lifecycle

↓

Synchronize Effects

↓

Handle State

↓

Access Context

↓

Integrate APIs

↓

Improve Reusability

↓

Reduce Duplication

Hooks should encapsulate behavior rather than UI.

---

# Stage 7 — Side Effects

Manage

API Calls

↓

Subscriptions

↓

Timers

↓

Browser APIs

↓

Storage

↓

Cleanup

↓

Synchronization

↓

Error Handling

Every effect should have a clearly defined lifecycle.

---

# Stage 8 — Rendering Strategy

Optimize

Component Boundaries

↓

Conditional Rendering

↓

List Rendering

↓

Stable Keys

↓

Memoization

↓

Lazy Loading

↓

Suspense

↓

User Experience

Rendering should prioritize correctness before optimization.

---

# Stage 9 — Performance

Optimize

Rendering Frequency

↓

Bundle Size

↓

State Updates

↓

Memoization

↓

Network Requests

↓

Images

↓

Assets

↓

Runtime Efficiency

Measure before optimizing.

---

# Stage 10 — Accessibility

Ensure

Semantic HTML

↓

Keyboard Navigation

↓

Screen Reader Support

↓

Color Contrast

↓

Focus Management

↓

ARIA Usage

↓

Error Feedback

↓

Inclusive Design

Accessibility is a core engineering requirement.

---

# Stage 11 — Error Handling

Handle

Rendering Errors

↓

Validation Errors

↓

Network Failures

↓

Unexpected States

↓

Fallback UI

↓

Recovery

↓

Logging

↓

User Guidance

Applications should fail gracefully.

---

# Stage 12 — Testing Strategy

Validate

Components

↓

Hooks

↓

User Flows

↓

Accessibility

↓

Rendering

↓

Integration

↓

Regression

↓

Reliability

Test behavior rather than implementation.

---

# Stage 13 — Code Organization

Maintain

Feature Separation

↓

Reusable Components

↓

Utilities

↓

Hooks

↓

Contexts

↓

Assets

↓

Naming Standards

↓

Repository Consistency

Organization should simplify navigation.

---

# Stage 14 — Scalability

Design for

Growing Features

↓

Reusable Systems

↓

Shared Components

↓

Independent Modules

↓

Design Systems

↓

Performance Growth

↓

Team Collaboration

↓

Long-Term Evolution

Architecture should support future complexity.

---

# Stage 15 — Documentation

Document

Architecture

↓

Component Responsibilities

↓

State Ownership

↓

Design Decisions

↓

Known Constraints

↓

Trade-Offs

↓

Patterns

↓

Future Improvements

Documentation preserves engineering knowledge.

---

# Stage 16 — Review

Review

Readability

↓

Architecture

↓

Component Boundaries

↓

Performance

↓

Accessibility

↓

Maintainability

↓

Consistency

↓

Engineering Standards

Reviews improve systems rather than syntax.

---

# Stage 17 — Risk Assessment

Evaluate

Component Coupling

↓

State Complexity

↓

Performance Risks

↓

Accessibility Risks

↓

Technical Debt

↓

Architecture Drift

↓

Maintainability

↓

Operational Risk

Every feature introduces long-term maintenance cost.

---

# Stage 18 — Continuous Optimization

Continuously improve

Architecture

↓

Rendering

↓

Accessibility

↓

Developer Experience

↓

Performance

↓

Code Quality

↓

Documentation

↓

Engineering Standards

Improvement should be iterative.

---

# Stage 19 — Production Readiness

Validate

Performance

↓

Accessibility

↓

Cross-Browser Compatibility

↓

Responsiveness

↓

Error Recovery

↓

Monitoring

↓

Logging

↓

Operational Stability

Production readiness is an engineering milestone.

---

# Stage 20 — Long-Term Sustainability

Continuously improve

Architecture

↓

Component Reusability

↓

Performance

↓

Developer Experience

↓

Knowledge Preservation

↓

Engineering Quality

↓

System Consistency

↓

Software Longevity

Excellent React applications remain easy to evolve years after their initial release.

---

# React Quality Attributes

Evaluate

Clarity

Maintainability

Reusability

Predictability

Performance

Accessibility

Scalability

Engineering Consistency

---

# Engineering Questions

Before approving ask

Does every component have a single responsibility?

↓

Is state owned by the correct component?

↓

Is data flow predictable?

↓

Can components be reused elsewhere?

↓

Is rendering optimized without unnecessary complexity?

↓

Is accessibility built into the design?

↓

Would experienced Staff or Principal Engineers confidently approve this architecture?

---

# Severity Levels

Critical

Broken architecture

State inconsistency

Accessibility failures

Rendering instability

Major

Poor component boundaries

Excessive re-rendering

Duplicated logic

Performance bottlenecks

Medium

Naming inconsistencies

Large components

Weak organization

Documentation gaps

Minor

Formatting

Comments

Metadata

Styling consistency

---

# React Checklist

✓ Requirements understood

✓ Component hierarchy designed

✓ State ownership defined

✓ Components reusable

✓ Data flow predictable

✓ Hooks appropriately used

✓ Side effects managed

✓ Rendering optimized

✓ Accessibility ensured

✓ Error handling implemented

✓ Testing completed

✓ Code organized

✓ Scalability considered

✓ Documentation updated

✓ Reviews completed

✓ Risks assessed

✓ Performance validated

✓ Production readiness confirmed

✓ Continuous improvement practiced

✓ Long-term sustainability protected

---

# Anti-Patterns

Avoid

God components

Prop drilling without reason

Duplicated state

Deep component nesting

Business logic inside presentation components

Large effects

Uncontrolled side effects

Premature optimization

Ignoring accessibility

Overusing context

Coupling unrelated components

Ignoring architectural boundaries

Optimizing before measuring

---

# Definition of Done

A React application is considered production-ready when

- Components have clear responsibilities, explicit interfaces, and compose naturally into larger features without creating unnecessary coupling.
- State ownership is intentional, predictable, and maintained at the appropriate architectural level while avoiding duplication and synchronization issues.
- Rendering behavior remains deterministic, efficient, and understandable, with performance optimizations guided by measurement rather than assumption.
- Accessibility, responsiveness, error recovery, and user experience are integrated into the architecture rather than treated as post-development enhancements.
- Component composition, hook design, state management, side-effect handling, testing strategy, and project organization collectively support long-term maintainability and team scalability.
- Engineering reviews validate architectural quality, consistency, performance characteristics, accessibility compliance, documentation completeness, and future maintainability before production deployment.
- The application preserves engineering knowledge through consistent patterns, documented architectural decisions, and reusable design principles that remain valuable as the system evolves.
- The resulting codebase demonstrates engineering discipline, architectural clarity, operational reliability, maintainability, scalability, and long-term software sustainability.

Exceptional React applications are not defined by the number of components they contain.

They are defined by the clarity of their architecture, the predictability of their behavior, the simplicity of their evolution, and the confidence with which future engineers can extend them without compromising the integrity of the system.