const express = require('express');
const router = express.Router();

const { requireSessionId } = require('../middleware/sessionValidation');
const { asyncHandler } = require('../middleware/errorHandler');
const conversations = require('../services/conversationService');

router.get('/conversations', requireSessionId, asyncHandler(async (req, res) => {
  const rows = conversations.listConversations(req.sessionId);
  res.json({ conversations: rows });
}));

router.get('/conversations/:id/messages', requireSessionId, asyncHandler(async (req, res) => {
  const result = conversations.getMessages(req.params.id, req.sessionId);
  res.json(result);
}));

// Plain-text transcript export — a small, genuinely useful upgrade: lets a
// user save/share a conversation without screenshotting the UI.
router.get('/conversations/:id/export', requireSessionId, asyncHandler(async (req, res) => {
  const { conversation, messages } = conversations.getMessages(req.params.id, req.sessionId);
  const lines = [
    `Hoodwise conversation: ${conversation.title}`,
    `Exported: ${new Date().toISOString()}`,
    '─'.repeat(48),
    ''
  ];
  for (const m of messages) {
    lines.push(m.role === 'user' ? 'You:' : 'Hoodwise:');
    lines.push(m.content);
    if (m.sources && m.sources.length) {
      lines.push('Sources:');
      m.sources.forEach(s => lines.push(`  - ${s.title}: ${s.url}`));
    }
    lines.push('');
  }
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="hoodwise-${conversation.id}.txt"`);
  res.send(lines.join('\n'));
}));

router.delete('/conversations/:id', requireSessionId, asyncHandler(async (req, res) => {
  conversations.deleteConversation(req.params.id, req.sessionId);
  res.json({ ok: true });
}));

module.exports = router;
