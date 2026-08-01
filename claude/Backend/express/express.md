# express.md

Version: 1.0.0

Target Models

- Claude 5 Family
- Claude 4.8
- Claude 4.7
- Claude 4.x Family
- Future Claude Models

---

# Purpose

This document defines how Claude should design, implement, review, optimize, and maintain Express.js applications.

Express is not simply a routing library.

It is the HTTP application layer responsible for translating client requests into business operations while keeping transport concerns separate from business logic.

The objective is to build Express applications that are modular, secure, scalable, observable, maintainable, and production-ready.

Express should orchestrate requests.

It should never become the application itself.

---

# Core Philosophy

Understand Request

↓

Validate Input

↓

Authenticate User

↓

Authorize Action

↓

Execute Business Logic

↓

Generate Response

↓

Observe Behavior

↓

Approve

Express should coordinate.

Business logic belongs elsewhere.

---

# Primary Objective

Every Express application should answer one question.

"Can this application continue serving reliable HTTP APIs as traffic, features, developers, and infrastructure grow?"

If the answer is uncertain,

the architecture requires improvement.

---

# Engineering Principles

Every implementation should maximize

Simplicity

↓

Separation of Concerns

↓

Scalability

↓

Reliability

↓

Security

↓

Observability

↓

Developer Experience

Transport logic should remain independent from business logic.

---

# Development Workflow

Understand API

↓

Design Routes

↓

Implement Middleware

↓

Validate Requests

↓

Call Services

↓

Handle Errors

↓

Observe

↓

Approve

---

# Stage 1 — API Understanding

Before writing code determine

Business requirements

↓

Resources

↓

Operations

↓

Authentication

↓

Authorization

↓

Validation

↓

Expected responses

Routes should represent business capabilities.

Not implementation details.

---

# Stage 2 — Application Structure

Prefer modular architecture.

Example

src/

app/

config/

routes/

controllers/

services/

repositories/

middlewares/

validators/

models/

events/

jobs/

workers/

utils/

tests/

Structure should scale with engineering teams.

---

# Stage 3 — Routing

Routes should

Represent resources

Remain RESTful

Be predictable

Stay thin

Avoid business logic

Example

GET /users

POST /users

GET /users/:id

PATCH /users/:id

DELETE /users/:id

Routes define the API contract.

---

# Stage 4 — Controllers

Controllers should

Receive request

↓

Validate request

↓

Call services

↓

Return response

Controllers should never

Contain business rules

Contain database queries

Perform complex calculations

Controllers coordinate.

Services execute.

---

# Stage 5 — Services

Services should contain

Business rules

Application logic

Decision making

Workflow orchestration

Services should remain independent from Express.

---

# Stage 6 — Middleware

Middleware should solve one concern.

Examples

Authentication

Authorization

Validation

Logging

Rate Limiting

Compression

CORS

Security Headers

Request IDs

Each middleware should have a single responsibility.

---

# Stage 7 — Request Validation

Validate

Headers

Query parameters

Route parameters

Request body

Content type

File uploads

Reject invalid requests immediately.

---

# Stage 8 — Response Design

Responses should be

Consistent

Predictable

Minimal

Documented

Versionable

Include

Status

Data

Metadata

Errors

Avoid inconsistent response structures.

---

# Stage 9 — Error Handling

Centralize error handling.

Handle

Validation errors

Authentication errors

Authorization failures

Database errors

Unexpected exceptions

Never duplicate error handling.

---

# Stage 10 — Dependency Injection

Prefer explicit dependency injection.

Avoid

Global state

Singleton abuse

Hidden dependencies

Dependencies should be easy to replace during testing.

---

# Stage 11 — Configuration

Externalize

Environment variables

Secrets

Database URLs

Feature flags

Ports

Timeouts

Configuration belongs outside application code.

---

# Stage 12 — Performance

Review

Compression

Streaming

Caching

Connection reuse

Response size

Database latency

Event loop health

Express should remain lightweight.

---

# Stage 13 — Security

Review

Helmet

HTTPS

CORS

CSRF protection

Rate limiting

Input validation

Output sanitization

Security headers

Express applications should be secure by default.

---

# Stage 14 — Observability

Implement

Structured logging

Metrics

Tracing

Health checks

Correlation IDs

Request timing

Visibility accelerates debugging.

---

# Stage 15 — Testing

Implement

Unit tests

Route tests

Integration tests

Contract tests

Load tests

Security tests

Routes should be fully testable.

---

# Stage 16 — Scalability

Review

Stateless architecture

Horizontal scaling

Caching

Queues

Workers

Connection pooling

Express should scale without redesign.

---

# Stage 17 — Reliability

Implement

Graceful shutdown

Timeouts

Retries

Circuit breakers

Health endpoints

Fallbacks

Production systems expect failures.

---

# Stage 18 — Documentation

Document

Routes

Authentication

Authorization

Validation

Responses

Errors

Examples

Documentation is part of the API.

---

# Stage 19 — Production Readiness

Verify

Environment configuration

Monitoring

Logging

Security

Deployment

Rollback

Health checks

Alerting

Production readiness is mandatory.

---

# Stage 20 — Continuous Improvement

Review

Performance

Security

Dependencies

Developer feedback

Architecture

Technical debt

Production incidents

Every deployment should improve maintainability.

---

# Express Quality Attributes

Evaluate

Correctness

Maintainability

Reliability

Performance

Scalability

Security

Observability

Developer Experience

---

# Engineering Questions

Before approval ask

Are routes resource-oriented?

↓

Are controllers thin?

↓

Does business logic exist only inside services?

↓

Can middleware be reused?

↓

Can the application scale horizontally?

↓

Can failures be diagnosed quickly?

↓

Would another engineer understand this architecture immediately?

---

# Severity Levels

Critical

Business logic in routes

Authentication bypass

Unhandled exceptions

Security vulnerability

Data corruption

Major

Poor architecture

Duplicate logic

Weak validation

Missing monitoring

Performance bottlenecks

Medium

Naming inconsistencies

Documentation gaps

Optimization opportunities

Minor

Formatting

Examples

Comments

Refactoring suggestions

Future improvements

---

# Express Checklist

✓ Modular architecture

✓ RESTful routes

✓ Thin controllers

✓ Business logic isolated

✓ Middleware reusable

✓ Validation implemented

✓ Error handling centralized

✓ Configuration externalized

✓ Security reviewed

✓ Logging enabled

✓ Monitoring enabled

✓ Health checks implemented

✓ Testing completed

✓ Documentation complete

✓ Production ready

---

# Anti-Patterns

Avoid

Business logic inside routes

Database queries inside controllers

Nested middleware chains

Large controller files

Global mutable state

Duplicated validation

Duplicated responses

Hardcoded configuration

Missing centralized error handling

Ignoring async errors

Overloaded middleware

Framework-dependent business logic

---

# Definition of Done

Express engineering review is complete when

- Routes expose a clean, predictable, and RESTful API.
- Controllers coordinate requests without containing business logic.
- Services encapsulate business rules independently of Express.
- Middleware remains modular, reusable, and focused on a single responsibility.
- Request validation and centralized error handling protect application integrity.
- Security, observability, testing, and documentation are implemented consistently.
- Configuration remains externalized and suitable for multiple environments.
- The application scales horizontally without architectural changes.
- Production readiness is verified through monitoring, health checks, deployment, and rollback strategies.
- The codebase is understandable, maintainable, and capable of supporting long-term product evolution.

Exceptional Express applications are not defined by the framework.

They are defined by clean architecture, predictable behavior, operational reliability, and the ability to evolve without accumulating unnecessary complexity.