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

    CREATE TABLE IF NOT EXISTS questions (
      id          TEXT PRIMARY KEY,
      topic_id    TEXT NOT NULL REFERENCES topics(id),
      question    TEXT NOT NULL,
      answer      TEXT NOT NULL CHECK(answer IN ('true','false')),
      explanation TEXT NOT NULL DEFAULT ''
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
      PRIMARY KEY (user_id, question_id)
    );

    CREATE INDEX IF NOT EXISTS idx_questions_topic ON questions(topic_id);
    CREATE INDEX IF NOT EXISTS idx_topic_progress_user ON topic_progress(user_id);
    CREATE INDEX IF NOT EXISTS idx_question_progress_user ON question_progress(user_id);
  `);

  // Migration: add color_theme column for existing databases
  try {
    db.exec(`ALTER TABLE users ADD COLUMN color_theme TEXT NOT NULL DEFAULT 'sage'`);
  } catch (_e) {
    // Column already exists
  }

  return db;
}

module.exports = { getDb };
