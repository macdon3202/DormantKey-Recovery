export const VERSION = "DORMANT_KEY_RECOVERY_V1";
export function normalizeHash(v) {
  const h =
    typeof v === "string" ? v : v?.txId || v?.hash || v?.transactionHash;
  if (!/^0x[0-9a-f]{64}$/i.test(h || ""))
    throw Error("Wallet returned no valid transaction hash.");
  return h;
}
export function receiptState(x) {
  const s = String(
      x?.statusName || x?.status_name || x?.status || "",
    ).toUpperCase(),
    rs = Array.isArray(x?.consensus_data?.leader_receipt)
      ? x.consensus_data.leader_receipt
      : [],
    xs = [
      x?.execution_result,
      x?.tx_execution_result_name,
      ...rs.map((r) => r?.execution_result),
    ]
      .filter(Boolean)
      .map((v) => String(v).toUpperCase()),
    failed =
      ["FAILED", "REJECTED", "CANCELLED"].includes(s) ||
      xs.some((v) => v.includes("ERROR")),
    terminal = ["ACCEPTED", "FINALIZED", "UNDETERMINED"].includes(s),
    bad = rs.find((r) =>
      String(r?.execution_result || "")
        .toUpperCase()
        .includes("ERROR"),
    );
  return {
    label: s || "PENDING",
    accepted: terminal && !failed,
    failed,
    reason:
      typeof bad?.result?.payload === "string" ? bad.result.payload : null,
  };
}
