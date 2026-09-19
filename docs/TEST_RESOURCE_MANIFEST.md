# Test resource manifest

The automated tests use no scraped website, mutable API response, invented transaction hash, or owner-authored claim of external activity.

| Input | Source | Why it is admissible |
|---|---|---|
| Charter owner / protected key / guardians | Deterministic Direct Mode accounts declared in the test | Tests caller authorization and storage deterministically |
| Activity time | Direct Mode VM clock plus `record_activity` transaction | Contract state is the authoritative source; recovery callers cannot supply it |
| Guardian approvals/challenges | Signed caller context in Direct Mode | Exercises address-bound one-vote enforcement |
| Evidence digest | Fixed 64-character SHA-256-shaped commitment | The contract verifies commitment format; it never claims the fixture is real-world evidence |
| Semantic result | Strict `gltest` LLM mocks keyed by `DORMANT_KEY_RECOVERY_ASSESSMENT_V1` | Reproducibly covers ALLOW and adversarial unsafe-ALLOW behavior |
| Challenge expiry | Direct Mode `vm.warp` | Deterministically verifies boundary behavior without wall-clock waiting |
| Receipt fixtures | Minimal frontend unit fixtures matching documented StudioNet response shapes | Verifies status reconciliation and embedded execution-error rejection |

## Covered paths

- Complete happy lifecycle through single-use consumption.
- Early finalization rejection.
- Wrong caller and wrong digest rejection.
- Replay rejection after consumption.
- Heartbeat refresh and exact dormancy boundary.
- Unauthorized heartbeat, vote, assessment, resolution, and consumption.
- Missing quorum, duplicate vote, duplicate recovery case, and invalid replacement key.
- Guardian challenge overriding an otherwise ALLOW assessment.
- Unsafe ALLOW converted to INSUFFICIENT.

Live deployment evidence should be added only after StudioNet transactions actually exist. Do not add placeholder hashes.
