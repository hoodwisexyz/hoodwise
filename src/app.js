const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');

const logger = require('./lib/logger');
const requestId = require('./middleware/requestId');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');

const healthRoutes = require('./routes/health');
const conversationRoutes = require('./routes/conversations');
const chatRoutes = require('./routes/chat');

function createApp() {
  const app = express();

  // Railway (and most PaaS hosts) sit behind a reverse proxy. Without this,
  // req.ip resolves to the proxy's IP for every request, which would make
  // the rate limiter treat all visitors as a single client. `1` trusts
  // exactly one hop (the platform's own proxy) — safe here since nothing
  // else sits in front of it.
  app.set('trust proxy', 1);

  // Security headers. CSP is relaxed just enough for Google Fonts + inline
  // <style>/<script> blocks used in the static frontend; tighten further if
  // you move to a build step with hashed/nonced assets.
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
        fontSrc: ["'self'", 'https://fonts.gstatic.com'],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", 'data:'],
        connectSrc: ["'self'"]
      }
    }
  }));
  app.use(cors());
  app.use(express.json({ limit: '1mb' }));
  app.use(requestId);

  // Lightweight request logging — one line per request, structured.
  app.use((req, res, next) => {
    const startedAt = process.hrtime.bigint();
    res.on('finish', () => {
      const durationMs = Number(process.hrtime.bigint() - startedAt) / 1e6;
      logger.info('request', {
        requestId: req.requestId,
        method: req.method,
        path: req.path,
        status: res.statusCode,
        durationMs: Math.round(durationMs)
      });
    });
    next();
  });

  const publicDir = path.join(__dirname, '..', 'public');

  // Canonical public routes keep the product URLs clean. The legacy .html
  // URLs remain safe bookmarks, but redirect to their semantic counterparts.
  app.get('/index.html', (req, res) => res.redirect(308, '/'));
  app.get('/app.html', (req, res) => res.redirect(308, '/app'));
  app.get(['/app', '/app/', '/app/c/:conversationId'], (req, res) => {
    res.sendFile(path.join(publicDir, 'app.html'));
  });

  app.use(express.static(publicDir));

  app.use('/api', healthRoutes);
  app.use('/api', conversationRoutes);
  app.use('/api', chatRoutes);

  app.use('/api', notFoundHandler);
  app.use(errorHandler);

  return app;
}

module.exports = { createApp };
