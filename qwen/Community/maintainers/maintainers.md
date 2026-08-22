# maintainers.md

Version: 1.0.0

Target Audience

- Repository Owners
- Maintainers
- Core Contributors
- Reviewers
- Engineering Teams
- Community Members

---

# Purpose

This document defines what it means to be a maintainer of a repository: what maintainers are responsible for, how people become maintainers, how they step down, and how maintainer decisions are made.

Maintainership is a role, not a reward.

It is a commitment to the health of a project and to the people who depend on it. A project with unclear maintainership accumulates stalled pull requests, unanswered security reports, and contributors who quietly give up.

This document exists so that responsibility is explicit rather than assumed.

---

# Responsibilities

A maintainer is accountable for the following, in priority order.

## 1. Security

Triage security reports within the window stated in `SECURITY.md`.

Never discuss an unpatched vulnerability in a public issue.

Ship a fix, or a documented mitigation, before disclosure.

## 2. Correctness

Keep the default branch releasable.

A broken default branch blocks every contributor at once, so it takes precedence over feature work.

## 3. Review

Give contributors a first response within a stated turnaround, even when that response is "this needs more time."

Silence is the most common reason contributors leave.

## 4. Release

Cut releases on a predictable cadence.

Record every user-visible change in the changelog.

Follow semantic versioning, and treat a breaking change as breaking even when it is small.

## 5. Stewardship

Keep documentation truthful.

Remove features that no longer work rather than leaving them documented as if they do.

---

# Becoming a maintainer

Maintainership is offered, not requested, and it follows demonstrated work.

The usual path:

1. Sustained contribution over time — code, review, documentation, or triage.
2. Demonstrated judgment: knowing what not to merge, not only what to build.
3. Nomination by an existing maintainer.
4. Agreement among current maintainers, with no sustained objection.
5. A public announcement, so the change is visible to the community.

Volume of commits is not the criterion. A contributor who reliably triages issues and writes clear documentation is a stronger candidate than one who has merged many unreviewed features.

---

# Levels of access

Grant the narrowest access that lets someone do their work.

| Role | Can do | Cannot do |
|---|---|---|
| Contributor | Open issues and pull requests | Merge, release |
| Triager | Label, close, and route issues | Merge, release |
| Reviewer | Approve pull requests | Merge to default branch, release |
| Maintainer | Merge, cut releases | Change governance alone |
| Owner | Administer the repository and secrets | — |

Publishing credentials and signing keys belong to the smallest possible set of people, and are rotated when anyone in that set steps down.

---

# Decision making

Prefer consensus. Escalate only when consensus fails.

- Routine changes: one maintainer approval.
- Changes to public API, security posture, or dependencies: two approvals.
- Changes to governance, licensing, or the release process: agreement among all active maintainers.

Record the reasoning for a significant decision where future maintainers will find it — an issue, an architecture decision record, or a commit message. A decision whose reasoning is lost gets relitigated every year.

---

# Stepping down

Maintainers stop being maintainers, and that is normal.

A maintainer who is stepping down should:

- Say so publicly rather than going quiet.
- Hand off anything in flight.
- Have their publishing credentials and elevated access revoked.

A maintainer who has been unreachable for an extended period, as defined by the project, is moved to emeritus status and their access is revoked. This is a security measure, not a judgement — dormant accounts with publishing rights are a supply-chain risk.

Emeritus maintainers keep their credit in the project history and can return through the normal path.

---

# Succession

A project with one maintainer is one person's availability away from being unmaintained.

- Name at least two people who can cut a release.
- Document the release process well enough that someone else can follow it.
- Store credentials so that the loss of any single person does not lock the project.
- State plainly in the README if the project is unmaintained. An honest archive notice serves users better than a repository that looks alive.

---

# Conduct

Maintainers enforce the code of conduct, and are held to it most strictly.

The person with merge rights sets the tone of a project. Dismissiveness from a maintainer costs far more contributors than the same words from anyone else.

---

# Anti-patterns

Avoid the following.

- **The hero maintainer.** One person merging everything, reviewing nothing, and burning out.
- **Silent rejection.** Letting a pull request rot instead of declining it with a reason.
- **Undocumented gatekeeping.** Standards that exist only in a maintainer's head, so contributors fail checks they could not have known about.
- **Permanent access.** Credentials that outlive involvement.
- **Governance by exhaustion.** Letting the most persistent voice win rather than the best argument.

---

# Checklist

- [ ] `MAINTAINERS` file lists current maintainers and their areas
- [ ] At least two people can cut a release
- [ ] Security contact and response window are documented
- [ ] Review turnaround is stated publicly
- [ ] Access levels are documented and match reality
- [ ] Inactive maintainers have been moved to emeritus and access revoked
- [ ] The release process is written down, not remembered
- [ ] Significant decisions are recorded with their reasoning
