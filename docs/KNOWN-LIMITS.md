# Known limits

What `lint`, `audit` and `motion check` cannot see. A pass is a floor, not a verdict: these are deterministic checks that report numbers and patterns. A person, or an agent reading the evidence, still decides whether the context is good and whether the film works.

Precision comes first. A check that cries wolf gets switched off, so every rule below prefers to miss a case rather than raise a false alarm. Measured on 4,292 registry files (0 errors, 0 warnings), 20 large open-source repositories and 272 real skill scripts (0 false alarms at release).

## `lint` and `audit`

| Rule | What it cannot see |
| --- | --- |
| `secret` | Keys with no recognisable prefix and no secret-looking name (`api_key =`, `token:`). A bare 40-character string in prose is not flagged. Placeholders (`your-api-key`, `xxxx`, `${VAR}`) are ignored on purpose. |
| `injection` | Instructions written in ordinary prose without the classic phrasing ("ignore previous instructions") and without hidden characters or comments. Code fences, inline code and lines that warn *against* the pattern are skipped, so an attack quoted as a teaching example is not flagged. |
| `stale-reference` | Paths without a slash and an extension (`config`), paths in folders this repository does not have (other repos, `~/.config`), build output (`dist/`, `build/`, `results/`), and lines that describe a file to create, an example, a placeholder or something optional ("if it exists", "when it is on disk"). A file that exists but moved its content is not detected. |
| `blind-reference` | Links that leave the repository. A missing target is reported once per file. |
| `skill-payload` | Only patterns with no ordinary use in a skill: a download piped into a shell, decoded data passed to `eval`/`exec`, the whole environment serialised, credential stores read by a script that also makes network calls. Obfuscation split across lines or files, payloads fetched at run time, and binaries are not analysed. Comments are skipped. |
| `skill-network` | Only hosts written literally in the script. URLs built at run time are not listed. |
| `bloat` | Counts tokens as characters ÷ 4. Nested `AGENTS.md` files load only when the agent works in that folder, so they are not counted as always-on. |
| `audit` | Fetches only instruction files, skills and their scripts, MCP configs, formatter configs and manifests. Every other file is created empty, so checks that need file *contents* elsewhere in the repo do not run. Nothing from the repository is executed. |

## `motion check`

Adapted from motionmaxxing's `look.py` (Apache-2.0, Tejas Makwana); the numbers agree with it on the films we compared.

| Gate | Limit |
| --- | --- |
| G0 render | Checks that the film decodes, has picture content and moves. It does not check that the length matches a plan. |
| G1 empty frames | Detects flat fields (one colour) on a 96×54 grey copy. A dark scene with very low contrast can read as flat; a frame with a tiny moving element is not flat. A fade from or to a flat colour at the very start or end is allowed. |
| G2 end hold | "Unchanged" means a mean frame difference under 0.35/255, so a very slow drift counts as held. A trailing fade to a flat colour is not counted. |
| G3 final shot | Hard cuts are estimated from sudden frame differences. Films that join scenes with fades, dips or camera moves show few cuts; with fewer than 3, the gate warns instead of failing and asks you to judge the ending by eye. |
| G4 loudness | Integrated loudness and true peak from ffmpeg's EBU R128 meter. It does not judge the mix: whether the music fights the voice is a listening check. |
| Motion note | Mean frame-to-frame change against the band measured on human-made launch films (median 6.8, IQR 4.4–9.8). A question, never a gate: calm brand films and loops sit below it on purpose. |
| Not measured | Proof readability, one hero per frame, taste. Judge them on a contact sheet: `ffmpeg -i film.mp4 -vf "fps=1/3,scale=480:-1,tile=4x4" -frames:v 1 sheet.jpg` |
