import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';

const BASE_URL = process.env.QUESTION_GEN_URL || 'http://localhost:3002';

async function apiCall(method, path, body) {
  const opts = {
    method,
    headers: { 'Content-Type': 'application/json' },
  };
  if (body) opts.body = JSON.stringify(body);

  const res = await fetch(`${BASE_URL}${path}`, opts);
  const data = await res.json();

  if (!res.ok) {
    return {
      content: [{ type: 'text', text: `Error: ${data.error || res.statusText}` }],
      isError: true,
    };
  }
  return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
}

const server = new McpServer({
  name: 'question-gen',
  version: '1.0.0',
});

// -- Topics --

server.tool(
  'list_topics',
  'List all registered topics. Returns array of { id, name }.',
  {},
  async () => apiCall('GET', '/api/topics')
);

server.tool(
  'register_topic',
  'Register a new topic. Returns the created { id, name }.',
  { name: z.string().describe('Topic name') },
  async ({ name }) => apiCall('POST', '/api/topics', { name })
);

// -- Sources --

server.tool(
  'list_sources',
  'List all registered sources. Returns array of { id, name, type }.',
  {},
  async () => apiCall('GET', '/api/sources')
);

server.tool(
  'register_source',
  'Register a new source. Returns the created { id, name, type }.',
  {
    name: z.string().describe('Source name'),
    type: z.enum(['lecture', 'exam', 'notes', 'textbook', 'homework', 'other'])
      .describe('Source type'),
  },
  async ({ name, type }) => apiCall('POST', '/api/sources', { name, type })
);

// -- Questions --

server.tool(
  'list_questions',
  'List all questions (metadata only). Returns array of { id, topics, source, type }.',
  {},
  async () => apiCall('GET', '/api/questions')
);

server.tool(
  'get_question',
  'Get a question by ID with full content.',
  { id: z.number().int().describe('Question ID') },
  async ({ id }) => apiCall('GET', `/api/questions/${id}`)
);

server.tool(
  'add_true_false_question',
  [
    'Add a true/false question.',
    'Topics and source must already be registered (use list_topics/list_sources to check).',
    'LaTeX is supported in question and explanation using $...$ delimiters.',
  ].join(' '),
  {
    topics: z.array(z.number().int()).min(1)
      .describe('Array of topic IDs this question belongs to'),
    source: z.number().int()
      .describe('Source ID this question comes from'),
    question: z.string().min(1)
      .describe('The true/false statement'),
    answer: z.enum(['True', 'False'])
      .describe('The correct answer'),
    explanation: z.string().min(1)
      .describe('Explanation of why the answer is correct'),
  },
  async ({ topics, source, question, answer, explanation }) =>
    apiCall('POST', '/api/questions/true-false', { topics, source, question, answer, explanation })
);

server.tool(
  'add_select_all_question',
  [
    'Add a select-all-that-apply question with multiple choices.',
    'Topics and source must already be registered.',
    'LaTeX is supported in question, choices, and explanation using $...$ delimiters.',
  ].join(' '),
  {
    topics: z.array(z.number().int()).min(1)
      .describe('Array of topic IDs this question belongs to'),
    source: z.number().int()
      .describe('Source ID this question comes from'),
    question: z.string().min(1)
      .describe('The question prompt'),
    choices: z.array(z.object({
      label: z.string().min(1).describe('Choice label (e.g. "a", "b", "c")'),
      text: z.string().min(1).describe('Choice text'),
      answer: z.enum(['True', 'False']).describe('Whether this choice is correct'),
    })).min(2)
      .describe('At least 2 choices'),
    explanation: z.string().optional()
      .describe('Optional explanation'),
  },
  async ({ topics, source, question, choices, explanation }) =>
    apiCall('POST', '/api/questions/select-all', { topics, source, question, choices, explanation })
);

server.tool(
  'add_short_answer_question',
  [
    'Add a short answer question with one or more parts.',
    'Topics and source must already be registered.',
    'LaTeX is supported in background, questions, and answers using $...$ delimiters.',
  ].join(' '),
  {
    topics: z.array(z.number().int()).min(1)
      .describe('Array of topic IDs this question belongs to'),
    source: z.number().int()
      .describe('Source ID this question comes from'),
    background: z.string().optional()
      .describe('Optional background context shared across all parts'),
    parts: z.array(z.object({
      label: z.string().min(1).describe('Part label (e.g. "a", "b", "c")'),
      question: z.string().min(1).describe('The part question'),
      answer: z.string().min(1).describe('The expected answer'),
    })).min(1)
      .describe('One or more question parts'),
  },
  async ({ topics, source, background, parts }) =>
    apiCall('POST', '/api/questions/short-answer', { topics, source, background, parts })
);

const transport = new StdioServerTransport();
await server.connect(transport);
