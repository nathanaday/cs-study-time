<script setup>
import { onMounted, computed } from 'vue'
import { useStudySession } from '../../composables/useStudySession'
import BubbleButton from '../shared/BubbleButton.vue'

const emit = defineEmits(['begin'])

const {
  selectedTopicIds,
  selectedSourceIds,
  selectedTypes,
  matchingQuestionCount,
  fetchQuestionCount,
} = useStudySession()

const typeLabels = {
  tf: 'True/False',
  selectall: 'Select All',
  shortanswer: 'Short Answer',
}

const selectedTypeList = computed(() => {
  return [...selectedTypes.value].map((t) => typeLabels[t] || t)
})

const beginDisabled = computed(() => {
  return matchingQuestionCount.value === null || matchingQuestionCount.value === 0
})

onMounted(() => {
  fetchQuestionCount()
})
</script>

<template>
  <div class="step-summary">
    <h3 class="step-summary__title">Session Summary</h3>

    <div class="step-summary__stats">
      <div class="step-summary__stat">
        <span class="step-summary__stat-value">{{ selectedTopicIds.size }}</span>
        <span class="step-summary__stat-label">topic{{ selectedTopicIds.size === 1 ? '' : 's' }}</span>
      </div>
      <div class="step-summary__stat">
        <span class="step-summary__stat-value">{{ selectedSourceIds.size }}</span>
        <span class="step-summary__stat-label">source{{ selectedSourceIds.size === 1 ? '' : 's' }}</span>
      </div>
    </div>

    <div class="step-summary__types">
      <span class="step-summary__types-label">Types:</span>
      <span
        v-for="t in selectedTypeList"
        :key="t"
        class="step-summary__type-badge"
      >{{ t }}</span>
    </div>

    <div class="step-summary__count">
      <template v-if="matchingQuestionCount !== null">
        <span class="step-summary__count-value">{{ matchingQuestionCount }}</span>
        question{{ matchingQuestionCount === 1 ? '' : 's' }} available
      </template>
      <template v-else>
        Counting questions...
      </template>
    </div>

    <BubbleButton
      variant="primary"
      size="lg"
      :disabled="beginDisabled"
      @click="$emit('begin')"
    >
      Begin Session
    </BubbleButton>
  </div>
</template>

<style scoped>
.step-summary {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  text-align: center;
}

.step-summary__title {
  margin-bottom: 4px;
}

.step-summary__stats {
  display: flex;
  gap: 32px;
}

.step-summary__stat {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.step-summary__stat-value {
  font-size: 2rem;
  font-weight: 800;
  color: var(--color-primary);
  line-height: 1;
}

.step-summary__stat-label {
  font-size: 0.8rem;
  color: var(--color-text-muted);
  font-weight: 600;
}

.step-summary__types {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
  justify-content: center;
}

.step-summary__types-label {
  font-weight: 600;
  font-size: 0.9rem;
  color: var(--color-text-muted);
}

.step-summary__type-badge {
  padding: 3px 10px;
  font-size: 0.8rem;
  font-weight: 700;
  background: var(--color-primary-light);
  color: var(--color-primary);
  border-radius: var(--radius-sm);
}

.step-summary__count {
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--color-text);
}

.step-summary__count-value {
  color: var(--color-primary);
  font-size: 1.3rem;
}
</style>
