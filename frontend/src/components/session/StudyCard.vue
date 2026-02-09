<script setup>
import KatexRenderer from '../shared/KatexRenderer.vue'

defineProps({
  question: { type: Object, required: true },
})
</script>

<template>
  <div class="study-card bounce-in">
    <div class="study-card__body">
      <KatexRenderer :text="question.question" />
    </div>
  </div>
</template>

<style scoped>
.study-card {
  background: var(--color-bg-card);
  border-radius: var(--radius-lg);
  padding: 32px;
  box-shadow: 0 4px 20px var(--color-shadow);
  min-height: 160px;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
}

.study-card__body {
  font-size: 1.15rem;
  line-height: 1.7;
}
</style>
