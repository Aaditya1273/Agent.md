# agentmd-cli

> Install AI engineering presets into any project. One command. Zero friction.

```bash
npx agentmd-cli install claude/Design/apple
```

[![npm](https://img.shields.io/npm/v/agentmd-cli)](https://www.npmjs.com/package/agentmd-cli)

---

## How Installation Works — 2 Layers

The install command supports exactly **2 levels of depth**. This is intentional.

### Layer 1 — Single preset

Install one specific preset:

```bash
npx agentmd-cli install claude/<category>/<preset>
```

```bash
npx agentmd-cli install claude/Design/apple
npx agentmd-cli install claude/Security/owasp
npx agentmd-cli install claude/Testing/unit
npx agentmd-cli install claude/AI/context
```

You get exactly one `.md` file dropped into `.agentmd/presets/`.

---

### Layer 2 — Full category

Install every preset inside a category at once:

```bash
npx agentmd-cli install claude/<category>/
```

```bash
npx agentmd-cli install claude/Security/
npx agentmd-cli install claude/Testing/
npx agentmd-cli install claude/Design/
npx agentmd-cli install claude/Performance/
```

You get all presets in that category in one command. Useful when you want a complete domain — e.g. all Security standards, all Testing strategies, all Design languages.

---

### What is blocked

```bash
npx agentmd-cli install claude/   # blocked — too broad
npx agentmd-cli install claude    # blocked — too broad
```

Installing the entire model in one shot is intentionally not allowed. It removes the reason to explore and choose — which is the whole point of the registry.

---

## Browse Before You Install

```bash
# See all available categories
npx agentmd-cli list claude

# See all presets inside a category
npx agentmd-cli list claude/Design
npx agentmd-cli list claude/Security
npx agentmd-cli list claude/Testing

# Search by keyword
npx agentmd-cli search authentication
npx agentmd-cli search docker
npx agentmd-cli search apple
```

---

## What Gets Installed

Files land in your project at:

```
your-project/
└── .agentmd/
    ├── manifest.json              ← tracks installed presets + versions
    └── presets/
        ├── Security-owasp.md
        ├── Security-authentication.md
        ├── Design-apple.md
        └── ...
```

Copy the content into your `CLAUDE.md` or reference the files directly from your AI assistant's context.

---

## All Categories (claude)

| Category | Presets | Install All |
|---|---|---|
| AI | 6 | `npx agentmd-cli install claude/AI/` |
| API | 6 | `npx agentmd-cli install claude/API/` |
| Backend | 6 | `npx agentmd-cli install claude/Backend/` |
| Business | 5 | `npx agentmd-cli install claude/Business/` |
| Checklists | 4 | `npx agentmd-cli install claude/Checklists/` |
| Community | 2 | `npx agentmd-cli install claude/Community/` |
| Database | 7 | `npx agentmd-cli install claude/Database/` |
| Design | 74 | `npx agentmd-cli install claude/Design/` |
| DevOps | 5 | `npx agentmd-cli install claude/DevOps/` |
| Documentation | 3 | `npx agentmd-cli install claude/Documentation/` |
| Open-Source | 6 | `npx agentmd-cli install claude/Open-Source/` |
| Performance | 6 | `npx agentmd-cli install claude/Performance/` |
| Research | 3 | `npx agentmd-cli install claude/Research/` |
| Review | 3 | `npx agentmd-cli install claude/Review/` |
| Security | 5 | `npx agentmd-cli install claude/Security/` |
| Startup | 3 | `npx agentmd-cli install claude/Startup/` |
| System Design | 4 | `npx agentmd-cli install claude/System Design/` |
| Templates | 6 | `npx agentmd-cli install claude/Templates/` |
| Testing | 4 | `npx agentmd-cli install claude/Testing/` |

---

## Options

```
--force    Re-install even if preset is already installed
--help     Show help
--version  Show version
```

---

## Quick Reference

```bash
# Discover
npx agentmd-cli list claude
npx agentmd-cli list claude/Design
npx agentmd-cli search auth

# Install one
npx agentmd-cli install claude/Design/apple
npx agentmd-cli install claude/Security/owasp

# Install a full category
npx agentmd-cli install claude/Security/
npx agentmd-cli install claude/Testing/
npx agentmd-cli install claude/Design/
```

---

More at [agentmd.com](https://agentmd.com)
