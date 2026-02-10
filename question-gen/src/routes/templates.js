import { Router } from 'express';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SCHEMA_DIR = path.join(__dirname, '..', '..', 'schema');

const VALID_TYPES = ['true-false', 'short-answer', 'select-all'];

const router = Router();

router.get('/templates/:type', (req, res) => {
  const { type } = req.params;

  if (!VALID_TYPES.includes(type)) {
    return res.status(400).json({
      error: `type must be one of: ${VALID_TYPES.join(', ')}`,
    });
  }

  const filePath = path.join(SCHEMA_DIR, `${type}.md`);
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: `template not found for type: ${type}` });
  }

  const content = fs.readFileSync(filePath, 'utf-8');
  res.type('text/markdown').send(content);
});

export default router;
