# filtering.md

Version: 1.0.0

Target Models

- Claude 5 Family
- Claude 4.8
- Claude 4.7
- Claude 4.x Family
- Future Claude Models

---

# Purpose

This document defines how Claude should design, review, implement, document, and optimize API filtering.

Filtering is not simply reducing the number of returned records.

Filtering is a query capability that enables clients to retrieve only the data relevant to their current task while maintaining correctness, consistency, performance, and scalability.

The objective is to design filtering systems that are intuitive, composable, secure, and efficient regardless of dataset size.

Filtering should reduce unnecessary data transfer without increasing API complexity.

---

# Core Philosophy

Understand Data

↓

Understand User Intent

↓

Design Filters

↓

Validate Requests

↓

Optimize Queries

↓

Return Relevant Data

↓

Approve

Filtering should help users find information.

Never make them search manually.

---

# Primary Objective

Every filtering system should answer one question.

"Can clients retrieve exactly the records they need with clear, predictable, and efficient filters?"

If the answer is uncertain,

the filtering strategy requires redesign.

---

# Filtering Principles

Every implementation should maximize

Clarity

↓

Predictability

↓

Consistency

↓

Performance

↓

Scalability

↓

Security

↓

Developer Experience

Filtering should reduce complexity.

Never create ambiguity.

---

# Filtering Workflow

Understand Dataset

↓

Identify Filterable Fields

↓

Define Operators

↓

Validate Inputs

↓

Optimize Queries

↓

Document Behavior

↓

Approve

---

# Stage 1 — Dataset Understanding

Before implementing determine

What entities exist?

↓

Which fields are searchable?

↓

Which fields change frequently?

↓

Which fields require indexing?

↓

What are the most common user queries?

Filtering begins with understanding data usage.

---

# Stage 2 — Filter Selection

Choose meaningful filters.

Examples

Status

Category

Type

Owner

Country

Role

Date

Price

Tag

Priority

Filters should represent business concepts.

Not internal implementation.

---

# Stage 3 — Query Parameters

Use readable query parameters.

Examples

/users?role=admin

/orders?status=paid

/products?category=laptop

/tasks?priority=high

Keep parameter names descriptive.

---

# Stage 4 — Equality Filters

Support simple comparisons.

Examples

status=active

country=india

role=developer

category=books

Equality filters should be the default.

---

# Stage 5 — Comparison Filters

Support numeric and date comparisons.

Examples

price_gt=100

price_lt=1000

age_gte=18

created_after=2025-01-01

updated_before=2025-12-31

Comparison operators should remain consistent.

---

# Stage 6 — Range Filters

Support value ranges.

Examples

price_min=500

price_max=1500

date_from=2025-01-01

date_to=2025-12-31

Ranges should include clear boundary behavior.

---

# Stage 7 — Multi-Value Filters

Allow multiple selections.

Examples

status=active,pending

category=laptop,tablet

role=admin,editor

Document whether filters behave as

AND

OR

Never leave behavior undefined.

---

# Stage 8 — Boolean Filters

Support explicit boolean values.

Examples

verified=true

featured=false

published=true

Boolean filters should never rely on implicit defaults.

---

# Stage 9 — Text Search

Support

Partial matching

Case-insensitive matching

Normalized text

Unicode support

Examples

search=keyboard

name=alex

Avoid expensive wildcard queries whenever possible.

---

# Stage 10 — Relationship Filters

Support filtering across relationships.

Examples

orders?customerId=123

projects?owner=456

tasks?project=789

Relationships should remain intuitive.

---

# Stage 11 — Date Filtering

Review

Created Date

Updated Date

Published Date

Deleted Date

Expiration Date

Always specify

Timezone

Precision

Inclusivity

Dates should never be ambiguous.

---

# Stage 12 — Combining Filters

Allow filters to work together.

Example

/products?

category=laptop

&brand=lenovo

&price_lt=80000

&available=true

Filters should compose naturally.

---

# Stage 13 — Validation

Validate

Unknown filters

Invalid values

Wrong types

Invalid dates

Negative numbers

Malformed requests

Reject invalid filters early.

---

# Stage 14 — Performance

Review

Indexes

Execution plans

Query optimization

Caching

Result size

Database scans

Filtering should reduce work.

Not increase it.

---

# Stage 15 — Pagination Integration

Filtering should occur

Before pagination.

Correct order

Filter

↓

Sort

↓

Paginate

↓

Respond

Incorrect ordering produces inconsistent results.

---

# Stage 16 — Sorting Integration

Filters should work seamlessly with sorting.

Example

status=active

↓

sort=createdAt

↓

limit=20

↓

response

Filtering should never break sorting.

---

# Stage 17 — Security

Review

Input validation

SQL injection prevention

NoSQL injection prevention

Authorization

Sensitive fields

Rate limiting

Never expose restricted data through filtering.

---

# Stage 18 — Error Handling

Return meaningful errors.

Examples

Unknown filter

Invalid value

Invalid format

Unsupported operator

Exceeded limits

Errors should help developers recover quickly.

---

# Stage 19 — Documentation

Document

Supported filters

Operators

Examples

Default behavior

Limits

Edge cases

Documentation removes guesswork.

---

# Stage 20 — Consistency

Review

Naming

Operators

Responses

Validation

Errors

Documentation

Consistency improves developer productivity.

---

# Filtering Quality Attributes

Evaluate

Correctness

Performance

Scalability

Consistency

Security

Maintainability

Developer Experience

User Experience

---

# Filtering Questions

Before approval ask

Can users retrieve only relevant data?

↓

Are filters intuitive?

↓

Do filters compose naturally?

↓

Are queries efficient?

↓

Can invalid filters be detected immediately?

↓

Does filtering scale with large datasets?

↓

Would another developer understand every filter without documentation?

---

# Severity Levels

Critical

Incorrect results

Unauthorized data exposure

Injection vulnerability

Broken filtering logic

Major

Poor performance

Inconsistent operators

Missing validation

Weak documentation

Medium

Naming inconsistencies

Missing filters

Optimization opportunities

Minor

Formatting

Examples

Documentation improvements

Suggestion

Future filter enhancements

Additional operators

---

# Filtering Checklist

✓ Business fields identified

✓ Equality filters implemented

✓ Range filters supported

✓ Date filters supported

✓ Boolean filters supported

✓ Multi-value filters supported

✓ Validation implemented

✓ Pagination integrated

✓ Sorting integrated

✓ Security reviewed

✓ Documentation complete

✓ Performance optimized

✓ Consistent naming

✓ Predictable behavior

✓ Developer-friendly interface

---

# Anti-Patterns

Avoid

Filtering after pagination

Dynamic SQL generation

Unvalidated filters

Hidden filter behavior

Database-specific parameters

Unlimited wildcard searches

Inconsistent operators

Poor naming

Exposing internal fields

Ignoring indexes

Silent failures

Undocumented filters

---

# Definition of Done

Filtering review is complete when

- Every filter represents a meaningful business concept.
- Filter parameters are intuitive and consistently named.
- Equality, range, boolean, date, and relationship filters behave predictably.
- Validation prevents malformed or unsupported requests.
- Filtering integrates correctly with sorting and pagination.
- Database queries remain efficient under realistic workloads.
- Sensitive data cannot be exposed through filtering.
- Documentation completely describes supported filters and operators.
- The implementation scales with growing datasets.
- Developers can retrieve exactly the information they need with minimal effort.

Excellent filtering is invisible.

Users simply ask for the data they need, and the API returns the correct results quickly, consistently, and predictably.