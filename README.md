<div align="center">

# Agent.md

### The toolchain that stops AI coding agents from writing broken, deprecated code

Your agent's training data is frozen. Your dependencies are not. Agent.md gives Claude Code, Cursor, Codex,
Gemini CLI and Copilot the rules your project actually runs on — installed like packages, scoped like linters,
enforced like tests.

[![npm version](https://img.shields.io/npm/v/agentmd-cli?color=6366f1&label=agentmd-cli)](https://www.npmjs.com/package/agentmd-cli)
[![npm downloads](https://img.shields.io/npm/dm/agentmd-cli?color=8b5cf6)](https://www.npmjs.com/package/agentmd-cli)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Node](https://img.shields.io/badge/node-%E2%89%A518-339933?logo=node.js&logoColor=white)](https://nodejs.org)
[![PRs welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)

```bash
npx agentmd-cli init
```

<table>
<tr>
<td width="50%" valign="top">

**⇅ Breaking-change version pins**<br>
Reads the majors you run — Pydantic 2, Next.js 16, Prisma 7, Tailwind 4 — and tells the agent which methods are gone (`.dict()` → `model_dump()`, sync `params` → `await params`) before it writes a line.

</td>
<td width="50%" valign="top">

**🎯 File-glob context scoping**<br>
One scoped `.mdc` rule per standard for Cursor. The Postgres standard attaches while you edit `*.sql`, not while you edit CSS. No 500-line rules file, no token bloat.

</td>
</tr>
<tr>
<td valign="top">

**🧬 Convention extraction**<br>
`agentmd extract` reads your repo — structure, lint configs, commit history, a sample of source — and writes down the unwritten rules your team repeats in every code review, each with its evidence.

</td>
<td valign="top">

**🛡 Zero-cost enforcement + agent test suites**<br>
`agentmd review --fast` lints a diff against your standards offline in milliseconds. `agentmd review` and `agentmd test` use a model to catch violations and measure whether the agent actually obeys.

</td>
</tr>
</table>

**302 canonical standards, tuned for 11 model families · MIT · no account, no telemetry**

**[Quick start](#-quick-start) · [What's in this repo](#-whats-in-this-repo) · [Enforce in CI](#-enforce-it-in-ci) · [The registry](#-the-registry) · [Contributing](#-contributing) · [FAQ](#-faq)**

</div>

---

## 🚀 Quick start

Four commands. Each one is copy-paste and does exactly what it says.

**1. Scan the stack, install matching standards, pin breaking library changes**

```bash
npx agentmd-cli init
```
```
  ✓ Next.js                  package.json (next)
  ✓ PostgreSQL               package.json (pg)
  ⇅ Next.js 16               package.json (next ^16.1.0)   (version pin)
  ⇅ Pydantic 2               pyproject.toml (pydantic>=2.6) (version pin)

Recommended packages for claude:
  Security       authentication, owasp, sql-injection
  Database       postgres, indexes, migration
  ...
Install these? [Y/n]
```

**2. Infer your team's unwritten conventions from git history and configs**

```bash
npx agentmd-cli extract          # add --dry to print without writing
```
```
Gathered evidence from 14 files (96k chars, claude-opus-5)
  ✓ 9 conventions → .agentmd/presets/local-Team-conventions.md
  Run `agentmd link` to wire it in.
```

**3. Lint a diff against your standards — deterministic, offline, zero tokens**

```bash
npx agentmd-cli review --fast --fail-on=high
```
```
Reviewing 1 changed file against 12 standards (patterns only)

  HIGH   src/repo.ts:14  Security/sql-injection › sql-string-interpolation  [pattern]
         SQL built by string interpolation — use a parameterised query.

  1 finding at or above "high" — failing.
```

**4. Measure whether the agent actually obeys the rules**

```bash
npx agentmd-cli test              # needs ANTHROPIC_API_KEY
```
```
Rule efficacy — 3 standards × 3 tasks  (claude-opus-5)

  ✓ Security/jwt            3/3
  ✗ API/pagination          1/3   task 2: ignored "Use cursor pagination" — offset/limit used

Score: 7/9 (78%)
```

Then `npx agentmd-cli link` writes everything into `CLAUDE.md`, `AGENTS.md`, `.cursor/rules`, `GEMINI.md` or `copilot-instructions.md`, and you commit `.agentmd/` so the whole team gets the same rules.

---

## 📦 What's in this repo

This repository **is the registry** — the markdown the CLI installs. Nothing else lives here, so it stays easy to read, diff and review.

```
_canonical/<Category>/<preset>.md     the source of truth: one file per standard
claude/<Category>/<preset>/…          that standard, in Claude's native shape
open-ai/<Category>/<preset>/…         …and in OpenAI's, and nine more families
```

| Family | Directory | Family | Directory |
| --- | --- | --- | --- |
| Claude | `claude/` | Kimi | `kimi/` |
| OpenAI | `open-ai/` | GLM | `glm/` |
| Gemini | `gemini/` | MiniMax | `minimax/` |
| DeepSeek | `deepseek/` | Mistral | `mistral/` |
| Grok | `grok/` | Sarvam | `sarvam-ai/` |
| Qwen | `qwen/` | | |

Every standard is written once in `_canonical/` and generated per family: XML-tagged sections for Claude, compact imperative bullets for OpenAI, and so on. The count that matters is **302**; the 3,322 files are the same standards in each family's native shape.

The CLI (`agentmd-cli` on npm), the VS Code extension, the MCP server and the website are the tooling around this content. Docs for all of them: **[agent.md](https://agent.md)**.

---

## 🛡 Enforce it in CI

Drop this into `.github/workflows/agentmd-review.yml` in your own repo. Zero token cost, no API key, nothing leaves the runner:

```yaml
name: agentmd review
on: [pull_request]
permissions:
  contents: read
jobs:
  review:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with: { fetch-depth: 0 }
      - uses: actions/setup-node@v4
        with: { node-version: 20 }
      - run: npx agentmd-cli review --base origin/${{ github.base_ref }} --fast --fail-on=high
```

Want a full model review that comments on the PR? Add `ANTHROPIC_API_KEY` to your secrets, give the job `pull-requests: write`, and drop `--fast` for `--github`. Prefer to keep diffs on your own machines? `agentmd review --local` judges with [Ollama](https://ollama.com) instead.

---

## 📚 The registry

**302 canonical standards** across 20 categories, tuned for 11 model families.

| Category | Examples |
| --- | --- |
| **Security** | owasp, jwt, oauth, sql-injection, xss, csrf, cors, secret-management, passwords, headers |
| **Backend** | express, nextjs, fastapi, django, flask, pydantic, python-async, go-http, go-errors, go-concurrency |
| **Database** | postgres, mysql, mongodb, prisma, sqlalchemy, go-database, indexes, migration, schema-design |
| **Frontend** | react, nextjs, typescript, tailwind, hooks, server-components, routing, forms, state-management |
| **API** | rest, graphql, pagination, versioning, rate-limiting, webhooks, open-api, sdk |
| **Testing** | unit, integration, e2e, pytest, go-testing, load, accessibility, test-strategy |
| **Performance** | caching, go-performance, bundle-size, rendering, queries |
| **DevOps** | docker, kubernetes, github-actions, cicd, deployment, environments, rollback |
| **System Design** | architecture, caching, microservices, event-driven, distributed-systems, high-availability |
| **Design** | 74 brand design languages — apple, stripe, linear, vercel, airbnb, spotify… |
| + AI, Review, Documentation, Checklists, Startup, Business, Open Source, Templates, Community, Research | |

Browse everything with logos and search at **[agent.md](https://agent.md)**, or from the terminal:

```bash
npx agentmd-cli search "rate limiting"
npx agentmd-cli list claude/Security
npx agentmd-cli info Security/jwt
```

Every install fetches the file straight from this repository over HTTPS. No mirror, no account, no telemetry.

---

## 🤝 Contributing

Standards are plain markdown, written once in `_canonical/<Category>/<name>.md`:

```markdown
---
name: jwt
category: Security
description: Issuing and validating JSON Web Tokens safely — algorithm pinning, claim validation, key rotation.
license: MIT
author: Agent.md maintainers
last-verified: 2026-09-13
reviewed-by: unreviewed
version: 2.0.0
---

# Purpose
…
# Anti-patterns
…
# Checklist
```

The bar: imperative, specific, opinionated, short right/wrong code blocks, an anti-patterns table and a checklist, ~200 lines. Match a neighbour in the same category. Open a PR with the canonical file; maintainers generate the eleven family variants.

**Most wanted right now:** Rust, Vue, Svelte, NestJS and Java. The CLI already detects those stacks and deliberately recommends nothing, because there is no content for them yet.

See [CONTRIBUTING.md](CONTRIBUTING.md).

---

## ❓ FAQ

**Is this a replacement for `CLAUDE.md` / `AGENTS.md` / Cursor rules?**
No. Those are file formats. Agent.md is the distribution layer that fills them in and keeps them current — `link` writes into whichever ones your tools already read.

**Does it paste 30 standards into my prompt?**
No. `link` writes a short block of *links*; the agent opens a standard when it needs it. For Cursor it also writes one scoped rule per standard with file globs, attached only while a matching file is open.

**What does `review --fast` actually check?**
Deterministic patterns over the added lines of a diff, scoped to the standards you installed — string-interpolated SQL, `SELECT *`, `eval`, shell commands built from variables, weak hashes for secrets, `Math.random()` tokens, `jwt.decode` without verify, wildcard CORS, hard-coded secrets, Pydantic v1 calls, synchronous `cookies()` in Next.js 15+. High precision on purpose; the model-backed review catches the rest.

**Why one file per family instead of one file?**
Models differ in what they follow. Claude responds to XML-tagged sections; OpenAI models to compact imperative bullets. Writing once and generating per family keeps content identical while the shape fits the reader.

**Is anything paid?**
No. All 302 standards, the CLI, the extension and the MCP server are MIT licensed. `review`, `extract` and `test` use your own Anthropic key (or Ollama) when they need a model; `review --fast` needs nothing.

---

## License

[MIT](LICENSE). Use it anywhere, including commercial projects, no attribution required.

<div align="center">

**[agent.md](https://agent.md)** · **[npm](https://www.npmjs.com/package/agentmd-cli)** · **[X](https://x.com/agent_dot_md)**

</div>
