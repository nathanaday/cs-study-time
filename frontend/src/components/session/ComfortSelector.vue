<script setup>
import { ref } from 'vue'
import BubbleButton from '../shared/BubbleButton.vue'

const emit = defineEmits(['confirm'])

const selected = ref(null)

const levels = [
  { value: 1, label: '1', description: 'Not confident' },
  { value: 2, label: '2', description: 'Somewhat shaky' },
  { value: 3, label: '3', description: 'Neutral' },
  { value: 4, label: '4', description: 'Fairly confident' },
  { value: 5, label: '5', description: 'Mastered' },
]

function pick(value) {
  selected.value = value
}

function confirm() {
  if (selected.value != null) {
    emit('confirm', selected.value)
  }
}
</script>

<template>
  <div class="comfort bounce-in">
    <span class="comfort__label">How confident do you feel?</span>
    <div class="comfort__buttons">
      <button
        v-for="level in levels"
        :key="level.value"
        class="comfort__btn"
        :class="{ 'comfort__btn--active': selected === level.value }"
        @click="pick(level.value)"
      >
        <span class="comfort__btn-number">{{ level.label }}</span>
        <span class="comfort__btn-desc">{{ level.description }}</span>
      </button>
    </div>
    <BubbleButton
      variant="primary"
      size="md"
      :disabled="selected == null"
      @click="confirm"
    >
      Next Question
    </BubbleButton>
  </div>
</template>

<style scoped>
.comfort {
  background: var(--color-bg-card);
  border-radius: var(--radius-lg);
  padding: 20px;
  box-shadow: 0 4px 16px var(--color-shadow);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
}

.comfort__label {
  font-weight: 700;
  font-size: 1rem;
  color: var(--color-text);
}

.comfort__buttons {
  display: flex;
  gap: 8px;
}

.comfort__btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  padding: 10px 12px;
  border-radius: var(--radius-md);
  border: 2px solid var(--color-border);
  background: var(--color-bg);
  cursor: pointer;
  transition: border-color 0.15s ease, background-color 0.15s ease,
              transform 0.15s var(--transition-bounce);
  min-width: 64px;
}

.comfort__btn:hover {
  border-color: var(--color-primary);
  background: var(--color-primary-light);
}

.comfort__btn--active {
  border-color: var(--color-primary);
  background: var(--color-primary-light);
  transform: translateY(-2px);
}

.comfort__btn-number {
  font-size: 1.3rem;
  font-weight: 800;
  color: var(--color-primary);
}

.comfort__btn-desc {
  font-size: 0.6rem;
  font-weight: 600;
  color: var(--color-text-muted);
  text-align: center;
}
</style>
