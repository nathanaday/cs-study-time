<script setup>
import BubbleButton from '../shared/BubbleButton.vue'

defineEmits(['confirm', 'cancel'])
</script>

<template>
  <div class="reset-modal__overlay" @click.self="$emit('cancel')">
    <div class="reset-modal__card">
      <h3 class="reset-modal__title">Reset All Data?</h3>
      <p class="reset-modal__text">
        This will permanently delete your user profile and all study progress,
        including attempts, streaks, stars, and hidden questions.
        This action cannot be undone.
      </p>
      <div class="reset-modal__actions">
        <BubbleButton variant="secondary" size="md" @click="$emit('cancel')">
          Cancel
        </BubbleButton>
        <BubbleButton variant="incorrect" size="md" @click="$emit('confirm')">
          Reset Everything
        </BubbleButton>
      </div>
    </div>
  </div>
</template>

<style scoped>
.reset-modal__overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
}

.reset-modal__card {
  background: var(--color-bg-card);
  border-radius: var(--radius-lg);
  padding: 32px;
  max-width: 420px;
  width: 90%;
  box-shadow: 0 8px 32px var(--color-shadow);
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.reset-modal__title {
  font-size: 1.3rem;
}

.reset-modal__text {
  color: var(--color-text-muted);
  font-size: 0.95rem;
  line-height: 1.5;
}

.reset-modal__actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 8px;
}
</style>
