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

function parseSubsections(text) {
  const subs = [];
  const parts = text.split(/^## /m);
  for (const part of parts) {
    if (!part.trim()) continue;
    const newline = part.indexOf('\n');
    const label = part.slice(0, newline).trim();
    const body = part.slice(newline + 1).trim();
    subs.push({ label, body });
  }
  return subs;
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

  const upsertSource = db.prepare(`
    INSERT INTO sources (id, name, type)
    VALUES (?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
      name = excluded.name,
      type = excluded.type
  `);

  const upsertQuestion = db.prepare(`
    INSERT INTO questions (id, type, source_id, content)
    VALUES (?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
      type = excluded.type,
      source_id = excluded.source_id,
      content = excluded.content
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

  const saDir = path.join(DATA_DIR, 'short-answer');
  const saFiles = fs.existsSync(saDir)
    ? fs.readdirSync(saDir).filter(f => f.endsWith('.md'))
    : [];

  const selDir = path.join(DATA_DIR, 'select-all');
  const selFiles = fs.existsSync(selDir)
    ? fs.readdirSync(selDir).filter(f => f.endsWith('.md'))
    : [];

  const sourcesPath = path.join(DATA_DIR, 'sources.json');
  const sourcesData = fs.existsSync(sourcesPath)
    ? JSON.parse(fs.readFileSync(sourcesPath, 'utf-8'))
    : { items: [] };

  const runSeed = db.transaction(() => {
    for (let i = 0; i < topicsData.items.length; i++) {
      const topic = topicsData.items[i];
      upsertTopic.run(String(topic.id), topic.name, i);
    }

    for (const source of sourcesData.items) {
      upsertSource.run(String(source.id), source.name, source.type || 'other');
    }

    // Seed true/false questions
    for (const file of tfFiles) {
      const raw = fs.readFileSync(path.join(tfDir, file), 'utf-8');
      const { data: frontmatter, content } = matter(raw);
      const sections = parseSections(content);

      const questionId = 'tf-' + String(frontmatter.id);
      const sourceId = frontmatter.source != null ? String(frontmatter.source) : null;
      const questionContent = JSON.stringify({
        question: sections.question || '',
        answer: (sections.answer || '').toLowerCase(),
        explanation: sections.explanation || '',
      });

      upsertQuestion.run(questionId, 'tf', sourceId, questionContent);

      const topics = frontmatter.topics || [];
      for (const topicId of topics) {
        upsertQuestionTopic.run(questionId, String(topicId));
      }
    }

    // Seed short-answer questions
    for (const file of saFiles) {
      const raw = fs.readFileSync(path.join(saDir, file), 'utf-8');
      const { data: frontmatter, content } = matter(raw);
      const sections = parseSections(content);

      const questionId = 'sa-' + String(frontmatter.id);
      const sourceId = frontmatter.source != null ? String(frontmatter.source) : null;

      const partsRaw = sections.parts || '';
      const subsections = parseSubsections(partsRaw);
      const parts = subsections.map(sub => {
        const answerMatch = sub.body.match(/\*\*Answer:\*\*\s*([\s\S]*)/);
        const answer = answerMatch ? answerMatch[1].trim() : '';
        const question = sub.body.replace(/\*\*Answer:\*\*[\s\S]*/, '').trim();
        return { label: sub.label, question, answer };
      });

      const questionContent = JSON.stringify({
        background: sections.background || '',
        parts,
      });

      upsertQuestion.run(questionId, 'shortanswer', sourceId, questionContent);

      const topics = frontmatter.topics || [];
      for (const topicId of topics) {
        upsertQuestionTopic.run(questionId, String(topicId));
      }
    }

    // Seed select-all questions
    for (const file of selFiles) {
      const raw = fs.readFileSync(path.join(selDir, file), 'utf-8');
      const { data: frontmatter, content } = matter(raw);
      const sections = parseSections(content);

      const questionId = 'sel-' + String(frontmatter.id);
      const sourceId = frontmatter.source != null ? String(frontmatter.source) : null;

      const choicesRaw = sections.choices || '';
      const subsections = parseSubsections(choicesRaw);
      const choices = subsections.map(sub => {
        const answerMatch = sub.body.match(/\*\*Answer:\*\*\s*(\w+)/);
        const answer = answerMatch ? answerMatch[1] : 'False';
        const text = sub.body.replace(/\*\*Answer:\*\*[\s\S]*/, '').trim();
        return { label: sub.label, text, answer };
      });

      const questionContent = JSON.stringify({
        question: sections.question || '',
        choices,
        explanation: sections.explanation || '',
      });

      upsertQuestion.run(questionId, 'selectall', sourceId, questionContent);

      const topics = frontmatter.topics || [];
      for (const topicId of topics) {
        upsertQuestionTopic.run(questionId, String(topicId));
      }
    }
  });

  runSeed();

  const topicCount = db.prepare('SELECT COUNT(*) AS count FROM topics').get().count;
  const tfCount = db.prepare(`SELECT COUNT(*) AS count FROM questions WHERE type = 'tf'`).get().count;
  const saCount = db.prepare(`SELECT COUNT(*) AS count FROM questions WHERE type = 'shortanswer'`).get().count;
  const selCount = db.prepare(`SELECT COUNT(*) AS count FROM questions WHERE type = 'selectall'`).get().count;
  console.log(`Seeded ${topicCount} topics, ${tfCount + saCount + selCount} questions (${tfCount} tf, ${saCount} short-answer, ${selCount} select-all)`);
}

module.exports = { seed };
