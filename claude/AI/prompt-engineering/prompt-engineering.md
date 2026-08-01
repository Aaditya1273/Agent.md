# prompt-engineering.md

Version: 1.0
Target Models:
- Claude 5 (all variants)
- Claude 4.x and 3.x family
- Future Claude models (general guidance)

---

# Purpose

This document defines how prompts should be constructed for Claude during software engineering tasks.

The objective is to maximize consistency, architectural quality, correctness, maintainability, and production readiness.

Claude should never be treated as an autocomplete system.

Claude should be treated as an engineering collaborator.

---

# Core Philosophy

Every request follows this lifecycle:

Understand

↓

Clarify

↓

Analyze

↓

Plan

↓

Design

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

Never skip stages when the task is complex.

---

# Primary Goal

Optimize for:

- correctness
- maintainability
- scalability
- readability
- security
- accessibility
- developer experience

Never optimize primarily for response speed.

---

# Prompt Structure

Every engineering request should include the following sections whenever applicable:

## Goal

What should be built?

---

## Context

What already exists?

Repository

Framework

Architecture

Constraints

Dependencies

---

## Requirements

Functional requirements

Non-functional requirements

Business requirements

---

## Constraints

Technology

Coding style

Performance

Security

Timeline

Compatibility

---

## Success Criteria

How will success be measured?

Examples:

- Production Ready
- Mobile Responsive
- Type Safe
- Accessible
- Tested

---

## Output Format

Specify expected output.

Example:

Architecture

Implementation

Testing

Review

Checklist

---

# Engineering Prompt Pattern

Prefer prompts similar to:

Goal

↓

Context

↓

Requirements

↓

Constraints

↓

Acceptance Criteria

↓

Implementation

↓

Review

↓

Next Steps

---

# Repository Awareness

Before making implementation decisions Claude should understand:

Folder structure

Architecture

Framework

Coding conventions

Dependencies

Reusable components

Existing utilities

Configuration

Do not duplicate existing patterns.

Prefer consistency.

---

# Large Task Strategy

If the task is large:

Break into milestones.

Each milestone should contain:

Planning

Implementation

Review

Verification

Proceed sequentially.

---

# Feature Development

Every feature should answer:

Why does this feature exist?

Who benefits?

How does it integrate with the existing architecture?

What are the edge cases?

What are the security implications?

How will it be tested?

---

# UI Requests

When generating UI:

Consider:

Hierarchy

Spacing

Typography

Accessibility

Responsiveness

Interaction states

Motion

Performance

Visual consistency

Avoid generic layouts.

---

# API Requests

Before writing endpoints define:

Responsibilities

Validation

Authentication

Authorization

Error handling

Rate limiting

Pagination

Logging

Monitoring

Versioning

---

# Refactoring Requests

Never refactor randomly.

First identify:

Code smell

Duplication

Complexity

Maintainability

Risk

Then propose improvements.

---

# Open Source Projects

When modifying existing repositories:

Understand existing architecture first.

Preserve public APIs unless intentionally changing them.

Respect project conventions.

Avoid unnecessary rewrites.

---

# Multi-Repository Projects

Before integrating repositories:

Understand:

Responsibilities

Boundaries

Dependencies

Shared models

Authentication

Configuration

Deployment

Design interfaces before implementation.

---

# Decision Framework

When multiple approaches exist compare:

Complexity

Maintainability

Performance

Scalability

Security

Developer Experience

Future Flexibility

Choose the solution with the best long-term balance.

---

# Clarification Policy

If missing information would significantly affect architecture or correctness:

Ask concise clarification questions before implementation.

Do not invent important requirements.

If assumptions are necessary:

Clearly label them.

---

# Code Generation Principles

Generate:

Complete implementations

Readable code

Consistent naming

Strong typing where applicable

Reusable abstractions

Meaningful error handling

Avoid:

Placeholder implementations

Fake APIs

TODO comments as substitutes for functionality

Unnecessary complexity

---

# Self-Consistency

Maintain consistency across:

Naming

Folder structure

Imports

Coding style

Component patterns

API conventions

Error handling

Testing strategy

---

# Documentation

Every significant implementation should include:

Purpose

Architecture notes

Usage

Configuration

Limitations

Future considerations

---

# Review Before Completion

Before considering a task complete, verify:

Requirements satisfied

Architecture consistent

Code readable

Security considered

Performance acceptable

Accessibility addressed

Testing strategy defined

Documentation updated

No obvious regressions

---

# Completion Standard

A task is complete only when:

The implementation satisfies the requested functionality,

integrates cleanly into the existing project,

maintains architectural consistency,

and is suitable for production review.