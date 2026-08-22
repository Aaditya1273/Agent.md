---
targetModels:
  - "GPT-5.6"
  - "GPT-5.5"
  - "GPT-5.4"
  - "GPT-5 Family"
  - "Future GPT Models"
version: "1.0.0"


---

# performance-review.md

Version: 1.0.0

Target Models

- GPT-5.6
- GPT-5.5
- GPT-5.4
- GPT-5 Family
- Future GPT Models

---

# Purpose

This document defines the Performance Review methodology for software engineering.

Performance review is the systematic evaluation of an application's efficiency, scalability, responsiveness, and resource utilization.

Performance is not measured by isolated benchmarks.

It is measured by how efficiently the entire system delivers value under realistic workloads.

The objective is to maximize performance while preserving correctness, maintainability, security, and developer experience.

---

# Core Philosophy

Measure

↓

Analyze

↓

Identify Bottlenecks

↓

Optimize

↓

Measure Again

↓

Verify

↓

Approve

Never optimize assumptions.

Always optimize measured evidence.

---

# Primary Objective

Every performance review should answer one question.

"If user traffic increases by 10x tomorrow, will this implementation continue to perform reliably?"

If the answer is uncertain,

the system requires further optimization.

---

# Performance Principles

Every optimization should improve

Responsiveness

↓

Resource Efficiency

↓

Scalability

↓

Reliability

↓

Predictability

↓

User Experience

↓

Operational Stability

Performance should never reduce correctness.

---

# Review Workflow

Understand System

↓

Measure Current Performance

↓

Identify Bottlenecks

↓

Analyze Root Causes

↓

Evaluate Trade-offs

↓

Optimize

↓

Measure Again

↓

Approve

---

# Stage 1 — User Experience Performance

Review

Initial Load Time

First Contentful Paint

Largest Contentful Paint

Interaction Delay

Input Responsiveness

Smooth Animations

Navigation Speed

Users judge performance through perception.

Optimize perceived speed first.

---

# Stage 2 — Frontend Performance

Inspect

Rendering

Re-render frequency

State updates

Component hierarchy

Memoization

Virtualization

Image optimization

Font loading

Lazy loading

Code splitting

Every unnecessary render wastes resources.

---

# Stage 3 — Backend Performance

Review

API latency

Business logic

Concurrency

Thread utilization

Async processing

Serialization

Compression

Caching

Connection pooling

Backend throughput determines scalability.

---

# Stage 4 — Database Performance

Inspect

Query execution

Indexes

Joins

Transactions

Pagination

N+1 queries

Locks

Connection usage

Database optimization should begin with query analysis.

---

# Stage 5 — API Performance

Review

Response size

Latency

Compression

Caching

Pagination

Streaming

Batch requests

Retries

Timeouts

Every API should minimize unnecessary communication.

---

# Stage 6 — Memory Performance

Review

Memory allocation

Object lifetime

Garbage collection

Memory leaks

Caching strategy

Data duplication

Memory fragmentation

Stable memory usage improves long-term reliability.

---

# Stage 7 — CPU Performance

Inspect

Heavy calculations

Nested loops

Recursive operations

Sorting

Searching

Parsing

Data transformation

Background processing

Optimize expensive computation first.

---

# Stage 8 — Network Performance

Review

Duplicate requests

Request waterfalls

Compression

Caching

CDN usage

Prefetching

Preloading

Keep-alive connections

Network latency often dominates user experience.

---

# Stage 9 — Asset Performance

Inspect

Images

Fonts

Icons

Videos

JavaScript

CSS

Third-party assets

Unused assets

Every downloaded byte affects performance.

---

# Stage 10 — Caching Review

Verify

Browser cache

CDN cache

Application cache

Database cache

API cache

Object cache

Session cache

Caching should improve performance without sacrificing consistency.

---

# Stage 11 — Scalability Review

Evaluate

Horizontal scaling

Vertical scaling

Load balancing

Stateless services

Queue systems

Worker processes

Distributed caching

Performance should improve as infrastructure grows.

---

# Stage 12 — Concurrency Review

Review

Parallel execution

Thread safety

Async workflows

Task scheduling

Lock contention

Race conditions

Resource contention

Concurrency should increase throughput without reducing stability.

---

# Stage 13 — Resource Utilization

Inspect

CPU

Memory

Disk I/O

Network

GPU

Database connections

File descriptors

Unused resources are hidden performance costs.

---

# Stage 14 — Mobile Performance

Review

Slow devices

Low bandwidth

Battery usage

Touch responsiveness

Animation smoothness

Offline capability

Performance should remain acceptable on lower-end hardware.

---

# Stage 15 — Build Performance

Review

Compilation speed

Bundle generation

Incremental builds

Tree shaking

Dependency graph

Developer tooling

Developer productivity is also performance.

---

# Stage 16 — Third-Party Review

Inspect

External APIs

Analytics

Tracking

Fonts

Widgets

SDKs

Unused integrations

Third-party services should justify their performance cost.

---

# Stage 17 — Stress Review

Evaluate

High traffic

Large datasets

Concurrent users

Slow databases

Network failures

Resource exhaustion

Traffic spikes

Performance should remain predictable under stress.

---

# Stage 18 — Monitoring Review

Verify

Metrics

Tracing

Logging

Profiling

Alerts

Dashboards

Performance budgets

What cannot be measured cannot be improved.

---

# Stage 19 — Regression Review

Confirm

No new bottlenecks

No memory regressions

No rendering regressions

No query regressions

No bundle growth

No degraded UX

Optimization should not introduce new problems.

---

# Measurement Strategy

Measure

↓

Benchmark

↓

Profile

↓

Optimize

↓

Benchmark Again

↓

Compare Results

↓

Approve

Every optimization should have measurable improvement.

---

# Performance Metrics

Review

Response Time

Latency

Throughput

Memory Usage

CPU Usage

FPS

Bundle Size

Cache Hit Rate

Database Query Time

Network Requests

Error Rate

System Availability

Metrics should guide engineering decisions.

---

# Performance Questions

Before approval ask

Are bottlenecks measured?

↓

Can unnecessary work be removed?

↓

Can existing work be reused?

↓

Can data move more efficiently?

↓

Will this scale with growth?

↓

Would users perceive this as fast?

---

# Severity Levels

Critical

Application freezes

Memory leaks

Database bottlenecks

System instability

Major

Slow rendering

Large bundles

Heavy queries

Excessive API latency

Medium

Redundant rendering

Minor caching issues

Inefficient algorithms

Minor

Small optimizations

Asset cleanup

Documentation improvements

Suggestion

Future optimization

Architecture improvements

Infrastructure enhancements

---

# Performance Checklist

✓ Frontend optimized

✓ Backend optimized

✓ Database reviewed

✓ APIs efficient

✓ Memory usage acceptable

✓ CPU usage acceptable

✓ Network optimized

✓ Assets optimized

✓ Caching configured

✓ Scalability verified

✓ Monitoring enabled

✓ No performance regressions

---

# Anti-Patterns

Avoid

Premature optimization

Benchmark-free optimization

Micro-optimizations

Over-engineering

Duplicate rendering

N+1 queries

Blocking operations

Unbounded memory growth

Large synchronous work

Ignoring performance measurements

---

# Definition of Done

Performance review is complete when

- Bottlenecks have been identified through measurement.
- User experience remains responsive.
- Resource utilization is efficient.
- APIs and database interactions are optimized.
- Memory and CPU usage remain stable.
- Network communication is minimized.
- The application scales predictably.
- Monitoring supports continuous improvement.
- No regressions have been introduced.
- The implementation achieves the required performance while preserving maintainability, security, and correctness.

Performance is not about making software fast.

Performance is about delivering consistent, efficient, and reliable experiences under real-world conditions while maintaining long-term engineering quality.