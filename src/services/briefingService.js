function extractContracts(text) {
  return [...new Set((text.match(/\b0x[a-fA-F0-9]{40}\b/g) || []).slice(0, 2))];
}

function buildBriefingMeta(reply, sources, usedLiveSearch) {
  const lower = reply.toLowerCase();
  const risks = [];
  if (/jurisdiction|available|eligib/.test(lower)) risks.push('Access varies by jurisdiction');
  if (/liquidity|memecoin|community token|rug|tax|holder/.test(lower)) risks.push('Liquidity and contract checks matter');
  if (/bridge|withdraw/.test(lower)) risks.push('Bridge timing and route risk apply');
  if (/smart contract|protocol|exploit/.test(lower)) risks.push('Smart-contract risk remains');
  return { evidence: usedLiveSearch ? 'Fresh context checked' : 'Curated source baseline', verification: usedLiveSearch ? 'Recheck changing availability and market data' : 'Verify live availability before acting', contracts: extractContracts(reply), risks: risks.slice(0, 2), sourceCount: sources.length };
}
module.exports = { buildBriefingMeta };