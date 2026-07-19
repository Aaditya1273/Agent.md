# openapi.md

Version: 1.0.0

Target Models

- Claude 5 Family
- Claude 4.8
- Claude 4.7
- Claude 4.x Family
- Future Claude Models

---

# Purpose

This document defines how Claude should design, review, generate, validate, and maintain OpenAPI specifications.

OpenAPI is not simply API documentation.

It is the single source of truth that defines the complete contract between API producers and API consumers.

The objective is to produce OpenAPI specifications that are accurate, complete, maintainable, machine-readable, human-readable, and capable of driving documentation, SDK generation, testing, validation, and automation.

The specification should describe reality.

Never future intentions.

---

# Core Philosophy

Understand API

↓

Model Contracts

↓

Describe Operations

↓

Define Schemas

↓

Document Behavior

↓

Validate Specification

↓

Automate

↓

Approve

The OpenAPI specification is the contract.

Implementation follows the contract.

---

# Primary Objective

Every OpenAPI specification should answer one question.

"Can another engineering team build a complete client without reading the source code?"

If the answer is uncertain,

the specification is incomplete.

---

# OpenAPI Principles

Every specification should maximize

Accuracy

↓

Consistency

↓

Completeness

↓

Readability

↓

Automation

↓

Validation

↓

Discoverability

↓

Developer Experience

Documentation should eliminate assumptions.

---

# OpenAPI Workflow

Understand API

↓

Identify Endpoints

↓

Define Schemas

↓

Describe Requests

↓

Describe Responses

↓

Document Errors

↓

Validate Specification

↓

Approve

---

# Stage 1 — API Understanding

Before documenting determine

What business problem does the API solve?

↓

Who consumes the API?

↓

Which authentication model exists?

↓

Which resources exist?

↓

Which operations are supported?

Documentation begins with understanding.

---

# Stage 2 — API Metadata

Every specification should define

Title

Description

Version

Contact

License

Terms of Service

External Documentation

Metadata improves discoverability.

---

# Stage 3 — Server Definitions

Document

Development

Staging

Production

Regional servers

Environment variables

Servers should clearly identify deployment environments.

---

# Stage 4 — Path Definitions

Every endpoint should include

Summary

Description

Operation ID

Tags

Parameters

Request Body

Responses

Security

Each endpoint should describe one capability.

---

# Stage 5 — HTTP Operations

Document

GET

POST

PUT

PATCH

DELETE

OPTIONS

HEAD

TRACE

Method semantics should match implementation.

---

# Stage 6 — Parameters

Document

Path Parameters

Query Parameters

Header Parameters

Cookie Parameters

Specify

Type

Required

Description

Examples

Validation Rules

Parameters should never be ambiguous.

---

# Stage 7 — Request Body

Define

Content Type

Schema

Examples

Required Fields

Optional Fields

Validation Rules

Request contracts should be explicit.

---

# Stage 8 — Response Design

Every response should include

Status Code

Description

Schema

Headers

Examples

Response contracts should remain consistent.

---

# Stage 9 — Schema Design

Schemas should define

Objects

Arrays

Enums

Scalars

References

Constraints

Defaults

Examples

Schemas represent the API language.

---

# Stage 10 — Reusable Components

Reuse

Schemas

Responses

Parameters

Headers

Security Schemes

Examples

Request Bodies

Links

Avoid duplication.

Reuse improves maintainability.

---

# Stage 11 — Authentication

Document

Bearer Tokens

OAuth2

JWT

API Keys

Basic Authentication

Mutual TLS

Authentication should be fully described.

---

# Stage 12 — Security Schemes

Specify

Scopes

Permissions

Authorization Flow

Protected Endpoints

Token Format

Security documentation should remove uncertainty.

---

# Stage 13 — Error Documentation

Document

400

401

403

404

409

422

429

500

503

Errors are part of the public contract.

---

# Stage 14 — Examples

Provide

Valid Requests

Valid Responses

Error Examples

Authentication Examples

Pagination Examples

Examples reduce implementation mistakes.

---

# Stage 15 — Validation Rules

Document

Minimum

Maximum

Pattern

Length

Enum Values

Formats

Nullable

Validation should exist in the specification.

---

# Stage 16 — Versioning

Document

API Version

Deprecated Endpoints

Migration Notes

Breaking Changes

Compatibility

Consumers should understand API evolution.

---

# Stage 17 — Tags

Group endpoints logically.

Examples

Users

Authentication

Payments

Orders

Analytics

Notifications

Tags improve navigation.

---

# Stage 18 — Automation

Support

SDK Generation

Mock Servers

API Testing

Validation

Documentation

Contract Testing

The specification should enable automation.

---

# Stage 19 — Specification Validation

Verify

Schema correctness

Broken references

Missing descriptions

Invalid examples

Duplicate operation IDs

Unused components

Invalid specifications reduce trust.

---

# Stage 20 — Documentation Quality

Review

Completeness

Consistency

Readability

Accuracy

Examples

Naming

Developer Experience

Documentation should answer questions before they are asked.

---

# OpenAPI Quality Attributes

Evaluate

Correctness

Completeness

Consistency

Automation

Maintainability

Readability

Scalability

Security

Developer Experience

---

# OpenAPI Questions

Before approval ask

Can another team implement a client?

↓

Are all requests documented?

↓

Are all responses documented?

↓

Are schemas reusable?

↓

Are examples complete?

↓

Does documentation match implementation?

↓

Would this specification support automatic SDK generation?

---

# Severity Levels

Critical

Broken specification

Missing authentication

Invalid schemas

Broken references

Major

Incomplete endpoints

Missing responses

Missing validation

Weak documentation

Medium

Naming inconsistencies

Poor examples

Missing descriptions

Minor

Formatting

Metadata improvements

Tag organization

Suggestion

Future documentation improvements

Automation enhancements

---

# OpenAPI Checklist

✓ Metadata complete

✓ Servers documented

✓ Endpoints documented

✓ Parameters documented

✓ Request bodies defined

✓ Responses documented

✓ Schemas reusable

✓ Authentication documented

✓ Security schemes complete

✓ Error responses documented

✓ Examples included

✓ Specification validated

✓ Versioning documented

✓ Automation supported

✓ Developer-friendly documentation

---

# Anti-Patterns

Avoid

Incomplete schemas

Missing examples

Undocumented errors

Duplicated schemas

Broken references

Generic object definitions

Missing descriptions

Implementation-specific documentation

Outdated specifications

Specification drift

Treating documentation as optional

---

# Definition of Done

OpenAPI review is complete when

- Every endpoint is accurately documented.
- Request and response schemas match implementation.
- Authentication and security requirements are fully described.
- Validation rules are explicitly defined.
- Examples demonstrate real usage.
- Components are reusable and consistent.
- The specification passes automated validation.
- Documentation enables SDK generation, testing, and client implementation.
- The specification evolves alongside the API without drift.
- The OpenAPI document serves as the definitive, trustworthy contract between API providers and consumers.

An exceptional OpenAPI specification is not judged by its size.

It is judged by how completely it removes uncertainty, enables automation, and allows developers to integrate with confidence.