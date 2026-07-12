const test = require('node:test');
const assert = require('node:assert/strict');
const {
  ECOSYSTEM_ENTRIES,
  matchingEntries,
  buildEcosystemDirectoryContext,
  ecosystemDirectorySources,
  ecosystemDirectorySummary,
  isCandidateQuestion
} = require('../src/services/ecosystemDirectoryService');

test('ecosystem directory matches named launchpad surfaces', () => {
  assert.equal(matchingEntries('Tell me about noxa.fun')[0].name, 'NOXA Fun');
  assert.equal(matchingEntries('Any Virtuals coin on Robinhood Chain?')[0].name, 'Virtuals Protocol');
  assert.equal(matchingEntries('Research Bankr Doppler launches')[0].name, 'Bankr / Doppler');
});

test('ecosystem directory entries carry granular intelligence fields', () => {
  const noxa = ECOSYSTEM_ENTRIES.find(entry => entry.id === 'noxa');
  const bankr = ECOSYSTEM_ENTRIES.find(entry => entry.id === 'bankr');
  const virtuals = ECOSYSTEM_ENTRIES.find(entry => entry.id === 'virtuals');
  assert.equal(noxa.category, 'launchpad_trading');
  assert.match(noxa.chainSupport, /launch\/trade\/earn/i);
  assert.match(noxa.candidatePolicy, /research starting points/i);
  assert.ok(noxa.userIntents.includes('track trending/new/highest-MCap views'));
  assert.match(bankr.chainSupport, /on robinhood/i);
  assert.match(bankr.answerHints.join(' '), /anti-snipe/i);
  assert.match(virtuals.candidatePolicy, /address\/project/i);
});

test('ecosystem directory expands broad launchpad research questions', () => {
  const entries = matchingEntries('What launchpads exist for Robinhood Chain memecoins?');
  assert.ok(entries.some(entry => entry.name === 'NOXA Fun'));
  assert.ok(entries.some(entry => entry.name === 'Bankr / Doppler'));
  assert.ok(entries.some(entry => entry.name === 'hood.fun / HoodFun'));
  assert.ok(entries.some(entry => entry.name === 'Uniswap / DEX liquidity'));
});

test('ecosystem directory adds verification workflow for risk or candidate questions', () => {
  const entries = matchingEntries('Pick a good NOXA coin and check liquidity risk');
  assert.ok(entries.some(entry => entry.id === 'noxa'));
  assert.ok(entries.some(entry => entry.id === 'verification'));
});

test('ecosystem directory context prevents unknown-platform answers', () => {
  const context = buildEcosystemDirectoryContext('Pick a good coin from a Robinhood Chain launchpad', []);
  assert.match(context.content, /ROBINHOOD CHAIN ECOSYSTEM DIRECTORY/);
  assert.match(context.content, /candidatePolicy=/);
  assert.match(context.content, /answerHints=/);
  assert.match(context.content, /Do not say these known surfaces are unknown or undocumented/);
  assert.match(context.content, /DYOR: verify the exact contract/);
});

test('ecosystem directory distinguishes candidate mode from platform mode', () => {
  assert.equal(isCandidateQuestion('coin apa yang bagus di noxa.fun?'), true);
  assert.equal(isCandidateQuestion('Tell me about NOXA Fun'), false);
  const candidate = buildEcosystemDirectoryContext('coin apa yang bagus di noxa.fun?', []);
  const platform = buildEcosystemDirectoryContext('Tell me about NOXA Fun', []);
  assert.match(candidate.content, /The user is asking for candidates\/recommendations/);
  assert.match(platform.content, /The user is asking for platform\/ecosystem context/);
});

test('ecosystem directory sources expose public URLs only', () => {
  const sources = ecosystemDirectorySources('Tell me about noxa.fun and Virtuals');
  assert.ok(sources.some(source => source.url === 'https://www.noxa.fun/'));
  assert.ok(sources.some(source => source.url.includes('virtuals.io')));
  assert.ok(sources.every(source => source.url.startsWith('https://')));
  assert.ok(sources.length <= 4);
});

test('ecosystem directory summary exposes stable metadata without prompt content', () => {
  const summary = ecosystemDirectorySummary();
  assert.equal(summary.noxa.category, 'launchpad_trading');
  assert.equal(summary.bankr.name, 'Bankr / Doppler');
  assert.deepEqual(Object.keys(summary.verification).sort(), ['category', 'evidenceLevel', 'examples', 'name', 'snapshot', 'status']);
});

test('ecosystem snapshots are included in model context', () => {
  const context = buildEcosystemDirectoryContext('Give me a Robinhood Chain launchpad research shortlist', []);
  assert.match(context.content, /snapshot=/);
  assert.match(context.content, /watch=/);
  assert.match(context.content, /confidence=/);
  const summary = ecosystemDirectorySummary();
  assert.match(summary.noxa.snapshot.thesis, /community-token discovery/i);
  assert.ok(summary.cashcat.snapshot.watchlist.includes('exact CASHCAT contract'));
});
