<script setup>
import { ref, computed } from 'vue'
import KatexRenderer from '../shared/KatexRenderer.vue'
import BubbleButton from '../shared/BubbleButton.vue'

const props = defineProps({
  question: { type: Object, required: true },
  result: { type: Object, default: null },
  selfScoreSubmitted: { type: Boolean, default: false },
})

const emit = defineEmits(['answer', 'selfScore'])

const revealed = ref(false)
const creditPercent = ref(50)

const sliderEmoji = computed(() => {
  const v = creditPercent.value
  if (v <= 50) return '\u{1F616}'
  if (v <= 60) return '\u{1FAE0}'
  if (v <= 70) return '\u{1F928}'
  if (v <= 80) return '\u{1F642}'
  if (v <= 90) return '\u{1F604}'
  return '\u{1F929}'
})

function revealAnswers() {
  revealed.value = true
  emit('answer')
}

function submitCredit() {
  emit('selfScore', creditPercent.value)
}
</script>

<template>
  <div class="sa-card bounce-in">
    <div v-if="question.content.background" class="sa-card__background">
      <KatexRenderer :text="question.content.background" />
    </div>

    <div v-if="question.source_name" class="sa-card__source">
      {{ question.source_name }}
    </div>

    <div class="sa-card__parts">
      <div
        v-for="part in question.content.parts"
        :key="part.label"
        class="sa-card__part"
      >
        <div class="sa-card__part-header">
          <span class="sa-card__part-label">{{ part.label }})</span>
          <span class="sa-card__part-question">
            <KatexRenderer :text="part.question" />
          </span>
        </div>
        <div v-if="revealed" class="sa-card__part-answer">
          <span class="sa-card__answer-label">Answer:</span>
          <KatexRenderer :text="part.answer" />
        </div>
      </div>
    </div>

    <BubbleButton
      v-if="!revealed"
      variant="primary"
      size="md"
      @click="revealAnswers"
    >
      Reveal Answers
    </BubbleButton>

    <div v-if="revealed && !selfScoreSubmitted" class="sa-card__credit">
      <span class="sa-card__credit-label">How much credit would you give yourself?</span>
      <div class="sa-card__emoji">{{ sliderEmoji }}</div>
      <div class="sa-card__slider-row">
        <input
          v-model.number="creditPercent"
          type="range"
          min="0"
          max="100"
          step="5"
          class="sa-card__slider"
        />
        <span class="sa-card__percent">{{ creditPercent }}%</span>
      </div>
      <BubbleButton variant="primary" size="md" @click="submitCredit">
        Submit
      </BubbleButton>
    </div>

    <div v-if="selfScoreSubmitted" class="sa-card__credit-result">
      Self-assessed: <strong>{{ creditPercent }}%</strong>
    </div>
  </div>
</template>

<style scoped>
.sa-card {
  background: var(--color-bg-card);
  border-radius: var(--radius-lg);
  padding: 28px;
  box-shadow: 0 4px 20px var(--color-shadow);
  display: flex;
  flex-direction: column;
  gap: 16px;
  max-height: 70vh;
  overflow-y: auto;
  position: relative;
}

.sa-card__background {
  font-size: 1.05rem;
  line-height: 1.7;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--color-border);
}

.sa-card__source {
  font-size: 0.75rem;
  color: var(--color-text-muted);
  opacity: 0.7;
  text-align: right;
}

.sa-card__parts {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.sa-card__part {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.sa-card__part-header {
  display: flex;
  gap: 8px;
  align-items: flex-start;
}

.sa-card__part-label {
  font-weight: 800;
  min-width: 24px;
  color: var(--color-primary);
}

.sa-card__part-question {
  flex: 1;
  line-height: 1.6;
}

.sa-card__part-answer {
  margin-left: 32px;
  padding: 12px;
  background: #f0faf0;
  border-left: 3px solid var(--color-correct);
  border-radius: 0 var(--radius-sm) var(--radius-sm) 0;
  line-height: 1.6;
}

.sa-card__answer-label {
  font-weight: 700;
  color: var(--color-correct);
  margin-right: 6px;
}

.sa-card__credit {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding-top: 12px;
  border-top: 1px solid var(--color-border);
}

.sa-card__credit-label {
  font-weight: 600;
  color: var(--color-text-muted);
  font-size: 0.95rem;
}

.sa-card__emoji {
  font-size: 2.8rem;
  line-height: 1;
  text-align: center;
}

.sa-card__slider-row {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  max-width: 320px;
}

.sa-card__slider {
  flex: 1;
  -webkit-appearance: none;
  appearance: none;
  height: 8px;
  border-radius: 4px;
  background: var(--color-border);
  outline: none;
  cursor: pointer;
}

.sa-card__slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: var(--color-primary);
  border: 2px solid var(--color-bg-card);
  box-shadow: 0 2px 6px var(--color-shadow);
  cursor: pointer;
}

.sa-card__slider::-moz-range-thumb {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: var(--color-primary);
  border: 2px solid var(--color-bg-card);
  box-shadow: 0 2px 6px var(--color-shadow);
  cursor: pointer;
}

.sa-card__percent {
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--color-text);
  min-width: 48px;
  text-align: right;
}

.sa-card__credit-result {
  text-align: center;
  font-size: 1rem;
  color: var(--color-text-muted);
  padding-top: 8px;
  border-top: 1px solid var(--color-border);
}
</style>
