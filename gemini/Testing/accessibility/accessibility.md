---
targetModels:
  - "Gemini 3.6 Flash"
  - "Gemini 3.5 Flash"
  - "Gemini 3.1 Pro"
  - "Gemini 3 Family"
  - "Future Gemini Models"
name: accessibility
category: Testing
description: Testing for accessibility — what automation catches, what it cannot, and the keyboard and screen-reader checks that find real barriers.
license: MIT
author: Agent.md maintainers
last-verified: 2026-08-23
reviewed-by: unreviewed
---
<!-- Generated from models/_canonical by scripts/build-model-variants.js.
     Edit the canonical source, not this file. Structure adapted for Gemini per deep-research.md. -->


# Purpose

Rules for verifying an interface is usable by people relying on assistive
technology, keyboards, magnification, or reduced motion.

The number to internalise: **automated tools detect roughly 30–40% of WCAG
issues.** They find missing `alt` text and low contrast. They cannot tell you the
alt text is wrong, the focus order is nonsensical, or the live region announces
nothing. Automate the mechanical half and check the rest by hand.

---

# Automated checks

Run `axe-core` in the existing test suite rather than as a separate audit that
happens quarterly.

```js
import { injectAxe, checkA11y } from "axe-playwright";

test("checkout has no detectable violations", async ({ page }) => {
  await page.goto("/checkout");
  await injectAxe(page);
  await checkA11y(page, undefined, {
    detailedReport: true,
    axeOptions: { runOnly: ["wcag2a", "wcag2aa", "wcag21aa"] },
  });
});
```

- Assert **zero violations** at the level you commit to (usually WCAG 2.1 AA).
- Test **every state**, not just first paint: modal open, form in error, menu
  expanded, empty list. Most violations live in states a page-load scan never
  reaches.
- Add `jest-axe` or `vitest-axe` at component level so a violation fails the pull
  request that introduced it, not a later audit.
- **Never** suppress a rule without a comment naming the reason and an owner.

---

# Keyboard

Every interactive element must be reachable and operable without a mouse.

| Key | Expected |
| --- | --- |
| `Tab` / `Shift+Tab` | Move forward and back through focusable elements |
| `Enter` | Activate a link or button |
| `Space` | Activate a button, toggle a checkbox |
| `Escape` | Close a modal, popover or menu |
| Arrow keys | Move within a composite widget — menu, tabs, listbox |

Checks that find real bugs:

- **Focus is always visible.** `outline: none` without a replacement makes the
  interface unusable for keyboard users. Style `:focus-visible`, never remove it.
- **Focus order follows visual order.** A `tabindex` above `0` breaks this and is
  almost always wrong — use DOM order instead.
- **Focus is trapped in a modal** while open, and **returns to the trigger** on
  close.
- **No keyboard trap.** You can always `Tab` out of a widget.
- Skip link to main content is the first focusable element.

```js
test("modal traps focus and restores it on close", async ({ page }) => {
  await page.getByRole("button", { name: "Edit profile" }).click();
  await expect(page.getByRole("dialog")).toBeFocused();

  await page.keyboard.press("Escape");
  await expect(page.getByRole("button", { name: "Edit profile" })).toBeFocused();
});
```

---

# Semantics

- Use the **native element** first. `<button>` is focusable, activates on `Enter`
  and `Space`, and announces as a button. A `<div role="button" tabindex="0">`
  requires you to reimplement all of that, and something always gets missed.
- **`role` does not add behaviour.** Adding `role="button"` to a `<div>` changes
  what a screen reader says, not what the keyboard does.
- One `<h1>` per page; headings descend without skipping levels. Screen-reader
  users navigate by heading far more than by reading linearly.
- Every input has a programmatic label — `<label for>`, `aria-label`, or
  `aria-labelledby`. Placeholder text is **not** a label; it disappears on focus.
- Images: meaningful ones need descriptive `alt`; decorative ones need `alt=""`,
  not a missing attribute.
- Announce dynamic changes with `aria-live="polite"` (or `role="status"`). A
  form error that appears silently does not exist for a screen-reader user.

**Never** use `aria-hidden="true"` on a focusable element — it produces a control
that can be reached but not announced, the worst of both.

---

# What automation cannot check

Reserve manual time for these:

| Check | How |
| --- | --- |
| Alt text is *correct*, not merely present | Read it with the image hidden |
| Focus order is logical | `Tab` through the whole page |
| Announcements make sense | NVDA (Windows), VoiceOver (macOS/iOS), TalkBack |
| Error messages are associated and announced | Submit an invalid form using only a keyboard |
| Content reflows at 400% zoom | Browser zoom, 320px viewport width |
| Motion respects the user's preference | `prefers-reduced-motion` |
| Colour is not the only signal | Grayscale the page |

Test with a real screen reader at least once per significant feature. Fifteen
minutes with VoiceOver finds problems no automated rule expresses.

---

# Contrast and motion

- Text contrast: **4.5:1** normal, **3:1** for large text (≥ 24px, or ≥ 19px bold).
- Non-text contrast **3:1** for interface components — input borders, focus
  indicators, icons carrying meaning.
- Honour `prefers-reduced-motion` for anything animated. Vestibular disorders make
  parallax and large transitions genuinely painful.

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

---

# Anti-patterns

| Anti-pattern | Why it fails | Fix |
| --- | --- | --- |
| `axe` on page load only | Misses modal, error and expanded states | Scan each state |
| Treating an automated pass as compliant | Catches ~30–40% of issues | Manual keyboard and screen-reader checks |
| `outline: none` | Keyboard users cannot see focus | Style `:focus-visible` |
| `tabindex` greater than `0` | Breaks focus order | Use DOM order |
| `<div role="button">` | No keyboard behaviour comes with the role | Use `<button>` |
| Placeholder as the only label | Disappears on focus; often unannounced | `<label for>` |
| `aria-hidden` on a focusable element | Reachable but unannounced | Remove focus or the attribute |
| Errors shown without a live region | Silent for screen-reader users | `aria-live="polite"` |
| Colour as the only status signal | Invisible to colour-blind users | Add icon or text |
| Suppressing a rule without a reason | Permanent silent regression | Comment with owner |

---

# Checklist

- [ ] Verify: `axe-core` runs in CI and asserts zero WCAG 2.1 AA violations
- [ ] Verify: Scans cover modal, error, expanded and empty states — not just page load
- [ ] Verify: Every interactive element is reachable and operable by keyboard
- [ ] Verify: Focus is always visible; `:focus-visible` is styled, never removed
- [ ] Verify: Focus order follows visual order; no `tabindex` above `0`
- [ ] Verify: Modals trap focus and restore it to the trigger on close
- [ ] Verify: Native elements are used before ARIA roles
- [ ] Verify: Every input has a programmatic label; placeholders are not labels
- [ ] Verify: Dynamic changes and errors are announced via a live region
- [ ] Verify: Text meets 4.5:1 contrast, interface components 3:1
- [ ] Verify: `prefers-reduced-motion` is honoured
- [ ] Verify: A real screen reader has been used on each significant feature
