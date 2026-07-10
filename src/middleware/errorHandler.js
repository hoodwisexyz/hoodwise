const logger = require('../lib/logger');
const { HttpError } = require('../lib/errors');

/** Wraps an async route handler so thrown/rejected errors reach the error
 *  handler below instead of crashing the process or hanging the request. */
function asyncHandler(fn) {
  return (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
}

/** Express error-handling middleware — must be registered last, with 4 args. */
// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  const isHttpError = err instanceof HttpError;
  const status = isHttpError ? err.status : 500;
  const expose = isHttpError ? err.expose : false;

  logger.error('request failed', {
    requestId: req.requestId,
    path: req.path,
    method: req.method,
    status,
    error: err.message,
    stack: err.stack
  });

  res.status(status).json({
    error: expose ? err.message : 'Something went wrong on the server. Please try again.',
    requestId: req.requestId
  });
}

function notFoundHandler(req, res) {
  res.status(404).json({ error: 'Not found', requestId: req.requestId });
}

module.exports = { asyncHandler, errorHandler, notFoundHandler };
