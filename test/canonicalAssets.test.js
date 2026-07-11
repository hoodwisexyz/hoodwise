const test = require('node:test');
const assert = require('node:assert/strict');
const { getCanonicalAsset } = require('../src/data/canonicalAssets');
test('identifies canonical Robinhood Chain assets case-insensitively', () => {
  assert.deepEqual(getCanonicalAsset('0xd0601CE157Db5bdC3162BbaC2a2C8aF5320D9EEC'), { symbol: 'NVDA', type: 'Stock Token' });
  assert.equal(getCanonicalAsset('0x0000000000000000000000000000000000000000'), null);
});