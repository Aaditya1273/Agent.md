# pagination.md

Version: 1.0.0

Target Models

- Claude 5 Family
- Claude 4.8
- Claude 4.7
- Claude 4.x Family
- Future Claude Models

---

# Purpose

This document defines how Claude should design, review, implement, document, and optimize API pagination.

Pagination is not simply dividing large datasets into smaller pages.

Pagination is a strategy for delivering scalable, predictable, performant, and user-friendly access to large collections of data while minimizing server load, network usage, and client complexity.

The objective is to design pagination systems that remain stable under growth, support efficient navigation, and provide a consistent developer experience.

Every collection should remain performant regardless of its size.

---

# Core Philosophy

Understand Data

↓

Choose Pagination Strategy

↓

Optimize Data Retrieval

↓

Provide Navigation

↓

Maintain Consistency

↓

Scale Efficiently

↓

Approve

Pagination should make large datasets feel small.

---

# Primary Objective

Every pagination implementation should answer one question.

"Can this API efficiently return millions of records while remaining predictable for clients?"

If the answer is uncertain,

the pagination strategy requires redesign.

---

# Pagination Principles

Every implementation should maximize

Performance

↓

Consistency

↓

Scalability

↓

Predictability

↓

Reliability

↓

Developer Experience

↓

User Experience

Choose the simplest strategy that scales with expected growth.

---

# Pagination Workflow

Understand Dataset

↓

Estimate Growth

↓

Select Strategy

↓

Define Parameters

↓

Design Response

↓

Optimize Queries

↓

Validate Performance

↓

Approve

---

# Stage 1 — Dataset Analysis

Before implementing determine

How many records exist?

↓

How quickly does the dataset grow?

↓

How frequently does data change?

↓

How often do users browse sequentially?

↓

What are the expected access patterns?

Pagination begins with understanding data.

---

# Stage 2 — Strategy Selection

Choose the appropriate strategy.

Offset Pagination

Best for

Small datasets

Admin dashboards

Reporting

Cursor Pagination

Best for

Large datasets

Real-time feeds

Infinite scrolling

Keyset Pagination

Best for

High-performance databases

Large ordered datasets

Page-Based Pagination

Best for

Simple applications

Human-friendly navigation

Choose based on scalability, not familiarity.

---

# Stage 3 — Request Parameters

Review

page

limit

offset

cursor

before

after

Direction

Sort order

Parameters should remain intuitive.

---

# Stage 4 — Response Design

Responses should contain

Data

Pagination metadata

Navigation information

Consistency

Example

data

pagination

hasNext

hasPrevious

nextCursor

previousCursor

totalCount (when practical)

Clients should never guess pagination state.

---

# Stage 5 — Ordering

Every paginated resource must define

Stable ordering

Default sorting

Deterministic results

Tie-breaking strategy

Changing order breaks pagination.

---

# Stage 6 — Cursor Design

Cursors should be

Opaque

Stable

Immutable

Secure

Efficient

Never expose internal database identifiers unless intentional.

---

# Stage 7 — Offset Pagination

Review

Offset value

Limit

Maximum page size

Database cost

Performance degradation

Offset pagination becomes expensive on very large datasets.

---

# Stage 8 — Cursor Pagination

Verify

Unique cursor

Forward navigation

Backward navigation

Duplicate prevention

Missing record handling

Cursor pagination should remain stable during inserts and deletes.

---

# Stage 9 — Keyset Pagination

Review

Indexed fields

Sorting columns

Unique ordering

Composite keys

Query optimization

Keyset pagination provides excellent scalability.

---

# Stage 10 — Page Size

Determine

Default limit

Maximum limit

Minimum limit

Server protection

Large responses increase latency and memory usage.

Choose sensible defaults.

---

# Stage 11 — Performance

Inspect

Query execution

Indexes

Sorting

Memory usage

Network size

Serialization

Response latency

Performance should remain predictable as data grows.

---

# Stage 12 — Database Optimization

Review

Indexes

Execution plans

Joins

Filtering

Sorting

Covering indexes

Pagination should leverage database strengths.

---

# Stage 13 — Filtering Integration

Filtering should occur

Before pagination.

Example

Products

↓

Category Filter

↓

Price Filter

↓

Sort

↓

Paginate

Filtering after pagination produces inconsistent results.

---

# Stage 14 — Sorting Integration

Sorting should be

Deterministic

Indexed

Stable

Consistent

Every page should preserve ordering.

---

# Stage 15 — Concurrency

Review

New records

Deleted records

Updated records

Duplicate entries

Skipped records

Pagination should tolerate concurrent changes gracefully.

---

# Stage 16 — Error Handling

Validate

Invalid cursor

Negative page

Oversized limit

Malformed requests

Expired cursor

Errors should clearly explain recovery.

---

# Stage 17 — Security

Review

Maximum limits

Cursor validation

Input validation

Rate limiting

Authorization

Pagination endpoints should remain protected.

---

# Stage 18 — Documentation

Document

Supported strategy

Parameters

Examples

Limits

Metadata

Error responses

Developers should understand navigation immediately.

---

# Stage 19 — Scalability

Evaluate

Millions of records

High concurrency

Large traffic

Distributed databases

Caching

Future growth

Pagination should improve as the system scales.

---

# Stage 20 — Developer Experience

Review

Consistency

Predictable parameters

Readable responses

Easy navigation

Clear documentation

Pagination should require minimal learning.

---

# Pagination Quality Attributes

Evaluate

Performance

Consistency

Reliability

Scalability

Predictability

Maintainability

Developer Experience

User Experience

---

# Pagination Questions

Before approval ask

Can this scale to millions of records?

↓

Will records be skipped?

↓

Can duplicates appear?

↓

Is ordering deterministic?

↓

Can developers understand navigation immediately?

↓

Does pagination remain efficient under heavy traffic?

↓

Would this strategy still work in five years?

---

# Severity Levels

Critical

Broken ordering

Duplicate records

Missing records

Unbounded responses

Major

Poor performance

Weak cursor design

Incorrect metadata

Large offsets

Medium

Documentation gaps

Parameter inconsistencies

Minor optimization opportunities

Minor

Formatting

Examples

Metadata improvements

Suggestion

Future scalability improvements

Alternative pagination strategies

---

# Pagination Checklist

✓ Strategy selected appropriately

✓ Stable ordering

✓ Efficient queries

✓ Indexed sorting

✓ Safe page size

✓ Metadata included

✓ Filtering integrated

✓ Sorting integrated

✓ Error handling implemented

✓ Security reviewed

✓ Documentation complete

✓ Scalability verified

✓ Developer-friendly interface

✓ Performance validated

✓ Consistent navigation

---

# Anti-Patterns

Avoid

Unlimited responses

Unstable sorting

Pagination after filtering

Large offsets on huge datasets

Exposing database implementation

Missing metadata

Changing cursor formats

Inconsistent limits

Duplicate records

Skipping records

Client-side pagination for massive datasets

Ignoring concurrent updates

---

# Definition of Done

Pagination review is complete when

- The appropriate pagination strategy has been selected.
- Ordering is deterministic and stable.
- Responses include sufficient navigation metadata.
- Filtering and sorting integrate correctly.
- Queries remain efficient as datasets grow.
- Cursor or page parameters are intuitive and secure.
- Performance has been validated under realistic workloads.
- Documentation clearly explains navigation and limits.
- The implementation supports future scalability without redesign.
- Developers can navigate large collections confidently and predictably.

Excellent pagination is almost invisible.

Users simply continue exploring data, while the underlying system remains fast, efficient, and scalable regardless of dataset size.