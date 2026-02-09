<script setup>
import { computed } from 'vue'

const props = defineProps({
  correct: { type: Number, default: 0 },
  incorrect: { type: Number, default: 0 },
  current: { type: Number, default: 0 },
  total: { type: Number, default: 0 },
})

const total = computed(() => props.correct + props.incorrect)

const correctPercent = computed(() => {
  if (total.value === 0) return 50
  return Math.round((props.correct / total.value) * 100)
})
</script>

<template>
  <div class="score-bar">
    <div class="score-bar__counts">
      <span class="score-bar__correct">{{ correct }} correct</span>
      <span class="score-bar__progress">{{ current }} / {{ props.total }}</span>
      <span class="score-bar__incorrect">{{ incorrect }} incorrect</span>
    </div>
    <div class="score-bar__track">
      <div
        class="score-bar__fill score-bar__fill--correct"
        :style="{ width: correctPercent + '%' }"
      ></div>
    </div>
  </div>
</template>

<style scoped>
.score-bar {
  background: var(--color-bg-card);
  border-radius: var(--radius-md);
  padding: 12px 16px;
  box-shadow: 0 2px 8px var(--color-shadow);
}

.score-bar__counts {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  font-size: 0.85rem;
  font-weight: 700;
}

.score-bar__correct {
  color: var(--color-correct);
}

.score-bar__incorrect {
  color: var(--color-incorrect);
}

.score-bar__progress {
  color: var(--color-text-muted);
}

.score-bar__track {
  height: 8px;
  background: var(--color-incorrect);
  border-radius: 4px;
  overflow: hidden;
}

.score-bar__fill--correct {
  height: 100%;
  background: var(--color-correct);
  border-radius: 4px;
  transition: width 0.4s var(--transition-bounce);
}
</style>
