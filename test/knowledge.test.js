const test = require('node:test');
const assert = require('node:assert/strict');
const { sanitizeReply, findSources, createStreamingSanitizer } = require('../src/data/knowledge');

test('sanitizeReply scrubs DeepSeek mentions', () => {
  const input = 'I am powered by DeepSeek V4 Flash via OpenRouter.';
  const output = sanitizeReply(input);
  assert.doesNotMatch(output, /deepseek/i);
  assert.doesNotMatch(output, /openrouter/i);
});

test('sanitizeReply leaves unrelated text untouched', () => {
  const input = 'Robinhood Chain settles to Ethereum and uses Arbitrum Orbit.';
  assert.equal(sanitizeReply(input), input);
});

test('sanitizeReply is case-insensitive', () => {
  const input = 'DEEPSEEK and deepseek and DeepSeek should all be caught.';
  const output = sanitizeReply(input);
  assert.doesNotMatch(output, /deepseek/i);
});

test('findSources matches memecoin-related keywords', () => {
  const sources = findSources('The memecoin scene includes CASHCAT and NOXA launchpad activity.');
  assert.ok(sources.length > 0, 'expected at least one matched source');
  assert.ok(sources.length <= 3, 'should never return more than 3 sources');
});

test('findSources returns nothing for unrelated text', () => {
  const sources = findSources('This sentence has nothing to do with any known topic keyword.');
  assert.deepEqual(sources, []);
});

test('findSources never returns duplicate URLs', () => {
  const sources = findSources('stock token stock token rwa rwa tokenized tokenized');
  const urls = sources.map(s => s.url);
  assert.equal(new Set(urls).size, urls.length);
});

test('streaming sanitizer: reassembles output identical to non-streaming sanitizeReply', () => {
  const fullText = 'Robinhood Chain settles to Ethereum. I am powered by DeepSeek V4 Flash via OpenRouter, by the way.';
  const sanitizer = createStreamingSanitizer();
  // Feed in small, arbitrary chunks (as a real token stream would arrive).
  let streamedOutput = '';
  for (let i = 0; i < fullText.length; i += 3) {
    streamedOutput += sanitizer.push(fullText.slice(i, i + 3));
  }
  streamedOutput += sanitizer.flush();
  assert.equal(streamedOutput, sanitizeReply(fullText));
  assert.doesNotMatch(streamedOutput, /deepseek/i);
});

test('streaming sanitizer: catches "DeepSeek" even when split exactly across two chunks', () => {
  const sanitizer = createStreamingSanitizer();
  let out = '';
  // Deliberately split the word itself across the chunk boundary.
  out += sanitizer.push('padding text so the buffer has content before Deep');
  out += sanitizer.push('Seek V4 Flash arrives right here.');
  out += sanitizer.flush();
  assert.doesNotMatch(out, /deepseek/i);
});

test('streaming sanitizer: catches a two-word phrase even when the chunk boundary lands exactly on the space between the words', () => {
  const sanitizer = createStreamingSanitizer();
  let out = '';
  // "open" ends exactly at this chunk boundary, "router" starts the next.
  out += sanitizer.push('This service runs on open');
  out += sanitizer.push(' router infrastructure behind the scenes.');
  out += sanitizer.flush();
  assert.doesNotMatch(out, /open\s*router/i);
});

test('streaming sanitizer: never emits more than it was given (no data loss)', () => {
  const fullText = 'This is a perfectly ordinary sentence about Robinhood Chain with no identity leaks in it at all.';
  const sanitizer = createStreamingSanitizer();
  let out = '';
  for (let i = 0; i < fullText.length; i += 5) {
    out += sanitizer.push(fullText.slice(i, i + 5));
  }
  out += sanitizer.flush();
  assert.equal(out, fullText);
});

test('findSources returns official documentation for developer network answers', () => {
  const sources = findSources('Use chain ID 4663 and a production RPC when deploying with Hardhat.');
  assert.ok(sources.some(source => source.url.includes('docs.robinhood.com/chain/connecting')));
});
test('findSources returns official token-contract documentation for canonical assets', () => {
  const sources = findSources('The canonical NVDA Stock Token and WETH addresses on Robinhood Chain.');
  assert.ok(sources.some(source => source.url.includes('docs.robinhood.com/chain/contracts')));
});
test('getSystemPromptForQuestion adds a relevant focus without mutating the baseline', () => {
  const { getSystemPromptForQuestion } = require('../src/data/knowledge');
  assert.match(getSystemPromptForQuestion('Is NVDA canonical?'), /FOCUS: State whether the asset is canonical/);
  assert.match(getSystemPromptForQuestion('How does the bridge work?'), /FOCUS: Explain route, timing, trust model/);
});
test('findSources prioritizes official contract docs for canonical asset answers', () => {
  const sources = findSources('NVDA is canonical at 0xd0601CE157Db5bdC3162BbaC2a2C8aF5320D9EEC.');
  assert.equal(sources[0].url, 'https://docs.robinhood.com/chain/contracts/');
});
test('getSystemPromptForQuestion gives live memecoin research a direct evidence-oriented focus', () => {
  const { getSystemPromptForQuestion } = require('../src/data/knowledge');
  const prompt = getSystemPromptForQuestion('What memecoin is trending on Robinhood Chain today?');
  assert.match(prompt, /Treat this as a live research request/);
  assert.match(prompt, /confirmed \(primary\/onchain evidence\), observed \(current market or listing evidence\), and unverified/);
});