const test = require('node:test');
const assert = require('node:assert/strict');
const { extractCandidatesFromResults, buildCandidateContextMessage, detectVenue } = require('../src/services/candidateExtractorService');

test('detectVenue identifies known Robinhood Chain launchpad surfaces', () => {
  assert.equal(detectVenue({ url: 'https://www.noxa.fun/', title: 'NOXA Fun', snippet: '' }), 'NOXA Fun');
  assert.equal(detectVenue({ url: 'https://hood.fun/', title: 'Tokens', snippet: '' }), 'hood.fun / HoodFun');
  assert.equal(detectVenue({ url: 'https://docs.bankr.bot/faq/token-launching/', title: 'Doppler', snippet: '' }), 'Bankr / Doppler');
  assert.equal(detectVenue({ url: 'https://app.virtuals.io/', title: 'Virtuals', snippet: '' }), 'Virtuals');
});

test('extractCandidatesFromResults extracts name/ticker pairs and metrics', () => {
  const candidates = extractCandidatesFromResults([
    {
      title: 'NOXA Fun trending tokens',
      url: 'https://www.noxa.fun/',
      snippet: 'Trending tokens include Cash Cat (CASHCAT). 24H volume $18k. Highest mcap $120k.'
    }
  ]);
  assert.equal(candidates.length, 1);
  assert.equal(candidates[0].name, 'Cash Cat');
  assert.equal(candidates[0].ticker, 'CASHCAT');
  assert.equal(candidates[0].venue, 'NOXA Fun');
  assert.ok(candidates[0].metrics.some(metric => /volume/i.test(metric)));
});

test('extractCandidatesFromResults extracts DEX pair tickers without treating WETH as a candidate', () => {
  const candidates = extractCandidatesFromResults([
    {
      title: 'DOGINHOOD / WETH pair on Robinhood Chain',
      url: 'https://dexscreener.com/robinhood-chain/example',
      snippet: 'Liquidity $22k, holders 310, volume 24h $9k.'
    }
  ]);
  assert.equal(candidates.length, 1);
  assert.equal(candidates[0].ticker, 'DOGINHOOD');
  assert.equal(candidates[0].venue, 'DEX Screener');
});

test('extractCandidatesFromResults keeps contract-only evidence when no ticker is visible', () => {
  const candidates = extractCandidatesFromResults([
    {
      title: 'Token contract on Blockscout',
      url: 'https://robinhoodchain.blockscout.com/token/0x0000000000000000000000000000000000004663',
      snippet: 'Contract 0x0000000000000000000000000000000000004663 is indexed on chain 4663.'
    }
  ]);
  assert.equal(candidates.length, 1);
  assert.deepEqual(candidates[0].contracts, ['0x0000000000000000000000000000000000004663']);
});

test('buildCandidateContextMessage creates evidence-bound instructions', () => {
  const [candidate] = extractCandidatesFromResults([
    { title: 'hood.fun tokens', url: 'https://hood.fun/', snippet: 'Dog In Hood (DOGINHOOD) liquidity $22k.' }
  ]);
  const message = buildCandidateContextMessage([candidate]);
  assert.equal(message.role, 'system');
  assert.match(message.content, /LIVE CANDIDATE EXTRACTS/);
  assert.match(message.content, /Candidate \/ venue \/ observed evidence \/ missing verification \/ DYOR/);
  assert.match(message.content, /Do not invent missing contracts/);
});