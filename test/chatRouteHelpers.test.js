const test = require('node:test');
const assert = require('node:assert/strict');
const chatRouter = require('../src/routes/chat');

test('chat source merging uses the question as well as the answer', () => {
  const sources = chatRouter._test.mergeSources(
    'What is the canonical NVDA Stock Token contract?',
    'It is a tokenized debt security with economic exposure.',
    [],
    null
  );
  assert.ok(sources.some(source => source.url.includes('docs.robinhood.com/chain/contracts')));
});

test('chat briefing helper builds metadata without recursion', () => {
  const brief = chatRouter._test.buildBrief('Robinhood Chain uses ETH for gas.', [], [], null);
  assert.equal(brief.evidence, 'Curated source baseline');
});
test('chat source merging retains NOXA Fun for a direct launchpad question', () => {
  const sources = chatRouter._test.mergeSources('Tell me about noxa.fun', 'NOXA Fun is community-operated.', [], null);
  assert.ok(sources.some(source => source.url === 'https://www.noxa.fun/'));
});

test('NOXA candidate fallback supplies named discovery candidates when live search is empty', () => {
  const fallback = chatRouter._test.buildNoxaDiscoveryFallback('Just tell me a good coin from noxa.fun asap', []);
  assert.match(fallback.content, /Cash Cat \(CASHCAT\)/);
  assert.match(fallback.content, /not live market data/);
  assert.equal(chatRouter._test.buildNoxaDiscoveryFallback('Tell me about noxa.fun', []), null);
});