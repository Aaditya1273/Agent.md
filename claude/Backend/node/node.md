# node.md

Version: 1.0.0

Target Models

- Claude 5 Family
- Claude 4.8
- Claude 4.7
- Claude 4.x Family
- Future Claude Models

---

# Purpose

This document defines how Claude should design, implement, review, optimize, and maintain Node.js backend applications.

Node.js is not simply a JavaScript runtime.

It is an event-driven, asynchronous execution environment designed to build scalable network services, APIs, real-time systems, workers, automation platforms, and distributed applications.

The objective is to produce backend systems that are reliable, scalable, maintainable, observable, secure, and efficient under production workloads.

Every architectural decision should reduce complexity while improving long-term maintainability.

---

# Core Philosophy

Understand Requirements

↓

Understand Runtime

↓

Design Architecture

↓

Write Simple Code

↓

Optimize Performance

↓

Observe Behavior

↓

Improve Continuously

↓

Approve

Node.js should simplify concurrency.

Never complicate architecture.

---

# Primary Objective

Every backend implementation should answer one question.

"Can this system continue operating reliably as traffic, features, developers, and infrastructure grow?"

If the answer is uncertain,

the architecture requires improvement.

---

# Engineering Principles

Every implementation should maximize

Correctness

↓

Simplicity

↓

Scalability

↓

Reliability

↓

Maintainability

↓

Performance

↓

Security

↓

Developer Experience

Readable systems outperform clever systems.

---

# Development Workflow

Understand Requirements

↓

Design Modules

↓

Implement Features

↓

Validate Inputs

↓

Handle Errors

↓

Observe Behavior

↓

Optimize

↓

Approve

---

# Stage 1 — Problem Understanding

Before writing code determine

Business objective

↓

Expected traffic

↓

Expected latency

↓

Data sources

↓

External services

↓

Failure scenarios

↓

Scaling requirements

Never optimize before understanding the problem.

---

# Stage 2 — Architecture

Organize the application into clear boundaries.

Presentation

↓

Application

↓

Domain

↓

Infrastructure

↓

External Services

Every module should have a single responsibility.

---

# Stage 3 — Project Structure

Prefer modular organization.

Example

src/

config/

controllers/

services/

repositories/

middleware/

routes/

models/

utils/

jobs/

workers/

events/

tests/

Structure should scale with the team.

---

# Stage 4 — Event Loop Awareness

Understand

Call Stack

↓

Microtasks

↓

Macrotasks

↓

Event Loop

↓

Worker Threads

↓

Async Operations

Never block the event loop.

Blocking code reduces scalability.

---

# Stage 5 — Asynchronous Design

Prefer

Promises

Async/Await

Streaming

Events

Queues

Background Jobs

Avoid

Deep callback chains

Synchronous blocking operations

Async code should remain readable.

---

# Stage 6 — Module Design

Each module should

Solve one problem

Expose a clear interface

Hide implementation

Avoid circular dependencies

Remain independently testable

Modules should communicate through contracts.

---

# Stage 7 — Configuration

Configuration belongs outside code.

Examples

Environment variables

Secrets manager

Configuration files

Feature flags

Never hardcode

Passwords

Tokens

URLs

API Keys

---

# Stage 8 — Dependency Management

Review

Dependency necessity

Maintenance

Security

License

Community support

Update frequency

Every dependency increases maintenance cost.

---

# Stage 9 — Error Handling

Errors should be

Expected

↓

Handled

↓

Logged

↓

Recovered

↓

Reported

Unexpected failures should never crash the application silently.

---

# Stage 10 — Resource Management

Review

Memory

CPU

Network

Database connections

File handles

Timers

Clean resources immediately after use.

---

# Stage 11 — Performance

Evaluate

Event loop delay

Memory usage

CPU utilization

Garbage collection

Database latency

Network latency

Performance should be measured.

Never assumed.

---

# Stage 12 — Concurrency

Use

Worker Threads

Background Jobs

Queues

Clusters

Horizontal Scaling

Choose concurrency based on workload.

---

# Stage 13 — Security

Review

Input validation

Secrets

Dependencies

Authentication

Authorization

Rate limiting

Headers

Security begins before deployment.

---

# Stage 14 — Observability

Every application should expose

Structured logs

Metrics

Health checks

Tracing

Request IDs

Performance metrics

Visibility reduces debugging time.

---

# Stage 15 — Testing

Implement

Unit Tests

Integration Tests

Contract Tests

Load Tests

Failure Tests

Regression Tests

Testing validates behavior.

Not implementation.

---

# Stage 16 — Scalability

Review

Stateless services

Horizontal scaling

Caching

Queues

Connection pooling

Database optimization

Scalable systems avoid single points of failure.

---

# Stage 17 — Reliability

Implement

Graceful shutdown

Retries

Timeouts

Circuit breakers

Health checks

Fallbacks

Reliable systems expect failures.

---

# Stage 18 — Maintainability

Evaluate

Naming

Consistency

Documentation

Complexity

Coupling

Code duplication

Future developers should understand the code quickly.

---

# Stage 19 — Production Readiness

Verify

Environment configuration

Monitoring

Logging

Backups

Security

Deployment

Rollback

Alerting

A feature is incomplete until it is production ready.

---

# Stage 20 — Continuous Improvement

Review regularly

Performance

Dependencies

Security

Architecture

Developer feedback

Technical debt

Production incidents

Good systems evolve continuously.

---

# Node.js Quality Attributes

Evaluate

Correctness

Reliability

Performance

Scalability

Maintainability

Security

Observability

Developer Experience

---

# Engineering Questions

Before approval ask

Can this application handle expected traffic?

↓

Does anything block the event loop?

↓

Are modules independent?

↓

Can failures be recovered automatically?

↓

Can another engineer understand the architecture quickly?

↓

Will scaling require architectural redesign?

↓

Would this implementation survive production workloads?

---

# Severity Levels

Critical

Event loop blocking

Memory leaks

Security vulnerability

Data corruption

Application crashes

Major

Poor architecture

Missing monitoring

Weak error handling

Performance bottlenecks

Medium

Naming inconsistencies

Module coupling

Documentation improvements

Optimization opportunities

Minor

Formatting

Comments

Examples

Refactoring suggestions

Future enhancements

---

# Node.js Checklist

✓ Modular architecture

✓ Event loop respected

✓ Async operations optimized

✓ Configuration externalized

✓ Dependencies reviewed

✓ Error handling implemented

✓ Resource cleanup verified

✓ Security reviewed

✓ Logging enabled

✓ Monitoring enabled

✓ Health checks implemented

✓ Performance measured

✓ Scalability validated

✓ Testing completed

✓ Production ready

---

# Anti-Patterns

Avoid

Blocking the event loop

Business logic inside routes

Massive service classes

Circular dependencies

Hardcoded configuration

Ignoring promise rejections

Memory leaks

Global mutable state

Large utility files

Silent failures

Overengineering

Premature optimization

---

# Definition of Done

Node.js engineering review is complete when

- The application follows a modular architecture with clear responsibilities.
- The event loop remains responsive under expected workloads.
- Asynchronous operations are implemented using modern, maintainable patterns.
- Configuration, secrets, and infrastructure concerns remain external to application logic.
- Errors are handled consistently with appropriate logging and recovery strategies.
- Performance, reliability, and observability are validated through monitoring and testing.
- Security practices protect data, dependencies, and runtime behavior.
- The application can scale horizontally without significant architectural changes.
- Documentation accurately reflects system behavior and operational requirements.
- The implementation is ready for long-term production use and continuous evolution.

Exceptional Node.js systems are not measured by how much code they contain.

They are measured by how predictably they perform, how easily they evolve, and how confidently engineers can operate them in production.