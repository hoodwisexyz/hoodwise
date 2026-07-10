/**
 * Minimal structured logger. Deliberately dependency-free (no pino/winston)
 * to keep the deploy surface small — Railway logs stdout directly, and JSON
 * lines are trivially greppable/parseable there or in any log aggregator
 * you point at it later.
 *
 * Usage: logger.info('message', { requestId, userId, ... })
 */

const LEVELS = ['debug', 'info', 'warn', 'error'];

function log(level, message, meta = {}) {
  const entry = {
    level,
    message,
    time: new Date().toISOString(),
    ...meta
  };
  const line = JSON.stringify(entry);
  if (level === 'error' || level === 'warn') {
    process.stderr.write(line + '\n');
  } else {
    process.stdout.write(line + '\n');
  }
}

const logger = {};
for (const level of LEVELS) {
  logger[level] = (message, meta) => log(level, message, meta);
}

module.exports = logger;
