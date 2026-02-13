<script setup>
import { computed } from 'vue'
import KatexRenderer from '../shared/KatexRenderer.vue'
import StarToggle from '../session/StarToggle.vue'
import HideToggle from '../shared/HideToggle.vue'

const props = defineProps({
  question: { type: Object, required: true },
  number: { type: Number, required: true },
  expanded: { type: Boolean, default: false },
})

defineEmits(['toggle-expand', 'toggle-star', 'toggle-hide'])

const typeLabels = {
  tf: 'T/F',
  selectall: 'Select All',
  shortanswer: 'Short Answer',
}

const typeBadge = computed(() => typeLabels[props.question.type] || props.question.type)

const statusClass = computed(() => {
  if (props.question.correct_count > 0) return 'status--correct'
  if (props.question.incorrect_count > 0) return 'status--incorrect'
  return 'status--unattempted'
})

const statusLabel = computed(() => {
  if (props.question.correct_count > 0) return 'Correct'
  if (props.question.incorrect_count > 0) return 'Incorrect'
  return 'Unattempted'
})

const questionPreview = computed(() => {
  const text = props.question.content.question || ''
  if (text.length <= 80) return text
  return text.slice(0, 80) + '...'
})

const answerDisplay = computed(() => {
  const q = props.question
  if (q.type === 'tf') {
    return q.content.answer === 'true' ? 'True' : 'False'
  }
  if (q.type === 'selectall') {
    const correct = (q.content.choices || [])
      .filter(c => c.answer === 'True')
      .map(c => `${c.label}) ${c.text}`)
    return correct.join(', ')
  }
  if (q.type === 'shortanswer') {
    const parts = q.content.parts || []
    return parts.map(p => `${p.label}) ${p.answer}`).join('; ')
  }
  return ''
})
</script>

<template>
  <div
    class="bank-item"
    :class="{ 'bank-item--hidden': question.is_hidden, 'bank-item--expanded': expanded }"
  >
    <div class="bank-item__row" @click="$emit('toggle-expand')">
      <span class="bank-item__status" :class="statusClass" :title="statusLabel">
        <template v-if="question.correct_count > 0">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
        </template>
        <template v-else-if="question.incorrect_count > 0">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
        </template>
        <template v-else>&ndash;</template>
      </span>
      <span class="bank-item__number">Q{{ number }}</span>
      <span class="bank-item__preview">
        <KatexRenderer :text="questionPreview" />
      </span>
      <span class="bank-item__type">{{ typeBadge }}</span>
      <StarToggle
        :starred="!!question.is_starred"
        @toggle="$emit('toggle-star')"
      />
      <HideToggle
        :hidden="!!question.is_hidden"
        @toggle="$emit('toggle-hide')"
      />
      <span class="bank-item__chevron" :class="{ 'bank-item__chevron--open': expanded }">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9" /></svg>
      </span>
    </div>

    <div v-if="expanded" class="bank-item__detail">
      <div class="bank-item__full-question">
        <KatexRenderer :text="question.content.question || ''" />
      </div>

      <div v-if="question.type === 'selectall' && question.content.choices" class="bank-item__choices">
        <div
          v-for="choice in question.content.choices"
          :key="choice.label"
          class="bank-item__choice"
          :class="{ 'bank-item__choice--correct': choice.answer === 'True' }"
        >
          <span class="bank-item__choice-label">{{ choice.label }})</span>
          <KatexRenderer :text="choice.text" />
        </div>
      </div>

      <div v-if="question.type === 'shortanswer' && question.content.parts" class="bank-item__parts">
        <div v-if="question.content.background" class="bank-item__background">
          <KatexRenderer :text="question.content.background" />
        </div>
        <div v-for="part in question.content.parts" :key="part.label" class="bank-item__part">
          <div class="bank-item__part-question">
            <strong>{{ part.label }})</strong> <KatexRenderer :text="part.question" />
          </div>
          <div class="bank-item__part-answer">
            <KatexRenderer :text="part.answer" />
          </div>
        </div>
      </div>

      <div class="bank-item__answer">
        <span class="bank-item__answer-label">Answer:</span>
        <KatexRenderer :text="answerDisplay" />
      </div>

      <div v-if="question.content.explanation" class="bank-item__explanation">
        <span class="bank-item__explanation-label">Explanation:</span>
        <KatexRenderer :text="question.content.explanation" />
      </div>

      <div v-if="question.source_name" class="bank-item__source">
        Source: {{ question.source_name }}
      </div>
    </div>
  </div>
</template>

<style scoped>
.bank-item {
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  overflow: hidden;
  transition: opacity 0.2s ease;
}

.bank-item--hidden {
  opacity: 0.55;
}

.bank-item__row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 14px;
  cursor: pointer;
  transition: background-color 0.15s ease;
}

.bank-item__row:hover {
  background: var(--color-primary-light);
}

.bank-item__status {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  flex-shrink: 0;
  font-weight: 700;
  font-size: 0.9rem;
  color: var(--color-text-muted);
}

.status--correct {
  color: var(--color-correct);
}

.status--incorrect {
  color: var(--color-incorrect);
}

.bank-item__number {
  font-weight: 700;
  font-size: 0.85rem;
  color: var(--color-text-muted);
  flex-shrink: 0;
  min-width: 32px;
}

.bank-item__preview {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 0.9rem;
}

.bank-item__type {
  flex-shrink: 0;
  padding: 2px 8px;
  font-size: 0.7rem;
  font-weight: 700;
  background: var(--color-primary-light);
  color: var(--color-primary);
  border-radius: var(--radius-sm);
}

.bank-item__chevron {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  color: var(--color-text-muted);
  transition: transform 0.2s ease;
}

.bank-item__chevron--open {
  transform: rotate(180deg);
}

.bank-item__detail {
  padding: 16px 20px;
  border-top: 1px solid var(--color-border);
  background: var(--color-bg);
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.bank-item__full-question {
  font-size: 0.95rem;
  line-height: 1.6;
}

.bank-item__choices {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding-left: 8px;
}

.bank-item__choice {
  display: flex;
  gap: 6px;
  font-size: 0.9rem;
}

.bank-item__choice--correct {
  color: var(--color-correct);
  font-weight: 600;
}

.bank-item__choice-label {
  font-weight: 700;
  flex-shrink: 0;
}

.bank-item__parts {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.bank-item__background {
  font-size: 0.9rem;
  color: var(--color-text-muted);
}

.bank-item__part {
  padding-left: 8px;
}

.bank-item__part-question {
  font-size: 0.9rem;
}

.bank-item__part-answer {
  padding-left: 20px;
  font-size: 0.9rem;
  color: var(--color-correct);
  font-weight: 600;
}

.bank-item__answer {
  font-size: 0.9rem;
}

.bank-item__answer-label {
  font-weight: 700;
  margin-right: 6px;
}

.bank-item__explanation {
  font-size: 0.9rem;
  color: var(--color-text-muted);
}

.bank-item__explanation-label {
  font-weight: 700;
  margin-right: 6px;
  color: var(--color-text);
}

.bank-item__source {
  font-size: 0.8rem;
  color: var(--color-text-muted);
}
</style>
