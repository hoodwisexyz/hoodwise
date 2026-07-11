const INTERNAL_LEAK_PATTERN = /\b(openrouter|deepseek|system prompt|api[_ -]?key|private key|session id|database path|railway)\b/i;
const RAW_URL_PATTERN = /https?:\/\//i;
const RESEARCH_PATTERN = /\b(memecoin|meme coin|launchpad|noxa|hoodfun|lore|thesis|tokenomics|trending)\b/i;

/**
 * Privacy-safe, deterministic quality review for completed answers. It never
 * stores a prompt or response; callers use the returned aggregate score and
 * reason codes for monitoring only.
 */
function reviewAnswer({ question = '', answer = '', sources = [], usedLiveSearch = false } = {}) {
  const reasons = [];
  const trimmed = String(answer).trim();
  const needsResearch = RESEARCH_PATTERN.test(String(question));
  const hasDirectOpening = trimmed.split(/(?<=[.!?])\s+/)[0]?.length >= 18;
  const hasSourceSupport = sources.length > 0 || !usedLiveSearch;
  const hasResearchShape = !needsResearch || /research snapshot|thesis|lore|dyor|contract|liquidity/i.test(trimmed);
  const privacySafe = !INTERNAL_LEAK_PATTERN.test(trimmed);
  const sourceSafe = !RAW_URL_PATTERN.test(trimmed);

  if (!hasDirectOpening) reasons.push('weak_opening');
  if (!hasSourceSupport) reasons.push('missing_sources');
  if (!hasResearchShape) reasons.push('missing_research_context');
  if (!privacySafe) reasons.push('internal_leak');
  if (!sourceSafe) reasons.push('raw_url');

  const score = [hasDirectOpening, hasSourceSupport, hasResearchShape, privacySafe, sourceSafe]
    .reduce((sum, passed) => sum + (passed ? 20 : 0), 0);
  return { score, reasons, needsResearch };
}

module.exports = { reviewAnswer };