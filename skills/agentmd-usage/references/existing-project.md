# Playbook: add standards to an existing project

Goal: extend what is there without disturbing hand-written agent config or
locally edited packages.

## 1. See the current state

```bash
npx activate-agentmd list --installed
npx activate-agentmd agents
```

If nothing is installed, this is really the new-project playbook — but keep
reading step 2, because existing config files change how `link` behaves.

Check which agent files exist: `CLAUDE.md`, `AGENTS.md`, `GEMINI.md`,
`.cursor/rules/agentmd.mdc`, `.github/copilot-instructions.md`. `link`
targets every one that exists unless `--agent=` says otherwise. Hand-written
content in the markdown files is preserved; only the block between
`<!-- agentmd:start -->` and `<!-- agentmd:end -->` is managed. The Cursor
`.mdc` file is owned entirely by agentmd.

## 2. Find what to add

Turn the ask into ids:

```bash
npx activate-agentmd search caching --category=Performance
npx activate-agentmd search auth
npx activate-agentmd info Security/csrf
```

Or let the scanner propose the gaps — `init` skips anything already
installed:

```bash
npx activate-agentmd init --dry
```

## 3. Install

```bash
npx activate-agentmd install Security/csrf
npx activate-agentmd install Security/cors
npx activate-agentmd install Database/query-optimization
```

Use the model prefix if the project standardises on a non-Claude variant
(`open-ai/Security/csrf`). Mixing variants in one project is allowed but
pointless; match whatever `list --installed` shows.

## 4. Remove what no longer applies

```bash
npx activate-agentmd remove Frontend/hydration
```

## 5. Relink and confirm

```bash
npx activate-agentmd link
npx activate-agentmd list --installed
```

Show the user the diff of the config file(s). If they have a locally edited
package (`outdated` marks it ✎), say so — it is left alone.
