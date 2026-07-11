const test = require('node:test');
const assert = require('node:assert/strict');
const { buildBriefingMeta } = require('../src/services/briefingService');

test('buildBriefingMeta extracts contracts and material verification flags', () => {
  const brief = buildBriefingMeta('NVDA is 0xd0601CE157Db5bdC3162BbaC2a2C8aF5320D9EEC, but liquidity and jurisdiction matter.', [{ title: 'Docs', url: 'https://example.com' }], false);
  assert.equal(brief.evidence, 'Curated source baseline');
  assert.deepEqual(brief.contracts, ['0xd0601CE157Db5bdC3162BbaC2a2C8aF5320D9EEC']);
  assert.ok(brief.risks.length > 0);
});