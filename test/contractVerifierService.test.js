const test = require('node:test');
const assert = require('node:assert/strict');
const { decodeString, decodeUint, decodeAddress, sourceCodeVerified } = require('../src/services/contractVerifierService');
test('decodes common read-only EVM values', () => {
  assert.equal(decodeUint('0x12'), 18);
  assert.equal(decodeAddress('0x0000000000000000000000001234567890123456789012345678901234567890'), '0x1234567890123456789012345678901234567890');
  assert.equal(decodeString('0x' + Buffer.from('NVDA'.padEnd(32, '\0')).toString('hex')), 'NVDA');
});
test('sourceCodeVerified distinguishes confirmed and unavailable explorer results', () => {
  assert.equal(sourceCodeVerified({ is_verified: true }), true);
  assert.equal(sourceCodeVerified({ is_verified: false }), false);
  assert.equal(sourceCodeVerified(null), false);
});