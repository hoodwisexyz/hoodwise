const test = require('node:test');
const assert = require('node:assert/strict');
const { reviewAnswer, shouldRepairAnswer, buildRepairPrompt } = require('../src/services/answerQualityService');

test('quality review accepts a direct, grounded research answer', () => {
  const result = reviewAnswer({
    question: 'What is the thesis behind this memecoin?',
    answer: 'Research snapshot: current liquidity is observable on the linked pool. Thesis / lore: the community frames it as a Robinhood Chain culture token. DYOR: verify the contract and liquidity.',
    sources: [{ title: 'Explorer', url: 'https://robinhoodchain.blockscout.com' }],
    usedLiveSearch: true
  });
  assert.equal(result.score, 100);
  assert.deepEqual(result.reasons, []);
  assert.equal(shouldRepairAnswer(result), false);
});

test('quality review flags raw URLs and internal disclosures without retaining content', () => {
  const result = reviewAnswer({ question: 'What is the model?', answer: 'The model uses OpenRouter at https://example.com.', sources: [] });
  assert.ok(result.reasons.includes('internal_leak'));
  assert.ok(result.reasons.includes('raw_url'));
  assert.equal(shouldRepairAnswer(result), true);
});

test('quality review repairs evasive launchpad research answers', () => {
  const result = reviewAnswer({
    question: 'coin apa yang bagus di noxa.fun?',
    answer: 'No specific token from noxa.fun can be named as good because the platform is undocumented. DYOR.',
    sources: [{ title: 'NOXA Fun', url: 'https://noxa.fun' }],
    usedLiveSearch: true
  });
  assert.ok(result.reasons.includes('evasive_research_answer'));
  assert.equal(shouldRepairAnswer(result), true);
});

test('repair prompt keeps user-facing constraints explicit', () => {
  const prompt = buildRepairPrompt({
    question: 'hoodwise token itu apa?',
    answer: 'Previous weak answer',
    sources: [{ title: 'Hoodwise token profile' }]
  });
  assert.match(prompt, /Answer directly/i);
  assert.match(prompt, /DYOR/i);
  assert.match(prompt, /Never expose model\/provider names/i);
  assert.match(prompt, /Do not put raw URLs/i);
  assert.match(prompt, /Hoodwise project token launched via Virtuals\.io/i);
});

test('quality review flags candidate answers that avoid shortlist shape', () => {
  const review = reviewAnswer({
    question: 'Which good memecoin should I research on noxa.fun?',
    answer: 'You should verify contracts and liquidity before doing anything. DYOR.',
    sources: [{ title: 'NOXA', url: 'https://www.noxa.fun/' }],
    usedLiveSearch: true
  });
  assert.ok(review.reasons.includes('missing_candidate_shape'));
  assert.equal(shouldRepairAnswer(review), true);
});

test('quality review accepts direct candidate shortlist with DYOR', () => {
  const review = reviewAnswer({
    question: 'Which good memecoin should I research on noxa.fun?',
    answer: 'Research shortlist: Cash Cat is a NOXA discovery candidate to research first because it is named in the current Hoodwise ecosystem context. What could invalidate it: wrong contract, weak liquidity, concentrated holders, or privileged controls. DYOR: verify the exact contract, pool liquidity, ownership controls, and current market conditions before interacting.',
    sources: [{ title: 'NOXA', url: 'https://www.noxa.fun/' }],
    usedLiveSearch: true
  });
  assert.deepEqual(review.reasons, []);
});
