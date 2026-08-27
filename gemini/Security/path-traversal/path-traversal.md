---
targetModels:
  - "Gemini 3.6 Flash"
  - "Gemini 3.5 Flash"
  - "Gemini 3.1 Pro"
  - "Gemini 3 Family"
  - "Future Gemini Models"
name: path-traversal
category: Security
description: Confining file access to an intended directory — resolve-then-verify, symlink and archive pitfalls, and why blocking "../" does not work.
license: MIT
author: Agent.md maintainers
last-verified: 2026-08-23
reviewed-by: unreviewed
---
<!-- Generated from models/_canonical by scripts/build-model-variants.js.
     Edit the canonical source, not this file. Structure adapted for Gemini per deep-research.md. -->


# Purpose

Rules for reading, writing and serving files when any part of the path derives
from input.

The rule underneath everything: **resolve the final absolute path, then verify it
is inside the directory you intended.** Inspecting the input string is not a
control — it is a guess about how the operating system will interpret it.

---

# Resolve, then verify

```js
import path from "node:path";
import fs from "node:fs/promises";

const ROOT = path.resolve("/srv/uploads");

function safeJoin(root, userPath) {
  const target = path.resolve(root, userPath);
  // The separator matters: "/srv/uploads-evil" starts with "/srv/uploads".
  if (target !== root && !target.startsWith(root + path.sep)) {
    throw new Error("path escapes root");
  }
  return target;
}

const file = safeJoin(ROOT, req.params.name);
await fs.readFile(file);
```

Two details do the work:

- **`path.resolve` normalises first.** It collapses `..`, `.`, duplicate
  separators and mixed forms *before* the check, so the comparison is against
  what the filesystem will actually open.
- **The trailing separator in the comparison.** Without `+ path.sep`, the
  directory `/srv/uploads-evil` passes a plain `startsWith("/srv/uploads")`.

**Never** validate by string inspection:

```js
if (name.includes("..")) reject();      // insufficient
```

That check is defeated by URL encoding (`%2e%2e%2f`), double encoding
(`%252e%252e%252f`), overlong UTF-8, backslashes on Windows, and null bytes.
Decoding happens before your check in some stacks and after it in others — which
is precisely why you verify the resolved path instead.

**Never** concatenate paths with `+` or a template literal. Use `path.resolve`
or `path.join`, then verify.

---

# Absolute paths and drive letters

`path.join(root, "/etc/passwd")` yields `root/etc/passwd`, but
`path.resolve(root, "/etc/passwd")` yields `/etc/passwd` — the absolute argument
wins. This is a common and surprising escape.

Reject absolute inputs before resolving:

```js
if (path.isAbsolute(userPath)) throw new Error("absolute path rejected");
```

On Windows also reject drive-relative forms (`C:file`), UNC paths (`\\server\share`)
and reserved device names (`CON`, `PRN`, `AUX`, `NUL`, `COM1`–`COM9`, `LPT1`–`LPT9`).

---

# Symlinks

A path can pass every string check and still resolve outside the root, because a
component is a symbolic link.

```js
// Verify what the path actually points at, not what it looks like
const real = await fs.realpath(target);
if (real !== ROOT && !real.startsWith(ROOT + path.sep)) {
  throw new Error("symlink escapes root");
}
```

`realpath` resolves every link in the chain. Note the residual TOCTOU window: the
link can change between the check and the open. Where it matters, open the file
first and validate the descriptor — `O_NOFOLLOW`, or `fs.open` then `fstat` and
compare `st_dev`/`st_ino`.

---

# Uploads

- **Never** persist the client's filename. Generate your own — a UUID or a content
  hash — and store the original name as metadata only.
- Derive the extension from **sniffed content type**, not from the supplied name.
- Store outside the web root, or in object storage, so an uploaded file cannot be
  requested as a script.
- Serve with `Content-Disposition: attachment` and
  `X-Content-Type-Options: nosniff`.
- Serve user content from a **separate origin** so a stored HTML file cannot reach
  your cookies — see `Security/xss`.

---

# Archive extraction — Zip Slip

An archive entry may contain `../`, an absolute path, or be a symlink. Extracting
without checking writes outside the destination.

```js
for (const entry of entries) {
  const target = safeJoin(DEST, entry.name);   // same check as above
  if (entry.isSymlink) continue;               // or verify the link target too
  await writeFile(target, entry.data);
}
```

Also bound the extraction itself: cap total uncompressed bytes, entry count and
nesting depth. A 42 KB archive expanding to petabytes is a zip bomb, and the
denial of service arrives long before any traversal does.

---

# Static file serving

Prefer a hardened server or a maintained library over hand-rolled path handling —
`express.static`, `send`, nginx `root`. They already handle encoding, symlinks,
range requests and dotfiles.

If you must handle it yourself:

- Deny dotfiles by default (`.git`, `.env`, `.ssh`).
- Do not follow symlinks unless deliberate.
- Reject null bytes (`%00`) outright; historically they truncated paths in C
  string handling.
- Canonicalise once, at the boundary, and pass the resolved path onward.

---

# Anti-patterns

| Anti-pattern | Why it fails | Fix |
| --- | --- | --- |
| `if (p.includes(".."))` | Encoding, double encoding, backslashes | Resolve, then verify |
| `root + "/" + userPath` | No normalisation; `..` survives | `path.resolve` then verify |
| `startsWith(root)` without a separator | `/srv/uploads-evil` passes | Compare `root + path.sep` |
| Ignoring absolute inputs | `path.resolve` lets them win outright | Reject `path.isAbsolute` |
| Checking the string but not the link | Symlink escapes the root | `fs.realpath` |
| Saving the client's filename | Traversal and overwrite via the name | Server-generated name |
| Extracting archives unchecked | Zip Slip writes anywhere | Verify each entry path |
| No extraction limits | Zip bomb exhausts disk | Cap size, count, depth |
| Uploads served from the app origin | Stored XSS with cookie access | Separate origin, `nosniff` |

---

# Checklist

- [ ] Verify: Every input-derived path is resolved to absolute before use
- [ ] Verify: The resolved path is verified against `root + path.sep`
- [ ] Verify: Absolute paths, drive-relative forms and UNC paths are rejected
- [ ] Verify: Windows reserved device names are rejected
- [ ] Verify: `realpath` is used where symlinks are possible
- [ ] Verify: Uploads are stored under server-generated names, outside the web root
- [ ] Verify: Upload type comes from sniffed content, not the supplied extension
- [ ] Verify: Archive entries are path-checked individually; symlink entries handled
- [ ] Verify: Extraction caps total size, entry count and depth
- [ ] Verify: Dotfiles and null bytes are rejected by the static file path
- [ ] Verify: User content is served from a separate origin with `nosniff`
