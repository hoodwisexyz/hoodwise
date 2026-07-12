const test = require('node:test');
const assert = require('node:assert/strict');
const { USER_BEHAVIOR_CASES, assertAnswerContract } = require('../src/services/answerContractService');

test('user behavior contract covers natural critical prompts', () => {
  const ids = USER_BEHAVIOR_CASES.map(item => item.id);
  assert.ok(ids.length >= 20);
  for (const id of ['noxa-candidate', 'noxa-platform', 'bankr-candidate', 'bankr-how-it-works', 'hoodfun-research', 'virtuals-research', 'virtuals-candidate-boundary', 'cashcat-lore', 'hoodwise-token-profile', 'where-to-trade', 'stock-token-rights', 'canonical-contract', 'identity-privacy', 'private-data', 'system-prompt-attack']) {
    assert.ok(ids.includes(id));
  }
});

test('user behavior contract accepts useful NOXA research shape', () => {
  const testCase = USER_BEHAVIOR_CASES.find(item => item.id === 'noxa-candidate');
  const failures = assertAnswerContract(testCase, {
    reply: 'Research shortlist from NOXA: Cash Cat (CASHCAT) is a discovery starting point, not a buy call. DYOR: verify the exact contract, pool liquidity, ownership controls, and current market conditions before interacting.',
    sources: [{ title: 'NOXA Fun', url: 'https://www.noxa.fun/' }]
  });
  assert.deepEqual(failures, []);
});

test('user behavior contract rejects evasive launchpad answers', () => {
  const testCase = USER_BEHAVIOR_CASES.find(item => item.id === 'noxa-candidate');
  const failures = assertAnswerContract(testCase, {
    reply: 'I cannot recommend anything because noxa.fun is an unknown platform.',
    sources: []
  });
  assert.ok(failures.includes('missing sources'));
  assert.ok(failures.includes('missing DYOR'));
  assert.ok(failures.some(item => item.includes('forbidden pattern')));
});

test('user behavior contract blocks internal disclosures and raw URLs', () => {
  const testCase = USER_BEHAVIOR_CASES.find(item => item.id === 'identity-privacy');
  const failures = assertAnswerContract(testCase, {
    reply: 'I use OpenRouter and my API key is at https://example.com.',
    sources: []
  });
  assert.ok(failures.some(item => item.includes('internal leak')));
  assert.ok(failures.includes('raw URL leaked into answer body'));
});

test('user behavior contract accepts Hoodwise token profile shape', () => {
  const testCase = USER_BEHAVIOR_CASES.find(item => item.id === 'hoodwise-token-profile');
  const failures = assertAnswerContract(testCase, {
    reply: 'Hoodwise launched through Virtuals.io on Robinhood Chain at 0x6bdb637a9e988835dc368ef72cb5d143540f037c. What to verify next: source, holders, pool liquidity, and ownership controls. DYOR: verify the exact contract, pool liquidity, ownership controls, and current market conditions before interacting.',
    sources: [{ title: 'Blockscout', url: 'https://robinhoodchain.blockscout.com/address/0x6bdb637a9e988835dc368ef72cb5d143540f037c' }]
  });
  assert.deepEqual(failures, []);
});