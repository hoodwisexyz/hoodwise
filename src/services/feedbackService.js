const { db } = require('../data/db');
const conversations = require('./conversationService');
const { BadRequestError } = require('../lib/errors');

const RATINGS = new Set(['helpful', 'missing', 'incorrect']);

function normalizeNote(note) {
  if (note == null) return null;
  const clean = String(note).trim().replace(/s+/g, ' ');
  return clean ? clean.slice(0, 240) : null;
}

function saveAnswerFeedback({ sessionId, conversationId, messageId, rating, note }) {
  if (!conversationId || typeof conversationId !== 'string') throw new BadRequestError('conversationId is required');
  if (!Number.isInteger(messageId) || messageId < 1) throw new BadRequestError('messageId is required');
  if (!RATINGS.has(rating)) throw new BadRequestError('rating must be helpful, missing, or incorrect');
  conversations.getOwnedAssistantMessage(conversationId, messageId, sessionId);
  const cleanNote = normalizeNote(note);
  db.prepare(`
    INSERT INTO answer_feedback (conversation_id, message_id, session_id, rating, note)
    VALUES (?, ?, ?, ?, ?)
    ON CONFLICT(session_id, conversation_id, message_id)
    DO UPDATE SET rating = excluded.rating, note = excluded.note, created_at = datetime('now')
  `).run(conversationId, messageId, sessionId, rating, cleanNote);
  return { ok: true, rating, note: cleanNote };
}

function feedbackSummary() {
  const rows = db.prepare('SELECT rating, COUNT(*) AS count FROM answer_feedback GROUP BY rating').all();
  return rows.reduce((summary, row) => ({ ...summary, [row.rating]: row.count }), { helpful: 0, missing: 0, incorrect: 0 });
}

module.exports = { saveAnswerFeedback, feedbackSummary, normalizeNote };
