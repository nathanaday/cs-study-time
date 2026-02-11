<script setup>
import { computed } from 'vue'
import { useStudySession } from '../../composables/useStudySession'

const {
  selectedTypes,
  toggleType,
  selectAllTypes,
  deselectAllTypes,
} = useStudySession()

const typeOptions = [
  { key: 'tf', label: 'True / False', description: 'Evaluate statements as true or false' },
  { key: 'selectall', label: 'Select All That Apply', description: 'Choose all correct answers from a list' },
  { key: 'shortanswer', label: 'Short Answer', description: 'Free-form answers with self-grading' },
]

const allSelected = computed(() => selectedTypes.value.size === typeOptions.length)
const noneSelected = computed(() => selectedTypes.value.size === 0)

function toggleAll() {
  if (allSelected.value) {
    deselectAllTypes()
  } else {
    selectAllTypes()
  }
}
</script>

<template>
  <div class="step-types">
    <h3 class="step-types__title">Question Types</h3>

    <label class="step-types__toggle">
      <input
        type="checkbox"
        :checked="allSelected"
        :indeterminate="!allSelected && !noneSelected"
        @change="toggleAll"
      />
      <span>{{ allSelected ? 'Deselect All' : 'Select All' }}</span>
    </label>

    <div class="step-types__list">
      <label
        v-for="opt in typeOptions"
        :key="opt.key"
        class="step-types__item"
      >
        <input
          type="checkbox"
          :checked="selectedTypes.has(opt.key)"
          @change="toggleType(opt.key)"
        />
        <div class="step-types__info">
          <span class="step-types__name">{{ opt.label }}</span>
          <span class="step-types__desc">{{ opt.description }}</span>
        </div>
      </label>
    </div>
  </div>
</template>

<style scoped>
.step-types__title {
  margin-bottom: 8px;
}

.step-types__toggle {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  font-size: 0.9rem;
  color: var(--color-text-muted);
  cursor: pointer;
  margin-bottom: 8px;
}

.step-types__list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.step-types__item {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 12px;
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: background-color 0.15s ease;
}

.step-types__item:hover {
  background: var(--color-primary-light);
}

.step-types__info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.step-types__name {
  font-weight: 700;
}

.step-types__desc {
  font-size: 0.8rem;
  color: var(--color-text-muted);
}

input[type="checkbox"] {
  width: 18px;
  height: 18px;
  accent-color: var(--color-primary);
  cursor: pointer;
  margin-top: 2px;
}
</style>
