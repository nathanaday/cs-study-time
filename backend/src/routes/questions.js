const { Router } = require('express');
const { getDb } = require('../database');

const router = Router();

// GET /api/question-types -- available types with counts
router.get('/question-types', (_req, res) => {
  const db = getDb();
  const rows = db.prepare(`
    SELECT type, COUNT(*) AS count FROM questions GROUP BY type ORDER BY type
  `).all();
  res.json(rows);
});

// GET /api/questions/preview-count?topics=...&sources=...&types=...
router.get('/questions/preview-count', (req, res) => {
  const db = getDb();
  const topicsParam = req.query.topics;
  if (!topicsParam) {
    return res.json({ count: 0 });
  }

  const topicIds = topicsParam.split(',').filter(Boolean);
  if (topicIds.length === 0) {
    return res.json({ count: 0 });
  }

  const topicPlaceholders = topicIds.map(() => '?').join(',');
  const params = [...topicIds];

  let sourceClause = '';
  const sourcesParam = req.query.sources;
  if (sourcesParam) {
    const sourceIds = sourcesParam.split(',').filter(Boolean);
    if (sourceIds.length > 0) {
      const sourcePlaceholders = sourceIds.map(() => '?').join(',');
      sourceClause = `AND q.source_id IN (${sourcePlaceholders})`;
      params.push(...sourceIds);
    }
  }

  let typeClause = '';
  const typesParam = req.query.types;
  if (typesParam) {
    const types = typesParam.split(',').filter(Boolean);
    if (types.length > 0) {
      const typePlaceholders = types.map(() => '?').join(',');
      typeClause = `AND q.type IN (${typePlaceholders})`;
      params.push(...types);
    }
  }

  let hiddenClause = '';
  const userIdParam = req.query.userId;
  if (userIdParam) {
    hiddenClause = `AND NOT EXISTS (
      SELECT 1 FROM question_progress qp
      WHERE qp.question_id = q.id AND qp.user_id = ? AND qp.is_hidden = 1
    )`;
    params.push(userIdParam);
  }

  const row = db.prepare(`
    SELECT COUNT(DISTINCT q.id) AS count
    FROM questions q
    INNER JOIN question_topics qt ON qt.question_id = q.id
    WHERE qt.topic_id IN (${topicPlaceholders})
    ${sourceClause}
    ${typeClause}
    ${hiddenClause}
  `).get(...params);

  res.json({ count: row.count });
});

// GET /api/users/:userId/questions/bank -- all questions with progress, grouped by topic
router.get('/users/:userId/questions/bank', (req, res, next) => {
  const db = getDb();
  const user = db.prepare('SELECT id FROM users WHERE id = ?').get(req.params.userId);
  if (!user) {
    const err = new Error('User not found');
    err.status = 404;
    return next(err);
  }

  const questions = db.prepare(`
    SELECT
      q.id,
      q.type,
      q.content,
      qt.topic_id,
      t.name AS topic_name,
      t.sort_order,
      s.name AS source_name,
      COALESCE(qp.total_attempts, 0) AS total_attempts,
      COALESCE(qp.correct_count, 0) AS correct_count,
      COALESCE(qp.incorrect_count, 0) AS incorrect_count,
      qp.last_attempted,
      COALESCE(qp.is_starred, 0) AS is_starred,
      COALESCE(qp.is_hidden, 0) AS is_hidden,
      qp.comfort_score
    FROM questions q
    INNER JOIN question_topics qt ON qt.question_id = q.id
    INNER JOIN topics t ON t.id = qt.topic_id
    LEFT JOIN sources s ON s.id = q.source_id
    LEFT JOIN question_progress qp ON qp.question_id = q.id AND qp.user_id = ?
    ORDER BY t.sort_order, t.id, q.id
  `).all(req.params.userId);

  const parsed = questions.map(q => ({
    ...q,
    content: JSON.parse(q.content),
  }));

  res.json(parsed);
});

// GET /api/users/:userId/hidden/count
router.get('/users/:userId/hidden/count', (req, res, next) => {
  const db = getDb();
  const user = db.prepare('SELECT id FROM users WHERE id = ?').get(req.params.userId);
  if (!user) {
    const err = new Error('User not found');
    err.status = 404;
    return next(err);
  }

  const row = db.prepare(`
    SELECT COUNT(*) AS count
    FROM question_progress
    WHERE user_id = ? AND is_hidden = 1
  `).get(req.params.userId);

  res.json({ count: row.count });
});

// GET /api/users/:userId/topics/:topicId/questions?sources=...&types=...
router.get('/users/:userId/topics/:topicId/questions', (req, res, next) => {
  const db = getDb();
  const user = db.prepare('SELECT id FROM users WHERE id = ?').get(req.params.userId);
  if (!user) {
    const err = new Error('User not found');
    err.status = 404;
    return next(err);
  }

  const topic = db.prepare('SELECT id FROM topics WHERE id = ?').get(req.params.topicId);
  if (!topic) {
    const err = new Error('Topic not found');
    err.status = 404;
    return next(err);
  }

  const params = [req.params.userId, req.params.topicId];
  let sourceClause = '';
  const sourcesParam = req.query.sources;
  if (sourcesParam) {
    const sourceIds = sourcesParam.split(',').filter(Boolean);
    if (sourceIds.length > 0) {
      const sourcePlaceholders = sourceIds.map(() => '?').join(',');
      sourceClause = `AND q.source_id IN (${sourcePlaceholders})`;
      params.push(...sourceIds);
    }
  }

  let typeClause = '';
  const typesParam = req.query.types;
  if (typesParam) {
    const types = typesParam.split(',').filter(Boolean);
    if (types.length > 0) {
      const typePlaceholders = types.map(() => '?').join(',');
      typeClause = `AND q.type IN (${typePlaceholders})`;
      params.push(...types);
    }
  }

  const questions = db.prepare(`
    SELECT
      q.id,
      q.type,
      q.content,
      qt.topic_id,
      s.name AS source_name,
      COALESCE(qp.total_attempts, 0) AS total_attempts,
      COALESCE(qp.correct_count, 0) AS correct_count,
      COALESCE(qp.incorrect_count, 0) AS incorrect_count,
      qp.last_attempted,
      COALESCE(qp.is_starred, 0) AS is_starred,
      qp.comfort_score
    FROM questions q
    INNER JOIN question_topics qt ON qt.question_id = q.id
    LEFT JOIN sources s ON s.id = q.source_id
    LEFT JOIN question_progress qp ON qp.question_id = q.id AND qp.user_id = ?
    WHERE qt.topic_id = ?
    AND COALESCE(qp.is_hidden, 0) = 0
    ${sourceClause}
    ${typeClause}
    ORDER BY q.id
  `).all(...params);

  const parsed = questions.map(q => ({
    ...q,
    content: JSON.parse(q.content),
  }));

  res.json(parsed);
});

// POST /api/users/:userId/questions/:questionId/attempts
router.post('/users/:userId/questions/:questionId/attempts', (req, res, next) => {
  const db = getDb();

  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.params.userId);
  if (!user) {
    const err = new Error('User not found');
    err.status = 404;
    return next(err);
  }

  const question = db.prepare('SELECT * FROM questions WHERE id = ?').get(req.params.questionId);
  if (!question) {
    const err = new Error('Question not found');
    err.status = 404;
    return next(err);
  }

  const { comfort } = req.body;
  if (comfort == null || comfort < 1 || comfort > 5 || !Number.isInteger(comfort)) {
    const err = new Error('Comfort must be an integer 1-5');
    err.status = 400;
    return next(err);
  }

  const content = JSON.parse(question.content);
  let correct;
  let selfScore = null;

  if (question.type === 'tf') {
    const { answer } = req.body;
    if (answer !== 'true' && answer !== 'false') {
      const err = new Error('Answer must be "true" or "false"');
      err.status = 400;
      return next(err);
    }
    correct = answer === content.answer;
  } else if (question.type === 'selectall') {
    const { selections } = req.body;
    if (!Array.isArray(selections)) {
      const err = new Error('Selections must be an array');
      err.status = 400;
      return next(err);
    }
    const correctLabels = content.choices
      .filter(c => c.answer === 'True')
      .map(c => c.label)
      .sort();
    const userLabels = [...selections].sort();
    correct = correctLabels.length === userLabels.length &&
      correctLabels.every((l, i) => l === userLabels[i]);
  } else if (question.type === 'shortanswer') {
    const { self_score } = req.body;
    if (self_score == null || self_score < 0 || self_score > 100) {
      const err = new Error('self_score must be 0-100');
      err.status = 400;
      return next(err);
    }
    selfScore = self_score;
    correct = self_score >= 70 || comfort >= 3;
  } else {
    const err = new Error('Unknown question type');
    err.status = 400;
    return next(err);
  }

  const now = new Date().toISOString();
  const today = now.slice(0, 10);

  const submitAttempt = db.transaction(() => {
    const correctDelta = correct ? 1 : 0;
    const incorrectDelta = correct ? 0 : 1;

    db.prepare(`
      INSERT INTO question_progress (user_id, question_id, total_attempts, correct_count, incorrect_count, last_attempted, comfort_score, self_score)
      VALUES (?, ?, 1, ?, ?, ?, ?, ?)
      ON CONFLICT(user_id, question_id) DO UPDATE SET
        total_attempts = total_attempts + 1,
        correct_count = correct_count + ?,
        incorrect_count = incorrect_count + ?,
        last_attempted = ?,
        comfort_score = ?,
        self_score = COALESCE(?, self_score)
    `).run(
      user.id, question.id,
      correctDelta, incorrectDelta, now, comfort, selfScore,
      correctDelta, incorrectDelta, now, comfort, selfScore
    );

    const questionTopics = db.prepare(
      'SELECT topic_id FROM question_topics WHERE question_id = ?'
    ).all(question.id);

    const upsertTopicProgress = db.prepare(`
      INSERT INTO topic_progress (user_id, topic_id, total_attempts, correct_count, incorrect_count)
      VALUES (?, ?, 1, ?, ?)
      ON CONFLICT(user_id, topic_id) DO UPDATE SET
        total_attempts = total_attempts + 1,
        correct_count = correct_count + ?,
        incorrect_count = incorrect_count + ?
    `);

    for (const qt of questionTopics) {
      upsertTopicProgress.run(
        user.id, qt.topic_id,
        correctDelta, incorrectDelta,
        correctDelta, incorrectDelta
      );
    }

    // Update streak
    let newStreak = user.current_streak;
    const lastDate = user.last_study_date;
    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);

    if (lastDate === today) {
      // Already studied today, no streak change
    } else if (lastDate === yesterday) {
      newStreak += 1;
    } else {
      newStreak = 1;
    }

    const newLongest = Math.max(user.longest_streak, newStreak);

    db.prepare(`
      UPDATE users
      SET current_streak = ?, longest_streak = ?, last_study_date = ?
      WHERE id = ?
    `).run(newStreak, newLongest, today, user.id);

    const questionProgress = db.prepare(`
      SELECT total_attempts, correct_count, incorrect_count, last_attempted, comfort_score
      FROM question_progress
      WHERE user_id = ? AND question_id = ?
    `).get(user.id, question.id);

    const firstTopicId = questionTopics.length > 0 ? questionTopics[0].topic_id : null;
    const topicProgress = firstTopicId
      ? db.prepare(`
          SELECT total_attempts, correct_count, incorrect_count
          FROM topic_progress
          WHERE user_id = ? AND topic_id = ?
        `).get(user.id, firstTopicId)
      : null;

    return { questionProgress, topicProgress };
  });

  const { questionProgress, topicProgress } = submitAttempt();

  res.json({
    correct,
    question_progress: questionProgress,
    topic_progress: topicProgress,
  });
});

// POST /api/users/:userId/questions/:questionId/star
router.post('/users/:userId/questions/:questionId/star', (req, res, next) => {
  const db = getDb();

  const user = db.prepare('SELECT id FROM users WHERE id = ?').get(req.params.userId);
  if (!user) {
    const err = new Error('User not found');
    err.status = 404;
    return next(err);
  }

  const question = db.prepare('SELECT id FROM questions WHERE id = ?').get(req.params.questionId);
  if (!question) {
    const err = new Error('Question not found');
    err.status = 404;
    return next(err);
  }

  const { starred } = req.body;
  const starredInt = starred ? 1 : 0;

  db.prepare(`
    INSERT INTO question_progress (user_id, question_id, is_starred)
    VALUES (?, ?, ?)
    ON CONFLICT(user_id, question_id) DO UPDATE SET
      is_starred = ?
  `).run(user.id, question.id, starredInt, starredInt);

  res.json({ starred: !!starred });
});

// POST /api/users/:userId/questions/:questionId/hide
router.post('/users/:userId/questions/:questionId/hide', (req, res, next) => {
  const db = getDb();

  const user = db.prepare('SELECT id FROM users WHERE id = ?').get(req.params.userId);
  if (!user) {
    const err = new Error('User not found');
    err.status = 404;
    return next(err);
  }

  const question = db.prepare('SELECT id FROM questions WHERE id = ?').get(req.params.questionId);
  if (!question) {
    const err = new Error('Question not found');
    err.status = 404;
    return next(err);
  }

  const { hidden } = req.body;
  const hiddenInt = hidden ? 1 : 0;

  db.prepare(`
    INSERT INTO question_progress (user_id, question_id, is_hidden)
    VALUES (?, ?, ?)
    ON CONFLICT(user_id, question_id) DO UPDATE SET
      is_hidden = ?
  `).run(user.id, question.id, hiddenInt, hiddenInt);

  res.json({ hidden: !!hidden });
});

// GET /api/users/:userId/starred
router.get('/users/:userId/starred', (req, res, next) => {
  const db = getDb();

  const user = db.prepare('SELECT id FROM users WHERE id = ?').get(req.params.userId);
  if (!user) {
    const err = new Error('User not found');
    err.status = 404;
    return next(err);
  }

  const questions = db.prepare(`
    SELECT
      q.id,
      q.type,
      q.content,
      s.name AS source_name,
      COALESCE(qp.total_attempts, 0) AS total_attempts,
      COALESCE(qp.correct_count, 0) AS correct_count,
      COALESCE(qp.incorrect_count, 0) AS incorrect_count,
      qp.last_attempted,
      qp.comfort_score,
      1 AS is_starred
    FROM question_progress qp
    INNER JOIN questions q ON q.id = qp.question_id
    LEFT JOIN sources s ON s.id = q.source_id
    WHERE qp.user_id = ? AND qp.is_starred = 1 AND qp.is_hidden = 0
    ORDER BY q.id
  `).all(req.params.userId);

  const parsed = questions.map(q => ({
    ...q,
    content: JSON.parse(q.content),
  }));

  res.json(parsed);
});

// GET /api/users/:userId/starred/count
router.get('/users/:userId/starred/count', (req, res, next) => {
  const db = getDb();

  const user = db.prepare('SELECT id FROM users WHERE id = ?').get(req.params.userId);
  if (!user) {
    const err = new Error('User not found');
    err.status = 404;
    return next(err);
  }

  const row = db.prepare(`
    SELECT COUNT(*) AS count
    FROM question_progress
    WHERE user_id = ? AND is_starred = 1 AND is_hidden = 0
  `).get(req.params.userId);

  res.json({ count: row.count });
});

// GET /api/users/:userId/incorrect
router.get('/users/:userId/incorrect', (req, res, next) => {
  const db = getDb();

  const user = db.prepare('SELECT id FROM users WHERE id = ?').get(req.params.userId);
  if (!user) {
    const err = new Error('User not found');
    err.status = 404;
    return next(err);
  }

  const questions = db.prepare(`
    SELECT
      q.id,
      q.type,
      q.content,
      s.name AS source_name,
      qp.total_attempts,
      qp.correct_count,
      qp.incorrect_count,
      qp.last_attempted,
      qp.comfort_score,
      COALESCE(qp.is_starred, 0) AS is_starred
    FROM question_progress qp
    INNER JOIN questions q ON q.id = qp.question_id
    LEFT JOIN sources s ON s.id = q.source_id
    WHERE qp.user_id = ? AND qp.incorrect_count > 0 AND qp.correct_count = 0 AND qp.is_hidden = 0
    ORDER BY q.id
  `).all(req.params.userId);

  const parsed = questions.map(q => ({
    ...q,
    content: JSON.parse(q.content),
  }));

  res.json(parsed);
});

// GET /api/users/:userId/incorrect/count
router.get('/users/:userId/incorrect/count', (req, res, next) => {
  const db = getDb();

  const user = db.prepare('SELECT id FROM users WHERE id = ?').get(req.params.userId);
  if (!user) {
    const err = new Error('User not found');
    err.status = 404;
    return next(err);
  }

  const row = db.prepare(`
    SELECT COUNT(*) AS count
    FROM question_progress
    WHERE user_id = ? AND incorrect_count > 0 AND correct_count = 0 AND is_hidden = 0
  `).get(req.params.userId);

  res.json({ count: row.count });
});

module.exports = router;
