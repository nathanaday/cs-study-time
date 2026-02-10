import express from 'express';
import cors from 'cors';
import { ensureDataDirs } from './lib/store.js';
import errorHandler from './middleware/errorHandler.js';
import topicsRouter from './routes/topics.js';
import sourcesRouter from './routes/sources.js';
import templatesRouter from './routes/templates.js';
import questionsRouter from './routes/questions.js';

const app = express();
const PORT = process.env.PORT || 3002;

app.use(cors());
app.use(express.json());

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

// Routes
app.use('/api', topicsRouter);
app.use('/api', sourcesRouter);
app.use('/api', templatesRouter);
app.use('/api', questionsRouter);

// Error handler
app.use(errorHandler);

// Initialize data directories on startup
ensureDataDirs();

app.listen(PORT, () => {
  console.log(`Question generation server running on port ${PORT}`);
});
