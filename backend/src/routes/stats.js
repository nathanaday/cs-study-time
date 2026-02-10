const { Router } = require('express');
const { getDb } = require('../database');

const router = Router();

// GET /api/users/:userId/stats
router.get('/users/:userId/stats', (req, res, next) => {
  const db = getDb();
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.params.userId);
  if (!user) {
    const err = new Error('User not found');
    err.status = 404;
    return next(err);
  }

  // Compute display streak
  let displayStreak = 0;
  if (user.last_study_date) {
    const today = new Date().toISOString().slice(0, 10);
    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
    if (user.last_study_date === today || user.last_study_date === yesterday) {
      displayStreak = user.current_streak;
    }
  }

  // Overall totals
  const overall = db.prepare(`
    SELECT
      COALESCE(SUM(total_attempts), 0) AS total_attempts,
      COALESCE(SUM(correct_count), 0) AS correct_count,
      COALESCE(SUM(incorrect_count), 0) AS incorrect_count
    FROM question_progress
    WHERE user_id = ?
  `).get(req.params.userId);

  // Per-topic summary
  const topicSummary = db.prepare(`
    SELECT
      t.id,
      t.name,
      COUNT(DISTINCT qt.question_id) AS question_count,
      COALESCE(tp.total_attempts, 0) AS total_attempts,
      COALESCE(tp.correct_count, 0) AS correct_count,
      COALESCE(tp.incorrect_count, 0) AS incorrect_count
    FROM topics t
    LEFT JOIN question_topics qt ON qt.topic_id = t.id
    LEFT JOIN topic_progress tp ON tp.topic_id = t.id AND tp.user_id = ?
    GROUP BY t.id
    ORDER BY t.sort_order
  `).all(req.params.userId);

  res.json({
    current_streak: displayStreak,
    longest_streak: user.longest_streak,
    last_study_date: user.last_study_date,
    total_attempts: overall.total_attempts,
    correct_count: overall.correct_count,
    incorrect_count: overall.incorrect_count,
    accuracy: overall.total_attempts > 0
      ? Math.round((overall.correct_count / overall.total_attempts) * 10000) / 10000
      : 0,
    topics: topicSummary,
  });
});

module.exports = router;
