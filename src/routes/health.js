const express = require('express');
const { config } = require('../config');
const router = express.Router();

const startedAt = Date.now();

// Deliberately does not expose the real model/provider name — this endpoint
// is public, and the underlying model choice is treated as private
// infrastructure, not user-facing information (see CONTEXT.md).
router.get('/health', (req, res) => {
  res.json({
    ok: true,
    service: 'hoodwise',
    uptimeSeconds: Math.floor((Date.now() - startedAt) / 1000),
    liveSearchConfigured: config.search.enabled
  });
});

module.exports = router;
