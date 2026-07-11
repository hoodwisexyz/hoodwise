const { v4: uuidv4 } = require('uuid');
const { db } = require('../data/db');
const { NotFoundError } = require('../lib/errors');
const logger = require('../lib/logger');
function titleFromMessage(text) { const clean = text.trim().replace(/\s+/g, ' '); return clean.length > 48 ? clean.slice(0, 48) + '…' : clean || 'New chat'; }
function getOwnedConversation(conversationId, sessionId) { const convo = db.prepare('SELECT * FROM conversations WHERE id = ? AND session_id = ?').get(conversationId, sessionId); if (!convo) throw new NotFoundError('Conversation not found'); return convo; }
function listConversations(sessionId) { return db.prepare('SELECT id, title, updated_at FROM conversations WHERE session_id = ? ORDER BY updated_at DESC').all(sessionId); }
function createConversation(sessionId, firstMessage) { const id = uuidv4(); db.prepare('INSERT INTO conversations (id, session_id, title) VALUES (?, ?, ?)').run(id, sessionId, titleFromMessage(firstMessage)); return id; }
function parseJson(raw, label, fallback) { if (!raw) return fallback; try { return JSON.parse(raw); } catch { logger.warn('conversation message has invalid ' + label + ' metadata'); return fallback; } }
function parseSources(rawSources) { const value = parseJson(rawSources, 'source', []); return Array.isArray(value) ? value : []; }
function parseBrief(rawBrief) { const value = parseJson(rawBrief, 'brief', null); return value && typeof value === 'object' && !Array.isArray(value) ? value : null; }
function getMessages(conversationId, sessionId) { const conversation = getOwnedConversation(conversationId, sessionId); const rows = db.prepare('SELECT role, content, sources, brief, created_at FROM messages WHERE conversation_id = ? ORDER BY id ASC').all(conversationId); return { conversation, messages: rows.map(row => ({ ...row, sources: parseSources(row.sources), brief: parseBrief(row.brief) })) }; }
function getRecentHistory(conversationId, limit) { return db.prepare('SELECT role, content FROM messages WHERE conversation_id = ? ORDER BY id DESC LIMIT ?').all(conversationId, limit).reverse(); }
function appendMessage(conversationId, role, content, sources = null, brief = null) { db.prepare('INSERT INTO messages (conversation_id, role, content, sources, brief) VALUES (?, ?, ?, ?, ?)').run(conversationId, role, content, sources ? JSON.stringify(sources) : null, brief ? JSON.stringify(brief) : null); }
function touchConversation(conversationId) { db.prepare("UPDATE conversations SET updated_at = datetime('now') WHERE id = ?").run(conversationId); }
function deleteConversation(conversationId, sessionId) { getOwnedConversation(conversationId, sessionId); db.transaction(id => { db.prepare('DELETE FROM messages WHERE conversation_id = ?').run(id); db.prepare('DELETE FROM conversations WHERE id = ?').run(id); })(conversationId); }
module.exports = { listConversations, createConversation, getOwnedConversation, getMessages, getRecentHistory, appendMessage, touchConversation, deleteConversation, titleFromMessage, parseSources, parseBrief };