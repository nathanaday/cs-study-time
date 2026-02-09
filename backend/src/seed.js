const fs = require('fs');
const path = require('path');
const { getDb } = require('./database');

const QUESTION_BANK_DIR = path.join(__dirname, '..', '..', 'question-bank');

function seed() {
  const db = getDb();

  const indexPath = path.join(QUESTION_BANK_DIR, 'index.json');
  const index = JSON.parse(fs.readFileSync(indexPath, 'utf-8'));

  const upsertTopic = db.prepare(`
    INSERT INTO topics (id, name, sort_order)
    VALUES (?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
      name = excluded.name,
      sort_order = excluded.sort_order
  `);

  const upsertQuestion = db.prepare(`
    INSERT INTO questions (id, topic_id, question, answer, explanation)
    VALUES (?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
      topic_id = excluded.topic_id,
      question = excluded.question,
      answer = excluded.answer,
      explanation = excluded.explanation
  `);

  const runSeed = db.transaction(() => {
    for (const [courseId, course] of Object.entries(index.courses)) {
      if (!course['use-true-false']) continue;

      const tfPath = path.join(QUESTION_BANK_DIR, courseId, 'tf', 'tf_questions.json');
      if (!fs.existsSync(tfPath)) continue;

      const data = JSON.parse(fs.readFileSync(tfPath, 'utf-8'));

      for (let i = 0; i < data.topics.length; i++) {
        const topic = data.topics[i];
        upsertTopic.run(topic.id, topic.name, i);
      }

      for (const q of data.questions) {
        upsertQuestion.run(q.id, q.topic, q.Question, q.Answer, q.Explanation || '');
      }
    }
  });

  runSeed();

  const topicCount = db.prepare('SELECT COUNT(*) AS count FROM topics').get().count;
  const questionCount = db.prepare('SELECT COUNT(*) AS count FROM questions').get().count;
  console.log(`Seeded ${topicCount} topics, ${questionCount} questions`);
}

module.exports = { seed };
