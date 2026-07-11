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
test('ecosystem fallback recognizes Bankr as a Robinhood Chain launch surface', () => {
  const fallback = chatRouter._test.buildEcosystemDiscoveryFallback('What is a good coin from Bankr on Robinhood Chain?', []);
  assert.match(fallback.content, /Bankr \/ Doppler/);
  assert.match(fallback.content, /token launches on Robinhood Chain through Doppler/);
  assert.match(fallback.content, /do not describe the platform as unknown/);
});

test('ecosystem fallback keeps Virtuals research direct without inventing candidates', () => {
  const fallback = chatRouter._test.buildEcosystemDiscoveryFallback('Any hot Virtuals coin on Robinhood Chain?', []);
  assert.match(fallback.content, /Virtuals is an agent-token ecosystem/);
  assert.match(fallback.content, /do not call the topic unknown/);
  assert.match(fallback.content, /Never fabricate a ticker/);
});