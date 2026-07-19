# indexes.md

Version: 1.0.0

Target Models

- Claude 5 Family
- Claude 4.8
- Claude 4.7
- Claude 4.x Family
- Future Claude Models

---

# Purpose

This document defines engineering principles, architectural guidance, operational standards, and best practices for designing, maintaining, and optimizing database indexes.

It applies to

- PostgreSQL
- MySQL
- MariaDB
- SQL Server
- Oracle
- SQLite
- CockroachDB
- Distributed SQL Databases

Indexes are not performance optimizations added after development.

Indexes are architectural components that determine how efficiently data can be discovered, retrieved, sorted, filtered, and joined.

Poor indexing slows applications.

Poor indexing also slows writes.

Every index is a trade-off.

---

# Core Philosophy

Understand Workloads

↓

Measure Queries

↓

Design Indexes

↓

Validate Usage

↓

Monitor Performance

↓

Optimize Continuously

↓

Remove Waste

↓

Maintain Simplicity

Indexes should accelerate business operations.

Not consume resources unnecessarily.

---

# Primary Objective

Every indexing strategy should maximize

Read Performance

+

Predictable Query Plans

+

Write Efficiency

+

Storage Efficiency

+

Maintainability

+

Scalability

+

Observability

+

Long-Term Reliability

Every index should justify its existence.

---

# Engineering Principles

Always prioritize

Business Workloads

↓

Measured Performance

↓

Query Efficiency

↓

Minimal Redundancy

↓

Operational Simplicity

↓

Scalability

↓

Monitoring

↓

Continuous Improvement

Never create indexes based on assumptions.

---

# Index Lifecycle

Analyze Workload

↓

Identify Queries

↓

Design Indexes

↓

Validate Plans

↓

Measure Performance

↓

Monitor Usage

↓

Optimize

↓

Continuously Improve

---

# Stage 1 — Workload Analysis

Understand

Business Operations

↓

Read Patterns

↓

Write Patterns

↓

Search Behavior

↓

Sorting

↓

Filtering

↓

Growth Expectations

↓

Performance Goals

Indexes begin with workload analysis.

---

# Stage 2 — Query Analysis

Identify

Frequent Queries

↓

Slow Queries

↓

Join Operations

↓

Sorting

↓

Aggregations

↓

Pagination

↓

Reporting

↓

Analytics

Indexes should support actual workloads.

---

# Stage 3 — Column Selection

Select columns based on

Filtering

↓

Joining

↓

Sorting

↓

Grouping

↓

Uniqueness

↓

Foreign Keys

↓

Search Frequency

↓

Business Value

Not every column deserves an index.

---

# Stage 4 — Index Types

Choose appropriate indexes

Primary Index

↓

Unique Index

↓

Composite Index

↓

Partial Index

↓

Covering Index

↓

Expression Index

↓

Hash Index

↓

Specialized Indexes

Every index type solves a different problem.

---

# Stage 5 — Composite Index Design

Consider

Column Order

↓

Selectivity

↓

Filtering Sequence

↓

Sorting Order

↓

Join Conditions

↓

Business Queries

↓

Reuse

↓

Future Growth

Column order determines index usefulness.

---

# Stage 6 — Query Optimization

Design indexes for

WHERE

↓

JOIN

↓

ORDER BY

↓

GROUP BY

↓

LIMIT

↓

Aggregation

↓

Range Queries

↓

Pagination

Indexes should eliminate unnecessary scanning.

---

# Stage 7 — Write Performance

Evaluate impact on

INSERT

↓

UPDATE

↓

DELETE

↓

Bulk Operations

↓

Replication

↓

Maintenance

↓

Storage

↓

Concurrency

Every additional index has a write cost.

---

# Stage 8 — Storage Efficiency

Optimize

Index Size

↓

Duplicate Indexes

↓

Unused Indexes

↓

Fragmentation

↓

Compression

↓

Memory Usage

↓

Disk Usage

↓

Growth

Storage efficiency improves scalability.

---

# Stage 9 — Execution Plans

Review

Query Plans

↓

Index Scans

↓

Sequential Scans

↓

Nested Loops

↓

Merge Joins

↓

Hash Joins

↓

Estimated Cost

↓

Actual Performance

Execution plans explain database decisions.

---

# Stage 10 — Selectivity

Evaluate

Unique Values

↓

Distribution

↓

Cardinality

↓

Filtering Effectiveness

↓

Data Skew

↓

Null Values

↓

Business Patterns

↓

Growth

High selectivity generally improves index effectiveness.

---

# Stage 11 — Monitoring

Continuously monitor

Index Usage

↓

Slow Queries

↓

Unused Indexes

↓

Fragmentation

↓

Storage Growth

↓

Latency

↓

Write Performance

↓

Database Health

Unused indexes consume resources.

---

# Stage 12 — Maintenance

Regularly perform

Rebuild

↓

Reorganize

↓

Statistics Updates

↓

Fragmentation Review

↓

Storage Cleanup

↓

Health Checks

↓

Performance Review

↓

Capacity Planning

Maintenance preserves efficiency.

---

# Stage 13 — Scalability

Prepare for

Growing Tables

↓

Higher Traffic

↓

More Users

↓

Larger Indexes

↓

Partitioning

↓

Replication

↓

Distributed Systems

↓

Future Expansion

Indexes should scale with data.

---

# Stage 14 — Reliability

Ensure

Predictable Queries

↓

Stable Performance

↓

Operational Consistency

↓

Recovery

↓

Backup Compatibility

↓

Migration Safety

↓

Replication

↓

Availability

Indexes support reliable operations.

---

# Stage 15 — Security

Protect

Sensitive Data

↓

Access Control

↓

Metadata

↓

Operational Visibility

↓

Compliance

↓

Auditing

↓

Administration

↓

Infrastructure

Performance should never weaken security.

---

# Stage 16 — Documentation

Document

Purpose

↓

Indexed Columns

↓

Supported Queries

↓

Trade-offs

↓

Maintenance

↓

Growth Expectations

↓

Architecture Decisions

↓

Review History

Documentation prevents unnecessary indexes.

---

# Stage 17 — Review

Review

Business Value

↓

Performance Gains

↓

Storage Cost

↓

Write Impact

↓

Maintainability

↓

Scalability

↓

Operational Simplicity

↓

Future Suitability

Every index should be reviewed.

---

# Stage 18 — Risk Assessment

Evaluate

Duplicate Indexes

↓

Missing Indexes

↓

Unused Indexes

↓

Storage Risks

↓

Performance Risks

↓

Migration Risks

↓

Scaling Risks

↓

Operational Risks

Poor indexing creates hidden technical debt.

---

# Stage 19 — Continuous Optimization

Continuously improve

Query Plans

↓

Index Design

↓

Storage Efficiency

↓

Maintenance

↓

Monitoring

↓

Automation

↓

Developer Experience

↓

Database Performance

Optimization is continuous.

---

# Stage 20 — Long-Term Sustainability

Continuously improve

Performance

↓

Efficiency

↓

Maintainability

↓

Scalability

↓

Observability

↓

Reliability

↓

Documentation

↓

Database Excellence

Well-designed indexes remain valuable as systems evolve.

---

# Index Quality Attributes

Evaluate

Performance

Efficiency

Maintainability

Scalability

Storage Efficiency

Reliability

Observability

Business Alignment

---

# Index Questions

Before creating an index ask

Will this accelerate an important business query?

↓

Can existing indexes already solve this problem?

↓

Will write performance remain acceptable?

↓

Is the storage cost justified?

↓

Will this remain valuable as data grows?

↓

Can it simplify query execution?

↓

Would experienced database engineers confidently approve this index?

---

# Severity Levels

Critical

Missing indexes causing production failures

Broken primary indexes

Severe query degradation

Major

Duplicate indexes

Poor composite index design

Write performance degradation

Storage growth

Medium

Fragmentation

Statistics outdated

Maintenance improvements

Minor

Naming consistency

Documentation improvements

Review refinements

---

# Index Checklist

✓ Workloads analyzed

✓ Queries reviewed

✓ Columns selected

✓ Index types chosen

✓ Composite indexes optimized

✓ Query performance validated

✓ Write impact evaluated

✓ Storage reviewed

✓ Execution plans verified

✓ Selectivity measured

✓ Monitoring enabled

✓ Maintenance scheduled

✓ Scalability planned

✓ Reliability ensured

✓ Security reviewed

✓ Documentation completed

✓ Reviews performed

✓ Risks assessed

✓ Continuous optimization practiced

✓ Long-term sustainability protected

---

# Anti-Patterns

Avoid

Indexing every column

Creating duplicate indexes

Ignoring execution plans

Optimizing before measuring

Ignoring write overhead

Unused indexes

Missing composite indexes

Wrong column order

Ignoring selectivity

Never reviewing index usage

Treating indexes as permanent

Ignoring storage costs

---

# Definition of Done

An indexing strategy is considered production-ready when

- Every index exists to support a measurable business workload, query pattern, or operational requirement.
- Query execution plans consistently demonstrate efficient index utilization while avoiding unnecessary sequential scans where appropriate.
- Composite indexes, covering indexes, partial indexes, and specialized index types are selected intentionally based on workload characteristics rather than assumptions.
- Write performance, storage consumption, replication overhead, maintenance costs, and scalability implications remain balanced against read performance improvements.
- Continuous monitoring identifies unused indexes, fragmentation, slow queries, storage growth, and opportunities for optimization before they affect production.
- Index maintenance, statistics updates, rebuild strategies, and health checks preserve long-term query efficiency.
- Documentation explains the purpose, supported workloads, design decisions, maintenance expectations, and trade-offs for every significant index.
- Database growth, evolving workloads, infrastructure expansion, and future business requirements can be accommodated without extensive redesign.
- Engineers can confidently understand, maintain, optimize, and evolve the indexing strategy through documented standards and measurable performance metrics.
- The indexing architecture consistently demonstrates predictable performance, operational simplicity, scalability, maintainability, and long-term engineering excellence.

Exceptional indexing is rarely noticed.

Users simply experience consistently fast applications, developers write straightforward queries without performance surprises, databases scale predictably under increasing workloads, and every index continues to provide measurable value because it exists to solve a real business problem rather than a hypothetical optimization.