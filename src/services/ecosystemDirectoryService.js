const ECOSYSTEM_ENTRIES = [
  {
    id: 'noxa',
    name: 'NOXA Fun',
    url: 'https://www.noxa.fun/',
    aliases: ['noxa', 'noxa.fun', 'noxa fi', 'noxa.fi'],
    type: 'community multi-DEX launchpad',
    status: 'community-operated discovery and trading surface; not an official Robinhood product or endorsement',
    use: 'Discover, launch, and trade community tokens on Robinhood Chain; use listings as a starting point, then verify the exact token contract and pool.',
    verify: ['exact token contract on Robinhood Chain Blockscout', 'specific Uniswap/DEX pool and liquidity depth', 'holder distribution', 'owner/privileged controls', 'current listing/rank/market data'],
    examples: ['Cash Cat (CASHCAT)', 'Dog In Hood', 'GameStop', 'The Juggernaut', 'TENDIES', 'WISHBONE', '4663']
  },
  {
    id: 'bankr',
    name: 'Bankr / Doppler',
    url: 'https://docs.bankr.bot/',
    aliases: ['bankr', 'doppler'],
    type: 'AI/agent token-launch surface',
    status: 'community/third-party launch route that documents support for Robinhood Chain through Doppler; not a Robinhood endorsement',
    use: 'Research AI-assisted token launches and successful Doppler deployments tied to Robinhood Chain.',
    verify: ['successful launch transaction', 'exact deployed token contract', 'Doppler/pool state', 'Blockscout contract activity', 'liquidity and ownership controls'],
    examples: []
  },
  {
    id: 'virtuals',
    name: 'Virtuals Protocol',
    url: 'https://whitepaper.virtuals.io/builders-hub/commonly-asked-questions/launching-an-ai-agent-token',
    aliases: ['virtuals', 'virtuals.io', 'app.virtuals.io', 'agent token', 'ai agent'],
    type: 'AI agent-token ecosystem',
    status: 'agent-token ecosystem and launch venue; a specific token still needs chain-specific evidence before being treated as Robinhood Chain-linked',
    use: 'Research agent-token launches, project identity, token lore, and whether an exact agent/token is connected to Robinhood Chain.',
    verify: ['project launch page', 'exact contract address', 'Robinhood Chain Blockscout match', 'token metadata', 'current holders/liquidity', 'official project social/site cross-check'],
    examples: ['Hoodwise / Hood Wise by Virtuals (HW)']
  },
  {
    id: 'hoodfun',
    name: 'hood.fun / HoodFun',
    url: 'https://hood.fun/',
    aliases: ['hood.fun', 'hoodfun', 'hood chain fun', 'hoodchain.fun'],
    type: 'community launchpad/discovery surface',
    status: 'community launchpad surface; not an official Robinhood product or endorsement',
    use: 'Discover Robinhood Chain community tokens and current listings, then verify each exact contract independently.',
    verify: ['current listing page', 'exact token contract', 'DEX pool and liquidity', 'holder distribution', 'owner/privileged controls'],
    examples: []
  },
  {
    id: 'foragepad',
    name: 'ForagePad',
    url: 'https://foragepad.com/',
    aliases: ['foragepad', 'forage pad'],
    type: 'community launchpad/discovery surface',
    status: 'community discovery surface when current evidence ties it to Robinhood Chain; not a Robinhood endorsement',
    use: 'Treat as a possible launchpad/discovery venue and verify current Robinhood Chain support before naming active candidates.',
    verify: ['current platform availability', 'chain selector/network', 'exact token contract', 'DEX pool/liquidity', 'Blockscout activity'],
    examples: []
  },
  {
    id: 'cashcat',
    name: 'Cash Cat / CASHCAT',
    url: 'https://cashcat.fun/',
    aliases: ['cashcat', 'cash cat', '$cashcat'],
    type: 'community token / lore example',
    status: 'community token narrative, not an official Robinhood asset',
    use: 'Useful as an ecosystem/lore research example; still needs current contract, liquidity, holder, and ownership checks before any action.',
    verify: ['exact contract address', 'launchpad or DEX source', 'pool liquidity', 'holder distribution', 'ownership controls', 'current social/project claims'],
    examples: ['Cash Cat (CASHCAT)']
  },
  {
    id: 'verification',
    name: 'Blockscout + DEX verification path',
    url: 'https://robinhoodchain.blockscout.com/',
    aliases: ['blockscout', 'dexscreener', 'geckoterminal', 'dextools', 'uniswap', 'liquidity', 'holders', 'contract'],
    type: 'verification workflow',
    status: 'verification tools, not endorsements',
    use: 'Use Blockscout for exact contract and onchain activity, then DEX/pool tools for live liquidity and trading context.',
    verify: ['chain ID 4663', 'contract bytecode/source verification', 'holder distribution', 'transfer activity', 'specific pool liquidity', 'swap route/slippage'],
    examples: []
  }
];

const BROAD_ECOSYSTEM_PATTERN = /\b(launchpad|memecoin|memecoins|meme coin|meme coins|community token|ecosystem|where.*launch|where.*trade|good coin|best coin|hot coin|trending token|research token)\b/i;

function normalise(value) {
  return String(value || '').toLowerCase();
}

function matchingEntries(message) {
  const text = normalise(message);
  const matches = ECOSYSTEM_ENTRIES.filter(entry => entry.aliases.some(alias => text.includes(alias)));
  if (matches.length) return matches;
  if (BROAD_ECOSYSTEM_PATTERN.test(message)) {
    return ECOSYSTEM_ENTRIES.filter(entry => entry.id !== 'verification');
  }
  return [];
}

function buildEntryLine(entry, index) {
  const examples = entry.examples.length ? ` examples=${entry.examples.join(', ')}` : '';
  return `[${index + 1}] ${entry.name} | type=${entry.type} | status=${entry.status} | use=${entry.use} | verify=${entry.verify.join('; ')}${examples}`;
}

function buildEcosystemDirectoryContext(message, liveResults = []) {
  const entries = matchingEntries(message);
  if (!entries.length) return null;
  const liveNote = liveResults.length
    ? 'Live search results are also present for this turn; use them for current ranking/metrics and use this directory only for stable platform framing.'
    : 'No live candidate ranking is guaranteed in this turn; use this directory to answer what the platform is and to name known discovery starting points without pretending they are current rankings.';
  return {
    role: 'system',
    content: `ROBINHOOD CHAIN ECOSYSTEM DIRECTORY (stable Hoodwise context, not live market data):\n${entries.map(buildEntryLine).join('\n')}\n\n${liveNote}\nAnswer ecosystem and launchpad questions directly. Do not say these known surfaces are unknown or undocumented. Separate platform-level knowledge from token-level verification. If the user asks for a "good", "best", "hot", or "recommended" token and no live candidate metrics are available, give a research shortlist or discovery starting point only from the examples above, state that current ranking/price/liquidity must be refreshed, and never promise returns or safety. End candidate answers with: DYOR: verify the exact contract, pool liquidity, ownership controls, and current market conditions before interacting.`
  };
}

function ecosystemDirectorySources(message) {
  return matchingEntries(message).map(entry => ({
    title: `${entry.name} — Hoodwise ecosystem directory`,
    url: entry.url,
    sourceClass: 'curated'
  })).slice(0, 3);
}

module.exports = { ECOSYSTEM_ENTRIES, matchingEntries, buildEcosystemDirectoryContext, ecosystemDirectorySources };