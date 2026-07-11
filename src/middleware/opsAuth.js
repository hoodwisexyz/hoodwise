const { config } = require('../config');
function requireOpsToken(req, res, next) {
  if (!config.ops.token) return res.status(404).json({ error: 'Not found' });
  if (req.get('x-ops-token') !== config.ops.token) return res.status(401).json({ error: 'Unauthorized' });
  next();
}
module.exports = { requireOpsToken };