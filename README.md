<div align="center">
<img width="250" height="250" alt="logo" src="https://github.com/user-attachments/assets/cbaa799c-9358-424b-a487-505c50b0aa41" />

# Agent.md

## ESLint for CLAUDE.md, AGENTS.md and agent skills

Your AI coding agent follows these files blindly, before it reads a line of your code.<br>
Agent.md finds the **leaked keys, hidden instructions, dead references and toxic skill scripts** in them.<br>
Any repo. Ten seconds. No account.

```bash
npx activate-agentmd audit your/repo
```

[![npm version](https://img.shields.io/npm/v/activate-agentmd?color=6366f1&label=activate-agentmd)](https://www.npmjs.com/package/activate-agentmd)
[![npm downloads](https://img.shields.io/npm/dm/activate-agentmd?color=8b5cf6)](https://www.npmjs.com/package/activate-agentmd)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Node](https://img.shields.io/badge/node-%E2%89%A518-339933?logo=node.js&logoColor=white)](https://nodejs.org)
[![PRs welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)
[![Hacktoberfest](https://img.shields.io/badge/Hacktoberfest-2026-ff6b35)](https://github.com/Aaditya1273/Agent.md/issues?q=is%3Aissue+is%3Aopen+label%3Ahacktoberfest)
![Visitors](https://api.visitorbadge.io/api/visitors?path=https%3A%2F%2Fgithub.com%2FAaditya1273%2FAgent.md&label=Visitors&countColor=%23d9e3f0&style=flat&labelStyle=upper)

</div>

### What it finds

Real output, on a small example repo:

```text
  Agent context audit  acme-app
  2 files an agent reads · ~52 tokens loaded on every prompt

     1  secrets in files the agent reads
     1  prompt-injection signals
     1  dangerous patterns in 1 skill script
     1  references to files that no longer exist
     1  formatting rules a formatter already enforces  auto-fixable

  ERROR   .claude/skills/deploy/scripts/run.sh:2  skill-payload
          Downloads code and pipes it straight into a shell.
  ERROR   CLAUDE.md:4  secret
          Looks like an Anthropic API key. Instruction files are sent to the model on every session.
  ERROR   CLAUDE.md:6  injection
          An HTML comment carries an instruction. GitHub hides comments from reviewers but the agent reads them.
  WARNING CLAUDE.md:3  stale-reference
          `src/auth/middleware.ts` does not exist in this repository. The agent will look for it and guess.
```

| Command | What it does |
| --- | --- |
| `npx activate-agentmd audit owner/repo` | Check any public GitHub repo, without cloning it |
| `npx activate-agentmd lint` | Check your own repo. Exits non-zero in CI; SARIF for code scanning |
| `npx activate-agentmd lint --fix` | Delete what only costs tokens: rules your formatter already enforces, duplicated lines |
| `npx activate-agentmd init` | Optional: add version notes and standards for your exact stack |

It reads `CLAUDE.md`, `AGENTS.md`, `GEMINI.md`, Cursor and Copilot rules, every `SKILL.md` and the scripts beside it, and MCP configs, for **Claude Code, Cursor, Codex, Copilot and Gemini CLI**. Free, open source, runs locally, nothing uploaded. Precision first: **zero false alarms across the 4,293 files of this repository** and the instruction files of 20 large open-source projects. What it cannot see: [docs/KNOWN-LIMITS.md](docs/KNOWN-LIMITS.md).

**[The problem](#-the-problem) · [What it does](#-what-agentmd-does) · [Quick start](#-quick-start) · [Why now](#-why-now-the-market-in-october-2026) · [Why it's different](#-why-its-different) · [For teams](#-for-teams-signed-context) · [CI](#-enforce-it-in-ci) · [Research](#-what-the-research-says--and-what-we-changed) · [FAQ](#-faq)**

---

## 🔥 The problem

AI agents now write a large share of production code, and every one of them reads a rules file first — `CLAUDE.md`, `AGENTS.md`, `.cursor/rules`, `GEMINI.md`, `copilot-instructions.md`. Those files decide what the agent believes about your codebase. Three things go wrong with them, and until now nothing addressed any of the three.

### 1. The agent writes your dependencies as they were, not as they are

```ts
// Next.js 16 · Prisma 7 · Zod 4 — what an agent writes from memory. All of it compiles.
const prisma = new PrismaClient();                    // Prisma 7: no engine by default — fails at runtime
const Email  = z.string().email();                    // Zod 4: deprecated, use z.email()
export default function Page({ params }: { params: { slug: string } }) {
  const token = cookies().get("session");             // Next 16: cookies() and params must be awaited
}
```

This is not a hallucination you can prompt away. **Frontier models are version-oblivious**: JetBrains Research measured a persistent 7–10 point accuracy gap on APIs that changed between versions, and found that **telling the model the version gives no benefit — the relevant documentation gives +10–20 points** ([LibEvoBench, 2026](https://arxiv.org/abs/2606.25402)). The fix has to be in the context, and it has to be specific to the majors you actually run.

### 2. The instruction files are an unguarded attack surface

These files are fed to the model on every session, with the agent's full permissions behind them.

- **~0.7% of public agent instruction files contain a live credential**, mostly pasted by hand ([Radware, Aug 2026](https://www.radware.com/blog/the-new-env-measuring-credential-leakage-in-ai-agent-instruction-files/)) — and mainstream secret scanners don't watch these files.
- **Rule files are a working prompt-injection channel**: a malicious rule can exfiltrate data while the agent still produces a correct patch ([Aletheia, 2026](https://arxiv.org/abs/2609.39678)).
- **Skill scanners stop at `SKILL.md`** and miss `AGENTS.md`, `CLAUDE.md` and Cursor rules ([snyk/agent-scan#301](https://github.com/snyk/agent-scan/issues/301)); in one audit **13.4% of marketplace skills had a critical issue** ([Snyk ToxicSkills](https://snyk.io/blog/toxicskills-malicious-ai-agent-skills-clawhub/)), and every skill scanner tested was bypassed ([CSA / Trail of Bits](https://labs.cloudsecurityalliance.org/research/csa-research-note-ai-agent-skill-scanner-bypass-20260610-csa/)).

### 3. They rot and bloat — and bloat costs accuracy

- Agent instruction files **grow +226% over their lifetime**, and noisy instructions **cut instruction-following by 24 points** ([arXiv 2608.11095](https://arxiv.org/abs/2608.11095)).
- **91 of the 100 most-starred repos** have at least one configuration smell — leaked lint rules, bloat, dead references, contradictions, never-edited `/init` output ([arXiv 2606.15828](https://arxiv.org/abs/2606.15828)).

> **The painkiller:** put the exact breaking changes for your exact versions in front of the agent, check every file it reads like you check code, and make sure nobody changes those files without sign-off.

---

## 💊 What Agent.md does

| | Pillar | The pain it removes |
| --- | --- | --- |
| 🔒 | **`agentmd lint`** — checks every file an agent reads (instruction files, skills, MCP configs) for leaked keys, prompt injection, invisible Unicode, hidden HTML-comment instructions, unsafe hooks, bloat, duplicated rules, references to files that no longer exist, and stale pins. `--fix` deletes what only costs tokens. `audit owner/repo` runs it on any public repo. Exits non-zero in CI; SARIF for code scanning. | Secrets and injected instructions reaching the model; context rot |
| ⇅ | **Version pins + checks** — reads the majors you actually run (from `node_modules`, `package.json`, `pyproject.toml`, `go.mod`) and puts their breaking changes in the agent's context. 21 deterministic checks then catch the old API in the diff, scoped to your version. Biggest effect where the model's training predates the version. | Deprecated code that compiles, passes review, and breaks later |
| ✍️ | **Signed context bundles** — sign the exact set of instruction files your team approved with your own Ed25519 key. CI fails on any modified, added or removed file, and `attest` records which context was in force for each commit. | Unreviewed rule changes; no audit trail for agent-written code |
| 📚 | **308 engineering standards, on demand** — security, backend, database, frontend, API, testing, DevOps, motion design and more, each loaded only when the agent works in that area, in each agent's own scoped format. | Re-writing the same 400-line rules file in every repo |

---

## 🚀 Quick start

**1. Detect the stack, pin breaking changes, install standards**

```bash
npx activate-agentmd init
```
```
  ✓ Next.js                  package.json (next)
  ✓ PostgreSQL               package.json (pg)
  ⇅ Next.js 16               node_modules (next 16.0.3)    (version pin)
  ⇅ Prisma 7                 package.json (@prisma/client ^7.0.0)

Recommended packages for claude:
  Security       authentication, owasp, sql-injection
  Database       postgres, prisma, indexes, migration
Install these? [Y/n]
```

**2. Check every file your agent reads** — works on any repository, nothing to install first

```bash
npx activate-agentmd lint
```
```
  ERROR   CLAUDE.md:14  secret
          Looks like an Anthropic API key. Instruction files are sent to the model on every session — rotate it, then read it from the environment.
  ERROR   .cursor/rules/deploy.mdc:3  injection
          An HTML comment carries an instruction. GitHub hides comments from reviewers but the agent reads them.
  WARNING CLAUDE.md:1  stale-pins
          The version pins in the agentmd block do not match the dependencies this project now runs.

  2 errors, 1 warning across 6 instruction files
```

**3. See the breaking changes for the versions you run**

```bash
npx activate-agentmd pins
```

**4. Check a diff — deterministic, offline, zero tokens**

```bash
npx activate-agentmd review --fast --fail-on=high
```
```
  MEDIUM app/page.tsx:12  Next.js 16 › next-sync-request-api  [pattern]
         Next.js 16: `cookies()` / `headers()` must be awaited — synchronous access was removed.
  HIGH   src/repo.ts:14   Security/sql-injection › sql-string-interpolation  [pattern]
         SQL built by string interpolation — use a parameterised query.
```

**5. Wire it into your agents**

```bash
npx activate-agentmd link
```

`link` writes a managed block into whichever of `CLAUDE.md`, `AGENTS.md`, `.cursor/rules`, `GEMINI.md` and `copilot-instructions.md` your tools read. Commit `.agentmd/` and the whole team gets the same rules.

<div align="center">
<a href="https://agentmd.pages.dev/connect"><img src="https://raw.githubusercontent.com/Aaditya1273/Agent.md/main/assets/setup.png" alt="Set up in one command — Claude Code, Cursor, Codex, Gemini CLI, VS Code, Antigravity" width="92%"></a>
</div>

**Or try it in the browser in 10 seconds** at **[agentmd.pages.dev/inspect](https://agentmd.pages.dev/inspect)** — drop a `package.json` to see every major your agent will get wrong, or paste a `CLAUDE.md` to check it for leaked keys and prompt injection. Nothing is uploaded.

---

## 📈 Why now: the market in October 2026

**Agents are the default way code gets written.** Claude Code is used at work by **47% of US developers** and is the primary tool for 31%; Codex grew roughly **5× in six months** ([JetBrains Developer Ecosystem Survey 2026](https://blog.jetbrains.com/research/2026/08/ai-coding-agent-adoption-2026/)), with **5M+ weekly users** ([OpenAI](https://openai.com/index/codex-for-every-role-tool-workflow/)). Every one of those sessions starts by reading an instruction file.

**The file formats have standardised — the trust layer has not.**

| What settled in 2025–26 | What it deliberately left open |
| --- | --- |
| **AGENTS.md** — 60,000+ repositories, 28+ tools, stewarded by the Linux Foundation's Agentic AI Foundation ([agents.md](https://agents.md)) | What goes *in* the file, whether it is current, whether it is safe |
| **Agent Skills** and **Agent Plugins 1.0** (Amazon, Cursor, Microsoft, OpenAI, Vercel — Aug 2026) standardise packaging ([Vercel](https://vercel.com/blog/introducing-agent-plugins)) | The spec **explicitly excludes provenance, signing and permissions** |
| Skill scanners from Snyk, Socket and others | `CLAUDE.md`, `AGENTS.md` and rules files — and every scanner was bypassed |

**Governance demand is arriving with deadlines.** Gartner sizes AI-governance platforms as a **billion-dollar market growing 36% a year** ([Gartner, Feb 2026](https://www.gartner.com/en/newsroom/press-releases/2026-02-17-gartner-global-ai-regulations-fuel-billion-dollar-market-for-ai-governance-platforms)); the EU AI Act's high-risk logging obligations took effect in August 2026. Teams need to show *what their agents were told* — and today no tool records it.

**Where that leaves the market:**

```
                     what the agent knows ─────────────────────► what the agent did
  ┌─────────────────────────────┬──────────────────────────┬───────────────────────────┐
  │ Docs retrieval (Context7)   │  ★ Agent.md              │ Code review (CodeRabbit,  │
  │ Skills marketplaces         │  version pins · lint ·   │ Claude Code /code-review) │
  │ Hand-written CLAUDE.md      │  signed, attested context│ SAST (Semgrep, Snyk)      │
  └─────────────────────────────┴──────────────────────────┴───────────────────────────┘
```

Everyone else works on what the agent *can look up* or what it *already wrote*. Agent.md owns the layer in between: **what the agent is told, whether it is true for your versions, and whether anyone approved it.**

---

## 🧭 Why it's different

| | Agent.md | Hand-written `CLAUDE.md` | Skills marketplaces | Docs retrieval (Context7) | Code review bots |
| --- | :--: | :--: | :--: | :--: | :--: |
| Breaking changes for *your* installed majors, in context before the agent writes | ✅ | ✋ by hand | ❌ | ⚠️ when the agent asks | ❌ |
| Deterministic check for the old API, scoped by version | ✅ 21 checks | ❌ | ❌ | ❌ | ⚠️ model-judged |
| Lints `CLAUDE.md` / `AGENTS.md` / rules / skills for secrets and injection | ✅ | ❌ | ⚠️ `SKILL.md` only | ❌ | ❌ |
| Signed, approved context with an audit record per commit | ✅ | ❌ | ❌ | ❌ | ❌ |
| Works across Claude Code, Cursor, Codex, Gemini CLI, Copilot | ✅ 5 | ❌ 1 | ⚠️ varies | ✅ via MCP | ⚠️ varies |
| Runs offline, no account, no API key for the core | ✅ | ✅ | ⚠️ | ❌ | ❌ |
| Open source | ✅ MIT | n/a | ⚠️ varies | ⚠️ partly | ❌ mostly |

**What makes it hard to copy:**

1. **Neutral across vendors.** Every agent vendor's incentive is to make *its own* context load more easily. A record of what Claude Code, Cursor and Copilot were told — signed with *your* key — has to come from someone who is none of them.
2. **Deterministic, not model-judged.** Checks are regular expressions with a must-catch and a must-not-fire sample each, tested in CI. A gate that cries wolf gets switched off; this one reports **zero errors and zero warnings across the 4,293 files of this registry**, including security standards that quote attacks to teach them.
3. **Evidence-first content.** Pins are measured, not asserted: each one carries a deterministic judge, and the effect (old-API rate with vs. without the pin) is run on more than one model before it is published. No pin is added until the existing ones show an effect that repeats.
4. **It honours the research instead of fighting it.** See below.

---

## 🔬 What the research says — and what we changed

Three independent 2026 studies measured generic, always-on context files and found **no gain in task success at 20%+ more cost**; LLM-generated ones made agents *worse* ([ETH Zurich, arXiv 2602.11988](https://arxiv.org/abs/2602.11988); [arXiv 2607.27250](https://arxiv.org/abs/2607.27250); [arXiv 2608.11095](https://arxiv.org/abs/2608.11095)). The exception is **version-specific API facts** ([LibEvoBench](https://arxiv.org/abs/2606.25402)).

So Agent.md was redesigned around that evidence:

| Finding | What Agent.md does now |
| --- | --- |
| Always-on generic guidance costs more than it helps | **Only version pins are always on.** Every standard loads on demand, when the agent opens a matching file. |
| Version-specific facts help, naming the version doesn't | Pins state the *changed API*, read from what is actually installed in `node_modules` |
| Noise and bloat measurably hurt | `lint` flags bloat, dead references, leaked lint rules and stale pins |
| Effect has to be measured, not assumed | Every pin has a deterministic judge; `agentmd test --baseline` reports what a standard *changed*, not just whether it was obeyed |
| Instruction files are a security boundary | `lint` treats them as untrusted input; `bundle` makes changes reviewable |

---

## 🏛 The pillars in depth

### ⇅ Version pins

`link` writes the breaking changes for the majors you run, first in every agent file:

```markdown
### Version pins (detected from this project)

**Next.js 16** — _node_modules (next 16.0.3)_
- Request APIs are async only — `params`, `searchParams`, `cookies()`, `headers()` must be awaited.
- `middleware.ts` is `proxy.ts`; the old filename is not picked up.

**Prisma 7** — _package.json (@prisma/client ^7.0.0)_
- No Rust query engine by default: instantiate the client with a driver adapter, not a bare `new PrismaClient()`.
```

Coverage: Next.js 13–16, React 18–19, Pydantic 1–2, SQLAlchemy 2, Django 5, Prisma 5–7, Tailwind 3–4, Express 5, Zod 4, ESLint 9, Vue 3, Go 1.22–1.25, Python 3.12–3.13. The installed version beats the declared range, so a lockfile bump from 15 to 16 is pinned as 16 — and `lint` flags the block as stale until you run `link`.

### 🔒 `agentmd lint`

| Severity | Rule | Catches |
| --- | --- | --- |
| error | `secret` | Anthropic, OpenAI, GitHub, AWS, Slack, Stripe, Google keys; private keys; long values assigned to secret names. Placeholders are ignored; the secret is never echoed. |
| error | `injection` | "ignore previous instructions", permission-bypass flags, zero-width / bidi / tag characters, instructions hidden in HTML comments, hooks that pipe a download into a shell |
| warning | `bloat` · `blind-reference` · `stale-pins` · `permissions` | always-on files over 200 lines, `@file` links to nothing, pins out of date, unscoped `Bash` permissions |
| notice | `lint-leakage` · `fossil` | formatting rules a formatter already enforces, unedited `/init` output |

Injection rules read prose only — not code fences, not inline code, not lines that warn *against* the thing — so documentation about attacks doesn't trip them.

### 🎯 On-demand standards

Each installed standard is written in the agent's own scoped format, so it costs nothing until it's relevant:

| Agent | On-demand format |
| --- | --- |
| Claude Code | `.claude/rules/*.md` with `paths:` |
| Cursor | `.cursor/rules/*.mdc` with `globs:`, `alwaysApply: false` |
| GitHub Copilot | `.github/instructions/*.instructions.md` with `applyTo` |
| Codex, Gemini CLI | linked from `AGENTS.md` / `GEMINI.md` |

The Postgres standard costs nothing while you edit CSS. Overrides in `.agentmd/overrides/` replace a registry standard with your team's own text.

---

## 🏢 For teams: signed context

```bash
npx activate-agentmd bundle keygen --out ~/keys/agentmd.key --kid acme-2026   # private key never inside the repo
npx activate-agentmd bundle sign --key ~/keys/agentmd.key                     # writes .agentmd/bundle.sig
npx activate-agentmd bundle verify                                            # exit 1 on any change
npx activate-agentmd bundle attest                                            # commit + context digest, as JSON
```

```
  ✗  the files an agent reads have changed since the bundle was signed
     modified    CLAUDE.md
     unapproved  .cursor/rules/new-rule.mdc
```

- Covers every instruction file plus installed standards, overrides and policy; per-developer `*.local.*` files stay out.
- `requireSignedContext: true` in `.agentmd/enterprise.json` makes `lint` fail on any unsigned change.
- **In CI, pin trusted keys from a secret** (`AGENTMD_BUNDLE_KEYS`) — otherwise a pull request could swap the key in the repo and re-sign. `verify` warns when it isn't set.
- `attest` gives an auditor one record per build: the commit, a digest of every instruction in force, and whether it was approved.

This is a CI and review gate, not runtime enforcement: it stops an unapproved instruction file from merging unseen.

---

## 🛡 Enforce it in CI

```yaml
name: agentmd
on: [pull_request]
permissions:
  contents: read
jobs:
  agentmd:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with: { fetch-depth: 0 }
      - uses: actions/setup-node@v4
        with: { node-version: 20 }
      - run: npx --yes activate-agentmd lint                    # secrets, injection, stale pins
      - run: npx --yes activate-agentmd review --base origin/${{ github.base_ref }} --fast --fail-on=high
```

Zero tokens, no API key, nothing leaves the runner. Upload `lint --sarif` to GitHub code scanning to see findings inline. `npx activate-agentmd ci --write` generates this workflow for you.

---

## 🤖 Supported agents

| Target | File written | Read by |
| --- | --- | --- |
| `claude` | `CLAUDE.md` + `.claude/rules/` | Claude Code |
| `agents` | `AGENTS.md` | Codex, Amp, Jules, Antigravity, Devin and others |
| `cursor` | `.cursor/rules/agentmd.mdc` + one scoped rule per standard | Cursor |
| `gemini` | `GEMINI.md` | Gemini CLI |
| `copilot` | `.github/copilot-instructions.md` + `.github/instructions/` | GitHub Copilot |

**Agent Skills.** Two skills teach the agent to use the toolchain — `agentmd-usage` (install, pins, lint) and `agentmd-standards` (following what's installed):

```bash
npx skills@latest add Aaditya1273/Agent.md -a claude-code -a cursor -y
```

**MCP server.** Search and read standards mid-task:

```bash
claude mcp add --transport http agentmd https://agentmd.pages.dev/api/mcp     # Claude Code
codex  mcp add agentmd --url https://agentmd.pages.dev/api/mcp                # Codex
gemini mcp add --transport http agentmd https://agentmd.pages.dev/api/mcp     # Gemini CLI
```

Cursor and VS Code: one click at **[agentmd.pages.dev/connect](https://agentmd.pages.dev/connect)**.

---

## 📚 The registry

<a href="https://agentmd.pages.dev"><img src="https://raw.githubusercontent.com/Aaditya1273/Agent.md/main/assets/hero.png" alt="Agent.md registry — install standards with any agent" width="100%"></a>

This repository is the registry — plain markdown, written once in [`_canonical/`](https://github.com/Aaditya1273/Agent.md/tree/main/_canonical) and generated for eleven model families (Claude, OpenAI, Gemini, DeepSeek, Grok, Qwen, Kimi, GLM, MiniMax, Mistral, Sarvam).

| Category | Examples |
| --- | --- |
| **Security** | owasp, jwt, oauth, sql-injection, xss, csrf, cors, secret-management, passwords, headers |
| **Backend** | express, nextjs, fastapi, django, flask, pydantic, python-async, go-http, go-errors, go-concurrency |
| **Database** | postgres, mysql, mongodb, prisma, sqlalchemy, indexes, migration, schema-design |
| **Frontend** | react, nextjs, typescript, tailwind, hooks, server-components, routing, forms, state-management |
| **API** | rest, graphql, pagination, versioning, rate-limiting, webhooks, open-api |
| **Testing** | unit, integration, e2e, pytest, go-testing, load, accessibility, test-strategy |
| **Performance · DevOps · System Design** | caching, bundle-size, docker, kubernetes, github-actions, cicd, microservices, event-driven |
| **Design** | 74 brand design languages — apple, stripe, linear, vercel, airbnb, spotify… |
| **Motion** 🆕 *(Claude)* | lumen — bright keynote-grade launch films · hanami — cherry-blossom cinematic films · hanko-reel — ink-and-seal films: washi paper, sumi ink, one vermilion seal · truecut — a 60–120 s demo edited from one honest screen recording. All built in code: story, motion, voice, score, render |
| + AI, Review, Documentation, Checklists, Startup, Business, Open Source, Templates, Community, Research | |

```bash
npx activate-agentmd search "rate limiting"
npx activate-agentmd info Security/jwt
npx activate-agentmd install Database/          # a whole category
npx activate-agentmd install claude/Motion/lumen # make a launch film with Claude
```

Browse with logos and search at **[agentmd.pages.dev](https://agentmd.pages.dev)**. Full CLI reference: [docs/cli.md](docs/cli.md).

---

## 💳 Free and Pro

| | Free — MIT, forever | Pro |
| --- | --- | --- |
| `init`, `link`, `install`, `update`, `pins`, `lint`, `review --fast`, `review --local`, `bundle` | ✅ | ✅ |
| All 308 standards, the MCP server, the skills | ✅ | ✅ |
| `extract` (derive your team's conventions), private standards sync, analytics | | ✅ |

**Pro: $9/month ($7/month billed yearly), early access.** Checkout is not open yet: [join the waitlist →](https://tally.so/r/QKg14g)

Everything in the Free column works today with no account and no key.

---

## 🤝 Contributing

Standards are plain markdown in `_canonical/<Category>/<name>.md`. The bar: imperative, specific, short wrong/right code pairs, an anti-patterns table and a checklist — and **evidence that the standard changes what a model writes** (`agentmd test --baseline` prints it). A standard that doesn't change the output isn't a standard; it's a file.

**Hacktoberfest 2026:** the [open issues](https://github.com/Aaditya1273/Agent.md/issues?q=is%3Aissue+is%3Aopen+label%3Ahacktoberfest) are scoped, markdown-only and need no build — new standards for Vue, Svelte, Angular, Rust, NestJS, Fastify and Java; upgrades of legacy packages; verification against React 19, Next 16, Prisma 7 and Tailwind 4. See [CONTRIBUTING.md](CONTRIBUTING.md).

---

## 🗺 Roadmap

| Status | Item |
| --- | --- |
| ✅ **Shipping** | CLI · version pins with 21 checks · `lint` (+ SARIF, and in the browser at /inspect) · signed context bundles · `review --fast` · `test --baseline` · on-demand rules for 5 agents · MCP server · Agent Skills · 308 standards · Motion category (Claude) |
| 🔬 **Measuring** | Effect of every pin (old-API rate with vs. without), on more than one model before anything is published. Pin expansion is paused until the effect repeats |
| 🔨 **Next** | More lint rules · more Motion standards · library authors publishing their own pins · pins for more libraries once measurement supports it |
| 💭 **Considering** | Hosted audit log for teams · signed-bundle format proposed to the AGENTS.md specification |

---

## ❓ FAQ

**Is this a replacement for `CLAUDE.md` / `AGENTS.md` / Cursor rules?**
No — those are file formats. Agent.md fills them with what is true for your versions, checks them, and makes changes to them reviewable.

**Does it paste 30 standards into every prompt?**
No. Only version pins are always on. Standards load on demand, when the agent opens a matching file.

**Does `lint` need Agent.md installed in the repo?**
No. `npx activate-agentmd lint` works on any repository with any agent instruction files.

**What does `review --fast` check?**
Deterministic patterns over the added lines of a diff — injection, weak crypto, wildcard CORS, hard-coded secrets — plus the version checks for the majors you run. No model, no key, milliseconds.

**Does anything leave my machine?**
`init`, `install`, `link`, `pins`, `lint`, `bundle` and `review --fast` / `--local` run offline. `review` (model mode), `extract` and `test` send the diff or evidence to the Anthropic API under your own key. Anonymous usage counters are **off by default** and opt-in (`agentmd telemetry`).

**Does a pin actually change what a model writes?**
That is the right question, and it is being measured rather than assumed. On a current frontier-class model, the first run of 140 tasks found the effect concentrated in a few libraries, because recent models already know most of these versions. Pins matter most when the model's training predates the version you run. Results are published once they repeat on a second model.

---

## License

[MIT](LICENSE). Use it anywhere, including commercial projects, no attribution required.

<div align="center">

**[agentmd.pages.dev](https://agentmd.pages.dev)** · **[npm](https://www.npmjs.com/package/activate-agentmd)** · **[X @agent_dot_md](https://x.com/agent_dot_md)**

<sub>If Agent.md saved you a debugging session, a ⭐ helps the next person find it.</sub>

</div>
