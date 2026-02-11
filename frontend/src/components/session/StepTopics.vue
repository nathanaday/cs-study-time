<script setup>
import { onMounted, computed } from 'vue'
import { useApi } from '../../composables/useApi'
import { useStudySession } from '../../composables/useStudySession'

const props = defineProps({
  userId: { type: Number, required: true },
})

const api = useApi()
const {
  selectedTopicIds,
  availableTopics,
  toggleTopic,
  selectAll,
  deselectAll,
} = useStudySession()

onMounted(async () => {
  if (availableTopics.value.length === 0) {
    const data = await api.get(`/users/${props.userId}/topics`)
    availableTopics.value = data
    selectAll(data.map((t) => t.id))
  }
})

const allSelected = computed(() => {
  return availableTopics.value.length > 0 &&
    selectedTopicIds.value.size === availableTopics.value.length
})

const noneSelected = computed(() => {
  return selectedTopicIds.value.size === 0
})

function toggleAll() {
  if (allSelected.value) {
    deselectAll()
  } else {
    selectAll(availableTopics.value.map((t) => t.id))
  }
}
</script>

<template>
  <div class="step-topics">
    <h3 class="step-topics__title">Select Topics</h3>

    <label class="step-topics__toggle">
      <input
        type="checkbox"
        :checked="allSelected"
        :indeterminate="!allSelected && !noneSelected"
        @change="toggleAll"
      />
      <span>{{ allSelected ? 'Deselect All' : 'Select All' }}</span>
    </label>

    <div class="step-topics__list">
      <label
        v-for="topic in availableTopics"
        :key="topic.id"
        class="step-topics__item"
      >
        <input
          type="checkbox"
          :checked="selectedTopicIds.has(topic.id)"
          @change="toggleTopic(topic.id)"
        />
        <span class="step-topics__name">{{ topic.name }}</span>
        <span class="step-topics__count">{{ topic.question_count }} q</span>
      </label>
    </div>
  </div>
</template>

<style scoped>
.step-topics__title {
  margin-bottom: 8px;
}

.step-topics__toggle {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  font-size: 0.9rem;
  color: var(--color-text-muted);
  cursor: pointer;
  margin-bottom: 8px;
}

.step-topics__list {
  display: flex;
  flex-direction: column;
  gap: 4px;
  max-height: 340px;
  overflow-y: auto;
}

.step-topics__item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 12px;
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: background-color 0.15s ease;
}

.step-topics__item:hover {
  background: var(--color-primary-light);
}

.step-topics__name {
  flex: 1;
  font-weight: 600;
}

.step-topics__count {
  font-size: 0.8rem;
  color: var(--color-text-muted);
}

input[type="checkbox"] {
  width: 18px;
  height: 18px;
  accent-color: var(--color-primary);
  cursor: pointer;
}
</style>
