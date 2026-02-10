import { Router } from 'express';
import {
  nextQuestionId,
  writeQuestionFile,
  readQuestionFile,
  listQuestionFiles,
  QUESTION_TYPES,
} from '../lib/store.js';
import {
  validateTrueFalse,
  validateSelectAll,
  validateShortAnswer,
} from '../lib/validators.js';
import {
  buildTrueFalseMarkdown,
  buildSelectAllMarkdown,
  buildShortAnswerMarkdown,
  parseQuestionMetadata,
  parseQuestionFile,
} from '../lib/markdown.js';

const router = Router();

// GET /api/questions -- list all questions (metadata only)
router.get('/questions', (_req, res) => {
  const questions = [];

  for (const type of QUESTION_TYPES) {
    const ids = listQuestionFiles(type);
    for (const id of ids) {
      const content = readQuestionFile(type, id);
      if (content) {
        const meta = parseQuestionMetadata(content);
        questions.push({ ...meta, type });
      }
    }
  }

  questions.sort((a, b) => a.id - b.id);
  res.json(questions);
});

// GET /api/questions/:id -- get full question content
router.get('/questions/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (Number.isNaN(id)) {
    return res.status(400).json({ error: 'id must be an integer' });
  }

  for (const type of QUESTION_TYPES) {
    const content = readQuestionFile(type, id);
    if (content) {
      const { meta, body } = parseQuestionFile(content);
      return res.json({ ...meta, type, content: body.trim() });
    }
  }

  res.status(404).json({ error: `question ${id} not found` });
});

// POST /api/questions/true-false
router.post('/questions/true-false', (req, res) => {
  const validation = validateTrueFalse(req.body);
  if (!validation.valid) {
    return res.status(400).json({ error: validation.error });
  }

  const id = nextQuestionId();
  const markdown = buildTrueFalseMarkdown({ id, ...req.body });
  writeQuestionFile('true-false', id, markdown);

  res.status(201).json({ id, type: 'true-false' });
});

// POST /api/questions/select-all
router.post('/questions/select-all', (req, res) => {
  const validation = validateSelectAll(req.body);
  if (!validation.valid) {
    return res.status(400).json({ error: validation.error });
  }

  const id = nextQuestionId();
  const markdown = buildSelectAllMarkdown({ id, ...req.body });
  writeQuestionFile('select-all', id, markdown);

  res.status(201).json({ id, type: 'select-all' });
});

// POST /api/questions/short-answer
router.post('/questions/short-answer', (req, res) => {
  const validation = validateShortAnswer(req.body);
  if (!validation.valid) {
    return res.status(400).json({ error: validation.error });
  }

  const id = nextQuestionId();
  const markdown = buildShortAnswerMarkdown({ id, ...req.body });
  writeQuestionFile('short-answer', id, markdown);

  res.status(201).json({ id, type: 'short-answer' });
});

export default router;
