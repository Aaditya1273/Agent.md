# schema-design.md

Version: 1.0.0

Target Models

- Claude 5 Family
- Claude 4.8
- Claude 4.7
- Claude 4.x Family
- Future Claude Models

---

# Purpose

This document defines engineering principles, architectural guidance, and best practices for designing scalable, maintainable, and reliable database schemas.

It applies to

- PostgreSQL
- MySQL
- SQL Server
- MariaDB
- CockroachDB
- Oracle
- SQLite
- Hybrid Database Architectures

Schema design is not creating tables.

Schema design is modeling how a business operates, how data evolves, and how systems remain correct as they grow.

Good schemas survive changing applications.

Poor schemas become technical debt.

---

# Core Philosophy

Understand Business

↓

Model Reality

↓

Protect Integrity

↓

Reduce Complexity

↓

Optimize Access

↓

Support Growth

↓

Maintain Consistency

↓

Enable Evolution

Applications change.

Data remains.

Design accordingly.

---

# Primary Objective

Every schema should maximize

Correctness

+

Clarity

+

Integrity

+

Maintainability

+

Performance

+

Scalability

+

Reliability

+

Extensibility

The schema should accurately represent the business.

Everything else depends on it.

---

# Engineering Principles

Always prioritize

Business Reality

↓

Data Integrity

↓

Clear Relationships

↓

Normalization

↓

Simple Queries

↓

Operational Reliability

↓

Future Growth

↓

Continuous Improvement

A schema is a business model.

Not merely a storage model.

---

# Schema Design Lifecycle

Requirements

↓

Domain Modeling

↓

Entity Design

↓

Relationship Modeling

↓

Normalization

↓

Validation

↓

Optimization

↓

Continuous Evolution

---

# Stage 1 — Business Analysis

Understand

Business Processes

↓

Business Rules

↓

Entities

↓

Relationships

↓

Ownership

↓

Lifecycle

↓

Compliance

↓

Growth Expectations

Never design tables before understanding the business.

---

# Stage 2 — Domain Modeling

Identify

Core Domains

↓

Subdomains

↓

Boundaries

↓

Ownership

↓

Responsibilities

↓

Dependencies

↓

Interactions

↓

Future Expansion

Domains organize complexity.

---

# Stage 3 — Entity Design

Design

Business Entities

↓

Attributes

↓

Identifiers

↓

States

↓

Lifecycle

↓

Ownership

↓

Responsibilities

↓

Constraints

Every table should represent one business concept.

---

# Stage 4 — Primary Keys

Choose

Stable Identifiers

↓

Uniqueness

↓

Immutability

↓

Performance

↓

Consistency

↓

Global Identification

↓

Relationships

↓

Future Compatibility

Primary keys should never change.

---

# Stage 5 — Relationships

Model

One-to-One

↓

One-to-Many

↓

Many-to-Many

↓

Hierarchical Structures

↓

Reference Tables

↓

Ownership

↓

Dependencies

↓

Business Rules

Relationships should enforce reality.

---

# Stage 6 — Normalization

Normalize to eliminate

Duplicate Data

↓

Update Anomalies

↓

Insertion Problems

↓

Deletion Problems

↓

Data Inconsistency

↓

Storage Waste

↓

Maintenance Complexity

↓

Business Errors

Normalize first.

Denormalize intentionally.

---

# Stage 7 — Constraints

Protect data using

Primary Keys

↓

Foreign Keys

↓

Unique Constraints

↓

Check Constraints

↓

NOT NULL

↓

Default Values

↓

Business Rules

↓

Referential Integrity

Integrity belongs inside the database.

---

# Stage 8 — Data Types

Choose

Correct Types

↓

Appropriate Size

↓

Precision

↓

Consistency

↓

Storage Efficiency

↓

Validation

↓

Future Compatibility

↓

Performance

Incorrect types create permanent problems.

---

# Stage 9 — Naming Standards

Maintain

Consistent Tables

↓

Consistent Columns

↓

Primary Key Naming

↓

Foreign Key Naming

↓

Indexes

↓

Constraints

↓

Readable Names

↓

Documentation

Naming is architecture.

---

# Stage 10 — Index Planning

Plan indexes for

Primary Keys

↓

Foreign Keys

↓

Search Queries

↓

Sorting

↓

Joins

↓

Aggregations

↓

Uniqueness

↓

Performance

Indexes should support workloads.

Not assumptions.

---

# Stage 11 — Query Patterns

Design around

Read Operations

↓

Write Operations

↓

Filtering

↓

Joins

↓

Aggregation

↓

Pagination

↓

Reporting

↓

Analytics

Schemas exist to support business operations.

---

# Stage 12 — Scalability

Prepare for

Growing Tables

↓

Higher Traffic

↓

Concurrency

↓

Storage Growth

↓

Partitioning

↓

Replication

↓

Global Expansion

↓

Operational Growth

Growth should not require redesign.

---

# Stage 13 — Security

Protect

Sensitive Data

↓

Access Control

↓

Encryption

↓

Auditability

↓

Compliance

↓

Ownership

↓

Privacy

↓

Retention

Security starts with data design.

---

# Stage 14 — Reliability

Ensure

Transactional Integrity

↓

Consistency

↓

Recovery

↓

Backups

↓

Replication

↓

High Availability

↓

Failure Recovery

↓

Operational Stability

Reliable systems begin with reliable schemas.

---

# Stage 15 — Documentation

Document

Entities

↓

Relationships

↓

Business Rules

↓

Constraints

↓

Indexes

↓

Naming Standards

↓

Architecture Decisions

↓

Evolution History

Documentation preserves understanding.

---

# Stage 16 — Version Management

Maintain

Migration History

↓

Schema Versions

↓

Rollback Plans

↓

Compatibility

↓

Release Notes

↓

Review Records

↓

Audit History

↓

Evolution

Schemas continuously evolve.

---

# Stage 17 — Review

Review

Business Accuracy

↓

Relationships

↓

Normalization

↓

Integrity

↓

Performance

↓

Maintainability

↓

Scalability

↓

Operational Readiness

Every schema deserves architectural review.

---

# Stage 18 — Risk Assessment

Evaluate

Data Loss

↓

Integrity Risks

↓

Migration Risks

↓

Performance Risks

↓

Scaling Risks

↓

Security Risks

↓

Compliance Risks

↓

Recovery Risks

Understand risks before implementation.

---

# Stage 19 — Continuous Optimization

Continuously improve

Modeling

↓

Constraints

↓

Relationships

↓

Indexes

↓

Performance

↓

Documentation

↓

Operations

↓

Developer Experience

Schema quality improves continuously.

---

# Stage 20 — Long-Term Sustainability

Continuously improve

Correctness

↓

Integrity

↓

Performance

↓

Scalability

↓

Maintainability

↓

Documentation

↓

Operational Excellence

↓

Database Maturity

Great schemas remain understandable for years.

---

# Schema Quality Attributes

Evaluate

Correctness

Integrity

Consistency

Maintainability

Scalability

Performance

Reliability

Business Alignment

---

# Schema Questions

Before implementation ask

Does this accurately model the business?

↓

Can invalid data be prevented?

↓

Are relationships explicit?

↓

Will this remain understandable in five years?

↓

Will the schema scale with business growth?

↓

Can future engineers easily maintain it?

↓

Would experienced database architects confidently approve this schema?

---

# Severity Levels

Critical

Data corruption

Broken integrity

Missing primary keys

Broken relationships

Major

Poor normalization

Missing constraints

Redundant data

Poor scalability

Medium

Naming inconsistencies

Documentation gaps

Index improvements

Minor

Formatting

Comments

Organization improvements

---

# Schema Checklist

✓ Business requirements understood

✓ Domain modeled

✓ Entities designed

✓ Primary keys defined

✓ Relationships validated

✓ Normalization completed

✓ Constraints enforced

✓ Data types selected

✓ Naming standardized

✓ Indexes planned

✓ Query patterns considered

✓ Scalability reviewed

✓ Security addressed

✓ Reliability ensured

✓ Documentation completed

✓ Versioning established

✓ Reviews completed

✓ Risks assessed

✓ Continuous optimization planned

✓ Long-term sustainability protected

---

# Anti-Patterns

Avoid

Designing tables before understanding requirements

Using nullable columns unnecessarily

Duplicating business data

Missing foreign keys

Using application code instead of constraints

Inconsistent naming

Excessive denormalization

Premature optimization

Ignoring future growth

Skipping documentation

Treating schemas as temporary

Optimizing for today's requirements only

---

# Definition of Done

Schema design is considered production-ready when

- Business entities, relationships, ownership, and lifecycle rules accurately model the real-world domain.
- Primary keys, foreign keys, constraints, normalization, and validation mechanisms enforce data integrity independently of application logic.
- Data types, naming conventions, indexes, and query patterns provide predictable performance while remaining clear and maintainable.
- The schema supports expected workloads, operational growth, future migrations, and evolving business requirements without unnecessary redesign.
- Security, compliance, privacy, retention, and audit requirements are reflected directly within the data model where appropriate.
- Documentation clearly explains entities, relationships, constraints, architectural decisions, business rules, and schema evolution.
- Version-controlled migrations, review processes, rollback strategies, and compatibility planning enable safe long-term evolution.
- Operational reliability is supported through backup planning, recovery procedures, monitoring, and scalability considerations.
- Future engineers can understand, extend, and maintain the schema without requiring undocumented business knowledge.
- The schema consistently demonstrates correctness, integrity, simplicity, scalability, operational excellence, and long-term sustainability.

Exceptional schema design is almost invisible.

Applications evolve, features expand, teams change, and infrastructure scales, yet the underlying data model continues to represent the business accurately, preserve data integrity, simplify development, and provide a dependable foundation for every future decision built upon it.