const express = require('express');
const router = express.Router();
const { requireOpsToken } = require('../middleware/opsAuth');
const metrics = require('../services/metricsService');
router.get('/ops/summary', requireOpsToken, (req, res) => res.json(metrics.summary()));
module.exports = router;