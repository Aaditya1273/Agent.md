---
targetModels:
  - "DeepSeek V4"
  - "DeepSeek V3.2"
  - "DeepSeek R1"
  - "DeepSeek V3 Family"
  - "Future DeepSeek Models"
name: authorization
category: Backend
description: Enforcing access control in a service — where the check belongs, scoping queries by tenant, RBAC versus ABAC, and testing that a denial is actually denied.
license: MIT
author: Agent.md maintainers
last-verified: 2026-08-23
reviewed-by: unreviewed
---
<!-- Generated from models/_canonical by scripts/build-model-variants.js.
     Edit the canonical source, not this file. Structure adapted for DeepSeek per deep-research.md. -->


# Purpose

Rules for enforcing who may do what, in a backend service. Authentication
establishes identity (`Backend/authentication`); authorization decides what that
identity may do. Policy modelling is `Security/authorization`; this package is
about where the check lives and how it does not get skipped.

The dominant failure is not a wrong policy. It is a **missing check on one
endpoint** — an authenticated request that returns somebody else's row.

---

# Scope the query; do not check afterwards

```ts
// Broken — authenticated, authorized for nothing in particular
const order = await db.order.findUnique({ where: { id: req.params.id } });
if (order.tenantId !== req.auth.tenantId) return res.sendStatus(403);  // one refactor from gone

// Correct — the scope is part of the query
const order = await db.order.findFirst({
  where: { id: req.params.id, tenantId: req.auth.tenantId },
});
if (!order) return res.sendStatus(404);
```

Filtering in the `WHERE` clause means there is no window in which the wrong data
exists in the process, and no branch to forget. Make it structural: a repository
layer that requires a tenant scope, or row-level security in the database, so an
unscoped query cannot be written.

```sql
-- Postgres RLS: the database refuses to return another tenant's rows
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON orders
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
```

Return `404` rather than `403` for objects the caller may not see — a `403`
confirms the object exists. → `API/api-security`

---

# One layer owns the decision

Authorization belongs in the **service layer**, where the domain objects are, not
scattered across controllers and templates.

| Layer | Role |
| --- | --- |
| Middleware | Coarse gates: route requires authentication, requires a scope |
| Service | The real decision, with the object in hand |
| Repository | Mandatory tenant scoping |
| Database | Row-level security as a backstop |
| UI | Hides what is not permitted — **never** a control |

The UI hiding a button is a usability improvement. The request it would have made
is still available to anyone with `curl`.

Centralise the policy so it can be read in one place:

```ts
// One function, exhaustively tested, used everywhere
export function can(actor: Actor, action: Action, resource: Resource): boolean;
```

Scattered `if (user.role === "admin")` checks cannot be audited, and they drift.
Note also that a role check is not a permission check — `admin` on one tenant is
not `admin` on another.

---

# Model: roles, then attributes

Start with **RBAC**: roles carry permissions, users hold roles, scoped to a
tenant. It covers most systems and is easy to reason about and to display.

Add **ABAC/ReBAC** only for rules RBAC cannot express — "the owner of the document
or a member of its project", "only during business hours", "only below
€10,000". Represent them as explicit policy rather than nested conditionals.

For genuinely complex relationship graphs, a dedicated engine (OpenFGA, SpiceDB,
Cedar, OPA) is worth the operational cost. Below that, a single well-tested `can()`
function is simpler and faster.

Rules that hold regardless of the model:

- **Deny by default.** An action with no matching policy is denied.
- **Least privilege.** New roles start with nothing.
- **Check every time**, on every request. A permission cached in a JWT is stale
  the moment access is revoked.
- **Field-level too.** Reading an order does not imply reading its
  `costBasisCents`. Project explicit fields.

---

# The checks people forget

| Path | Commonly missed |
| --- | --- |
| `PATCH`/`PUT` | Ownership checked on read, not on write |
| Bulk endpoints | Checked for the first id, not for all of them |
| Nested resources | `/orders/{id}/items/{itemId}` — item not verified to belong to the order |
| Background jobs | Run as "system" with no scope at all |
| Exports and reports | Aggregate across tenants |
| GraphQL nested fields | Reached without passing the root check → `API/graphql` |
| Webhooks and callbacks | Authenticated by URL secrecy alone |
| Admin tooling | Internal-only assumption, publicly routable |
| Object storage URLs | Signed once, valid indefinitely |
| Cursors and filters | Encode a scope the client can edit |

A background job acting on behalf of a user must carry that user's scope, not
run unrestricted.

---

# Test denial, not just permission

Authorization tests that only assert the happy path prove nothing. The valuable
assertion is that a request **fails**.

```ts
test("a member of tenant B cannot read tenant A's order", async () => {
  const res = await request(app).get(`/v1/orders/${tenantAOrderId}`)
    .set("Cookie", sessionFor(tenantBUser));
  expect(res.status).toBe(404);
});
```

- One denial test per protected resource type, at minimum.
- A test that enumerates every route and asserts an unauthenticated request is
  rejected catches the new endpoint someone forgot to protect. Make it fail
  closed: new routes must be added to an explicit public allowlist.
- Log every denial with actor, action, resource and source IP — a spike is either
  an attack or a broken deploy. → `Security/audit-log`

---

# Anti-patterns

| Anti-pattern | Why it fails | Fix |
| --- | --- | --- |
| Fetch then compare ownership | One missed branch leaks data | Scope inside the query |
| Tenant id from the request | Horizontal privilege escalation | Tenant from the session |
| `403` for hidden objects | Confirms existence | `404` |
| Checks scattered across controllers | Cannot be audited; drifts | One `can()` function |
| Role string compared inline | Not scoped to a tenant; unauditable | Permission check via policy |
| UI hiding treated as enforcement | `curl` bypasses it entirely | Server-side check always |
| Permissions cached in a JWT | Revocation does not take effect | Check per request |
| Object-level only | Sensitive fields leak to permitted readers | Field-level projection |
| Ownership checked on read only | Writes go unchecked | Check on every mutation |
| Bulk endpoints checking one id | The rest are unauthorized | Check every element |
| Nested resource not verified | Item from another parent is returned | Verify the whole path |
| Jobs running unrestricted | Bypass every check | Carry the user's scope |
| Only happy-path tests | Missing checks are invisible | Assert denials |
| No route-coverage test | New endpoints ship unprotected | Fail-closed allowlist test |
| Denials not logged | Attacks and regressions unnoticed | Log actor, action, resource |

---

# Checklist

- [ ] Every data access is scoped to the caller inside the query
- [ ] Tenant scope comes from the session and never from client input
- [ ] Repository or row-level security makes an unscoped query impossible
- [ ] Hidden resources return `404`, not `403`
- [ ] One central policy function owns every decision
- [ ] Default is deny; new roles start with no permissions
- [ ] Permissions are evaluated per request, not cached in a token
- [ ] Field-level authorization protects sensitive properties
- [ ] Mutations check authorization, not only reads
- [ ] Bulk operations check every element
- [ ] Nested resource paths are verified end to end
- [ ] Background jobs run with an explicit scope
- [ ] Exports and reports are tenant-scoped
- [ ] Admin tooling is authenticated and network-restricted
- [ ] Denial tests exist for every protected resource type
- [ ] A fail-closed test asserts new routes are protected by default
- [ ] Every denial is logged with actor, action, resource and source
