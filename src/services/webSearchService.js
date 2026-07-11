const fetch = require('node-fetch');
const { config } = require('../config');
const logger = require('../lib/logger');
const metrics = require('./metricsService');

const TRUSTED_SEARCH_HOSTS = new Set(['robinhood.com', 'docs.robinhood.com', 'investors.robinhood.com', 'arbitrum.io', 'chain.link', 'blockscout.com', 'coindesk.com', 'thedefiant.io']);
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
const FRESHNESS_PATTERN = /\b(today|now|currently|latest|newest|recent|recently|this week|this month|update|updates|updated|price|trending|status|available|availability|supported|is .* live|meme ?coin|this token|ticker|cashcat|noxa|launchpad|liquidity|volume|holders|contract address|perp|bridge|rpc|chain id|gas fee|new (launchpad|token|memecoin|partner)|just (launched|announced)|breaking|news)\b/i;

function looksTimeSensitive(message) {
  return FRESHNESS_PATTERN.test(message);
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
    const response = await fetch(config.search.url, {
      method: 'POST',
      signal: controller.signal,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        api_key: config.search.tavilyApiKey,
        query: `Robinhood Chain ${query}`,
        search_depth: 'basic',
        max_results: config.search.maxResults,
        days: 30 // bias toward recent results — this ecosystem is days/weeks old
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

module.exports = { searchWeb, looksTimeSensitive, isTrustedSearchUrl };
