<script setup>
import { ref, onMounted, computed } from 'vue'
import { useApi } from '../../composables/useApi'
import { useStudySession } from '../../composables/useStudySession'
import BubbleButton from '../shared/BubbleButton.vue'

const props = defineProps({
  userId: { type: Number, required: true },
})

const emit = defineEmits(['begin'])

const api = useApi()
const { selectedTopicIds, toggleTopic, selectAll, deselectAll } = useStudySession()
const topics = ref([])

onMounted(async () => {
  topics.value = await api.get(`/users/${props.userId}/topics`)
  selectAll(topics.value.map((t) => t.id))
})

const allSelected = computed(() => {
  return topics.value.length > 0 && selectedTopicIds.value.size === topics.value.length
})

const noneSelected = computed(() => {
  return selectedTopicIds.value.size === 0
})

function toggleAll() {
  if (allSelected.value) {
    deselectAll()
  } else {
    selectAll(topics.value.map((t) => t.id))
  }
}
</script>

<template>
  <aside class="topic-sidebar slide-up">
    <h3 class="topic-sidebar__title">Select Topics</h3>

    <label class="topic-sidebar__toggle">
      <input
        type="checkbox"
        :checked="allSelected"
        :indeterminate="!allSelected && !noneSelected"
        @change="toggleAll"
      />
      <span>{{ allSelected ? 'Deselect All' : 'Select All' }}</span>
    </label>

    <div class="topic-sidebar__list">
      <label
        v-for="topic in topics"
        :key="topic.id"
        class="topic-sidebar__item"
      >
        <input
          type="checkbox"
          :checked="selectedTopicIds.has(topic.id)"
          @change="toggleTopic(topic.id)"
        />
        <span class="topic-sidebar__name">{{ topic.name }}</span>
        <span class="topic-sidebar__count">{{ topic.question_count }} q</span>
      </label>
    </div>

    <BubbleButton
      variant="primary"
      size="lg"
      :disabled="noneSelected"
      @click="$emit('begin')"
    >
      Begin Session
    </BubbleButton>
  </aside>
</template>

<style scoped>
.topic-sidebar {
  background: var(--color-bg-card);
  border-radius: var(--radius-lg);
  padding: 24px;
  box-shadow: 0 4px 16px var(--color-shadow);
  display: flex;
  flex-direction: column;
  gap: 16px;
  max-width: 400px;
  margin: 0 auto;
}

.topic-sidebar__title {
  margin-bottom: 4px;
}

.topic-sidebar__toggle {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  font-size: 0.9rem;
  color: var(--color-text-muted);
  cursor: pointer;
}

.topic-sidebar__list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.topic-sidebar__item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: background-color 0.15s ease;
}

.topic-sidebar__item:hover {
  background: var(--color-primary-light);
}

.topic-sidebar__name {
  flex: 1;
  font-weight: 600;
}

.topic-sidebar__count {
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
