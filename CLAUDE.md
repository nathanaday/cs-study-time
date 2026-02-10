# CS Study Time

A full-stack, locally-run flashcard-style study application where users bring their own structured repository of formatted questions, choose subtopics and question types, and run interactive study sessions.

## Tech Stack

- **Frontend:** Vue 3 (Composition API, `<script setup>`), Vue Router 5, Vite 7, KaTeX for LaTeX rendering
- **Backend:** Node.js, Express 4, better-sqlite3 (SQLite with WAL mode)
- **Language:** JavaScript (ES modules throughout, no TypeScript)
- **Database:** SQLite file at `backend/study.db`, auto-seeded on startup from `question-bank/`

## Project Structure

```
cs-study-time/
  backend/          # Express API server (port 3001)
    src/
      index.js      # App setup, routes, static serving
      database.js   # SQLite schema & initialization
      seed.js       # Seeds DB from question-bank JSON files
      routes/       # Express route handlers (users, topics, questions, stats)
      middleware/    # Error handler
  frontend/         # Vue 3 SPA (dev port 5173, proxied to backend)
    src/
      views/        # WelcomeView, DashboardView, StudySessionView
      components/   # shared/, dashboard/, session/, welcome/
      composables/  # useApi, useUser, useStudySession, useTheme
      styles/       # CSS variables, base styles, animations
      router/       # Vue Router config
  question-bank/    # User-provided question data (JSON)
    index.json      # Course/topic index
    cs570/          # Example course with tf/ subdirectory
  question-gen/     # Question generation schema templates
    schema/
  assets/           # Static files (app icons, user avatars)
```

## Running Locally

```bash
# Backend
cd backend && npm install && node src/index.js

# Frontend (separate terminal)
cd frontend && npm install && npm run dev
```

Frontend dev server proxies `/api` and `/assets` to `http://localhost:3001`.

## Supported Question Types

The application supports three question types:
- **True/False** (`tf`) - boolean answer with explanation
- **Select All That Apply** (`selectall`) - multiple correct choices from a list
- **Short Answer** (`shortanswer`) - free-form text answers, optionally multi-part

Question schema is documented in `question-gen/schema/TemplateRegistration.md`. Currently only true/false is implemented end-to-end; select-all and short-answer need frontend components and backend support.

## API Endpoints

- `GET /api/health` - health check
- `GET /api/icons` - available user avatar icons
- `GET/POST /api/users` - list/create users
- `GET/PATCH /api/users/:id` - get/update user
- `GET /api/users/:userId/topics` - topics with progress
- `GET /api/users/:userId/topics/:topicId/questions` - questions with attempt stats
- `POST /api/users/:userId/questions/:questionId/attempts` - submit answer
- `GET /api/users/:userId/stats` - user statistics

## Key Design Decisions

- Questions are stored as flat JSON files in `question-bank/` and seeded into SQLite on backend startup
- Progress tracking (attempts, correct/incorrect counts, streaks) lives in the database
- Three color themes (sage, terracotta, ocean) via CSS custom properties
- Fisher-Yates shuffle for question randomization in study sessions
- KaTeX renders inline math delimited by `$..$` in question/explanation text

## Conventions

- Never use emojis anywhere in the codebase
- Vue components use `<script setup>` with Composition API
- State management via Vue composables (no Vuex/Pinia)
- Backend uses synchronous better-sqlite3 API (no async DB calls)
- CSS variables defined in `frontend/src/styles/variables.css` per theme
