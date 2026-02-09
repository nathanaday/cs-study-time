<script setup>
import KatexRenderer from '../shared/KatexRenderer.vue'
import BubbleButton from '../shared/BubbleButton.vue'

defineProps({
  result: { type: Object, required: true },
})

defineEmits(['next'])
</script>

<template>
  <div
    class="result-overlay bounce-in"
    :class="result.correct ? 'result-overlay--correct' : 'result-overlay--incorrect'"
  >
    <div class="result-overlay__header">
      <span class="result-overlay__label">
        {{ result.correct ? 'Correct!' : 'Incorrect' }}
      </span>
      <span class="result-overlay__answer">
        Answer: <strong>{{ result.correct_answer === 'true' ? 'True' : 'False' }}</strong>
      </span>
    </div>

    <div v-if="result.explanation" class="result-overlay__explanation">
      <KatexRenderer :text="result.explanation" />
    </div>

    <BubbleButton
      variant="secondary"
      size="md"
      @click="$emit('next')"
    >
      Next Question
    </BubbleButton>
  </div>
</template>

<style scoped>
.result-overlay {
  border-radius: var(--radius-lg);
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  align-items: center;
  text-align: center;
}

.result-overlay--correct {
  background: #f0faf0;
  border: 2px solid var(--color-correct);
}

.result-overlay--incorrect {
  background: #faf0f0;
  border: 2px solid var(--color-incorrect);
}

.result-overlay__header {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.result-overlay__label {
  font-size: 1.4rem;
  font-weight: 800;
}

.result-overlay--correct .result-overlay__label {
  color: var(--color-correct);
}

.result-overlay--incorrect .result-overlay__label {
  color: var(--color-incorrect);
}

.result-overlay__answer {
  color: var(--color-text-muted);
  font-size: 0.95rem;
}

.result-overlay__explanation {
  color: var(--color-text);
  line-height: 1.6;
  max-width: 500px;
}
</style>
