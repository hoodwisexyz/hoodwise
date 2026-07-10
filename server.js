/**
 * Entry point. Kept intentionally thin: load + validate config, build the
 * Express app, start listening, and wire up graceful shutdown. All actual
 * behavior lives in src/ — this file should rarely need to change.
 */
const { config, validateConfig } = require('./src/config');
const logger = require('./src/lib/logger');

validateConfig(logger);

const { createApp } = require('./src/app');
const { closeDb } = require('./src/data/db');

const app = createApp();

const server = app.listen(config.port, () => {
  logger.info('hoodwise listening', { port: config.port, nodeEnv: config.nodeEnv });
});

function shutdown(signal) {
  logger.info('shutdown signal received', { signal });
  server.close((err) => {
    if (err) {
      logger.error('error during server close', { error: err.message });
      process.exitCode = 1;
    }
    closeDb();
    process.exit();
  });
  // Force-exit if connections don't drain in time (defensive — should be rare).
  setTimeout(() => {
    logger.warn('forcing shutdown after timeout');
    process.exit(1);
  }, 10_000).unref();
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

process.on('unhandledRejection', (reason) => {
  logger.error('unhandled promise rejection', { error: reason instanceof Error ? reason.message : String(reason) });
});
process.on('uncaughtException', (err) => {
  logger.error('uncaught exception — exiting', { error: err.message, stack: err.stack });
  process.exit(1);
});
