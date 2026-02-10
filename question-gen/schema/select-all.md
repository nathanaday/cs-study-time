# Select All That Apply Question Template

## Markdown Format

```markdown
---
id: 42
topics: [1, 3]
source: 2
---

# Question

Which of the following are true about BFS?

# Choices

## a

BFS explores all neighbors at the current depth before moving deeper.

**Answer:** True

## b

BFS uses a stack data structure.

**Answer:** False

# Explanation

BFS uses a queue, not a stack...
```

## JSON Request Body (POST /api/questions/select-all)

```json
{
  "topics": [1, 3],
  "source": 2,
  "question": "Which of the following are true about BFS?",
  "choices": [
    { "label": "a", "text": "BFS explores all neighbors at the current depth before moving deeper.", "answer": "True" },
    { "label": "b", "text": "BFS uses a stack data structure.", "answer": "False" }
  ],
  "explanation": "BFS uses a queue, not a stack..."
}
```

## Fields

- **topics** (required): Non-empty array of integer topic IDs. Each must exist in topics.json.
- **source** (required): Integer source ID. Must exist in sources.json.
- **question** (required): Non-empty string. Supports LaTeX with `$...$` delimiters.
- **choices** (required): Array with at least 2 items. Each choice has:
  - **label** (required): Non-empty string (e.g., "a", "b", "c").
  - **text** (required): Non-empty string describing the choice.
  - **answer** (required): Must be exactly `"True"` or `"False"`.
- **explanation** (optional): String. Supports LaTeX with `$...$` delimiters.
