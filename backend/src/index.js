const express = require('express');
const path = require('path');
const cors = require('cors');
const { seed } = require('./seed');
const errorHandler = require('./middleware/errorHandler');
const usersRouter = require('./routes/users');
const topicsRouter = require('./routes/topics');
const questionsRouter = require('./routes/questions');
const statsRouter = require('./routes/stats');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());
app.use('/assets', express.static(path.join(__dirname, '..', '..', 'assets')));

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

// Routes
app.use('/api', usersRouter);
app.use('/api', topicsRouter);
app.use('/api', questionsRouter);
app.use('/api', statsRouter);

// Error handler
app.use(errorHandler);

// Seed database on startup
seed();

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
