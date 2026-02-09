<script setup>
import BubbleButton from '../shared/BubbleButton.vue'

defineProps({
  correct: { type: Number, default: 0 },
  incorrect: { type: Number, default: 0 },
})

defineEmits(['back'])
</script>

<template>
  <div class="completion bounce-in">
    <h2 class="completion__title">Session Complete</h2>
    <div class="completion__score">
      <div class="completion__stat completion__stat--correct">
        <span class="completion__stat-value">{{ correct }}</span>
        <span class="completion__stat-label">Correct</span>
      </div>
      <div class="completion__divider"></div>
      <div class="completion__stat completion__stat--incorrect">
        <span class="completion__stat-value">{{ incorrect }}</span>
        <span class="completion__stat-label">Incorrect</span>
      </div>
    </div>
    <p class="completion__ratio">
      {{ correct + incorrect > 0 ? Math.round((correct / (correct + incorrect)) * 100) : 0 }}% accuracy
    </p>
    <BubbleButton variant="primary" size="lg" @click="$emit('back')">
      Back to Dashboard
    </BubbleButton>
  </div>
</template>

<style scoped>
.completion {
  background: var(--color-bg-card);
  border-radius: var(--radius-lg);
  padding: 40px;
  box-shadow: 0 4px 20px var(--color-shadow);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  text-align: center;
  max-width: 420px;
  margin: 40px auto;
}

.completion__title {
  color: var(--color-primary);
}

.completion__score {
  display: flex;
  align-items: center;
  gap: 24px;
}

.completion__stat {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.completion__stat-value {
  font-size: 2.5rem;
  font-weight: 800;
  line-height: 1;
}

.completion__stat--correct .completion__stat-value {
  color: var(--color-correct);
}

.completion__stat--incorrect .completion__stat-value {
  color: var(--color-incorrect);
}

.completion__stat-label {
  font-size: 0.85rem;
  color: var(--color-text-muted);
  font-weight: 600;
  margin-top: 4px;
}

.completion__divider {
  width: 1px;
  height: 48px;
  background: var(--color-border);
}

.completion__ratio {
  font-size: 1.2rem;
  font-weight: 700;
  color: var(--color-text);
}
</style>
