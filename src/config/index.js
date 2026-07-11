require('dotenv').config();

/**
 * All environment configuration is read exactly once, here, and validated
 * up front. Every other module imports `config` instead of touching
 * `process.env` directly — this keeps env access auditable in one place and
 * means a missing/malformed variable fails fast at boot instead of causing
 * a confusing error three requests deep into production traffic.
 */

function toInt(value, fallback) {
  const n = parseInt(value, 10);
  return Number.isFinite(n) ? n : fallback;
}

const config = Object.freeze({
  nodeEnv: process.env.NODE_ENV || 'development',
  port: toInt(process.env.PORT, 3000),

  openrouter: Object.freeze({
    apiKey: process.env.OPENROUTER_API_KEY || null,
    model: process.env.OPENROUTER_MODEL || 'deepseek/deepseek-v4-flash',
    url: 'https://openrouter.ai/api/v1/chat/completions',
    // Public-facing referer/title headers OpenRouter uses for attribution —
    // not secrets, safe to have sane defaults.
    referer: process.env.PUBLIC_APP_URL || 'https://hoodwise.xyz',
    timeoutMs: toInt(process.env.OPENROUTER_TIMEOUT_MS, 25000),
    maxRetries: toInt(process.env.OPENROUTER_MAX_RETRIES, 1)
  }),

  ops: Object.freeze({ token: process.env.OPS_DASHBOARD_TOKEN || null }),

  db: Object.freeze({
    path: process.env.DB_PATH || null // resolved relative to project root by db.js if null
  }),

  chat: Object.freeze({
    maxMessageLength: toInt(process.env.MAX_MESSAGE_LENGTH, 4000),
    maxHistoryMessages: toInt(process.env.MAX_HISTORY_MESSAGES, 20),
    maxOutputTokens: toInt(process.env.MAX_OUTPUT_TOKENS, 900)
  }),

  rateLimit: Object.freeze({
    windowMs: toInt(process.env.RATE_LIMIT_WINDOW_MS, 60_000),
    max: toInt(process.env.RATE_LIMIT_MAX, 20) // requests per window per IP
  }),

  // Optional "keep learning" layer: if a search API key is configured,
  // Hoodwise can pull a handful of live web results for questions that look
  // time-sensitive (prices, "latest", "today", etc.) and fold them into
  // context for that one reply — on top of the static knowledge base, never
  // replacing it. Completely optional: with no key set, this silently
  // no-ops and Hoodwise behaves exactly as it did before (knowledge-base
  // only), so it can never become a hard dependency or a new failure point.
  search: Object.freeze({
    tavilyApiKey: process.env.TAVILY_API_KEY || null,
    enabled: Boolean(process.env.TAVILY_API_KEY),
    url: 'https://api.tavily.com/search',
    maxResults: toInt(process.env.SEARCH_MAX_RESULTS, 4),
    timeoutMs: toInt(process.env.SEARCH_TIMEOUT_MS, 6000)
  })
});

/**
 * Soft validation: warns loudly instead of crashing for optional-but-important
 * settings (like the OpenRouter key), since local development without a key
 * should still let you inspect the rest of the app. Anything genuinely
 * required for the process to function safely should throw instead.
 */
function validateConfig(log) {
  if (!config.openrouter.apiKey) {
    log.warn(
      'OPENROUTER_API_KEY is not set — /api/chat will return a 500 until ' +
      'this is set in your environment (.env locally, Railway Variables in production).'
    );
  }
  if (config.chat.maxMessageLength < 1) {
    throw new Error('MAX_MESSAGE_LENGTH must be a positive integer');
  }
  if (config.rateLimit.max < 1) {
    throw new Error('RATE_LIMIT_MAX must be a positive integer');
  }
  if (config.search.maxResults < 1 || config.search.maxResults > 6) {
    throw new Error('SEARCH_MAX_RESULTS must be between 1 and 6');
  }
  if (config.search.timeoutMs < 1000 || config.search.timeoutMs > 15000) {
    throw new Error('SEARCH_TIMEOUT_MS must be between 1000 and 15000');
  }
}

module.exports = { config, validateConfig };
