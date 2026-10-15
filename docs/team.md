# Agent.md Team

A named reviewer's approval of the files your coding agents read, checked in CI, with a signed record you can verify offline.

Agent.md Team is in design-partner preview: it works today, and we switch it on per organisation. Checkout is not open. To join, apply at [agentmd.pages.dev/pro](https://agentmd.pages.dev/pro).

## What it does

Your agents obey `CLAUDE.md`, `AGENTS.md`, rules, skills and presets. Anyone who can open a pull request can change them. Team makes that change need an approval from someone you name, and keeps proof of it.

- **On every pull request**, your CI computes a manifest of the agent context: the path and sha256 of each instruction file. Agent.md reads the pull request's reviews from GitHub and posts the check **Agent.md context approval**.
- **Green** means an eligible reviewer approved this exact agent context. **Red** says why: no approval yet, the context changed since approval (and which file), the review was dismissed, the branch was force-pushed after approval, or the reviewer is not in the policy.
- **Code-only changes** don't need a new approval. Reverting a context change restores the earlier approval, because the approval binds to the content the reviewer saw.
- **On merge**, the push to your default branch is checked again: a squash or rebase merge counts as approved only if its agent context equals the approved head's.
- **Every run issues a signed evidence record**: Ed25519 over RFC 8785 JSON, countersigned by an RFC 3161 timestamp from Sigstore's public timestamp authority. It names the commit, the manifest digest, the review, the pull request, the validated CI identity and the policy version.

## Set up

1. Install the GitHub App on the repositories you want covered: [github.com/apps/agent-md-team](https://github.com/apps/agent-md-team).
2. In the repository, write the policy and the workflow:

   ```sh
   npx activate-agentmd team policy init --reviewer <github-login>
   npx activate-agentmd team policy render
   ```

   This writes `.agentmd/policy.yml` (who may approve, and the instruction blocks every agent carries) and `.github/workflows/agentmd-team.yml`:

   ```yaml
   on: { pull_request: {}, pull_request_review: {}, push: { branches: [main] } }
   permissions: { id-token: write, contents: read }
   jobs:
     verify:
       uses: Aaditya1273/Agent.md/.github/workflows/verify.yml@team-v1
   ```

3. Commit and push to your default branch. The first run publishes the policy.
4. In branch protection, make **Agent.md context approval** a required status check. Without this, a red check is a warning, not a gate.

## What leaves your repository

Paths, sha256 hashes, commit SHAs and the CI job's OIDC token. **Never file contents.** Set `privacy.saltPaths: true` in the policy and an `AGENTMD_PATH_SALT` secret to upload keyed hashes of paths instead.

The GitHub App asks for `metadata: read`, `pull_requests: read` and `checks: write`. It never asks for `contents`: the manifest is computed in your CI, not by the App.

Verification data is deleted after 90 days.

## Why a pull request can't approve itself

- A pull request is always judged by the policy on your default branch, never by its own copy of `policy.yml`.
- The CI job proves its identity with a GitHub OIDC token. Agent.md accepts only the pinned workflow above (`job_workflow_ref` and `job_workflow_sha`), so a pull request that edits its own workflow file is rejected and no record is issued.
- The CLI version and every action in that workflow are pinned, and npm config from the pull request is ignored.

## Check a record yourself

An example from our own test run, readable in the browser: [a squash merge approved by a named reviewer](https://agentmd.pages.dev/evidence/c0a78f26-9bf3-4ac0-9e29-c7e1f7ab9e34). Every record has a page like it, at `agentmd.pages.dev/evidence/<id>`.

Each run uploads `agentmd-evidence.json` as a workflow artifact. Any record can also be fetched by ID, then checked with no network call:

```sh
npx activate-agentmd team evidence get <id> > record.json
npx activate-agentmd team evidence verify record.json
```

This checks the signature against Agent.md's published keyset ([/api/team/keys](https://agentmd.pages.dev/api/team/keys), also bundled with the CLI), the timestamp against Sigstore's timestamp root, and that the key was not revoked at the stamped time. It proves Agent.md asserted the result at that time. It cannot re-check GitHub's OIDC signature or re-read the review: for those two facts you rely on Agent.md's key.

## Private registry

From your default branch, the workflow can publish a folder of standards to your organisation's private registry (input `registry-path`). Versions are immutable. Reading runs in CI too, authenticated by the job's OIDC token, from any workflow run the policy allows:

```sh
npx activate-agentmd team registry list
npx activate-agentmd team registry pull <name>[@version]
```

## Limits

- Eligible reviewers are GitHub logins, not teams.
- Pull requests must use the reusable workflow above. A customer-owned workflow is accepted for pushes to the default branch only.
- Two policy adapters today: Claude Code (`CLAUDE.md`) and `AGENTS.md`.
- The manifest covers declared instruction files. It says nothing about prompts, tool output or files an agent loads at run time.
