# Architecture and security model

## Roles

| Role | Authority |
|---|---|
| Charter owner | Creates the charter, resolves explicit challenges, consumes a finalized authorization |
| Protected key | Records a heartbeat proving continued control |
| Guardian | Opens a dormant recovery case, votes once, and may request validator assessment after quorum |
| Validator set | Independently assesses charter alignment, evidence sufficiency, and takeover risk |
| Keeper / any caller | May finalize an eligible case after the challenge window; cannot consume it |

## Canonical state flow

1. `create_charter` commits protected key, unique guardians, threshold, dormancy and challenge durations.
2. `record_activity` accepts only the protected key and updates the on-chain heartbeat.
3. `open_recovery` accepts only a guardian and only after the recorded heartbeat is old enough.
4. `guardian_vote` stores one immutable APPROVE or CHALLENGE vote per guardian and case.
5. `assess` runs only after quorum. Validators receive the charter digest, key pair, evidence digest and vote counts as untrusted data.
6. Strict schema validation rejects malformed responses. An ALLOW is safe only with charter alignment YES, takeover risk NO, and evidence sufficiency YES.
7. An explicit guardian challenge always routes to CHALLENGED. The owner must commit a resolution before eligibility.
8. `finalize` waits until `challenge_until` and derives the exact authorization digest.
9. `consume_authorization` is owner-only, requires the exact digest, marks it used, and closes the case.

## Security properties

- No claimant-supplied dormancy timestamp.
- No duplicate guardians, votes, active cases for the same replacement key, or digest reuse.
- Fail-closed semantic fallback (`INSUFFICIENT`).
- Validator output cannot bypass a guardian challenge.
- Frontend does not infer success from submission; it reconciles terminal receipt fields and re-reads storage.

## Deliberate boundary

The contract authorizes recovery; it does not hold or rotate third-party wallet keys. Integration with a Safe/module/executor must define how the consumed authorization digest maps to the external key-change operation.
