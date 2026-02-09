const { Router } = require('express');
const { getDb } = require('../database');

const router = Router();

// GET /api/users/:userId/topics/:topicId/questions
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

  const questions = db.prepare(`
    SELECT
      q.id,
      q.topic_id,
      q.question,
      COALESCE(qp.total_attempts, 0) AS total_attempts,
      COALESCE(qp.correct_count, 0) AS correct_count,
      COALESCE(qp.incorrect_count, 0) AS incorrect_count,
      qp.last_attempted
    FROM questions q
    LEFT JOIN question_progress qp ON qp.question_id = q.id AND qp.user_id = ?
    WHERE q.topic_id = ?
    ORDER BY q.id
  `).all(req.params.userId, req.params.topicId);

  res.json(questions);
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

  const { answer } = req.body;
  if (answer !== 'true' && answer !== 'false') {
    const err = new Error('Answer must be "true" or "false"');
    err.status = 400;
    return next(err);
  }

  const correct = answer === question.answer;
  const now = new Date().toISOString();
  const today = now.slice(0, 10);

  const submitAttempt = db.transaction(() => {
    // Upsert question_progress
    const correctDelta = correct ? 1 : 0;
    const incorrectDelta = correct ? 0 : 1;

    db.prepare(`
      INSERT INTO question_progress (user_id, question_id, total_attempts, correct_count, incorrect_count, last_attempted)
      VALUES (?, ?, 1, ?, ?, ?)
      ON CONFLICT(user_id, question_id) DO UPDATE SET
        total_attempts = total_attempts + 1,
        correct_count = correct_count + ?,
        incorrect_count = incorrect_count + ?,
        last_attempted = ?
    `).run(
      user.id, question.id,
      correctDelta, incorrectDelta, now,
      correctDelta, incorrectDelta, now
    );

    // Upsert topic_progress
    db.prepare(`
      INSERT INTO topic_progress (user_id, topic_id, total_attempts, correct_count, incorrect_count)
      VALUES (?, ?, 1, ?, ?)
      ON CONFLICT(user_id, topic_id) DO UPDATE SET
        total_attempts = total_attempts + 1,
        correct_count = correct_count + ?,
        incorrect_count = incorrect_count + ?
    `).run(
      user.id, question.topic_id,
      correctDelta, incorrectDelta,
      correctDelta, incorrectDelta
    );

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

    // Fetch updated progress
    const questionProgress = db.prepare(`
      SELECT total_attempts, correct_count, incorrect_count, last_attempted
      FROM question_progress
      WHERE user_id = ? AND question_id = ?
    `).get(user.id, question.id);

    const topicProgress = db.prepare(`
      SELECT total_attempts, correct_count, incorrect_count
      FROM topic_progress
      WHERE user_id = ? AND topic_id = ?
    `).get(user.id, question.topic_id);

    return { questionProgress, topicProgress };
  });

  const { questionProgress, topicProgress } = submitAttempt();

  res.json({
    correct,
    correct_answer: question.answer,
    explanation: question.explanation,
    question_progress: questionProgress,
    topic_progress: topicProgress,
  });
});

module.exports = router;
