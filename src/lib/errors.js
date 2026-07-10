/**
 * Typed errors carry an HTTP status and a `expose` flag: expose=true means
 * the message is safe to send straight to the client (e.g. "message is
 * required"). expose=false (the default for unexpected errors) means the
 * central error handler logs the real error server-side but returns a
 * generic message to the client — so we never accidentally leak internals
 * (stack traces, provider errors, DB details) in a response body.
 */
class HttpError extends Error {
  constructor(status, message, { expose = true, cause } = {}) {
    super(message);
    this.name = 'HttpError';
    this.status = status;
    this.expose = expose;
    if (cause) this.cause = cause;
  }
}

class BadRequestError extends HttpError {
  constructor(message = 'Bad request') { super(400, message); }
}
class NotFoundError extends HttpError {
  constructor(message = 'Not found') { super(404, message); }
}
class TooManyRequestsError extends HttpError {
  constructor(message = 'Too many requests, please slow down.') { super(429, message); }
}
class UpstreamServiceError extends HttpError {
  constructor(message = 'Upstream service error', cause) {
    super(502, message, { expose: true, cause });
  }
}
class InternalError extends HttpError {
  constructor(message = 'Something went wrong on the server.', cause) {
    super(500, message, { expose: false, cause });
  }
}

module.exports = {
  HttpError,
  BadRequestError,
  NotFoundError,
  TooManyRequestsError,
  UpstreamServiceError,
  InternalError
};
