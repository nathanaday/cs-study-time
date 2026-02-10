# Short Answer Question Template

## Markdown Format

```markdown
---
id: 55
topics: [2]
source: 3
---

# Background

Given a graph $G = (V, E)$ with the following adjacency list...

# Parts

## a

What is the BFS tree rooted at vertex 1?

**Answer:** The BFS tree is...

## b

What is the order of vertex discovery?

**Answer:** 1, 2, 3, 5, 4...
```

## JSON Request Body (POST /api/questions/short-answer)

```json
{
  "topics": [2],
  "source": 3,
  "background": "Given a graph $G = (V, E)$ with the following adjacency list...",
  "parts": [
    { "label": "a", "question": "What is the BFS tree rooted at vertex 1?", "answer": "The BFS tree is..." },
    { "label": "b", "question": "What is the order of vertex discovery?", "answer": "1, 2, 3, 5, 4..." }
  ]
}
```

## Fields

- **topics** (required): Non-empty array of integer topic IDs. Each must exist in topics.json.
- **source** (required): Integer source ID. Must exist in sources.json.
- **background** (optional): String providing setup context. Supports LaTeX with `$...$` delimiters.
- **parts** (required): Non-empty array. Each part has:
  - **label** (required): Non-empty string (e.g., "a", "b", "c").
  - **question** (required): Non-empty string describing the part question.
  - **answer** (required): Non-empty string with the expected answer.
