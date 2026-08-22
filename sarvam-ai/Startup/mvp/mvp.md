# mvp.md

Version: 1.0.0

Target Audience

- Founders
- Startup Engineers
- Product Engineers
- Product Managers
- Technical Leads
- Engineering Teams
- Independent Builders

---

# Purpose

This document defines how to scope, build, and ship a minimum viable product: what belongs in a first release, what does not, and how to tell the difference.

An MVP is not a small version of the product.

It is the smallest thing that produces a real answer to the riskiest open question. If a release cannot change what you believe, it is not an MVP — it is unpaid work on a product nobody has validated.

It applies to

- New products
- New features inside an existing product
- Technical spikes intended to de-risk a direction

---

# The governing question

Before writing code, state the assumption whose failure would kill the product.

Typical candidates:

- People have this problem badly enough to change their behaviour.
- They will pay, or grant attention, to have it solved.
- The solution is technically feasible at acceptable cost.
- We can reach these people repeatedly.

Build the smallest artifact that tests the riskiest one. If the riskiest assumption is demand, the answer is often not software at all.

Record the assumption and the result. An MVP whose outcome nobody wrote down gets re-litigated for the next two years.

---

# Scoping rules

## Cut by user journey, not by layer

Ship one complete path end to end rather than every screen half-built. A user who can complete a single real task teaches you more than ten partial flows.

## One user, one problem

Pick the narrowest audience whose problem you understand best. Broadening later is easy; recovering from a product that is vague to everyone is not.

## Manual before automated

Doing the work by hand behind the interface is a legitimate MVP. It is faster, and it teaches the edge cases an automated version would have guessed wrong.

## Boring technology

Use the stack the team already knows. Novel infrastructure adds risk to a project whose entire purpose is to reduce risk.

---

# What to build properly even in an MVP

Speed is not an excuse for the following. Each one is far more expensive to retrofit than to include.

- **Authentication and authorization.** Getting identity wrong reshapes the data model.
- **Data integrity.** Constraints, migrations, backups. Corrupt early data poisons every later decision.
- **Secrets handling.** A leaked credential is not undone by a rewrite.
- **A way to observe behaviour.** Logging and basic analytics. An MVP with no measurement cannot answer the question it exists to answer.
- **A path to delete user data.** Often a legal obligation, and painful to add later.

---

# What to defer

- Configurability and settings screens
- Multi-tenancy, roles, and permission matrices
- Internationalization
- Offline support
- Performance work beyond obvious pathologies
- Admin tooling beyond direct database access
- Design polish past the point of being unembarrassing
- Test coverage beyond the paths that lose data or money

Defer means *not yet*, and it means writing down why. Undocumented deferral is indistinguishable from an oversight.

---

# Quality floor

An MVP is allowed to be small. It is not allowed to be broken.

- It works for the path you tell people to take.
- It fails visibly rather than silently.
- It does not lose user data.
- It does not claim capabilities it lacks.

Shipping something that quietly does the wrong thing costs the trust you need for version two.

---

# Deciding what happened

Set the success criterion before launch, not after. "We'll see how it goes" always reads as success.

State it concretely: how many of the people who try it complete the core task, come back, or pay.

Three honest outcomes:

- **Validated.** The assumption held. Invest.
- **Invalidated.** It didn't. Change direction, and treat the saved effort as the return on the MVP.
- **Inconclusive.** Usually too few users or too muddled a test. Fix the test; do not read it as a yes.

An MVP that cannot be invalidated was not an experiment.

---

# Technical debt

Debt taken deliberately to answer a question faster is a good trade. Debt taken by accident is not.

Mark the shortcuts as you make them, with the reason and the condition that should trigger repayment. If the product is validated, pay down the parts that block the next increment first — not the parts that are merely ugly.

If the product is invalidated, the debt evaporates with it. That is the point.

---

# Anti-patterns

- **The infinite MVP.** Scope grows until the launch date is theoretical.
- **The demo that ships.** A prototype promoted to production without the quality floor.
- **Feature parity with an incumbent.** Guarantees you compete where you are weakest.
- **Building for imagined scale.** Infrastructure for users who do not exist.
- **Skipping measurement.** Shipping without the ability to learn.
- **Confusing launch with validation.** Shipping is the start of the experiment.

---

# Checklist

- [ ] The riskiest assumption is written down
- [ ] The success criterion is defined, with a number, before launch
- [ ] One user journey works end to end
- [ ] Auth, data integrity, secrets and backups are handled properly
- [ ] Behaviour is observable
- [ ] Deferred items are listed with reasons
- [ ] The product does not claim what it cannot do
- [ ] A decision date is on the calendar
