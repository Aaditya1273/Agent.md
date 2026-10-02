# Review checklist

Use only the sections whose packages are installed (`npx activate-agentmd list
--installed`). Each line names the package that defines the rule; open it for
the exact wording before flagging.

## Security

- Input validated at every trust boundary; no string-built SQL/shell/paths — `owasp`, `sql-injection`, `command-injection`, `path-traversal`
- Auth: password hashing with a slow KDF, no plaintext, sessions/JWTs expire and rotate — `authentication`, `passwords`, `jwt`, `oauth`
- Authorization checked server-side on every resource, not just routes — `authorization`
- CSRF tokens or SameSite on state-changing requests; CORS is an allow-list, never `*` with credentials — `csrf`, `cors`
- Security headers set (CSP, HSTS, X-Content-Type-Options, frame options) — `headers`, `https`
- Secrets from env/secret manager, never committed, never logged — `secret-management`, `audit-log`
- Encryption at rest and in transit for sensitive data — `encryption`
- Rate limits on auth and public endpoints — `rate-limiting`
- XSS: output encoded, no `innerHTML` with user data — `xss`

## Database

- Schema normalised to the point the package specifies; naming consistent — `schema-design`
- Every migration reversible, no destructive change without a backfill plan — `migration`
- Indexes on foreign keys and query predicates; no unbounded scans — `indexes`, `query-optimization`
- Multi-step writes in a transaction with a defined isolation level — `transactions`
- ORM used without N+1; raw queries parameterised — `orm`, `prisma`
- Backups scheduled and restore tested — `backup`, `replication`
- Engine-specific rules applied — `postgres`, `mysql`, `mongodb`, `redis`

## API

- Resource naming, verbs and status codes per the contract — `rest`, `graphql`, `rpc`
- Errors have a stable shape and a machine-readable code — `rest`
- List endpoints paginate (cursor or offset as the package says), filter and sort with allow-listed fields — `pagination`, `filtering`, `sorting`
- Breaking changes versioned; deprecations announced — `versioning`
- OpenAPI/schema kept in sync with implementation — `open-api`, `sdk`
- Webhooks signed, retried with backoff, idempotent — `webhooks`
- Auth and rate limiting on every route — `api-security`, `rate-limiting`

## Frontend

- Server vs client component split correct; no hydration mismatch — `server-components`, `client-components`, `hydration`
- Folder structure matches the package's layout — `folder-structure`
- Forms validated on both sides with accessible errors — `forms`
- State kept as local as possible; global state justified — `state-management`, `hooks`
- Routes and metadata per framework conventions — `routing`, `metadata`, `nextjs`, `react`
- Code-split at route boundaries; no oversized bundles — `code-splitting`, `performance`
- SEO basics: titles, descriptions, canonical, structured data — `seo`
- Type coverage: no `any` leaking through public interfaces — `typescript`
- Styling follows the utility conventions — `tailwind`

## Testing

- A strategy exists and the change fits its pyramid — `test-strategy`
- Units cover branches, not just happy paths; no snapshot-only tests — `unit`
- Integration tests hit real boundaries (DB, HTTP) with fixtures — `integration`
- Critical flows have e2e coverage — `e2e`
- Regressions get a test that fails before the fix — `regression`
- Accessibility assertions where UI changed — `accessibility`
- Load/stress/performance tests for hot paths — `load`, `stress`, `performance`
- Security tests for auth and input handling — `security`
- Visual diffs for UI changes where set up — `visual`

## Performance

- Caching layer and TTLs per the package; cache keys include every variant — `caching`
- Queries bounded, indexed, batched — `queries`, `database`
- Images sized, lazy, modern formats; fonts subset and preloaded — `images`, `fonts`, `lazy-loading`
- Bundle within budget; heavy deps justified — `bundle-size`
- No render thrash; expensive work off the critical path — `rendering`, `cpu`, `memory`
- Network: compression, prefetch only what's likely used — `network`, `prefetching`, `optimization`

## System Design

- Boundaries follow the chosen style (monolith / modular / microservices / hexagonal / clean / DDD) consistently — `architecture`, `monolith`, `microservices`, `hexagonal`, `clean-architecture`, `ddd`
- Async work goes through a broker with retries and dead-lettering — `message-brokers`, `event-driven`
- Cache and CDN placement match the read pattern — `caching`, `cdn`
- Scaling path stated: horizontal where stateless, vertical where not — `horizontal-scaling`, `vertical-scaling`, `load-balancing`
- Failure modes and HA targets documented; service discovery not hardcoded — `high-availability`, `distributed-systems`, `service-discovery`

## DevOps / Checklists

- Images minimal, non-root, pinned; compose/k8s manifests match the package — `docker`, `docker-compose`, `kubernetes`
- CI runs tests and lint; deploys are reproducible and reversible — `cicd`, `github-actions`, `deployment`, `rollback`
- Environments separated; config via env — `environments`
- Logs structured, monitoring and alerts wired — `logging`, `monitoring`
- Backups and DR plan present — `backups`, `disaster-recovery`
- Relevant checklist walked before release — `production-checklist`, `security-checklist`, `deployment-checklist`, `release-checklist`

## Backend

- Errors handled at boundaries, mapped to responses, never swallowed — `error-handling`
- Validation on every input; middleware order correct — `validation`, `middlewares`
- Background jobs idempotent and retried — `background-jobs`, `queues`
- Logging structured with correlation ids; monitoring hooks present — `logging`, `monitoring`
- Email/notifications templated, rate-limited, unsubscribable — `email`, `notifications`

## AI

- Prompts versioned and structured; tools have tight schemas — `prompt-engineering`, `tool-use`
- Outputs verified, hallucination checks on facts — `verification`, `hallucination`, `self-review`
- Context and memory bounded; planning explicit for multi-step work — `context`, `memory`, `planning`, `multi-agent`
