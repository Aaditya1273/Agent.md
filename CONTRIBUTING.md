# Contributing to Agent.md

Standards here are plain markdown. There is no build to run and no toolchain to
install — if you can write a convincing paragraph about a framework you know
well, you can contribute.

## Read this first: edit `_canonical/`, nothing else

The repository looks like it has 4,280 markdown files. It has 131 sources.

```
_canonical/<Category>/<name>.md     ← the source. Edit this.
claude/<Category>/<name>/…          ← generated. Do not edit.
open-ai/  gemini/  qwen/  …         ← generated. Do not edit.
```

Each standard is written once in `_canonical/` and generated into eleven model
family directories — XML-tagged sections for Claude, compact imperative bullets
for OpenAI, and so on. **A pull request that edits a generated file will be
overwritten by the next sync**, so it cannot be merged. Maintainers regenerate
the family variants after your canonical file lands; you never touch them.

The one exception is `<model>/Design/<brand>/DESIGN.md` — brand design documents
are authored per directory and have no canonical source.

## Three things worth doing

### 1. Write a standard for a stack that has none

The CLI detects these seven and then recommends nothing, because no content
exists for them:

| Needed | File to write |
| --- | --- |
| Vue | `_canonical/Frontend/vue.md` |
| Svelte | `_canonical/Frontend/svelte.md` |
| Angular | `_canonical/Frontend/angular.md` |
| NestJS | `_canonical/Backend/nestjs.md` |
| Fastify | `_canonical/Backend/fastify.md` |
| Rust | `_canonical/Backend/rust.md` |
| Java | `_canonical/Backend/java.md` |

These are the highest-value contributions in the repository. Claim one by
commenting on its issue so two people do not write the same file.

### 2. Upgrade a legacy standard

173 packages predate the canonical format. They open with `Version: 1.0.0` and a
`Target Models` list instead of YAML frontmatter, and they tend toward
philosophy where they should be giving rules and code. Converting one is a
self-contained pull request: read the old content, keep what is true, and
rewrite it to the bar below.

Find them by looking for a `claude/<Category>/<name>/` directory with no
matching `_canonical/<Category>/<name>.md`.

### 3. Verify one that already exists

Every canonical file carries `last-verified` and `reviewed-by: unreviewed`. Pick
a standard for a framework you use daily, check each rule against the current
documentation, fix what has drifted, and set:

```yaml
last-verified: 2026-10-02
reviewed-by: your-github-handle
```

A verification PR that changes two lines and corrects one stale API is worth
more than a new file nobody checked.

## The bar

Open any neighbour in the same category and match it. Concretely:

**Frontmatter**, all eight fields:

```yaml
---
name: vue
category: Frontend
description: One sentence naming what the model gets wrong without this file.
license: MIT
author: your-github-handle
last-verified: 2026-10-02
reviewed-by: unreviewed
version: 1.0.0
---
```

**Body**, around 200 lines:

- `# Purpose` — what this covers, what it deliberately does not, and which
  sibling standards own the rest.
- Four to seven rule sections, each named as an instruction (`# Derive, do not
  store`), not a topic (`# State`).
- Short right/wrong code blocks. Wrong first, right second, and the comment on
  the wrong one says what actually breaks.
- `# Anti-patterns` — a table of what models reach for and what to do instead.
- `# Checklist` — what a reviewer verifies before approving.

**Tone.** Imperative, specific, opinionated. You are writing for a model that
follows the instruction literally, so "prefer" and "consider" are wasted tokens.
Write the rule.

**Scope.** Rules a good engineer would enforce in review and a model gets wrong
from memory — usually because the API changed after its training cutoff. Not a
tutorial, not a framework summary, not anything already obvious from a type
signature.

## Submitting

1. Open an issue first, or comment on an existing one to claim it. This is the
   only way to avoid two people writing the same file.
2. One standard per pull request.
3. In the description, say how you verified the rules — which version, which
   docs page, what you ran. "I use this at work daily" is a real answer;
   silence is not.
4. Maintainers generate the eleven family variants after merge. Do not include
   them.

## Hacktoberfest

This repository takes part in Hacktoberfest. Issues labelled `hacktoberfest` are
the ones we want help with, and pull requests that meet the bar above are merged
and counted. Pull requests that reword a sentence, fix no real error, or edit a
generated file will be closed as `invalid` — not out of strictness, but because
a standard nobody trusts is worse than no standard at all.

## License

By contributing, you agree that your contributions are provided under this
repository's MIT license terms.
