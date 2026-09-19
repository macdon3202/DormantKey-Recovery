const eq = (a, b) => String(a || "").toLowerCase() === String(b || "").toLowerCase();

export function permissions({ wallet, charter, recovery }) {
  const connected = Boolean(wallet);
  const owner = connected && eq(wallet.account, charter?.owner);
  const protectedKey = connected && eq(wallet.account, charter?.protected_key);
  const voting = recovery?.state === "VOTING";
  return {
    heartbeat: protectedKey && Boolean(charter?.active),
    vote: connected && voting,
    assess: connected && voting && Number(recovery?.approvals || 0) >= Number(charter?.threshold || 0),
    resolve: owner && recovery?.state === "CHALLENGED",
    finalize: connected && recovery?.state === "ELIGIBLE",
    consume: owner && recovery?.state === "AUTHORIZED",
  };
}
