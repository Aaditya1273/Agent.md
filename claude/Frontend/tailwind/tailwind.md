---
targetModels:
  - "Claude Fable 5"
  - "Claude Opus 5"
  - "Claude Sonnet 5"
  - "Claude 5 Family"
  - "Future Claude Models"
name: tailwind
category: Frontend
description: Tailwind CSS — design tokens over arbitrary values, component extraction, conditional classes without string concatenation, and dark mode.
license: MIT
author: Agent.md maintainers
last-verified: 2026-08-23
reviewed-by: unreviewed
---
<!-- Generated from models/_canonical by scripts/build-model-variants.js.
     Edit the canonical source, not this file. Structure adapted for Claude per deep-research.md. -->
# Purpose

<purpose>
Rules for using Tailwind. Its value is a constrained design system applied
directly where markup lives — no naming, no dead CSS, no cascade surprises.

The failure mode is the opposite: arbitrary values everywhere, duplicated class
strings, and unreadable markup. Every rule here protects the constraint.

---
</purpose>

# Configure tokens; stop reaching for arbitrary values

<rules>
```css
/* app.css — Tailwind v4 configures in CSS */
@import "tailwindcss";

@theme {
  --color-brand-500: oklch(0.62 0.19 259);
  --color-surface:   oklch(0.98 0 0);
  --spacing-18:      4.5rem;
  --radius-card:     0.75rem;
  --font-display:    "Inter Variable", sans-serif;
}
```

Then `bg-brand-500`, `p-18`, `rounded-card` work everywhere, and the value is
defined once.

`p-[13px]` and `text-[#3b82f6]` bypass the system. Each one is a value nobody
else knows about and nothing can update. Use them for genuine one-offs (a
`translate-y-[3px]` optical adjustment), and add a token the second time a value
appears.

Prefer the scale for colours, spacing, radii, shadows and typography.

**Never** hard-code a brand colour as a hex value in a utility class. When the
brand changes, they are unfindable.

---
</rules>

# Extract components, not `@apply` soup

<rules>
```tsx
// The right abstraction is a component: typed, testable, composable
export function Button({ variant = "primary", className, ...props }) {
  return <button className={cn(base, variants[variant], className)} {...props} />;
}
```

```css
/* The wrong one: reinvents CSS classes and loses everything Tailwind gave you */
.btn { @apply px-4 py-2 rounded font-medium bg-brand-500 text-white; }
```

`@apply` reintroduces the naming problem, the indirection, and the dead-CSS
problem Tailwind exists to remove. Reserve it for a handful of genuinely global
primitives (a focus ring, a prose block), not for components.

For variants, use `cva` (class-variance-authority) or `tailwind-variants` — they
give typed variants and handle conflict resolution:

```ts
const button = cva("inline-flex items-center rounded-card font-medium", {
  variants: {
    variant: { primary: "bg-brand-500 text-white", ghost: "bg-transparent hover:bg-surface" },
    size:    { sm: "h-8 px-3 text-sm", md: "h-10 px-4" },
  },
  defaultVariants: { variant: "primary", size: "md" },
});
```

Always accept a `className` prop and merge it with `twMerge` so a caller can
override — otherwise `bg-red-500` and `bg-brand-500` both land in the class list
and the winner depends on stylesheet order, not on intent.

---
</rules>

# Conditional classes

<rules>
```tsx
// Broken: the scanner never sees the full class name, so the CSS is not generated
<div className={`text-${color}-500 p-${size}`} />

// Correct: complete class names in the source
const COLOR = { error: "text-red-500", ok: "text-green-600" } as const;
<div className={COLOR[status]} />
```

Tailwind generates CSS by **scanning source files for literal class strings**. A
dynamically constructed name produces no CSS and no error — the style is simply
absent, and usually only in the production build.

Use `clsx`/`cn` for conditionals, and `twMerge` to resolve conflicts:

```tsx
<div className={cn("p-4 text-sm", isActive && "bg-brand-50", className)} />
```

---
</rules>

# Responsive, state and dark mode

<rules>
Tailwind is mobile-first: an unprefixed utility applies at all sizes, and `md:`
applies **from** that breakpoint up.

```tsx
<div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4" />
```

- Use state variants rather than JavaScript: `hover:`, `focus-visible:`,
  `disabled:`, `aria-expanded:`, `data-[state=open]:`, `group-hover:`, `peer-checked:`.
- `focus-visible:` rather than `focus:` for focus rings, and **never** remove the
  ring without replacing it — keyboard users need it. → `Testing/accessibility`
- Dark mode: define both palettes as tokens and let `dark:` switch them. Driving
  it from a `data-theme` attribute set before hydration avoids a flash and a
  hydration mismatch. → `Frontend/hydration`
- Honour `motion-reduce:` for anything animated.

---
</rules>

# Keep markup readable

<rules>
A 30-class element is a real cost. Reduce it by:

- Extracting a component as soon as the same string appears twice.
- Grouping classes in a consistent order — enforce with
  `prettier-plugin-tailwindcss` so ordering never appears in a diff.
- Using logical properties (`ps-4`, `me-2`) where the application supports RTL.
- Letting the parent own layout (`flex`, `gap`) and children own themselves; a
  child setting its own margin for a specific parent is not reusable.

Tailwind's output is already minimal — it emits only the classes it found. The
remaining size concern is your own markup, not the stylesheet.

---
</rules>

# Anti-patterns

<antipatterns>
| Anti-pattern | Why it fails | Fix |
| --- | --- | --- |
| Arbitrary values everywhere | Bypasses the design system | Define tokens in `@theme` |
| Hex colours in utility classes | Unfindable when the brand changes | Named colour tokens |
| `@apply` for components | Reintroduces naming and dead CSS | React components |
| Dynamic class-name construction | Class never generated; silent missing style | Full literal strings in a map |
| No `twMerge` on merged classes | Conflicts resolved by stylesheet order | `cn` with `twMerge` |
| Component not accepting `className` | Callers cannot adjust anything | Accept and merge it |
| Duplicated long class strings | Drift between copies | Extract a component |
| Desktop-first breakpoints | Fights Tailwind's mobile-first model | Base styles, then `md:` up |
| `focus:` instead of `focus-visible:` | Rings on mouse click | `focus-visible:` |
| Removing the focus ring | Keyboard navigation becomes invisible | Replace, never remove |
| JavaScript for hover/open states | More code than a variant | State and `data-*` variants |
| Dark mode via duplicated markup | Two trees to maintain | Token pairs plus `dark:` |
| Unordered class strings | Noisy diffs | Prettier plugin |
| Ignoring `motion-reduce:` | Vestibular discomfort; accessibility failure | Respect the preference |

---
</antipatterns>

# Checklist

<checklist>
- [ ] Design tokens are defined centrally and used instead of arbitrary values
- [ ] Arbitrary values are rare, one-off and justified
- [ ] No raw hex colours appear in utility classes
- [ ] Repeated class strings are extracted into components
- [ ] `@apply` is limited to a few global primitives
- [ ] Variants are defined with `cva` or `tailwind-variants`
- [ ] Components accept and merge a `className` prop with `twMerge`
- [ ] No class name is built by string interpolation
- [ ] Conditional classes come from complete literal strings
- [ ] Layout is mobile-first with breakpoints applied upward
- [ ] Interactive states use Tailwind variants rather than JavaScript
- [ ] `focus-visible:` rings are present on every interactive element
- [ ] Dark mode uses token pairs and is set before hydration
- [ ] `motion-reduce:` is honoured for animations
- [ ] Class ordering is enforced by the Prettier plugin
</checklist>
