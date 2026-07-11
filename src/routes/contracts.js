const express = require('express');
const router = express.Router();
const { requireSessionId } = require('../middleware/sessionValidation');
const { asyncHandler } = require('../middleware/errorHandler');
const { chatRateLimiter } = require('../middleware/rateLimiter');
const { verifyContract } = require('../services/contractVerifierService');
router.post('/contracts/verify', chatRateLimiter, requireSessionId, asyncHandler(async (req, res) => {
  const result = await verifyContract(req.body && req.body.address);
  res.json(result);
}));
module.exports = router;