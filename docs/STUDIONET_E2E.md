# DormantKey Recovery — StudioNet E2E evidence

Verified on 2026-09-19 against [`0x4E2A46FC129F3b82a6Ca9eD593aA79Ee5a588BB7`](https://explorer-studio.genlayer.com/address/0x4E2A46FC129F3b82a6Ca9eD593aA79Ee5a588BB7). Before sending writes, `get_config()` returned the expected version `DORMANT_KEY_RECOVERY_V1`.

## Complete recovery lifecycle

| Step | Verified result | Transaction |
|---|---|---|
| Create 2-of-2 recovery charter | SUCCESS, charter `0` | [0x7939d3…3a6c](https://explorer-studio.genlayer.com/tx/0x7939d30b4c2a49f9363c5b686ad6774a14854664cb670138f206bef135813a6c) |
| Unauthorized heartbeat attempt | ERROR `PROTECTED_KEY_ONLY` | [0x65d67e…a47e](https://explorer-studio.genlayer.com/tx/0x65d67e6473e523abc1c82d76ee102420088c9a6f5009df1f11a03d1ea960a47e) |
| Open case after canonical dormancy | SUCCESS, case `0` | [0xeee9c3…156b](https://explorer-studio.genlayer.com/tx/0xeee9c3abf08118f64d00c2eb1dcaf3cc171c6b98cb75858e8e605a81d620156b) |
| Guardian A approval | SUCCESS | [0x88b8bf…aac7](https://explorer-studio.genlayer.com/tx/0x88b8bfc752abd3200e84042f6aa2400cc45577a079ed44e3ca388af42daaaac7) |
| Guardian B approval | SUCCESS | [0x633a26…7cbe](https://explorer-studio.genlayer.com/tx/0x633a26d7c9ec491d85d95f54a43b29c64967835eed415d32a16d5174668a7cbe) |
| Validator semantic assessment | SUCCESS; fail-closed result `INSUFFICIENT` routed to `CHALLENGED` | [0x2b85f8…d72b](https://explorer-studio.genlayer.com/tx/0x2b85f81dfd64949a1e8225e06ee1b7941a78fb77b2e9e8c6e449d9d73274d72b) |
| Owner records explicit resolution | SUCCESS | [0x74139a…8bcf](https://explorer-studio.genlayer.com/tx/0x74139a9e8c723a3b7cdf93ce91f871e4a8e45260065d5d6669e5dc039a578bcf) |
| Finalize after original challenge window | SUCCESS | [0xd066b2…bb6](https://explorer-studio.genlayer.com/tx/0xd066b2402a75f6df2dd831bd8a5b934589714703f404580c25e95543ee583bb6) |
| Duplicate finalize attempt | ERROR `CASE_NOT_ELIGIBLE` | [0xd474f4…3cc9](https://explorer-studio.genlayer.com/tx/0xd474f42c1138676210c80f861e7ba65646787a32afc86894f258dadbc2403cc9) |
| Consume with wrong digest | ERROR `AUTHORIZATION_MISMATCH` | [0xbd0512…6712](https://explorer-studio.genlayer.com/tx/0xbd0512ef5037901a34a3d32cdaa6bd7f8b44fbde6c39d8a9a5fdf815621a6712) |
| Consume exact authorization | SUCCESS | [0x4dd3eb…c1f8](https://explorer-studio.genlayer.com/tx/0x4dd3eb24c9abd5f22b8a8a620d1ce9e90d9fe0bbf6448cf153675d93de82c1f8) |
| Replay consumed authorization | ERROR `CASE_NOT_AUTHORIZED` | [0x507f58…2202](https://explorer-studio.genlayer.com/tx/0x507f58bcb07567a966c7299bcf60636ae60389b58a0b9fe981f82fdf869a2202) |

## Canonical final readback

- Case state: `CONSUMED`
- Approvals: `2`; challenges: `0`; threshold: `2`
- Semantic assessment: `INSUFFICIENT` (fail-closed, then explicitly resolved by the owner)
- Authorization digest: `d1ec9f74c45a635dbfd7cebb949c0862412aeb5e289dba1ae5575770ee47a879`
- Old key: `0x7777777777777777777777777777777777777777`
- New key: `0x8888888888888888888888888888888888888888`

The full arguments, receipt summaries, timestamps and final storage readback are preserved in [`STUDIONET_E2E.json`](./STUDIONET_E2E.json). Direct Mode mocks are documented separately and are not presented as StudioNet transactions.
