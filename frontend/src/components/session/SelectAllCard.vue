<script setup>
import { ref } from 'vue'
import KatexRenderer from '../shared/KatexRenderer.vue'
import BubbleButton from '../shared/BubbleButton.vue'

const props = defineProps({
  question: { type: Object, required: true },
  result: { type: Object, default: null },
})

const emit = defineEmits(['answer'])

const selected = ref(new Set())

function toggleChoice(label) {
  const s = new Set(selected.value)
  if (s.has(label)) {
    s.delete(label)
  } else {
    s.add(label)
  }
  selected.value = s
}

function submit() {
  emit('answer', [...selected.value])
}

function choiceClass(choice) {
  if (!props.result) return ''
  const isCorrectChoice = choice.answer === 'True'
  const wasSelected = props.result.correctLabels
    ? selected.value.has(choice.label)
    : false
  if (isCorrectChoice) return 'select-all-card__choice--correct'
  if (wasSelected && !isCorrectChoice) return 'select-all-card__choice--wrong'
  return ''
}
</script>

<template>
  <div class="select-all-card bounce-in">
    <div class="select-all-card__body">
      <KatexRenderer :text="question.content.question" />
    </div>

    <div v-if="question.source_name" class="select-all-card__source">
      {{ question.source_name }}
    </div>

    <div class="select-all-card__choices">
      <label
        v-for="choice in question.content.choices"
        :key="choice.label"
        class="select-all-card__choice"
        :class="choiceClass(choice)"
      >
        <input
          type="checkbox"
          :checked="selected.has(choice.label)"
          :disabled="!!result"
          @change="toggleChoice(choice.label)"
        />
        <span class="select-all-card__choice-label">{{ choice.label }}.</span>
        <span class="select-all-card__choice-text">
          <KatexRenderer :text="choice.text" />
        </span>
      </label>
    </div>

    <BubbleButton
      v-if="!result"
      variant="primary"
      size="md"
      :disabled="selected.size === 0"
      @click="submit"
    >
      Submit
    </BubbleButton>

    <div
      v-if="result"
      class="select-all-card__result"
      :class="result.correct ? 'select-all-card__result--correct' : 'select-all-card__result--incorrect'"
    >
      <span class="select-all-card__result-label">
        {{ result.correct ? 'Correct!' : 'Incorrect' }}
      </span>
      <div v-if="result.explanation" class="select-all-card__explanation">
        <KatexRenderer :text="result.explanation" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.select-all-card {
  background: var(--color-bg-card);
  border-radius: var(--radius-lg);
  padding: 32px;
  box-shadow: 0 4px 20px var(--color-shadow);
  display: flex;
  flex-direction: column;
  gap: 16px;
  position: relative;
}

.select-all-card__body {
  font-size: 1.15rem;
  line-height: 1.7;
  text-align: center;
}

.select-all-card__source {
  font-size: 0.75rem;
  color: var(--color-text-muted);
  opacity: 0.7;
  text-align: right;
}

.select-all-card__choices {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.select-all-card__choice {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 10px 12px;
  border-radius: var(--radius-sm);
  cursor: pointer;
  border: 2px solid transparent;
  transition: background-color 0.15s ease, border-color 0.15s ease;
}

.select-all-card__choice:hover {
  background: var(--color-primary-light);
}

.select-all-card__choice--correct {
  border-color: var(--color-correct);
  background: #f0faf0;
}

.select-all-card__choice--wrong {
  border-color: var(--color-incorrect);
  background: #faf0f0;
}

.select-all-card__choice-label {
  font-weight: 700;
  min-width: 20px;
}

.select-all-card__choice-text {
  flex: 1;
  line-height: 1.5;
}

.select-all-card__result {
  border-radius: var(--radius-md);
  padding: 16px;
  text-align: center;
}

.select-all-card__result--correct {
  background: #f0faf0;
  border: 2px solid var(--color-correct);
}

.select-all-card__result--incorrect {
  background: #faf0f0;
  border: 2px solid var(--color-incorrect);
}

.select-all-card__result-label {
  font-size: 1.3rem;
  font-weight: 800;
}

.select-all-card__result--correct .select-all-card__result-label {
  color: var(--color-correct);
}

.select-all-card__result--incorrect .select-all-card__result-label {
  color: var(--color-incorrect);
}

.select-all-card__explanation {
  margin-top: 8px;
  color: var(--color-text);
  line-height: 1.6;
}

input[type="checkbox"] {
  width: 18px;
  height: 18px;
  accent-color: var(--color-primary);
  cursor: pointer;
  margin-top: 2px;
}
</style>
