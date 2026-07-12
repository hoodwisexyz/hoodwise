const { db } = require('../data/db');
const conversations = require('./conversationService');
const { BadRequestError } = require('../lib/errors');

const RATINGS = new Set(['helpful', 'missing', 'incorrect']);

function normalizeNote(note) {
  if (note == null) return null;
  const clean = String(note).trim().replace(/\s+/g, ' ');
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
  const counts = rows.reduce((summary, row) => ({ ...summary, [row.rating]: row.count }), { helpful: 0, missing: 0, incorrect: 0 });
  const recentRows = db.prepare(`
    SELECT rating, COUNT(*) AS count
    FROM answer_feedback
    WHERE created_at >= datetime('now', '-24 hours')
    GROUP BY rating
  `).all();
  const recent = recentRows.reduce((summary, row) => ({ ...summary, [row.rating]: row.count }), { helpful: 0, missing: 0, incorrect: 0 });
  const total = counts.helpful + counts.missing + counts.incorrect;
  const recentTotal = recent.helpful + recent.missing + recent.incorrect;
  const reviewNeeded = counts.missing + counts.incorrect;
  const recentReviewNeeded = recent.missing + recent.incorrect;
  const helpfulRate = total ? Math.round((counts.helpful / total) * 100) : null;
  const reviewRate = total ? Math.round((reviewNeeded / total) * 100) : 0;
  let priority = 'none';
  if (reviewNeeded >= 10 || reviewRate >= 45 || recentReviewNeeded >= 5) priority = 'high';
  else if (reviewNeeded >= 3 || reviewRate >= 25 || recentReviewNeeded >= 2) priority = 'watch';
  else if (total > 0) priority = 'healthy';

  return {
    ...counts,
    total,
    reviewNeeded,
    helpfulRate,
    recent24h: {
      ...recent,
      total: recentTotal,
      reviewNeeded: recentReviewNeeded
    },
    reviewSignal: {
      priority,
      status: priority === 'none'
        ? 'No answer feedback yet'
        : priority === 'healthy'
          ? 'Feedback is mostly positive'
          : priority === 'watch'
            ? 'Watch missing/incorrect answer patterns'
            : 'Prioritize answer-quality review',
      nextAction: priority === 'high'
        ? 'Review missing/incorrect clusters and add regression tests before expanding scope.'
        : priority === 'watch'
          ? 'Sample recent missing/incorrect answers and patch the relevant knowledge or answer contract.'
          : priority === 'healthy'
            ? 'Keep collecting feedback; no immediate action required.'
            : 'Collect enough feedback before making product calls.'
    }
  };
}

module.exports = { saveAnswerFeedback, feedbackSummary, normalizeNote };
