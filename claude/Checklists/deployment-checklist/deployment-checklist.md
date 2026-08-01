# deployment-checklist.md

Version: 1.0.0

Target Models

- Claude 5 Family
- Claude 4.8
- Claude 4.7
- Claude 4.x Family
- Future Claude Models

---

# Purpose

This checklist defines the minimum operational requirements for deploying software safely, consistently, and predictably into production environments.

It applies to

- SaaS Platforms
- AI Applications
- APIs
- Backend Services
- Frontend Applications
- Mobile Backends
- Enterprise Software
- Internal Platforms
- Cloud Infrastructure

Deployment is not uploading code.

Deployment is the controlled transition of software into a live environment while protecting users, data, infrastructure, and business continuity.

A deployment is successful only when customers experience uninterrupted service.

---

# Core Principle

Successful Deployment

=

Predictable

+

Repeatable

+

Observable

+

Recoverable

+

Low Risk

+

Verified

Every deployment should be reversible.

---

# Deployment Workflow

Planning

↓

Validation

↓

Build

↓

Infrastructure

↓

Deployment

↓

Verification

↓

Monitoring

↓

Approval

---

# 1. Deployment Planning

□ Deployment window approved

□ Stakeholders informed

□ Team availability confirmed

□ Responsibilities assigned

□ Risks identified

□ Rollback owner assigned

□ Maintenance window confirmed (if required)

□ Success criteria defined

---

# 2. Source Control

□ Correct branch selected

□ Latest code synchronized

□ Required reviews approved

□ Merge conflicts resolved

□ Release tag created

□ Version finalized

□ Changelog prepared

□ Commit history reviewed

---

# 3. Build Validation

□ Clean build completed

□ Dependency installation successful

□ Static analysis completed

□ Linting passed

□ Type checking passed

□ Artifact generated

□ Artifact integrity verified

□ Build reproducible

---

# 4. Testing Validation

□ Unit tests passed

□ Integration tests passed

□ End-to-end tests passed

□ Regression tests passed

□ Security tests passed

□ Performance validation completed

□ Critical workflows verified

□ Test reports reviewed

Deployment begins after validation.

Not before.

---

# 5. Infrastructure Readiness

□ Infrastructure healthy

□ Required resources available

□ Scaling verified

□ Network configuration reviewed

□ Storage available

□ DNS verified

□ Load balancer healthy

□ Required services operational

Infrastructure failures should never be discovered during deployment.

---

# 6. Environment Configuration

□ Environment variables verified

□ Secrets available

□ API keys validated

□ Certificates active

□ Feature flags reviewed

□ Configuration differences documented

□ Production values confirmed

□ Debug settings disabled

Configuration mistakes are among the most common deployment failures.

---

# 7. Database

□ Migration reviewed

□ Migration tested

□ Backup completed

□ Rollback migration available

□ Data integrity verified

□ Lock duration evaluated

□ Long-running queries reviewed

□ Migration owner assigned

Database changes require the highest caution.

---

# 8. External Dependencies

□ Third-party APIs operational

□ Authentication providers available

□ Payment providers healthy

□ Email services available

□ Storage providers operational

□ Queue systems healthy

□ Monitoring providers available

□ CDN operational

External failures should have graceful handling.

---

# 9. Deployment Strategy

Select the appropriate strategy.

Examples

Rolling Deployment

↓

Blue-Green Deployment

↓

Canary Deployment

↓

Shadow Deployment

↓

Feature Flags

↓

Progressive Rollout

↓

Phased Deployment

The deployment strategy should minimize customer risk.

---

# 10. Deployment Execution

□ Deployment initiated

□ Build artifact verified

□ Correct environment selected

□ Services updated

□ Containers healthy

□ Jobs completed

□ No deployment interruptions

□ Deployment logs reviewed

Every deployment should be observable.

---

# 11. Health Verification

Verify

□ Health endpoints

□ Service availability

□ Database connectivity

□ Authentication

□ API responses

□ Background workers

□ Scheduled jobs

□ External integrations

Healthy infrastructure does not guarantee healthy software.

---

# 12. Functional Verification

Validate

□ User login

□ Core workflows

□ Payments

□ Notifications

□ Search

□ API endpoints

□ Critical business flows

□ AI functionality (if applicable)

Users should verify the deployment.

Not only engineers.

---

# 13. Performance Validation

Review

□ Response times

□ Error rates

□ Memory usage

□ CPU usage

□ Network traffic

□ Database performance

□ Queue latency

□ Cache performance

Deployment should not reduce performance.

---

# 14. Observability

Confirm

□ Logs received

□ Metrics updating

□ Traces collected

□ Dashboards operational

□ Alerts active

□ Error tracking operational

□ Health monitoring enabled

□ Incident notifications functioning

If a deployment cannot be observed,

it cannot be trusted.

---

# 15. Security Verification

□ Authentication functioning

□ Authorization functioning

□ TLS verified

□ Secrets protected

□ Security headers active

□ Access permissions verified

□ Firewall rules validated

□ Audit logging operational

Security must survive deployment.

---

# 16. Rollback Readiness

□ Rollback documented

□ Rollback tested

□ Previous version available

□ Database rollback prepared

□ Rollback decision criteria defined

□ Rollback owner assigned

□ Rollback communication prepared

Rollback should be executable within minutes.

---

# 17. Communication

□ Engineering notified

□ Product informed

□ Support informed

□ Customer Success informed

□ Incident channel prepared

□ Status page updated (if required)

□ Deployment documented

Communication reduces operational confusion.

---

# 18. Post-Deployment Monitoring

Monitor

□ Error rates

□ Traffic

□ User activity

□ Infrastructure

□ Database

□ API latency

□ Customer feedback

□ Support tickets

The first hour is the highest-risk period.

---

# 19. Deployment Review

Review

□ Deployment duration

□ Issues encountered

□ Recovery actions

□ Unexpected behavior

□ Monitoring effectiveness

□ Team feedback

□ Lessons learned

Every deployment should improve the next deployment.

---

# 20. Continuous Improvement

Continuously improve

Deployment Speed

↓

Deployment Safety

↓

Automation

↓

Rollback

↓

Observability

↓

Recovery Time

↓

Operational Excellence

Great deployment systems continuously reduce operational risk.

---

# Deployment Quality Attributes

Evaluate

Safety

Repeatability

Automation

Observability

Recoverability

Reliability

Scalability

Operational Readiness

---

# Deployment Questions

Before approval ask

Can this deployment be repeated consistently?

↓

Can it be rolled back quickly?

↓

Are all critical services verified?

↓

Can failures be detected immediately?

↓

Will customers experience downtime?

↓

Have all operational risks been reviewed?

↓

Would experienced Site Reliability Engineers confidently approve this deployment?

---

# Severity Levels

Critical

Deployment failure

Rollback unavailable

Database corruption

Service outage

Secrets exposed

Production data loss

Major

Failed health checks

Missing monitoring

Configuration errors

Performance degradation

Infrastructure instability

Medium

Documentation gaps

Manual verification

Deployment optimization

Minor

Logging improvements

Automation enhancements

Communication updates

Future optimization

---

# Deployment Checklist

✓ Deployment planned

✓ Source validated

✓ Build completed

✓ Tests passed

✓ Infrastructure verified

✓ Configuration validated

✓ Database prepared

✓ Dependencies reviewed

✓ Deployment strategy selected

✓ Deployment executed

✓ Health verified

✓ Functional testing completed

✓ Performance validated

✓ Monitoring active

✓ Security verified

✓ Rollback ready

✓ Communication completed

✓ Post-deployment monitoring enabled

✓ Deployment reviewed

✓ Continuous improvement documented

---

# Anti-Patterns

Avoid

Deploying on Fridays without support

Deploying without rollback

Skipping backups

Skipping health checks

Manual production changes

Unreviewed configuration changes

Ignoring monitoring

Deploying multiple high-risk changes together

Large unplanned releases

Ignoring post-deployment verification

Deploying without communication

Treating deployment as the end of delivery

---

# Definition of Done

Deployment review is complete when

- Source code, build artifacts, infrastructure, and environment configuration have been validated and approved.
- Automated validation confirms build quality, testing, security, and deployment integrity before production changes begin.
- Infrastructure, databases, external dependencies, networking, and operational services are fully prepared for deployment.
- The selected deployment strategy minimizes operational risk while enabling safe rollout and rapid recovery.
- Functional verification confirms that all critical customer workflows operate correctly after deployment.
- Monitoring, logging, tracing, dashboards, and alerts provide immediate visibility into deployment health and customer impact.
- Rollback procedures have been validated, documented, and can restore service within acceptable recovery objectives.
- Engineering, operations, product, and customer-facing teams are informed and prepared to respond if necessary.
- Deployment outcomes, lessons learned, and operational improvements are documented for future releases.
- The deployment process consistently delivers software with minimal risk, minimal downtime, rapid recovery capability, and complete operational confidence.

An exceptional deployment is almost invisible.

Customers continue using the product without interruption, engineers retain complete operational control, every change is observable and reversible, and each deployment increases confidence in the delivery system rather than introducing uncertainty.