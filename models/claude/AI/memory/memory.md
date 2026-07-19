# memory.md

Version: 1.0.0

Target Models

- Claude 5 Family
- Claude 4.x Family
- Future Claude Models

---

# Purpose

This document defines how memory should be managed during engineering tasks.

Memory is not permanent knowledge.

Memory is the continuously evolving understanding of the current project, user intent, architectural decisions, implementation history, and engineering context.

The objective is to maintain consistency across long engineering sessions while minimizing repeated analysis and contradictory decisions.

---

# Core Philosophy

Understand

↓

Remember

↓

Apply

↓

Update

↓

Verify

↓

Continue

Memory should evolve with the project.

Never rely solely on the initial prompt.

---

# Memory Hierarchy

Every engineering task should organize information into different memory layers.

Level 1

User Objective

Remember:

- Primary goal
- Desired outcome
- Business intent
- Success criteria

Never lose sight of the original objective.

---

Level 2

Project Context

Remember:

- Framework
- Language
- Repository structure
- Architecture
- Dependencies
- Existing conventions

Every future decision should align with this context.

---

Level 3

Architecture Memory

Continuously remember:

- Design patterns
- Component hierarchy
- Service boundaries
- Data flow
- State management
- API structure

Avoid introducing conflicting architecture.

---

Level 4

Implementation Memory

Track:

Completed modules

Pending work

Modified files

Refactored code

Generated utilities

Temporary assumptions

Never repeat completed work.

---

Level 5

Decision Memory

Record important engineering decisions.

Example

Authentication uses JWT.

↓

Continue using JWT.

Do not suddenly switch to sessions without explicit intent.

Consistency is more valuable than novelty.

---

Level 6

Constraint Memory

Always remember:

Performance limits

Security requirements

Accessibility requirements

Browser support

Package restrictions

Deployment environment

Database limitations

Constraints should influence every future decision.

---

Level 7

Error Memory

Remember previous failures.

Examples

Incorrect API route

Database migration issue

State synchronization bug

Type mismatch

Do not repeat previously identified mistakes.

---

# Context Refresh

At major milestones, refresh understanding.

Review:

Current objective

↓

Completed work

↓

Remaining tasks

↓

Architecture

↓

Dependencies

↓

Constraints

↓

Continue

Refreshing memory prevents drift.

---

# Persistent Project Awareness

Always maintain awareness of:

Folder structure

Naming conventions

Design system

Coding standards

Shared utilities

Existing abstractions

Repository organization

Avoid acting as though every prompt begins from scratch.

---

# Task Memory

Track progress.

Not Started

↓

Planning

↓

Implementation

↓

Testing

↓

Review

↓

Completed

Always know the current phase.

---

# File Memory

Remember:

Files created

Files modified

Files removed

Configuration changes

API changes

Schema changes

Avoid duplicate work.

---

# Component Memory

For frontend projects remember:

Reusable components

Shared layouts

Hooks

Utilities

Contexts

Providers

Avoid recreating existing functionality.

---

# Backend Memory

Remember:

Endpoints

Services

Database models

Authentication

Authorization

Validation

Caching

Logging

Maintain backend consistency.

---

# API Memory

Track:

Routes

Request formats

Response formats

Authentication

Pagination

Versioning

Error handling

Maintain API consistency throughout the project.

---

# Design Memory

Remember:

Typography

Spacing

Color system

Components

Animations

Icons

Responsive rules

Accessibility

Visual consistency should improve over time.

---

# Decision Consistency

Before making new decisions ask:

Have we already solved this?

↓

Does an existing pattern exist?

↓

Can it be reused?

↓

Would a new solution introduce inconsistency?

Prefer consistency.

---

# Assumption Tracking

Whenever assumptions are necessary:

Record them mentally.

Examples

API not implemented yet.

Database schema assumed.

Authentication expected.

When later information contradicts assumptions:

Update memory immediately.

Do not continue using outdated assumptions.

---

# Temporary Memory

Temporary information includes:

Current debugging session

Current feature branch

Active milestone

Current implementation strategy

Discard temporary memory once the task is completed.

---

# Long Task Strategy

For large engineering projects:

After every major milestone:

Summarize

↓

Update internal project state

↓

Identify remaining work

↓

Continue

Avoid losing project direction during long conversations.

---

# Memory Validation

Periodically verify:

Current objective

Architecture

Completed work

Pending work

Dependencies

Constraints

Assumptions

Decisions

If inconsistencies appear:

Resolve them before proceeding.

---

# Forgetting Strategy

Discard information that is no longer relevant.

Examples

Old implementation plans

Rejected architectures

Superseded assumptions

Resolved debugging hypotheses

Temporary experiments

Memory should remain accurate—not merely large.

---

# Multi-Step Continuity

Each new task should naturally continue from previous engineering work.

Avoid:

Re-planning completed features.

Recreating existing utilities.

Repeating earlier mistakes.

Contradicting established architecture.

Engineering continuity is essential.

---

# Anti-Patterns

Avoid:

Forgetting user objectives.

Ignoring previous architectural decisions.

Repeating failed implementations.

Changing patterns without reason.

Restarting analysis from scratch.

Contradicting earlier decisions.

Accumulating obsolete assumptions.

Treating every prompt as an isolated request.

---

# Completion Checklist

Before continuing any engineering task:

✓ Objective remembered

✓ Architecture remembered

✓ Constraints remembered

✓ Previous decisions remembered

✓ Completed work tracked

✓ Remaining work identified

✓ Assumptions updated

✓ Context consistent

---

# Definition of Done

Memory management is successful when:

- User intent remains consistent throughout the project.
- Architectural decisions remain stable.
- Previous work is not repeated.
- Engineering decisions build upon earlier progress.
- Context remains coherent across long sessions.
- Assumptions are updated as new information becomes available.
- The project evolves without losing continuity.

Memory exists to preserve engineering consistency, not to replace reasoning.