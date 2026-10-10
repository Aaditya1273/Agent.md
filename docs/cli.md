# CLI reference

All output below is real output from the current build.

## Running it

`npx activate-agentmd <command>` requires no install, but does not put `agentmd` on
your PATH. `npm install -g activate-agentmd` gives you the short `agentmd` form.

The CLI detects which you used and prints matching suggestions, so its
next-step hints are always pasteable. Override with `AGENTMD_INVOCATION` if you
wrap it in your own script.

## Package paths

```
<model>/<category>/<package>
```

`model` is one of `claude`, `deepseek`, `gemini`, `glm`, `grok`, `kimi`, `minimax`, `mistral`, `open-ai`, `qwen` and `sarvam-ai`. Matching is
case-insensitive, so `claude/security/OWASP` resolves.

A trailing slash installs a whole category:

```bash
agentmd install claude/Security/owasp   # one package
agentmd install claude/Security/        # all 19
```

Whole-model installs are refused. A model has 304 packages and roughly 2 MB of
instructions; installing all of it would exceed any agent's usable context and
produce contradictory rules. Categories are the largest coherent unit.

## Where things go

| Path | What |
| --- | --- |
| `.agentmd/presets/` | Package content |
| `.agentmd/manifest.json` | What's installed, with version, checksum and source |

Commit both. That's how a team shares the same standards, and how changes to
your agent's instructions show up in review.

---

## init

```bash
agentmd init [--model=claude] [--yes] [--dry]
```

Scans the project and offers to install what matches.

```
agentmd  scanning project…

  ✓ Docker                   Dockerfile
  ✓ TypeScript               tsconfig.json
  ✓ GitHub Actions           .github/workflows/
  ✓ Prisma                   prisma/
  ✓ Next.js                  package.json (next)
  ✓ PostgreSQL               package.json (pg)

Recommended packages for claude:

  AI             agent-rules
  Backend        nextjs
  Database       prisma, orm, migration, schema-design, postgres, indexes
  ...

  31 to install

Install these? [Y/n]
```

`--dry` prints the install commands without running them. `--yes` skips the
prompt. A non-interactive stdin (CI, a pipe) answers no, so `init` never
installs unattended without `--yes`.

Already-installed packages are excluded from the count, so re-running is safe.

### Monorepos

`init` scans every workspace, not just the root. A directory holding a
`package.json`, `pyproject.toml`, `requirements.txt`, `go.mod`, `Cargo.toml`,
`pom.xml`, `build.gradle` or `Dockerfile` is scanned on its own, up to three
levels deep, and each one reports its own stack:

```
agentmd  scanning project…

  4 workspaces detected

  ./ (root)
    ✓ GitHub Actions       .github/workflows/

  apps/web/
    ✓ Next.js              package.json (next)
    ✓ Tailwind CSS         package.json (tailwindcss)
    ✓ End-to-end testing   package.json (@playwright/test)

  services/api/
    ✓ Express              package.json (express)
    ✓ PostgreSQL           package.json (pg)
    ✓ Docker               Dockerfile

  services/ml/
    ✓ Python               requirements.txt  (no packages for this yet)

  Recommendations below are the union across all workspaces.
```

This is deliberately not a workspace-config parser. Reading `workspaces` globs
from `package.json` would miss `pnpm-workspace.yaml`, Cargo `[workspace]
members`, Go multi-module layouts and Nx project graphs. Looking for the
manifest files themselves covers all of those in one bounded walk, and never
descends into `node_modules`, `dist`, `target`, `.venv` and similar.

Recommendations are the **union** across workspaces, because `link` writes one
config per agent and the agent works across the whole repo. The per-workspace
breakdown is shown so you can see which package produced which signal rather
than being handed a merged list that reads like one stack.

### What it looks for

`package.json` dependencies, plus `Dockerfile`, `docker-compose.yml`,
`tsconfig.json`, `next.config.*`, `tailwind.config.*`, `vercel.json`,
`prisma/`, `.github/workflows/`, `k8s/`, `requirements.txt`, `pyproject.toml`,
`go.mod`, `Cargo.toml`, `pom.xml`.

Detecting something is not the same as having packages for it. Python and Go
have packs (FastAPI, Django, Flask, Pydantic, SQLAlchemy, pytest, asyncio; Go
conventions, errors, net/http, concurrency, database, testing, performance) —
Python libraries are read from `requirements.txt` / `pyproject.toml`. Rust,
Java, Vue, Svelte, NestJS and Fastify are reported as detected with no
recommendations:

```
  ✓ Rust                     Cargo.toml  (no packages for this yet)
```

### Version pins

`init` also reads the **major versions** you run and shows them as pins:

```
  ⇅ Next.js 16               package.json (next ^16.1.0)   (version pin)
  ⇅ Pydantic 2               pyproject.toml (pydantic>=2.6) (version pin)
  ⇅ Go 1.24                  go.mod (go 1.24.1)             (version pin)
```

A pin is a short, hand-written list of the breaking differences a model
routinely gets wrong for that major — `.dict()` → `model_dump()`, sync
`params` → `await params`, `middleware.ts` → `proxy.ts`. Pins exist for
Next.js 13–16, React 18–19, Pydantic 1–2, SQLAlchemy 2, Django 5, Prisma 5–7,
Tailwind 3–4, Express 5, Zod 4, ESLint 9, Vue 3, Go 1.22–1.25 and Python
3.12–3.13. Unpinned ranges (`latest`, `workspace:*`) and unknown libraries
produce no pin. `link` writes them into the agent file.

---

## link

```bash
agentmd link [--agent=claude,cursor,…|all] [--dry]
```

Writes the installed standards into your agent's config files: a small
always-on block, plus on-demand reference files in each agent's own
convention.

```
Linking 24 packages + 3 version pins into 2 agent configs

  targets: CLAUDE.md, .cursor/rules/agentmd.mdc (detected .claude/, .cursor/)
  always-on: ~1,340 of 1500 tokens · 7 packages in core · 17 on demand

  ✓  CLAUDE.md                              created — Claude Code
  ✓  .claude/rules/agentmd-*                14 on-demand references
  ✓  .cursor/rules/agentmd.mdc              created — Cursor
  ✓  .cursor/rules/agentmd-*                24 on-demand references
  ✓  apps/web/CLAUDE.md                     created — workspace, 9 packages
```

### Which files it writes

1. `--agent=` wins.
2. Otherwise every convention already present in the project is regenerated.
3. Otherwise the environment decides: `.cursor/` means Cursor, `.claude/` or a
   `claude` binary on PATH means Claude Code, `.gemini/` means Gemini CLI,
   `.github/copilot-instructions.md` means Copilot.
4. When nothing is detectable, `CLAUDE.md` and `AGENTS.md` are both written,
   and the output says so.

| Name | Always-on file | On-demand references |
| --- | --- | --- |
| `claude` | `CLAUDE.md` | `.claude/rules/agentmd-*.md` with `paths:` globs |
| `cursor` | `.cursor/rules/agentmd.mdc` (`alwaysApply: true`) | `.cursor/rules/agentmd-*.mdc` with `globs:` (`alwaysApply: false`) |
| `copilot` | `.github/copilot-instructions.md` | `.github/instructions/agentmd-*.instructions.md` with `applyTo` |
| `agents` | `AGENTS.md` | links to `.agentmd/presets/` (no on-demand mechanism) |
| `gemini` | `GEMINI.md` | links to `.agentmd/presets/` |

Markdown targets get a block between `<!-- agentmd:start -->` and
`<!-- agentmd:end -->`. Everything outside it is left alone. Re-running
rewrites only the block. Run `link` again after `install`, `remove` or `update`.

### The always-on budget

The block every prompt carries holds the **version pins and nothing else**.
Every installed standard is listed under its category with a link, and is
written as a path-scoped reference file for the agents that support one —
`.claude/rules/*.md` with `paths:`, `.cursor/rules/*.mdc` with `globs:`,
`.github/instructions/*.instructions.md` with `applyTo` — so it loads when a
matching file is open rather than on every prompt.

This used to fill a 1,500-token budget with each standard's `**Never**` rules
and checklist. Three studies in 2026 then measured always-on generic guidance
and found no gain in task success at over 20% more cost, and a measurable drop
when the instructions are noisy (ETH Zurich, arXiv 2602.11988; arXiv
2607.27250; arXiv 2608.11095). Version-specific API facts were the exception
(+10–20 points, LibEvoBench, arXiv 2606.25402). So pins stay on; standards
load on demand. Anything your team wants on every prompt belongs outside the
managed block, which `link` never touches.

```markdown
### Version pins (detected from this project)

**Next.js 16** — _package.json (next ^16.1.0)_
- Request APIs are async only — `params`, `searchParams`, `cookies()`, `headers()` must be awaited; synchronous access was removed.
…

### Frontend
- [`hooks`](.agentmd/presets/claude-Frontend-hooks.md)
```

### Version pins

Every `link` re-reads the project's manifests and writes a **Version pins**
section first. The installed version in `node_modules` wins over the range in
`package.json`, so a lockfile bump from 15 to 16 is pinned as 16:

```markdown
### Version pins (detected from this project)

**Pydantic 2** — _pyproject.toml (pydantic>=2.6)_
- Use `.model_dump()` / `.model_dump_json()` / `.model_validate()` — `.dict()`, `.json()`, `.parse_obj()` are deprecated v1 names.
```

### Nested workspaces override the root

In a monorepo every workspace the detector finds (`apps/web`, `services/api`,
…) gets its own `CLAUDE.md` / `AGENTS.md` / `GEMINI.md` carrying only the
standards its stack selects. Agents read the nearest file, so the workspace
file overrides the root for everything under it. Links climb to the root
`.agentmd/presets/`.

### Overrides

To replace a registry standard with your team's own text, drop a file with
the same name under `.agentmd/overrides/`:

```
.agentmd/overrides/claude-Backend-go-errors.md          # whole project
services/api/.agentmd/overrides/claude-Backend-go-errors.md   # that workspace only
```

The override's `**Never**` rules and checklist become that package's core, its
text becomes the reference, and the deeper file wins. `agentmd update` never
touches overrides.

---

## login · logout · whoami

```bash
agentmd login [--key <key>]
agentmd logout
agentmd whoami
```

Signs in with an Agent.md Team license key. With no `--key`, it opens the Team
page and prompts for the key with echo disabled, so it stays out of your
scrollback and out of a screen share.

```
$ agentmd whoami

  ✓ Agent.md pro · key …oyIZCA from /home/you/.agentmd/credentials.json

  Plan          pro
  Licensed to   Acme Corp
  Seats         25
  Expires       2027-09-24 (365 days)
```

A key is an Ed25519-signed claim verified **offline** against a keyset shipped
in the package: no activation call, no license server on the critical path, and
CI works behind a proxy that blocks everything but npm.

Each license names the key that signed it (`kid`), which is what makes rotation
and revocation possible without breaking everyone:

| Key status | Signs | Verifies | Meaning |
| --- | :--: | :--: | --- |
| `active` | yes | yes | The current signing key |
| `retired` | no | yes | Rotated away from; licenses under it keep working |
| `revoked` | no | **no** | Compromised; every license under it is void |

Adding a key invalidates nothing, and licenses issued before `kid` existed
verify against the keyset's `legacyKid`. The trade is revocation *latency*: a
revoked key stops being trusted when the user updates the CLI, not the instant
it is revoked, which is why keys are dated a year at most. Key rotation and
revocation are handled by the maintainers.

Where the key is read from, highest priority first:

| Source | Use |
| --- | --- |
| `AGENTMD_PRO_KEY` | CI, containers, one-off runs. Nothing touches disk. |
| `.agentmd/enterprise.json` → `licenseKey` | Committed, so nobody on the team logs in |
| `~/.agentmd/credentials.json` (`0600`) | `agentmd login` writes here |

`AGENTMD_CONFIG_HOME` and `XDG_CONFIG_HOME` both move that directory.
`logout` refuses to claim success when the key in use comes from the
environment or from `enterprise.json`, because deleting the file would not
sign you out.

---

## sync (free)

```bash
agentmd sync --private [--push | --pull] [--dry]
```

Your company's own standards — `.agentmd/presets/local-*.md` and
`.agentmd/overrides/*.md` — pushed to and pulled from a private registry.
Registry copies are never synced; they come from the registry.

With neither `--push` nor `--pull` it shows the difference and changes nothing:

```
Private registry /mnt/team/agentmd-standards

  new                .agentmd/presets/local-Team-conventions.md 1.2 KB
  in sync            .agentmd/overrides/claude-Backend-go-errors.md 3.4 KB
  remote only        local-Platform-logging.md
```

The registry is a directory of markdown, addressed either as an `https://` URL
or as a path on a shared volume. A git checkout on a network share works; an
S3 bucket mounted with s3fs works. Pulls over HTTPS need an `index.json`
listing the filenames, which keeps the server a static file host rather than an
API. **Pushing over HTTPS is refused** — an unauthenticated `PUT` to a
company's standards registry is a supply-chain hole, so push to a directory and
let your existing review process publish it.

Pulled filenames go through the same write guard as everything else, so a
hostile registry cannot place a file outside the project.

---

## analytics (free)

```bash
agentmd analytics [--since 30d|12w|6m|all] [--json]
```

Every `review` — free ones included — appends to `.agentmd/analytics.json`:
when it ran, which standards were loaded, and one row per finding. Nothing
leaves the machine. `analytics` reads it back.

```
What your standards caught — all time

     37 findings across 112 reviews
        31 caught offline by pattern rules — no model, no tokens

  12 high   19 medium   6 low

  Per standard

      14  ██████████████████  Security/sql-injection
       9  ███████████         Backend/error-handling

  Never fired (7 of 24 installed)

    · Design/apple
    · System Design/cqrs

    These cost context on every prompt. Drop one with 'agentmd remove <id>' if it is not
    guarding something you simply have not broken yet.
```

The second table is the point. A standard that has never fired is spending
context on every prompt and buying nothing, and this is the only place that
says so with a number.

---

## ci

```bash
agentmd ci                    # print the workflow this project should use
agentmd ci --write [--force]  # save it to .github/workflows/agentmd.yml
agentmd ci --check            # validate the workflow you already have
agentmd ci --cloud            # explains the private preview, sends nothing
agentmd ci --cloud --preview  # Team + invite token: hand the run to the hosted runner
```

Free. Generates a GitHub Actions workflow tuned to what is actually in the
repo — Node version from `engines` or `.nvmrc`, cache key from the lockfile —
that runs `review --fast` on every pull request. No API key, no model, nothing
leaves the runner. It caches the CLI download, which otherwise costs more than
the review.

`--check` catches the two mistakes that make the job pass while reviewing
nothing: no `agentmd review` step, and a checkout without `fetch-depth: 0`.

### `--cloud` is a private preview

`agentmd ci --cloud` on its own **sends nothing**. It prints what the preview
is, links the waitlist, and points at `ci --write`, which does the same job on
your own runner today for free.

Reaching the endpoint needs all three:

| | |
| --- | --- |
| `--preview` | An explicit second flag. A command that posts a repository's diff to an endpoint whose contract is still moving should not be one flag away from a typo. |
| `AGENTMD_CLOUD_TOKEN` | The invite token, issued with your preview access. Separate from your license key. |
| `cloudUrl` | In `.agentmd/enterprise.json`, or `AGENTMD_CLOUD_URL`. |

Even then the CLI warns, at the point of use, that the endpoint, its payload
and its response may change without notice and are covered by no support
commitment. Requests carry `x-agentmd-preview` and the CLI version so the
endpoint can reject a stale client rather than misinterpret it.

Cloud CI exits `1` when it cannot proceed and `2` when the license is missing,
so a CI job can tell "not entitled" from "not configured".

---

## telemetry

```bash
agentmd telemetry            # show the exact payload that would be sent
agentmd telemetry --enable
agentmd telemetry --disable
```

Off until you turn it on. `agentmd telemetry` with no flag renders a real event
through the real code path, including two fields (`cwd`, `repo`) that it
deliberately passes in and that the allowlist drops — the filter is
demonstrable, not a promise.

Honoured and winning over the stored setting: `DO_NOT_TRACK`, `DONT_TRACK`,
`AGENTMD_TELEMETRY_DISABLED`, `AGENTMD_TELEMETRY=0|off|1|on`. `--disable`
deletes the anonymous id rather than keeping it for later.

---

## search

```bash
agentmd search <query> [--model=claude] [--category=Security] [--limit=20] [--all-models]
```

```
$ agentmd search caching

2 matches for "caching"

  Performance/caching   v1.0.0 · This document defines engineering principles, caching method
  System Design/caching v1.0.0 · This document defines engineering principles, caching method

  Details:  agentmd info claude/Performance/caching
  Install:  agentmd install claude/Performance/caching
  Searched claude; add --all-models to search all 4.
```

Searches names, categories and descriptions. Results rank exact name matches
above prefixes, above substrings, above category hits, above description hits —
so `search jwt` leads with `Security/jwt`.

Defaults to one model, because the same package exists for every model family
and showing each copy multiplies the output for no extra information.

---

## list

```bash
agentmd list                      # models
agentmd list claude               # categories
agentmd list claude/Security      # packages, with descriptions
agentmd list --installed          # this project
```

```
$ agentmd list

Models in the registry:

  claude     20 categories · 304 packages
  deepseek   20 categories · 304 packages
  gemini     20 categories · 304 packages
  open-ai    20 categories · 304 packages
```

---

## info

```bash
agentmd info <model/category/package>
```

```
$ agentmd info claude/Security/owasp

claude/Security/owasp  v1.0.0

  This document defines engineering principles, secure software development
  methodologies, risk assessment frameworks, vulnerability prevention…

  Model          claude
  Category       Security
  Size           11.7 KB
  File           owasp.md
  License        MIT
  Source         https://raw.githubusercontent.com/…/owasp.md
  Agents         Claude Code, AGENTS.md, Cursor, Gemini CLI, GitHub Copilot

  Installed      yes  .agentmd/presets/Security-owasp.md
                 v1.0.0 on 2026-08-21
```

---

## install

```bash
agentmd install <model/category[/package]> [--force]
agentmd install <category/package>                      # model defaults to claude
```

Both id forms work everywhere a package id is accepted — `install`, `info`,
`remove`, `list`:

```bash
agentmd install claude/Security/owasp   # explicit model
agentmd install Security/owasp          # same package, default model
agentmd install Security/               # the whole category
```

The two forms are told apart by whether the first segment names a model family,
not by counting segments — `claude/Security` (browse a category) and
`Security/owasp` (install a package) are both two segments and mean different
things.

The category is never optional. 17 package names exist in two categories:
`mongodb` is both a Database driver package and a Design brand system, `vercel`
is both Design and DevOps. A bare package name does not identify a package.

`--force` re-downloads packages that are already installed.

A mistyped name gets a suggestion rather than a bare failure:

```
$ agentmd install claude/Security/owsap
Package not found: claude/Security/owsap

  Did you mean:
    agentmd install claude/Security/owasp

  Search:  agentmd search owsap
  Browse:  agentmd list claude/Security
```

Exits 1 if any package failed to install.

---

## remove

```bash
agentmd remove <model/category/package>
```

Deletes the file and drops the manifest entry. Only touches paths inside
`.agentmd/presets/`. Run `link` afterwards to update your agent configs.

---

## outdated

```bash
agentmd outdated
```

```
$ agentmd outdated

Checking 26 packages against the registry…

  ↑  claude/Testing/unit       update available
  ✎  claude/Security/owasp     edited locally

1 outdated, 1 modified, 24 current
```

Read-only. Exits 1 if anything needs attention, so CI can gate on it.

| Mark | State | Meaning |
| --- | --- | --- |
| `↑` | outdated | The registry content changed |
| `✎` | modified | You edited the file after installing |
| `!` | conflict | Both — `update` won't touch it without `--force` |
| `?` | missing | The file is gone from disk |
| `✗` | removed | No longer in the registry |

The distinction comes from the SHA-256 checksum recorded at install time.

---

## update

```bash
agentmd update [--dry] [--force]
```

Pulls current content for every installed package.

**Locally edited files are not overwritten** unless `--force`. Packages are
instructions you may well have tuned for your codebase; replacing that on a
routine update would be a data-loss bug.

`--dry` writes nothing and prints a line diff of every change it would make:

```console
$ agentmd update --dry

Checking 4 packages…

  ↑  claude/Security/jwt  v1.0.0 → v2.0.0  +12 -3
       ## Verify in constant time
     - Compare tokens with `===`.
     + Use `crypto.timingSafeEqual`. A `===` comparison leaks length and
     + prefix through timing.
     ⋮
  !  claude/Security/owasp — edited locally and updated upstream; left alone
     - MY OWN PROJECT RULE
       ...

1 would update, 2 current, 1 skipped
```

Conflicts are diffed too — that is the one case `update` cannot decide for you,
so you can see your edit and the upstream change side by side before choosing
`--force`.

---

## validate

```bash
agentmd validate
```

Offline integrity check — no network. Verifies that every package resolves,
has a safe name and an HTTPS URL, is non-empty markdown, and that every
recommendation the stack detector can emit maps to a package that exists. Also
checks this project's manifest against the registry.

```
Validated 3157 packages across 11 models, 47 detector mappings.

✓ Registry is valid.
```

Exits 1 on errors. This is what found the empty `Community/maintainers`
package.

---

## agents

```bash
agentmd agents
```

Lists the config targets `link` can write and marks the ones already in this
project. Lists what is implemented, not what is planned.

---

## lint

Check every file your agent reads before it reads your code. Works on any
repository — no manifest, no account, no network.

```bash
agentmd lint             # exit 1 on any error
agentmd lint --strict    # warnings fail too
agentmd lint --json
agentmd lint --sarif     # SARIF 2.1.0 for GitHub code scanning
agentmd lint --fix       # delete lint-leakage and duplicate lines, then re-check
```

It finds `CLAUDE.md`, `AGENTS.md`, `GEMINI.md`, `.cursorrules`,
`.windsurfrules`, `.cursor/rules/`, `.claude/rules/`, every `SKILL.md` (in
`.claude/skills/`, `skills/`, or at the root of a skill repository) and the
scripts bundled with it,
`.github/copilot-instructions.md`, `.github/instructions/`, hook settings in
`.claude/settings*.json`, MCP server configs (`.mcp.json`, `.cursor/mcp.json`,
`.vscode/mcp.json`, `.gemini/settings.json`), and the same files nested in workspaces.

| Severity | Rule | Catches |
| --- | --- | --- |
| error | `secret` | Anthropic, OpenAI, GitHub, AWS, Slack, Stripe and Google keys, private keys, long values assigned to secret-looking names. Placeholders (`your-api-key`, `xxxx`, `${VAR}`) are ignored; the secret is never echoed. |
| error | `injection` | "ignore previous instructions", permission-bypass flags, invisible Unicode (zero-width, bidi, tag characters), instructions hidden in HTML comments, hooks piping a download into a shell |
| warning | `injection` | `curl … \| sh` in prose, long base64 runs |
| warning | `bloat` | an always-on file of 200+ lines or over 3,000 tokens |
| warning | `blind-reference` | `@file` imports and relative links that point at nothing |
| warning | `stale-reference` | a repo path in backticks (`src/auth/middleware.ts`) that no longer exists. Paths are matched from the root, from the file, and as the tail of any real path; a `.js` reference to a `.ts` source counts; examples, placeholders, home-folder configs, build output and paths outside the repo's own folders are skipped |
| warning | `stale-pins` | the agentmd block's pins no longer match the dependencies — run `link` |
| warning | `permissions` | `Bash` allowed with no pattern in Claude settings |
| notice | `lint-leakage` | formatting rules a formatter in the repo already enforces — fixable with `--fix` |
| notice | `duplicate` | the same instruction twice in an always-on file — fixable with `--fix` |
| notice | `fossil` | unedited `/init` boilerplate |
| error | `skill-payload` | in a skill's bundled scripts: a download piped into a shell, decoded data passed to `eval`/`exec`, the whole environment serialised, a credential store (`~/.ssh`, `.aws/credentials`, `.npmrc`, keychain) read by a script that also makes network calls. Comments are skipped; ordinary tooling (spawning ffmpeg or Chrome, calling an API with a key from the environment, decoding a `data:` image) is not flagged |
| warning | `skill-payload` | a skill script that writes to the agent's own configuration — settings, hooks, MCP servers, instruction files, shell profile — or reads a credential store without sending anything |
| notice | `skill-network` | the hosts each skill script contacts, so you know where data goes before you install it |
| error | `unsigned-context` | with `requireSignedContext`, any change not covered by `bundle sign` |

Injection rules read prose only — not code fences, not inline code, not lines
that warn *against* the thing ("never …", ❌) — because security writing quotes
attacks to teach them. Run over all 4,278 files in this registry, lint reports
no errors.

`ci --write` adds a lint step before the review step. The Claude Code plugin
runs the same check as a hook after every edit to an instruction file and
reports errors back to the agent.

## audit

Run `lint` on any public GitHub repository without cloning it yourself.

```bash
agentmd audit vercel/next.js
agentmd audit https://github.com/owner/repo
agentmd audit ./local/checkout
agentmd audit owner/repo --json
```

It downloads only what lint reads — instruction files, skills, MCP configs,
formatter config and dependency manifests — and creates every other path
empty, so stale-path checks still know what exists. Nothing from the repo is
executed. Exit code 1 when an error (a secret, an injection) is found.

## pins

Print the breaking changes for the dependency majors this project runs, in
the form an agent reads:

```bash
agentmd pins           # markdown, exactly as link writes it
agentmd pins --json    # with the measured effect, where one exists
```

Pins cover Next.js, React, Pydantic, SQLAlchemy, Django, Prisma, Tailwind,
Express, Zod, ESLint, Vue, Go and Python. Each major that has deterministic
checks is also checked in `review --fast`, by detected version: a Next 16
project is flagged for synchronous `cookies()`, a Next 13 project is not.

## bundle

Sign, verify and attest the exact set of files an agent reads, with your
organisation's own Ed25519 key.

```bash
agentmd bundle keygen --out ~/keys/agentmd-bundle.key --kid acme-2026
agentmd bundle sign --key ~/keys/agentmd-bundle.key     # writes .agentmd/bundle.sig
agentmd bundle verify                                   # exit 1 on any change
agentmd bundle attest                                   # commit + context digest, as JSON
```

The bundle covers every file `lint` finds plus `.agentmd/presets`,
`.agentmd/overrides`, `manifest.json` and `enterprise.json`. `*.local.*` files
are per-developer and never part of it. `verify` names every **modified**,
**unapproved** (added) and **missing** file.

Trusted public keys live in `.agentmd/enterprise.json`:

```json
{ "bundleKeys": [{ "kid": "acme-2026", "publicKey": "MCowBQYDK2VwAyEA…" }], "requireSignedContext": true }
```

**In CI, set `AGENTMD_BUNDLE_KEYS` from a secret.** A pull request can edit
`enterprise.json` too: swap in its own key and re-sign, and verification
against the repository's own key list passes. The environment variable
overrides the file, so the anchor sits outside the pull request's reach.
`verify` warns when run in CI without it. Sign in CI with
`AGENTMD_BUNDLE_SIGNING_KEY` instead of `--key`.

`keygen` refuses to write a private key inside the project and writes it with
mode 600. This is a gate in CI and review, not runtime enforcement: it stops
an unsigned instruction file from merging unseen, not an agent on a laptop
from reading one. Every `review` run records the context digest beside its
findings in `.agentmd/analytics.json`.

## extract

```bash
agentmd extract [--dry] [--force] [--name <preset>]
```

Derives the repository's **unwritten conventions** into a local standard.
Needs `ANTHROPIC_API_KEY` (or an `ant auth login` profile).

```
Gathered evidence from 14 files (96k chars, claude-opus-5)
  ✓ 9 conventions → .agentmd/presets/local-Team-conventions.md
  Run `agentmd link` to wire it in.
```

Evidence, all read-only and bounded (~120k chars): the directory tree two
levels deep, lint / format / type / build configs, `package.json` scripts and
dependency names, `pyproject.toml`, `go.mod`, the last 50 commit subjects, up
to 12 source files (the 6 largest plus the 6 most recently changed) and up to
4 test files, each truncated. The model is asked for conventions *with
evidence in that sample only* — each rule cites the file or config it came
from — in the canonical standard format.

| Flag | Effect |
| --- | --- |
| `--dry` | Print the standard, write nothing |
| `--force` | Overwrite an existing extracted standard (otherwise it refuses) |
| `--name <preset>` | Preset name; default `conventions` → `local/Team/conventions` |

The result is a normal manifest entry with `source: "local"`: `link` includes
it, `outdated` lists it as local, `update` skips it, `remove` removes it.

---

## review

```bash
agentmd review [--base <ref>] [--fast] [--local] [--model <name>] [--fail-on <low|medium|high>] [--github]
```

Checks a diff against the installed standards and reports every violation
with the standard and rule it breaks.

```
Reviewing 3 changed files against 12 standards (claude-opus-5)
  1 finding from the pattern fast-path

  HIGH   src/repo.ts:14  Security/sql-injection › sql-string-interpolation  [pattern]
         SQL built by string interpolation — use a parameterised query.
  MEDIUM src/api/users.ts:41  API/pagination › Use cursor pagination
         Endpoint pages with offset/limit.
         fix: accept `cursor` and return `next_cursor`.

  2 findings — one injection risk, one pagination rule.
```

**What is reviewed.** With no `--base`: the working tree versus `HEAD`,
*including untracked files*. With `--base <ref>`: `git diff <ref>...HEAD`, the
form CI wants.

**Three engines, cheapest first.**

| Mode | Cost | Needs | What runs |
| --- | --- | --- | --- |
| every run | free | nothing | the **pattern fast-path**: deterministic checks over added lines, scoped to standards you installed — interpolated SQL, `SELECT *`, `eval`/`exec`, shell from variables, MD5/SHA-1 for secrets, `Math.random()` tokens, `jwt.decode` without verify, wildcard CORS, hard-coded secrets, Pydantic v1 calls, sync `cookies()` in Next.js 15+ |
| `--fast` | free | nothing | patterns only, then stop — milliseconds, offline |
| default | API tokens | `ANTHROPIC_API_KEY` | Claude reads the diff and the installed standards; standards are prompt-cached |
| `--local` | free | Ollama | same prompt sent to Ollama at `OLLAMA_HOST` (default `http://localhost:11434`) |

| Flag / variable | Effect |
| --- | --- |
| `--fail-on <severity>` | Exit 1 if any finding is at or above `low`, `medium` or `high` |
| `--github` | Also post the findings as a pull-request comment (needs `GITHUB_TOKEN`, `GITHUB_REPOSITORY`, `GITHUB_EVENT_PATH` — set by GitHub Actions) |
| `--model <name>` | Model to use (cloud or Ollama) |
| `AGENTMD_REVIEW_MODEL` | Cloud default, `claude-opus-5` |
| `AGENTMD_LOCAL_MODEL` | Ollama default, `qwen2.5-coder:7b` |
| `OLLAMA_HOST` | Ollama endpoint |

Pattern findings are marked `[pattern]` and come first; a model finding on
the same file, line and standard is dropped as a duplicate. Exit 2 means the
review could not run (no diff, no credentials, unparseable reply).

---

## test

```bash
agentmd test [Category/preset ...] [--all] [--tasks <1-6>] [--model <name>] [--fail-under <pct>] [--json]
```

A rule-efficacy benchmark: does the model actually obey the installed
standards? Needs `ANTHROPIC_API_KEY`.

```
Rule efficacy — 3 standards × 3 tasks  (claude-opus-5)

  ✓ Security/jwt            3/3
  ✓ Database/postgres       3/3
  ✗ API/pagination          1/3   task 2: ignored "Use cursor pagination" — offset/limit used
                                    task 3: ignored "Return next_cursor" — no cursor in response

Score: 7/9 (78%)
  API/pagination: tighten "Use cursor pagination" with an explicit negative constraint.
  Estimated cost: $0.41
```

Per standard: generate N realistic tasks a developer would ask, each crafted
so a model unaware of the rule would plausibly break it; run each with the
standard in the system prompt exactly as `link` exposes it; judge every
attempt strictly against the standard.

| Flag | Effect |
| --- | --- |
| `Category/preset …` | Test only these; default is the 3 most recently installed |
| `--all` | Every installed standard |
| `--tasks <n>` | Tasks per standard, 1–6, default 3 |
| `--fail-under <pct>` | Exit 1 if the score is below this percentage |
| `--json` | Machine-readable results |
| `--model <name>` | Override the model |

Roughly 2N+1 API calls per standard; the cost line is an estimate from real
token usage.

---

## Options and environment

| Flag | Applies to | Meaning |
| --- | --- | --- |
| `--force` | install, update | Overwrite existing files or local edits |
| `--dry` | init, link, update | Show what would happen, change nothing |
| `--yes`, `-y` | init | Skip the confirmation prompt |
| `--model=NAME` | init, search | Choose a model (default `claude`) |
| `--agent=NAME` | link | Comma-separated targets, or `all` |
| `--installed` | list | Show this project's packages |
| `--all-models` | search | Search every model family |
| `--private` | sync | Required; the only mode |
| `--push`, `--pull` | sync | Direction. Neither shows the difference |
| `--since` | analytics | `30d`, `12w`, `6m`, `all` |
| `--json` | analytics | Raw numbers |
| `--write`, `--check` | ci | Save or validate the workflow |
| `--cloud`, `--preview` | ci | Hosted run. `--cloud` alone only explains the preview |
| `--enable`, `--disable` | telemetry | Opt in or out |
| `--key` | login | Non-interactive sign-in |

| Variable | Meaning |
| --- | --- |
| `AGENTMD_REGISTRY_BASE` | Override the registry base URL (mirrors, testing) |
| `AGENTMD_TIMEOUT_MS` | Per-request timeout, default 30000. A whole request gets twice this |
| `AGENTMD_DEBUG` | Print a stack trace on error |
| `AGENTMD_PRO_KEY` | Agent.md Team license key (the variable keeps its original name). Highest priority, and nothing is written to disk |
| `AGENTMD_CONFIG_HOME` | Where credentials and telemetry settings live (default `~/.agentmd`) |
| `AGENTMD_PRIVATE_REGISTRY` | Overrides `privateRegistry` from `.agentmd/enterprise.json` |
| `AGENTMD_CLOUD_URL` | Overrides `cloudUrl` from `.agentmd/enterprise.json` |
| `AGENTMD_CLOUD_TOKEN` | Invite token for the cloud CI private preview |
| `AGENTMD_LICENSE_KEYSET` | Trust your own signing keyset — a path or inline JSON (self-hosted) |
| `AGENTMD_LICENSE_KID` | The `kid` to assume for `AGENTMD_LICENSE_PUBLIC_KEY` |
| `AGENTMD_SSO_TOKEN`, `AGENTMD_OIDC_TOKEN` | Proof of SSO when `requireSso` is set |
| `AGENTMD_TELEMETRY`, `DO_NOT_TRACK` | Force telemetry on or off, beating the stored setting |
| `AGENTMD_LICENSE_PUBLIC_KEY` | Verify licenses against your own signing key (self-hosted) |
| `AGENTMD_NO_BROWSER` | Never try to open a browser. Implied by `CI` |
| `HTTPS_PROXY`, `NODE_EXTRA_CA_CERTS` | Standard Node networking; named in the error when a fetch fails |

## Exit codes

`0` success · `1` failure — an unknown package, a failed fetch, validation
errors, or `outdated` finding something that needs attention ·
`2` a Team feature (`ci --cloud --preview`) run without a license, which is not a failure of the command.
`lint` exits `1` on any error (and on warnings with `--strict`); `bundle verify`
exits `1` on any untrusted signature or changed file.

## Aliases

`i`/`add` → install · `rm`/`uninstall` → remove · `ls` → list ·
`s`/`find` → search · `show` → info · `up`/`upgrade` → update ·
`check` → outdated. (`lint` was an alias for `validate`; it is its own
command now.)
