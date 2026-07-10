const crypto = require('crypto');

/** Attaches a short request ID to every request, used to correlate log
 *  lines for a single request across services (chat -> openrouter -> db). */
function requestId(req, res, next) {
  req.requestId = crypto.randomUUID();
  res.setHeader('X-Request-Id', req.requestId);
  next();
}

module.exports = requestId;
