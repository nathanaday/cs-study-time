const { Router } = require('express');
const { getDb } = require('../database');

const router = Router();

// GET /api/sources
router.get('/sources', (_req, res) => {
  const db = getDb();
  const sources = db.prepare('SELECT id, name, type FROM sources ORDER BY name').all();
  res.json(sources);
});

module.exports = router;
