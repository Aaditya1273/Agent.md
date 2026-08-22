---
targetModels:
  - "DeepSeek V4"
  - "DeepSeek V3.2"
  - "DeepSeek R1"
  - "DeepSeek V3 Family"
  - "Future DeepSeek Models"
version: "1.0.0"


---

# prisma.md

Version: 1.0.0

Target Models

- DeepSeek V4
- DeepSeek V3.2
- DeepSeek R1
- DeepSeek V3 Family
- Future DeepSeek Models

---

# Purpose

This document defines engineering principles, architectural guidance, operational standards, and best practices for designing, implementing, optimizing, and maintaining applications using Prisma ORM.

It applies to

- PostgreSQL
- MySQL
- MariaDB
- SQLite
- SQL Server
- MongoDB
- PlanetScale
- Cloud Databases
- Serverless Applications
- Enterprise SaaS Platforms

Prisma is not a replacement for database engineering.

Prisma is a type-safe data access layer that simplifies development while preserving correctness, maintainability, performance, and operational reliability.

Prisma should improve developer productivity.

It should never replace understanding of SQL, database design, or system architecture.

---

# Core Philosophy

Understand the Database

↓

Model the Business

↓

Design the Schema

↓

Generate Safe Queries

↓

Measure Performance

↓

Observe Continuously

↓

Scale Predictably

↓

Continuously Improve

Prisma should abstract repetitive work.

Not hide database behavior.

---

# Primary Objective

Every Prisma architecture should maximize

Type Safety

+

Correctness

+

Developer Productivity

+

Performance

+

Maintainability

+

Scalability

+

Observability

+

Long-Term Sustainability

Type safety prevents bugs.

Database knowledge prevents outages.

---

# Engineering Principles

Always prioritize

Business Model

↓

Database Integrity

↓

Schema Clarity

↓

Migration Safety

↓

Predictable Queries

↓

Performance

↓

Monitoring

↓

Continuous Improvement

Prisma should simplify development.

Not encourage poor database design.

---

# Prisma Lifecycle

Business Requirements

↓

Schema Modeling

↓

Migration Design

↓

Client Generation

↓

Application Development

↓

Optimization

↓

Monitoring

↓

Continuous Improvement

---

# Stage 1 — Business Modeling

Understand

Business Rules

↓

Entities

↓

Relationships

↓

Ownership

↓

Validation

↓

Lifecycle

↓

Compliance

↓

Growth Expectations

Prisma models should represent the business.

Not application shortcuts.

---

# Stage 2 — Schema Design

Design

Models

↓

Fields

↓

Relationships

↓

Constraints

↓

Identifiers

↓

Indexes

↓

Enums

↓

Naming Standards

Schema quality determines long-term maintainability.

---

# Stage 3 — Relationship Modeling

Define

One-to-One

↓

One-to-Many

↓

Many-to-Many

↓

Optional Relationships

↓

Cascade Rules

↓

Ownership

↓

Referential Integrity

↓

Business Constraints

Relationships should mirror the underlying database.

---

# Stage 4 — Migration Strategy

Maintain

Version Control

↓

Migration History

↓

Backward Compatibility

↓

Rollback Planning

↓

Deployment Safety

↓

Review Process

↓

Production Validation

↓

Operational Stability

Every migration should be predictable.

Never automatic.

---

# Stage 5 — Prisma Client

Generate

Type Safety

↓

Query Builder

↓

Transactions

↓

Validation

↓

Reusable Operations

↓

Consistency

↓

Developer Experience

↓

Maintainability

Generated clients should improve correctness.

---

# Stage 6 — Query Design

Optimize

Filtering

↓

Sorting

↓

Pagination

↓

Aggregation

↓

Projection

↓

Transactions

↓

Batch Operations

↓

Business Logic

Every generated query should be explainable.

---

# Stage 7 — Performance

Optimize

Query Count

↓

N+1 Prevention

↓

Indexes

↓

Connection Pooling

↓

Caching

↓

Batch Queries

↓

Execution Plans

↓

Database Load

Prisma performance begins with database performance.

---

# Stage 8 — Transactions

Protect

Atomicity

↓

Consistency

↓

Isolation

↓

Rollback

↓

Business Rules

↓

Concurrency

↓

Recovery

↓

Operational Reliability

Transactions should protect business operations.

---

# Stage 9 — Validation

Validate

Input

↓

Business Rules

↓

Relationships

↓

Required Fields

↓

Data Types

↓

Consistency

↓

Constraints

↓

Operational Safety

Validation belongs in both application and database layers.

---

# Stage 10 — Error Handling

Handle

Validation Errors

↓

Connection Failures

↓

Constraint Violations

↓

Transaction Failures

↓

Timeouts

↓

Database Errors

↓

Recovery

↓

Monitoring

Every error should be actionable.

---

# Stage 11 — Concurrency

Design for

Parallel Requests

↓

Connection Management

↓

Optimistic Concurrency

↓

Retry Logic

↓

Locking

↓

Consistency

↓

Conflict Resolution

↓

Reliability

Concurrency should preserve correctness.

---

# Stage 12 — Scalability

Prepare for

Growing Tables

↓

Growing Users

↓

Read Scaling

↓

Write Scaling

↓

Replication

↓

Partitioning

↓

Caching

↓

Infrastructure Growth

Scalability begins with good schema design.

---

# Stage 13 — Observability

Monitor

Generated Queries

↓

Query Latency

↓

Connection Pool

↓

Transaction Health

↓

Slow Queries

↓

Errors

↓

Memory Usage

↓

Infrastructure Health

Generated SQL should never become invisible.

---

# Stage 14 — Security

Protect

Credentials

↓

Secrets

↓

Authorization

↓

Authentication

↓

SQL Injection Prevention

↓

Sensitive Data

↓

Audit Logs

↓

Compliance

Security requires engineering discipline.

Not just frameworks.

---

# Stage 15 — Testing

Validate

Schema

↓

Queries

↓

Relationships

↓

Transactions

↓

Performance

↓

Concurrency

↓

Migrations

↓

Recovery

Production confidence comes from testing.

---

# Stage 16 — Documentation

Document

Models

↓

Relationships

↓

Migration Strategy

↓

Architecture Decisions

↓

Business Rules

↓

Performance Decisions

↓

Operational Procedures

↓

Future Evolution

Documentation preserves engineering knowledge.

---

# Stage 17 — Review

Review

Schema Design

↓

Generated SQL

↓

Performance

↓

Relationships

↓

Security

↓

Maintainability

↓

Scalability

↓

Business Alignment

Every schema deserves architectural review.

---

# Stage 18 — Risk Assessment

Evaluate

Migration Risks

↓

Schema Drift

↓

Performance Risks

↓

Data Loss

↓

Connection Failures

↓

Scaling Risks

↓

Security Risks

↓

Operational Risks

Every abstraction introduces new risks.

---

# Stage 19 — Continuous Optimization

Continuously improve

Schema Design

↓

Queries

↓

Indexes

↓

Connection Management

↓

Monitoring

↓

Documentation

↓

Automation

↓

Developer Experience

Engineering maturity grows continuously.

---

# Stage 20 — Long-Term Sustainability

Continuously improve

Correctness

↓

Performance

↓

Maintainability

↓

Scalability

↓

Reliability

↓

Observability

↓

Documentation

↓

Engineering Excellence

Prisma should remain predictable for years.

---

# Prisma Quality Attributes

Evaluate

Type Safety

Correctness

Performance

Maintainability

Scalability

Reliability

Observability

Developer Experience

---

# Prisma Questions

Before production ask

Does every model accurately represent the business?

↓

Can every generated SQL query be explained?

↓

Are migrations safe for production?

↓

Will this architecture scale without redesign?

↓

Are indexes supporting every critical workload?

↓

Can failures recover safely?

↓

Would experienced Prisma and database engineers confidently approve this architecture?

---

# Severity Levels

Critical

Data corruption

Broken migrations

Schema drift

Production data loss

Security compromise

Major

N+1 queries

Slow generated SQL

Connection exhaustion

Migration failures

Performance degradation

Medium

Schema improvements

Index optimization

Documentation gaps

Caching improvements

Minor

Naming consistency

Formatting

Comments

Code organization

---

# Prisma Checklist

✓ Business model understood

✓ Schema designed

✓ Relationships validated

✓ Migration strategy defined

✓ Prisma Client generated

✓ Queries reviewed

✓ Performance optimized

✓ Transactions validated

✓ Validation implemented

✓ Error handling completed

✓ Concurrency reviewed

✓ Scalability planned

✓ Monitoring enabled

✓ Security implemented

✓ Testing completed

✓ Documentation updated

✓ Version management established

✓ Reviews completed

✓ Risks assessed

✓ Long-term sustainability protected

---

# Anti-Patterns

Avoid

Treating Prisma as the database

Ignoring generated SQL

Using Prisma without understanding SQL

Automatic production schema synchronization

Massive nested queries

Ignoring indexes

Skipping migrations

Skipping execution plan analysis

Business logic inside database models

Ignoring connection pooling

Optimizing without measurement

Treating type safety as database safety

---

# Definition of Done

A Prisma architecture is considered production-ready when

- Business entities, relationships, ownership rules, validation logic, and lifecycle states are accurately represented through well-designed Prisma models.
- Generated Prisma Client operations consistently produce predictable, efficient SQL that aligns with database indexing strategies, execution plans, and workload requirements.
- Schema evolution is managed through reviewed, version-controlled migrations with rollback planning, deployment validation, and production-safe operational practices.
- Transactions, validation, concurrency handling, connection management, and error recovery preserve data integrity across all business workflows.
- Performance remains predictable through optimized queries, batching, pagination, selective loading, indexing, connection pooling, caching, and continuous measurement.
- Security protects credentials, secrets, authorization boundaries, sensitive information, audit requirements, and operational integrity throughout the application lifecycle.
- Monitoring provides complete visibility into generated SQL, query latency, connection utilization, transaction health, migration status, infrastructure resources, and operational risks.
- Documentation preserves schema design, architectural decisions, migration history, performance considerations, operational procedures, and future evolution strategies.
- Engineering reviews continuously validate correctness, maintainability, scalability, observability, reliability, and developer experience as the system evolves.
- The Prisma architecture consistently demonstrates type safety, correctness, operational excellence, scalability, maintainability, performance, and long-term engineering maturity.

Exceptional Prisma architectures do not succeed because they generate code automatically.

They succeed because they combine strong database engineering, disciplined schema design, safe migrations, type-safe application development, predictable SQL generation, and continuous operational visibility into a single architecture that remains understandable, reliable, and maintainable as both the software and the business continue to evolve.