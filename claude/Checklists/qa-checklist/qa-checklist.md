# qa-checklist.md

Version: 1.0.0

Target Models

- Claude 5 Family
- Claude 4.8
- Claude 4.7
- Claude 4.x Family
- Future Claude Models

---

# Purpose

This checklist defines the minimum Quality Assurance (QA) requirements before any software product, feature, API, AI application, or platform is approved for release or production deployment.

It applies to

- SaaS Platforms
- AI Applications
- APIs
- Backend Services
- Frontend Applications
- Mobile Applications
- Enterprise Software
- Developer Tools
- Cloud Services
- Internal Platforms

Quality Assurance is not bug finding.

Quality Assurance is the systematic process of verifying that software consistently satisfies functional requirements, business objectives, user expectations, reliability standards, security requirements, and operational readiness.

Quality is engineered.

Not inspected into a product at the end.

---

# Core Principle

High Quality

=

Correctness

+

Reliability

+

Consistency

+

Usability

+

Security

+

Performance

+

Business Value

Every release should increase customer confidence.

Never uncertainty.

---

# QA Workflow

Understand Requirements

↓

Prepare Test Plan

↓

Execute Tests

↓

Verify Results

↓

Validate Business Flows

↓

Assess Risks

↓

Approve Release

↓

Continuously Improve

---

# 1. Requirement Validation

□ Requirements reviewed

□ Acceptance criteria defined

□ User stories validated

□ Edge cases identified

□ Business rules documented

□ Assumptions verified

□ Dependencies identified

□ Scope approved

Quality begins with correct requirements.

---

# 2. Test Planning

□ Test strategy defined

□ Test cases prepared

□ Test data created

□ Test environment prepared

□ Automation identified

□ Risks documented

□ Exit criteria defined

□ Responsibilities assigned

Well-planned testing reduces defects.

---

# 3. Functional Testing

□ Features work as expected

□ User workflows verified

□ Business logic validated

□ Input validation tested

□ Output verified

□ Error handling tested

□ Edge cases reviewed

□ Acceptance criteria satisfied

Every requirement should have verification.

---

# 4. User Interface Testing

□ Layout verified

□ Responsive behavior tested

□ Navigation validated

□ Forms verified

□ Buttons functional

□ Typography consistent

□ Visual defects reviewed

□ Cross-browser testing completed

Interfaces should behave consistently.

---

# 5. API Testing

□ Endpoints validated

□ Authentication verified

□ Authorization tested

□ Request validation verified

□ Response schema validated

□ Error responses verified

□ Rate limiting tested

□ Version compatibility reviewed

APIs are products.

Treat them accordingly.

---

# 6. Database Testing

□ CRUD operations verified

□ Constraints validated

□ Transactions tested

□ Migrations verified

□ Data integrity confirmed

□ Rollback tested

□ Index behavior reviewed

□ Backup restoration verified

Data correctness is essential.

---

# 7. Integration Testing

□ Service integrations verified

□ Third-party APIs tested

□ Authentication providers tested

□ Email services verified

□ Queue systems validated

□ Background jobs tested

□ Payment providers verified

□ External failures handled

Systems rarely fail in isolation.

---

# 8. Regression Testing

□ Existing functionality verified

□ Previous bugs remain fixed

□ Shared modules tested

□ Common workflows validated

□ Critical paths executed

□ Dependencies reviewed

□ Automation completed

□ Regression report approved

Every release should preserve quality.

---

# 9. Performance Testing

□ Response times acceptable

□ Load testing completed

□ Stress testing reviewed

□ Memory stable

□ CPU usage acceptable

□ Database performance verified

□ Scalability reviewed

□ Performance regressions absent

Performance is part of quality.

---

# 10. Security Testing

□ Authentication tested

□ Authorization verified

□ Input validation tested

□ Session management verified

□ Sensitive data protected

□ Dependency vulnerabilities reviewed

□ API security tested

□ Security defects resolved

Secure software is quality software.

---

# 11. Accessibility Testing

□ Keyboard navigation verified

□ Screen readers supported

□ Color contrast reviewed

□ Focus states visible

□ Alternative text available

□ Semantic structure validated

□ Accessibility guidelines followed

□ Major accessibility issues resolved

Accessibility is a quality requirement.

---

# 12. AI Quality (If Applicable)

□ Prompt behavior verified

□ Context accuracy reviewed

□ Tool execution validated

□ Hallucination risks assessed

□ Safety filters verified

□ Output consistency reviewed

□ Failure scenarios tested

□ Fallback behavior validated

AI quality extends beyond correctness.

---

# 13. Compatibility Testing

□ Browser compatibility verified

□ Mobile compatibility verified

□ Tablet compatibility verified

□ Operating systems tested

□ Screen sizes reviewed

□ API compatibility confirmed

□ Version compatibility maintained

□ Legacy behavior preserved

Compatibility reduces customer friction.

---

# 14. Data Validation

□ Input data verified

□ Output data validated

□ Data migration tested

□ Import functionality verified

□ Export functionality verified

□ Duplicate handling reviewed

□ Data consistency maintained

□ Corrupted input handled safely

Incorrect data damages trust.

---

# 15. Error Recovery

□ Failure scenarios tested

□ Retry behavior verified

□ Recovery mechanisms validated

□ Timeout handling tested

□ Offline behavior reviewed

□ User recovery supported

□ Logging verified

□ Recovery documentation updated

Good software fails gracefully.

---

# 16. User Acceptance

□ Product owner approval

□ Stakeholder approval

□ Customer workflows validated

□ Business objectives satisfied

□ Documentation reviewed

□ Release notes approved

□ Known issues accepted

□ Final QA approval completed

Quality includes business validation.

---

# 17. Defect Management

□ Defects classified

□ Critical defects resolved

□ High-risk defects reviewed

□ Root causes documented

□ Duplicate issues removed

□ Regression risks identified

□ Defect trends analyzed

□ Technical debt recorded

Every defect should improve the process.

---

# 18. Documentation

□ Test plan documented

□ Test cases documented

□ Test evidence stored

□ Defect reports completed

□ Automation documented

□ Environment documented

□ QA metrics recorded

□ Lessons learned documented

Documentation preserves organizational knowledge.

---

# 19. QA Review

Review

□ Product quality

□ Test coverage

□ Defect trends

□ Customer impact

□ Risk assessment

□ Automation effectiveness

□ Team feedback

□ Improvement opportunities

Quality continuously evolves.

---

# 20. Continuous Improvement

Continuously improve

Test Coverage

↓

Automation

↓

Reliability

↓

Risk Detection

↓

Defect Prevention

↓

Customer Satisfaction

↓

Release Confidence

↓

QA Maturity

Great QA prevents defects before testing begins.

---

# QA Quality Attributes

Evaluate

Correctness

Reliability

Consistency

Coverage

Traceability

Usability

Maintainability

Release Confidence

---

# QA Questions

Before approval ask

Does every requirement have corresponding validation?

↓

Can critical customer workflows succeed consistently?

↓

Have regression risks been eliminated?

↓

Can the software recover gracefully from failures?

↓

Are known defects understood and accepted?

↓

Does testing provide confidence rather than assumptions?

↓

Would experienced QA Engineers confidently approve this release?

---

# Severity Levels

Critical

Application crashes

Data corruption

Security vulnerabilities

Broken business workflows

Release blockers

Major

Failed integrations

Regression failures

Performance degradation

Compatibility failures

Critical UI defects

Medium

Minor functional issues

Usability improvements

Documentation gaps

Automation improvements

Minor

Visual inconsistencies

Typos

Low-priority enhancements

Future optimization

---

# QA Checklist

✓ Requirements validated

✓ Test plan prepared

✓ Functional testing completed

✓ UI verified

✓ API tested

✓ Database validated

✓ Integrations verified

✓ Regression testing completed

✓ Performance tested

✓ Security reviewed

✓ Accessibility validated

✓ AI quality reviewed (if applicable)

✓ Compatibility verified

✓ Data validated

✓ Recovery tested

✓ User acceptance completed

✓ Defects managed

✓ Documentation complete

✓ QA review completed

✓ Continuous improvement established

---

# Anti-Patterns

Avoid

Testing without requirements

Testing only happy paths

Ignoring regression testing

Manual testing for repetitive tasks only

Ignoring edge cases

Skipping security validation

Ignoring accessibility

Testing in unrealistic environments

Closing defects without verification

Treating QA as the final development phase

Confusing high test coverage with high quality

Approving releases based on assumptions

---

# Definition of Done

QA review is complete when

- Business requirements, acceptance criteria, and customer expectations have been fully validated through comprehensive testing.
- Functional, integration, regression, security, performance, accessibility, compatibility, and AI-specific behavior have been independently verified where applicable.
- Critical customer workflows execute reliably under both normal and exceptional operating conditions.
- Defects have been classified, resolved, verified, or formally accepted based on documented business risk.
- Test coverage provides confidence that the software behaves consistently across supported platforms, devices, environments, and user scenarios.
- Automated and manual testing complement each other to maximize efficiency, repeatability, and defect detection.
- Documentation captures test strategies, execution evidence, defect history, quality metrics, and lessons learned for future releases.
- Product owners, stakeholders, engineering teams, and QA agree that residual risks are understood and acceptable.
- The release demonstrates measurable quality, operational stability, customer readiness, and business alignment.
- The QA process continuously improves through automation, feedback, root cause analysis, and proactive defect prevention.

Exceptional Quality Assurance is almost invisible.

Customers simply experience software that behaves predictably, recovers gracefully from failures, protects their data, performs consistently across environments, and inspires confidence because every important scenario has already been anticipated, validated, and verified before release.