---
name: agentmd-standards
description: 'Follow and review against the engineering standards installed from the Agent.md registry. Use whenever writing, changing or reviewing code in a repo that has Agent.md standards installed — a `.agentmd/` directory, or a CLAUDE.md, AGENTS.md, GEMINI.md, .cursor/rules/agentmd.mdc or .github/copilot-instructions.md containing an `<!-- agentmd:start -->` block. Triggers: "does this follow our standards", "review against standards", "check this PR against our rules", "make this match the security/database/API standard", or any implementation task in such a repo. If no standards are installed, hands off to the agentmd-usage skill.'
license: MIT
metadata:
  author: Agent.md (agent.md)
  version: 1.0.0
---

# Agent.md standards

The repo has told you how it wants code written. Read that before writing any.

## 1. Find the standards

Look, in order:

1. The block between `<!-- agentmd:start -->` and `<!-- agentmd:end -->` in
   `CLAUDE.md`, `AGENTS.md`, `GEMINI.md` or `.github/copilot-instructions.md`,
   or the whole of `.cursor/rules/agentmd.mdc`. It lists every installed
   package by category as a link to its file.
2. `.agentmd/manifest.json` — the same list, with versions and checksums.
3. `.agentmd/presets/*.md` — the content. Filenames are
   `<model>-<Category>-<preset>.md`, e.g. `claude-Security-owasp.md`.

Nothing there → say so and offer `npx activate-agentmd init` (see the
`agentmd-usage` skill). Don't invent standards.

## 2. Read what applies, before coding

Map the task to categories, then read those files fully. Don't skim the
headings; the checklists at the bottom are the part that matters.

| Task touches | Read |
|---|---|
| Auth, sessions, tokens, secrets, user input, headers, uploads | `Security/*` |
| Schema, migrations, queries, ORM, indexes, transactions | `Database/*` |
| Endpoints, contracts, pagination, errors, versioning, webhooks | `API/*`, `Security/api-security` |
| Components, routing, forms, state, hydration, SEO | `Frontend/*` |
| Tests of any kind | `Testing/*` |
| Latency, bundle, caching, images, queries | `Performance/*` |
| Service boundaries, queues, scaling, failure modes | `System Design/*` |
| Deploys, CI, containers, rollback, envs | `DevOps/*`, `Checklists/*` |
| Logging, errors, jobs, notifications | `Backend/*` |
| Prompts, agents, tool use, memory | `AI/*` |
| READMEs, changelogs, docs | `Documentation/*` |

If the task fits nothing installed, proceed with good practice and tell the
user which category would cover it (`npx activate-agentmd search <term>`).

## 3. Write to the standard

- Follow it literally where it is literal (parameterised queries, no secrets
  in images, `Cache-Control` values, migration naming).
- Where it gives a rationale rather than a rule, apply the rationale.
- Conflict between two standards → the more specific wins (`API/pagination`
  over `API/rest`); say which you chose.
- Conflict between a standard and existing code → follow the standard for
  new code, don't rewrite unrelated code, flag the drift.
- Never edit `.agentmd/presets/`. Disagreement is a note to the user, not a
  patch.

## 4. Cite it

When you finish, name what you followed, briefly:

> Followed `Security/owasp` (input validation, parameterised queries) and
> `Database/migration` (reversible migration, no data loss on down).

One line per standard. Skip the citation only for trivial changes.

## 5. Review mode

Asked to review, audit, or "check against standards": read the installed
packages for the categories the diff touches, then work through
[references/review-checklist.md](references/review-checklist.md). Report
per finding: file:line, the standard it violates (package name), the fix.
Confirmed-clean categories get one line ("Database: clean"). Don't pad.
