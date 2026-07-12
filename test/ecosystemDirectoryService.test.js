const test = require('node:test');
const assert = require('node:assert/strict');
const { matchingEntries, buildEcosystemDirectoryContext, ecosystemDirectorySources } = require('../src/services/ecosystemDirectoryService');

test('ecosystem directory matches named launchpad surfaces', () => {
  assert.equal(matchingEntries('Tell me about noxa.fun')[0].name, 'NOXA Fun');
  assert.equal(matchingEntries('Any Virtuals coin on Robinhood Chain?')[0].name, 'Virtuals Protocol');
  assert.equal(matchingEntries('Research Bankr Doppler launches')[0].name, 'Bankr / Doppler');
});

test('ecosystem directory expands broad launchpad research questions', () => {
  const entries = matchingEntries('What launchpads exist for Robinhood Chain memecoins?');
  assert.ok(entries.some(entry => entry.name === 'NOXA Fun'));
  assert.ok(entries.some(entry => entry.name === 'Bankr / Doppler'));
  assert.ok(entries.some(entry => entry.name === 'hood.fun / HoodFun'));
});

test('ecosystem directory context prevents unknown-platform answers', () => {
  const context = buildEcosystemDirectoryContext('Pick a good coin from a Robinhood Chain launchpad', []);
  assert.match(context.content, /ROBINHOOD CHAIN ECOSYSTEM DIRECTORY/);
  assert.match(context.content, /Do not say these known surfaces are unknown or undocumented/);
  assert.match(context.content, /DYOR: verify the exact contract/);
});

test('ecosystem directory sources expose public URLs only', () => {
  const sources = ecosystemDirectorySources('Tell me about noxa.fun and Virtuals');
  assert.ok(sources.some(source => source.url === 'https://www.noxa.fun/'));
  assert.ok(sources.some(source => source.url.includes('virtuals.io')));
  assert.ok(sources.every(source => source.url.startsWith('https://')));
});