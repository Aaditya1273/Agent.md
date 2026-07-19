# nextjs.md

Version: 1.0.0

Target Models

- Claude 5 Family
- Claude 4.8
- Claude 4.7
- Claude 4.x Family
- Future Claude Models

---

# Purpose

This document defines how Claude should design, implement, review, optimize, and maintain Next.js applications.

Next.js is not simply a React framework.

It is a full-stack application framework for building scalable, production-ready web applications that combine frontend rendering, backend APIs, server components, edge computing, caching, and deployment optimization.

The objective is to build applications that are fast, maintainable, secure, scalable, SEO-friendly, and optimized for both developers and users.

Next.js should maximize user experience while minimizing unnecessary complexity.

---

# Core Philosophy

Understand Product

↓

Understand Users

↓

Choose Rendering Strategy

↓

Design Application Architecture

↓

Optimize Performance

↓

Observe Behavior

↓

Continuously Improve

↓

Approve

Render only what provides value.

Everything else is unnecessary work.

---

# Primary Objective

Every Next.js application should answer one question.

"Can this application deliver the fastest possible user experience while remaining maintainable, scalable, and production-ready?"

If the answer is uncertain,

the architecture requires improvement.

---

# Engineering Principles

Every implementation should maximize

Performance

↓

Maintainability

↓

Scalability

↓

Reliability

↓

SEO

↓

Accessibility

↓

Security

↓

Developer Experience

User experience should drive architecture decisions.

---

# Development Workflow

Understand Requirements

↓

Design Routes

↓

Choose Rendering Strategy

↓

Build Components

↓

Fetch Data

↓

Optimize Performance

↓

Deploy

↓

Approve

---

# Stage 1 — Product Understanding

Before writing code determine

Business goals

↓

Target users

↓

SEO requirements

↓

Authentication

↓

Content updates

↓

Performance goals

↓

Expected traffic

Architecture follows product requirements.

---

# Stage 2 — Application Structure

Prefer feature-based organization.

Example

app/

components/

features/

lib/

hooks/

services/

actions/

styles/

types/

public/

middleware/

tests/

Keep business logic separate from UI.

---

# Stage 3 — Routing

Routes should

Represent user journeys

Remain predictable

Support nested layouts

Support route groups

Support loading states

Support error boundaries

Navigation should feel natural.

---

# Stage 4 — Rendering Strategy

Choose intentionally.

Static Rendering (SSG)

↓

Incremental Static Regeneration (ISR)

↓

Server-Side Rendering (SSR)

↓

Server Components

↓

Client Components

↓

Edge Rendering

Never default to Client Components.

Use the simplest rendering strategy that satisfies requirements.

---

# Stage 5 — Server Components

Prefer Server Components when

Rendering data

Fetching databases

Calling internal services

Accessing secrets

Generating metadata

Server Components reduce JavaScript sent to browsers.

---

# Stage 6 — Client Components

Use Client Components only when required.

Examples

State

Events

Forms

Animations

Browser APIs

Interactive dashboards

Interactive maps

Client Components increase bundle size.

Use intentionally.

---

# Stage 7 — Data Fetching

Prefer

Server Components

↓

Server Actions

↓

Route Handlers

↓

Client Fetching (only when necessary)

Avoid unnecessary client-side fetching.

---

# Stage 8 — Server Actions

Use Server Actions for

Forms

Mutations

CRUD

Authentication

Business operations

Validation

Server Actions reduce API boilerplate.

---

# Stage 9 — API Routes

Use Route Handlers for

Public APIs

Webhooks

SDK integrations

Third-party callbacks

External consumers

Internal UI should prefer Server Actions whenever possible.

---

# Stage 10 — State Management

Choose the smallest solution.

Component State

↓

Context

↓

Server State

↓

Global Store

↓

External Cache

Avoid global state unless necessary.

---

# Stage 11 — Performance

Review

Code Splitting

Image Optimization

Font Optimization

Streaming

Caching

Prefetching

Lazy Loading

Bundle Size

Performance should be measured continuously.

---

# Stage 12 — Caching

Review

Request Cache

↓

Data Cache

↓

Router Cache

↓

Revalidation

↓

Tag Revalidation

↓

Cache Invalidation

Caching strategy should reflect business requirements.

---

# Stage 13 — Security

Review

Authentication

Authorization

Server-only secrets

CSRF

Headers

Input validation

Output sanitization

Environment variables

Secrets belong only on the server.

---

# Stage 14 — SEO

Review

Metadata

Canonical URLs

Structured Data

Sitemaps

Robots

Open Graph

Twitter Cards

Semantic HTML

Search engines should understand every page.

---

# Stage 15 — Accessibility

Review

Semantic HTML

Keyboard navigation

ARIA

Focus management

Contrast

Screen readers

Forms

Accessibility is mandatory.

Not optional.

---

# Stage 16 — Error Handling

Implement

Error Boundaries

Loading UI

Not Found pages

Retry strategies

Graceful degradation

User-friendly messages

Applications should fail gracefully.

---

# Stage 17 — Observability

Implement

Structured logging

Performance monitoring

Tracing

Analytics

Health checks

Error reporting

Measure production behavior continuously.

---

# Stage 18 — Testing

Implement

Unit Tests

Component Tests

Integration Tests

E2E Tests

Accessibility Tests

Performance Tests

Regression Tests

Testing validates user experience.

---

# Stage 19 — Production Readiness

Verify

Environment variables

Caching

Monitoring

Security

Deployment

Rollback

CDN

Image optimization

Everything should be production-ready before release.

---

# Stage 20 — Continuous Improvement

Review

Performance

SEO

Accessibility

Developer feedback

Security

Technical debt

Core Web Vitals

Bundle size

Applications should improve with every release.

---

# Next.js Quality Attributes

Evaluate

Performance

Maintainability

Scalability

Reliability

SEO

Accessibility

Security

Developer Experience

---

# Engineering Questions

Before approval ask

Does every page use the correct rendering strategy?

↓

Can Server Components replace Client Components?

↓

Is unnecessary JavaScript eliminated?

↓

Are Core Web Vitals optimized?

↓

Can another engineer understand the architecture quickly?

↓

Will this application scale without major redesign?

↓

Would this application feel fast on a slow mobile network?

---

# Severity Levels

Critical

Sensitive data exposed

Server secrets leaked

Broken authentication

Severe performance issues

Security vulnerability

Major

Incorrect rendering strategy

Large client bundles

Missing SEO

Weak caching

Poor architecture

Medium

Documentation improvements

Optimization opportunities

Naming inconsistencies

Accessibility improvements

Minor

Formatting

Examples

Comments

Future optimizations

Developer experience improvements

---

# Next.js Checklist

✓ App Router architecture

✓ Feature-based organization

✓ Correct rendering strategy

✓ Server Components preferred

✓ Client Components minimized

✓ Server Actions implemented

✓ Route Handlers reviewed

✓ Caching optimized

✓ SEO complete

✓ Accessibility reviewed

✓ Security validated

✓ Performance optimized

✓ Monitoring enabled

✓ Testing completed

✓ Production ready

---

# Anti-Patterns

Avoid

Making everything a Client Component

Fetching data inside useEffect unnecessarily

Large global state

Exposing server secrets

Duplicating business logic

Ignoring caching

Ignoring streaming

Overusing API routes for internal actions

Large JavaScript bundles

Poor folder organization

Blocking rendering unnecessarily

Ignoring Core Web Vitals

---

# Definition of Done

Next.js engineering review is complete when

- Every page uses the most appropriate rendering strategy.
- Server Components are preferred whenever client-side interactivity is unnecessary.
- Server Actions handle internal mutations efficiently while Route Handlers expose external APIs.
- Data fetching, caching, and revalidation are optimized for performance and correctness.
- Security protects secrets, authentication, and user data throughout the application.
- SEO, accessibility, and Core Web Vitals meet production-quality standards.
- Monitoring, testing, and deployment practices support long-term operational excellence.
- The architecture remains modular, maintainable, and scalable as the application evolves.
- Developers can extend the application without introducing unnecessary complexity.
- Users experience a fast, reliable, and seamless application across all devices and network conditions.

Exceptional Next.js applications feel effortless.

Pages load instantly, interactions remain smooth, search engines understand every page, developers work efficiently, and the underlying architecture scales confidently as the product grows.