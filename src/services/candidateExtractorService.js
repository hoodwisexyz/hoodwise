const CONTRACT_PATTERN = /\b0x[a-fA-F0-9]{40}\b/g;
const PAIR_PATTERN = /\b([A-Z][A-Za-z0-9][A-Za-z0-9 .'-]{0,38}?)\s*\(([A-Z0-9]{2,12})\)/g;
const CASH_TAG_PATTERN = /\$([A-Z][A-Z0-9]{1,12})\b/g;
const DEX_PAIR_PATTERN = /\b([A-Z0-9]{2,12})\s*\/\s*(?:WETH|ETH|USDG|USDC|USDT)\b/g;
const METRIC_PATTERN = /\b(?:mcap|market cap|volume|liquidity|holders?|graduated|ath)\b[^.|\n;]{0,80}/gi;

const IGNORED_TICKERS = new Set([
  'AI', 'API', 'ATH', 'DEX', 'DYOR', 'ERC20', 'ETH', 'EVM', 'FAQ', 'LP',
  'MCAP', 'NOXA', 'RWA', 'TVL', 'USD', 'USDC', 'USDG', 'USDT', 'WETH'
]);

function hostFromUrl(url) {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return '';
  }
}

function detectVenue(result) {
  const host = hostFromUrl(result.url);
  const text = `${result.title || ''} ${result.snippet || ''}`.toLowerCase();
  if (host.includes('noxa') || text.includes('noxa')) return 'NOXA Fun';
  if (host.includes('hood.fun') || host.includes('hoodchain') || text.includes('hood.fun') || text.includes('hoodfun')) return 'hood.fun / HoodFun';
  if (host.includes('bankr') || text.includes('bankr') || text.includes('doppler')) return 'Bankr / Doppler';
  if (host.includes('virtuals') || text.includes('virtuals')) return 'Virtuals';
  if (host.includes('dexscreener')) return 'DEX Screener';
  if (host.includes('geckoterminal')) return 'GeckoTerminal';
  if (host.includes('dextools')) return 'DEXTools';
  if (host.includes('blockscout')) return 'Blockscout';
  return 'Robinhood Chain ecosystem';
}

function cleanName(name) {
  return name
    .replace(/.*\b(?:include|includes|including|listed|token|tokens)\s+/i, '')
    .replace(/\s+/g, ' ')
    .replace(/^[^A-Za-z0-9]+|[^A-Za-z0-9]+$/g, '')
    .trim();
}

function isUsableTicker(ticker) {
  return ticker && !IGNORED_TICKERS.has(ticker.toUpperCase()) && /[A-Z]/.test(ticker);
}

function extractMetrics(text) {
  const metrics = [];
  for (const match of text.matchAll(METRIC_PATTERN)) {
    const value = match[0].replace(/\s+/g, ' ').trim();
    if (value.length >= 5 && !metrics.includes(value)) metrics.push(value);
  }
  return metrics.slice(0, 3);
}

function addCandidate(map, candidate) {
  const ticker = candidate.ticker ? candidate.ticker.toUpperCase() : '';
  const name = cleanName(candidate.name || ticker);
  if (!name && !ticker && !candidate.contracts.length) return;
  if (ticker && !isUsableTicker(ticker)) return;
  const key = `${candidate.venue}|${ticker || name.toLowerCase() || candidate.contracts[0]}`;
  const existing = map.get(key);
  if (existing) {
    existing.contracts = [...new Set([...existing.contracts, ...candidate.contracts])].slice(0, 3);
    existing.metrics = [...new Set([...existing.metrics, ...candidate.metrics])].slice(0, 4);
    existing.evidence = existing.evidence.length <= candidate.evidence.length ? existing.evidence : candidate.evidence;
    return;
  }
  map.set(key, {
    venue: candidate.venue,
    name: name || ticker || 'Unnamed token',
    ticker: ticker || null,
    contracts: candidate.contracts.slice(0, 3),
    metrics: candidate.metrics.slice(0, 4),
    evidence: candidate.evidence,
    url: candidate.url
  });
}

function extractCandidatesFromResults(results = []) {
  const candidates = new Map();
  for (const result of results) {
    const text = `${result.title || ''}. ${result.snippet || ''}`;
    const venue = detectVenue(result);
    const contracts = [...new Set(text.match(CONTRACT_PATTERN) || [])];
    const metrics = extractMetrics(text);
    let matchedCandidate = false;

    for (const match of text.matchAll(PAIR_PATTERN)) {
      matchedCandidate = true;
      addCandidate(candidates, {
        venue,
        name: match[1],
        ticker: match[2],
        contracts,
        metrics,
        evidence: text.slice(0, 240),
        url: result.url
      });
    }

    for (const match of text.matchAll(CASH_TAG_PATTERN)) {
      matchedCandidate = true;
      addCandidate(candidates, {
        venue,
        name: match[1],
        ticker: match[1],
        contracts,
        metrics,
        evidence: text.slice(0, 240),
        url: result.url
      });
    }

    for (const match of text.matchAll(DEX_PAIR_PATTERN)) {
      matchedCandidate = true;
      addCandidate(candidates, {
        venue,
        name: match[1],
        ticker: match[1],
        contracts,
        metrics,
        evidence: text.slice(0, 240),
        url: result.url
      });
    }

    if (contracts.length && !matchedCandidate) {
      addCandidate(candidates, {
        venue,
        name: result.title || 'Token contract',
        ticker: null,
        contracts,
        metrics,
        evidence: text.slice(0, 240),
        url: result.url
      });
    }
  }
  return [...candidates.values()].slice(0, 5);
}

function buildCandidateContextMessage(candidates) {
  if (!candidates.length) return null;
  const lines = candidates.map((candidate, index) => {
    const ticker = candidate.ticker ? ` (${candidate.ticker})` : '';
    const contracts = candidate.contracts.length ? ` contracts=${candidate.contracts.join(', ')}` : '';
    const metrics = candidate.metrics.length ? ` metrics=${candidate.metrics.join(' | ')}` : '';
    return `[${index + 1}] ${candidate.name}${ticker} | venue=${candidate.venue}${contracts}${metrics} | evidence=${candidate.evidence} | source=${candidate.url}`;
  }).join('\n');
  return {
    role: 'system',
    content: `LIVE CANDIDATE EXTRACTS (observed from live search snippets for this turn, not verified recommendations):\n${lines}\n\nUse these only as a research shortlist when they directly answer the user's launchpad or memecoin question. Format candidate answers as Candidate / venue / observed evidence / missing verification / DYOR. Do not call any candidate safe, official, or good by default. Do not invent missing contracts, liquidity, rankings, or returns.`
  };
}

module.exports = { extractCandidatesFromResults, buildCandidateContextMessage, detectVenue };