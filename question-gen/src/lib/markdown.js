import matter from 'gray-matter';

// -- Builders --

export function buildTrueFalseMarkdown({ id, topics, source, question, answer, explanation }) {
  return [
    buildFrontmatter(id, topics, source),
    '# Question',
    '',
    question,
    '',
    '# Answer',
    '',
    answer,
    '',
    '# Explanation',
    '',
    explanation,
    '',
  ].join('\n');
}

export function buildSelectAllMarkdown({ id, topics, source, question, choices, explanation }) {
  const lines = [
    buildFrontmatter(id, topics, source),
    '# Question',
    '',
    question,
    '',
    '# Choices',
    '',
  ];

  for (const choice of choices) {
    lines.push(`## ${choice.label}`, '', choice.text, '', `**Answer:** ${choice.answer}`, '');
  }

  lines.push('# Explanation', '');
  lines.push(explanation || '', '');

  return lines.join('\n');
}

export function buildShortAnswerMarkdown({ id, topics, source, background, parts }) {
  const lines = [
    buildFrontmatter(id, topics, source),
  ];

  if (background) {
    lines.push('# Background', '', background, '');
  }

  lines.push('# Parts', '');

  for (const part of parts) {
    lines.push(`## ${part.label}`, '', part.question, '', `**Answer:** ${part.answer}`, '');
  }

  return lines.join('\n');
}

function buildFrontmatter(id, topics, source) {
  return [
    '---',
    `id: ${id}`,
    `topics: [${topics.join(', ')}]`,
    `source: ${source}`,
    '---',
    '',
  ].join('\n');
}

// -- Parsers --

export function parseQuestionFile(content) {
  const { data: meta, content: body } = matter(content);
  return { meta, body };
}

export function parseQuestionMetadata(content) {
  const { data } = matter(content);
  return data;
}
