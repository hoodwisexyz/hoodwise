const express = require('express');
const router = express.Router();
const { requireOpsToken } = require('../middleware/opsAuth');
const metrics = require('../services/metricsService');
const { feedbackSummary } = require('../services/feedbackService');
router.get('/ops/summary', requireOpsToken, (req, res) => res.json({ ...metrics.summary(), feedback: feedbackSummary() }));
module.exports = router;