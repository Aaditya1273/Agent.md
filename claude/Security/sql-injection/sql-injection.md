---
targetModels:
  - "Claude Fable 5"
  - "Claude Opus 5"
  - "Claude Sonnet 5"
  - "Claude 5 Family"
  - "Future Claude Models"
name: sql-injection
category: Security
description: Preventing SQL injection with parameterised queries, safe dynamic SQL, and the escaping rules that do not work.
license: MIT
author: Agent.md maintainers
last-verified: 2026-08-23
reviewed-by: unreviewed
---
<!-- Generated from models/_canonical by scripts/build-model-variants.js.
     Edit the canonical source, not this file. Structure adapted for Claude per deep-research.md. -->
# Purpose

<purpose>
Rules for building SQL that cannot be subverted by input. Scope is injection into
SQL specifically. Command injection is `Security/command-injection`; template and
NoSQL injection are noted here only where the reasoning differs.

The single rule underneath everything: **data must never be parsed as code.**
Every technique below is a way of keeping that boundary intact.

---
</purpose>

# Parameterised queries

## Bind values. Never concatenate them.

<rules>
```js
// WRONG — the query text changes shape with the input
db.query(`SELECT * FROM users WHERE email = '${email}'`);

// RIGHT — one fixed query, values sent separately
db.query("SELECT * FROM users WHERE email = $1", [email]);
```

The parameterised form is not "escaping done for you". The driver sends the
statement and the values over separate protocol fields, so the database plans the
query before it ever sees the data. Input cannot alter the parse tree because
parsing already happened.

Placeholder syntax by dialect:

| Database | Placeholder | Library example |
| --- | --- | --- |
| PostgreSQL | `$1`, `$2` | `pg`, `postgres.js` |
| MySQL / MariaDB | `?` | `mysql2` |
| SQLite | `?` or `:name` | `better-sqlite3` |
| SQL Server | `@name` | `mssql` |
| Oracle | `:name` | `oracledb` |

**Never** build SQL with string concatenation, template literals, `+`, `format()`,
`sprintf`, or f-strings — in any language. If the query text varies with user
input, the boundary is already broken.

**Never** rely on escaping functions like `mysql_real_escape_string` as your
primary defence. They are dialect-specific, charset-sensitive, and historically
bypassable — `GBK` multibyte sequences defeated exactly this pattern.
</rules>

## Parameters bind values, not identifiers

<rules>
A placeholder cannot stand in for a table name, a column name, `ASC`/`DESC`, or
`LIMIT` in most drivers:

```js
// This does NOT work — and the failure pushes people back to concatenation
db.query("SELECT * FROM $1", [table]);
```

When structure must be dynamic, **allow-list it**:

```js
const SORTABLE = { created: "created_at", name: "display_name" };
const DIRECTION = { asc: "ASC", desc: "DESC" };

const column = SORTABLE[req.query.sort] ?? "created_at";
const order  = DIRECTION[req.query.dir]  ?? "ASC";

db.query(`SELECT * FROM users ORDER BY ${column} ${order} LIMIT $1`, [limit]);
```

The interpolated values came from a map the server controls, never from the
request. An unknown key falls back to a default rather than passing through.

**Never** allow-list by regex (`/^[a-z_]+$/`) instead of an explicit map. A
permissive pattern still admits valid identifiers you did not intend to expose,
including columns holding password hashes.

---
</rules>

# ORMs and query builders

<rules>
An ORM is not automatic protection. Every major ORM has a raw-SQL escape hatch,
and that hatch is where injection lives.

```js
// Prisma — parameterised
await prisma.$queryRaw`SELECT * FROM users WHERE email = ${email}`;

// Prisma — NOT parameterised, string is built before the driver sees it
await prisma.$queryRawUnsafe(`SELECT * FROM users WHERE email = '${email}'`);
```

The tagged-template form (`$queryRaw`) parameterises. The `Unsafe` variants do
not — the name is the warning.

Equivalents to audit in review:

| ORM | Safe | Dangerous |
| --- | --- | --- |
| Prisma | `$queryRaw` (tagged) | `$queryRawUnsafe`, `$executeRawUnsafe` |
| Sequelize | `replacements`, `bind` | `sequelize.query` with interpolation |
| TypeORM | `.where("x = :v", { v })` | `.where(\`x = '${v}'\`)` |
| Knex | `.where({ x })`, `knex.raw("?", [v])` | `knex.raw(\`... ${v}\`)` |
| Django | `.filter()`, `params=` | `.extra()`, `RawSQL` with f-strings |
| ActiveRecord | `where("x = ?", v)` | `where("x = #{v}")` |

**Never** pass user input into `LIKE` without escaping the wildcards. `%` and `_`
are pattern metacharacters, and an unescaped `%` turns a lookup into a full scan —
a denial-of-service vector even when injection is prevented.

```js
const escaped = term.replace(/[\\%_]/g, (c) => "\\" + c);
db.query("SELECT * FROM docs WHERE title LIKE $1 ESCAPE '\\'", [`%${escaped}%`]);
```

---
</rules>

# Stored procedures and dynamic SQL

<rules>
A stored procedure is only safe if it does not itself build SQL from its
arguments.

```sql
-- Vulnerable despite being "a stored procedure"
CREATE PROCEDURE find_user(IN email VARCHAR(255))
BEGIN
  SET @q = CONCAT('SELECT * FROM users WHERE email = ''', email, '''');
  PREPARE stmt FROM @q; EXECUTE stmt;
END
```

Inside `EXECUTE`/`sp_executesql`/`EXECUTE IMMEDIATE`, bind parameters exactly as
you would in application code. In PostgreSQL, use `format()` with `%L` (literal)
or `%I` (identifier) — never `%s` — and prefer `USING` for values.

---
</rules>

# Defence in depth

<rules>
These do not replace parameterisation. They limit the damage when it fails.

- **Least privilege.** The application role should not hold `DROP`, `CREATE`, or
  `GRANT`. A read path should use a read-only role. Injection into a connection
  that cannot write is a disclosure bug, not a destruction bug.
- **Disable multi-statement execution** where the driver allows it. `mysql2`'s
  `multipleStatements` defaults to `false`; keep it there. It converts
  `'; DROP TABLE users; --` from catastrophic to a syntax error.
- **Validate shape, then bind.** Rejecting a non-numeric `id` early is good
  hygiene. It is not the control that stops injection — the bind is.
- **Never expose raw database errors.** `ERROR: column "x" does not exist` is a
  schema oracle. Log the detail server-side, return a generic message.
- **Set statement timeouts** so a pathological injected query cannot hold
  resources indefinitely.

---
</rules>

# Anti-patterns

<antipatterns>
| Anti-pattern | Why it fails | Fix |
| --- | --- | --- |
| `"... WHERE id = " + id` | Input becomes query structure | Bind with `$1` / `?` |
| Escaping with `replace("'", "''")` | Charset and context bypasses exist | Parameterise |
| Blocking the word `UNION` | Trivially bypassed by casing, comments, encoding | Parameterise |
| `$queryRawUnsafe` with a template literal | The unsafe variant does not bind | `$queryRaw` tagged template |
| Regex allow-list for column names | Admits columns you did not mean to expose | Explicit map |
| `LIKE '%' + term + '%'` | Unescaped `%` / `_`; scan-based DoS | Escape wildcards, use `ESCAPE` |
| App connects as DB owner | Injection escalates to `DROP` | Least-privilege role |
| Returning driver errors to the client | Leaks schema | Generic message, log server-side |

---
</antipatterns>

# Checklist

<checklist>
- [ ] Every query sends values as bound parameters, not concatenated text
- [ ] No template literal, `+`, `format()` or f-string builds SQL from input
- [ ] Dynamic identifiers and sort direction come from an explicit allow-list map
- [ ] No `Unsafe` ORM variant receives interpolated input
- [ ] `LIKE` patterns escape `%` and `_` and declare `ESCAPE`
- [ ] Stored procedures bind inside `EXECUTE`, never `CONCAT`
- [ ] Application database role lacks `DROP`, `CREATE` and `GRANT`
- [ ] Multi-statement execution is disabled in the driver
- [ ] Database errors are logged server-side and never returned to clients
- [ ] Statement timeouts are configured
</checklist>
