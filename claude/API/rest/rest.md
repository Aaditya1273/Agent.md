# rest.md

Version: 1.0.0

Target Models

- Claude 5 Family
- Claude 4.8
- Claude 4.7
- Claude 4.x Family
- Future Claude Models

---

# Purpose

This document defines how Claude should design, review, consume, document, and reason about REST APIs.

REST is not merely a collection of HTTP endpoints.

REST is a resource-oriented architectural style that emphasizes predictable interfaces, stateless communication, standardized semantics, cacheability, and scalability.

The objective is to design APIs that are intuitive for developers, efficient for systems, secure by default, and maintainable throughout their lifecycle.

Every endpoint should communicate intent clearly while minimizing ambiguity.

---

# Core Philosophy

Understand Resources

↓

Design Resource Model

↓

Define Operations

↓

Apply HTTP Semantics

↓

Validate Contracts

↓

Secure Communication

↓

Optimize Consistency

↓

Approve

REST should describe business resources.

Not implementation details.

---

# Primary Objective

Every REST API should answer one question.

"If a developer has never seen this API before, can they successfully understand and use it without additional explanation?"

If the answer is uncertain,

the API requires redesign.

---

# REST Principles

Every API should maximize

Predictability

↓

Consistency

↓

Simplicity

↓

Scalability

↓

Discoverability

↓

Reliability

↓

Security

↓

Developer Experience

REST favors conventions over surprises.

---

# REST Workflow

Understand Domain

↓

Identify Resources

↓

Model Relationships

↓

Define Endpoints

↓

Choose HTTP Methods

↓

Design Responses

↓

Handle Errors

↓

Validate

↓

Approve

---

# Stage 1 — Domain Understanding

Before designing an API determine

What business problem exists?

↓

Which entities exist?

↓

Who consumes the API?

↓

How do resources relate?

↓

What operations are required?

APIs should represent the business domain.

Never database tables.

---

# Stage 2 — Resource Identification

Identify

Primary Resources

Nested Resources

Relationships

Collections

Singletons

Derived Resources

Resources should represent nouns.

Avoid verbs whenever possible.

Example

Good

/users

/projects

/orders

/products

Bad

/getUsers

/createProject

/deleteOrder

/runReport

---

# Stage 3 — URI Design

Every URI should be

Readable

Stable

Predictable

Hierarchical

Plural

Resource-focused

Good

/users

/users/{id}

/projects/{id}/tasks

/orders/{id}/items

Avoid

/getUser

/createUser

/userList

/api123

---

# Stage 4 — HTTP Method Selection

Use methods consistently.

GET

Retrieve resources.

Safe.

Idempotent.

POST

Create resources.

Not idempotent.

PUT

Replace an entire resource.

Idempotent.

PATCH

Modify part of a resource.

DELETE

Remove resources.

Idempotent.

Method semantics should never be overloaded.

---

# Stage 5 — Status Codes

Return meaningful status codes.

2xx

Success

200 OK

201 Created

202 Accepted

204 No Content

4xx

Client Errors

400 Bad Request

401 Unauthorized

403 Forbidden

404 Not Found

409 Conflict

422 Unprocessable Entity

429 Too Many Requests

5xx

Server Errors

500 Internal Server Error

502 Bad Gateway

503 Service Unavailable

Status codes communicate intent.

Response bodies provide detail.

---

# Stage 6 — Request Design

Review

Headers

Authentication

Validation

Content-Type

Accept

Query Parameters

Path Parameters

Request Body

Every request should be explicit.

Avoid hidden behavior.

---

# Stage 7 — Response Design

Responses should contain

Consistent structure

Useful metadata

Predictable fields

Machine-readable errors

Human-readable messages

Minimal unnecessary data

Example

Success

status

data

meta

Error

status

error

code

message

details

Consistency reduces client complexity.

---

# Stage 8 — Resource Relationships

Represent relationships naturally.

Examples

/users/{id}/projects

/projects/{id}/tasks

/orders/{id}/payments

Avoid deeply nested hierarchies.

Prefer shallow, understandable paths.

---

# Stage 9 — Filtering

Filtering should use query parameters.

Examples

/users?country=IN

/products?category=laptop

/orders?status=paid

Filtering narrows collections.

It should never modify resources.

---

# Stage 10 — Sorting

Sorting should be explicit.

Examples

/users?sort=name

/users?sort=-createdAt

/products?sort=price

Sorting must remain predictable.

---

# Stage 11 — Searching

Search endpoints should be intuitive.

Examples

/products?search=keyboard

/users?name=alex

/articles?query=ai

Avoid creating separate search resources unless necessary.

---

# Stage 12 — Pagination

Large collections should always support pagination.

Review

Offset pagination

Cursor pagination

Page-based pagination

Response metadata

Total count

Next cursor

Previous cursor

Pagination should remain stable under concurrent updates.

---

# Stage 13 — Validation

Validate

Headers

Query parameters

Body

Path parameters

Business rules

Data types

Required fields

Never trust client input.

---

# Stage 14 — Error Design

Errors should include

Unique error code

Readable message

Helpful details

Recovery guidance

Correlation ID

Avoid exposing implementation details.

---

# Stage 15 — Authentication

Support

Bearer Tokens

OAuth

API Keys

JWT

Session Authentication

Authentication identifies the caller.

Authorization defines permissions.

---

# Stage 16 — Security

Review

HTTPS

Input validation

Output encoding

Rate limiting

Authorization

Secret management

Replay protection

Security should exist across every endpoint.

---

# Stage 17 — Idempotency

Verify operations.

GET

Always idempotent.

PUT

Should be idempotent.

DELETE

Should be idempotent.

POST

Use Idempotency-Key when required.

Reliable APIs tolerate retries.

---

# Stage 18 — Performance

Inspect

Payload size

Compression

Caching

ETags

Conditional Requests

Batch Operations

Connection reuse

Performance improves developer experience.

---

# Stage 19 — Documentation

Every endpoint should document

Purpose

Authentication

Parameters

Request examples

Response examples

Errors

Rate limits

Examples reduce integration errors.

---

# Stage 20 — API Consistency

Review

Naming

Response format

Errors

Authentication

Status codes

Pagination

Filtering

Sorting

Consistency is more valuable than cleverness.

---

# REST Quality Attributes

Evaluate

Correctness

Consistency

Predictability

Security

Performance

Scalability

Maintainability

Discoverability

Reliability

Developer Experience

---

# REST Questions

Before approval ask

Does every endpoint represent a resource?

↓

Are HTTP methods used correctly?

↓

Would another developer predict this endpoint?

↓

Are responses consistent?

↓

Can clients recover from errors?

↓

Does the API scale?

↓

Would this API remain understandable in five years?

---

# Severity Levels

Critical

Broken resource model

Incorrect HTTP semantics

Authentication failure

Authorization bypass

Major

Inconsistent responses

Poor URI design

Incorrect status codes

Missing validation

Medium

Naming inconsistencies

Weak documentation

Response improvements

Minor

Formatting

Metadata improvements

Example quality

Suggestion

Future enhancements

Performance opportunities

---

# REST Checklist

✓ Resources identified

✓ URI design consistent

✓ HTTP methods correct

✓ Status codes meaningful

✓ Validation implemented

✓ Authentication reviewed

✓ Authorization verified

✓ Errors standardized

✓ Pagination supported

✓ Filtering supported

✓ Sorting supported

✓ Documentation complete

✓ Security reviewed

✓ Performance considered

✓ Consistent developer experience

---

# Anti-Patterns

Avoid

RPC-style endpoints

Verb-heavy URLs

Inconsistent responses

Always returning HTTP 200

Deeply nested resources

Leaking database schema

Missing validation

Business logic inside URLs

Over-fetching

Under-fetching

Hidden side effects

Ignoring HTTP semantics

---

# Definition of Done

REST API review is complete when

- Resources accurately represent the business domain.
- URIs are intuitive, stable, and consistent.
- HTTP methods and status codes follow standard semantics.
- Requests and responses are predictable.
- Validation and security controls are comprehensive.
- Error responses are actionable and standardized.
- Pagination, filtering, and sorting are implemented where appropriate.
- Documentation enables successful integration without guesswork.
- The API is scalable, maintainable, and developer-friendly.
- The implementation follows REST principles while remaining practical for long-term evolution.

Excellent REST APIs are not remembered because they are clever.

They are remembered because they feel obvious, consistent, and effortless to use.