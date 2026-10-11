# Known limits

What `lint` and `audit` cannot see. A pass is a floor, not a verdict: these are deterministic checks that report patterns. A person, or an agent reading the evidence, still decides whether the context is good.

Precision comes first. A check that cries wolf gets switched off, so every rule below prefers to miss a case rather than raise a false alarm. Measured on 4,292 registry files (0 errors, 0 warnings), 20 large open-source repositories and 272 real skill scripts (0 false alarms at release).

## `lint` and `audit`

| Rule | What it cannot see |
| --- | --- |
| `secret` | Keys with no recognisable prefix and no secret-looking name (`api_key =`, `token:`). A bare 40-character string in prose is not flagged. Placeholders (`your-api-key`, `xxxx`, `${VAR}`) are ignored on purpose. |
| `injection` | Instructions written in ordinary prose without the classic phrasing ("ignore previous instructions") and without hidden characters or comments. Code fences, inline code and lines that warn *against* the pattern are skipped, so an attack quoted as a teaching example is not flagged. |
| `stale-reference` | Paths without a slash and an extension (`config`), paths in folders this repository does not have (other repos, `~/.config`), build output (`dist/`, `build/`, `results/`), lines that describe a file to create, an example, a placeholder or something optional ("if it exists", "when it is on disk"), and paths the repository git-ignores (downloaded or generated at run time). A file that still exists but changed meaning is caught only in two deterministic cases: an `npm run X` (or `pnpm run`, `yarn run`, `bun run`) or `npm test` command when no `package.json` in the repository defines that script (shorthand like `pnpm build` is not checked, because it also runs any installed tool of that name), and a code symbol (`verifyToken()`, `createSession`, `MAX_RETRIES`) written next to a file, as in "`x()` in `a.ts`" or "`a.ts` exports `x`", that the file no longer contains. Plain words (`config`, `Button`), symbols not tied to a file, renamed behaviour behind an unchanged name, and anything in installed standards or skills are not checked. With `--base <branch>`, a line that names a file or folder the branch changed, in an instruction file the branch did not touch, is reported as a notice: that is a prompt to recheck, because whether the line still holds is a judgement. Paths need two segments (`src/lib/auth.ts`, `apps/web/app/`), so a bare `src/` does not fire on every pull request. |
| `blind-reference` | Links that leave the repository. A missing target is reported once per file. |
| `skill-payload` | Only patterns with no ordinary use in a skill: a download piped into a shell, decoded data passed to `eval`/`exec`, the whole environment serialised, credential stores read by a script that also makes network calls. Obfuscation split across lines or files, payloads fetched at run time, and binaries are not analysed. Comments are skipped. |
| `skill-network` | Only hosts written literally in the script. URLs built at run time are not listed. |
| `bloat` | Counts tokens as characters ÷ 4. Nested `AGENTS.md` files load only when the agent works in that folder, so they are not counted as always-on. |
| `audit` | Fetches only instruction files, skills and their scripts, MCP configs, formatter configs and manifests. Every other file is created empty, so checks that need file *contents* elsewhere in the repo do not run. Nothing from the repository is executed. |
