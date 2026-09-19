# DormantKey Recovery

DormantKey Recovery is a GenLayer intelligent contract and dapp for issuing a bounded, single-use administrative key-recovery authorization. It does **not** custody funds or silently replace a key. It records a protected-key heartbeat, waits for configured dormancy, requires guardian quorum, subjects the evidence commitment to validator consensus, preserves a challenge window, and lets only the charter owner consume the exact finalized digest once.

## Why this architecture is different

The protocol is a state machine rather than a generic document auditor:

`heartbeat → dormant → guardian vote → semantic assessment → challenge window → authorization → consumed`

- Dormancy comes from `Charter.last_activity_at`, written by the protected key. A claimant cannot submit their own activity timestamp.
- Guardian votes are address-bound and immutable per case.
- An unsafe or malformed `ALLOW` response is converted to `INSUFFICIENT`.
- Any guardian challenge prevents automatic eligibility even if validators return `ALLOW`.
- Finalization creates a deterministic digest; owner-only consumption locks it against replay.

## Repository

- `contracts/dormant_key_recovery.py` — GenLayer contract.
- `tests/` — Direct Mode lifecycle, authorization, failure and adversarial tests.
- `frontend/` — React/Vite dapp using a standard EIP-1193 wallet.
- `docs/ARCHITECTURE.md` — trust boundaries and state transitions.
- `docs/TEST_RESOURCE_MANIFEST.md` — exact provenance of every test input.

## Verify locally

```bash
python -m pytest -q
cd frontend
npm install
npm test
npm run build
```

The current suite contains 8 contract tests and 3 transaction-reconciliation tests.

## Configure the dapp

The verified StudioNet deployment is [`0x4E2A46FC129F3b82a6Ca9eD593aA79Ee5a588BB7`](https://explorer-studio.genlayer.com/address/0x4E2A46FC129F3b82a6Ca9eD593aA79Ee5a588BB7). It is configured in `frontend/.env.production`:

```env
VITE_CONTRACT_ADDRESS=0x4E2A46FC129F3b82a6Ca9eD593aA79Ee5a588BB7
```

Every write checks `DORMANT_KEY_RECOVERY_V1`, waits for a terminal StudioNet receipt, rejects execution errors embedded in the leader receipt, and re-reads canonical state after acceptance.

## Scope

This contract emits and consumes an authorization primitive. A production Safe, account-abstraction wallet, or governance executor would verify the consumed digest before performing its own key rotation. The repository does not claim to rotate an unrelated EVM account directly.
