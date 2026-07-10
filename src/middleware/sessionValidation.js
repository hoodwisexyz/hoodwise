const { BadRequestError } = require('../lib/errors');

const SESSION_ID_PATTERN = /^[a-zA-Z0-9-]{8,100}$/;

/** Requires a well-formed sessionId on the request (query for GET/DELETE,
 *  body for POST) and attaches it to req.sessionId for handlers to use. */
function requireSessionId(req, res, next) {
  const sessionId = req.query.sessionId || (req.body && req.body.sessionId);
  if (!sessionId || typeof sessionId !== 'string') {
    return next(new BadRequestError('sessionId is required'));
  }
  if (!SESSION_ID_PATTERN.test(sessionId)) {
    return next(new BadRequestError('sessionId is malformed'));
  }
  req.sessionId = sessionId;
  next();
}

module.exports = { requireSessionId };
