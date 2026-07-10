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
