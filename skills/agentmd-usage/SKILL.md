---
name: agentmd-usage
description: Install, find, link, update and validate engineering standards from the Agent.md registry (304 free MIT markdown standards across 20 categories) using the `activate-agentmd` CLI; print the breaking changes for the dependency majors this project runs; and lint agent instruction files for leaked keys and prompt injection. Use whenever the user asks to set up coding standards, add rules for the agent, "make the agent follow our conventions", "add security standards", "what standards should this repo have", "install owasp/postgres/testing rules", or to create or refresh CLAUDE.md, AGENTS.md, GEMINI.md, .cursor/rules or copilot-instructions.md. Also use before editing any of those files (lint it after), before writing code against a library whose major changed recently (Next.js, React, Prisma, Pydantic, SQLAlchemy, Zod, Tailwind, Express — run `agentmd pins`), and to check for outdated standards. Pairs with the agentmd-standards skill, which is the discipline for following installed standards while coding.
license: MIT
metadata:
  author: Agent.md (agent.md)
  version: 1.0.0
---

# Agent.md usage

Agent.md is a package manager for engineering standards: 304 packages across
20 categories, each a plain markdown file, each shipped in 11 model-tuned
variants (`claude`, `deepseek`, `gemini`, `glm`, `grok`, `kimi`, `minimax`,
`mistral`, `open-ai`, `qwen`, `sarvam-ai`). Substance is identical across
variants; only framing changes (Claude variants use XML section tags, OpenAI
variants use markdown headers, Grok variants put non-negotiables first, and so
on). Nothing is executed — packages are markdown written to disk.

## Two checks to run without being asked

- **Before writing code against a pinned library** — Next.js, React, Prisma,
  Pydantic, SQLAlchemy, Zod, Tailwind, Express, Django, Vue — run
  `npx activate-agentmd pins`. It prints the breaking changes for the majors
  this project actually runs. Your training data may predate them; follow the
  pins over habit.
- **After editing an instruction file** (CLAUDE.md, AGENTS.md, GEMINI.md,
  `.cursor/rules/*`, `.claude/rules/*`, `.claude/skills/*`,
  `.github/copilot-instructions.md`) run `npx activate-agentmd lint`. It exits
  non-zero on a leaked key or a prompt-injection pattern; fix those before
  continuing.

Everything goes through one CLI. Always invoke it as `npx activate-agentmd` unless
`agentmd` is already on PATH. Node 18+.

## If the Agent.md MCP is connected

The registry is also served as an MCP server at `https://agentmd.pages.dev/api/mcp`
(streamable HTTP). When it is connected, prefer its tools over shelling out
to search — they return structured results without leaving the conversation:

| Tool | Use it for |
|---|---|
| `list_categories` | See the 20 categories and package counts before choosing |
| `search_packages(query, limit?)` | Find standards by keyword; add a model name to filter by family |
| `get_package(category, package, model?)` | Read a standard's full markdown before recommending it |
| `install_command(category, package, model?, agent?)` | The exact `activate-agentmd` commands to install and link it |

The MCP is read-only. Installing into the project is always the CLI's job —
run the commands `install_command` returns in the project root.

Connect it: `claude mcp add --transport http agentmd https://agentmd.pages.dev/api/mcp`
(Claude Code), `codex mcp add agentmd --url https://agentmd.pages.dev/api/mcp` (Codex),
`gemini mcp add --transport http agentmd https://agentmd.pages.dev/api/mcp` (Gemini CLI),
or the one-click buttons for Cursor and VS Code on https://agentmd.pages.dev.

## Tool map

| Command | Does | Flags |
|---|---|---|
| `npx activate-agentmd init` | Scan the project (package.json, Dockerfile, tsconfig.json, prisma/, .github/workflows/ …), show detected stack, install matching packages | `--model=NAME` (default `claude`), `--yes`/`-y`, `--dry` |
| `npx activate-agentmd link` | Write the installed-package list into agent config files | `--agent=claude,cursor,agents,gemini,copilot` or `--agent=all`, `--dry` |
| `npx activate-agentmd search <query>` | Search names, categories, descriptions | `--model=`, `--category=`, `--limit=`, `--all-models` |
| `npx activate-agentmd list [model[/Category]]` | Browse the registry | `--installed` / `-i` |
| `npx activate-agentmd info <id>` | Details for one package | |
| `npx activate-agentmd install <id>` | Install one package, or a whole category with a trailing `/` | `--force` |
| `npx activate-agentmd remove <id>` | Uninstall | |
| `npx activate-agentmd outdated` | What changed upstream, what was edited locally | |
| `npx activate-agentmd update` | Pull current versions; never overwrites local edits without `--force` | `--dry`, `--force` |
| `npx activate-agentmd validate` | Check registry + manifest integrity | |
| `npx activate-agentmd agents` | List supported agent config targets | |

There is no `detect` command — detection lives inside `init`.

## Package ids

- `Category/preset` — model defaults to `claude`: `Security/owasp`
- `model/Category/preset` — explicit: `gemini/Security/owasp`
- Trailing slash installs the category: `claude/Testing/`

Category names are case-sensitive as listed: `AI`, `API`, `Backend`,
`Business`, `Checklists`, `Community`, `Database`, `Design`, `DevOps`,
`Documentation`, `Frontend`, `Open Source`, `Performance`, `Research`,
`Review`, `Security`, `Startup`, `System Design`, `Templates`, `Testing`.
Quote ids with spaces: `"System Design/caching"`.

## Where things land

- `.agentmd/presets/<model>-<Category>-<preset>.md` — package content
- `.agentmd/manifest.json` — what is installed, with version, checksum, source

Commit both. That is how a team shares one set of standards.

## What `link` writes

| `--agent=` | File | Format |
|---|---|---|
| `claude` | `CLAUDE.md` | delimited block |
| `agents` | `AGENTS.md` (Codex, Amp, Jules, others) | delimited block |
| `cursor` | `.cursor/rules/agentmd.mdc` | whole file, `alwaysApply: true` |
| `gemini` | `GEMINI.md` | delimited block |
| `copilot` | `.github/copilot-instructions.md` | delimited block |

Without `--agent`, `link` writes to every target file that already exists,
falling back to `AGENTS.md`. Markdown targets get a block between
`<!-- agentmd:start -->` and `<!-- agentmd:end -->` listing every installed
package as a link to its `.agentmd/presets/` file; hand-written content
around the block is preserved. Re-run `link` after every install/remove.

## Playbooks

Read the one that matches, then run it.

- New project, nothing installed → [references/new-project.md](references/new-project.md)
- Existing project, add or extend standards → [references/existing-project.md](references/existing-project.md)
- Keep an installed set current → [references/keep-current.md](references/keep-current.md)

## Choosing a model variant

Use the family the user's agent runs on: Claude Code → `claude`, Cursor/Codex/
Copilot → `open-ai` (or `claude` if they say so), Gemini CLI → `gemini`. When
unsure, `claude` is the default and every variant carries the same substance.
Pass `--model=` to `init`/`search`; prefix ids for `install`.

## Rules

- Never hand-edit files under `.agentmd/presets/`; `update` will flag the
  conflict and refuse to overwrite. If the user wants a change, tell them to
  edit and accept that `update --force` is the only way to resync later.
- Always finish with `npx activate-agentmd link`, then show the user the block
  that was written and the files it lives in.
- Prefer `init` over guessing packages. Use `search`/`install` for specific
  asks ("add rate limiting rules" → `npx activate-agentmd install API/rate-limiting`).
- `--dry` first when the user is cautious or the repo is shared.
