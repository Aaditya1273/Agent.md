# Playbook: keep standards current

Goal: pull upstream changes without losing deliberate local edits.

## 1. Check

```bash
npx activate-agentmd outdated
```

Three states per package:

- `↑ update available` — upstream changed, local untouched
- `✎ edited locally` — checksum differs from install time; `update` will skip it
- current

## 2. Preview

```bash
npx activate-agentmd update --dry
```

## 3. Update

```bash
npx activate-agentmd update
```

Locally edited packages are reported and skipped. To discard the local edit
and take upstream:

```bash
npx activate-agentmd update --force
```

Only do that after the user has seen the diff. `--force` is global — it
overwrites every edited package, not one.

## 4. Verify integrity

```bash
npx activate-agentmd validate
```

Checks the registry index and `.agentmd/manifest.json` agree with what is on
disk. Run it after a merge that touched `.agentmd/`.

## 5. Relink

Package lists don't change on `update`, but relink anyway if the config
block looks stale or a teammate added packages:

```bash
npx activate-agentmd link
```

## Environment knobs

- `AGENTMD_REGISTRY_BASE` — mirror or test registry
- `AGENTMD_TIMEOUT_MS` — per-request timeout (default 30000)
- `AGENTMD_DEBUG=1` — stack traces on error
