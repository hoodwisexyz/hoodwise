const test = require('node:test');
const assert = require('node:assert/strict');
const { reviewAnswer } = require('../src/services/answerQualityService');

test('quality review accepts a direct, grounded research answer', () => {
  const result = reviewAnswer({
    question: 'What is the thesis behind this memecoin?',
    answer: 'Research snapshot: current liquidity is observable on the linked pool. Thesis / lore: the community frames it as a Robinhood Chain culture token. DYOR: verify the contract and liquidity.',
    sources: [{ title: 'Explorer', url: 'https://robinhoodchain.blockscout.com' }],
    usedLiveSearch: true
  });
  assert.equal(result.score, 100);
  assert.deepEqual(result.reasons, []);
});

test('quality review flags raw URLs and internal disclosures without retaining content', () => {
  const result = reviewAnswer({ question: 'What is the model?', answer: 'The model uses OpenRouter at https://example.com.', sources: [] });
  assert.ok(result.reasons.includes('internal_leak'));
  assert.ok(result.reasons.includes('raw_url'));
});