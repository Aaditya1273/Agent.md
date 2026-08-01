# middlewares.md

Version: 1.0.0

Target Models

- Claude 5 Family
- Claude 4.8
- Claude 4.7
- Claude 4.x Family
- Future Claude Models

---

# Purpose

This document defines how Claude should design, implement, review, optimize, and maintain middleware architecture in backend applications.

Middleware is not simply code that executes before a request reaches a controller.

Middleware is a request-processing pipeline responsible for handling cross-cutting concerns such as authentication, authorization, validation, logging, security, rate limiting, tracing, and request transformation.

The objective is to build middleware systems that remain modular, composable, reusable, observable, secure, and independent from business logic.

Middleware should process requests.

It should never become business logic.

---

# Core Philosophy

Receive Request

↓

Execute Pipeline

↓

Validate Request

↓

Protect Resources

↓

Enrich Context

↓

Continue Processing

↓

Generate Response

↓

Approve

Every middleware should solve one concern.

Nothing more.

---

# Primary Objective

Every middleware implementation should answer one question.

"Can every request pass through a predictable, secure, reusable, and maintainable processing pipeline before reaching business logic?"

If the answer is uncertain,

the middleware architecture requires improvement.

---

# Middleware Principles

Every implementation should maximize

Separation of Concerns

↓

Reusability

↓

Predictability

↓

Security

↓

Maintainability

↓

Performance

↓

Observability

↓

Developer Experience

Middleware should reduce duplication.

Never increase coupling.

---

# Middleware Workflow

Receive Request

↓

Identify Middleware Chain

↓

Execute Sequentially

↓

Modify Context

↓

Validate Request

↓

Continue Pipeline

↓

Handle Response

↓

Approve

---

# Stage 1 — Responsibility Identification

Middleware should solve cross-cutting concerns.

Examples

Authentication

Authorization

Validation

Logging

Tracing

Rate Limiting

Compression

Caching

CORS

Security Headers

Request IDs

Localization

Never place business logic inside middleware.

---

# Stage 2 — Middleware Ordering

Order matters.

Recommended sequence

Request ID

↓

Logging

↓

Security Headers

↓

CORS

↓

Rate Limiting

↓

Authentication

↓

Authorization

↓

Validation

↓

Business Logic

↓

Response Processing

↓

Error Handler

Incorrect ordering creates security risks.

---

# Stage 3 — Single Responsibility

Each middleware should perform exactly one task.

Good

Authentication Middleware

Validation Middleware

Logging Middleware

Compression Middleware

Bad

Authentication + Validation + Database Queries

Small middleware is easier to test and reuse.

---

# Stage 4 — Stateless Design

Middleware should remain stateless.

Avoid

Global variables

Mutable shared state

Request-specific caches

Hidden side effects

Every request should be processed independently.

---

# Stage 5 — Context Management

Middleware may enrich request context.

Examples

Authenticated User

Permissions

Request ID

Correlation ID

Locale

Tenant

Feature Flags

Only attach validated information.

---

# Stage 6 — Authentication Middleware

Responsibilities

Verify identity

↓

Validate tokens

↓

Load user

↓

Attach identity

↓

Reject unauthorized requests

Authentication verifies identity.

Nothing more.

---

# Stage 7 — Authorization Middleware

Responsibilities

Load permissions

↓

Evaluate policies

↓

Verify ownership

↓

Allow or deny

Authorization determines access.

Not identity.

---

# Stage 8 — Validation Middleware

Validate

Headers

↓

Query Parameters

↓

Path Parameters

↓

Request Body

↓

Files

↓

Content Type

Reject invalid requests immediately.

---

# Stage 9 — Logging Middleware

Capture

Request ID

↓

Method

↓

URL

↓

Status

↓

Latency

↓

IP

↓

User Agent

↓

User ID (when authenticated)

Never log

Passwords

Tokens

Secrets

Sensitive personal data

---

# Stage 10 — Error Middleware

Centralize

Application errors

↓

Validation errors

↓

Authentication errors

↓

Authorization errors

↓

Unexpected exceptions

Never duplicate error handling.

---

# Stage 11 — Response Middleware

Modify responses only when necessary.

Examples

Compression

Caching

Headers

Cookies

Metadata

Version headers

Response middleware should remain predictable.

---

# Stage 12 — Performance

Review

Execution time

↓

Memory allocation

↓

Database queries

↓

External API calls

↓

Blocking operations

Middleware should execute quickly.

---

# Stage 13 — Security

Review

Input validation

↓

Security headers

↓

HTTPS

↓

CORS

↓

CSRF

↓

Rate limiting

↓

Request sanitization

Security middleware should execute before business logic.

---

# Stage 14 — Observability

Implement

Structured logs

↓

Tracing

↓

Metrics

↓

Correlation IDs

↓

Request timing

↓

Error tracking

Every request should be traceable.

---

# Stage 15 — Dependency Management

Middleware should depend on

Interfaces

↓

Configuration

↓

Services

Avoid

Database queries when unnecessary

Business services

Application workflows

Dependencies should remain minimal.

---

# Stage 16 — Reusability

Middleware should

Remain framework-independent when possible

↓

Be configurable

↓

Be composable

↓

Support multiple routes

↓

Support multiple applications

Reusable middleware reduces maintenance.

---

# Stage 17 — Testing

Verify

Execution order

↓

Authentication

↓

Authorization

↓

Validation

↓

Error handling

↓

Performance

↓

Failure scenarios

↓

Concurrency

Every middleware should be independently testable.

---

# Stage 18 — Documentation

Document

Purpose

↓

Execution order

↓

Configuration

↓

Dependencies

↓

Examples

↓

Failure behavior

↓

Response modifications

Developers should understand middleware without reading implementation.

---

# Stage 19 — Scalability

Review

Large traffic

↓

Horizontal scaling

↓

Stateless execution

↓

Distributed tracing

↓

Caching

↓

Cloud deployment

Middleware should scale with infrastructure.

---

# Stage 20 — Continuous Improvement

Review

Performance

↓

Security

↓

Developer feedback

↓

Monitoring

↓

Technical debt

↓

New framework capabilities

Middleware architecture should evolve continuously.

---

# Middleware Quality Attributes

Evaluate

Correctness

Security

Performance

Maintainability

Reusability

Scalability

Observability

Developer Experience

---

# Middleware Questions

Before approval ask

Does each middleware solve exactly one concern?

↓

Is middleware execution order correct?

↓

Can middleware be reused elsewhere?

↓

Can business logic accidentally enter middleware?

↓

Can requests be fully traced?

↓

Will middleware remain maintainable as the application grows?

↓

Would another engineering team immediately understand the middleware pipeline?

---

# Severity Levels

Critical

Authentication bypass

Authorization bypass

Middleware order vulnerability

Unhandled errors

Sensitive information leakage

Major

Business logic inside middleware

Performance bottlenecks

Duplicate middleware

Weak observability

Medium

Documentation improvements

Configuration improvements

Optimization opportunities

Minor

Formatting

Examples

Naming improvements

Future enhancements

---

# Middleware Checklist

✓ Middleware responsibilities defined

✓ Single responsibility maintained

✓ Correct execution order

✓ Stateless implementation

✓ Authentication middleware reviewed

✓ Authorization middleware reviewed

✓ Validation middleware implemented

✓ Logging middleware configured

✓ Error middleware centralized

✓ Response middleware reviewed

✓ Security validated

✓ Observability implemented

✓ Testing completed

✓ Documentation complete

✓ Production ready

---

# Anti-Patterns

Avoid

Business logic inside middleware

Database-heavy middleware

Large monolithic middleware

Incorrect middleware order

Global mutable state

Blocking operations

Duplicated middleware

Hidden side effects

Logging secrets

Ignoring async errors

Route-specific middleware duplication

Framework-dependent reusable middleware

---

# Definition of Done

Middleware review is complete when

- Every middleware has a single, clearly defined responsibility.
- Cross-cutting concerns are isolated from business logic.
- Middleware execution order is deterministic, secure, and well documented.
- Authentication, authorization, validation, logging, and error handling operate independently while composing into a predictable request pipeline.
- Middleware remains stateless, reusable, configurable, and independently testable.
- Security protections execute before application logic and prevent invalid or unauthorized requests from progressing.
- Performance overhead remains minimal and observable through metrics and tracing.
- Documentation accurately describes middleware responsibilities, execution order, configuration, and failure behavior.
- The middleware architecture scales with increasing traffic, services, and engineering teams.
- Every incoming request passes through a clean, maintainable, and production-ready processing pipeline before reaching business logic.

Exceptional middleware architecture is almost invisible.

Requests flow through a secure, observable, and predictable pipeline where each middleware performs one responsibility exceptionally well, allowing business logic to remain clean, focused, and independent.