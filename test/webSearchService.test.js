const test = require('node:test');
const assert = require('node:assert/strict');
const { looksTimeSensitive, searchWeb } = require('../src/services/webSearchService');

test('looksTimeSensitive detects freshness keywords', () => {
  assert.equal(looksTimeSensitive('whats the latest news on robinhood chain'), true);
  assert.equal(looksTimeSensitive('what is trending right now'), true);
  assert.equal(looksTimeSensitive('is there a new launchpad'), true);
  assert.equal(looksTimeSensitive("what's the price today"), true);
});

test('looksTimeSensitive returns false for stable/structural questions', () => {
  assert.equal(looksTimeSensitive('what is a stock token'), false);
  assert.equal(looksTimeSensitive('how does robinhood earn work'), false);
  assert.equal(looksTimeSensitive('explain the ai agentic layer'), false);
});

test('searchWeb is a graceful no-op when no API key is configured', async () => {
  // TAVILY_API_KEY is unset in the test environment by default, so this
  // must never throw and must never attempt a real network call.
  const result = await searchWeb('latest robinhood chain news');
  assert.deepEqual(result, { results: [], attempted: false });
});

test('looksTimeSensitive detects current availability questions', () => {
  assert.equal(looksTimeSensitive('Is Robinhood Earn currently available?'), true);
  assert.equal(looksTimeSensitive('Is the bridge live now?'), true);
});
test('looksTimeSensitive detects memecoin and onchain verification questions', () => {
  assert.equal(looksTimeSensitive('What is the latest memecoin on Robinhood Chain?'), true);
  assert.equal(looksTimeSensitive('Can you check this token address?'), true);
  assert.equal(looksTimeSensitive('what is a stock token'), false);
});
test('isTrustedSearchUrl excludes low-signal sources from live context', () => {
  const { isTrustedSearchUrl } = require('../src/services/webSearchService');
  assert.equal(isTrustedSearchUrl('https://docs.robinhood.com/chain/'), true);
  assert.equal(isTrustedSearchUrl('https://www.youtube.com/watch?v=test'), false);
  assert.equal(isTrustedSearchUrl('not a url'), false);
});
test('isTrustedSearchUrl admits DEX research sources for memecoin snapshots', () => {
  const { isTrustedSearchUrl } = require('../src/services/webSearchService');
  assert.equal(isTrustedSearchUrl('https://dexscreener.com/robinhood-chain/example'), true);
  assert.equal(isTrustedSearchUrl('https://www.geckoterminal.com/robinhood-chain/pools/example'), true);
});