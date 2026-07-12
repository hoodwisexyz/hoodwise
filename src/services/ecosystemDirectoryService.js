const ECOSYSTEM_ENTRIES = [
  {
    id: 'noxa',
    name: 'NOXA Fun',
    url: 'https://www.noxa.fun/',
    aliases: ['noxa', 'noxa.fun', 'noxa fi', 'noxa.fi', 'dex.noxa', 'docs.noxa'],
    category: 'launchpad_trading',
    type: 'community multi-DEX launchpad',
    chainSupport: 'Robinhood Chain-focused public launch/trade/earn surface with Uniswap routing and trending/listing views',
    evidenceLevel: 'observed public platform surface; token-level metrics change live',
    status: 'community-operated discovery and trading surface; not an official Robinhood product or endorsement',
    userIntents: ['discover tokens', 'launch token', 'trade via DEX route', 'track trending/new/highest-MCap views', 'portfolio check'],
    use: 'Discover, launch, and trade community tokens on Robinhood Chain; use listings as a starting point, then verify the exact token contract and pool.',
    candidatePolicy: 'Can name visible/listed NOXA candidates or the recent discovery baseline as research starting points; never treat a listing as safety, endorsement, or a current buy signal by itself.',
    answerHints: ['lead with NOXA as a known launchpad, not unknown', 'separate platform facts from token verdict', 'for good/best coin requests provide a research shortlist when evidence exists', 'say current rank/price/liquidity must be refreshed when live metrics are absent'],
    verify: ['exact token contract on Robinhood Chain Blockscout', 'specific Uniswap/DEX pool and liquidity depth', 'holder distribution', 'owner/privileged controls', 'current listing/rank/market data'],
    examples: ['Cash Cat (CASHCAT)', 'Dog In Hood', 'GameStop', 'The Juggernaut', 'TENDIES', 'WISHBONE', '4663']
  },
  {
    id: 'bankr',
    name: 'Bankr / Doppler',
    url: 'https://docs.bankr.bot/faq/token-launching/',
    aliases: ['bankr', 'bankr.bot', 'doppler', '@bankrbot', 'bankr launch'],
    category: 'ai_launch_terminal',
    type: 'AI/agent token-launch surface',
    chainSupport: 'Bankr docs say token launches are supported on Base by default and Robinhood Chain when the user says on robinhood; current launcher is Doppler.',
    evidenceLevel: 'documented third-party support; every token still needs successful-launch and contract verification',
    status: 'community/third-party launch route that documents support for Robinhood Chain through Doppler; not a Robinhood endorsement',
    userIntents: ['launch token by prompt/terminal/CLI/X', 'research Bankr-created tokens', 'claim creator fees', 'check failed launch/spoof risk'],
    use: 'Research AI-assisted token launches and successful Doppler deployments tied to Robinhood Chain.',
    candidatePolicy: 'Can discuss Bankr/Doppler as a real Robinhood Chain launch route; candidate recommendations require a successful launch record, exact contract, and pool evidence.',
    answerHints: ['mention Robinhood support through Doppler', 'explain that failed launches can be spoofed by copycat contracts', 'include anti-snipe/fee/vesting caveats only when relevant', 'do not call Bankr unknown or undocumented'],
    verify: ['successful launch transaction', 'exact deployed token contract', 'Doppler/pool state', 'Blockscout contract activity', 'liquidity and ownership controls', 'creator fee recipient/admin status'],
    examples: []
  },
  {
    id: 'virtuals',
    name: 'Virtuals Protocol',
    url: 'https://whitepaper.virtuals.io/builders-hub/commonly-asked-questions/launching-an-ai-agent-token',
    aliases: ['virtuals', 'virtuals.io', 'app.virtuals.io', 'agent token', 'ai agent', 'virtuals protocol'],
    category: 'agent_token_identity',
    type: 'AI agent-token ecosystem',
    chainSupport: 'Virtuals is an agent-token launch/project ecosystem; Robinhood Chain linkage must be proven per exact project/token, not assumed from the generic Virtuals docs.',
    evidenceLevel: 'platform docs plus project/onchain evidence required for Robinhood Chain-specific claims',
    status: 'agent-token ecosystem and launch venue; a specific token still needs chain-specific evidence before being treated as Robinhood Chain-linked',
    userIntents: ['research agent-token thesis', 'verify project identity', 'connect website/social/contract claims', 'explain launch flow'],
    use: 'Research agent-token launches, project identity, token lore, and whether an exact agent/token is connected to Robinhood Chain.',
    candidatePolicy: 'Can explain Virtuals thesis and project identity; name a Robinhood Chain candidate only when the question supplies an address/project or live/onchain evidence ties it to Robinhood Chain.',
    answerHints: ['answer the Virtuals angle directly', 'do not infer official Robinhood integration', 'for Hoodwise, use the supplied project contract as project context first', 'put normal verification checks under What to verify next'],
    verify: ['project launch page', 'exact contract address', 'Robinhood Chain Blockscout match', 'token metadata', 'current holders/liquidity', 'official project social/site cross-check'],
    examples: ['Hoodwise / Hood Wise by Virtuals (HW)']
  },
  {
    id: 'hoodfun',
    name: 'hood.fun / HoodFun',
    url: 'https://hood.fun/',
    aliases: ['hood.fun', 'hoodfun', 'hood chain fun', 'hoodchain.fun', 'hood fun'],
    category: 'community_launchpad',
    type: 'community launchpad/discovery surface',
    chainSupport: 'public launch-and-trade surface branded around Robinhood Chain tokens',
    evidenceLevel: 'observed community surface; token-level evidence changes live',
    status: 'community launchpad surface; not an official Robinhood product or endorsement',
    userIntents: ['discover current listings', 'launch community token', 'trade listed coins', 'compare launchpad signals'],
    use: 'Discover Robinhood Chain community tokens and current listings, then verify each exact contract independently.',
    candidatePolicy: 'Can use visible hood.fun listings as discovery evidence; do not fabricate candidates if current listing data is unavailable.',
    answerHints: ['treat as a known community launchpad', 'ask for exact contract for a token-specific verdict', 'separate launchpad listing from endorsement'],
    verify: ['current listing page', 'exact token contract', 'DEX pool and liquidity', 'holder distribution', 'owner/privileged controls'],
    examples: []
  },
  {
    id: 'foragepad',
    name: 'ForagePad',
    url: 'https://foragepad.com/',
    aliases: ['foragepad', 'forage pad'],
    category: 'possible_discovery_surface',
    type: 'community launchpad/discovery surface',
    chainSupport: 'possible Robinhood Chain discovery venue when current platform evidence shows chain support',
    evidenceLevel: 'lower-confidence directory entry; refresh before treating as active Robinhood Chain venue',
    status: 'community discovery surface when current evidence ties it to Robinhood Chain; not a Robinhood endorsement',
    userIntents: ['check possible launchpad availability', 'verify chain selector/network', 'research listed candidates'],
    use: 'Treat as a possible launchpad/discovery venue and verify current Robinhood Chain support before naming active candidates.',
    candidatePolicy: 'Do not name ForagePad candidates without fresh listing or onchain evidence.',
    answerHints: ['be useful but label confidence lower than NOXA/Bankr/hood.fun', 'refresh current availability first'],
    verify: ['current platform availability', 'chain selector/network', 'exact token contract', 'DEX pool/liquidity', 'Blockscout activity'],
    examples: []
  },
  {
    id: 'cashcat',
    name: 'Cash Cat / CASHCAT',
    url: 'https://cashcat.fun/',
    aliases: ['cashcat', 'cash cat', '$cashcat', 'cashcat.fun'],
    category: 'community_token_lore',
    type: 'community token / lore example',
    chainSupport: 'community-token narrative associated with Robinhood Chain discovery conversations',
    evidenceLevel: 'token/lore context; contract and market state require current verification',
    status: 'community token narrative, not an official Robinhood asset',
    userIntents: ['explain lore', 'research thesis', 'check contract/pool', 'compare to other memecoins'],
    use: 'Useful as an ecosystem/lore research example; still needs current contract, liquidity, holder, and ownership checks before any action.',
    candidatePolicy: 'Can discuss Cash Cat as a named research/lore candidate; do not claim it is safe, official, or currently leading without live evidence.',
    answerHints: ['explain narrative separately from safety', 'include what would invalidate the thesis', 'finish token answers with DYOR'],
    verify: ['exact contract address', 'launchpad or DEX source', 'pool liquidity', 'holder distribution', 'ownership controls', 'current social/project claims'],
    examples: ['Cash Cat (CASHCAT)']
  },
  {
    id: 'uniswap',
    name: 'Uniswap / DEX liquidity',
    url: 'https://app.uniswap.org/',
    aliases: ['uniswap', 'dex', 'swap', 'pool', 'liquidity pool', 'slippage'],
    category: 'dex_liquidity',
    type: 'DEX trading and liquidity route',
    chainSupport: 'DEX route used by community-token surfaces and liquidity checks on Robinhood Chain when the exact pool exists',
    evidenceLevel: 'trading/pool evidence, not issuer or safety evidence',
    status: 'market infrastructure; not a token endorsement',
    userIntents: ['check liquidity', 'compare pool depth', 'simulate swap/slippage', 'verify trade route'],
    use: 'Use pool-level evidence to assess whether a token has active liquidity and realistic execution conditions.',
    candidatePolicy: 'A pool can support research but cannot by itself prove legitimacy or safety.',
    answerHints: ['talk in terms of exact pair/pool', 'avoid generic liquidity thresholds', 'state when no indexed pool is found'],
    verify: ['exact pair address', 'base/quote symbols', 'liquidity depth', '24h volume', 'route/slippage', 'pool age'],
    examples: []
  },
  {
    id: 'verification',
    name: 'Blockscout + DEX verification path',
    url: 'https://robinhoodchain.blockscout.com/',
    aliases: ['blockscout', 'dexscreener', 'geckoterminal', 'dextools', 'explorer', 'liquidity', 'holders', 'contract', 'verified code'],
    category: 'verification_workflow',
    type: 'verification workflow',
    chainSupport: 'Robinhood Chain explorer plus DEX/pool tools for exact-token verification',
    evidenceLevel: 'verification tooling, not endorsement',
    status: 'verification tools, not endorsements',
    userIntents: ['verify contract', 'check holders', 'check source code', 'inspect transfers', 'check pool/liquidity'],
    use: 'Use Blockscout for exact contract and onchain activity, then DEX/pool tools for live liquidity and trading context.',
    candidatePolicy: 'Required for token-specific verdicts; absence of one signal is uncertainty, not automatic proof of scam or safety.',
    answerHints: ['start with exact chain ID 4663 contract', 'separate source verification from liquidity verification', 'never use a different-chain address by mistake'],
    verify: ['chain ID 4663', 'contract bytecode/source verification', 'holder distribution', 'transfer activity', 'specific pool liquidity', 'swap route/slippage'],
    examples: []
  }
];

const BROAD_ECOSYSTEM_PATTERN = /\b(launchpad|launchpads|memecoin|memecoins|meme coin|meme coins|community token|ecosystem|where.*launch|where.*trade|good coin|best coin|hot coin|trending token|research token|agent token|ai token|dex|liquidity|pool|new token|token launch)\b/i;
const CANDIDATE_REQUEST_PATTERN = /\b(good|best|hot|trending|promising|active|pick|recommend|worth watching|bagus|rame|pilih|coin apa|token apa)\b/i;
const VERIFICATION_PATTERN = /\b(contract|verify|verification|safe|scam|risk|red flag|holders|liquidity|pool|owner|source code|honeypot)\b/i;

function normalise(value) {
  return String(value || '').toLowerCase();
}

function matchingEntries(message) {
  const text = normalise(message);
  const matches = ECOSYSTEM_ENTRIES.filter(entry => entry.aliases.some(alias => text.includes(alias)));
  if (matches.length) {
    if (VERIFICATION_PATTERN.test(message) && !matches.some(entry => entry.id === 'verification')) {
      return [...matches, ECOSYSTEM_ENTRIES.find(entry => entry.id === 'verification')].filter(Boolean);
    }
    return matches;
  }
  if (BROAD_ECOSYSTEM_PATTERN.test(message)) {
    const broadEntries = ECOSYSTEM_ENTRIES.filter(entry => entry.id !== 'verification');
    if (VERIFICATION_PATTERN.test(message) || CANDIDATE_REQUEST_PATTERN.test(message)) {
      broadEntries.push(ECOSYSTEM_ENTRIES.find(entry => entry.id === 'verification'));
    }
    return broadEntries.filter(Boolean);
  }
  return [];
}

function isCandidateQuestion(message) {
  return CANDIDATE_REQUEST_PATTERN.test(message) || /\b(candidate|shortlist|research)\b/i.test(message);
}

function buildEntryLine(entry, index) {
  const examples = entry.examples.length ? ` | knownExamples=${entry.examples.join(', ')}` : '';
  return [
    `[${index + 1}] ${entry.name}`,
    `category=${entry.category}`,
    `type=${entry.type}`,
    `chainSupport=${entry.chainSupport}`,
    `evidence=${entry.evidenceLevel}`,
    `status=${entry.status}`,
    `userIntents=${entry.userIntents.join(', ')}`,
    `use=${entry.use}`,
    `candidatePolicy=${entry.candidatePolicy}`,
    `answerHints=${entry.answerHints.join('; ')}`,
    `verify=${entry.verify.join('; ')}`
  ].join(' | ') + examples;
}

function buildEcosystemDirectoryContext(message, liveResults = []) {
  const entries = matchingEntries(message);
  if (!entries.length) return null;
  const candidateMode = isCandidateQuestion(message);
  const liveNote = liveResults.length
    ? 'Live search results are also present for this turn; use them for current ranking/metrics and use this directory only for stable platform framing.'
    : 'No live candidate ranking is guaranteed in this turn; use this directory to answer what the platform is and to name known discovery starting points without pretending they are current rankings.';
  const candidateInstruction = candidateMode
    ? 'The user is asking for candidates/recommendations. Give a research shortlist only when the directory examples or live evidence support it; otherwise name the best discovery surface and the exact refresh path. Do not answer with a generic refusal.'
    : 'The user is asking for platform/ecosystem context. Explain the surface, what it is used for, and what must be verified before token-specific claims.';
  return {
    role: 'system',
    content: `ROBINHOOD CHAIN ECOSYSTEM DIRECTORY (stable Hoodwise context, not live market data):\n${entries.map(buildEntryLine).join('\n')}\n\n${liveNote}\n${candidateInstruction}\nAnswer ecosystem and launchpad questions directly. Do not say these known surfaces are unknown or undocumented. Separate platform-level knowledge from token-level verification. If the user asks for a "good", "best", "hot", or "recommended" token and no live candidate metrics are available, give a research shortlist or discovery starting point only from the examples above, state that current ranking/price/liquidity must be refreshed, and never promise returns or safety. End candidate answers with: DYOR: verify the exact contract, pool liquidity, ownership controls, and current market conditions before interacting.`
  };
}

function ecosystemDirectorySources(message) {
  return matchingEntries(message).map(entry => ({
    title: `${entry.name} — Hoodwise ecosystem directory`,
    url: entry.url,
    sourceClass: 'curated'
  })).slice(0, 4);
}

function ecosystemDirectorySummary() {
  return ECOSYSTEM_ENTRIES.reduce((summary, entry) => {
    summary[entry.id] = {
      name: entry.name,
      category: entry.category,
      evidenceLevel: entry.evidenceLevel,
      status: entry.status,
      examples: entry.examples
    };
    return summary;
  }, {});
}

module.exports = { ECOSYSTEM_ENTRIES, matchingEntries, buildEcosystemDirectoryContext, ecosystemDirectorySources, ecosystemDirectorySummary, isCandidateQuestion };