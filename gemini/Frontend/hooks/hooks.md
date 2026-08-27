---
targetModels:
  - "Gemini 3.6 Flash"
  - "Gemini 3.5 Flash"
  - "Gemini 3.1 Pro"
  - "Gemini 3 Family"
  - "Future Gemini Models"
name: hooks
category: Frontend
description: React hooks — the rules that make them work, dependency correctness, custom hook design, and the ones that replace an effect entirely.
license: MIT
author: Agent.md maintainers
last-verified: 2026-08-23
reviewed-by: unreviewed
---
<!-- Generated from models/_canonical by scripts/build-model-variants.js.
     Edit the canonical source, not this file. Structure adapted for Gemini per deep-research.md. -->


# Purpose

Rules for using and writing hooks. Hooks are positional: React identifies them by
**call order**, not by name. Everything in the Rules of Hooks follows from that
one implementation detail.

Component-level state modelling is `Frontend/react`.

---

# The rules, and why they exist

```tsx
// Broken — the hook order changes between renders, so React associates
// state with the wrong hook and the component corrupts silently.
if (isLoggedIn) { const [name, setName] = useState(""); }

// Correct — unconditional call, conditional value
const [name, setName] = useState("");
```

- Call hooks at the **top level** only. Never inside a condition, loop, nested
  function, or after an early `return`.
- Call them only from components or other hooks.
- Enable `eslint-plugin-react-hooks` and treat both `rules-of-hooks` and
  `exhaustive-deps` as errors. A disabled `exhaustive-deps` warning is a stale
  closure waiting to happen.

An early `return` before a hook is the most common accidental violation — it makes
the hook count differ between renders.

---

# Dependencies are not a suggestion

```tsx
// Stale closure: `query` is captured from the first render forever
useEffect(() => { search(query); }, []);

// Correct
useEffect(() => { search(query); }, [query]);
```

If the exhaustive list causes a loop, the fix is upstream, not a shortened array:

| Symptom | Real cause | Fix |
| --- | --- | --- |
| Effect loops on an object/array dep | New reference each render | `useMemo` it, or depend on a primitive field |
| Effect loops on a function dep | New function each render | `useCallback`, or move it inside the effect |
| Effect needs a value but should not re-run on it | A latest-value read, not a dependency | `useEffectEvent`, or a ref |
| Effect re-runs on every render | Missing dependency array entirely | Add one |

```tsx
// Depend on the field, not the object identity
useEffect(() => { track(user.id); }, [user.id]);
```

**Never** silence the lint rule to stop a loop. It converts a visible re-render
problem into an invisible stale-data problem.

---

# The right hook for the job

| Hook | Use for |
| --- | --- |
| `useState` | Independent values |
| `useReducer` | Several values that change together, or complex transitions |
| `useRef` | A mutable value that must **not** trigger a render; DOM handles |
| `useMemo` | A genuinely expensive computation, or a stable reference |
| `useCallback` | A stable function identity passed to a memoised child |
| `useSyncExternalStore` | Reading any store outside React |
| `useId` | Generated ids that must match between server and client |
| `useDeferredValue` | Keeping input responsive while an expensive list updates |
| `useTransition` | Marking a state update as non-urgent |
| `useOptimistic` | Showing the result of a mutation before it confirms |

`useSyncExternalStore` is the one people miss. Reading `localStorage`,
`matchMedia`, `navigator.onLine` or an external store with `useState` +
`useEffect` produces a hydration mismatch and a flash of wrong content:

```tsx
const isOnline = useSyncExternalStore(
  (cb) => { addEventListener("online", cb); addEventListener("offline", cb);
            return () => { removeEventListener("online", cb); removeEventListener("offline", cb); }; },
  () => navigator.onLine,        // client snapshot
  () => true                     // server snapshot — must be deterministic
);
```

A ref changing does **not** re-render. If the UI must reflect a value, it is
state, not a ref.

---

# Effects need cleanup

```tsx
useEffect(() => {
  const controller = new AbortController();
  fetch(url, { signal: controller.signal })
    .then((r) => r.json())
    .then(setData)
    .catch((e) => { if (e.name !== "AbortError") setError(e); });
  return () => controller.abort();        // cancels on unmount AND on url change
}, [url]);
```

Without the cleanup, two rapid changes to `url` can resolve out of order and the
stale response wins — the classic React data race.

Every subscription, timer, listener and observer must be torn down. Strict Mode
mounts, unmounts and remounts each component in development specifically to expose
a missing cleanup: if that breaks your component, it is already broken.

For data fetching, prefer a library (`@tanstack/react-query`, SWR) or a framework
loader. They handle caching, deduplication, retries and races — all of which you
would otherwise reimplement per component.

---

# Custom hooks

Extract a custom hook when **stateful logic** is reused. Extract a plain function
when the logic has no state — a function is easier to test and to reason about.

```tsx
// Named for what it does, returns a stable shape, cleans up after itself
export function useDebouncedValue<T>(value: T, delayMs = 300): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(id);
  }, [value, delayMs]);
  return debounced;
}
```

- Name it `useX` — the lint rules depend on that prefix to apply hook rules.
- Return a consistent shape: a tuple for two values, an object for more.
- Do not accept `props` wholesale; take the specific values needed.
- A custom hook containing no hooks should be a plain function.
- Test with `renderHook` from `@testing-library/react`.

---

# Anti-patterns

| Anti-pattern | Why it fails | Fix |
| --- | --- | --- |
| Conditional or early-return hook calls | Hook order shifts; state corrupts | Unconditional top-level calls |
| Silencing `exhaustive-deps` | Stale closures read old values | Fix the real dependency |
| Empty deps with captured values | Value frozen at first render | List every dependency |
| Object or array as a dependency | New reference each render; infinite loop | Depend on primitive fields |
| Effect without cleanup | Leaks; out-of-order responses | Return a teardown |
| Fetch in an effect without abort | Race conditions; stale data wins | `AbortController` or a data library |
| Ref used for rendered data | Changing it does not re-render | Use state |
| `useState` + `useEffect` for an external store | Hydration mismatch; flash of wrong content | `useSyncExternalStore` |
| Many `useState` for one concept | Impossible states; scattered updates | `useReducer` |
| `useCallback`/`useMemo` everywhere | Cost without measured benefit | Profile first |
| Custom hook not prefixed `use` | Lint rules do not apply | Name it `useX` |
| Custom hook taking whole props | Re-runs on unrelated changes | Take specific values |
| Stateless helper written as a hook | Harder to test for no reason | Plain function |
| Breaking on Strict Mode double-invoke | The bug is real, not the mode | Make effects idempotent |

---

# Checklist

- [ ] Verify: Hooks are called unconditionally at the top level of every component
- [ ] Verify: No hook follows an early return
- [ ] Verify: `eslint-plugin-react-hooks` runs with both rules set to error
- [ ] Verify: No `exhaustive-deps` suppression exists without a written justification
- [ ] Verify: Dependency arrays are complete; object identity is not depended on
- [ ] Verify: Every effect returns a cleanup for its subscriptions, timers and requests
- [ ] Verify: Data fetching aborts or ignores stale responses
- [ ] Verify: Components survive Strict Mode double-invocation
- [ ] Verify: External stores are read with `useSyncExternalStore`
- [ ] Verify: Refs hold only values that must not trigger a render
- [ ] Verify: Related state uses `useReducer` rather than many booleans
- [ ] Verify: Memoisation is applied only where profiling justified it
- [ ] Verify: Custom hooks are prefixed `use` and return a consistent shape
- [ ] Verify: Stateless logic is a plain function, not a hook
- [ ] Verify: Custom hooks are tested with `renderHook`
