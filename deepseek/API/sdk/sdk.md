---
targetModels:
  - "DeepSeek V4"
  - "DeepSeek V3.2"
  - "DeepSeek R1"
  - "DeepSeek V3 Family"
  - "Future DeepSeek Models"
version: "1.0.0"


---

# sdk.md

Version: 1.0.0

Target Models

- DeepSeek V4
- DeepSeek V3.2
- DeepSeek R1
- DeepSeek V3 Family
- Future DeepSeek Models

---

# Purpose

This document defines how DeepSeek should design, review, generate, document, and maintain Software Development Kits (SDKs).

An SDK is not merely a wrapper around HTTP requests.

An SDK is the developer-facing interface of an API.

Its purpose is to make integrations intuitive, type-safe, reliable, and productive while hiding protocol complexity and implementation details.

The objective is to build SDKs that feel native to each programming language while remaining consistent with the underlying API.

Developers should think about solving business problems—not HTTP requests.

---

# Core Philosophy

Understand API

↓

Understand Developers

↓

Design SDK Interface

↓

Simplify Integration

↓

Hide Complexity

↓

Maintain Consistency

↓

Validate Experience

↓

Approve

Great SDKs expose capabilities.

They hide implementation.

---

# Primary Objective

Every SDK should answer one question.

"Can a developer become productive within minutes without reading the API implementation?"

If the answer is uncertain,

the SDK requires improvement.

---

# SDK Principles

Every SDK should maximize

Developer Experience

↓

Consistency

↓

Reliability

↓

Type Safety

↓

Maintainability

↓

Performance

↓

Security

↓

Discoverability

The SDK should feel natural in its language ecosystem.

---

# SDK Workflow

Understand API

↓

Model Resources

↓

Design Interfaces

↓

Handle Errors

↓

Implement Authentication

↓

Optimize Performance

↓

Validate Usability

↓

Approve

---

# Stage 1 — API Understanding

Before building determine

Available resources

↓

Authentication methods

↓

Operations

↓

Response structures

↓

Error models

↓

Rate limits

The SDK should reflect the API.

Not reinterpret it.

---

# Stage 2 — Language Design

Respect language conventions.

Examples

Python

snake_case

JavaScript

camelCase

Java

PascalCase Classes

Go

Idiomatic Go

Rust

Ownership patterns

Swift

Protocol-oriented APIs

An SDK should feel native.

Never translated.

---

# Stage 3 — Client Design

Provide a central client.

Examples

ApiClient

PaymentClient

StorageClient

UserClient

The client should manage

Authentication

Configuration

Retries

Connections

Timeouts

Logging

---

# Stage 4 — Resource Organization

Group functionality logically.

Example

client.users

client.projects

client.payments

client.analytics

client.storage

Avoid exposing hundreds of flat methods.

---

# Stage 5 — Authentication

Support

Bearer Tokens

OAuth

JWT

API Keys

Refresh Tokens

Mutual TLS

Authentication should require minimal setup.

---

# Stage 6 — Configuration

Allow developers to configure

Base URL

Timeout

Retries

Headers

User Agent

Proxy

Logging

Configuration should remain centralized.

---

# Stage 7 — Request Execution

Every request should support

Validation

Serialization

Compression

Retries

Timeouts

Cancellation

Connection reuse

Requests should remain predictable.

---

# Stage 8 — Response Handling

Return

Strong types

Collections

Metadata

Pagination helpers

Streaming support

Avoid exposing raw HTTP unless explicitly requested.

---

# Stage 9 — Error Handling

Provide structured errors.

Include

Status Code

Error Code

Message

Details

Request ID

Recovery information

Errors should be actionable.

---

# Stage 10 — Type Safety

Prefer

Strong models

Enums

Typed responses

Typed requests

Validation

Avoid

Generic dictionaries

Dynamic objects

Unchecked values

Type safety improves developer confidence.

---

# Stage 11 — Pagination Helpers

Support

Automatic iteration

Cursor navigation

Page navigation

Collection helpers

Developers should not manually implement pagination.

---

# Stage 12 — Retry Strategy

Implement configurable retries.

Review

Retryable errors

Exponential backoff

Timeouts

Circuit breakers

Idempotent requests

Retries should improve reliability.

---

# Stage 13 — Performance

Review

Connection pooling

Compression

Streaming

Caching

Serialization

Lazy loading

Performance should improve without sacrificing simplicity.

---

# Stage 14 — Security

Review

Secret storage

TLS

Certificate validation

Sensitive logging

Token rotation

Secure defaults

Security should be automatic whenever possible.

---

# Stage 15 — Async Support

When appropriate support

Async APIs

Awaitable operations

Streaming

Cancellation

Concurrency

Modern SDKs should embrace asynchronous programming.

---

# Stage 16 — Documentation

Every SDK should provide

Quick Start

Installation

Authentication

Examples

Common Workflows

Error Handling

Configuration

API Reference

Developers should succeed quickly.

---

# Stage 17 — Examples

Provide examples for

Authentication

CRUD

Pagination

Filtering

Sorting

Uploads

Downloads

Streaming

Webhooks

Examples teach faster than documentation.

---

# Stage 18 — Testing

Review

Unit tests

Integration tests

Mock APIs

Contract tests

Regression tests

Every public feature should be tested.

---

# Stage 19 — Versioning

Support

Semantic Versioning

Backward Compatibility

Deprecation

Migration Guides

Release Notes

SDK versions should align with API evolution.

---

# Stage 20 — Developer Experience

Evaluate

Ease of installation

Ease of configuration

Readability

Discoverability

IDE autocomplete

Error clarity

Documentation quality

The SDK should reduce development time.

---

# SDK Quality Attributes

Evaluate

Correctness

Reliability

Performance

Security

Maintainability

Scalability

Usability

Developer Experience

---

# SDK Questions

Before approval ask

Can a new developer integrate within minutes?

↓

Does the SDK hide protocol complexity?

↓

Are errors actionable?

↓

Does the SDK feel native to the language?

↓

Can developers discover features through autocomplete?

↓

Will the SDK remain maintainable as the API evolves?

↓

Would another engineering team recommend using this SDK?

---

# Severity Levels

Critical

Broken authentication

Incorrect request generation

Data corruption

Security vulnerability

Major

Poor API design

Weak typing

Missing retries

Incomplete documentation

Medium

Naming inconsistencies

Performance improvements

Missing helpers

Minor

Examples

Formatting

Documentation improvements

Suggestion

Future language features

Developer tooling enhancements

---

# SDK Checklist

✓ Native language conventions

✓ Centralized client

✓ Authentication implemented

✓ Configuration centralized

✓ Strong typing

✓ Structured errors

✓ Pagination helpers

✓ Retry support

✓ Async support

✓ Performance optimized

✓ Security reviewed

✓ Documentation complete

✓ Examples included

✓ Testing completed

✓ Versioning strategy defined

---

# Anti-Patterns

Avoid

Exposing raw HTTP everywhere

Weak typing

Hidden network calls

Hardcoded configuration

Inconsistent naming

Leaking transport details

Ignoring language conventions

Poor error messages

Missing documentation

No retry support

SDKs that mirror REST endpoints without abstraction

Breaking compatibility unnecessarily

---

# Definition of Done

SDK review is complete when

- The SDK provides an intuitive, language-native developer experience.
- Authentication, configuration, and request execution are simple and consistent.
- Strong typing improves correctness and IDE support.
- Errors are structured, actionable, and easy to diagnose.
- Performance features such as retries, connection reuse, and async execution are implemented where appropriate.
- Documentation and examples enable rapid onboarding.
- Testing validates every public capability.
- Versioning supports long-term compatibility with the underlying API.
- The SDK hides implementation complexity while exposing business capabilities clearly.
- Developers can integrate with the API efficiently, confidently, and with minimal boilerplate.

Exceptional SDKs are rarely praised for their implementation.

They are praised because developers stop thinking about the API and focus entirely on building great software.