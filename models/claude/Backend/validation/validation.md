# validation.md

Version: 1.0.0

Target Models

- Claude 5 Family
- Claude 4.8
- Claude 4.7
- Claude 4.x Family
- Future Claude Models

---

# Purpose

This document defines how Claude should design, implement, review, and maintain validation systems for backend applications.

Validation is not simply checking whether input exists.

Validation is the process of ensuring that every piece of incoming data is correct, complete, safe, meaningful, and consistent with business rules before entering the application.

The objective is to reject invalid data as early as possible while maintaining security, reliability, consistency, and developer experience.

Invalid data should never enter the business layer.

---

# Core Philosophy

Receive Input

↓

Validate Structure

↓

Validate Types

↓

Validate Business Rules

↓

Sanitize Data

↓

Reject Invalid Input

↓

Pass Trusted Data

↓

Approve

Trust data only after validation.

Never before.

---

# Primary Objective

Every validation system should answer one question.

"Can invalid, malicious, incomplete, or inconsistent data be prevented from entering the application?"

If the answer is uncertain,

the validation strategy requires improvement.

---

# Validation Principles

Every implementation should maximize

Correctness

↓

Security

↓

Consistency

↓

Reliability

↓

Maintainability

↓

Developer Experience

↓

User Experience

Validation should fail fast.

Not fail later.

---

# Validation Workflow

Receive Request

↓

Validate Schema

↓

Validate Types

↓

Validate Format

↓

Validate Business Rules

↓

Sanitize Data

↓

Reject or Continue

↓

Approve

---

# Stage 1 — Input Identification

Identify every input source.

Examples

Request Body

Query Parameters

Route Parameters

Headers

Cookies

Files

Environment Variables

CLI Arguments

Webhooks

Every external input must be validated.

---

# Stage 2 — Schema Validation

Define explicit schemas.

Review

Required fields

↓

Optional fields

↓

Default values

↓

Nested objects

↓

Arrays

↓

Enums

Schemas define the contract.

---

# Stage 3 — Type Validation

Validate

String

Number

Boolean

Date

Object

Array

Enum

Nullability

Never rely on implicit type conversion.

---

# Stage 4 — Format Validation

Validate formats.

Examples

Email

Phone

UUID

URL

Slug

Date

ISO Timestamp

JWT

Country Code

Postal Code

IP Address

Formats should follow accepted standards.

---

# Stage 5 — Length Validation

Review

Minimum length

Maximum length

Array size

Object depth

File size

Text size

Limits protect both users and systems.

---

# Stage 6 — Range Validation

Validate

Age

Price

Quantity

Rating

Score

Coordinates

Dates

Ranges should match business requirements.

---

# Stage 7 — Enum Validation

Restrict values.

Examples

Status

Role

Priority

Category

Country

Payment Method

Only accept supported values.

---

# Stage 8 — Business Validation

Validate business rules.

Examples

Email uniqueness

↓

Stock availability

↓

Subscription status

↓

Organization membership

↓

Account ownership

↓

Balance limits

Business validation belongs after schema validation.

---

# Stage 9 — Cross-Field Validation

Review relationships.

Examples

Start Date < End Date

Password = Confirm Password

Country matches Postal Code

Currency matches Region

Plan supports Feature

Validation should understand relationships.

---

# Stage 10 — Sanitization

Sanitize

Whitespace

↓

HTML

↓

Scripts

↓

Unicode

↓

Encoding

↓

Unexpected characters

Sanitize after validation.

Never replace validation.

---

# Stage 11 — File Validation

Review

File type

↓

Extension

↓

MIME type

↓

File size

↓

Virus scanning

↓

Image dimensions

↓

Filename

Files should never be trusted.

---

# Stage 12 — Security Validation

Protect against

SQL Injection

NoSQL Injection

Command Injection

XSS

Template Injection

Path Traversal

Prototype Pollution

Validation is the first security layer.

---

# Stage 13 — API Validation

Validate

Headers

↓

Authentication

↓

Authorization

↓

Request body

↓

Query parameters

↓

Path parameters

↓

Content type

Every API request requires validation.

---

# Stage 14 — Error Messages

Errors should

Be clear

↓

Be actionable

↓

Remain consistent

↓

Avoid sensitive details

↓

Support debugging

Developers should immediately understand validation failures.

---

# Stage 15 — Performance

Review

Validation cost

↓

Large payloads

↓

Streaming

↓

Caching

↓

Nested structures

↓

Memory usage

Validation should remain efficient.

---

# Stage 16 — Reusability

Validation rules should be

Reusable

↓

Composable

↓

Modular

↓

Independent

↓

Testable

Avoid duplicated validation logic.

---

# Stage 17 — Testing

Verify

Valid input

↓

Invalid input

↓

Boundary values

↓

Missing fields

↓

Large payloads

↓

Unexpected values

↓

Security attacks

Validation requires extensive negative testing.

---

# Stage 18 — Documentation

Document

Required fields

↓

Optional fields

↓

Allowed values

↓

Formats

↓

Limits

↓

Examples

↓

Validation errors

Documentation reduces integration mistakes.

---

# Stage 19 — Monitoring

Track

Validation failures

↓

Common mistakes

↓

Abuse patterns

↓

Unexpected inputs

↓

Performance impact

Monitoring improves validation over time.

---

# Stage 20 — Continuous Improvement

Review

Business rules

↓

Security threats

↓

Validation libraries

↓

Developer feedback

↓

Production incidents

↓

Schema evolution

Validation should evolve with the application.

---

# Validation Quality Attributes

Evaluate

Correctness

Security

Reliability

Consistency

Maintainability

Performance

Scalability

Developer Experience

---

# Validation Questions

Before approval ask

Can every external input be validated?

↓

Can malicious input bypass validation?

↓

Are business rules enforced separately from schema rules?

↓

Can invalid data reach business logic?

↓

Are validation errors helpful?

↓

Can validation rules be reused?

↓

Would another engineer trust this validation system?

---

# Severity Levels

Critical

Validation bypass

Injection vulnerability

Invalid business state

Missing required validation

Major

Weak schemas

Poor sanitization

Inconsistent validation

Weak error handling

Medium

Documentation improvements

Performance optimizations

Rule simplification

Minor

Formatting

Examples

Naming improvements

Future validation enhancements

---

# Validation Checklist

✓ All inputs identified

✓ Schema validation implemented

✓ Type validation complete

✓ Format validation implemented

✓ Length limits defined

✓ Range validation reviewed

✓ Enum validation implemented

✓ Business rules validated

✓ Cross-field validation implemented

✓ File validation reviewed

✓ Security validation completed

✓ Error responses standardized

✓ Validation reusable

✓ Testing completed

✓ Documentation complete

---

# Anti-Patterns

Avoid

Trusting client input

Implicit type conversion

Duplicated validation

Business logic inside schemas

Skipping file validation

Weak sanitization

Silent validation failures

Returning sensitive error details

Validating only frontend input

Scattered validation rules

Ignoring boundary conditions

Overly permissive schemas

---

# Definition of Done

Validation review is complete when

- Every external input is validated before reaching application logic.
- Schema, type, format, range, and business validations are clearly separated and consistently enforced.
- Invalid or malicious data is rejected immediately with clear, standardized error messages.
- Sanitization complements validation without replacing it.
- Security validation protects against common injection and input-based attacks.
- Validation rules remain reusable, testable, and easy to maintain.
- Documentation accurately describes validation requirements and error responses.
- Comprehensive testing covers valid, invalid, boundary, and malicious inputs.
- Monitoring provides visibility into validation failures and evolving attack patterns.
- The application processes only trusted, validated data throughout its lifecycle.

Exceptional validation systems are invisible.

Correct data flows effortlessly, invalid data never reaches business logic, attackers encounter multiple defensive layers, and developers can confidently build on a foundation of trusted input.