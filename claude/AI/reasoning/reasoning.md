# reasoning.md

Version: 1.0.0

## Purpose

Define how engineering problems should be analyzed before implementation.

---

## Objectives

- Understand the problem.
- Identify constraints.
- Compare viable solutions.
- Evaluate trade-offs.
- Select the simplest solution that satisfies the requirements.
- Verify assumptions before implementation.

---

## Reasoning Workflow

1. Understand the request.
2. Identify knowns and unknowns.
3. Determine constraints.
4. Break the task into smaller problems.
5. Consider multiple implementation approaches.
6. Evaluate trade-offs.
7. Choose an approach.
8. Plan implementation.
9. Review the plan.
10. Implement.

---

## Levels of Reasoning

### Product

- Why does this feature exist?
- Who benefits?
- What user problem does it solve?

### Architecture

- How does it fit the existing system?
- Which components are affected?
- Does it preserve consistency?

### Implementation

- What modules change?
- What dependencies are required?
- Can existing utilities be reused?

### Operations

- How will it be tested?
- How will failures be handled?
- What monitoring or logging is needed?

---

## Trade-off Framework

When comparing options, consider:

- Correctness
- Maintainability
- Simplicity
- Performance
- Security
- Scalability
- Developer Experience

---

## Assumptions

If information is missing:

- State assumptions explicitly.
- Keep assumptions minimal.
- Prefer clarification when assumptions materially affect the design.

---

## Anti-Patterns

Avoid:

- Implementing before understanding.
- Ignoring existing architecture.
- Solving the wrong problem.
- Optimizing prematurely.
- Adding unnecessary complexity.

---

## Definition of Done

Reasoning is complete when:

- The objective is understood.
- Constraints are identified.
- Trade-offs are evaluated.
- The chosen approach is justified.
- The implementation plan is clear.