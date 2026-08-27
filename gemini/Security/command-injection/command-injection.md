---
targetModels:
  - "Gemini 3.6 Flash"
  - "Gemini 3.5 Flash"
  - "Gemini 3.1 Pro"
  - "Gemini 3 Family"
  - "Future Gemini Models"
name: command-injection
category: Security
description: Executing external programs without letting input become part of the command — argument arrays, why shells are the problem, and safe temporary files.
license: MIT
author: Agent.md maintainers
last-verified: 2026-08-23
reviewed-by: unreviewed
---
<!-- Generated from models/_canonical by scripts/build-model-variants.js.
     Edit the canonical source, not this file. Structure adapted for Gemini per deep-research.md. -->


# Purpose

Rules for invoking external processes safely. The rule underneath everything:
**never let user input reach a shell.**

A shell interprets `;`, `|`, `&`, `` ` ``, `$()`, `>`, `<`, `&&` and newline as
control characters. Remove the shell and almost every injection vector goes with
it.

---

# Pass arguments as an array, never a string

```js
// WRONG — a shell parses this. `file` can contain `; rm -rf /`
exec(`convert ${file} out.png`);

// RIGHT — no shell; argv[1] is the filename even if it contains `;`
execFile("convert", [file, "out.png"]);
```

The array form is safe because the operating system receives an argument vector
directly. There is no parsing step for input to escape from.

| Language | Dangerous | Safe |
| --- | --- | --- |
| Node | `exec`, `execSync`, `spawn(…, { shell: true })` | `execFile`, `spawn` with an array |
| Python | `os.system`, `subprocess.run(..., shell=True)` | `subprocess.run([...])` |
| Ruby | `system("cmd #{x}")`, backticks | `system("cmd", x)` |
| Go | `exec.Command("sh", "-c", s)` | `exec.Command("cmd", args...)` |
| PHP | `system`, `exec`, `shell_exec` | `proc_open` with an array |
| Java | `Runtime.exec(String)` | `ProcessBuilder(List<String>)` |

**Never** set `shell: true` to make a command "work". It reintroduces the parser
you just removed. If you need a pipeline, build it with two processes and connect
their streams rather than handing a string to `sh -c`.

**Never** try to sanitise your way to safety by stripping metacharacters. The set
differs per shell, quoting rules are subtle, and encodings differ. Escaping
helpers such as `shlex.quote` exist for the case where a shell is genuinely
unavoidable — treat that as a last resort, not a default.

---

# Arguments that start with a dash

Even with an argument array, a value beginning with `-` may be read as an option:

```js
// A file literally named "--output" changes what the program does
execFile("grep", [pattern, file]);
```

Two defences, used together:

```js
// 1. End option parsing explicitly
execFile("grep", ["--", pattern, file]);

// 2. Force a path to be a path
execFile("grep", ["--", pattern, path.resolve(dir, file)]);
```

Most GNU tools honour `--`. Where a program does not, prefix relative paths with
`./` so they cannot be read as flags.

---

# Choosing the program itself

- **Never** let input decide which binary runs. Allow-list the command:

```js
const ALLOWED = { thumbnail: "convert", probe: "ffprobe" };
const bin = ALLOWED[req.body.action];
if (!bin) throw new Error("unsupported action");
```

- **Never** resolve the binary through `PATH` in a privileged context. `PATH` may
  be attacker-influenced. Use an absolute path — `/usr/bin/convert`.
- Reset the child environment rather than inheriting it. `LD_PRELOAD`,
  `PYTHONPATH`, `NODE_OPTIONS` and `IFS` all change behaviour:

```js
execFile("/usr/bin/convert", ["--", input, output], {
  env: { PATH: "/usr/bin:/bin" },   // explicit, minimal
  timeout: 10_000,
  maxBuffer: 1024 * 1024,
  cwd: workDir,
});
```

---

# Indirect injection

Command injection frequently arrives through something other than a command
string:

- **Filenames.** A user-supplied name reaching `tar`, `zip`, `git`, or a shell
  glob. Generate server-side names; never persist the client's.
- **`git` arguments.** A branch or remote beginning with `--upload-pack=` executes
  a program. Validate against `^[A-Za-z0-9._/-]+$` and reject leading `-`.
- **Archive extraction.** Entries may contain `../` or absolute paths, or be
  symlinks pointing outside the destination — see `Security/path-traversal`.
- **Environment values** interpolated into a script by a later stage.

---

# Reducing the blast radius

Assume the guard fails and limit what a successful injection achieves:

- Run as an unprivileged user; never `root`.
- Set `timeout` and `maxBuffer` on every child process. Unbounded output and
  never-exiting children are denial of service.
- Confine to a container, a `chroot`, or a sandbox with no network access when
  the tool does not need one.
- Give the process a working directory containing only what it needs.
- **Never** return raw `stderr` to the user — it leaks paths, versions and
  arguments. Log it, return something generic.

---

# Anti-patterns

| Anti-pattern | Why it fails | Fix |
| --- | --- | --- |
| `exec(\`cmd ${input}\`)` | A shell parses `;`, `\|`, `$()` | `execFile("cmd", [input])` |
| `spawn(cmd, args, { shell: true })` | Reintroduces the parser | Drop `shell: true` |
| Stripping `;` and `\|` from input | Metacharacter sets differ per shell | Remove the shell |
| Input selects the binary | Arbitrary program execution | Allow-list the command |
| Relying on `PATH` when privileged | `PATH` may be attacker-influenced | Absolute binary path |
| Inheriting the full environment | `LD_PRELOAD`, `IFS`, `NODE_OPTIONS` | Explicit minimal `env` |
| Passing a filename that may start with `-` | Read as an option | Use `--` and `path.resolve` |
| No `timeout` or `maxBuffer` | Hung or flooding children | Set both |
| Returning `stderr` to the client | Leaks paths and versions | Log it; return generic |

---

# Checklist

- [ ] Verify: No `exec`, `system`, `shell_exec` or `shell: true` receives input
- [ ] Verify: Every invocation passes an argument array
- [ ] Verify: `--` terminates options where the program supports it
- [ ] Verify: Paths are resolved before being passed as arguments
- [ ] Verify: The binary is chosen from a server-side allow-list, by absolute path
- [ ] Verify: The child environment is set explicitly, not inherited
- [ ] Verify: `timeout`, `maxBuffer` and `cwd` are configured
- [ ] Verify: The process runs unprivileged and, where possible, sandboxed
- [ ] Verify: Filenames and `git` refs are validated and never taken from the client verbatim
- [ ] Verify: `stderr` is logged server-side and never returned to the caller
