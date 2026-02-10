import { Router } from 'express';
import { getTopics, addTopic } from '../lib/store.js';

const router = Router();

router.get('/topics', (_req, res) => {
  res.json(getTopics());
});

router.post('/topics', (req, res) => {
  const { name } = req.body;

  if (typeof name !== 'string' || name.trim() === '') {
    return res.status(400).json({ error: 'name is required and must be a non-empty string' });
  }

  const topic = addTopic(name.trim());
  res.status(201).json(topic);
});

export default router;
