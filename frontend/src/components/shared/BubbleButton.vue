<script setup>
defineProps({
  variant: { type: String, default: 'primary' },
  disabled: { type: Boolean, default: false },
  size: { type: String, default: 'md' },
})

defineEmits(['click'])
</script>

<template>
  <button
    class="bubble-btn"
    :class="[`bubble-btn--${variant}`, `bubble-btn--${size}`, { 'bubble-btn--disabled': disabled }]"
    :disabled="disabled"
    @click="$emit('click')"
  >
    <slot />
  </button>
</template>

<style scoped>
.bubble-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-weight: 700;
  border-radius: var(--radius-lg);
  transition: transform 0.2s var(--transition-bounce),
              box-shadow 0.2s ease,
              background-color 0.2s ease;
  position: relative;
  overflow: hidden;
}

.bubble-btn--sm {
  padding: 8px 18px;
  font-size: 0.9rem;
}

.bubble-btn--md {
  padding: 12px 28px;
  font-size: 1rem;
}

.bubble-btn--lg {
  padding: 16px 36px;
  font-size: 1.1rem;
}

.bubble-btn--primary {
  background-color: var(--color-primary);
  color: var(--color-text-on-primary);
  box-shadow: 0 4px 12px var(--color-shadow);
}

.bubble-btn--primary:hover:not(:disabled) {
  background-color: var(--color-primary-hover);
  transform: translateY(-2px);
  box-shadow: 0 6px 18px var(--color-shadow);
}

.bubble-btn--primary:active:not(:disabled) {
  transform: translateY(0) scale(0.97);
}

.bubble-btn--secondary {
  background-color: var(--color-bg-card);
  color: var(--color-primary);
  border: 2px solid var(--color-primary);
}

.bubble-btn--secondary:hover:not(:disabled) {
  background-color: var(--color-primary-light);
  transform: translateY(-2px);
}

.bubble-btn--correct {
  background-color: var(--color-correct);
  color: #fff;
  box-shadow: 0 4px 12px var(--color-shadow);
}

.bubble-btn--incorrect {
  background-color: var(--color-incorrect);
  color: #fff;
  box-shadow: 0 4px 12px var(--color-shadow);
}

.bubble-btn--disabled,
.bubble-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}
</style>
