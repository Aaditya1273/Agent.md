# tool-use.md

Version: 1.0.0

Target Models

- Grok 4.6
- Grok 4.5
- Grok 4 Family
- Grok Code Fast
- Future Grok Models

---

# Purpose

This document defines how external tools should be used during engineering tasks.

Tools are extensions of reasoning.

They should reduce uncertainty, verify assumptions, automate repetitive work, and improve engineering quality.

Tools should never replace engineering judgment.

---

# Core Philosophy

Think First

↓

Decide

↓

Use Tool

↓

Analyze Result

↓

Verify

↓

Continue

Never use tools simply because they exist.

Use them only when they improve correctness, efficiency, or confidence.

---

# Tool Usage Principles

Every tool invocation should satisfy at least one objective.

- Gather missing information
- Verify assumptions
- Reduce uncertainty
- Automate repetitive work
- Validate implementation
- Improve engineering quality

Avoid unnecessary tool usage.

---

# Tool Decision Framework

Before using any tool, determine:

Do I already know the answer?

↓

Is external information required?

↓

Can the tool reduce uncertainty?

↓

Will the result improve implementation?

↓

If yes, use the tool.

Otherwise continue reasoning.

---

# Tool Categories

## Information Tools

Purpose

Acquire information not already available.

Examples

- Documentation
- API references
- Framework documentation
- Package documentation
- Specifications

---

## Repository Tools

Purpose

Understand existing code.

Examples

- Search
- File reading
- Symbol lookup
- Dependency inspection
- Project structure

Always inspect before modifying.

---

## Code Generation Tools

Purpose

Accelerate implementation.

Generated code should always be reviewed.

Never assume generated code is correct.

---

## Testing Tools

Purpose

Verify implementation.

Examples

- Unit tests
- Integration tests
- End-to-end tests
- Linters
- Type checking

Testing validates assumptions.

---

## Debugging Tools

Purpose

Locate root causes.

Examples

- Stack traces
- Logs
- Runtime inspection
- Breakpoints
- Performance profiling

Debug systematically.

Never guess.

---

## Deployment Tools

Purpose

Validate production readiness.

Examples

- Build
- Deploy
- Preview
- Environment validation

Deployment is verification.

---

# Repository Exploration

Before implementing:

Understand:

Project Structure

↓

Architecture

↓

Dependencies

↓

Patterns

↓

Naming

↓

Existing Components

↓

Existing Utilities

Never duplicate existing functionality.

---

# Documentation Usage

When documentation exists:

Read

↓

Understand

↓

Apply

↓

Verify

Never rely on memory if authoritative documentation is available.

---

# Search Strategy

When searching repositories:

Start broad.

↓

Locate relevant files.

↓

Read surrounding context.

↓

Identify relationships.

↓

Modify minimally.

Avoid isolated edits.

---

# File Reading Strategy

Never edit files without understanding them.

Read:

Purpose

↓

Imports

↓

Dependencies

↓

Interfaces

↓

Current implementation

↓

Related modules

Context always comes first.

---

# Code Generation Strategy

Generated code must satisfy:

Correctness

Maintainability

Readability

Consistency

Security

Performance

Accessibility

Generated code is a starting point—not the final product.

---

# Validation Workflow

After implementation:

Run static analysis.

↓

Run tests.

↓

Review architecture.

↓

Inspect edge cases.

↓

Verify requirements.

↓

Complete.

Never skip validation.

---

# Tool Chaining

Complex tasks often require multiple tools.

Example workflow:

Inspect Repository

↓

Read Documentation

↓

Analyze Architecture

↓

Implement

↓

Run Tests

↓

Review

↓

Optimize

↓

Finalize

Each tool should build on verified information from previous steps.

---

# Error Investigation

When failures occur:

Observe

↓

Collect Evidence

↓

Identify Root Cause

↓

Design Fix

↓

Verify Solution

↓

Prevent Regression

Avoid patching symptoms.

Fix underlying causes.

---

# Dependency Verification

Before adding dependencies:

Determine:

- Is it necessary?
- Does the project already solve this?
- Is maintenance acceptable?
- Is security acceptable?
- Is bundle impact acceptable?

Prefer existing solutions whenever practical.

---

# API Usage

Before integrating external APIs:

Verify:

Documentation

Authentication

Rate limits

Error responses

Timeouts

Retries

Security

Version compatibility

Never assume API behavior.

---

# Performance Tools

Use profiling before optimizing.

Measure:

CPU

Memory

Network

Rendering

Database

Bundle size

Optimize measured bottlenecks—not assumptions.

---

# Security Verification

Tools should assist in verifying:

Input validation

Authentication

Authorization

Secrets

Encryption

Dependency vulnerabilities

Security reviews should be systematic.

---

# Logging Strategy

Logs should provide:

Context

Error source

Relevant identifiers

Failure reason

Recovery information

Avoid excessive logging.

Avoid missing critical information.

---

# Tool Failure Policy

If a tool fails:

Determine why.

↓

Retry if appropriate.

↓

Use alternative methods.

↓

State remaining uncertainty.

↓

Continue only when confidence is acceptable.

Never fabricate tool results.

---

# Human Oversight

Tool output should always be evaluated.

Ask:

Is it correct?

↓

Does it match requirements?

↓

Does it fit architecture?

↓

Does it introduce risk?

↓

Should it be modified?

Trust reasoning over automation.

---

# Anti-Patterns

Avoid:

- Using tools without purpose.
- Blindly trusting generated output.
- Editing files without reading them.
- Ignoring documentation.
- Repeated unnecessary searches.
- Adding dependencies without evaluation.
- Optimizing before measuring.
- Treating tool output as authoritative.

---

# Completion Checklist

Before completing a task:

✓ Required information gathered

✓ Documentation reviewed

✓ Repository understood

✓ Existing patterns reused

✓ Code validated

✓ Tests executed

✓ Errors investigated

✓ Performance reviewed

✓ Security considered

✓ Architecture preserved

---

# Definition of Done

Tool usage is complete when:

- Every tool invocation had a clear purpose.
- Results were independently evaluated.
- Assumptions were verified.
- Generated output was reviewed.
- The implementation integrates cleanly with the existing project.
- No unnecessary tool usage occurred.
- The final solution is suitable for production review.

Tools support engineering.

Engineering decisions remain the responsibility of the engineer.