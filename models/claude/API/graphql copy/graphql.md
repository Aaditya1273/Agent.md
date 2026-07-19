# graphql.md

Version: 1.0.0

Target Models

- Claude 5 Family
- Claude 4.8
- Claude 4.7
- Claude 4.x Family
- Future Claude Models

---

# Purpose

This document defines how Claude should design, review, consume, document, and optimize GraphQL APIs.

GraphQL is not simply an alternative to REST.

GraphQL is a strongly typed query language and runtime that enables clients to request exactly the data they need through a unified schema.

The objective is to design GraphQL APIs that maximize flexibility, maintainability, scalability, type safety, performance, and developer experience.

Every schema should represent the business domain—not backend implementation details.

---

# Core Philosophy

Understand Domain

↓

Design Schema

↓

Model Relationships

↓

Implement Resolvers

↓

Optimize Queries

↓

Secure Operations

↓

Validate Contracts

↓

Approve

The schema is the product.

Resolvers are implementation details.

---

# Primary Objective

Every GraphQL API should answer one question.

"Can a client retrieve exactly what it needs with one predictable, type-safe query?"

If the answer is uncertain,

the schema requires redesign.

---

# GraphQL Principles

Every API should maximize

Type Safety

↓

Flexibility

↓

Consistency

↓

Performance

↓

Discoverability

↓

Scalability

↓

Developer Experience

↓

Maintainability

GraphQL should reduce over-fetching and under-fetching.

Never increase complexity unnecessarily.

---

# GraphQL Workflow

Understand Domain

↓

Identify Entities

↓

Design Schema

↓

Define Queries

↓

Define Mutations

↓

Define Relationships

↓

Implement Resolvers

↓

Optimize

↓

Approve

---

# Stage 1 — Domain Understanding

Before designing determine

What problem exists?

↓

What entities exist?

↓

How do entities relate?

↓

What operations exist?

↓

What information do clients require?

The schema should model business concepts.

Never database tables.

---

# Stage 2 — Schema Design

Schemas should be

Simple

Readable

Consistent

Strongly Typed

Business Focused

Extensible

The schema becomes the public contract.

Treat it carefully.

---

# Stage 3 — Type Design

Prefer

Meaningful object types

Reusable enums

Dedicated input objects

Interfaces

Unions

Scalars

Avoid

Generic JSON blobs

Unstructured objects

Duplicated types

Weak typing

Types should communicate intent.

---

# Stage 4 — Query Design

Queries retrieve information.

Examples

Query

user

users

project

projects

article

search

Query names should describe resources.

Not actions.

---

# Stage 5 — Mutation Design

Mutations modify state.

Examples

createUser

updateProfile

deleteProject

publishArticle

approveOrder

Mutations should describe business operations.

---

# Stage 6 — Subscription Design

Use subscriptions only when necessary.

Examples

Live Chat

Notifications

Stock Prices

Live Dashboard

Game Events

Avoid subscriptions for static data.

---

# Stage 7 — Input Objects

Every complex mutation should use

Input Objects

Good

CreateUserInput

UpdateProjectInput

PublishPostInput

Avoid

20 individual parameters

Input objects improve versioning.

---

# Stage 8 — Relationships

Model relationships naturally.

Example

User

↓

Projects

↓

Tasks

↓

Comments

Relationships should represent the business.

Not database joins.

---

# Stage 9 — Resolver Design

Resolvers should

Remain small

Contain minimal business logic

Delegate to services

Avoid duplicated logic

Avoid N+1 queries

Resolvers coordinate.

Services implement logic.

---

# Stage 10 — Performance

Review

Resolver execution

Nested queries

N+1 problems

Batch loading

Caching

Lazy loading

Query complexity

Performance begins with resolver design.

---

# Stage 11 — DataLoader

Use batching whenever appropriate.

Review

Database batching

Caching

Request-scoped cache

Relationship loading

Duplicate requests

DataLoader should eliminate unnecessary database access.

---

# Stage 12 — Query Complexity

Limit

Depth

Cost

Execution time

Node count

Field count

GraphQL should never allow unlimited complexity.

---

# Stage 13 — Pagination

Large collections should support

Cursor Pagination

Edges

Nodes

PageInfo

hasNextPage

endCursor

Cursor pagination is preferred.

---

# Stage 14 — Error Handling

Errors should contain

Readable message

Machine-readable code

Path

Extensions

Correlation ID

Never expose internal implementation.

---

# Stage 15 — Authentication

Support

Bearer Tokens

OAuth

JWT

Sessions

API Keys

Authentication identifies clients.

---

# Stage 16 — Authorization

Review

Field permissions

Object permissions

Role validation

Ownership validation

Business permissions

Authorization belongs at every resolver.

---

# Stage 17 — Security

Inspect

Query depth

Rate limiting

Complexity analysis

Input validation

Injection prevention

Secret handling

Disable introspection where appropriate

Security should protect every operation.

---

# Stage 18 — Versioning

GraphQL should evolve.

Prefer

Deprecation

New fields

Backward compatibility

Schema evolution

Avoid

Breaking changes

Multiple schema versions

Evolution should be gradual.

---

# Stage 19 — Documentation

Document

Types

Fields

Arguments

Examples

Authentication

Errors

Deprecation

Descriptions

Self-documenting schemas improve developer experience.

---

# Stage 20 — Schema Consistency

Review

Naming

Descriptions

Input patterns

Mutation style

Error style

Pagination

Field organization

Consistency makes APIs predictable.

---

# GraphQL Quality Attributes

Evaluate

Correctness

Type Safety

Consistency

Performance

Scalability

Maintainability

Security

Discoverability

Developer Experience

---

# GraphQL Questions

Before approval ask

Does every type represent the business?

↓

Are queries intuitive?

↓

Are mutations predictable?

↓

Can clients retrieve only required data?

↓

Are resolvers efficient?

↓

Can the schema evolve safely?

↓

Would another engineer immediately understand it?

---

# Severity Levels

Critical

Broken schema

Authentication failure

Authorization bypass

Unbounded query complexity

Major

N+1 queries

Weak typing

Poor schema design

Missing validation

Medium

Naming inconsistencies

Documentation gaps

Minor performance issues

Minor

Descriptions

Formatting

Examples

Suggestion

Future improvements

Schema simplification

Performance opportunities

---

# GraphQL Checklist

✓ Strong schema

✓ Meaningful types

✓ Clear queries

✓ Predictable mutations

✓ Efficient resolvers

✓ DataLoader implemented

✓ Cursor pagination

✓ Authentication reviewed

✓ Authorization verified

✓ Query complexity limited

✓ Documentation complete

✓ Security reviewed

✓ Performance optimized

✓ Consistent naming

✓ Developer-friendly schema

---

# Anti-Patterns

Avoid

Generic JSON fields

Massive root queries

Massive mutations

Business logic inside resolvers

Unlimited nesting

Unlimited query depth

Ignoring N+1 queries

Weak typing

Duplicate schemas

Breaking schema evolution

Over-fetching through poor resolver design

Treating GraphQL as REST over POST

---

# Definition of Done

GraphQL API review is complete when

- The schema accurately models the business domain.
- Types are expressive, reusable, and strongly typed.
- Queries and mutations are intuitive and predictable.
- Relationships are represented naturally.
- Resolvers remain lightweight and efficient.
- Query complexity and security controls are enforced.
- Pagination follows cursor-based best practices.
- Documentation enables rapid integration.
- The schema evolves without unnecessary breaking changes.
- The implementation provides a scalable, maintainable, and developer-friendly GraphQL experience.

Exceptional GraphQL APIs are not measured by the number of fields they expose.

They are measured by how effortlessly clients can obtain exactly the data they need through a clear, stable, and thoughtfully designed schema.