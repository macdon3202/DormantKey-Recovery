import test from "node:test";
import assert from "node:assert/strict";
import { normalizeHash, receiptState, VERSION } from "./src/transactions.js";
import { permissions } from "./src/ui-state.js";
test("guards contract version", () =>
  assert.equal(VERSION, "DORMANT_KEY_RECOVERY_V1"));
test("normalizes transaction hashes", () => {
  const h = "0x" + "ab".repeat(32);
  assert.equal(normalizeHash({ txId: h }), h);
  assert.throws(() => normalizeHash({}), /valid transaction hash/);
});
test("reads StudioNet status and embedded errors", () => {
  assert.equal(receiptState({ statusName: "FINALIZED" }).accepted, true);
  assert.deepEqual(
    receiptState({
      statusName: "ACCEPTED",
      consensus_data: {
        leader_receipt: [
          { execution_result: "ERROR", result: { payload: "OWNER_ONLY" } },
        ],
      },
    }),
    { label: "ACCEPTED", accepted: false, failed: true, reason: "OWNER_ONLY" },
  );
});
test("closed case disables every lifecycle write", () => {
  const p = permissions({
    wallet: { account: "0x11" },
    charter: { owner: "0x11", protected_key: "0x22", threshold: 2, active: true },
    recovery: { state: "CONSUMED", approvals: 2 },
  });
  assert.deepEqual(p, { heartbeat: false, vote: false, assess: false, resolve: false, finalize: false, consume: false });
});
test("role and state gates mirror contract", () => {
  const owner = { account: "0x11" }, charter = { owner: "0x11", protected_key: "0x22", threshold: 2, active: true };
  assert.equal(permissions({ wallet: owner, charter, recovery: { state: "CHALLENGED" } }).resolve, true);
  assert.equal(permissions({ wallet: owner, charter, recovery: { state: "AUTHORIZED" } }).consume, true);
  assert.equal(permissions({ wallet: { account: "0x33" }, charter, recovery: { state: "VOTING", approvals: 2 } }).assess, true);
});
