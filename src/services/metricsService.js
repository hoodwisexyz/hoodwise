const startedAt = Date.now();
const counters = { chatRequests: 0, chatErrors: 0, streamFallbacks: 0, liveSearches: 0, verifierRequests: 0, verifierErrors: 0, landingViews: 0, appViews: 0 };
const timings = { chat: [] };
function record(name, durationMs) { if (Object.hasOwn(counters, name)) counters[name] += 1; if (durationMs != null && timings[name]) { timings[name].push(durationMs); if (timings[name].length > 200) timings[name].shift(); } }
function recordRequest(path, status, durationMs) { if (path === '/') record('landingViews'); if (path === '/app') record('appViews'); if (path === '/chat' || path === '/chat/stream') { record('chatRequests'); record('chat', durationMs); if (status >= 400) record('chatErrors'); } if (path === '/contracts/verify') { record('verifierRequests'); if (status >= 400) record('verifierErrors'); } }
function average(values) { return values.length ? Math.round(values.reduce((sum, value) => sum + value, 0) / values.length) : 0; }
function summary() { return { uptimeSeconds: Math.floor((Date.now() - startedAt) / 1000), counters: { ...counters }, averageChatLatencyMs: average(timings.chat) }; }
module.exports = { record, recordRequest, summary };