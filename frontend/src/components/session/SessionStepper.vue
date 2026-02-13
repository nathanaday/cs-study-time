<script setup>
import { computed } from 'vue'
import { useStudySession } from '../../composables/useStudySession'
import BubbleButton from '../shared/BubbleButton.vue'
import StepTopics from './StepTopics.vue'
import StepSources from './StepSources.vue'
import StepTypes from './StepTypes.vue'
import StepSummary from './StepSummary.vue'

const props = defineProps({
  userId: { type: Number, required: true },
})

const emit = defineEmits(['begin'])

const {
  stepperStep,
  selectedTopicIds,
  selectedSourceIds,
  selectedTypes,
  nextStep,
  prevStep,
} = useStudySession()

const stepLabels = ['Topics', 'Sources', 'Types', 'Summary']

const canAdvance = computed(() => {
  if (stepperStep.value === 1) return selectedTopicIds.value.size > 0
  if (stepperStep.value === 2) return selectedSourceIds.value.size > 0
  if (stepperStep.value === 3) return selectedTypes.value.size > 0
  return true
})
</script>

<template>
  <div class="stepper slide-up">
    <div class="stepper__dots">
      <div
        v-for="(label, i) in stepLabels"
        :key="i"
        class="stepper__dot-group"
      >
        <div
          class="stepper__dot"
          :class="{
            'stepper__dot--active': stepperStep === i + 1,
            'stepper__dot--done': stepperStep > i + 1,
          }"
        ></div>
        <span class="stepper__dot-label">{{ label }}</span>
      </div>
    </div>

    <div class="stepper__content">
      <StepTopics v-if="stepperStep === 1" :userId="userId" />
      <StepSources v-else-if="stepperStep === 2" :userId="userId" />
      <StepTypes v-else-if="stepperStep === 3" />
      <StepSummary v-else-if="stepperStep === 4" :userId="userId" @begin="$emit('begin')" />
    </div>

    <div class="stepper__nav">
      <BubbleButton
        v-if="stepperStep > 1"
        variant="secondary"
        size="md"
        @click="prevStep"
      >
        Back
      </BubbleButton>
      <div v-else></div>

      <BubbleButton
        v-if="stepperStep < 4"
        variant="primary"
        size="md"
        :disabled="!canAdvance"
        @click="nextStep"
      >
        Next
      </BubbleButton>
    </div>
  </div>
</template>

<style scoped>
.stepper {
  background: var(--color-bg-card);
  border-radius: var(--radius-lg);
  padding: 24px;
  box-shadow: 0 4px 16px var(--color-shadow);
  display: flex;
  flex-direction: column;
  gap: 20px;
  max-width: 480px;
  margin: 0 auto;
}

.stepper__dots {
  display: flex;
  justify-content: center;
  gap: 24px;
}

.stepper__dot-group {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.stepper__dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: var(--color-border);
  transition: background-color 0.2s ease, transform 0.2s var(--transition-bounce);
}

.stepper__dot--active {
  background: var(--color-primary);
  transform: scale(1.3);
}

.stepper__dot--done {
  background: var(--color-correct);
}

.stepper__dot-label {
  font-size: 0.7rem;
  font-weight: 700;
  color: var(--color-text-muted);
}

.stepper__content {
  min-height: 200px;
}

.stepper__nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
