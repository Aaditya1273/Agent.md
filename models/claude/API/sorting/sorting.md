# sorting.md

Version: 1.0.0

Target Models

- Claude 5 Family
- Claude 4.8
- Claude 4.7
- Claude 4.x Family
- Future Claude Models

---

# Purpose

This document defines how Claude should design, review, implement, document, and optimize API sorting.

Sorting is not merely arranging records alphabetically or numerically.

Sorting determines how users consume information, discover relevant data, and navigate large datasets efficiently.

The objective is to design sorting systems that are deterministic, performant, intuitive, and consistent across every endpoint.

Every sorted result should be predictable regardless of dataset size.

---

# Core Philosophy

Understand Data

↓

Understand User Intent

↓

Select Sortable Fields

↓

Define Ordering

↓

Optimize Queries

↓

Validate Results

↓

Approve

Sorting should improve discoverability.

Never create ambiguity.

---

# Primary Objective

Every sorting implementation should answer one question.

"Can clients consistently receive records in the exact order they expect?"

If the answer is uncertain,

the sorting strategy requires redesign.

---

# Sorting Principles

Every implementation should maximize

Predictability

↓

Consistency

↓

Performance

↓

Scalability

↓

Readability

↓

Developer Experience

↓

User Experience

Sorting should always produce deterministic results.

---

# Sorting Workflow

Understand Dataset

↓

Identify Sortable Fields

↓

Define Default Ordering

↓

Support Multi-field Sorting

↓

Validate Inputs

↓

Optimize Queries

↓

Approve

---

# Stage 1 — Dataset Understanding

Before implementing determine

What entities exist?

↓

Which fields are sortable?

↓

Which ordering is most useful?

↓

How frequently do values change?

↓

What indexes exist?

Sorting begins with understanding user expectations.

---

# Stage 2 — Sortable Fields

Choose meaningful fields.

Examples

Name

Created Date

Updated Date

Price

Priority

Rating

Popularity

Status

Views

Downloads

Only expose fields users actually need.

---

# Stage 3 — Default Sorting

Every endpoint should define a default order.

Examples

Newest First

Oldest First

Alphabetical

Highest Rating

Most Popular

Priority

Users should never receive random ordering.

---

# Stage 4 — Ascending & Descending

Support both directions.

Examples

sort=name

sort=-name

sort=createdAt

sort=-createdAt

The "-" prefix indicates descending order.

Maintain one convention throughout the API.

---

# Stage 5 — Multi-field Sorting

Allow multiple sort fields.

Example

sort=priority,-createdAt,name

Sorting should occur sequentially.

Primary

↓

Secondary

↓

Tertiary

Multi-field sorting should remain deterministic.

---

# Stage 6 — Stable Ordering

Ensure identical values remain predictable.

Example

Priority

↓

Created Date

↓

ID

Tie-breaking prevents inconsistent pagination.

---

# Stage 7 — Data Type Support

Review

Strings

Numbers

Dates

Booleans

Enums

Identifiers

Each data type should have well-defined ordering rules.

---

# Stage 8 — Relationship Sorting

Support sorting through related entities when appropriate.

Examples

orders?sort=customer.name

projects?sort=owner

articles?sort=author

Relationship sorting should remain performant.

---

# Stage 9 — Null Handling

Define behavior explicitly.

Null First

Null Last

Ignored

Document null ordering.

Never leave it undefined.

---

# Stage 10 — Locale Awareness

Review

Case sensitivity

Unicode

Language-specific ordering

Accented characters

International applications require locale-aware sorting.

---

# Stage 11 — Pagination Integration

Sorting must occur

Before pagination.

Correct sequence

Filter

↓

Sort

↓

Paginate

↓

Respond

Changing sort order after pagination produces incorrect results.

---

# Stage 12 — Filtering Integration

Filtering should narrow the dataset.

Sorting should order the filtered results.

Example

Category

↓

Price Filter

↓

Sort

↓

Pagination

↓

Response

Filtering and sorting should work together naturally.

---

# Stage 13 — Performance

Inspect

Indexes

Execution plans

Memory usage

Database sorting

External sorting

Temporary tables

Sorting should leverage indexed columns whenever possible.

---

# Stage 14 — Large Dataset Review

Evaluate

Millions of records

Distributed systems

Database optimization

Streaming

Caching

Sorting should remain efficient under scale.

---

# Stage 15 — Validation

Validate

Unknown fields

Duplicate fields

Invalid syntax

Unauthorized fields

Malformed requests

Reject invalid sorting immediately.

---

# Stage 16 — Security

Review

Input validation

SQL injection prevention

Field whitelist

Authorization

Sensitive attributes

Clients should only sort by approved fields.

---

# Stage 17 — Error Handling

Errors should explain

Invalid field

Unsupported field

Malformed syntax

Unknown direction

Unauthorized sort

Recovery guidance

Developers should immediately understand the problem.

---

# Stage 18 — Documentation

Document

Supported fields

Direction syntax

Examples

Defaults

Limitations

Performance considerations

Documentation eliminates assumptions.

---

# Stage 19 — Consistency

Review

Parameter names

Direction syntax

Responses

Defaults

Validation

Documentation

Consistency improves usability.

---

# Stage 20 — Future Scalability

Evaluate

New sortable fields

Growing datasets

Additional indexes

Distributed databases

API evolution

Sorting should scale without redesign.

---

# Sorting Quality Attributes

Evaluate

Correctness

Performance

Consistency

Scalability

Predictability

Maintainability

Developer Experience

User Experience

---

# Sorting Questions

Before approval ask

Does sorting produce deterministic results?

↓

Can users predict ordering?

↓

Are indexed fields prioritized?

↓

Can sorting scale to millions of records?

↓

Does sorting integrate with filtering and pagination?

↓

Would another developer understand the sorting rules immediately?

↓

Will this remain maintainable as the API evolves?

---

# Severity Levels

Critical

Incorrect ordering

Non-deterministic results

Unauthorized sorting

Database instability

Major

Poor performance

Missing validation

Weak documentation

Unindexed sorting

Medium

Naming inconsistencies

Missing sortable fields

Optimization opportunities

Minor

Formatting

Examples

Documentation improvements

Suggestion

Future sorting enhancements

Additional sorting strategies

---

# Sorting Checklist

✓ Default ordering defined

✓ Ascending supported

✓ Descending supported

✓ Multi-field sorting

✓ Stable ordering

✓ Indexed fields

✓ Pagination integrated

✓ Filtering integrated

✓ Validation implemented

✓ Security reviewed

✓ Documentation complete

✓ Performance optimized

✓ Consistent syntax

✓ Deterministic behavior

✓ Scalable implementation

---

# Anti-Patterns

Avoid

Random ordering

Sorting after pagination

Sorting on unrestricted fields

Missing default ordering

Database-specific syntax

Unindexed sorting

Hidden ordering

Duplicate sort rules

Ignoring tie-breaking

Inconsistent syntax

Poor documentation

Sorting without validation

---

# Definition of Done

Sorting review is complete when

- Every endpoint defines a predictable default ordering.
- Supported sortable fields are meaningful and documented.
- Ascending, descending, and multi-field sorting behave consistently.
- Ordering remains deterministic through stable tie-breaking.
- Filtering and pagination integrate correctly with sorting.
- Database queries remain efficient through proper indexing.
- Validation prevents unsupported or unsafe sorting requests.
- Documentation clearly explains supported fields and syntax.
- The implementation scales with increasing data volume.
- Developers can confidently request and receive data in the exact order they expect.

Excellent sorting is rarely noticed.

Users simply find the right information in the right order, while the underlying system remains fast, predictable, and scalable.