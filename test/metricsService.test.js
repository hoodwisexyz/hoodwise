const test = require('node:test');
const assert = require('node:assert/strict');
const metrics = require('../src/services/metricsService');
test('records aggregate chat and verifier metrics without prompt content', () => {
  const before = metrics.summary();
  metrics.recordRequest('/chat', 200, 120);
  metrics.recordRequest('/contracts/verify', 400, 8);
  metrics.record('qualityReviews');
  metrics.record('lowQualityReviews');
  const after = metrics.summary();
  assert.equal(after.counters.chatRequests, before.counters.chatRequests + 1);
  assert.equal(after.counters.verifierErrors, before.counters.verifierErrors + 1);
  assert.equal(after.counters.qualityReviews, before.counters.qualityReviews + 1);
  assert.equal(after.counters.lowQualityReviews, before.counters.lowQualityReviews + 1);
  assert.ok(after.averageChatLatencyMs >= 0);
});