# Agent.md receipts

Everything Agent.md signs uses one format: a runtime guard decision, a context
bundle (`.agentmd/bundle.sig`) and an Agent.md Team evidence record.

## The format

A receipt is a JSON object.

| Field | |
|---|---|
| `type` | `agentmd-receipt` (`agentmd-evidence` for Team records, the same rules) |
| `v` | `2` |
| `kind` | `decision`, `bundle`, … |
| `kid` | the signing key's id. For local keys, its OpenSSH SHA-256 fingerprint (`SHA256:…`), the string `ssh-keygen -lf` prints and GitHub shows beside a key |
| `signer` | optional: who the key's owner says signs with it, `github:<login>` or a short name. A claim, checked against where the key is found |
| `id` | optional: the first 32 hex characters of SHA-256 of the signed bytes |
| `sig` | Ed25519 signature, base64url without padding |
| `tsr` | optional: an RFC 3161 timestamp over SHA-256 of the signature |
| … | the kind's own fields |

The signature covers the RFC 8785 (JCS) bytes of the object without `sig`,
`tsr` and `id`. Any RFC 8785 implementation can check one; the Go guard and
the Node CLI are tested against the same signed receipt, byte for byte.

## Who signed

A receipt never carries its public key. A receipt that brings its own key
proves only that somebody signed it; anyone can generate a key. The verifier
looks the key up by `kid` in a source it already trusts, and that source is
what says who signed:

1. `AGENTMD_TRUSTED_KEYS`: a keyset from a CI secret. It replaces the
   repository's list, so a pull request cannot add its own key.
2. `.agentmd/signers.json`: a keyset committed through review.
3. GitHub: for `signer: "github:<login>"`, the SSH signing keys on that
   account (`api.github.com/users/<login>/ssh_signing_keys`).
4. Agent.md's published evidence keyset, for Team records.

A keyset is `{"keys": [{"owner", "publicKey", "kid"?, "status"?}]}`, with
`publicKey` as an `ssh-ed25519 AAAA…` line or SPKI DER in base64. A key whose
`owner` differs from the receipt's `signer` fails; a `revoked` key fails.

## Using it

```bash
agentmd receipts key --signer github:<login>   # once per machine: name and show the key
agentmd receipts <id> --json > receipt.json    # hand one over
npx activate-agentmd verify receipt.json       # anyone: who signed it, and is it intact
```

`receipts key` prints the key as an `ssh-ed25519` line. Add it on GitHub under
Settings → SSH and GPG keys → New SSH key, key type **Signing key**, and your
receipts verify against github.com with nothing else from you. Or add the
JSON it prints to `.agentmd/signers.json` in a reviewed pull request.

## What it does not prove

The guard's key lives on the developer's machine
(`~/.agentmd/guard/state/local/signingkeys/`), readable by that user. The
guard refuses agent reads and writes of it, but that check matches text, so a
receipt proves which key signed, not that only the guard could use the key.
For receipts that must hold against the machine's own user, sign in CI with a
key from a secret. Without `tsr`, the time in a receipt is the signer's
claim.

Version 1 runtime receipts (before guard 0.3.0) carried their own key: they
still verify for integrity with `agentmd receipts <id>`, and say so.
