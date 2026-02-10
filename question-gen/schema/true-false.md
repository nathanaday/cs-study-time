# True/False Question Template

## Markdown Format

```markdown
---
id: 1
topics: [1, 3]
source: 2
---

# Question

In an undirected graph $G = (V, E)$, an edge represents...

# Answer

False

# Explanation

An edge in an undirected graph represents a symmetric relationship...
```

## JSON Request Body (POST /api/questions/true-false)

```json
{
  "topics": [1, 3],
  "source": 2,
  "question": "In an undirected graph $G = (V, E)$, an edge represents...",
  "answer": "True",
  "explanation": "An edge in an undirected graph represents a symmetric relationship..."
}
```

## Fields

- **topics** (required): Non-empty array of integer topic IDs. Each must exist in topics.json.
- **source** (required): Integer source ID. Must exist in sources.json.
- **question** (required): Non-empty string. Supports LaTeX with `$...$` delimiters.
- **answer** (required): Must be exactly `"True"` or `"False"`.
- **explanation** (required): Non-empty string. Supports LaTeX with `$...$` delimiters.
