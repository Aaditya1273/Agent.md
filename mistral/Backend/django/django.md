---
targetModels:
  - "Mistral Medium 3.5"
  - "Mistral Large 3"
  - "Mistral Small 4"
  - "Mistral Family"
  - "Future Mistral Models"
name: django
category: Backend
description: Django project structure — app boundaries, models and migration discipline, queryset hygiene that avoids N+1, forms and serializers, split settings, the security middleware that must stay on, and an admin that stays fast.
license: MIT
author: Agent.md maintainers
last-verified: 2026-09-13
reviewed-by: unreviewed
---
<!-- Generated from models/_canonical by scripts/build-model-variants.js.
     Edit the canonical source, not this file. Behavioural profile for Mistral: scripts/model-profiles.json -->

## How to apply this file
Each section opens with one imperative line; apply every rule in the section it introduces. Do not summarise or skip a section.

---

# Purpose

Rules for a Django codebase that stays coherent past the third app. Django's
batteries are good; the failure mode is fighting them — hand-rolled auth, raw
SQL where the ORM would do, business logic in views.

Python-level conventions are `Backend/python-conventions`; REST specifics are
`API/rest`.

---

# Layout

[INST] Apply every rule in this section: Layout. [/INST]

```
config/
  settings/base.py  dev.py  prod.py     # split, not one file with `if DEBUG`
  urls.py  asgi.py  wsgi.py
apps/
  orders/
    models.py  services.py  selectors.py  admin.py  urls.py  views.py
    migrations/  tests/
```

- Each app owns one bounded concept. If `orders/models.py` imports from
  `billing/models.py` and vice versa, you have one app pretending to be two.
- `services.py` holds writes (create/update with rules), `selectors.py` holds
  reads. Views parse, call, format — nothing else.
- `DJANGO_SETTINGS_MODULE=config.settings.prod` in production; `dev.py` imports
  `*` from `base.py` and overrides.

---

# Models and migrations

[INST] Apply every rule in this section: Models and migrations. [/INST]

```python
class Order(models.Model):
    tenant = models.ForeignKey("tenants.Tenant", on_delete=models.PROTECT)
    status = models.CharField(max_length=16, choices=Status.choices, db_index=True)
    total_cents = models.PositiveIntegerField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [
            models.CheckConstraint(check=Q(total_cents__gte=0), name="order_total_nonneg"),
            models.UniqueConstraint(fields=["tenant", "external_id"], name="order_ext_id_uniq"),
        ]
```

- Every `ForeignKey` names its `on_delete` deliberately. `CASCADE` on a tenant or
  user deletes history; `PROTECT` makes the deletion a decision.
- Invariants go in `Meta.constraints`, enforced by the database, not only in
  `clean()`. → `Database/schema-design`
- Money is integer cents, never `FloatField`.
- `makemigrations` output is reviewed like code: rename operations, data
  migrations, and index additions on large tables (`AddIndexConcurrently` on
  Postgres) are where deploys go wrong. Never edit an applied migration.
- Data migrations use `apps.get_model()`, not the live model import — the live
  model may have fields the migration's schema does not.

---

# Querysets — the N+1 rule

[INST] Apply every rule in this section: Querysets — the N+1 rule. [/INST]

```python
# N+1: one query for orders, one per order for its customer
for order in Order.objects.filter(tenant=t):
    print(order.customer.email)

# Fixed
orders = (Order.objects.filter(tenant=t)
          .select_related("customer")                 # FK / one-to-one → JOIN
          .prefetch_related("items__product")         # reverse / many → 2nd query
          .only("id", "status", "customer__email"))
```

- `select_related` for forward foreign keys; `prefetch_related` for reverse
  relations and many-to-many. Using the wrong one either explodes the row count
  or issues N queries.
- Assert query counts in tests: `with self.assertNumQueries(2):`. A view that
  passes at 3 queries and fails at 300 in production is an N+1 you did not test.
- `.exists()` not `len(qs)`; `.count()` not `len(list(qs))`; `.update()` for bulk
  writes instead of a loop of `.save()`.
- `.iterator(chunk_size=2000)` for exports; a plain loop over a million rows
  caches every instance in memory.
- Never call the ORM in a template tag or a model `__str__` that the admin lists —
  that is a hidden N+1.

---

# Views, forms, serializers

[INST] Apply every rule in this section: Views, forms, serializers. [/INST]

```python
@require_POST
@login_required
def create_order(request: HttpRequest) -> HttpResponse:
    form = OrderForm(request.POST)
    if not form.is_valid():
        return render(request, "orders/new.html", {"form": form}, status=400)
    order = orders.services.create_order(actor=request.user, **form.cleaned_data)
    return redirect(order)
```

- Validation lives in a `Form`/`ModelForm` (HTML) or a DRF `Serializer` (JSON).
  Reading `request.POST["x"]` directly skips validation and type coercion.
- Views never contain business rules. A rule in a view is unavailable to the
  management command, the Celery task, and the test that needs it.
- Class-based views for CRUD that fits the generic ones; function views for
  anything with branching. Do not subclass `View` five levels deep.
- `get_object_or_404` with the tenant filter applied — a lookup by `pk` alone is
  an IDOR. → `Security/authorization`

---

# Security middleware and settings

[INST] Apply every rule in this section: Security middleware and settings. [/INST]

Django ships these on. Keep them on, and set the ones that are off:

| Setting | Production value |
| --- | --- |
| `DEBUG` | `False` — a `True` leaks settings and source on every 500 |
| `ALLOWED_HOSTS` | Explicit list, never `["*"]` |
| `SECRET_KEY` | From the environment; rotated if ever committed |
| `SECURE_SSL_REDIRECT`, `SECURE_HSTS_SECONDS` | `True`, `31536000` |
| `SESSION_COOKIE_SECURE`, `CSRF_COOKIE_SECURE` | `True` |
| `SECURE_PROXY_SSL_HEADER` | `("HTTP_X_FORWARDED_PROTO", "https")` behind a proxy |
| `CsrfViewMiddleware` | Present — `@csrf_exempt` is a code review item |

Run `python manage.py check --deploy` in CI; it fails on most of the above.
→ `Security/headers`

---

# Admin

[INST] Apply every rule in this section: Admin. [/INST]

```python
@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ("id", "status", "customer_email", "created_at")
    list_select_related = ("customer",)
    list_filter = ("status",)
    search_fields = ("id", "customer__email")
    raw_id_fields = ("customer",)
    readonly_fields = ("created_at",)
```

- `list_select_related` for every FK shown in `list_display`, or the changelist
  is one query per row.
- `raw_id_fields`/`autocomplete_fields` for any FK with more than a few hundred
  rows; the default `<select>` renders every one.
- The admin is a staff tool, not a public API. Put it on a non-default path and
  behind SSO or an allowlist in production.

---

# Testing

[INST] Apply every rule in this section: Testing. [/INST]

```python
class CreateOrderTests(TestCase):
    def test_rejects_other_tenants_customer(self):
        other = CustomerFactory(tenant=TenantFactory())
        with self.assertNumQueries(1):
            with self.assertRaises(PermissionDenied):
                create_order(actor=self.user, customer_id=other.id, items=[...])
```

`TestCase` wraps each test in a transaction and rolls back — fast and isolated.
Use `TransactionTestCase` only when testing transaction behaviour itself. Build
data with factories, not fixtures files. → `Testing/pytest`

---

# Anti-patterns

[INST] Apply every rule in this section: Anti-patterns. [/INST]

| Anti-pattern | Why it fails | Fix |
| --- | --- | --- |
| One `settings.py` with `if DEBUG:` | Prod and dev drift silently | Split settings modules |
| Business rules in views | Unreachable from tasks and tests | `services.py` |
| `on_delete=CASCADE` on tenant/user | Deletes history | `PROTECT` |
| Invariants only in `clean()` | Bypassed by `.update()` and shell | `Meta.constraints` |
| Loop over queryset touching FKs | N+1 | `select_related`/`prefetch_related` |
| `len(qs)` for a count | Loads every row | `.count()` / `.exists()` |
| Editing an applied migration | Other environments diverge | New migration |
| Live model import in data migration | Schema mismatch | `apps.get_model()` |
| `FloatField` for money | Rounding errors | Integer cents |
| `request.POST["x"]` in a view | No validation or coercion | Form / serializer |
| `get_object_or_404(Order, pk=pk)` | IDOR across tenants | Filter by tenant |
| `ALLOWED_HOSTS = ["*"]` | Host header attacks | Explicit list |
| `@csrf_exempt` on a session-auth view | CSRF | Keep the middleware |
| Admin FK without `raw_id_fields` | Renders every row in a select | `autocomplete_fields` |
| `TransactionTestCase` everywhere | 10× slower suite | `TestCase` |

---

# Checklist

- [ ] Verify: Settings split into `base`/`dev`/`prod` modules
- [ ] Verify: Each app owns one concept; no circular model imports
- [ ] Verify: Writes go through `services.py`; views hold no business rules
- [ ] Verify: Every `ForeignKey` sets `on_delete` deliberately
- [ ] Verify: Invariants enforced with `Meta.constraints`
- [ ] Verify: Money stored as integer cents
- [ ] Verify: Migrations reviewed; applied migrations never edited
- [ ] Verify: Data migrations use `apps.get_model()`
- [ ] Verify: List views use `select_related`/`prefetch_related`; query counts asserted
- [ ] Verify: Bulk operations use `.update()`, `.bulk_create()`, `.iterator()`
- [ ] Verify: All input passes through a `Form` or `Serializer`
- [ ] Verify: Object lookups are scoped to the tenant
- [ ] Verify: `manage.py check --deploy` passes in CI
- [ ] Verify: Admin changelists set `list_select_related` and `raw_id_fields`
- [ ] Verify: Tests use `TestCase` and factories
