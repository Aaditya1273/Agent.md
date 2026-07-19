# production-checklist.md

Version: 1.0.0

Target Models

- Claude 5 Family
- Claude 4.8
- Claude 4.7
- Claude 4.x Family
- Future Claude Models

---

# Purpose

This checklist defines the minimum quality requirements for declaring any software system production ready.

It applies to

- SaaS Platforms
- AI Applications
- APIs
- Backend Services
- Frontend Applications
- Mobile Applications
- Developer Tools
- Enterprise Systems
- Internal Platforms
- Open Source Projects

Production readiness is not determined by feature completion.

It is determined by reliability, security, maintainability, scalability, observability, operational maturity, and business readiness.

No item should be skipped because of deadlines.

---

# Core Principle

Production Ready

≠

Feature Complete

Production Ready

=

Reliable

+

Secure

+

Observable

+

Maintainable

+

Recoverable

+

Scalable

+

Documented

+

Supportable

---

# Checklist Workflow

Architecture

↓

Security

↓

Reliability

↓

Performance

↓

Observability

↓

Deployment

↓

Operations

↓

Business

↓

Approve

---

# 1. Product Validation

□ Problem clearly solved

□ Target users identified

□ Primary use cases validated

□ Scope finalized

□ Feature set approved

□ Critical workflows completed

□ Product goals documented

□ Success metrics defined

---

# 2. Architecture

□ Architecture reviewed

□ Components clearly separated

□ Low coupling

□ High cohesion

□ No unnecessary complexity

□ Dependencies justified

□ Failure boundaries defined

□ Scalability considered

---

# 3. Code Quality

□ Code review completed

□ No duplicated logic

□ Naming consistent

□ Modules organized

□ Dead code removed

□ TODOs reviewed

□ Technical debt documented

□ Coding standards followed

---

# 4. Security

□ Authentication reviewed

□ Authorization verified

□ Secrets protected

□ Input validation complete

□ Output sanitization complete

□ Rate limiting enabled

□ Encryption configured

□ Dependency vulnerabilities reviewed

□ Sensitive data protected

□ Security review completed

---

# 5. API Readiness

□ Stable contracts

□ Versioning strategy

□ Validation complete

□ Error responses standardized

□ Status codes correct

□ Documentation complete

□ Pagination implemented

□ Rate limiting configured

□ Authentication documented

---

# 6. Database

□ Schema finalized

□ Indexes optimized

□ Constraints verified

□ Migrations tested

□ Rollback available

□ Backup strategy defined

□ Restore tested

□ Data integrity verified

---

# 7. Reliability

□ Error handling complete

□ Retries implemented

□ Timeouts configured

□ Circuit breakers considered

□ Idempotency reviewed

□ Queue failures handled

□ Graceful degradation implemented

□ Single points of failure minimized

---

# 8. Performance

□ Response times acceptable

□ Queries optimized

□ Memory usage reviewed

□ CPU usage acceptable

□ Caching configured

□ Compression enabled

□ Static assets optimized

□ Load testing completed

---

# 9. Observability

□ Structured logging

□ Metrics collected

□ Tracing configured

□ Alerts configured

□ Dashboards available

□ Error tracking enabled

□ Health endpoints implemented

□ Incident visibility verified

---

# 10. Testing

□ Unit tests

□ Integration tests

□ End-to-end tests

□ Regression tests

□ Security tests

□ Performance tests

□ Critical paths verified

□ Test coverage acceptable

---

# 11. Deployment

□ CI successful

□ CD verified

□ Rollback available

□ Environment variables verified

□ Infrastructure validated

□ Deployment documented

□ Smoke tests automated

□ Production deployment rehearsed

---

# 12. Operations

□ Monitoring active

□ Alerts routed

□ On-call defined

□ Runbooks documented

□ Incident response prepared

□ Recovery procedures tested

□ Maintenance procedures documented

---

# 13. AI Systems (If Applicable)

□ Prompts reviewed

□ Context validated

□ Tool usage verified

□ Hallucination mitigation reviewed

□ Safety checks implemented

□ Model failures handled

□ Cost monitoring enabled

□ Fallback behavior defined

---

# 14. Documentation

□ README updated

□ Architecture documented

□ API documented

□ Deployment documented

□ Configuration documented

□ Operations documented

□ Troubleshooting documented

□ Changelog updated

---

# 15. Business Readiness

□ Pricing finalized

□ Analytics enabled

□ Legal requirements satisfied

□ Privacy policy reviewed

□ Terms reviewed

□ Customer support prepared

□ Marketing assets ready

□ Launch plan approved

---

# 16. Risk Assessment

□ High risks identified

□ Mitigation plans documented

□ Rollback strategy defined

□ Disaster recovery verified

□ Business continuity considered

□ Third-party dependencies reviewed

□ Capacity planning completed

---

# 17. Final Review

□ Architecture approved

□ Security approved

□ Performance approved

□ QA approved

□ Product approved

□ Operations approved

□ Documentation approved

□ Stakeholders approved

---

# Production Gates

A system MUST NOT be considered production ready if any of the following are true.

## Critical

☐ Authentication incomplete

☐ Authorization incomplete

☐ Secrets exposed

☐ Backups unavailable

☐ Rollback unavailable

☐ Monitoring missing

☐ Production configuration unverified

☐ Critical bugs unresolved

☐ Data integrity uncertain

☐ Recovery procedures untested

---

## High

☐ Documentation incomplete

☐ Error handling inconsistent

☐ Performance unverified

☐ Missing tests

☐ Missing alerts

☐ Deployment process undocumented

☐ Incident process undefined

---

## Medium

☐ Minor UI issues

☐ Non-critical technical debt

☐ Documentation improvements

☐ Future optimizations

---

# Definition of Production Ready

A system is production ready when

- Core functionality consistently delivers the intended business value under expected operating conditions.
- Architecture, security, performance, reliability, scalability, and maintainability have been independently reviewed and validated.
- All critical risks have documented mitigation or recovery procedures.
- Monitoring, logging, tracing, alerting, and operational runbooks provide complete production visibility.
- Deployment, rollback, backup, disaster recovery, and incident response procedures have been tested and documented.
- Customer-facing documentation, internal documentation, and operational documentation are complete and current.
- Business requirements including legal, privacy, analytics, support, pricing, and launch readiness have been satisfied.
- Known limitations are documented, accepted, and do not introduce unacceptable operational or business risk.
- Cross-functional stakeholders agree the system can be operated safely, maintained efficiently, and evolved without compromising reliability.
- The organization can confidently deploy, monitor, support, recover, and continuously improve the system throughout its lifecycle.

A production-ready system is not one with the most features.

It is one that can be trusted by customers, maintained by engineers, operated by the business, and evolved with confidence over time.