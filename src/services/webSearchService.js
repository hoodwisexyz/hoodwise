const fetch = require('node-fetch');
const { config } = require('../config');
const logger = require('../lib/logger');
const metrics = require('./metricsService');

const TRUSTED_SEARCH_HOSTS = new Set(['robinhood.com', 'docs.robinhood.com', 'investors.robinhood.com', 'arbitrum.io', 'chain.link', 'blockscout.com', 'dexscreener.com', 'geckoterminal.com', 'dextools.io', 'coingecko.com', 'coinmarketcap.com', 'noxa.fun', 'noxa.fi', 'hoodchain.fun', 'hood.fun', 'cashcat.fun', 'bankr.bot', 'docs.bankr.bot', 'virtuals.io', 'whitepaper.virtuals.io', 'app.virtuals.io', 'foragepad.com', 'coindesk.com', 'thedefiant.io']);
const MEMECOIN_RESEARCH_DOMAINS = ['blockscout.com', 'dexscreener.com', 'geckoterminal.com', 'dextools.io', 'coingecko.com', 'coinmarketcap.com', 'noxa.fun', 'noxa.fi', 'hoodchain.fun', 'hood.fun', 'cashcat.fun', 'bankr.bot', 'docs.bankr.bot', 'virtuals.io', 'whitepaper.virtuals.io', 'app.virtuals.io', 'foragepad.com'];
function isTrustedSearchUrl(value) {
  try {
    const host = new URL(value).hostname.replace(/^www\./, '');
    return [...TRUSTED_SEARCH_HOSTS].some(allowed => host === allowed || host.endsWith('.' + allowed));
  } catch { return false; }
}

/**
 * Heuristic for "does this question likely need something fresher than the
 * static knowledge base?" — deliberately conservative and fast (a regex,
 * not a model call) so most questions skip search entirely and stay fast.
 * Robinhood Chain is a fast-moving, days-old ecosystem, so this leans
 * toward triggering on anything that smells time-sensitive.
 */
const FRESHNESS_PATTERN = /\b(today|now|currently|latest|newest|recent|recently|this week|this month|update|updates|updated|price|trending|status|available|availability|supported|is .* live|meme ?coin|this token|ticker|cashcat|noxa|launchpad|liquidity|volume|holders|contract address|perp|bridge|rpc|chain id|gas fee|lore|thesis|narrative|tokenomics|new (launchpad|token|memecoin|partner)|just (launched|announced)|breaking|news)\b/i;
const MEMECOIN_RESEARCH_PATTERN = /\b(meme ?coin|cashcat|noxa|bankr|virtuals|hood\.fun|hoodfun|foragepad|launchpad|liquidity|volume|holders|rug|honeypot)\b/i;
const NOXA_CANDIDATE_PATTERN = /\bnoxa(?:\.fun)?\b/i;
const CANDIDATE_REQUEST_PATTERN = /\b(?:good|best|promising|active|trending|hot|coin|token|recommend|suggest|watch|research|pick)\b/i;
const ECOSYSTEM_PLATFORM_PATTERN = /\b(noxa|bankr|doppler|virtuals|hood\.fun|hoodfun|foragepad|cashcat)\b/i;
function looksTimeSensitive(message) {
  return FRESHNESS_PATTERN.test(message);
}

function isMemecoinResearchQuery(message) {
  return MEMECOIN_RESEARCH_PATTERN.test(message);
}

function isNoxaCandidateRequest(message) {
  return NOXA_CANDIDATE_PATTERN.test(message) && CANDIDATE_REQUEST_PATTERN.test(message);
}

function isEcosystemCandidateRequest(message) {
  return ECOSYSTEM_PLATFORM_PATTERN.test(message) && CANDIDATE_REQUEST_PATTERN.test(message);
}

/**
 * Runs a live web search, scoped toward Robinhood Chain context, with a
 * hard timeout. Never throws — on any failure (no key, timeout, network
 * error, bad response) it logs and returns an empty result so the calling
 * chat flow always proceeds using the static knowledge base alone. This is
 * an enhancement layer, never a dependency.
 */
async function searchWeb(query, { requestId } = {}) {
  if (!config.search.enabled) return { results: [], attempted: false };
  metrics.record('liveSearches');

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), config.search.timeoutMs);

  try {
    const memecoinResearch = isMemecoinResearchQuery(query);
    const noxaCandidateResearch = memecoinResearch && NOXA_CANDIDATE_PATTERN.test(query);
    const ecosystemCandidateResearch = isEcosystemCandidateRequest(query);
    const response = await fetch(config.search.url, {
      method: 'POST',
      signal: controller.signal,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        api_key: config.search.tavilyApiKey,
        query: noxaCandidateResearch
          ? `site:noxa.fun Robinhood Chain NOXA Fun trending tokens market cap volume graduation ${query}`
          : ecosystemCandidateResearch
          ? `Robinhood Chain ${query} launchpad token listing trading volume liquidity contract address`
          : memecoinResearch
          ? `Robinhood Chain ${query} launchpad token liquidity volume contract address NOXA Fun Bankr Virtuals HoodFun`
          : `Robinhood Chain ${query}`,
        search_depth: ecosystemCandidateResearch ? 'advanced' : 'basic',
        max_results: config.search.maxResults,
        days: 30, // bias toward recent results — this ecosystem is days/weeks old
        ...(memecoinResearch ? { include_domains: MEMECOIN_RESEARCH_DOMAINS } : {})
      })
    });

    if (!response.ok) {
      logger.warn('web search returned non-OK status', { requestId, status: response.status });
      return { results: [], attempted: true };
    }

    const data = await response.json();
    const results = (data.results || [])
      .slice(0, config.search.maxResults)
      .map(r => ({ title: r.title, url: r.url, snippet: (r.content || '').slice(0, 400) }))
      .filter(r => r.title && r.url && isTrustedSearchUrl(r.url));

    return { results, attempted: true };
  } catch (err) {
    logger.warn('web search failed, continuing without it', {
      requestId,
      error: err.name === 'AbortError' ? 'timeout' : err.message
    });
    return { results: [], attempted: true };
  } finally {
    clearTimeout(timeout);
  }
}

module.exports = { searchWeb, looksTimeSensitive, isTrustedSearchUrl, isMemecoinResearchQuery, isNoxaCandidateRequest, isEcosystemCandidateRequest };
