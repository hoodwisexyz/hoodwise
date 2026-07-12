(() => {
  const login = document.getElementById('login');
  const dashboard = document.getElementById('dashboard');
  const tokenInput = document.getElementById('token');
  const grid = document.getElementById('grid');
  const status = document.getElementById('status');
  const key = 'hoodwise_ops_token';

  function card(label, value, hint = '') {
    const safeHint = hint ? '<small>' + hint + '</small>' : '';
    return '<article class="ops-card"><span>' + label + '</span><b>' + value + '</b>' + safeHint + '</article>';
  }

  async function load() {
    const token = sessionStorage.getItem(key);
    if (!token) {
      login.hidden = false;
      dashboard.hidden = true;
      return;
    }

    status.textContent = 'Reading production metrics...';
    const res = await fetch('/api/ops/summary', { headers: { 'x-ops-token': token } });
    if (!res.ok) {
      sessionStorage.removeItem(key);
      login.hidden = false;
      dashboard.hidden = true;
      status.textContent = res.status === 401 ? 'Token rejected.' : 'Ops service unavailable.';
      return;
    }

    const data = await res.json();
    const c = data.counters || {};
    const f = data.feedback || {};
    const signal = f.reviewSignal || {};
    const helpfulRate = f.helpfulRate == null ? 'n/a' : f.helpfulRate + '%';
    const cards = [
      ['UPTIME', Math.floor(data.uptimeSeconds / 60) + 'm'],
      ['CHAT REQUESTS', c.chatRequests || 0],
      ['AVG LATENCY', (data.averageChatLatencyMs || 0) + ' ms'],
      ['CHAT ERRORS', c.chatErrors || 0],
      ['LIVE SEARCH', c.liveSearches || 0],
      ['QUALITY FLAGS', c.lowQualityReviews || 0],
      ['ANSWER FEEDBACK', f.total || 0, 'helpful ' + (f.helpful || 0) + ' / missing ' + (f.missing || 0) + ' / incorrect ' + (f.incorrect || 0)],
      ['HELPFUL RATE', helpfulRate, 'aggregate only'],
      ['REVIEW NEEDED', f.reviewNeeded || 0, 'last 24h: ' + ((f.recent24h && f.recent24h.reviewNeeded) || 0)],
      ['FEEDBACK SIGNAL', (signal.priority || 'none').toUpperCase(), signal.status || 'No answer feedback yet'],
      ['STREAM FALLBACKS', c.streamFallbacks || 0],
      ['VERIFIER ERRORS', c.verifierErrors || 0]
    ];
    grid.innerHTML = cards.map(([label, value, hint]) => card(label, value, hint)).join('');
    login.hidden = true;
    dashboard.hidden = false;
    status.textContent = 'Updated ' + new Date().toLocaleTimeString() + ' - ' + (signal.nextAction || 'Aggregate metrics only. No prompt or user data is shown.');
  }

  document.getElementById('unlock').addEventListener('click', () => {
    if (tokenInput.value.trim()) {
      sessionStorage.setItem(key, tokenInput.value.trim());
      tokenInput.value = '';
      load();
    }
  });
  tokenInput.addEventListener('keydown', e => { if (e.key === 'Enter') document.getElementById('unlock').click(); });
  document.getElementById('refresh').addEventListener('click', load);
  document.getElementById('signout').addEventListener('click', () => { sessionStorage.removeItem(key); load(); });
  load();
})();
