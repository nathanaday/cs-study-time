<script setup>
import KatexRenderer from '../shared/KatexRenderer.vue'
import BubbleButton from '../shared/BubbleButton.vue'

const props = defineProps({
  question: { type: Object, required: true },
  result: { type: Object, default: null },
})

const emit = defineEmits(['answer'])
</script>

<template>
  <div class="tf-card bounce-in">
    <div class="tf-card__body">
      <KatexRenderer :text="question.content.question" />
    </div>

    <div v-if="question.source_name" class="tf-card__source">
      {{ question.source_name }}
    </div>

    <div v-if="!result" class="tf-card__buttons">
      <BubbleButton variant="correct" size="lg" @click="emit('answer', 'true')">
        True
      </BubbleButton>
      <BubbleButton variant="incorrect" size="lg" @click="emit('answer', 'false')">
        False
      </BubbleButton>
    </div>

    <div
      v-if="result"
      class="tf-card__result"
      :class="result.correct ? 'tf-card__result--correct' : 'tf-card__result--incorrect'"
    >
      <span class="tf-card__result-label">
        {{ result.correct ? 'Correct!' : 'Incorrect' }}
      </span>
      <span class="tf-card__result-answer">
        Answer: <strong>{{ result.correct_answer === 'true' ? 'True' : 'False' }}</strong>
      </span>
      <div v-if="result.explanation" class="tf-card__explanation">
        <KatexRenderer :text="result.explanation" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.tf-card {
  background: var(--color-bg-card);
  border-radius: var(--radius-lg);
  padding: 32px;
  box-shadow: 0 4px 20px var(--color-shadow);
  min-height: 160px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  position: relative;
  gap: 20px;
}

.tf-card__body {
  font-size: 1.15rem;
  line-height: 1.7;
}

.tf-card__source {
  font-size: 0.75rem;
  color: var(--color-text-muted);
  opacity: 0.7;
}

.tf-card__buttons {
  display: flex;
  gap: 16px;
  justify-content: center;
}

.tf-card__result {
  border-radius: var(--radius-md);
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: center;
  width: 100%;
}

.tf-card__result--correct {
  background: #f0faf0;
  border: 2px solid var(--color-correct);
}

.tf-card__result--incorrect {
  background: #faf0f0;
  border: 2px solid var(--color-incorrect);
}

.tf-card__result-label {
  font-size: 1.3rem;
  font-weight: 800;
}

.tf-card__result--correct .tf-card__result-label {
  color: var(--color-correct);
}

.tf-card__result--incorrect .tf-card__result-label {
  color: var(--color-incorrect);
}

.tf-card__result-answer {
  color: var(--color-text-muted);
  font-size: 0.95rem;
}

.tf-card__explanation {
  color: var(--color-text);
  line-height: 1.6;
  max-width: 500px;
  margin-top: 4px;
}
</style>
