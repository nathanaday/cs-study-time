<script setup>
import BubbleButton from '../shared/BubbleButton.vue'

defineProps({
  disabled: { type: Boolean, default: false },
})

const emit = defineEmits(['answer'])
</script>

<template>
  <div class="answer-buttons">
    <BubbleButton
      variant="correct"
      size="lg"
      :disabled="disabled"
      @click="emit('answer', 'true')"
    >
      True
    </BubbleButton>
    <BubbleButton
      variant="incorrect"
      size="lg"
      :disabled="disabled"
      @click="emit('answer', 'false')"
    >
      False
    </BubbleButton>
  </div>
</template>

<style scoped>
.answer-buttons {
  display: flex;
  gap: 16px;
  justify-content: center;
}

.answer-buttons .bubble-btn {
  min-width: 140px;
}
</style>
