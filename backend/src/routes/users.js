const { Router } = require('express');
const { getDb } = require('../database');

const router = Router();

const ICONS = [
  'assets/users/user_ico_1.png',
  'assets/users/user_ico_2.png',
  'assets/users/user_ico_3png.png',
  'assets/users/user_ico_4.png',
  'assets/users/user_ico_5.png',
  'assets/users/user_ico_6.png',
];

function getDisplayStreak(user) {
  if (!user.last_study_date) return 0;
  const today = new Date().toISOString().slice(0, 10);
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
  if (user.last_study_date === today || user.last_study_date === yesterday) {
    return user.current_streak;
  }
  return 0;
}

function formatUser(user) {
  return {
    id: user.id,
    name: user.name,
    icon: user.icon,
    created_at: user.created_at,
    longest_streak: user.longest_streak,
    current_streak: getDisplayStreak(user),
    last_study_date: user.last_study_date,
  };
}

// GET /api/icons
router.get('/icons', (_req, res) => {
  res.json(ICONS);
});

// GET /api/users
router.get('/users', (_req, res) => {
  const db = getDb();
  const users = db.prepare('SELECT * FROM users ORDER BY id').all();
  res.json(users.map(formatUser));
});

// POST /api/users
router.post('/users', (req, res, next) => {
  const { name, icon } = req.body;
  if (!name || typeof name !== 'string' || !name.trim()) {
    const err = new Error('Name is required');
    err.status = 400;
    return next(err);
  }

  const db = getDb();
  const userIcon = icon && ICONS.includes(icon) ? icon : ICONS[0];
  const result = db.prepare('INSERT INTO users (name, icon) VALUES (?, ?)').run(name.trim(), userIcon);
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json(formatUser(user));
});

// GET /api/users/:id
router.get('/users/:id', (req, res, next) => {
  const db = getDb();
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.params.id);
  if (!user) {
    const err = new Error('User not found');
    err.status = 404;
    return next(err);
  }
  res.json(formatUser(user));
});

// PATCH /api/users/:id
router.patch('/users/:id', (req, res, next) => {
  const db = getDb();
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.params.id);
  if (!user) {
    const err = new Error('User not found');
    err.status = 404;
    return next(err);
  }

  const updates = {};
  if (req.body.name !== undefined) {
    if (typeof req.body.name !== 'string' || !req.body.name.trim()) {
      const err = new Error('Name must be a non-empty string');
      err.status = 400;
      return next(err);
    }
    updates.name = req.body.name.trim();
  }
  if (req.body.icon !== undefined) {
    if (!ICONS.includes(req.body.icon)) {
      const err = new Error('Invalid icon');
      err.status = 400;
      return next(err);
    }
    updates.icon = req.body.icon;
  }

  if (Object.keys(updates).length === 0) {
    return res.json(formatUser(user));
  }

  const setClauses = Object.keys(updates).map(k => `${k} = ?`).join(', ');
  const values = [...Object.values(updates), req.params.id];
  db.prepare(`UPDATE users SET ${setClauses} WHERE id = ?`).run(...values);

  const updated = db.prepare('SELECT * FROM users WHERE id = ?').get(req.params.id);
  res.json(formatUser(updated));
});

module.exports = router;
