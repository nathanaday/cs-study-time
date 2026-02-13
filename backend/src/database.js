const Database = require('better-sqlite3');
const path = require('path');

const DB_PATH = path.join(__dirname, '..', 'study.db');

let db;

function getDb() {
  if (db) return db;

  db = new Database(DB_PATH);
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');

  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id              INTEGER PRIMARY KEY AUTOINCREMENT,
      name            TEXT NOT NULL,
      icon            TEXT NOT NULL DEFAULT 'assets/users/user_ico_1.png',
      color_theme     TEXT NOT NULL DEFAULT 'sage',
      created_at      TEXT NOT NULL DEFAULT (datetime('now')),
      longest_streak  INTEGER NOT NULL DEFAULT 0,
      current_streak  INTEGER NOT NULL DEFAULT 0,
      last_study_date TEXT
    );

    CREATE TABLE IF NOT EXISTS topics (
      id         TEXT PRIMARY KEY,
      name       TEXT NOT NULL,
      sort_order INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS sources (
      id   TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      type TEXT NOT NULL DEFAULT 'other'
    );

    CREATE TABLE IF NOT EXISTS questions (
      id        TEXT PRIMARY KEY,
      type      TEXT NOT NULL DEFAULT 'tf',
      source_id TEXT REFERENCES sources(id),
      content   TEXT NOT NULL DEFAULT '{}'
    );

    CREATE TABLE IF NOT EXISTS question_topics (
      question_id TEXT NOT NULL REFERENCES questions(id),
      topic_id    TEXT NOT NULL REFERENCES topics(id),
      PRIMARY KEY (question_id, topic_id)
    );

    CREATE TABLE IF NOT EXISTS topic_progress (
      user_id         INTEGER NOT NULL REFERENCES users(id),
      topic_id        TEXT NOT NULL REFERENCES topics(id),
      total_attempts  INTEGER NOT NULL DEFAULT 0,
      correct_count   INTEGER NOT NULL DEFAULT 0,
      incorrect_count INTEGER NOT NULL DEFAULT 0,
      PRIMARY KEY (user_id, topic_id)
    );

    CREATE TABLE IF NOT EXISTS question_progress (
      user_id         INTEGER NOT NULL REFERENCES users(id),
      question_id     TEXT NOT NULL REFERENCES questions(id),
      total_attempts  INTEGER NOT NULL DEFAULT 0,
      correct_count   INTEGER NOT NULL DEFAULT 0,
      incorrect_count INTEGER NOT NULL DEFAULT 0,
      last_attempted  TEXT,
      comfort_score   INTEGER,
      self_score      INTEGER,
      is_starred      INTEGER NOT NULL DEFAULT 0,
      PRIMARY KEY (user_id, question_id)
    );

    CREATE INDEX IF NOT EXISTS idx_question_topics_topic ON question_topics(topic_id);
    CREATE INDEX IF NOT EXISTS idx_topic_progress_user ON topic_progress(user_id);
    CREATE INDEX IF NOT EXISTS idx_question_progress_user ON question_progress(user_id);
    CREATE INDEX IF NOT EXISTS idx_question_progress_starred ON question_progress(user_id, is_starred);
  `);

  // Migration: add color_theme column for existing databases
  try {
    db.exec(`ALTER TABLE users ADD COLUMN color_theme TEXT NOT NULL DEFAULT 'sage'`);
  } catch (_e) {
    // Column already exists
  }

  // Migration: add sources table and source_id column for existing databases
  db.exec(`CREATE TABLE IF NOT EXISTS sources (
    id   TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'other'
  )`);
  try {
    db.exec(`ALTER TABLE questions ADD COLUMN source_id TEXT REFERENCES sources(id)`);
  } catch (_e) {
    // Column already exists
  }

  // Migration: add type and content columns to questions
  try {
    db.exec(`ALTER TABLE questions ADD COLUMN type TEXT NOT NULL DEFAULT 'tf'`);
  } catch (_e) {
    // Column already exists
  }
  try {
    db.exec(`ALTER TABLE questions ADD COLUMN content TEXT NOT NULL DEFAULT '{}'`);
  } catch (_e) {
    // Column already exists
  }

  // Migration: migrate old question/answer/explanation columns into content JSON
  try {
    const hasOldColumns = db.prepare(
      `SELECT COUNT(*) AS cnt FROM pragma_table_info('questions') WHERE name = 'question'`
    ).get();
    if (hasOldColumns.cnt > 0) {
      const oldQuestions = db.prepare(
        `SELECT id, question, answer, explanation FROM questions WHERE content = '{}' AND question IS NOT NULL`
      ).all();
      const updateContent = db.prepare(`UPDATE questions SET content = ? WHERE id = ?`);
      for (const q of oldQuestions) {
        const content = JSON.stringify({
          question: q.question,
          answer: q.answer,
          explanation: q.explanation || '',
        });
        updateContent.run(content, q.id);
      }
    }
  } catch (_e) {
    // Old columns don't exist, nothing to migrate
  }

  // Migration: add comfort_score, self_score, is_starred to question_progress
  try {
    db.exec(`ALTER TABLE question_progress ADD COLUMN comfort_score INTEGER`);
  } catch (_e) {
    // Column already exists
  }
  try {
    db.exec(`ALTER TABLE question_progress ADD COLUMN self_score INTEGER`);
  } catch (_e) {
    // Column already exists
  }
  try {
    db.exec(`ALTER TABLE question_progress ADD COLUMN is_starred INTEGER NOT NULL DEFAULT 0`);
  } catch (_e) {
    // Column already exists
  }
  try {
    db.exec(`ALTER TABLE question_progress ADD COLUMN is_hidden INTEGER NOT NULL DEFAULT 0`);
  } catch (_e) {
    // Column already exists
  }

  db.exec(`CREATE INDEX IF NOT EXISTS idx_question_progress_hidden ON question_progress(user_id, is_hidden)`);

  return db;
}

module.exports = { getDb };
