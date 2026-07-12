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

test('ecosystem fallback requires DYOR footer for launchpad candidate gaps', () => {
  const fallback = chatRouter._test.buildEcosystemDiscoveryFallback('Pick a hood.fun token to research on Robinhood Chain', []);
  assert.match(fallback.content, /hood\.fun \/ HoodFun/);
  assert.match(fallback.content, /End the answer with this exact compact footer: DYOR/);
});
test('chat helper builds candidate context from live launchpad results', () => {
  const message = chatRouter._test.buildCandidateContextFromResults([
    { title: 'NOXA trending', url: 'https://www.noxa.fun/', snippet: 'Cash Cat (CASHCAT) volume $18k.' }
  ]);
  assert.match(message.content, /LIVE CANDIDATE EXTRACTS/);
  assert.match(message.content, /Cash Cat \(CASHCAT\)/);
});
test('chat briefing preserves Hoodwise project context for contract cards', () => {
  const brief = chatRouter._test.buildBrief('Hoodwise contract context.', [], [], {
    address: '0x6bdb637a9e988835dc368ef72cb5d143540f037c',
    classification: 'erc20',
    canonical: null,
    sourceCodeVerified: false,
    sourceCodeVerificationAvailable: true,
    proxyType: null,
    tokenActivity: {},
    dexPools: [],
    explorerUrl: 'https://robinhoodchain.blockscout.com/address/0x6bdb637a9e988835dc368ef72cb5d143540f037c',
    projectContext: {
      name: 'Hoodwise',
      venue: 'Virtuals.io launchpad',
      framing: 'Hoodwise project contract supplied by the project owner'
    }
  });
  assert.equal(brief.onchainScan.projectContext.name, 'Hoodwise');
  assert.equal(brief.onchainScan.projectContext.venue, 'Virtuals.io launchpad');
});
test('chat source merging includes ecosystem directory sources for known surfaces', () => {
  const sources = chatRouter._test.mergeSources('Tell me about Bankr and Virtuals on Robinhood Chain', 'Bankr and Virtuals are ecosystem surfaces.', [], null);
  assert.ok(sources.some(source => source.url === 'https://docs.bankr.bot/faq/token-launching/'));
  assert.ok(sources.some(source => source.url.includes('virtuals.io')));
});

test('chat helper builds ecosystem directory context for broad launchpad questions', () => {
  const context = chatRouter._test.buildEcosystemDirectoryContext('What launchpads exist for Robinhood Chain memecoins?', []);
  assert.match(context.content, /NOXA Fun/);
  assert.match(context.content, /Bankr \/ Doppler/);
  assert.match(context.content, /hood\.fun \/ HoodFun/);
});