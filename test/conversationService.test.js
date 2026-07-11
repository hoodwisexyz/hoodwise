const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const fs = require('node:fs');

// Isolate this test run to its own SQLite file so it never touches the real
// dev/prod database, and clean up afterwards.
const TEST_DB_PATH = path.join(__dirname, `.test-${process.pid}.db`);
process.env.DB_PATH = TEST_DB_PATH;

const conversations = require('../src/services/conversationService');
const { NotFoundError } = require('../src/lib/errors');

test('creates a conversation and appends messages', () => {
  const sessionId = 'test-session-abc';
  const convoId = conversations.createConversation(sessionId, 'What is a Stock Token?');
  assert.ok(convoId);

  conversations.appendMessage(convoId, 'user', 'What is a Stock Token?');
  conversations.appendMessage(convoId, 'assistant', 'It is a tokenized instrument...', [{ title: 'Source', url: 'https://example.com' }]);

  const { conversation, messages } = conversations.getMessages(convoId, sessionId);
  assert.equal(conversation.id, convoId);
  assert.equal(messages.length, 2);
  assert.equal(messages[0].role, 'user');
  assert.equal(messages[1].sources[0].title, 'Source');
});

test('a conversation is not visible to a different session', () => {
  const sessionA = 'session-a';
  const sessionB = 'session-b';
  const convoId = conversations.createConversation(sessionA, 'hello');
  assert.throws(() => conversations.getOwnedConversation(convoId, sessionB), NotFoundError);
});

test('deleteConversation removes the conversation and its messages', () => {
  const sessionId = 'session-delete-me';
  const convoId = conversations.createConversation(sessionId, 'temporary chat');
  conversations.appendMessage(convoId, 'user', 'temporary chat');
  conversations.deleteConversation(convoId, sessionId);
  assert.throws(() => conversations.getOwnedConversation(convoId, sessionId), NotFoundError);
});

test('getRecentHistory returns messages in chronological order, capped to limit', () => {
  const sessionId = 'session-history';
  const convoId = conversations.createConversation(sessionId, 'first');
  for (let i = 0; i < 5; i++) {
    conversations.appendMessage(convoId, i % 2 === 0 ? 'user' : 'assistant', `message ${i}`);
  }
  const history = conversations.getRecentHistory(convoId, 3);
  assert.equal(history.length, 3);
  assert.equal(history[0].content, 'message 2');
  assert.equal(history[2].content, 'message 4');
});

test.after(() => {
  const { closeDb } = require('../src/data/db');
  closeDb();
  for (const suffix of ['', '-wal', '-shm']) {
    const f = TEST_DB_PATH + suffix;
    if (fs.existsSync(f)) fs.unlinkSync(f);
  }
});

test('parseSources fails closed for malformed persisted metadata', () => {
  assert.deepEqual(conversations.parseSources('{not valid json'), []);
  assert.deepEqual(conversations.parseSources('{"not":"an array"}'), []);
});
test('persists and restores briefing metadata with an assistant message', () => {
  const sessionId = 'session-brief-meta';
  const convoId = conversations.createConversation(sessionId, 'test briefing');
  const brief = { evidence: 'Curated source baseline', contracts: ['0x0000000000000000000000000000000000000000'], risks: [] };
  conversations.appendMessage(convoId, 'assistant', 'briefing answer', [], brief);
  const { messages } = conversations.getMessages(convoId, sessionId);
  assert.deepEqual(messages[0].brief, brief);
});