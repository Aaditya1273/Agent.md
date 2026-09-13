---
targetModels:
  - "GLM-5.3"
  - "GLM-5.2"
  - "GLM-5 Family"
  - "GLM-4.6"
  - "Future GLM Models"
name: spec-driven
category: AI
description: Spec-driven development for agents — propose, spec, tasks, verify, archive before any multi-file edit, so the model builds what was agreed and leaves a record.
license: MIT
author: Agent.md maintainers
last-verified: 2026-09-13
reviewed-by: unreviewed
---
<!-- Generated from models/_canonical by scripts/build-model-variants.js.
     Edit the canonical source, not this file. Behavioural profile for GLM: scripts/model-profiles.json -->

## Task boundary
1. Implement only what the task names; no extra abstractions or files.
2. English-only comments and identifiers.
3. Stop when the checklist passes.

---

# Purpose

Rules for how an agent plans before it edits. A model that starts typing on
the first prompt produces code that matches its guess of the request, not the
request. The loop below makes the guess explicit, cheap to correct, and kept
on disk in `.specs/` where the next session, the reviewer and the next model
can read it.

The rule that precedes all others: **no multi-file edit without a verified
spec.** A one-line fix in one file is exempt. Anything that touches two or
more files, adds a dependency, changes a schema or a public interface is not.

Process rules live here; behavioural rules are `AI/agent-rules`, planning
heuristics are `AI/planning`, verification is `AI/verification`.

---

# The loop

```
propose  →  spec  →  tasks  →  implement  →  verify  →  archive
 what/why    how     steps      code          proof     record
```

| Stage | Artifact | Gate to the next stage |
| --- | --- | --- |
| Propose | `.specs/<change>/proposal.md` | User agrees with the *what* and *why* |
| Spec | `.specs/<change>/spec.md` | Requirements are testable; `status: verified` |
| Tasks | `.specs/<change>/tasks.md` | Every task names its files and its check |
| Implement | Code | Each task ticked as it lands |
| Verify | `spec.md` scenarios pass | Evidence recorded, not asserted |
| Archive | `.specs/archive/<date>-<change>/` | Living spec updated |

Skipping a stage is allowed only when the user says so in the conversation,
and the skip is written into `proposal.md` as a line: `Skipped: tasks (user
approved, single-file change)`.

---

# Propose: one screen, no code

```markdown
# Proposal: rate-limit the public search API

## Why
Search is 40% of traffic and has no limit; one client took the DB down on 2026-09-02.

## What changes
- Token bucket per API key on `/v1/search`, 60 req/min, `429` with `Retry-After`.
- Dashboard shows per-key usage.

## What does not change
- Authenticated internal callers are exempt.
- No schema migration.

## Open questions
- Redis or in-process? (Affects multi-instance correctness.)
```

1. A proposal is `## Why`, `## What changes`, `## What does not change`, and
  `## Open questions`. Nothing else — no implementation detail, no code.
2. `## What does not change` is the most valuable section. It is where scope
  creep is caught before it costs anything.
3. Resolve every open question with the user before writing the spec. An
  unresolved question is a coin the model will flip silently later.

---

# Spec: requirements a test can read

```markdown
---
change: rate-limit-search
status: verified          # draft | verified | superseded
verified-by: user, 2026-09-13
---

## Requirement: per-key limit on /v1/search
Each API key MAY make 60 requests per rolling minute to `/v1/search`.

### Scenario: over the limit
GIVEN a key has made 60 requests in the last 60 seconds
WHEN it makes one more
THEN the response is `429` with `Retry-After` in seconds

### Scenario: internal callers exempt
GIVEN a request carries a valid internal service token
WHEN it exceeds 60 requests per minute
THEN it is served normally
```

1. One `## Requirement` per behaviour, each with at least one `### Scenario`
  in `GIVEN / WHEN / THEN` form. A requirement without a scenario is an
  opinion, not a spec.
2. Use `MUST`, `MUST NOT`, `MAY` (RFC 2119). "Should probably" is not a
  requirement.
3. `status: verified` is set by a human, never by the model. The model may
  write `status: draft` and ask; it may not promote its own draft.
4. The spec describes behaviour, not implementation. "Uses Redis `INCR` with a
  60 s `EXPIRE`" belongs in `tasks.md`, so the spec survives a rewrite.

---

# Tasks: files and checks, nothing vague

```markdown
## Tasks: rate-limit-search

- [x] 1. `src/lib/ratelimit.ts` — token bucket over Redis (`INCR` + `EXPIRE`).
        Check: `pnpm test src/lib/ratelimit.test.ts`
- [x] 2. `src/middleware/ratelimit.ts` — wire to `/v1/search`, exempt internal tokens.
        Check: scenario "internal callers exempt"
- [ ] 3. `src/app/dashboard/usage.tsx` — per-key usage panel.
        Check: `pnpm test src/app/dashboard`
- [ ] 4. `docs/api.md` — document `429` and `Retry-After`.
        Check: reviewer reads it
```

1. Every task names the files it will touch and the command or scenario that
  proves it. "Add rate limiting" is not a task; it is the proposal again.
2. Tasks are ordered so each one leaves the build green. A task that needs two
  others to compile is three tasks.
3. Tick the box in the same edit that lands the code. The list is the progress
  report — the model does not narrate progress in prose.
4. A task that turns out to need files not listed stops and updates
  `tasks.md` first. Unlisted files are how scope creep enters.

---

# Implement: the gate is mechanical

Before the first edit that touches more than one file, the agent checks:

```bash
test -f .specs/$CHANGE/spec.md && grep -q '^status: verified' .specs/$CHANGE/spec.md \
  || { echo "no verified spec for $CHANGE"; exit 1; }
```

1. If the check fails, the agent writes or updates the spec and asks. It does
  not edit around the gate.
2. Mid-implementation discoveries that change behaviour go back to `spec.md`
  as a new draft requirement, and the user re-verifies. Discoveries that
  change only *how* go to `tasks.md`.
3. A `.specs/` directory that does not exist yet is created with the first
  proposal, plus `.specs/README.md` explaining the four files. The user's
  repo gains the convention, not just one change.

---

# Verify: evidence, not adjectives

```markdown
## Verification: rate-limit-search  (2026-09-13)

| Scenario | How | Result |
| --- | --- | --- |
| over the limit | `pnpm test src/lib/ratelimit.test.ts` | 4 passed |
| internal callers exempt | `curl -H "X-Internal: $TOKEN" …` ×61 | all 200 |
| dashboard shows usage | screenshot `docs/verify/usage.png` | shown |
```

1. Each scenario in the spec gets a row: the command run and its actual
  output. "Tested and works" is not a row.
2. A scenario that cannot be run (needs prod data, needs a human) is marked
  `manual — not run` so the reviewer knows what is still open.
3. Verification that fails goes back to the task, not into a footnote.

---

# Archive: keep the record, update the truth

1. On completion move `.specs/<change>/` to `.specs/archive/<yyyy-mm-dd>-<change>/`.
2. Fold the verified requirements into the living spec for that area,
  `.specs/specs/<area>.md`, replacing anything they supersede and marking the
  old block `status: superseded` with a pointer to the change.
3. The living spec is what the next session reads first. A repo where only
  archives exist has history but no current truth.

---

# Anti-patterns

| Anti-pattern | Why it fails | Fix |
| --- | --- | --- |
| Editing five files on the first prompt | Built the guess, not the request | Propose first |
| Spec written as implementation steps | Dies on the first rewrite | Behaviour in `spec.md`, steps in `tasks.md` |
| Model sets `status: verified` itself | The gate verifies nothing | Only the user promotes |
| Requirement with no scenario | Untestable, so unverifiable | One `GIVEN/WHEN/THEN` minimum |
| Tasks like "implement feature" | No files, no check, no progress signal | Files + check per task |
| Verification in prose | "Works" is not evidence | Command and output per scenario |
| Discoveries patched silently | Spec and code diverge | Draft requirement, re-verify |
| No `## What does not change` | Scope creeps unnoticed | Always write it, even if short |
| Archive without updating living spec | History without truth | Fold requirements in |
| `.specs/` only for big changes | Convention never sticks | Small changes get a one-screen spec |

---

# Checklist

- [ ] No edit touching two or more files without a `.specs/<change>/spec.md` at `status: verified`
- [ ] `proposal.md` has `## Why`, `## What changes`, `## What does not change`, `## Open questions`
- [ ] Every open question resolved with the user before the spec is written
- [ ] Every `## Requirement` has at least one `GIVEN / WHEN / THEN` scenario
- [ ] Requirements use `MUST` / `MUST NOT` / `MAY`, and describe behaviour not implementation
- [ ] `status: verified` set by a human, never by the model
- [ ] Every task names its files and its check; boxes ticked as code lands
- [ ] Unlisted files trigger a `tasks.md` update before the edit
- [ ] Verification table has a command and actual output per scenario
- [ ] Completed change archived under `.specs/archive/` and folded into the living spec
