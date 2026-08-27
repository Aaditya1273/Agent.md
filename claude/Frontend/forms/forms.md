---
targetModels:
  - "Claude Fable 5"
  - "Claude Opus 5"
  - "Claude Sonnet 5"
  - "Claude 5 Family"
  - "Future Claude Models"
name: forms
category: Frontend
description: Forms that are accessible, resilient and correct — controlled state, validation timing, submission and error handling, and never trusting the client.
license: MIT
author: Agent.md maintainers
last-verified: 2026-08-23
reviewed-by: unreviewed
---
<!-- Generated from models/_canonical by scripts/build-model-variants.js.
     Edit the canonical source, not this file. Structure adapted for Claude per deep-research.md. -->
# Purpose

<purpose>
Rules for building forms. Forms are where accessibility, validation, state
management and security all meet, and where users lose work.

The first rule, which is not a frontend rule at all: **client-side validation is a
convenience, never a control.** Every rule below assumes the server validates
independently. → `Backend/validation`

---
</purpose>

# Use the platform

<rules>
```html
<form action="/orders" method="post">
  <label for="email">Email address</label>
  <input id="email" name="email" type="email" autocomplete="email" required
         aria-describedby="email-error" />
  <p id="email-error" role="alert">Enter a valid email address.</p>
  <button type="submit">Continue</button>
</form>
```

A real `<form>` with a submit button gives you Enter-to-submit, browser
autofill, password-manager integration, and — with a progressively enhanced
framework — a form that works before JavaScript loads.

| Attribute | Effect |
| --- | --- |
| `type="email"`, `tel`, `url`, `number` | Correct mobile keyboard and native validation |
| `autocomplete` | Autofill; `new-password` and `one-time-code` matter especially |
| `inputmode="numeric"` | Numeric keypad without `number`'s spinner and scroll quirks |
| `required`, `minlength`, `pattern` | Native constraints, free |
| `name` | **Required** for a form to submit without JavaScript |
| `enterkeyhint` | Labels the mobile Enter key |

**Never** use a `<div onClick>` as a submit control — it is not keyboard-operable
and does not submit the form.

---
</rules>

# Validate at the right moment

<rules>
Validating on every keystroke tells the user their email is invalid after the
first character. Validating only on submit hides errors until the end.

| Field state | When to validate |
| --- | --- |
| Never touched | Never |
| Being typed, previously invalid | On change — show the fix immediately |
| Being typed, currently valid | On blur |
| Submit attempted | All fields, immediately |

Define the schema once and use it on both sides:

```ts
// shared/schemas.ts — one definition, both client and server
export const SignUp = z.object({
  email: z.string().email(),
  password: z.string().min(12).max(200),
}).strict();
```

Two schemas drift, and the drift always favours the client — the form accepts
something the server rejects, and the user gets a generic `500`.

Message rules: say what is wrong **and how to fix it**. "Invalid input" is not a
message. Never blame the user, and never clear what they typed.

---
</rules>

# Errors must be announced, not just coloured

<rules>
```html
<input aria-invalid="true" aria-describedby="pw-error" />
<p id="pw-error" role="alert">Password must be at least 12 characters.</p>
```

- Associate the message with the input via `aria-describedby`, and set
  `aria-invalid`.
- `role="alert"` on the error container so screen readers announce it.
- **Never** convey an error by colour alone — colour-blind users see nothing.
  Combine colour with text and an icon.
- On a failed submit, move focus to the first invalid field and, for a long form,
  show a summary at the top with links to each field.
- Keep labels visible. Placeholder-as-label disappears on focus, fails contrast
  requirements, and breaks autofill. → `Testing/accessibility`

---
</rules>

# Submission

<rules>
```tsx
async function onSubmit(values) {
  setStatus("submitting");                     // disable the button, show progress
  try {
    await api.createOrder(values, { idempotencyKey });   // stable across retries
    setStatus("success");
  } catch (err) {
    setStatus("error");
    setFieldErrors(err.fieldErrors ?? {});     // map server errors back to fields
  }
}
```

- **Disable the submit button while in flight**, and use an idempotency key so a
  double-submit cannot create two orders. The button alone is not enough — the
  user can press Enter. → `API/rest`
- Map server-side field errors back onto the fields. A form that shows "Validation
  failed" without saying which field is unusable.
- **Never clear the form on error.** Losing typed data is the single most
  frustrating form bug.
- Warn on navigating away with unsaved changes (`beforeunload`), and for long
  forms save a draft to `localStorage` — but never a draft containing a password
  or a card number.
- Show a clear success state; a form that silently resets leaves users unsure
  whether it worked.

---
</rules>

# Security

<rules>
- Never trust anything from the client: not hidden fields, not `disabled`
  attributes, not `readonly` values. All are editable in devtools.
- Cross-site request forgery protection on every state-changing submission.
  → `Security/csrf`
- File uploads: validate type by content server-side, cap size, and never trust
  the filename. → `Backend/validation`
- Never log form values. A debug log of a signup form is a password disclosure.
- `autocomplete="off"` on a password field fights password managers and makes
  users choose weaker passwords. Use `new-password` instead.

---
</rules>

# Anti-patterns

<antipatterns>
| Anti-pattern | Why it fails | Fix |
| --- | --- | --- |
| Client-side validation as the control | Trivially bypassed | Server validates independently |
| Separate client and server schemas | They drift; the server rejects what the form accepted | One shared schema |
| `<div onClick>` submit | Not keyboard-operable; no native submit | `<button type="submit">` |
| No `name` attributes | Cannot submit without JavaScript | Name every field |
| Validating on every keystroke | Errors before the user finishes typing | Validate on blur, then on change |
| Errors shown only by colour | Invisible to colour-blind users | Text plus icon |
| Errors not associated with inputs | Screen readers never announce them | `aria-describedby` + `role="alert"` |
| Placeholder as label | Disappears; fails contrast; breaks autofill | Visible `<label>` |
| No submit-in-flight state | Double submission creates duplicates | Disable plus idempotency key |
| Server errors not mapped to fields | User cannot tell what to fix | Field-level error mapping |
| Clearing the form on error | Users lose their work | Preserve input |
| No unsaved-changes warning | Accidental navigation loses everything | `beforeunload` and drafts |
| Drafts containing secrets | Passwords persisted in `localStorage` | Exclude sensitive fields |
| Trusting hidden or disabled fields | Editable in devtools | Re-derive server-side |
| Missing `autocomplete` | Breaks autofill and password managers | Correct token per field |
| `autocomplete="off"` on passwords | Encourages weaker passwords | `new-password` |
| Logging form payloads | Password disclosure | Never log values |

---
</antipatterns>

# Checklist

<checklist>
- [ ] Every form is a real `<form>` with a submit button and named fields
- [ ] Appropriate `type`, `inputmode` and `autocomplete` are set per field
- [ ] Native constraint attributes are used where they apply
- [ ] One schema definition validates on both client and server
- [ ] Validation runs on blur first, then on change once a field is invalid
- [ ] Error messages state the problem and the fix
- [ ] Errors are associated with `aria-describedby` and announced with `role="alert"`
- [ ] `aria-invalid` is set on failing fields
- [ ] Errors are never conveyed by colour alone
- [ ] Labels are visible and associated; placeholders are not used as labels
- [ ] Focus moves to the first invalid field on failed submit
- [ ] The submit control is disabled while in flight
- [ ] Submissions carry an idempotency key
- [ ] Server field errors are mapped back onto the fields
- [ ] Input is never cleared on error
- [ ] Unsaved-change warnings and drafts exist for long forms, excluding secrets
- [ ] CSRF protection covers every state-changing submission
- [ ] No form values are logged
</checklist>
