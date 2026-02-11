<script setup>
import { onMounted, computed } from 'vue'
import { useApi } from '../../composables/useApi'
import { useStudySession } from '../../composables/useStudySession'

const props = defineProps({
  userId: { type: Number, required: true },
})

const api = useApi()
const {
  selectedSourceIds,
  availableSources,
  toggleSource,
  selectAllSources,
  deselectAllSources,
} = useStudySession()

onMounted(async () => {
  if (availableSources.value.length === 0) {
    const data = await api.get('/sources')
    availableSources.value = data
    selectAllSources(data.map((s) => s.id))
  }
})

const allSelected = computed(() => {
  return availableSources.value.length > 0 &&
    selectedSourceIds.value.size === availableSources.value.length
})

const noneSelected = computed(() => {
  return selectedSourceIds.value.size === 0
})

function toggleAll() {
  if (allSelected.value) {
    deselectAllSources()
  } else {
    selectAllSources(availableSources.value.map((s) => s.id))
  }
}
</script>

<template>
  <div class="step-sources">
    <h3 class="step-sources__title">Filter by Source</h3>

    <label class="step-sources__toggle">
      <input
        type="checkbox"
        :checked="allSelected"
        :indeterminate="!allSelected && !noneSelected"
        @change="toggleAll"
      />
      <span>{{ allSelected ? 'Deselect All' : 'Select All' }}</span>
    </label>

    <div class="step-sources__list">
      <label
        v-for="source in availableSources"
        :key="source.id"
        class="step-sources__item"
      >
        <input
          type="checkbox"
          :checked="selectedSourceIds.has(source.id)"
          @change="toggleSource(source.id)"
        />
        <span class="step-sources__name">{{ source.name }}</span>
        <span class="step-sources__type">{{ source.type }}</span>
      </label>
    </div>
  </div>
</template>

<style scoped>
.step-sources__title {
  margin-bottom: 8px;
}

.step-sources__toggle {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  font-size: 0.9rem;
  color: var(--color-text-muted);
  cursor: pointer;
  margin-bottom: 8px;
}

.step-sources__list {
  display: flex;
  flex-direction: column;
  gap: 4px;
  max-height: 340px;
  overflow-y: auto;
}

.step-sources__item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 12px;
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: background-color 0.15s ease;
}

.step-sources__item:hover {
  background: var(--color-primary-light);
}

.step-sources__name {
  flex: 1;
  font-weight: 600;
}

.step-sources__type {
  font-size: 0.75rem;
  color: var(--color-text-muted);
  padding: 2px 8px;
  background: var(--color-border);
  border-radius: var(--radius-sm);
}

input[type="checkbox"] {
  width: 18px;
  height: 18px;
  accent-color: var(--color-primary);
  cursor: pointer;
}
</style>
