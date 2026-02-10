import { Router } from 'express';
import { getSources, addSource } from '../lib/store.js';
import { validateSourceType, VALID_SOURCE_TYPES } from '../lib/validators.js';

const router = Router();

router.get('/sources', (_req, res) => {
  res.json(getSources());
});

router.post('/sources', (req, res) => {
  const { name, type } = req.body;

  if (typeof name !== 'string' || name.trim() === '') {
    return res.status(400).json({ error: 'name is required and must be a non-empty string' });
  }
  if (!validateSourceType(type)) {
    return res.status(400).json({
      error: `type must be one of: ${VALID_SOURCE_TYPES.join(', ')}`,
    });
  }

  const source = addSource(name.trim(), type);
  res.status(201).json(source);
});

export default router;
