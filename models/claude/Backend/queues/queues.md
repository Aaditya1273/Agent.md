# queues.md

Version: 1.0.0

Target Models

- Claude 5 Family
- Claude 4.8
- Claude 4.7
- Claude 4.x Family
- Future Claude Models

---

# Purpose

This document defines how Claude should design, implement, review, optimize, and maintain Queue systems.

Queues are not simply lists of tasks.

Queues are distributed coordination mechanisms that decouple producers from consumers, smooth traffic spikes, improve scalability, increase reliability, and enable asynchronous processing across services.

The objective is to build queue architectures that remain reliable, fault-tolerant, scalable, observable, and capable of processing millions of tasks efficiently under production workloads.

Queues absorb pressure.

Workers perform work.

---

# Core Philosophy

Produce Work

↓

Persist Message

↓

Queue Message

↓

Dispatch Worker

↓

Process Task

↓

Acknowledge Result

↓

Observe System

↓

Approve

Queues exist to decouple systems.

Not to hide slow code.

---

# Primary Objective

Every queue implementation should answer one question.

"Can work continue reliably despite traffic spikes, service failures, infrastructure restarts, and increasing scale?"

If the answer is uncertain,

the queue architecture requires improvement.

---

# Queue Principles

Every implementation should maximize

Reliability

↓

Durability

↓

Scalability

↓

Fault Tolerance

↓

Ordering

↓

Observability

↓

Maintainability

↓

Developer Experience

Queues should increase resilience.

Never introduce hidden complexity.

---

# Queue Workflow

Create Task

↓

Validate Payload

↓

Persist Message

↓

Enqueue

↓

Dispatch Worker

↓

Process

↓

Acknowledge

↓

Approve

---

# Stage 1 — Queue Identification

Queues should be used for

Background jobs

↓

Email delivery

↓

Notifications

↓

Media processing

↓

Report generation

↓

AI processing

↓

Webhook delivery

↓

Large imports

↓

Large exports

↓

Event processing

Do not use queues for synchronous business logic.

---

# Stage 2 — Queue Selection

Choose based on workload.

Examples

Redis Queue

RabbitMQ

Amazon SQS

Apache Kafka

Google Pub/Sub

Azure Service Bus

NATS

The queue technology should match business requirements.

---

# Stage 3 — Message Design

Messages should contain

Unique ID

↓

Correlation ID

↓

Minimal payload

↓

Timestamp

↓

Retry metadata

↓

Version

Never place unnecessary business objects inside messages.

---

# Stage 4 — Producer Design

Producers should

Validate input

↓

Persist business state

↓

Publish message

↓

Return immediately

Producers should never wait for processing.

---

# Stage 5 — Consumer Design

Consumers should

Receive message

↓

Validate message

↓

Execute business logic

↓

Persist result

↓

Acknowledge completion

Consumers should remain independent.

---

# Stage 6 — Delivery Guarantees

Understand delivery models.

At Most Once

↓

At Least Once

↓

Exactly Once (when supported)

Design systems assuming duplicate delivery is possible.

---

# Stage 7 — Idempotency

Every consumer should safely process duplicate messages.

Review

Duplicate delivery

↓

Worker restart

↓

Retry execution

↓

Network failures

↓

Partial completion

Duplicate processing should never create duplicate business operations.

---

# Stage 8 — Ordering

Review

FIFO

↓

Priority ordering

↓

Partition ordering

↓

Out-of-order processing

↓

Sequence guarantees

Ordering should match business requirements.

---

# Stage 9 — Retry Strategy

Retry only transient failures.

Examples

Network timeout

↓

Temporary database outage

↓

External API failure

↓

Rate limiting

Implement

Exponential backoff

↓

Retry limits

↓

Dead Letter Queue

Not every failure deserves another attempt.

---

# Stage 10 — Dead Letter Queue

Move permanently failed messages into

Dead Letter Queue (DLQ)

Review

Failure reason

↓

Retry count

↓

Manual recovery

↓

Replay capability

Never discard failed messages silently.

---

# Stage 11 — Acknowledgement

Messages should be acknowledged

Only after

Successful processing.

Incorrect

Receive

↓

Ack

↓

Process

Correct

Receive

↓

Process

↓

Persist

↓

Ack

Premature acknowledgement causes message loss.

---

# Stage 12 — Concurrency

Review

Worker count

↓

CPU usage

↓

Memory

↓

Database contention

↓

External API limits

Concurrency should improve throughput without creating instability.

---

# Stage 13 — Flow Control

Prevent overload using

Backpressure

↓

Rate limiting

↓

Queue depth monitoring

↓

Consumer scaling

↓

Priority queues

Queues should smooth traffic.

Not amplify it.

---

# Stage 14 — Scalability

Support

Horizontal scaling

↓

Multiple consumers

↓

Multiple producers

↓

Partitioning

↓

Distributed processing

↓

Regional deployment

Queues should scale independently of applications.

---

# Stage 15 — Observability

Monitor

Queue depth

↓

Consumer lag

↓

Processing rate

↓

Retry count

↓

Dead Letter Queue

↓

Worker health

↓

Latency

Every message should be observable.

---

# Stage 16 — Logging

Log

Message ID

↓

Correlation ID

↓

Queue name

↓

Consumer ID

↓

Execution duration

↓

Retry count

↓

Failure reason

Never log secrets.

---

# Stage 17 — Security

Review

Authentication

↓

Authorization

↓

Encrypted transport

↓

Encrypted payloads

↓

Access control

↓

Secret management

Queues are infrastructure.

Protect them accordingly.

---

# Stage 18 — Testing

Verify

Successful delivery

↓

Duplicate delivery

↓

Retry behavior

↓

Worker crashes

↓

Message ordering

↓

Dead Letter Queue

↓

Large traffic

↓

Disaster recovery

Queue systems should be tested under failure.

---

# Stage 19 — Documentation

Document

Queue purpose

↓

Message schema

↓

Retry policy

↓

Ordering guarantees

↓

Timeouts

↓

DLQ strategy

↓

Recovery procedures

Operators should understand every queue.

---

# Stage 20 — Continuous Improvement

Review

Queue growth

↓

Retry trends

↓

Infrastructure cost

↓

Worker efficiency

↓

Failure patterns

↓

Developer feedback

Queue architecture should evolve continuously.

---

# Queue Quality Attributes

Evaluate

Reliability

Durability

Performance

Scalability

Fault Tolerance

Maintainability

Observability

Developer Experience

---

# Queue Questions

Before approval ask

Can producers return immediately?

↓

Can consumers safely retry work?

↓

Can duplicate messages be processed safely?

↓

Can failed messages be recovered?

↓

Can the queue scale independently?

↓

Can operators observe queue health?

↓

Would another engineering team trust this queue architecture?

---

# Severity Levels

Critical

Message loss

Duplicate business operations

Acknowledgement before processing

Queue corruption

Data inconsistency

Major

Weak retry strategy

Missing DLQ

Poor monitoring

Performance bottlenecks

Medium

Documentation improvements

Optimization opportunities

Queue tuning

Minor

Examples

Naming improvements

Operational enhancements

Future scalability improvements

---

# Queue Checklist

✓ Queue required

✓ Queue technology selected

✓ Message schema defined

✓ Producers implemented

✓ Consumers implemented

✓ Delivery guarantees documented

✓ Idempotency ensured

✓ Retry strategy implemented

✓ Dead Letter Queue configured

✓ Safe acknowledgements

✓ Monitoring enabled

✓ Logging configured

✓ Security reviewed

✓ Testing completed

✓ Documentation complete

---

# Anti-Patterns

Avoid

Large message payloads

Business logic inside producers

Acknowledging before processing

Infinite retries

Ignoring duplicate delivery

Missing Dead Letter Queue

Blocking producers

Shared mutable state

Silent message loss

Hardcoded retry policies

Using queues for synchronous requests

Treating queues as databases

Ignoring queue growth

---

# Definition of Done

Queue review is complete when

- Producers publish work without waiting for execution.
- Messages remain small, versioned, and independently processable.
- Consumers process messages safely with idempotent behavior.
- Delivery guarantees are clearly understood and documented.
- Retry strategies distinguish between temporary and permanent failures.
- Failed messages are recoverable through Dead Letter Queues.
- Monitoring and logging provide complete visibility into queue health and processing.
- Queue infrastructure scales independently from producers and consumers.
- Documentation explains message schemas, retries, acknowledgements, and operational procedures.
- The queue architecture remains reliable despite traffic spikes, worker failures, infrastructure outages, and duplicate message delivery.

Exceptional queue systems are invisible.

Applications remain responsive, workers process tasks reliably, operators observe healthy pipelines, and the system continues delivering work correctly regardless of failures, scale, or traffic fluctuations.