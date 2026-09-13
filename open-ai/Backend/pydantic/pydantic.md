---
targetModels:
  - "GPT-6 Astra"
  - "GPT-5.6"
  - "GPT-5.5"
  - "GPT-5 Family"
  - "Future GPT Models"
name: pydantic
category: Backend
description: Pydantic v2 in practice — model design at the boundary, validators that belong in the model versus the service, settings from the environment, serialization control, strict versus lax mode, and the performance traps of validating too often.
license: MIT
author: Agent.md maintainers
last-verified: 2026-09-13
reviewed-by: unreviewed
---
<!-- Generated from models/_canonical by scripts/build-model-variants.js.
     Edit the canonical source, not this file. Structure adapted for ChatGPT per deep-research.md. -->


# Purpose

Rules for using Pydantic v2 (2.x) as the boundary layer of a Python service:
parse untrusted input once, hand typed objects inward, serialize deliberately on
the way out.

v1 APIs (`@validator`, `.dict()`, `class Config`) still import with deprecation
warnings. Do not write new code against them.

---

# Model design

```python
class OrderIn(BaseModel):
    model_config = ConfigDict(extra="forbid", str_strip_whitespace=True, frozen=True)

    customer_id: PositiveInt
    items: list[LineItem] = Field(min_length=1, max_length=200)
    note: str | None = Field(default=None, max_length=500)
```

- `extra="forbid"` on every input model. The default `ignore` turns a client typo
  into silently dropped data.
- Constrained types (`PositiveInt`, `Field(max_length=...)`, `Annotated[str,
  StringConstraints(...)]`) over hand-written checks — they document themselves
  in the schema.
- `frozen=True` for value objects; a hashable, immutable model cannot be mutated
  halfway through a service call.
- Separate input, output and internal models. One `Order` model that is
  simultaneously the request body, the response, and the ORM mirror will leak a
  field in one direction or the other.

---

# Validators — where rules live

```python
class DateRange(BaseModel):
    start: date
    end: date

    @field_validator("end")
    @classmethod
    def end_after_start(cls, v: date, info: ValidationInfo) -> date:
        if "start" in info.data and v < info.data["start"]:
            raise ValueError("end must be on or after start")
        return v

    @model_validator(mode="after")
    def max_span(self) -> "DateRange":
        if (self.end - self.start).days > 366:
            raise ValueError("range exceeds one year")
        return self
```

- `field_validator` for one field; `model_validator(mode="after")` for
  cross-field rules. In an `after` validator `self` is the built instance.
- Validators raise `ValueError` (or `AssertionError`); Pydantic wraps it into a
  `ValidationError` with the field path. Raising `HTTPException` here couples the
  model to a framework.
- Rules that need I/O — "customer exists", "SKU is in stock" — do **not** belong
  in a validator. They belong in the service, where a database session is
  available and the failure is a domain error, not a `422`.
- `mode="before"` validators receive raw input; use them to coerce legacy shapes
  (`"1,2,3"` → `[1, 2, 3]`), nothing else.

---

# Settings

```python
class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_prefix="APP_", env_file=".env", extra="ignore")

    database_url: PostgresDsn
    redis_url: RedisDsn | None = None
    log_level: Literal["DEBUG", "INFO", "WARNING"] = "INFO"
```

`pydantic-settings` is a separate package. Instantiate once at startup and inject;
a `Settings()` per request re-reads `.env` every time. Invalid or missing values
fail at boot with a field-level message — that is the point.

---

# Serialization

```python
order.model_dump()                          # dict, Python types
order.model_dump(mode="json")               # dict, JSON-safe (datetime → str)
order.model_dump_json(exclude_none=True)    # str
order.model_dump(include={"id", "status"})  # projection

class OrderOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)   # build from ORM objects
    id: int
    created_at: datetime = Field(serialization_alias="createdAt")
```

- `mode="json"` when the dict will be JSON-encoded by something else; plain
  `model_dump()` keeps `datetime` and `Decimal` as objects and `json.dumps` will
  fail on them.
- `serialization_alias`/`alias_generator=to_camel` for wire-format naming; keep
  Python attributes snake_case.
- `exclude`/`include` at dump time for projections, `Field(exclude=True)` for
  fields that must never serialize (`password_hash`).
- `from_attributes=True` is how you build an output model from an ORM instance
  without a hand-written mapping.

---

# Strict versus lax

```python
Model(age="3")                              # lax: "3" → 3
Model.model_validate({"age": "3"}, strict=True)   # ValidationError
class Model(BaseModel):
    model_config = ConfigDict(strict=True)   # whole model
    age: Annotated[int, Strict()]            # one field
```

Lax mode coerces `"3"` to `3`, `1` to `True`, `"2024-01-01"` to `date`. That is
right for form data and query strings, and wrong for JSON from your own clients,
where `"3"` where `3` was expected is a bug worth surfacing. Use strict for
internal and typed JSON contracts; lax at the edges that genuinely receive strings.

---

# Performance

- Validation runs in Rust and is fast; **constructing models in a hot loop is
  not free.** Validate at the boundary once; pass the instance around, do not
  re-validate the same data three layers deep.
- `TypeAdapter(list[Item])` for validating collections without a wrapper model;
  build it once at module level, not per call.
- `model_construct()` skips validation — only for data you already validated
  (e.g. rows from your own database), never for input.
- `defer_build=True` on models with huge unions if import time matters; measure
  before using it.
- Discriminated unions (`Field(discriminator="type")`) validate in one pass
  instead of trying each member; always tag polymorphic payloads.

---

# Testing

```python
def test_rejects_unknown_field():
    with pytest.raises(ValidationError) as e:
        OrderIn(customer_id=1, items=[item], bogus=1)
    assert e.value.errors()[0]["type"] == "extra_forbidden"

def test_schema_is_stable(snapshot):
    assert OrderIn.model_json_schema() == snapshot
```

Assert on `errors()[...]["type"]` and `["loc"]`, not on the message string, which
changes between minor versions. Snapshot `model_json_schema()` for models that
form a public contract. → `Testing/pytest`

---

# Anti-patterns

| Anti-pattern | Why it fails | Fix |
| --- | --- | --- |
| Default `extra="ignore"` on input | Typos silently dropped | `extra="forbid"` |
| One model for input, output and ORM | Leaks in some direction | Separate models |
| Database lookup inside a validator | I/O in validation, wrong error class | Service layer |
| `HTTPException` raised in a validator | Model coupled to a framework | `ValueError` |
| `@validator` / `.dict()` / `class Config` | v1 API, deprecated | `field_validator`, `model_dump`, `model_config` |
| `Settings()` per request | Re-reads env and `.env` | Instantiate once |
| `json.dumps(model.model_dump())` | Fails on `datetime`/`Decimal` | `mode="json"` or `model_dump_json()` |
| Re-validating the same data per layer | Wasted CPU | Validate once at the edge |
| `TypeAdapter` built per call | Schema rebuilt every time | Module-level |
| `model_construct()` on input | Skips validation | Only for trusted data |
| Untagged unions | Tries every member | `discriminator` |
| Asserting on error message text | Breaks on minor upgrades | Assert `type` and `loc` |

---

# Checklist

- [ ] Every input model sets `extra="forbid"`
- [ ] Constraints expressed with `Field`/constrained types, not manual checks
- [ ] Input, output and internal models are distinct
- [ ] Cross-field rules in `model_validator(mode="after")`
- [ ] No I/O and no framework exceptions inside validators
- [ ] Settings built once from `BaseSettings` and injected
- [ ] JSON output uses `model_dump(mode="json")` or `model_dump_json()`
- [ ] Wire naming handled by aliases; attributes stay snake_case
- [ ] Sensitive fields marked `exclude=True`
- [ ] Strict mode on internal/typed contracts; lax only at string edges
- [ ] Validation happens once at the boundary
- [ ] `TypeAdapter`s are module-level
- [ ] Polymorphic payloads use a discriminator
- [ ] Tests assert error `type`/`loc`; public schemas are snapshotted
