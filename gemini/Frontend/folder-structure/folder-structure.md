---
targetModels:
  - "Gemini 3.6 Flash"
  - "Gemini 3.5 Flash"
  - "Gemini 3.1 Pro"
  - "Gemini 3 Family"
  - "Future Gemini Models"
name: folder-structure
category: Frontend
description: Organising a frontend codebase — colocation by feature, import boundaries enforced by tooling, naming, and the shared layer that becomes a dumping ground.
license: MIT
author: Agent.md maintainers
last-verified: 2026-08-23
reviewed-by: unreviewed
---
<!-- Generated from models/_canonical by scripts/build-model-variants.js.
     Edit the canonical source, not this file. Structure adapted for Gemini per deep-research.md. -->


# Purpose

Rules for laying out a frontend codebase. Structure is a communication tool: it
tells a new contributor where a change belongs, and it makes an accidental
dependency visible in a diff.

The single decision that matters: **organise by feature, not by file type.**

---

# Colocate by feature

```
src/
  features/
    orders/
      components/OrderTable.tsx
      hooks/useOrders.ts
      api/orders.ts
      schemas.ts
      types.ts
      index.ts              # the public surface of this feature
    checkout/
    auth/
  shared/
    ui/                     # Button, Input — no feature knowledge
    lib/                    # formatMoney, cn — pure utilities
    hooks/                  # useDebouncedValue — generic
  app/                      # routes, layouts, providers
```

Compare with organising by type (`components/`, `hooks/`, `utils/` at the top
level): a single feature change touches four distant directories, related files
are never adjacent, and deleting a feature means hunting through every folder.

Colocation means **a feature is one directory**. You can read it, review it, and
delete it in one place.

Test files, styles and stories live beside the component they cover
(`OrderTable.tsx`, `OrderTable.test.tsx`) — a test in a parallel `__tests__` tree
is the file most likely to be forgotten when the component moves.

---

# Enforce the boundaries

A structure nobody enforces reverts to a graph within a quarter.

```js
// eslint.config.js — features may not import each other's internals
{
  rules: {
    "import/no-restricted-paths": ["error", { zones: [
      { target: "./src/features/*/!(index.ts)", from: "./src/features", except: ["./index.ts"] },
      { target: "./src/shared", from: "./src/features" },   // shared must not know features
    ]}],
  },
}
```

Three rules, all machine-checkable:

1. **Cross-feature imports go through `index.ts`.** Reaching into
   `features/orders/hooks/useOrders` from `features/checkout` couples them to an
   internal path.
2. **`shared/` never imports from `features/`.** The moment it does, "shared" means
   "everything", and the dependency graph is a cycle.
3. **No circular imports** (`eslint-plugin-import` `no-cycle`).

Add `dependency-cruiser` or `eslint-plugin-boundaries` for a stricter layered
model when the codebase warrants it.

---

# Promote to `shared/` on the third use

`shared/` is where structure goes to die if anything can enter it.

- Something used by **one** feature lives in that feature.
- Used by two? Duplicate it, or leave it where it is. Premature abstraction over
  two similar-looking cases produces a component with seven boolean props.
- Used by **three**, with the same meaning? Promote it — and give it its own
  tests.

Never create `utils.ts`, `helpers.ts`, `common/` or `misc/`. A name that does not
say what is inside guarantees unrelated things accumulate there. Name by domain:
`shared/lib/currency.ts`, `shared/lib/dates.ts`.

`shared/ui` holds presentational components with **no** business knowledge. A
`Button` that knows about orders is not shared.

---

# Naming and imports

| Thing | Convention |
| --- | --- |
| Component files | `PascalCase.tsx`, matching the exported component |
| Hooks | `useThing.ts` — the prefix drives lint rules |
| Utilities, config | `kebab-case.ts` |
| Directories | `kebab-case` |
| Types | `PascalCase`; colocated unless shared |
| Tests | `Thing.test.tsx` beside the source |

Pick one export style and hold it: default exports for route/page components
(frameworks expect them), named exports everywhere else. Named exports refactor
better and cannot be imported under a different name by mistake.

Use path aliases (`@/features/orders`) rather than `../../../`. Relative paths
break on every move and hide how far a module is reaching.

Order imports consistently — external, then aliased internal, then relative —
enforced by `eslint-plugin-import` so it never appears in a diff.

```json
// tsconfig.json — one alias root keeps imports short and moves cheap
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": { "@/*": ["src/*"] }
  }
}
```

Mirror the alias in the bundler (`vite.config.ts` `resolve.alias`, or webpack
`resolve.alias`) — TypeScript path mapping affects type checking only, and a
missing bundler alias produces a build that type-checks and then fails to
resolve at runtime.

---

# Signals to restructure

- A directory with more than ~15 files is usually two features.
- A file over ~300 lines is usually two files.
- A "feature" imported by every other feature is infrastructure — move it to
  `shared/` or `app/`.
- A cycle between features means one concept has been split across both.
- A `shared/` directory growing faster than `features/` means the promotion rule
  is not being applied.

Restructure when the signal appears, not on a schedule, and do it as its own
commit — a move mixed with a behaviour change is unreviewable.

---

# Anti-patterns

| Anti-pattern | Why it fails | Fix |
| --- | --- | --- |
| Top-level `components/`, `hooks/`, `utils/` | One change touches four directories | Organise by feature |
| Tests in a parallel `__tests__` tree | Forgotten when the source moves | Colocate |
| Cross-feature deep imports | Couples to internal paths | Import via `index.ts` |
| `shared/` importing from `features/` | Dependency cycle; "shared" means everything | One-way dependency |
| Circular imports | Undefined initialisation order; hard to reason about | `no-cycle` lint rule |
| `utils.ts` / `helpers.ts` / `misc/` | Unrelated code accumulates | Domain-named modules |
| Promoting to `shared/` on first reuse | Premature abstraction with boolean props | Wait for the third use |
| Shared components with domain knowledge | Not reusable; drags features along | Keep `shared/ui` presentational |
| Boundaries documented but not enforced | Reverts to a graph in a quarter | Lint rules in CI |
| Deep relative imports | Break on every move | Path aliases |
| Mixed export conventions | Inconsistent imports; refactors miss cases | One rule, linted |
| Restructuring mixed with behaviour changes | Unreviewable diff | Separate commits |
| Directories that grow without limit | Hides that it is two concerns | Split at the signal |

---

# Checklist

- [ ] Verify: Code is organised by feature, not by file type
- [ ] Verify: Each feature directory contains its components, hooks, API and schemas
- [ ] Verify: Tests, styles and stories are colocated with their source
- [ ] Verify: Each feature exposes a public surface through `index.ts`
- [ ] Verify: Cross-feature imports go through that surface only, enforced by lint
- [ ] Verify: `shared/` never imports from `features/`
- [ ] Verify: Circular imports are blocked in CI
- [ ] Verify: Code is promoted to `shared/` only on the third genuine use
- [ ] Verify: No `utils`, `helpers`, `common` or `misc` modules exist
- [ ] Verify: `shared/ui` components carry no business knowledge
- [ ] Verify: Naming conventions are consistent and linted
- [ ] Verify: Export style is consistent across the codebase
- [ ] Verify: Path aliases replace deep relative imports
- [ ] Verify: Import order is enforced automatically
- [ ] Verify: Restructuring lands as its own commit
