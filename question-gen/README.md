# Question Generation API

Standalone API server for registering and managing structured study questions. Questions are stored as markdown files with YAML frontmatter.

## Starting the Server

```bash
cd question-gen
npm install
node src/index.js
```

The server runs on port 3002 by default (override with the `PORT` environment variable).

## Using the MCP Server for Claude

question-gen/mcp-server.js -- Stdio-based MCP server that proxies to the REST API at localhost:3002. Exposes 9 tools:
┌───────────────────────────┬──────────────────────────────────┐
│           Tool            │             Maps to              │
├───────────────────────────┼──────────────────────────────────┤
│ list_topics               │ GET /api/topics                  │
├───────────────────────────┼──────────────────────────────────┤
│ register_topic            │ POST /api/topics                 │
├───────────────────────────┼──────────────────────────────────┤
│ list_sources              │ GET /api/sources                 │
├───────────────────────────┼──────────────────────────────────┤
│ register_source           │ POST /api/sources                │
├───────────────────────────┼──────────────────────────────────┤
│ list_questions            │ GET /api/questions               │
├───────────────────────────┼──────────────────────────────────┤
│ get_question              │ GET /api/questions/:id           │
├───────────────────────────┼──────────────────────────────────┤
│ add_true_false_question   │ POST /api/questions/true-false   │
├───────────────────────────┼──────────────────────────────────┤
│ add_select_all_question   │ POST /api/questions/select-all   │
├───────────────────────────┼──────────────────────────────────┤
│ add_short_answer_question │ POST /api/questions/short-answer │
└───────────────────────────┴──────────────────────────────────┘
Each tool has typed Zod schemas with descriptions so the LLM knows the exact format (topic ID arrays, "True"/"False" enums, choice structure,
etc.). API errors are returned as isError: true so the agent can retry.

.mcp.json -- Registers the server so Claude Code auto-discovers it when working in this project.

To use it:
1. Start the question-gen server: cd question-gen && npm start
2. Start a new Claude Code session in this project -- it will pick up .mcp.json and connect to the MCP server
3. The agent can then call tools like add_true_false_question directly

You can override the API URL with QUESTION_GEN_URL env var if needed.


## Data Storage

All question data lives in `question-gen/data/`, which is created automatically on first startup:

```
data/
  topics.json             # Registered topics with auto-incrementing IDs
  sources.json            # Registered sources with auto-incrementing IDs
  question-counter.json   # Global question ID counter
  true-false/             # One <id>.md file per true/false question
  select-all/             # One <id>.md file per select-all question
  short-answer/           # One <id>.md file per short-answer question
```

Each question is a standalone markdown file (e.g., `data/true-false/1.md`) with YAML frontmatter holding metadata and markdown headings demarcating content sections.

## Sample Commands

### Register a topic

```bash
curl -X POST localhost:3002/api/topics \
  -H 'Content-Type: application/json' \
  -d '{"name": "Graph Traversal"}'
```

### Register a source

```bash
curl -X POST localhost:3002/api/sources \
  -H 'Content-Type: application/json' \
  -d '{"name": "Lecture 1", "type": "lecture"}'
```

Source types: `lecture`, `exam`, `notes`, `textbook`, `homework`, `other`.

### Create a true/false question

```bash
curl -X POST localhost:3002/api/questions/true-false \
  -H 'Content-Type: application/json' \
  -d '{
    "topics": [1],
    "source": 1,
    "question": "In an undirected graph $G = (V, E)$, an edge represents a one-way relationship.",
    "answer": "False",
    "explanation": "An edge in an undirected graph represents a symmetric (two-way) relationship."
  }'
```

### Create a select-all question

```bash
curl -X POST localhost:3002/api/questions/select-all \
  -H 'Content-Type: application/json' \
  -d '{
    "topics": [1],
    "source": 1,
    "question": "Which of the following are true about BFS?",
    "choices": [
      {"label": "a", "text": "BFS explores all neighbors at the current depth before moving deeper.", "answer": "True"},
      {"label": "b", "text": "BFS uses a stack data structure.", "answer": "False"}
    ],
    "explanation": "BFS uses a queue and explores level by level."
  }'
```

### Create a short-answer question

```bash
curl -X POST localhost:3002/api/questions/short-answer \
  -H 'Content-Type: application/json' \
  -d '{
    "topics": [1],
    "source": 1,
    "background": "Given a graph $G = (V, E)$ with vertices {1,2,3,4,5}.",
    "parts": [
      {"label": "a", "question": "What is the BFS tree rooted at vertex 1?", "answer": "The BFS tree includes edges (1,2), (1,3), (2,4), (3,5)."},
      {"label": "b", "question": "What is the order of vertex discovery?", "answer": "1, 2, 3, 4, 5"}
    ]
  }'
```

### List all questions

```bash
curl localhost:3002/api/questions
```

### Get a specific question

```bash
curl localhost:3002/api/questions/1
```

### Get a schema template

```bash
curl localhost:3002/api/templates/true-false
curl localhost:3002/api/templates/select-all
curl localhost:3002/api/templates/short-answer
```
