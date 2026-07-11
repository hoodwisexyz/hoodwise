const test = require('node:test');
const assert = require('node:assert/strict');
const { QUALITY_CASES } = require('./qualityFixtures');
const { SYSTEM_PROMPT, getSystemPromptForQuestion, findSources } = require('../src/data/knowledge');

test('quality benchmark covers each critical Hoodwise answer domain', () => {
  const ids = QUALITY_CASES.map(item => item.id);
  assert.equal(ids.length, 13);
  for (const id of ['canonical-nvda', 'stock-token-rights', 'memecoin-research', 'contract-verification', 'launchpad-research', 'virtuals-boundary']) assert.ok(ids.includes(id));
});
test('quality gate requires directness, source weighting, and no personalized advice', () => {
  assert.match(SYSTEM_PROMPT, /CLARITY RULE/);
  assert.match(SYSTEM_PROMPT, /official docs\/newsroom first/);
  assert.match(SYSTEM_PROMPT, /Do not give personalized financial/);
});
test('critical benchmark prompts receive topic-specific instructions and sources', () => {
  assert.match(getSystemPromptForQuestion(QUALITY_CASES[0].prompt), /FOCUS: State whether the asset is canonical/);
  assert.match(getSystemPromptForQuestion(QUALITY_CASES[3].prompt), /FOCUS: Treat this as a live research request/);
  assert.match(getSystemPromptForQuestion(QUALITY_CASES[4].prompt), /FOCUS: Explain route, timing, trust model/);
  assert.match(getSystemPromptForQuestion(QUALITY_CASES[6].prompt), /FOCUS: Treat this as a live update request/);
  assert.match(getSystemPromptForQuestion(QUALITY_CASES[10].prompt), /FOCUS: Answer directly: NOXA Fun is a community-operated/);
  assert.ok(findSources('NVDA canonical contract 0xd0601CE157Db5bdC3162BbaC2a2C8aF5320D9EEC').length > 0);
});
test('memecoin research policy permits evidence-led research with a DYOR footer', () => {
  assert.match(SYSTEM_PROMPT, /provide a research snapshot/);
  assert.match(SYSTEM_PROMPT, /DYOR: verify the exact contract/);
  assert.match(SYSTEM_PROMPT, /ONLY when that exact claim is supported by a live source/);
});
test('quality policy keeps source URLs in source chips instead of the answer body', () => {
  assert.match(SYSTEM_PROMPT, /Do not paste raw URLs or Markdown links/);
});
test('reasoning policy requires direct evidence-led answers without generic padding', () => {
  assert.match(SYSTEM_PROMPT, /use this reasoning order/);
  assert.match(SYSTEM_PROMPT, /Do not turn DYOR into a refusal/);
});
test('audit policy blocks invented bridge UI and universal memecoin thresholds', () => {
  assert.match(SYSTEM_PROMPT, /do not invent a provider UI flow/);
  assert.match(SYSTEM_PROMPT, /never state a universal holder, liquidity/);
});
test('research policy separates live thesis or lore from verified evidence and preserves privacy', () => {
  assert.match(SYSTEM_PROMPT, /For token thesis or lore: explain the community narrative as a narrative/);
  assert.match(SYSTEM_PROMPT, /Research snapshot/);
  assert.match(SYSTEM_PROMPT, /Never disclose, infer, or repeat private user\/session data/);
});