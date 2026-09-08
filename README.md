<div align="center">

# Agent.md

**The Open Registry for AI Engineering Presets.**

Configure Claude and every AI coding assistant with production-ready engineering standards in seconds.

<img width="1672" height="941" alt="AGENT.md" src="https://github.com/user-attachments/assets/9eae353f-7e57-4254-a06d-033f3027f6f6" />

[![npm](https://img.shields.io/npm/v/agentmd-cli?label=agentmd-cli&color=000)](https://www.npmjs.com/package/agentmd-cli)
[![npm downloads](https://img.shields.io/npm/dm/agentmd-cli?color=000)](https://www.npmjs.com/package/agentmd-cli)
[![License: MIT](https://img.shields.io/badge/license-MIT-000.svg)](LICENSE)
![Visitors](https://api.visitorbadge.io/api/visitors?path=https%3A%2F%2Fgithub.com%2FAaditya1273%2FAgent.md&label=Visitors&countColor=%23d9e3f0&style=flat&labelStyle=upper)

</div>

---

## The Problem

Every AI coding assistant is capable. Getting *consistent* output is the hard part.

Every model behaves differently. Every IDE expects different config files. Every GitHub repo suggests different prompts. Developers waste hours searching Reddit, Discord, and blog posts trying to figure out which `CLAUDE.md` actually works, which Cursor rules are up to date, or how to stop Gemini from hallucinating architecture.

There is no trusted, centralized place for AI engineering standards.

**Agent.md is that place.**

---

## Install a Preset in One Command

```bash
npx agentmd-cli install claude/Security/owasp
```

No cloning. No searching GitHub. The preset lands directly in your project.

---

## CLI — 2-Layer Install System

**Layer 1 — Single preset**

```bash
npx agentmd-cli install claude/<category>/<preset>
```

```bash
npx agentmd-cli install claude/Design/apple
npx agentmd-cli install claude/Security/jwt
npx agentmd-cli install claude/Frontend/react
npx agentmd-cli install claude/AI/agent-rules
npx agentmd-cli install claude/Testing/unit
```

**Layer 2 — Full category (all presets at once)**

```bash
npx agentmd-cli install claude/<category>/
```

```bash
npx agentmd-cli install claude/Security/
npx agentmd-cli install claude/Frontend/
npx agentmd-cli install claude/Testing/
npx agentmd-cli install claude/Design/
npx agentmd-cli install claude/AI/
```

**Browse and search**

```bash
npx agentmd-cli list claude                  # 20 categories, 297 presets
npx agentmd-cli list claude/Security         # all 19 Security presets
npx agentmd-cli search authentication        # find by keyword
npx agentmd-cli search docker
```

> Installing `claude/` alone is intentionally blocked. Explore and pick what your project needs.

**What gets installed**

```
your-project/
└── .agentmd/
    ├── manifest.json              ← tracks installed presets
    └── presets/
        ├── Security-jwt.md
        ├── Design-apple.md
        └── ...
```

---

## IDE Extension

Works in **VS Code, Cursor, and Kiro**.

```bash
code --install-extension packages/vscode-extension/agentmd-1.0.0.vsix
```

Or: Extensions sidebar → `···` → **Install from VSIX...**

**What you get:**

- Activity bar panel — browse all 20 categories and 297 presets in a sidebar tree
- Click any preset → opens a markdown preview webview with Install button
- Install a single preset or an entire category with one click
- **Installed** panel — shows your manifest, click any entry to open the file
- **Detect Stack** — reads your `package.json` and auto-suggests preset categories (Next.js → Backend, Prisma → Database, Stripe → Design, etc.)
- Search: `Ctrl+Shift+P` → `Agent.md: Search Presets`

**Commands**

```
Agent.md: Install Preset
Agent.md: Install All in Category
Agent.md: Search Presets
Agent.md: Preview Preset
Agent.md: Detect Project Stack & Suggest Presets
Agent.md: Refresh
Agent.md: Open Registry Website
```

---

## All Categories (Claude · 297 presets)

| Category | Presets | Install All |
|---|---|---|
| AI | 12 | `npx agentmd-cli install claude/AI/` |
| API | 12 | `npx agentmd-cli install claude/API/` |
| Backend | 15 | `npx agentmd-cli install claude/Backend/` |
| Business | 10 | `npx agentmd-cli install claude/Business/` |
| Checklists | 8 | `npx agentmd-cli install claude/Checklists/` |
| Community | 5 | `npx agentmd-cli install claude/Community/` |
| Database | 13 | `npx agentmd-cli install claude/Database/` |
| Design | 74 | `npx agentmd-cli install claude/Design/` |
| DevOps | 15 | `npx agentmd-cli install claude/DevOps/` |
| Documentation | 6 | `npx agentmd-cli install claude/Documentation/` |
| Frontend | 16 | `npx agentmd-cli install claude/Frontend/` |
| Open-Source | 14 | `npx agentmd-cli install claude/Open-Source/` |
| Performance | 13 | `npx agentmd-cli install claude/Performance/` |
| Research | 5 | `npx agentmd-cli install claude/Research/` |
| Review | 8 | `npx agentmd-cli install claude/Review/` |
| Security | 19 | `npx agentmd-cli install claude/Security/` |
| Startup | 8 | `npx agentmd-cli install claude/Startup/` |
| System Design | 16 | `npx agentmd-cli install claude/System Design/` |
| Templates | 7 | `npx agentmd-cli install claude/Templates/` |
| Testing | 11 | `npx agentmd-cli install claude/Testing/` |

---

## Design Presets — 74 Languages

Get Claude to output UI in the exact visual language of any of these:

`apple` · `stripe` · `vercel` · `linear.app` · `notion` · `figma` · `cursor` · `raycast` · `framer` · `shopify` · `airbnb` · `airtable` · `binance` · `bmw` · `bmw-m` · `bugatti` · `cal` · `claude` · `clay` · `clickhouse` · `cohere` · `coinbase` · `composio` · `dell-1996` · `elevenlabs` · `expo` · `ferrari` · `hashicorp` · `hp` · `ibm` · `intercom` · `kraken` · `lamborghini` · `lovable` · `mastercard` · `meta` · `minimax` · `mintlify` · `miro` · `mistral.ai` · `mongodb` · `nike` · `nintendo-2001` · `nvidia` · `ollama` · `opencode.ai` · `pinterest` · `playstation` · `posthog` · `renault` · `replicate` · `resend` · `revolut` · `runwayml` · `sanity` · `sentry` · `slack` · `spacex` · `spotify` · `starbucks` · `supabase` · `superhuman` · `tesla` · `theverge` · `together.ai` · `uber` · `vodafone` · `voltagent` · `warp` · `webflow` · `wired` · `wise` · `x.ai` · `zapier`

```bash
npx agentmd-cli list claude/Design     # see all 74
npx agentmd-cli install claude/Design/apple
npx agentmd-cli install claude/Design/stripe
npx agentmd-cli install claude/Design/   # all 74 at once
```

---

## How It Works

```
Choose AI model
      ↓
Choose category (Security, Frontend, Design...)
      ↓
Install via CLI or IDE extension
      ↓
Paste into CLAUDE.md or AI assistant context
      ↓
Build with consistent, production-quality output
```

Think of Agent.md as:

- **npm** — for AI engineering standards
- **shadcn/ui** — but for prompt configuration
- **Tailwind UI** — but for AI workflows
- **Awesome Lists** — but maintained, versioned, and production-tested

---

## Web Registry

Browse and preview all presets at [agentmd.com](https://agentmd.com)

Each preset page shows:
- Full markdown preview
- `npx agentmd-cli install` command with copy button
- Category-level batch install command

---

## Contributing

We welcome contributions — new presets, improvements to existing ones, and platform work.

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

---

## License

MIT — see [LICENSE](LICENSE)

---

<div align="center">

**Build better with AI. One preset at a time.**

[agentmd.com](https://agentmd.com) · [npm](https://www.npmjs.com/package/agentmd-cli) · [VS Code Marketplace](https://marketplace.visualstudio.com/items?itemName=agentmd.agentmd) *(coming soon)*

</div>
