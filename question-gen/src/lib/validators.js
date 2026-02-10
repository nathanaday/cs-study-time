import { topicExists, sourceExists } from './store.js';

const VALID_SOURCE_TYPES = ['lecture', 'exam', 'notes', 'textbook', 'homework', 'other'];

function validateCommon(body) {
  const { topics, source } = body;

  if (!Array.isArray(topics) || topics.length === 0) {
    return { valid: false, error: 'topics must be a non-empty array of integers' };
  }
  for (const t of topics) {
    if (!Number.isInteger(t)) {
      return { valid: false, error: `invalid topic id: ${t}` };
    }
    if (!topicExists(t)) {
      return { valid: false, error: `topic ${t} does not exist` };
    }
  }

  if (!Number.isInteger(source)) {
    return { valid: false, error: 'source must be an integer' };
  }
  if (!sourceExists(source)) {
    return { valid: false, error: `source ${source} does not exist` };
  }

  return { valid: true };
}

export function validateTrueFalse(body) {
  const common = validateCommon(body);
  if (!common.valid) return common;

  if (typeof body.question !== 'string' || body.question.trim() === '') {
    return { valid: false, error: 'question is required and must be a non-empty string' };
  }
  if (body.answer !== 'True' && body.answer !== 'False') {
    return { valid: false, error: 'answer must be "True" or "False"' };
  }
  if (typeof body.explanation !== 'string' || body.explanation.trim() === '') {
    return { valid: false, error: 'explanation is required and must be a non-empty string' };
  }

  return { valid: true };
}

export function validateSelectAll(body) {
  const common = validateCommon(body);
  if (!common.valid) return common;

  if (typeof body.question !== 'string' || body.question.trim() === '') {
    return { valid: false, error: 'question is required and must be a non-empty string' };
  }
  if (!Array.isArray(body.choices) || body.choices.length < 2) {
    return { valid: false, error: 'choices must be an array with at least 2 items' };
  }
  for (const choice of body.choices) {
    if (typeof choice.label !== 'string' || choice.label.trim() === '') {
      return { valid: false, error: 'each choice must have a non-empty label' };
    }
    if (typeof choice.text !== 'string' || choice.text.trim() === '') {
      return { valid: false, error: 'each choice must have a non-empty text' };
    }
    if (choice.answer !== 'True' && choice.answer !== 'False') {
      return { valid: false, error: 'each choice answer must be "True" or "False"' };
    }
  }
  if (body.explanation !== undefined && typeof body.explanation !== 'string') {
    return { valid: false, error: 'explanation must be a string if provided' };
  }

  return { valid: true };
}

export function validateShortAnswer(body) {
  const common = validateCommon(body);
  if (!common.valid) return common;

  if (body.background !== undefined && typeof body.background !== 'string') {
    return { valid: false, error: 'background must be a string if provided' };
  }
  if (!Array.isArray(body.parts) || body.parts.length === 0) {
    return { valid: false, error: 'parts must be a non-empty array' };
  }
  for (const part of body.parts) {
    if (typeof part.label !== 'string' || part.label.trim() === '') {
      return { valid: false, error: 'each part must have a non-empty label' };
    }
    if (typeof part.question !== 'string' || part.question.trim() === '') {
      return { valid: false, error: 'each part must have a non-empty question' };
    }
    if (typeof part.answer !== 'string' || part.answer.trim() === '') {
      return { valid: false, error: 'each part must have a non-empty answer' };
    }
  }

  return { valid: true };
}

export function validateSourceType(type) {
  return VALID_SOURCE_TYPES.includes(type);
}

export { VALID_SOURCE_TYPES };
