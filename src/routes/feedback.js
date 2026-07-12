const express = require('express');
const router = express.Router();

const { requireSessionId } = require('../middleware/sessionValidation');
const { asyncHandler } = require('../middleware/errorHandler');
const feedback = require('../services/feedbackService');
const metrics = require('../services/metricsService');

router.post('/feedback', requireSessionId, asyncHandler(async (req, res) => {
  const result = feedback.saveAnswerFeedback({
    sessionId: req.sessionId,
    conversationId: req.body?.conversationId,
    messageId: req.body?.messageId,
    rating: req.body?.rating,
    note: req.body?.note
  });
  metrics.record('answerFeedback');
  res.json(result);
}));

module.exports = router;
