const { v4: uuidv4 } = require('uuid');
const { db } = require('../data/db');
const { NotFoundError } = require('../lib/errors');

function titleFromMessage(text) {
  const clean = text.trim().replace(/\s+/g, ' ');
  return clean.length > 48 ? clean.slice(0, 48) + '…' : clean || 'New chat';
}

/** Returns the conversation row, or throws NotFoundError if it doesn't
 *  belong to this session — this is the only access-control check we need
 *  since sessions are anonymous and unguessable UUIDs. */
function getOwnedConversation(conversationId, sessionId) {
  const convo = db
    .prepare('SELECT * FROM conversations WHERE id = ? AND session_id = ?')
    .get(conversationId, sessionId);
  if (!convo) throw new NotFoundError('Conversation not found');
  return convo;
}

function listConversations(sessionId) {
  return db
    .prepare('SELECT id, title, updated_at FROM conversations WHERE session_id = ? ORDER BY updated_at DESC')
    .all(sessionId);
}

function createConversation(sessionId, firstMessage) {
  const id = uuidv4();
  db.prepare('INSERT INTO conversations (id, session_id, title) VALUES (?, ?, ?)')
    .run(id, sessionId, titleFromMessage(firstMessage));
  return id;
}

function getMessages(conversationId, sessionId) {
  const convo = getOwnedConversation(conversationId, sessionId);
  const rows = db
    .prepare('SELECT role, content, sources, created_at FROM messages WHERE conversation_id = ? ORDER BY id ASC')
    .all(conversationId);
  return {
    conversation: convo,
    messages: rows.map(m => ({ ...m, sources: m.sources ? JSON.parse(m.sources) : [] }))
  };
}

function getRecentHistory(conversationId, limit) {
  const rows = db
    .prepare('SELECT role, content FROM messages WHERE conversation_id = ? ORDER BY id DESC LIMIT ?')
    .all(conversationId, limit);
  return rows.reverse(); // back to chronological order
}

function appendMessage(conversationId, role, content, sources = null) {
  db.prepare('INSERT INTO messages (conversation_id, role, content, sources) VALUES (?, ?, ?, ?)')
    .run(conversationId, role, content, sources ? JSON.stringify(sources) : null);
}

function touchConversation(conversationId) {
  db.prepare("UPDATE conversations SET updated_at = datetime('now') WHERE id = ?").run(conversationId);
}

function deleteConversation(conversationId, sessionId) {
  getOwnedConversation(conversationId, sessionId); // throws if not owned
  const tx = db.transaction((id) => {
    db.prepare('DELETE FROM messages WHERE conversation_id = ?').run(id);
    db.prepare('DELETE FROM conversations WHERE id = ?').run(id);
  });
  tx(conversationId);
}

module.exports = {
  listConversations,
  createConversation,
  getOwnedConversation,
  getMessages,
  getRecentHistory,
  appendMessage,
  touchConversation,
  deleteConversation,
  titleFromMessage
};
