const Database = require('better-sqlite3');
const path = require('path');
const { config } = require('../config');
const logger = require('../lib/logger');

// NOTE: Railway's filesystem is ephemeral on redeploy unless you attach a
// Volume mounted at /data. Set DB_PATH=/data/hoodwise.db once you add a
// volume, so chat history survives deploys. Defaults to a local file for
// easy local development.
const DB_PATH = config.db.path || path.join(__dirname, '..', '..', 'hoodwise.db');

const db = new Database(DB_PATH);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');
// Absorb short write contention windows instead of failing a user turn when
// SQLite is checkpointing or another request just committed.
db.pragma('busy_timeout = 5000');

db.exec(`
  CREATE TABLE IF NOT EXISTS conversations (
    id TEXT PRIMARY KEY,
    session_id TEXT NOT NULL,
    title TEXT NOT NULL DEFAULT 'New chat',
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    conversation_id TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
    content TEXT NOT NULL,
    sources TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE
  );

  CREATE INDEX IF NOT EXISTS idx_conversations_session ON conversations(session_id);
  CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id);

  CREATE TABLE IF NOT EXISTS answer_feedback (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    conversation_id TEXT NOT NULL,
    message_id INTEGER,
    session_id TEXT NOT NULL,
    rating TEXT NOT NULL CHECK (rating IN ('helpful', 'missing', 'incorrect')),
    note TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE,
    FOREIGN KEY (message_id) REFERENCES messages(id) ON DELETE SET NULL,
    UNIQUE(session_id, conversation_id, message_id)
  );

  CREATE INDEX IF NOT EXISTS idx_feedback_conversation ON answer_feedback(conversation_id);
`);

const messageColumns = db.prepare('PRAGMA table_info(messages)').all();
if (!messageColumns.some(column => column.name === 'brief')) {
  db.exec('ALTER TABLE messages ADD COLUMN brief TEXT');
}
logger.info('database ready', { path: DB_PATH });

function closeDb() {
  try {
    db.close();
    logger.info('database connection closed');
  } catch (err) {
    logger.error('error closing database', { error: err.message });
  }
}

module.exports = { db, closeDb };
