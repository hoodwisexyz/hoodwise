(function () {
  const messagesEl = document.getElementById('messages');
  const inputEl = document.getElementById('input');
  const form = document.getElementById('inputForm');
  const sendBtn = document.getElementById('sendBtn');
  const chipsEl = document.getElementById('chips');
  const historyList = document.getElementById('historyList');
  const newChatBtn = document.getElementById('newChatBtn');
  const conversationTitleEl = document.getElementById('conversationTitle');
  const sidebar = document.getElementById('sidebar');
  const collapseBtn = document.getElementById('collapseBtn');
  const expandBtn = document.getElementById('expandBtn');
  const themeToggle = document.getElementById('themeToggle');
  const themeIconMoon = document.getElementById('themeIconMoon');
  const themeIconSun = document.getElementById('themeIconSun');
  const themeLabel = document.getElementById('themeLabel');
  const motionReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Subtle background parallax makes the chat feel like a product surface,
  // while remaining inert for users who prefer reduced motion.
  if (!motionReduced) {
    document.getElementById('app').addEventListener('pointermove', (event) => {
      document.documentElement.style.setProperty('--app-pointer-x', `${(event.clientX / window.innerWidth) * 100}%`);
      document.documentElement.style.setProperty('--app-pointer-y', `${(event.clientY / window.innerHeight) * 100}%`);
    });
  }

  // ---- Session (anonymous, persisted locally so history survives refresh) ----
  function uuid() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }
  let sessionId = localStorage.getItem('hoodwise_session_id');
  if (!sessionId) {
    sessionId = uuid();
    localStorage.setItem('hoodwise_session_id', sessionId);
  }

  let currentConversationId = null;
  const conversationPathMatch = window.location.pathname.match(/^\/app\/c\/([a-f0-9-]{36})$/i);
  const initialConversationId = conversationPathMatch?.[1] || new URLSearchParams(window.location.search).get('c');

  // Keep conversations shareable with a clean, semantic route.
  // A legacy ?c= link is still restored, then immediately normalized.
  function syncConversationRoute(conversationId) {
    const url = conversationId ? '/app/c/' + encodeURIComponent(conversationId) : '/app';
    window.history.replaceState({}, '', url);
  }

  // ---- Theme ----
  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('hoodwise_theme', theme);
    const isDark = theme === 'dark';
    themeIconMoon.style.display = isDark ? 'block' : 'none';
    themeIconSun.style.display = isDark ? 'none' : 'block';
    themeLabel.textContent = isDark ? 'Dark mode' : 'Light mode';
  }
  applyTheme(localStorage.getItem('hoodwise_theme') || 'dark');
  themeToggle.addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme');
    applyTheme(current === 'dark' ? 'light' : 'dark');
  });

  // ---- Sidebar collapse (mobile + manual) ----
  collapseBtn.addEventListener('click', () => sidebar.classList.add('collapsed'));
  expandBtn.addEventListener('click', () => sidebar.classList.remove('collapsed'));
  if (window.innerWidth <= 780) sidebar.classList.add('collapsed');

  // ---- Rendering helpers ----
  function botAvatarSVG() {
    return `<svg viewBox="0 0 24 24"><path d="M4 17 L9 8 L13 13 L20 4" stroke="#00e676" stroke-width="2.4" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
  }

  // Minimal, DOM-based Markdown renderer. It never injects model text as HTML:
  // only bold emphasis and list structure are interpreted, so replies remain safe.
  function appendInlineText(target, value) {
    const parts = value.split(/(\*\*[^*]+\*\*)/g);
    parts.forEach(part => {
      const bold = part.match(/^\*\*(.+)\*\*$/);
      if (bold) {
        const strong = document.createElement('strong');
        strong.textContent = bold[1];
        target.appendChild(strong);
      } else {
        target.appendChild(document.createTextNode(part));
      }
    });
  }

  function renderMessageContent(target, text) {
    target.replaceChildren();
    const fragment = document.createDocumentFragment();
    let list = null;
    const flushList = () => {
      if (list) fragment.appendChild(list);
      list = null;
    };

    text.split('\n').forEach(line => {
      const item = line.match(/^\s*[-*]\s+(.+)$/);
      if (item) {
        if (!list) list = document.createElement('ul');
        const li = document.createElement('li');
        appendInlineText(li, item[1]);
        list.appendChild(li);
        return;
      }
      flushList();
      if (!line.trim()) {
        fragment.appendChild(document.createElement('div')).className = 'message-spacer';
        return;
      }
      const paragraph = document.createElement('p');
      appendInlineText(paragraph, line);
      fragment.appendChild(paragraph);
    });
    flushList();
    target.appendChild(fragment);
  }

  function addMessage(role, text, sources) {
    const row = document.createElement('div');
    row.className = 'row ' + (role === 'user' ? 'user' : 'bot');
    if (role !== 'user') {
      const av = document.createElement('div');
      av.className = 'avatar';
      av.innerHTML = botAvatarSVG();
      row.appendChild(av);
    }
    const bubble = document.createElement('div');
    bubble.className = 'bubble';
    const messageContent = document.createElement('div');
    messageContent.className = 'message-content';
    renderMessageContent(messageContent, text);
    bubble.appendChild(messageContent);

    if (sources && sources.length) {
      const srcWrap = document.createElement('div');
      srcWrap.className = 'sources';
      sources.forEach(s => {
        const a = document.createElement('a');
        a.className = 'source-chip';
        a.href = s.url;
        a.target = '_blank';
        a.rel = 'noopener noreferrer';
        a.innerHTML = `<svg width="10" height="10" viewBox="0 0 24 24"><path d="M7 17L17 7M17 7H8M17 7V16" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg> ${s.title}`;
        srcWrap.appendChild(a);
      });
      bubble.appendChild(document.createElement('br'));
      bubble.appendChild(srcWrap);
    }

    row.appendChild(bubble);
    if (role !== 'user' && text) {
      const copyBtn = document.createElement('button');
      copyBtn.className = 'copy-btn';
      copyBtn.title = 'Copy answer';
      copyBtn.innerHTML = `<svg width="12" height="12" viewBox="0 0 24 24"><rect x="9" y="9" width="12" height="12" rx="2" stroke="currentColor" stroke-width="2" fill="none"/><path d="M5 15V5a2 2 0 0 1 2-2h10" stroke="currentColor" stroke-width="2" fill="none"/></svg>`;
      copyBtn.addEventListener('click', () => {
        navigator.clipboard.writeText(text).then(() => {
          copyBtn.classList.add('copied');
          setTimeout(() => copyBtn.classList.remove('copied'), 1400);
        });
      });
      bubble.appendChild(copyBtn);
    }
    messagesEl.appendChild(row);
    messagesEl.scrollTop = messagesEl.scrollHeight;
    return bubble;
  }

  function addThinking() {
    const row = document.createElement('div');
    row.className = 'row bot';
    row.id = 'thinkingRow';
    const av = document.createElement('div');
    av.className = 'avatar';
    av.innerHTML = botAvatarSVG();
    row.appendChild(av);
    const wrap = document.createElement('div');
    wrap.className = 'bubble thinking';
    wrap.innerHTML = `
      <svg viewBox="0 0 48 18"><path d="M0,9 L11,9 L15,3 L20,15 L25,3 L30,9 L48,9"/></svg>
      <span class="thinking-label">reading the chain...</span>
    `;
    row.appendChild(wrap);
    messagesEl.appendChild(row);
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }
  function removeThinking() {
    const el = document.getElementById('thinkingRow');
    if (el) el.remove();
  }

  function showWelcome() {
    messagesEl.innerHTML = `
      <section class="welcome-brief" aria-label="Hoodwise starter briefing">
        <div class="welcome-eyebrow"><span></span> YOUR PRIVATE CHAIN BRIEFING</div>
        <h1>Start with the signal,<br><em>not the noise.</em></h1>
        <p>Ask a direct question, or use one of the briefing lanes below. Hoodwise stays focused on Robinhood Chain and always keeps risk in view.</p>
        <div class="welcome-lanes"><div><b>01</b><span>Products<br><small>Stock Tokens · Earn</small></span></div><div><b>02</b><span>Infrastructure<br><small>Orbit · Chainlink · DeFi</small></span></div><div><b>03</b><span>Ecosystem<br><small>Agents · memecoins · risk</small></span></div></div>
      </section>`;
    const welcomeBubble = addMessage('bot', "I’m Hoodwise. Ask anything about Robinhood Chain — I’ll separate the structural facts, the current context, and the risks that matter.");
    welcomeBubble.closest('.row').dataset.welcomeMessage = 'true';
    chipsEl.style.display = 'flex';
  }

  // ---- History sidebar ----
  async function loadHistoryList() {
    try {
      const res = await fetch(`/api/conversations?sessionId=${sessionId}`);
      const data = await res.json();
      historyList.innerHTML = '';
      if (!data.conversations || !data.conversations.length) {
        historyList.innerHTML = '<div class="history-empty">No chats yet</div>';
        return;
      }
      data.conversations.forEach(c => {
        const item = document.createElement('div');
        item.className = 'history-item' + (c.id === currentConversationId ? ' active' : '');
        item.innerHTML = `<span class="title">${escapeHTML(c.title)}</span><button class="delete-btn" title="Delete">✕</button>`;
        item.querySelector('.title').addEventListener('click', () => openConversation(c.id));
        item.querySelector('.delete-btn').addEventListener('click', async (e) => {
          e.stopPropagation();
          await fetch(`/api/conversations/${c.id}?sessionId=${sessionId}`, { method: 'DELETE' });
          if (c.id === currentConversationId) startNewChat();
          loadHistoryList();
        });
        historyList.appendChild(item);
      });
    } catch (e) {
      console.error('Failed to load history', e);
    }
  }

  function escapeHTML(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  async function openConversation(id) {
    try {
      const res = await fetch(`/api/conversations/${id}/messages?sessionId=${sessionId}`);
      if (!res.ok) {
        if (new URLSearchParams(window.location.search).get('c') === id) syncConversationRoute(null);
        return;
      }
      const data = await res.json();
      currentConversationId = id;
      syncConversationRoute(id);
      conversationTitleEl.textContent = data.conversation.title;
      messagesEl.innerHTML = '';
      chipsEl.style.display = 'none';
      data.messages.forEach(m => addMessage(m.role, m.content, m.sources));
      loadHistoryList();
      if (window.innerWidth <= 780) sidebar.classList.add('collapsed');
    } catch (e) {
      console.error('Failed to open conversation', e);
    }
  }

  function startNewChat() {
    currentConversationId = null;
    syncConversationRoute(null);
    conversationTitleEl.textContent = 'New chat';
    showWelcome();
    loadHistoryList();
  }
  newChatBtn.addEventListener('click', startNewChat);

  // ---- Sending messages ----
  function addStreamingBotRow() {
    const row = document.createElement('div');
    row.className = 'row bot';
    const av = document.createElement('div');
    av.className = 'avatar';
    av.innerHTML = botAvatarSVG();
    row.appendChild(av);
    const bubble = document.createElement('div');
    bubble.className = 'bubble streaming-bubble';
    const messageContent = document.createElement('div');
    messageContent.className = 'message-content';
    bubble.appendChild(messageContent);
    row.appendChild(bubble);
    messagesEl.appendChild(row);
    messagesEl.scrollTop = messagesEl.scrollHeight;

    let fullText = '';
    return {
      appendText(chunk) {
        fullText += chunk;
        renderMessageContent(messageContent, fullText);
        messagesEl.scrollTop = messagesEl.scrollHeight;
      },
      finalize(sources) {
        bubble.classList.remove('streaming-bubble');
        if (sources && sources.length) {
          const srcWrap = document.createElement('div');
          srcWrap.className = 'sources';
          sources.forEach(s => {
            const a = document.createElement('a');
            a.className = 'source-chip';
            a.href = s.url;
            a.target = '_blank';
            a.rel = 'noopener noreferrer';
            a.innerHTML = `<svg width="10" height="10" viewBox="0 0 24 24"><path d="M7 17L17 7M17 7H8M17 7V16" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg> ${s.title}`;
            srcWrap.appendChild(a);
          });
          bubble.appendChild(document.createElement('br'));
          bubble.appendChild(srcWrap);
        }
        if (fullText) {
          const copyBtn = document.createElement('button');
          copyBtn.className = 'copy-btn';
          copyBtn.title = 'Copy answer';
          copyBtn.innerHTML = `<svg width="12" height="12" viewBox="0 0 24 24"><rect x="9" y="9" width="12" height="12" rx="2" stroke="currentColor" stroke-width="2" fill="none"/><path d="M5 15V5a2 2 0 0 1 2-2h10" stroke="currentColor" stroke-width="2" fill="none"/></svg>`;
          copyBtn.addEventListener('click', () => {
            navigator.clipboard.writeText(fullText).then(() => {
              copyBtn.classList.add('copied');
              setTimeout(() => copyBtn.classList.remove('copied'), 1400);
            });
          });
          bubble.appendChild(copyBtn);
        }
        return fullText;
      },
      row
    };
  }

  /** Parses Server-Sent Events out of a fetch ReadableStream. Calls
   *  onEvent({event, data}) for each complete "event: X\ndata: Y" block as
   *  it arrives — events can span multiple chunks, so this buffers text
   *  across reads and only processes complete blocks (split on the blank
   *  line that terminates each SSE event). */
  async function readSSE(response, onEvent) {
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const blocks = buffer.split('\n\n');
      buffer = blocks.pop();
      for (const block of blocks) {
        const lines = block.split('\n');
        let eventName = 'message';
        let dataStr = '';
        for (const line of lines) {
          if (line.startsWith('event:')) eventName = line.slice(6).trim();
          else if (line.startsWith('data:')) dataStr += line.slice(5).trim();
        }
        if (!dataStr) continue;
        try {
          onEvent({ event: eventName, data: JSON.parse(dataStr) });
        } catch {
          // ignore a malformed/partial event rather than breaking the stream
        }
      }
    }
  }

  async function sendMessage(text) {
    if (!text.trim()) return;
    if (!currentConversationId) {
      messagesEl.querySelector('.welcome-brief')?.remove();
      messagesEl.querySelector('[data-welcome-message]')?.remove();
    }
    chipsEl.style.display = 'none';
    addMessage('user', text);
    inputEl.value = '';
    inputEl.style.height = 'auto';
    sendBtn.disabled = true;
    addThinking();

    try {
      const payload = { sessionId, message: text };
      if (currentConversationId) payload.conversationId = currentConversationId;

      const res = await fetch('/api/chat/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const contentType = res.headers.get('content-type') || '';
      if (!res.ok || !contentType.includes('text/event-stream')) {
        removeThinking();
        let errMsg = 'Something went wrong. Please try again.';
        try { errMsg = (await res.json()).error || errMsg; } catch { /* keep default */ }
        addMessage('bot', errMsg);
        return;
      }

      let streamBot = null;
      let sawError = false;

      await readSSE(res, ({ event, data }) => {
        if (event === 'start') {
          currentConversationId = data.conversationId;
          syncConversationRoute(currentConversationId);
        } else if (event === 'token') {
          if (!streamBot) {
            removeThinking();
            streamBot = addStreamingBotRow();
          }
          streamBot.appendText(data.text);
        } else if (event === 'done') {
          currentConversationId = data.conversationId;
          syncConversationRoute(currentConversationId);
          if (streamBot) streamBot.finalize(data.sources);
          if (conversationTitleEl.textContent === 'New chat') {
            conversationTitleEl.textContent = text.length > 48 ? text.slice(0, 48) + '…' : text;
          }
          loadHistoryList();
        } else if (event === 'error') {
          sawError = true;
          removeThinking();
          if (streamBot) streamBot.finalize([]);
          addMessage('bot', data.error || 'Something went wrong. Please try again.');
        }
      });

      if (!streamBot && !sawError) {
        // Stream ended with no tokens and no explicit error — fail safe.
        removeThinking();
        addMessage('bot', "Sorry, I couldn't generate a response — try asking again.");
      }
    } catch (err) {
      removeThinking();
      addMessage('bot', 'Could not reach the server. Please check your connection and try again.');
      console.error(err);
    } finally {
      sendBtn.disabled = false;
      inputEl.focus();
    }
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    sendMessage(inputEl.value);
  });
  inputEl.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(inputEl.value);
    }
  });
  inputEl.addEventListener('input', () => {
    inputEl.style.height = 'auto';
    inputEl.style.height = Math.min(inputEl.scrollHeight, 140) + 'px';
  });
  chipsEl.querySelectorAll('.chip').forEach(chip => {
    chip.addEventListener('click', () => sendMessage(chip.getAttribute('data-q')));
  });

  // ---- Smooth page transition back to landing ----
  const pageTransition = document.getElementById('pageTransition');
  if (pageTransition) {
    document.querySelectorAll('[data-transition]').forEach(link => {
      link.addEventListener('click', (e) => {
        const href = link.getAttribute('href');
        if (!href) return;
        e.preventDefault();
        pageTransition.classList.add('hw-transition-active');
        setTimeout(() => { window.location.href = href; }, 380);
      });
    });
  }

  // ---- Init ----
  showWelcome();
  loadHistoryList().then(() => {
    if (initialConversationId) openConversation(initialConversationId);
  });
})();
