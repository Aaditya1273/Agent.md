# Playbook: set up a new project

Goal: from zero to an agent that reads the right standards, in four commands.

## 1. Pick the model variant

Match the agent in use. Claude Code → `claude`. Gemini CLI → `gemini`.
Cursor, Codex, Copilot → `open-ai` unless the user prefers `claude`.

## 2. Scan and install

```bash
npx activate-agentmd init --model=claude --dry
```

Read the output: detected signals (Docker, TypeScript, Prisma, Next.js,
PostgreSQL, GitHub Actions …) and the recommended packages grouped by
category. Monorepos get a per-workspace breakdown; recommendations are the
union. If it says "No known stack detected", skip to step 3.

Then run for real:

```bash
npx activate-agentmd init --model=claude --yes
```

## 3. Fill gaps the scan can't see

`init` maps files to packages; it can't know intent. Ask or infer, then add:

```bash
npx activate-agentmd install Security/owasp
npx activate-agentmd install API/rest
npx activate-agentmd install "System Design/architecture"
npx activate-agentmd install Testing/            # the whole category
```

Typical additions by project type:

- Public API → `API/rest` or `API/graphql`, `API/versioning`, `API/rate-limiting`, `Security/api-security`
- Anything with users → `Security/authentication`, `Security/authorization`, `Security/passwords`, `Security/jwt` or `Security/oauth`
- Anything with a database → `Database/schema-design`, `Database/migration`, `Database/indexes`, `Database/transactions`
- Frontend app → `Frontend/folder-structure`, `Frontend/state-management`, `Frontend/forms`, `Performance/bundle-size`
- Shipping to production → `Checklists/production-checklist`, `DevOps/deployment`, `DevOps/rollback`, `Backend/logging`, `Backend/monitoring`
- Open-source repo → `Community/contributing`, `Community/code-of-conduct`, `Documentation/readme`, `Documentation/changelog`

Find anything else with `npx activate-agentmd search <term>`.

## 4. Link

```bash
npx activate-agentmd link --agent=claude        # or cursor, agents, gemini, copilot, all
```

## 5. Confirm

```bash
npx activate-agentmd list --installed
```

Open the config file that was written (`CLAUDE.md` etc.) and show the user
the `<!-- agentmd:start -->` block. Tell them to commit `.agentmd/` and the
config file together.
