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
agentmd init [--dry]
agentmd init --presets [--model=claude] [--yes] [--dry]
```

`init` attaches to the agents in this project, once. It prints each agent it
found and the files that show it, then:

1. compiles the hard rules (`enforce --write`): Claude Code `permissions.deny`,
   Codex `.codex/rules/agentmd.rules`, and the runtime guard's
   `.agentmd/policy.json`;
2. for Claude Code, installs the `pin` hook (rules re-injected after
   compaction) and the `guard` install gate;
3. attaches the runtime guard (installed with the package), after checking its SHA-256, and attaches it
   to Claude Code with `agentmd-guard init claude`. It is attached only where
   it blocks; on other agents the rules rest on each agent's own controls.

Existing settings are kept and a second run adds nothing. Without the runtime
guard, `init` says "runtime guard not installed" and does the rest.

## broker

```bash
agentmd broker run --aws -- claude   # 15-minute AWS credentials; long-lived keys hidden
agentmd broker run -- codex          # just hide long-lived credentials
agentmd broker aws --minutes 30      # mint only (any OS with the AWS CLI)
agentmd broker policy                # the session policy
```

`broker aws` asks AWS STS for temporary credentials (GetFederationToken, or
AssumeRole with `--role-arn`) with a session policy: everything the caller may
do, minus 29 destructive or escalating actions (IAM, bucket and database
deletion, instance termination, stack deletion, DNS changes, CloudTrail stop,
KMS key deletion…). AWS evaluates a session policy as an intersection with
the caller's own permissions; enforcing it is AWS's job. The credentials go to
`~/.agentmd/broker/aws-credentials` (mode 600, profile `agentmd-agent`).

`broker run` (Linux, needs bubblewrap) starts the command where `~/.aws`,
`~/.ssh`, `~/.gnupg`, `~/.kube`, `~/.docker`, `~/.azure`, `~/.config/gcloud`,
`~/.config/gh`, `~/.netrc`, `~/.npmrc`, `~/.pypirc`, `~/.git-credentials` do
not exist, and removes secret-looking environment variables, printing which.
`--keep ANTHROPIC_API_KEY` keeps the agent's own login. With `--aws`, only the
minted credentials are present. Verified on a real AWS account: inside `broker run --aws`, `dynamodb
delete-table` is refused "with an explicit deny in a session policy" while the
caller's own key is allowed, and read-only calls work. Not covered yet: macOS
and Windows sandboxing; GitHub, GCP and Azure tokens.

## learn from refusals

```bash
agentmd learn            # repeated corrections in sessions, and repeated refusals
agentmd learn --write    # add the rules and compile them for every agent
agentmd learn --min 5    # how many identical refusals make a rule (default 3)
```

The runtime guard logs each refusal that stood to
`~/.agentmd/guard/refusals.jsonl` (kind of action and command words only, no
arguments). The same refusal three times in a project means the agent does not
know the rule. `learn` proposes it ("Never run `terraform destroy`."), and
`--write` appends it to AGENTS.md (or CLAUDE.md) with its reason and runs
`enforce --write`, so the next attempt is blocked by the repo's own rule on
Claude Code, Codex and the guard. Kinds with no single command reading
(recursive deletes outside build output, credential exfiltration) are added
as rules the model reads, not compiled.

## verify

```bash
agentmd receipts <id> --json > receipt.json   # on the machine that refused the call
agentmd verify receipt.json                   # anywhere: who signed it, and is it intact
agentmd verify .agentmd/bundle.sig --offline  # never ask GitHub
```

One receipt format for guard decisions, context bundles and Team evidence
([receipts.md](receipts.md)). A receipt names its key by fingerprint and never
carries it, so `verify` finds the key in a source you trust:
`AGENTMD_TRUSTED_KEYS` (CI secret), else `.agentmd/signers.json`, then the
signer's GitHub signing keys for `github:<login>`. Run
`agentmd receipts key --signer github:<login>` once and add the printed
`ssh-ed25519` line on GitHub as a **signing key**. Exit 1 if any receipt fails.

## digest

```bash
agentmd digest                  # the last 7 days, as Markdown
agentmd digest --days 30
agentmd digest --out digest.md  # or --json
```

One message to paste into Slack, an email or a PR, built from what is
already on the machine: what the runtime guard stopped (by kind, with the
command words), rules learned from refusals in the window and repeats ready to
become rules, how many enforceable rules are in force for Claude Code, Codex
and the guard, sandboxed `broker run`s and short-lived credentials minted
(`~/.agentmd/broker/log.jsonl`: counts and paths, never credentials), and
lint findings now. Counts only; nothing is estimated.

Weekly, every Monday at 09:00:

```cron
0 9 * * 1  cd /path/to/repo && npx --yes activate-agentmd@3 digest --out .agentmd/digest.md
```

## demo

```bash
agentmd demo
```

Two minutes, offline, no keys: (1) the runtime guard's PocketOS reproduction:
the volume delete is paused, routine work is allowed, the refusal is signed and
verified; (2) a throwaway `AGENTS.md` compiled into Claude Code denies, Codex
rules and the guard's policy; (3) the real Codex engine checks those rules when
Codex is installed; (4) the guard refuses the forbidden calls and names the
`AGENTS.md` line. Parts that need a missing tool say so.

## Runtime guard

```bash
agentmd guard-install     # only if npm skipped the platform package
agentmd allow             # approve the call it paused (a person, at a terminal)
agentmd receipts [id]     # list signed refusals, or verify one
agentmd receipts key --signer github:<login>   # name this machine's signing key
agentmd verify receipt.json                    # who signed a receipt (anyone, anywhere)
agentmd impact            # what it has done in this project
agentmd scan [dir]        # credentials an agent here could read (values never shown)
```

`agentmd-guard` is a proprietary Go binary shipped as one npm package per
platform (`activate-agentmd-guard-<os>-<cpu>`, optional dependencies of
`activate-agentmd`), so npm installs only yours. `init` copies it to
`~/.agentmd/bin` (where the hook points, so it survives npm cache clean-ups)
only if its SHA-256 equals the hash pinned in the CLI. Stages, in order: self-protection (the agent cannot
approve its own refusal or edit the controls that govern it), repo rules
(`.agentmd/policy.json`), declared intent, cross-session memory (needs the
memory service; off by default), irreversible actions (pause), exfiltration of
credentials through recognised network commands, supply chain, cost. The local
guard calls no model. Measured on Linux x86_64 (30 Oct 2026): the hook end to
end, with process start and a signed receipt, takes 3.8–4.9 ms at p50 and at
most 7.0 ms at p99; Agent.md's install-gate hook takes about 39 ms.

## init --presets

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

## guard

```bash
agentmd guard "pip install tranformers"      # judge one command; exit 1 blocks
agentmd guard --install                       # add a PreToolUse hook to .claude/settings.json
agentmd guard --hook                          # what the hook runs: reads the Claude Code event on stdin, exit 2 blocks
agentmd guard --json "npm install lodahs"
agentmd guard --offline "…"                   # skip the registry and OSV lookups
```

A gate between "the agent read an install command" and "it ran".
Checks, in order: install sources (`--extra-index-url`, `--index-url`,
`--registry`, `--trusted-host`, plain HTTP, `PIP_CONFIG_FILE` and registry
environment variables, `pip config set`), hidden directives inside `-r` files,
typosquat shapes against the project's manifests and a list of widely installed
npm and PyPI packages (one or two letters off as in `tranformers`, two swapped
as in `lodahs`, separators changed as in `azurecore` for `azure-core`, a
near-miss scope as in `@anthropic/sdk`), then, online, the registry's answer:
a name nobody has registered is blocked, a new or barely used package named
like a widely used one is blocked, and an established package is never
blocked. Plugins and extensions (`react-router-dom`, `pytest-xdist`,
`@types/react`), global tools and the project's own packages are not
look-alikes. Last, known vulnerabilities for exact pins via OSV. Every network
step fails open (5 s for the registry, 2.5 s for OSV). The Claude Code plugin ships the
hook on; `--install` adds it to a repo without the plugin. Local paths, git
URLs and the ecosystem registries always pass. Model: arXiv 2607.15143.

---

## pin

```bash
agentmd pin                    # what would be pinned, and its token cost
agentmd pin --install          # add the SessionStart hook (compact, resume) to .claude/settings.json
agentmd pin --budget 800       # tokens the pinned block may use (default 600)
```

Keeps the hard rules in context through compaction. A long session
compacts: the harness summarises the conversation and carries the summary
forward, and the project's rules go into that summary like everything else.
Measured, with the policy in context violations are 0%; after compaction
they are 30% on average and 59% for some models (arXiv 2606.22528). The fix
the paper measures is to keep the constraints out of the lossy summary, and
that is what the hook does: on every session start after a compaction or a
resume it prints the rules again, and Claude Code adds its output to the
fresh context.

```
  Pinned after compaction  6 of 6 hard rules · 63 of 600 tokens

  ✗ CLAUDE.md:3  Never force-push to main.
  ✗ CLAUDE.md:4  Do not commit the `.env` file.
  ● CLAUDE.md:5  Always run `npm test` before a commit.
  ● CLAUDE.md:9  Prefer named exports.  (pinned explicitly)
```

**What is pinned.** Lines in the root always-on files (CLAUDE.md, AGENTS.md,
GEMINI.md, `.cursorrules`, copilot-instructions.md) that say *never*, *do
not*, *must*, *always*, *only*, *forbidden* or *required*; any line marked
`<!-- pin -->`; everything under a heading named *Pinned*, *Always*, *Hard
rules*, *Never*, *Non-negotiables* or *Invariants*. Fenced code and headings
are skipped. Within the budget, explicit rules go first, then prohibitions,
then obligations.

Only Claude Code has a hook that fires after compaction today. Codex, Cursor
and Gemini CLI are reported as not covered, not pretended.

---

## enforce

```bash
agentmd enforce                # the coverage report
agentmd enforce --write        # add the mappable rules to .claude/settings.json permissions.deny
agentmd enforce --check        # exit 1 while an enforceable rule is prose only (CI)
agentmd enforce --print codex  # the same rules as Codex execpolicy (.codex/rules/*.rules)
agentmd enforce --print gemini # the same rules as a Gemini CLI policy (~/.gemini/policies/*.toml)
```

A rule in CLAUDE.md is text the model interprets. A permission rule in
`.claude/settings.json` is a control the harness applies before the action
runs. Both can say "never force-push"; only one of them stops it. In 481
public CLAUDE.md files, 4–16% of the security rules had a matching control
(arXiv 2608.23550, "CLAUDE.md is a write-only channel"). A production user's
count after six months: prose rules violated "on the order of 100% of the
time in extended sessions", hook-backed rules 0% (anthropics/claude-code#34197).

```
  Enforcement  6 hard rules · 4 prohibitions · 4 enforceable · 0 enforced · 2 left to the model

  ! prose only CLAUDE.md:3  Never force-push to main.
               force pushes: Bash(git push --force origin main:*), Bash(git push -f origin main:*)
  ! prose only CLAUDE.md:8  Never edit `src/generated/**` by hand.
               edits to `src/generated/**`: Edit(./src/generated/**)

  2 rules have no mechanical reading and stay with the model, e.g.:
    CLAUDE.md:5  Always run `npm test` before a commit.
    Keep them pinned (`agentmd pin --install`) so compaction does not drop them.
```

**What maps.** Only sentences with one mechanical reading: force pushes,
pushes to `main`/`master`, `rm -rf`, reading `.env`, database
resets and drops, history rewrites, `sudo`, publishing, production deploys,
global installs, `curl | sh`, and "never edit `path`". Bans on committing,
pushing, force-pushing and editing a path count only when the ban is the
whole sentence: "never commit local secret files" is not a ban on committing,
"never force-push a branch in the merge queue" is not a ban on force pushes,
and "never hand-edit generated files under `packages/`" is not a ban on the
folder. `--force-with-lease` is denied only when the rule names it. Everything
else is counted as left to the model, which is the number the report exists
for. Install rules ("install packages only after…") are covered by the `guard`
hook when it is installed.

Measured on the root CLAUDE.md and AGENTS.md of 72 company repositories (98
files, 508 prohibitions, 30 Oct 2026): 5 map to a control, and all 5 were
checked by hand.

**Other agents.** The command rules also compile for other harnesses:

| Agent | Where | Status |
|---|---|---|
| Claude Code | `.claude/settings.json` `permissions.deny` | written by `--write` |
| Codex | `.codex/rules/agentmd.rules`, `prefix_rule(... decision = "forbidden")` | written by `--write` when the repo has `AGENTS.md` or `.codex/`; Codex loads project rules in trusted projects; `--check` fails when the file is out of date |
| Gemini CLI | `~/.gemini/policies/agentmd.toml` | `--print gemini`; Gemini CLI does not load policies from the repository yet ([gemini-cli#18186](https://github.com/google-gemini/gemini-cli/issues/18186)), so nothing is written there |
| Cursor | none | no repository-level deny list |

File rules (`Read`, `Edit`) and patterns with a wildcard inside stay Claude
Code only. The Codex output was checked with `codex execpolicy check`
(codex-cli 0.162.1): force pushes, pushes to `main`, `rm -rf` and `sudo` are
forbidden; `--force-with-lease`, other pushes, `rm file` and `ls` are not.

---

## learn

```bash
agentmd learn                  # corrections you gave twice or more, with counts
agentmd learn --all            # every correction
agentmd learn --days 30        # sessions from the last 30 days
agentmd learn --write          # append the repeats to CLAUDE.md under "## Learned from sessions"
```

The rules your own sessions are asking for. Developers write instruction
files reactively, "when the agent makes the same mistake twice", and the
corrections are already on disk in the agent's session logs. Across 20,574
real sessions, 91.5% of visible failures were resolved by the user saying so
(arXiv 2605.29442); users push back in half of all turns (arXiv 2604.20779).

```
  Learned from sessions  14 sessions · 23 corrections · 3 repeated

  4× in 3 sessions  No, use pnpm not npm
  3× in 2 sessions  Don't run the migrations locally  (already in CLAUDE.md — the rule exists and is not being followed: enforce or pin it)
  2× in 2 sessions  Use the existing logger, not console.log
```

It proposes; it does not judge. One success proves little (Cortex, arXiv
2610.14216), so `agentmd test` is the next step. Reads
`~/.claude/projects/<project>/*.jsonl` locally; nothing is sent anywhere.
Only Claude Code logs are read today.

---

## sbom

```bash
agentmd sbom                                 # summary
agentmd sbom --json                          # CycloneDX 1.6 on stdout
agentmd sbom --out .agentmd/context-bom.json
```

The context bill of materials: every instruction file, rule, skill and the
scripts beside it, subagent, hook command, MCP server (as a `pkg:npm` /
`pkg:pypi` purl with its pin state) and permission grant, each with a SHA-256
hash, plus a context digest over the whole set. CycloneDX 1.6, so it loads into
Dependency-Track and the rest. Offline, deterministic. Model: arXiv 2609.07360.

---

## cost

```bash
agentmd cost                       # per always-on file: tokens, dollars per developer per month
agentmd cost --devs 8 --model sonnet
agentmd cost --price 3 --prompts 30 --sessions 3 --days 22
agentmd cost --json
```

Every token in an always-on file (`CLAUDE.md`, `AGENTS.md`, `GEMINI.md`, Cursor
`alwaysApply` rules, `copilot-instructions.md`) is sent on every prompt of every
session. `cost` prices that at list input prices (presets `opus` $5/M, `sonnet`
$3/M, `haiku` $1/M, October 2026; `--price` for your own), with cached re-reads
at 10%, and shows what `lint --fix` would remove and which one-task sections
could move to a skill. Offline, zero tokens. The model is the per-session setup
cost of [arXiv 2610.11007](https://arxiv.org/abs/2610.11007).

---

---

### A budget in CI

```bash
agentmd cost --budget 1500     # exit 1 when the always-on context is over 1,500 tokens
```

Every always-on token is re-sent on every prompt. A budget check in the
pull-request workflow stops the file growing by appending; `ci --write` lists
it as an optional gate.

---

## lint

Check every file your agent reads before it reads your code. Works on any
repository — no manifest, no account, no network.

```bash
agentmd lint             # exit 1 on any error
agentmd lint --strict    # warnings fail too
agentmd lint --json
agentmd lint --sarif     # SARIF 2.1.0 for GitHub code scanning
agentmd lint --base main # also flag lines describing code this branch changed
agentmd lint --fix       # delete lint-leakage and duplicate lines, then re-check
```

It finds `CLAUDE.md`, `AGENTS.md`, `GEMINI.md`, `.cursorrules`,
`.windsurfrules`, `.cursor/rules/`, `.claude/rules/`, every `SKILL.md` (in
`.claude/skills/`, `.agents/skills/`, `.cursor/skills/`, `.codex/skills/`, `.github/skills/`,
`.gemini/skills/`, `skills/`, or at the root of a skill repository) and the scripts
bundled with it, `.claude/agents/*.md` subagents,
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
| warning | `stale-reference` | a repo path in backticks (`src/auth/middleware.ts`) that no longer exists; an `npm run X` (or `pnpm`/`yarn`/`bun run`) or `npm test` command when no `package.json` defines that script; a symbol named next to a file that no longer contains it ("`verifyToken()` in `src/lib/auth.ts`", "`a.ts` exports `x`"); a scoped rule (`globs:`, `applyTo:`, `paths:`) that matches no file. Examples, placeholders, home-folder configs, build output, installed standards and skills are skipped |
| notice | `stale-reference` | with `--base <branch>`: a line that names a file or folder this branch changed, in an instruction file the branch did not touch. A prompt to recheck the line, never a failure |
| warning | `stale-pins` | the agentmd block's pins no longer match the dependencies — run `link` |
| warning | `permissions` | `Bash` allowed with no pattern in Claude settings |
| notice | `lint-leakage` | formatting rules a formatter in the repo already enforces — fixable with `--fix` |
| notice | `duplicate` | the same instruction twice in an always-on file — fixable with `--fix` |
| notice | `fossil` | unedited `/init` boilerplate |
| error | `skill-payload` | in a skill's bundled scripts: a download piped into a shell, decoded data passed to `eval`/`exec`, the whole environment serialised, a credential store (`~/.ssh`, `.aws/credentials`, `.npmrc`, keychain) read by a script that also makes network calls. Comments are skipped; ordinary tooling (spawning ffmpeg or Chrome, calling an API with a key from the environment, decoding a `data:` image) is not flagged |
| warning | `skill-payload` | a skill script that writes to the agent's own configuration — settings, hooks, MCP servers, instruction files, shell profile — or reads a credential store without sending anything |
| notice | `skill-network` | the hosts each skill script contacts, so you know where data goes before you install it |
| warning · notice | `package-swap` | a package name with a typosquat's shape, in an install command (in a code block or a command span) or in a rule that swaps it for one the project installs: one or two letters off (`reqeusts`, `tranformers`), two letters swapped (`lodahs`), the separators changed (`crossenv`), or the same name under a near-miss scope (`@anthropic/sdk`), compared with the project's dependencies and a list of widely used packages. A **warning** offline: shape alone is not proof. A replacement that is not a look-alike (`axios-secure` for `axios`) is a notice. Extensions are never judged by shape (`react-router-dom`, `pytest-xdist`, `@types/react`). Quiet for the project's own packages and npm scopes, global tool installs, placeholders (`PACKAGE`, `<pkg>`), shell comments, and repos with no readable manifest |
| error | `package-swap` · `package-missing` (`lint --online`; on by default in `audit owner/repo`) | npm and PyPI are asked about every package the files install. A look-alike or replacement that is new or barely used (under 1,000 npm downloads a week; under 3 PyPI releases or 180 days) becomes an **error** with the registry's numbers; an established one is dropped. A name **not registered at all** is `package-missing`: whoever registers it first runs code on every machine that follows the line (slopsquatting). Skipped for npm scopes the `.npmrc` sends to a private registry, PyPI names behind the repo's own index, and `npx`/`bunx` names that may be a dependency's command (`npx tsgo`). Fails open; a local folder's names are only sent with `--online` |
| warning | `conflict` | two directives for the same thing with opposite polarity ("always run the full suite" / "never run the full suite"); a bare install for a package manager the lockfile contradicts (`npm install` in a pnpm repo). Only commands the agent is told to run count, and not installs of a named package: those are often instructions for the project's users (`npm install @medusajs/loyalty-plugin`) |
| notice | `skill-leakage` | a one-task procedure ("Adding a new provider", "How to cut a release": 4+ numbered steps or 15+ lines) in a root always-on file. Nested `AGENTS.md` files already load on demand, and a practice for every change ("How to split large changes") is not a task. Belongs in a skill or a scoped rule |
| notice | `redundant-overview` | a section of an always-on file whose lines are 60%+ copied word for word from `README.md`. The agent reads the README when it needs it; the copy costs tokens on every prompt and does not raise task success ([arXiv 2602.11988](https://arxiv.org/abs/2602.11988)) |
| error · warning | `install-source` | `--extra-index-url` / `--index-url` / `--index` / `--find-links` / `--registry` to a host that is not the ecosystem's registry (warning), `--trusted-host` (warning), plain-HTTP indexes (error), `--index-strategy unsafe-best-match` (warning: any index can supply any package, the dependency-confusion setting uv turns off by default), `PIP_CONFIG_FILE` and similar config redirection (warning). An index named after the project (`pypi.fury.io/lancedb/` in lancedb/lancedb) is its own. In instruction files and in root `requirements*.txt`, `.npmrc`, `pip.conf`, `uv.toml`, `.yarnrc`. Lines that warn against the pattern do not fire |
| warning | `mcp-unpinned` | an MCP server run through `npx` / `uvx` / `bunx` / `pipx` with no version or with `@latest`, a Docker image with no tag or digest, or a server URL over plain HTTP, in `.mcp.json`, `.cursor/mcp.json`, `.vscode/mcp.json`, `.gemini/settings.json` and Claude settings. An `npx` package that is a project dependency runs the lockfile's copy and is fine |
| warning | `permissions` | also: grants that let any instruction run any code, each with the reason: an interpreter with no script (`Bash(python3:*)`, `Bash(node -e:*)`), a runner with no package or a code runner (`Bash(npx:*)`, `Bash(npx ts-node:*)`), a command that runs its argument (`Bash(xargs:*)`, `Bash(env:*)`), `docker`, `docker run` and `docker exec`, and bare `sed` / `awk`. One known program is not flagged (`Bash(python -m pytest:*)`, `Bash(npx tsc:*)`, `Bash(docker ps:*)`), nor an exact command with no wildcard, nor `Bash(find:*)`: Claude Code does not auto-approve its `-exec` form |
| warning | `skill-preapproval` | `allowed-tools` that grants a shell for the whole turn: bare `Bash`, or a grant that is a shell by the `permissions` test above. Skills are found under `.claude`, `.agents`, `.cursor`, `.codex`, `.github` and `.gemini` |
| notice | `skill-frontmatter` | a `SKILL.md` without `name` or `description`, which the Agent Skills specification requires. Claude Code falls back to the folder name and the first paragraph, so a notice. A `SKILL.md` that only points at the shared copy (`@../../.agents/skills/x/SKILL.md`) is skipped |
| warning | `agent-description` | a `.claude/agents/*.md` subagent without a `description`: Claude Code skips it. A `README.md` in that folder is documentation, not a subagent |
| notice | `accretion` | an always-on file of 80+ lines with 8+ commits whose history shows additions only (deletions under 5% of additions). Files that only grow dilute compliance ([arXiv 2610.11007](https://arxiv.org/abs/2610.11007)); needs git history, silent otherwise |
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
agentmd audit owner/repo --offline       # skip the npm / PyPI check of the packages the files install
agentmd audit ./folder --online          # run that check for a local folder (off by default: its names stay local)
```

It downloads only what lint reads — instruction files, skills, MCP configs,
formatter config and dependency manifests — and creates every other path
empty, so stale-path checks still know what exists. Nothing from the repo is
executed. Exit code 1 when an error (a secret, an injection) is found.

### code-drift and skill-conflict (2.14)

| Rule | Level | Fires when |
| --- | --- | --- |
| `code-drift` | warning | the file and the repository disagree on a fact the repository states: "2 spaces" where `.editorconfig` `[*]` says tabs or 4; `npx jest` where only vitest (or mocha, ava) is a dependency (`npm install` in a pnpm-locked repository is the existing `conflict` rule). One finding per fact per file; lines that warn against the thing do not count |
| `skill-conflict` | notice | two skills in one skills folder share a name |

Agents follow the stale file over the code in 90.1% of choices and point out
the conflict while doing it (arXiv 2610.30571). `lint --fix` appends the
sentence that paper measured to a drifted file: *"When this file and the
existing code disagree, follow the code and say so in the reply."* Memory
files (`.claude/memory/*.md`) are linted like any other instruction file.

---

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
