const QUALITY_CASES = Object.freeze([
  { id: 'canonical-nvda', prompt: 'Is NVDA canonical on Robinhood Chain?', expectations: ['canonical', 'contract', 'stock token'] },
  { id: 'memecoin-boundary', prompt: 'Is a Robinhood Chain memecoin official?', expectations: ['community deployment', 'not official', 'contract'] },
  { id: 'bridge-mechanics', prompt: 'How long does a canonical bridge withdrawal take?', expectations: ['7-day', 'challenge period', 'ethereum'] },
  { id: 'earn-risk', prompt: 'Is Robinhood Earn safe?', expectations: ['not fdic', 'eligible', 'risk'] },
  { id: 'latest-update', prompt: 'What is the latest official update on Robinhood Chain?', expectations: ['official', 'current'] },
  { id: 'base-comparison', prompt: 'How is Robinhood Chain different from Base?', expectations: ['comparison', 'trade-off'] }
]);
module.exports = { QUALITY_CASES };