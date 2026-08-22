# authorization.md

Version: 1.0.0

Target Models

- Grok 4.6
- Grok 4.5
- Grok 4 Family
- Grok Code Fast
- Future Grok Models

---

# Purpose

This document defines how Grok should design, implement, review, secure, and maintain authorization systems.

Authorization is not simply checking whether a user is logged in.

Authorization is the process of determining whether an authenticated identity is allowed to perform a specific action on a specific resource under defined business rules.

The objective is to build authorization systems that enforce least privilege, prevent unauthorized access, scale across organizations, and remain understandable as products evolve.

Authentication answers

"Who are you?"

Authorization answers

"What are you allowed to do?"

---

# Core Philosophy

Verify Identity

↓

Identify Resource

↓

Determine Action

↓

Evaluate Policy

↓

Grant or Deny

↓

Audit Decision

↓

Monitor Access

↓

Approve

Every action must be explicitly authorized.

Never trust authentication alone.

---

# Primary Objective

Every authorization system should answer one question.

"Can every action be approved or denied correctly according to business rules while preventing privilege escalation and unauthorized access?"

If the answer is uncertain,

the authorization design requires improvement.

---

# Authorization Principles

Every implementation should maximize

Least Privilege

↓

Security

↓

Correctness

↓

Consistency

↓

Scalability

↓

Auditability

↓

Developer Experience

Access should always be intentional.

Never accidental.

---

# Authorization Workflow

Authenticate Identity

↓

Identify Resource

↓

Identify Action

↓

Load Policies

↓

Evaluate Rules

↓

Grant or Deny

↓

Log Decision

↓

Approve

---

# Stage 1 — Resource Identification

Determine

Users

↓

Organizations

↓

Projects

↓

Files

↓

Invoices

↓

Payments

↓

Reports

↓

Settings

Authorization protects resources.

Not routes.

---

# Stage 2 — Action Identification

Identify supported operations.

Examples

Read

Create

Update

Delete

Approve

Publish

Archive

Export

Upload

Download

Share

Actions should reflect business operations.

---

# Stage 3 — Identity Types

Review

Users

Administrators

Organizations

Teams

Services

API Keys

Machine Accounts

Every identity should have well-defined permissions.

---

# Stage 4 — Authorization Models

Choose the appropriate model.

Role-Based Access Control (RBAC)

↓

Attribute-Based Access Control (ABAC)

↓

Policy-Based Access Control (PBAC)

↓

Relationship-Based Access Control (ReBAC)

↓

Hybrid Models

Use the simplest model that satisfies business requirements.

---

# Stage 5 — Roles

Define meaningful roles.

Examples

Guest

Member

Moderator

Manager

Administrator

Owner

Roles should represent responsibilities.

Not implementation details.

---

# Stage 6 — Permissions

Permissions should be granular.

Examples

user.read

user.create

user.update

user.delete

invoice.approve

project.archive

settings.manage

Permissions represent capabilities.

---

# Stage 7 — Resource Ownership

Determine ownership.

Examples

User owns profile

Organization owns project

Customer owns invoice

Team owns repository

Owners may receive additional permissions.

Ownership should always be verified.

---

# Stage 8 — Policy Evaluation

Evaluate

Identity

↓

Role

↓

Permission

↓

Ownership

↓

Resource State

↓

Business Rules

↓

Context

Authorization should evaluate complete context.

---

# Stage 9 — Context Awareness

Review

Current user

Time

Location

Device

Organization

Subscription

Environment

Risk score

Access decisions may depend on context.

---

# Stage 10 — Least Privilege

Grant only

Required permissions

↓

Temporary permissions

↓

Scoped permissions

↓

Minimal access

↓

Explicit approval

Access should be earned.

Not inherited unnecessarily.

---

# Stage 11 — Multi-Tenant Isolation

Verify

Tenant boundaries

↓

Organization isolation

↓

Data ownership

↓

Cross-tenant protection

↓

Shared resources

Tenant isolation is mandatory.

---

# Stage 12 — Hierarchical Access

Support

Organizations

↓

Departments

↓

Teams

↓

Projects

↓

Resources

Inheritance should remain predictable.

---

# Stage 13 — API Authorization

Review

Route protection

↓

Resource protection

↓

Scope validation

↓

Ownership checks

↓

Permission middleware

Protect business operations.

Not only endpoints.

---

# Stage 14 — Authorization Caching

Cache only when

Safe

↓

Versioned

↓

Invalidatable

↓

Short-lived

↓

Observable

Authorization caches must never weaken security.

---

# Stage 15 — Denied Access

Return

403 Forbidden

Provide

Consistent response

↓

No sensitive details

↓

Audit logging

↓

Recovery guidance

Authorization failures should not expose system internals.

---

# Stage 16 — Auditing

Log

Access granted

↓

Access denied

↓

Permission changes

↓

Role changes

↓

Administrative actions

↓

Policy updates

Authorization decisions should always be traceable.

---

# Stage 17 — Security Review

Review

Privilege escalation

↓

Horizontal access

↓

Vertical access

↓

Broken access control

↓

Direct object references

↓

Policy bypass

Broken authorization is one of the highest-risk vulnerabilities.

---

# Stage 18 — Testing

Verify

Role validation

↓

Ownership validation

↓

Permission checks

↓

Tenant isolation

↓

Privilege escalation

↓

Negative scenarios

↓

Policy conflicts

Authorization should be tested more than happy paths.

---

# Stage 19 — Documentation

Document

Roles

Permissions

Policies

Scopes

Ownership rules

Examples

Decision flow

Documentation prevents inconsistent implementations.

---

# Stage 20 — Continuous Improvement

Review

Permission usage

↓

Unused roles

↓

Security incidents

↓

Policy complexity

↓

Developer feedback

↓

Business evolution

Authorization evolves with products.

---

# Authorization Quality Attributes

Evaluate

Correctness

Security

Consistency

Scalability

Auditability

Maintainability

Reliability

Developer Experience

---

# Authorization Questions

Before approval ask

Can every action be evaluated independently?

↓

Are permissions granular enough?

↓

Can users access only their own resources?

↓

Can administrators exceed intended privileges?

↓

Can tenant isolation ever fail?

↓

Are authorization decisions auditable?

↓

Would an independent security audit approve this model?

---

# Severity Levels

Critical

Authorization bypass

Privilege escalation

Cross-tenant access

Broken access control

Sensitive data exposure

Major

Weak policy design

Incorrect ownership validation

Missing permission checks

Policy inconsistencies

Medium

Documentation improvements

Policy simplification

Caching improvements

Minor

Naming improvements

Examples

Operational enhancements

Future policy optimization

---

# Authorization Checklist

✓ Resources identified

✓ Actions defined

✓ Roles documented

✓ Permissions granular

✓ Ownership verified

✓ Policy engine implemented

✓ Least privilege enforced

✓ Multi-tenant isolation reviewed

✓ Authorization middleware implemented

✓ Audit logging enabled

✓ Security reviewed

✓ Testing completed

✓ Documentation complete

✓ Production ready

✓ Continuous monitoring enabled

---

# Anti-Patterns

Avoid

Role-only authorization

Hardcoded permissions

Global administrator bypasses

Business logic inside middleware

Authorization inside frontend only

Missing ownership checks

Shared administrator accounts

Wildcard permissions

Hidden authorization rules

Duplicated policy logic

Authorization based only on URLs

Trusting client-provided roles

Ignoring tenant isolation

Treating authentication as authorization

---

# Definition of Done

Authorization review is complete when

- Every protected resource has clearly defined access rules.
- Roles, permissions, ownership, and business policies are consistently enforced.
- Least privilege minimizes unnecessary access across users, services, and administrators.
- Authorization decisions consider identity, resource, action, ownership, and contextual business rules.
- Multi-tenant environments maintain complete isolation between organizations.
- Audit logs provide traceability for every authorization decision and administrative change.
- Security testing verifies resistance against privilege escalation, broken access control, and policy bypass attacks.
- Documentation clearly explains permissions, policies, roles, scopes, and ownership rules.
- The authorization system scales as products, teams, and organizations evolve.
- Every action performed within the system is explicitly authorized before execution.

Exceptional authorization systems are almost invisible.

Legitimate users perform only the actions they are intended to perform, administrators operate within well-defined boundaries, attackers cannot escalate privileges, and every access decision is consistent, explainable, and auditable.