---
targetModels:
  - "Gemini 3.6 Flash"
  - "Gemini 3.5 Flash"
  - "Gemini 3.1 Pro"
  - "Gemini 3 Family"
  - "Future Gemini Models"
name: docker-compose
category: DevOps
description: Compose for local development and small deployments — service dependencies and health, volumes, environment handling, and why it is not production orchestration.
license: MIT
author: Agent.md maintainers
last-verified: 2026-08-23
reviewed-by: unreviewed
---
<!-- Generated from models/_canonical by scripts/build-model-variants.js.
     Edit the canonical source, not this file. Structure adapted for Gemini per deep-research.md. -->


# Purpose

Rules for Docker Compose. Its real value is **local development parity**: one
command brings up the same database engine, cache and broker that production
runs, so nobody debugs a SQLite-versus-Postgres difference.

It is not a production orchestrator — no rolling updates, no self-healing across
hosts, no autoscaling. Use it for development, CI, and genuinely single-host
deployments. → `DevOps/kubernetes`

---

# `depends_on` alone does not wait

```yaml
services:
  api:
    build: .
    depends_on:
      db:    { condition: service_healthy }     # waits for the healthcheck
      redis: { condition: service_started }
    environment:
      DATABASE_URL: postgres://app:app@db:5432/app
    ports: ["3000:3000"]

  db:
    image: postgres:17.2-alpine
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U app -d app"]
      interval: 5s
      timeout: 3s
      retries: 10
      start_period: 30s
    volumes: ["pgdata:/var/lib/postgresql/data"]

volumes: { pgdata: }
```

Bare `depends_on` waits for the container to **start**, not for the service to be
usable. Postgres accepts connections seconds after the container starts, so the
application crashes on boot and the failure looks random.

`condition: service_healthy` plus a real healthcheck is the fix. `start_period`
matters: failures during it do not count toward `retries`, which is what allows a
slow-starting database without a long total timeout.

Even with this, the application should retry its initial connection — dependencies
restart, and Compose does not re-order anything when they do.

---

# Named volumes for state, bind mounts for source

| Mount | Use for | Note |
| --- | --- | --- |
| Named volume | Database data, uploads | Managed by Docker, survives `down` |
| Bind mount | Source code in development | Live reload; slow on macOS/Windows |
| Anonymous volume | Nothing | Accumulates untracked, unnamed data |

```yaml
volumes:
  - .:/app                    # source, live-reloaded
  - /app/node_modules         # keep the container's install, not the host's
```

The `node_modules` line is the one people miss: without it the host directory
shadows the container's, and native modules built for the host architecture fail
inside the container.

`docker compose down -v` **deletes named volumes**. That is the intended reset
command in development and a data-loss command anywhere else — never run it
against anything you care about.

---

# Configuration and secrets

```yaml
services:
  api:
    env_file: [.env]                       # local only, gitignored
    environment:
      DATABASE_URL: ${DATABASE_URL:?required}   # fail fast if unset
```

- Commit `.env.example` with every variable and a placeholder; never commit `.env`.
- `${VAR:?message}` fails immediately with a clear error rather than starting with
  an empty value.
- Compose files are frequently committed, so **no real secret belongs in one** —
  not in `environment`, not in a build `arg`. → `Security/secret-management`
- Pin image tags (`postgres:17.2-alpine`), never `latest`. A colleague pulling
  `latest` next week gets a different database version and a different bug.

Use `compose.override.yaml` for local-only changes; it is merged automatically and
can stay untracked, which keeps personal port choices out of the shared file.

---

# Ports, networks and isolation

- Publish only what you need on the host. `ports: ["5432:5432"]` exposes your
  development database on every interface — on a shared or public network that is
  an open database. Bind to loopback explicitly: `"127.0.0.1:5432:5432"`.
- Services reach each other by **service name** on the default network
  (`postgres://db:5432`), with no published port required.
- Split networks when isolation matters: a `backend` network the database joins
  and the reverse proxy does not.
- Give each project a distinct `name:` so two checkouts do not collide on
  container and volume names.

---

# CI and single-host deployment

For CI, Compose is a reasonable way to stand up real dependencies:

```bash
docker compose -f compose.yaml -f compose.ci.yaml up -d --wait
docker compose exec -T api npm test
docker compose down -v
```

`--wait` blocks until healthchecks pass, which removes the `sleep 30` that
otherwise appears in every pipeline. → `Testing/integration`

If you do deploy Compose to a single host, add what production needs:

- `restart: unless-stopped` on every service.
- Resource limits (`deploy.resources.limits`) so one container cannot take the host.
- Log rotation (`logging.options.max-size`), or the disk fills.
- A reverse proxy terminating TLS in front.
- Accept the constraint: `docker compose up -d` recreates containers, so there is
  a gap. There is no rolling update.

---

# Anti-patterns

| Anti-pattern | Why it fails | Fix |
| --- | --- | --- |
| `depends_on` without a condition | Waits for start, not readiness | `service_healthy` plus a healthcheck |
| No healthcheck | Nothing to wait on | Real readiness command |
| No `start_period` | Slow starters exhaust retries | Set it above cold-start time |
| No client-side connection retry | Dependency restarts break the app | Retry with backoff |
| `latest` image tags | Colleagues run different versions | Pin the tag |
| Host `node_modules` shadowing | Native modules fail in the container | Anonymous volume over the path |
| Anonymous volumes for state | Untracked data accumulates | Named volumes |
| `.env` committed | Secrets in version control | `.env.example` only |
| Real secrets in the Compose file | Committed and shared | Runtime injection |
| Unset variables silently empty | Confusing runtime failures | `${VAR:?}` |
| `ports` bound to all interfaces | Database exposed on the network | Bind to `127.0.0.1` |
| One flat network | No isolation between tiers | Separate networks |
| `down -v` outside development | Deletes all data | Never run it elsewhere |
| Compose as production orchestration | No rolling updates or self-healing | Use a real orchestrator |
| No log rotation on a host deployment | Disk fills; service dies | `max-size` and `max-file` |
| No resource limits | One container takes the host | `deploy.resources.limits` |

---

# Checklist

- [ ] Verify: Every dependency has a healthcheck with a realistic `start_period`
- [ ] Verify: `depends_on` uses `condition: service_healthy` where readiness matters
- [ ] Verify: The application retries its initial dependency connections
- [ ] Verify: All image tags are pinned to specific versions
- [ ] Verify: Stateful data uses named volumes; source uses bind mounts
- [ ] Verify: Container-installed dependencies are shielded from host bind mounts
- [ ] Verify: `.env` is gitignored and `.env.example` documents every variable
- [ ] Verify: Required variables fail fast with `${VAR:?}`
- [ ] Verify: No real secret appears in any committed Compose file
- [ ] Verify: Published ports are bound to loopback in development
- [ ] Verify: Services communicate by service name over an internal network
- [ ] Verify: Networks are split where tier isolation matters
- [ ] Verify: The project declares a distinct `name`
- [ ] Verify: CI uses `--wait` rather than sleeping
- [ ] Verify: Host deployments set restart policies, resource limits and log rotation
- [ ] Verify: The absence of rolling updates is understood and accepted, or Compose is not used
