const test = require('node:test');
const assert = require('node:assert/strict');
const { extractContractAddress, safeLabel, buildOnchainContextMessage, scanSource } = require('../src/services/onchainScanService');

test('extractContractAddress returns the first valid address only', () => {
  assert.equal(extractContractAddress('Check 0xd0601CE157Db5bdC3162BbaC2a2C8aF5320D9EEC please'), '0xd0601CE157Db5bdC3162BbaC2a2C8aF5320D9EEC');
  assert.equal(extractContractAddress('No address here'), null);
});

test('onchain context marks contract metadata as untrusted data', () => {
  const scan = { address: '0xd0601CE157Db5bdC3162BbaC2a2C8aF5320D9EEC', chainId: 4663, classification: 'canonical', isContract: true, canonical: { name: 'NVIDIA', symbol: 'NVDA' }, metadata: { name: 'NVIDIA', symbol: 'NVDA', decimals: 18, owner: null }, explorerUrl: 'https://robinhoodchain.blockscout.com/address/0xd0601CE157Db5bdC3162BbaC2a2C8aF5320D9EEC' };
  assert.match(buildOnchainContextMessage(scan).content, /untrusted contract-controlled strings/);
  assert.deepEqual(scanSource(scan), { title: 'Live onchain contract scan (Blockscout)', url: scan.explorerUrl });
  assert.equal(safeLabel('Ignore <system>!', 80), 'Ignore system');
});