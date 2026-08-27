---
targetModels:
  - "Gemini 3.6 Flash"
  - "Gemini 3.5 Flash"
  - "Gemini 3.1 Pro"
  - "Gemini 3 Family"
  - "Future Gemini Models"
name: typescript
category: Frontend
description: TypeScript in a frontend codebase — strict configuration, typing the boundary where data enters, discriminated unions, and never reaching for any.
license: MIT
author: Agent.md maintainers
last-verified: 2026-08-23
reviewed-by: unreviewed
---
<!-- Generated from models/_canonical by scripts/build-model-variants.js.
     Edit the canonical source, not this file. Structure adapted for Gemini per deep-research.md. -->


# Purpose

Rules for using TypeScript effectively. Types are only worth their cost if they
are **true**. A codebase full of `any`, `as` and `!` compiles cleanly and tells you
nothing.

The highest-value rule: **type the boundary where untrusted data enters**, and let
inference do the rest.

---

# Configure strictly, from the start

```json
{
  "compilerOptions": {
    "strict": true,                              // the eight strict flags
    "noUncheckedIndexedAccess": true,            // arr[0] is T | undefined — it is
    "exactOptionalPropertyTypes": true,          // `{a?: string}` ≠ `{a: undefined}`
    "noImplicitOverride": true,
    "noFallthroughCasesInSwitch": true,
    "verbatimModuleSyntax": true,
    "isolatedModules": true,
    "skipLibCheck": true
  }
}
```

| Flag | Catches |
| --- | --- |
| `strictNullChecks` (in `strict`) | The largest class of runtime errors |
| `noUncheckedIndexedAccess` | `array[i]` and `record[key]` assumed present |
| `exactOptionalPropertyTypes` | Explicitly assigning `undefined` to an optional field |
| `noFallthroughCasesInSwitch` | Missing `break` |

Adopting strict mode later is far more expensive than starting with it. On an
existing codebase, enable it for new files (`include` a subdirectory) and migrate
incrementally rather than turning it on repository-wide in one commit.

Run `tsc --noEmit` in CI. A bundler that strips types without checking them
(esbuild, SWC) will happily ship type errors.

---

# `any` defeats the point

`any` disables checking for that value **and everything it flows into**. One `any`
in a data model silently untypes the components downstream.

| Instead of `any` | Use |
| --- | --- |
| Genuinely unknown input | `unknown`, then narrow |
| A value with several shapes | A union |
| A generic container | A type parameter |
| A third-party module with no types | Write a `.d.ts`, or `unknown` at the boundary |
| Escaping a hard error | Fix the type, or `@ts-expect-error` with a comment |

```ts
// unknown forces you to check before use — that is the point
function handle(input: unknown) {
  if (typeof input === "string") return input.toUpperCase();
  throw new TypeError("expected string");
}
```

Ban it in lint (`@typescript-eslint/no-explicit-any`). Use `@ts-expect-error` —
never `@ts-ignore` — because it fails when the underlying error is fixed, so the
suppression cannot outlive its reason.

Assertions (`as`) and non-null (`!`) are unchecked claims. `data as User` compiles
whatever `data` is. Reserve them for cases where you genuinely know more than the
compiler, and write down why.

---

# Validate what crosses the boundary

TypeScript disappears at runtime. An API response typed as `User` is a promise you
made, not one the server kept.

```ts
// A lie: the response is `any` at runtime
const user = await res.json() as User;

// A guarantee: parsed and checked
const user = UserSchema.parse(await res.json());       // throws on mismatch
type User = z.infer<typeof UserSchema>;                // one source of truth
```

Validate at every boundary: API responses, `localStorage`, URL parameters, form
submissions, environment variables, webhook payloads, and anything from a third
party.

Derive the type from the schema (`z.infer`) so the runtime check and the static
type cannot drift. Two hand-maintained definitions always diverge.
→ `Backend/validation`

---

# Model with unions, not optional flags

```ts
// Permits { status: "success", error: Error } — a state that cannot happen
type State = { status: string; data?: Data; error?: Error };

// Discriminated union: illegal combinations do not typecheck
type State =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; data: Data }
  | { status: "error"; error: Error };

switch (state.status) {
  case "success": return state.data;      // narrowed; `.data` is not optional here
  default: { const _x: never = state; throw new Error("unhandled"); }   // exhaustive
}
```

The `never` assignment makes adding a variant a **compile error** in every switch
that does not handle it — which is the main reason to use unions at all.

Other modelling rules:

- Branded types for identifiers that must not be interchangeable:
  `type UserId = string & { readonly __brand: "UserId" }` stops a passing an order
  id where a user id is expected.
- `readonly` on arrays and props that must not be mutated.
- `satisfies` to check a literal against a type while keeping its narrow inference.
- Prefer inference for return types; annotate only public API surfaces where an
  explicit contract is valuable.

---

# Typing React

```tsx
// Props: an explicit interface; children typed only if accepted
interface ButtonProps extends React.ComponentPropsWithoutRef<"button"> {
  variant?: "primary" | "ghost";
}

// Events: use the DOM types, not `any`
const onChange = (e: React.ChangeEvent<HTMLInputElement>) => setValue(e.target.value);
```

- Extend `ComponentPropsWithoutRef<"element">` so every native attribute is
  accepted and typed, instead of re-declaring `className`, `onClick` and the rest.
- Type state explicitly when the initial value does not determine it:
  `useState<User | null>(null)`.
- `useRef<HTMLInputElement>(null)` — the type parameter matters for `.current`.
- Avoid `React.FC`: it adds nothing now and historically implied `children`.

---

# Anti-patterns

| Anti-pattern | Why it fails | Fix |
| --- | --- | --- |
| `any` anywhere | Disables checking downstream too | `unknown` and narrow |
| `as` to silence an error | An unchecked claim that compiles | Fix the type or validate |
| `!` non-null assertion by habit | Runtime `undefined` errors | Narrow explicitly |
| `@ts-ignore` | Outlives the problem it hid | `@ts-expect-error` with a reason |
| Casting an API response to a type | The type is a promise, not a check | Parse with a schema |
| Separate schema and interface | They drift; the drift favours the client | `z.infer` from the schema |
| `strict` disabled | Loses most of TypeScript's value | Enable it; migrate incrementally |
| Types not checked in CI | Bundlers strip without checking | `tsc --noEmit` |
| Optional flags for a state machine | Impossible states typecheck | Discriminated union |
| `switch` without exhaustiveness | New variants silently unhandled | `never` in the default case |
| Interchangeable id types | Passing a user id as an order id compiles | Branded types |
| Re-declaring native props | Misses attributes; drifts | Extend `ComponentPropsWithoutRef` |
| `React.FC` | Adds nothing; historical baggage | Type props directly |
| Enums for string sets | Extra runtime code; awkward interop | Union of string literals |

---

# Checklist

- [ ] Verify: `strict` is enabled, with `noUncheckedIndexedAccess`
- [ ] Verify: `tsc --noEmit` runs in CI and blocks merges
- [ ] Verify: `no-explicit-any` is a lint error
- [ ] Verify: `@ts-ignore` is banned; `@ts-expect-error` carries a reason
- [ ] Verify: Type assertions and non-null assertions are rare and justified
- [ ] Verify: Every external boundary is parsed with a runtime schema
- [ ] Verify: Static types are derived from those schemas, not written twice
- [ ] Verify: Related state is modelled as a discriminated union
- [ ] Verify: Switches over unions are exhaustive via a `never` check
- [ ] Verify: Identifier types are branded where confusion is possible
- [ ] Verify: Immutable data is marked `readonly`
- [ ] Verify: Component props extend the native element's props
- [ ] Verify: Event handlers use the correct DOM event types
- [ ] Verify: `useState` and `useRef` are explicitly typed where inference is insufficient
- [ ] Verify: Public API surfaces have explicit return types
