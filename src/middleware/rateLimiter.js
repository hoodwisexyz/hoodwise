const rateLimit = require('express-rate-limit');
const { config } = require('../config');
const { TooManyRequestsError } = require('../lib/errors');

/**
 * Keyed by sessionId when the client sent one (our normal case), falling
 * back to IP address so a request with no session can't bypass the limit
 * entirely. This protects the OpenRouter bill from a single runaway client
 * without requiring accounts/auth.
 */
const chatRateLimiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  limit: config.rateLimit.max,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => (req.body && req.body.sessionId) || req.ip,
  handler: (req, res, next) => {
    next(new TooManyRequestsError(
      `You're sending messages faster than Hoodwise can keep up — please wait a moment and try again.`
    ));
  }
});

module.exports = { chatRateLimiter };
