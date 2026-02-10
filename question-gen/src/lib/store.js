import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, '..', '..', 'data');

const TOPICS_FILE = path.join(DATA_DIR, 'topics.json');
const SOURCES_FILE = path.join(DATA_DIR, 'sources.json');
const COUNTER_FILE = path.join(DATA_DIR, 'question-counter.json');

const QUESTION_DIRS = {
  'true-false': path.join(DATA_DIR, 'true-false'),
  'short-answer': path.join(DATA_DIR, 'short-answer'),
  'select-all': path.join(DATA_DIR, 'select-all'),
};

// -- Directory and file initialization --

export function ensureDataDirs() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  for (const dir of Object.values(QUESTION_DIRS)) {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }

  if (!fs.existsSync(TOPICS_FILE)) {
    writeJson(TOPICS_FILE, { nextId: 1, items: [] });
  }
  if (!fs.existsSync(SOURCES_FILE)) {
    writeJson(SOURCES_FILE, { nextId: 1, items: [] });
  }
  if (!fs.existsSync(COUNTER_FILE)) {
    writeJson(COUNTER_FILE, { nextId: 1 });
  }
}

// -- JSON helpers --

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
}

function writeJson(filePath, data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n', 'utf-8');
}

// -- Topics --

export function getTopics() {
  return readJson(TOPICS_FILE).items;
}

export function addTopic(name) {
  const data = readJson(TOPICS_FILE);
  const topic = { id: data.nextId, name };
  data.items.push(topic);
  data.nextId++;
  writeJson(TOPICS_FILE, data);
  return topic;
}

export function topicExists(id) {
  return readJson(TOPICS_FILE).items.some((t) => t.id === id);
}

// -- Sources --

export function getSources() {
  return readJson(SOURCES_FILE).items;
}

export function addSource(name, type) {
  const data = readJson(SOURCES_FILE);
  const source = { id: data.nextId, name, type };
  data.items.push(source);
  data.nextId++;
  writeJson(SOURCES_FILE, data);
  return source;
}

export function sourceExists(id) {
  return readJson(SOURCES_FILE).items.some((s) => s.id === id);
}

// -- Question counter --

export function nextQuestionId() {
  const data = readJson(COUNTER_FILE);
  const id = data.nextId;
  data.nextId++;
  writeJson(COUNTER_FILE, data);
  return id;
}

// -- Question file I/O --

export function questionDir(type) {
  return QUESTION_DIRS[type];
}

export function writeQuestionFile(type, id, content) {
  const filePath = path.join(QUESTION_DIRS[type], `${id}.md`);
  fs.writeFileSync(filePath, content, 'utf-8');
  return filePath;
}

export function readQuestionFile(type, id) {
  const filePath = path.join(QUESTION_DIRS[type], `${id}.md`);
  if (!fs.existsSync(filePath)) return null;
  return fs.readFileSync(filePath, 'utf-8');
}

export function listQuestionFiles(type) {
  const dir = QUESTION_DIRS[type];
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir)
    .filter((f) => f.endsWith('.md'))
    .map((f) => parseInt(f.replace('.md', ''), 10))
    .filter((id) => !Number.isNaN(id))
    .sort((a, b) => a - b);
}

export const QUESTION_TYPES = Object.keys(QUESTION_DIRS);
