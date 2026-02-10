const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');
const { getDb } = require('./database');

const DATA_DIR = path.join(__dirname, '..', '..', 'question-gen', 'data');

function parseSections(body) {
  const sections = {};
  const parts = body.split(/^# /m);
  for (const part of parts) {
    if (!part.trim()) continue;
    const newline = part.indexOf('\n');
    const heading = part.slice(0, newline).trim();
    const content = part.slice(newline + 1).trim();
    sections[heading.toLowerCase()] = content;
  }
  return sections;
}

function seed() {
  if (!fs.existsSync(DATA_DIR)) {
    console.log('No question-gen data directory found, skipping seed');
    return;
  }

  const db = getDb();

  const topicsPath = path.join(DATA_DIR, 'topics.json');
  if (!fs.existsSync(topicsPath)) {
    console.log('No topics.json found, skipping seed');
    return;
  }

  const topicsData = JSON.parse(fs.readFileSync(topicsPath, 'utf-8'));

  const upsertTopic = db.prepare(`
    INSERT INTO topics (id, name, sort_order)
    VALUES (?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
      name = excluded.name,
      sort_order = excluded.sort_order
  `);

  const upsertQuestion = db.prepare(`
    INSERT INTO questions (id, question, answer, explanation)
    VALUES (?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
      question = excluded.question,
      answer = excluded.answer,
      explanation = excluded.explanation
  `);

  const upsertQuestionTopic = db.prepare(`
    INSERT INTO question_topics (question_id, topic_id)
    VALUES (?, ?)
    ON CONFLICT(question_id, topic_id) DO NOTHING
  `);

  const tfDir = path.join(DATA_DIR, 'true-false');
  const tfFiles = fs.existsSync(tfDir)
    ? fs.readdirSync(tfDir).filter(f => f.endsWith('.md'))
    : [];

  const runSeed = db.transaction(() => {
    for (let i = 0; i < topicsData.items.length; i++) {
      const topic = topicsData.items[i];
      upsertTopic.run(String(topic.id), topic.name, i);
    }

    for (const file of tfFiles) {
      const raw = fs.readFileSync(path.join(tfDir, file), 'utf-8');
      const { data: frontmatter, content } = matter(raw);
      const sections = parseSections(content);

      const questionId = 'tf-' + String(frontmatter.id);
      const questionText = sections.question || '';
      const answer = (sections.answer || '').toLowerCase();
      const explanation = sections.explanation || '';

      upsertQuestion.run(questionId, questionText, answer, explanation);

      const topics = frontmatter.topics || [];
      for (const topicId of topics) {
        upsertQuestionTopic.run(questionId, String(topicId));
      }
    }
  });

  runSeed();

  const topicCount = db.prepare('SELECT COUNT(*) AS count FROM topics').get().count;
  const questionCount = db.prepare('SELECT COUNT(*) AS count FROM questions').get().count;
  console.log(`Seeded ${topicCount} topics, ${questionCount} questions`);
}

module.exports = { seed };
