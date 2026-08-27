---
targetModels:
  - "DeepSeek V4"
  - "DeepSeek V3.2"
  - "DeepSeek R1"
  - "DeepSeek V3 Family"
  - "Future DeepSeek Models"
name: authorization
category: Security
description: Deciding what an authenticated user may do — enforcing at the data layer, preventing IDOR, and modelling roles without permission sprawl.
license: MIT
author: Agent.md maintainers
last-verified: 2026-08-23
reviewed-by: unreviewed
---
<!-- Generated from models/_canonical by scripts/build-model-variants.js.
     Edit the canonical source, not this file. Structure adapted for DeepSeek per deep-research.md. -->


# Purpose

Rules for enforcing what a user may do once you know who they are. Establishing
identity is `Security/authentication`.

The rule underneath everything: **authorise the object, not the route.** Most
real-world breaches are not missing login — they are a logged-in user reaching an
object that belongs to someone else.

---

# Enforce on every request, at the data layer

Authorisation belongs where the data is fetched, not in the UI and not only in a
middleware that guards a URL pattern.

```js
// WRONG — the check is on the route, the query is not scoped
if (!req.user) return res.status(401).end();
const invoice = await db.invoice.findUnique({ where: { id: req.params.id } });

// RIGHT — ownership is part of the query, so a miss is a miss
const invoice = await db.invoice.findFirst({
  where: { id: req.params.id, organisationId: req.user.organisationId },
});
if (!invoice) return res.status(404).end();
```

Scoping the query makes the safe path the default one. A developer who forgets a
check gets no rows rather than someone else's data.

**Never** rely on the client to enforce anything. A hidden button, a disabled
field and an unrendered route are user-interface conveniences. Every one is
reachable with `curl`.

**Never** authorise on an identifier supplied by the client — `?organisationId=`,
`X-Tenant-Id`, or a `role` field in the request body. Derive the subject's scope
from the **session**, always.

---

# IDOR — the most common failure

Insecure Direct Object Reference: the user changes an identifier and reaches
another user's record.

- Check ownership **on every operation**, including read, update, delete, export,
  and every nested resource. `/invoices/42/attachments/7` needs the attachment
  checked too, not just the invoice.
- Apply it to **bulk operations**. `POST /invoices/delete` with a list of ids must
  verify every element, not the first.
- **Return `404`, not `403`**, for objects the user may not see. `403` confirms
  the object exists, which is an enumeration oracle.
- Random identifiers (UUIDv4, ULID) reduce guessability. They are **not**
  authorisation — an identifier that leaks in a URL, a log, or a shared link is
  still reachable.

---

# Modelling permissions

Start simple and add structure only when it earns its place.

| Model | Fits | Cost |
| --- | --- | --- |
| Ownership check | Single-tenant, user-owned records | Trivial |
| **RBAC** — roles hold permissions | Most applications | Low; roles proliferate over time |
| **ReBAC** — relationship graph | Sharing, nesting, "documents in folders" | Needs a dedicated service |
| **ABAC** — attribute policy | Compliance, time and location rules | Hardest to reason about and test |

Check **permissions, not roles**, at the call site:

```js
// Fragile — every new role needs every call site edited
if (user.role === "admin" || user.role === "owner") { … }

// Durable — roles map to permissions in one place
if (!can(user, "invoice:delete", invoice)) return res.status(404).end();
```

```js
// One place maps roles to permissions, so adding a role never edits a call site.
const GRANTS = {
  viewer: ["invoice:read"],
  member: ["invoice:read", "invoice:create"],
  admin:  ["invoice:read", "invoice:create", "invoice:delete", "member:invite"],
};

function can(user, permission, resource) {
  if (!GRANTS[user.role]?.includes(permission)) return false;
  // Role is necessary but never sufficient — the object must also be in scope.
  return resource.organisationId === user.organisationId;
}
```

Principles that hold across all models:

- **Deny by default.** An endpoint with no explicit rule must refuse, not allow.
  Enumerate permitted actions, never forbidden ones.
- **Least privilege.** Grant the narrowest permission that works, including for
  service accounts and background jobs.
- **Re-evaluate on privilege change.** Roles cached in a session or JWT are stale
  the moment an admin revokes them — see the revocation section of `Security/jwt`.

---

# Multi-tenancy

- Put the tenant identifier in **every** table and **every** query. A single
  unscoped `findMany` is a cross-tenant leak.
- Prefer enforcement the application cannot forget: PostgreSQL **row-level
  security** with a session variable, or a repository layer that refuses an
  unscoped query.
```sql
-- PostgreSQL row-level security: the database refuses cross-tenant reads even
-- if an application query forgets its WHERE clause.
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation ON invoices
  USING (organisation_id = current_setting('app.organisation_id')::uuid);
```

- Test with **two tenants** whose ids differ. A single-tenant test suite passes
  happily against code that ignores the tenant entirely.

---

# Server-side and privilege escalation

- **Never** accept `role`, `isAdmin`, `plan` or `permissions` from a request body.
  Mass-assignment of these fields is direct privilege escalation. Allow-list the
  fields a user may update.
- **Never** expose an admin action on a route distinguished only by obscurity.
  `/admin/*` needs the same object-level checks as everything else.
- Re-check authorisation **after** any state transition — a user who was an owner
  when the request started may not be by the time it commits.
- Log authorisation **denials** with subject, object and action. A spike is either
  an attack or a broken deployment, and you want to know which.

---

# Anti-patterns

| Anti-pattern | Why it fails | Fix |
| --- | --- | --- |
| Route-level check with an unscoped query | IDOR: any id returns any record | Scope ownership into the query |
| Hiding the button in the UI | The endpoint is reachable with `curl` | Enforce server-side |
| Trusting `?organisationId=` from the client | Attacker chooses their own scope | Derive scope from the session |
| `403` for objects the user cannot see | Confirms existence; enumeration oracle | Return `404` |
| `if (user.role === "admin")` at call sites | Every new role edits every site | Check named permissions |
| Allowing `role` in a request body | Direct privilege escalation | Allow-list updatable fields |
| Checking only the parent resource | Nested objects unchecked | Authorise every level |
| Bulk endpoint checking the first item | The rest are unauthorised | Verify every element |
| UUIDs treated as authorisation | Identifiers leak via URLs and logs | Always check ownership |
| Single-tenant test data | Passes against tenant-blind code | Test with two tenants |

---

# Checklist

- [ ] Every data access is scoped by owner or tenant in the query itself
- [ ] No authorisation decision depends on a client-supplied identifier
- [ ] Nested and bulk operations authorise every object, not just the first
- [ ] Unauthorised objects return `404`, not `403`
- [ ] Endpoints deny by default; permitted actions are enumerated
- [ ] Call sites check named permissions rather than role strings
- [ ] `role`, `isAdmin` and `permissions` cannot be set from a request body
- [ ] Cached roles are re-evaluated on privilege change
- [ ] Multi-tenant queries are enforced structurally (RLS or repository layer)
- [ ] Tests cover two tenants and a cross-tenant access attempt
- [ ] Authorisation denials are logged with subject, object and action
