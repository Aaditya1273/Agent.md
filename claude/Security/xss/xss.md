---
targetModels:
  - "Claude Fable 5"
  - "Claude Opus 5"
  - "Claude Sonnet 5"
  - "Claude 5 Family"
  - "Future Claude Models"
name: xss
category: Security
description: Preventing cross-site scripting through contextual output encoding, a strict Content-Security-Policy, and safe DOM and framework APIs.
license: MIT
author: Agent.md maintainers
last-verified: 2026-08-23
reviewed-by: unreviewed
---
<!-- Generated from models/_canonical by scripts/build-model-variants.js.
     Edit the canonical source, not this file. Structure adapted for Claude per deep-research.md. -->
# Purpose

<purpose>
Rules for stopping attacker-controlled data from executing as script in a user's
browser. Covers stored, reflected and DOM-based XSS.

The rule underneath everything: **encode for the context the data lands in.**
There is no single "escape" function, because HTML, attributes, JavaScript, URLs
and CSS have different metacharacters.

---
</purpose>

# Output encoding by context

<rules>
The same value needs different treatment depending on where it is inserted.

| Context | Example | Encode |
| --- | --- | --- |
| HTML body | `<p>HERE</p>` | `&` `<` `>` → entities |
| Attribute value | `<div title="HERE">` | Above plus `"` and `'`; always quote |
| URL parameter | `<a href="/s?q=HERE">` | `encodeURIComponent` |
| JavaScript string | `<script>var x="HERE"</script>` | **Do not.** Pass via `JSON.parse` from a data attribute |
| CSS value | `style="width:HERE"` | **Do not.** Use an allow-list of known values |

**Never** insert untrusted data into a `<script>` block, an inline event handler
(`onclick=`), a `javascript:` URL, or inside `<style>`. These are execution
contexts where no encoding is reliable. Pass data through a
`<script type="application/json">` block or a `data-` attribute and read it with
`JSON.parse`.

```html
<!-- Safe: the value is data, parsed explicitly, never evaluated -->
<div id="cfg" data-user='{"name":"…"}'></div>
<script>
  const cfg = JSON.parse(document.getElementById("cfg").dataset.user);
</script>
```

---
</rules>

# DOM APIs

<rules>
The API you choose decides whether a string can become markup.

```js
// DANGEROUS — parses HTML, executes injected handlers
el.innerHTML = userInput;
el.outerHTML = userInput;
el.insertAdjacentHTML("beforeend", userInput);
document.write(userInput);

// SAFE — the value is always text, never parsed
el.textContent = userInput;
el.setAttribute("title", userInput);
el.append(document.createTextNode(userInput));
```

`textContent` is the default. Reach for `innerHTML` only when rendering markup is
the actual requirement, and then only after sanitising.

**Never** pass untrusted input to `eval`, `new Function`, `setTimeout`/
`setInterval` as a string, or `element.setAttribute("on*", …)`. Each is a direct
path from string to execution.

**Never** assign untrusted input to `href` or `src` without scheme validation — a
`javascript:` URL executes on click:

```js
const url = new URL(input, location.origin);
if (!["http:", "https:"].includes(url.protocol)) throw new Error("blocked scheme");
a.href = url.href;
```

---
</rules>

# Sanitising when HTML is required

<rules>
When users must submit rich text, sanitise with a maintained, allow-list-based
library. Do not write your own.

```js
import DOMPurify from "dompurify";

el.innerHTML = DOMPurify.sanitize(userHtml, {
  ALLOWED_TAGS: ["b", "i", "em", "strong", "a", "p", "ul", "ol", "li", "code"],
  ALLOWED_ATTR: ["href", "title"],
});
```

Sanitise **on output, in the browser, immediately before insertion** — or on both
input and output. Sanitising only on input is fragile: the stored value survives
a library upgrade, a changed rendering path, or a second consumer that never
sanitises.

**Never** deny-list tags (`strip <script>`). Bypasses are endless: `<img onerror>`,
`<svg onload>`, `<iframe srcdoc>`, malformed nesting, mutation XSS. Allow-list only.

---
</rules>

# Framework escape hatches

<rules>
Modern frameworks encode by default. Every XSS in a React or Vue app is
therefore in a named escape hatch — audit these specifically:

| Framework | Dangerous API |
| --- | --- |
| React | `dangerouslySetInnerHTML` |
| Vue | `v-html` |
| Angular | `bypassSecurityTrustHtml`, `[innerHTML]` |
| Svelte | `{@html …}` |
| Solid | `innerHTML` prop |

The React name is deliberate. Treat every occurrence as requiring a sanitiser and
a comment explaining why raw HTML is necessary.

Angular's `DomSanitizer` bypass methods disable the framework's protection
entirely — `bypassSecurityTrustHtml` on user input is equivalent to `innerHTML`.

---
</rules>

# Content-Security-Policy

<rules>
CSP is the layer that limits damage when encoding fails. It is not a substitute
for encoding.

```
Content-Security-Policy:
  default-src 'self';
  script-src 'self' 'nonce-{RANDOM}' 'strict-dynamic';
  object-src 'none';
  base-uri 'none';
  frame-ancestors 'none';
  require-trusted-types-for 'script'
```

- **`'nonce-…'` with `'strict-dynamic'`** is the modern strict policy. The nonce
  must be CSPRNG-generated **per response** and never reused.
- **`object-src 'none'`** kills plugin-based execution.
- **`base-uri 'none'`** stops `<base>` injection redirecting relative script URLs.
- **`frame-ancestors 'none'`** prevents clickjacking; it supersedes
  `X-Frame-Options`.
- **`require-trusted-types-for 'script'`** makes DOM-XSS sinks throw unless the
  value passed a Trusted Types policy — the strongest available control against
  DOM-based XSS.

**Never** ship `script-src 'unsafe-inline'` or `'unsafe-eval'`. Together they
disable most of what CSP is for. **Never** use a host allow-list alone — hosted
JSONP endpoints and outdated libraries on a permitted CDN defeat it.

Deploy with `Content-Security-Policy-Report-Only` and a `report-to` endpoint
first, fix the violations, then enforce.

---
</rules>

# Cookies and related headers

<rules>
- Session cookies carry `HttpOnly` so that XSS cannot read them. This does not
  prevent XSS; it limits the payoff.
- `X-Content-Type-Options: nosniff` stops the browser reinterpreting a response
  as HTML. A user-uploaded file served without it can become a stored XSS.
- Serve user uploads from a **separate origin**, so injected content cannot reach
  your cookies or DOM.
- Set an explicit `Content-Type` with `charset=utf-8`. Charset confusion has
  historically enabled encoding bypasses.

---
</rules>

# Anti-patterns

<antipatterns>
| Anti-pattern | Why it fails | Fix |
| --- | --- | --- |
| `el.innerHTML = input` | Parses and executes markup | `el.textContent` |
| Stripping `<script>` tags | `<img onerror>`, `<svg onload>`, mutation XSS | Allow-list sanitiser |
| One `escapeHtml()` for every context | Attribute, URL and JS contexts differ | Encode per context |
| Sanitising only on input | Survives library and render-path changes | Sanitise on output |
| `script-src 'unsafe-inline'` | Disables the protection CSP exists for | Per-response nonce |
| `href = input` unchecked | `javascript:` executes on click | Validate the scheme |
| `dangerouslySetInnerHTML` with raw input | Bypasses framework encoding | Sanitise, or don't |
| Uploads served from the app origin | Stored XSS with full cookie access | Separate origin, `nosniff` |

---
</antipatterns>

# Checklist

<checklist>
- [ ] Output is encoded for its specific context, not a single generic escape
- [ ] No untrusted data inside `<script>`, `<style>`, `on*` handlers or `javascript:`
- [ ] `textContent` used by default; `innerHTML` only with a sanitiser
- [ ] Rich text passes an allow-list sanitiser at output time
- [ ] Every framework escape hatch is audited and justified in a comment
- [ ] `href` and `src` values are scheme-validated
- [ ] CSP set with a per-response nonce and `strict-dynamic`
- [ ] No `'unsafe-inline'` or `'unsafe-eval'` in `script-src`
- [ ] `object-src 'none'`, `base-uri 'none'`, `frame-ancestors 'none'` present
- [ ] Session cookies are `HttpOnly`; responses carry `nosniff`
- [ ] User uploads are served from a separate origin
</checklist>
