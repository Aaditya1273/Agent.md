# background-jobs.md

Version: 1.0.0

Target Models

- Claude Fable 5
- Claude Opus 5
- Claude Sonnet 5
- Claude 5 Family
- Future Claude Models

---

# Purpose

This document defines how Claude should design, implement, review, optimize, and maintain Background Job systems.

Background Jobs are not simply asynchronous functions.

They are independent execution units that perform long-running, resource-intensive, scheduled, or non-blocking work outside the lifecycle of an HTTP request.

The objective is to build background processing systems that are reliable, scalable, fault-tolerant, observable, and capable of processing work efficiently without affecting application responsiveness.

HTTP requests should remain fast.

Heavy work belongs in background jobs.

---

# Core Philosophy

Receive Request

↓

Persist Business State

↓

Create Job

↓

Queue Job

↓

Execute Worker

↓

Handle Failures

↓

Observe Execution

↓

Approve

User-facing operations should never wait for long-running work.

---

# Primary Objective

Every background job system should answer one question.

"Can work continue reliably even if users disconnect, servers restart, workers fail, or traffic increases dramatically?"

If the answer is uncertain,

the job architecture requires improvement.

---

# Background Job Principles

Every implementation should maximize

Reliability

↓

Scalability

↓

Fault Tolerance

↓

Idempotency

↓

Observability

↓

Maintainability

↓

Developer Experience

Jobs should improve system responsiveness.

Never reduce reliability.

---

# Job Workflow

Receive Event

↓

Validate Request

↓

Persist Data

↓

Create Job

↓

Queue Job

↓

Process Job

↓

Record Result

↓

Approve

---

# Stage 1 — Job Identification

Move work into background jobs when it

Takes significant time

↓

Consumes high CPU

↓

Requires external APIs

↓

Processes files

↓

Generates reports

↓

Sends notifications

↓

Runs independently

Never use background jobs for immediate synchronous responses.

---

# Stage 2 — Job Classification

Examples

Email Sending

↓

PDF Generation

↓

Image Processing

↓

Video Encoding

↓

AI Processing

↓

Payment Reconciliation

↓

Webhook Delivery

↓

Report Generation

↓

Data Import

↓

Data Export

↓

Cache Warming

↓

Scheduled Cleanup

Only asynchronous work belongs here.

---

# Stage 3 — Job Payload

A job should contain only

Identifiers

↓

Minimal metadata

↓

Execution parameters

↓

Retry information

↓

Correlation ID

Avoid storing large objects inside jobs.

Store references instead.

---

# Stage 4 — Persistence

Business data should be committed

Before

creating background jobs.

Correct order

Persist Database

↓

Commit Transaction

↓

Create Job

↓

Worker Executes

Never enqueue work that depends on uncommitted data.

---

# Stage 5 — Job Scheduling

Support

Immediate execution

↓

Delayed jobs

↓

Scheduled jobs

↓

Recurring jobs

↓

Cron jobs

↓

Manual triggering

Scheduling should remain predictable.

---

# Stage 6 — Idempotency

Every job should safely execute multiple times.

Review

Duplicate execution

↓

Worker restart

↓

Network failures

↓

Retry behavior

↓

Partial completion

A repeated job should never create duplicate business effects.

---

# Stage 7 — Retry Strategy

Retry only recoverable failures.

Examples

Network timeout

↓

Temporary database outage

↓

Third-party API unavailable

↓

Rate limiting

Use

Exponential backoff

↓

Maximum attempts

↓

Dead Letter Queue

Not every failure should be retried.

---

# Stage 8 — Failure Handling

Handle

Permanent failures

↓

Retry exhaustion

↓

Poison jobs

↓

Invalid payloads

↓

Dependency failures

↓

Timeouts

Every failed job should be observable.

---

# Stage 9 — Timeouts

Define

Maximum execution time

↓

Soft timeout

↓

Hard timeout

↓

Cancellation

↓

Cleanup

Jobs should never execute forever.

---

# Stage 10 — Concurrency

Review

Worker count

↓

CPU usage

↓

Memory usage

↓

Database contention

↓

External API limits

Concurrency should improve throughput.

Not create instability.

---

# Stage 11 — Resource Management

Review

Memory

↓

Temporary files

↓

Database connections

↓

Network sockets

↓

Streams

↓

Locks

Release resources immediately after execution.

---

# Stage 12 — Priority

Support multiple priorities.

Examples

Critical

High

Normal

Low

Background

Urgent business operations should not wait behind maintenance tasks.

---

# Stage 13 — Observability

Monitor

Queue length

↓

Job latency

↓

Execution duration

↓

Failure rate

↓

Retry count

↓

Success rate

↓

Worker utilization

Every job should be measurable.

---

# Stage 14 — Logging

Log

Job ID

↓

Correlation ID

↓

Worker ID

↓

Execution time

↓

Retries

↓

Result

↓

Failure reason

Never log secrets or sensitive payloads.

---

# Stage 15 — Security

Review

Input validation

↓

Authorization

↓

Secrets

↓

Encrypted payloads

↓

Least privilege

↓

Dependency security

Workers should follow the same security standards as APIs.

---

# Stage 16 — Scalability

Support

Multiple workers

↓

Distributed queues

↓

Horizontal scaling

↓

Auto scaling

↓

Regional execution

Background processing should scale independently of web servers.

---

# Stage 17 — Monitoring

Track

Stuck jobs

↓

Dead jobs

↓

Slow jobs

↓

Queue growth

↓

Worker crashes

↓

Resource consumption

Monitoring prevents silent failures.

---

# Stage 18 — Testing

Verify

Successful execution

↓

Retry behavior

↓

Duplicate execution

↓

Failure handling

↓

Timeouts

↓

Concurrency

↓

Worker restart

↓

Load testing

Background systems require failure-focused testing.

---

# Stage 19 — Documentation

Document

Job purpose

↓

Payload

↓

Retry policy

↓

Timeout

↓

Priority

↓

Dependencies

↓

Expected behavior

↓

Failure recovery

Operations teams should understand every job.

---

# Stage 20 — Continuous Improvement

Review

Execution time

↓

Infrastructure cost

↓

Retry effectiveness

↓

Queue utilization

↓

Failure trends

↓

Business value

Background processing should continuously improve.

---

# Background Job Quality Attributes

Evaluate

Reliability

Performance

Scalability

Fault Tolerance

Observability

Maintainability

Security

Developer Experience

---

# Background Job Questions

Before approval ask

Can users continue immediately after job creation?

↓

Can duplicate execution occur safely?

↓

Can failures recover automatically?

↓

Can the system scale independently?

↓

Can operators observe every job?

↓

Can workers restart without losing work?

↓

Would another engineering team trust this background processing architecture?

---

# Severity Levels

Critical

Lost jobs

Duplicate business operations

Data corruption

Infinite retries

Unrecoverable failures

Major

Poor retry strategy

Weak monitoring

Missing idempotency

Resource leaks

Medium

Performance optimization

Documentation improvements

Priority tuning

Minor

Examples

Naming improvements

Operational enhancements

Future optimization

---

# Background Job Checklist

✓ Long-running work identified

✓ Jobs contain minimal payloads

✓ Database committed before enqueue

✓ Scheduling implemented

✓ Idempotency guaranteed

✓ Retry strategy defined

✓ Dead Letter Queue configured

✓ Timeouts implemented

✓ Priorities supported

✓ Logging enabled

✓ Monitoring configured

✓ Security reviewed

✓ Scalability validated

✓ Testing completed

✓ Documentation complete

---

# Anti-Patterns

Avoid

Executing long work inside HTTP requests

Large job payloads

Database transactions spanning job execution

Infinite retries

Retrying permanent failures

Ignoring idempotency

Blocking workers

Shared mutable state

Hardcoded retry policies

Missing monitoring

Silent failures

Jobs that depend on application memory

Workers performing unrelated responsibilities

---

# Definition of Done

Background job review is complete when

- Long-running and asynchronous operations are separated from request-response workflows.
- Jobs contain only the minimum information required for execution.
- Business data is committed before jobs are created.
- Workers process jobs safely with idempotent behavior.
- Retry strategies distinguish between temporary and permanent failures.
- Timeouts, priorities, and concurrency limits protect system stability.
- Monitoring, logging, and metrics provide complete visibility into execution.
- Background processing scales independently from web applications.
- Documentation clearly describes job behavior, payloads, retries, and operational procedures.
- The system continues processing work reliably despite failures, restarts, traffic spikes, or infrastructure changes.

Exceptional background job systems are almost invisible.

Users experience fast responses, engineers observe reliable processing, operators recover quickly from failures, and the platform continues executing critical work regardless of traffic, outages, or worker restarts.