---
targetModels:
  - "Claude Fable 5"
  - "Claude Opus 5"
  - "Claude Sonnet 5"
  - "Claude 5 Family"
  - "Future Claude Models"
name: docker
category: DevOps
description: Container images that are small, reproducible and safe — multi-stage builds, layer caching, non-root users, signal handling, and what never goes in an image.
license: MIT
author: Agent.md maintainers
last-verified: 2026-08-23
reviewed-by: unreviewed
---
<!-- Generated from models/_canonical by scripts/build-model-variants.js.
     Edit the canonical source, not this file. Structure adapted for Claude per deep-research.md. -->
# Purpose

<purpose>
Rules for writing Dockerfiles and building images. Three goals, in order:

1. **Correct** — the image runs the same everywhere and handles signals properly.
2. **Safe** — minimal attack surface, no secrets, non-root.
3. **Fast** — cached layers, small final image.

Most Dockerfiles fail the first two while optimising the third.

---
</purpose>

# Multi-stage builds

<rules>
```dockerfile
</rules>

# syntax=docker/dockerfile:1

<rules>
FROM node:22-slim AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN --mount=type=cache,target=/root/.npm npm ci        # cached across builds

FROM node:22-slim AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build && npm prune --omit=dev

FROM node:22-slim AS runtime
ENV NODE_ENV=production
WORKDIR /app
RUN useradd --system --uid 10001 app
COPY --from=build --chown=app:app /app/node_modules ./node_modules
COPY --from=build --chown=app:app /app/dist ./dist
USER 10001
EXPOSE 3000
CMD ["node", "dist/server.js"]
```

The build toolchain, source, test files and development dependencies stay in
earlier stages. Only the artefact is copied forward — a smaller image with a
smaller attack surface.

**Order layers by change frequency**: dependency manifests before source. Copying
the whole context first means every source edit invalidates the dependency
install, and the build never uses its cache.

---
</rules>

# Never put secrets in an image

<rules>
```dockerfile
</rules>

# Every one of these persists in the image history, retrievable with `docker history`

<rules>
ARG NPM_TOKEN                       # ❌
ENV API_KEY=sk-live-…               # ❌
COPY .env .                         # ❌
RUN echo "$TOKEN" > ~/.npmrc        # ❌ — deleting it later does not remove the layer
```

Deleting a file in a later layer does **not** remove it; the earlier layer still
contains it. Use build secrets, which are mounted and never written to a layer:

```dockerfile
RUN --mount=type=secret,id=npmtoken \
    NPM_TOKEN=$(cat /run/secrets/npmtoken) npm ci
```

Runtime secrets are injected by the orchestrator at start, never baked in.
→ `Security/secret-management`

A `.dockerignore` is mandatory — without it, `.git`, `.env`, `node_modules` and
local credentials are sent to the daemon and frequently end up in the image:

```
.git
.env*
node_modules
**/*.test.*
Dockerfile*
```

---
</rules>

# Run as a non-root user

<rules>
The default is root. A container escape or a compromised process then has root on
the host namespace.

```dockerfile
RUN useradd --system --uid 10001 app
USER 10001                       # numeric UID, so Kubernetes runAsNonRoot can verify it
```

Additional hardening at runtime:

| Setting | Effect |
| --- | --- |
| `readOnlyRootFilesystem: true` | Writes only to declared volumes |
| `allowPrivilegeEscalation: false` | `setuid` binaries cannot escalate |
| `capabilities: { drop: ["ALL"] }` | Removes every Linux capability |
| `--security-opt no-new-privileges` | The Docker-run equivalent |

Use a specific base tag (`node:22.4.1-slim`) or a digest, never `latest`.
`latest` makes builds irreproducible — the image that passed CI is not the image
that deployed.

Prefer `-slim` or distroless bases. Fewer packages means fewer CVEs and less to
patch; a distroless image has no shell, which also removes the most common
post-exploitation foothold.

---
</rules>

# Signals and process model

<rules>
```dockerfile
CMD ["node", "dist/server.js"]        # exec form: node is PID 1 and receives SIGTERM
</rules>

# CMD npm start                       # shell form: sh is PID 1, npm swallows the signal

<rules>
```

The shell form wraps the command in `/bin/sh -c`, so your process is not PID 1 and
often never receives `SIGTERM`. The orchestrator then waits the full grace period
and `SIGKILL`s — every deploy severs in-flight requests.

- Use the **exec form** (JSON array) for `CMD` and `ENTRYPOINT`.
- Do not start the process through `npm`, `yarn` or a shell wrapper.
- If your process spawns children, add `--init` (or `tini`) so zombies are reaped.
- Handle `SIGTERM` in the application: stop accepting connections, drain, exit.
  → `Backend/node`

One process per container. Supervisors running several services in one container
defeat orchestration, scaling and health checking.

---
</rules>

# Build, scan and ship

<rules>
- Build once, promote the **same digest** through environments. Rebuilding per
  environment means staging and production are different images.
- Tag with the commit SHA, not only `latest`, so a deployed image is traceable.
- Scan in CI (`trivy image`, `grype`) and fail on high or critical findings; rebuild
  regularly to pick up base-image patches.
- Generate an SBOM and sign the image (`cosign`) where supply-chain provenance
  matters. → `DevOps/cicd`
- Add a `HEALTHCHECK`, or configure probes in the orchestrator.
- Set memory limits and configure the runtime to respect them — a JVM or Node
  heap sized from host memory will be OOM-killed in a limited container.

---
</rules>

# Anti-patterns

<antipatterns>
| Anti-pattern | Why it fails | Fix |
| --- | --- | --- |
| `FROM node:latest` | Irreproducible; changes under you | Pin a version or digest |
| `COPY . .` before installing dependencies | Cache invalidated by every source edit | Manifests first |
| No `.dockerignore` | `.git`, `.env`, credentials in the image | Add one |
| Secrets in `ARG`/`ENV`/`COPY` | Persist in image history | Build secrets; runtime injection |
| Deleting a secret in a later layer | The earlier layer still has it | Never write it |
| Running as root | Escape gains host root | `USER` with a numeric UID |
| Full OS base image | Large surface, many CVEs | Slim or distroless |
| Shell-form `CMD` | Signals never reach the process | Exec form |
| Starting via `npm start` | npm swallows `SIGTERM` | Invoke the binary directly |
| Multiple processes per container | Breaks scaling and health checks | One process |
| Build tools in the final image | Attack surface and size | Multi-stage |
| Rebuilding per environment | Staging and production differ | Promote one digest |
| No image scanning | Known CVEs ship | Scan and gate in CI |
| Only `latest` tags | Cannot trace what is running | Tag with the commit SHA |
| Runtime heap sized from host memory | OOM-killed under limits | Configure against the limit |

---
</antipatterns>

# Checklist

<checklist>
- [ ] Base images are pinned to a version or digest, never `latest`
- [ ] Multi-stage builds keep toolchains and dev dependencies out of the runtime
- [ ] Layers are ordered so dependency installs stay cached
- [ ] A `.dockerignore` excludes VCS metadata, environment files and local artefacts
- [ ] No secret appears in `ARG`, `ENV`, `COPY` or any layer
- [ ] Build-time secrets use mounted secrets
- [ ] The container runs as a non-root numeric UID
- [ ] Root filesystem is read-only and capabilities are dropped where possible
- [ ] `CMD`/`ENTRYPOINT` use the exec form
- [ ] The application receives and handles `SIGTERM`
- [ ] An init process reaps children where the process spawns them
- [ ] One process per container
- [ ] Images are built once and promoted by digest
- [ ] Images are tagged with the commit SHA
- [ ] CI scans images and fails on high-severity findings
- [ ] Health checks or probes are configured
- [ ] Runtime memory settings respect the container limit
</checklist>
