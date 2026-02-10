const { Router } = require('express');
const { getDb } = require('../database');

const router = Router();

// GET /api/users/:userId/topics
router.get('/users/:userId/topics', (req, res, next) => {
  const db = getDb();
  const user = db.prepare('SELECT id FROM users WHERE id = ?').get(req.params.userId);
  if (!user) {
    const err = new Error('User not found');
    err.status = 404;
    return next(err);
  }

  const topics = db.prepare(`
    SELECT
      t.id,
      t.name,
      t.sort_order,
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

  res.json(topics);
});

module.exports = router;
