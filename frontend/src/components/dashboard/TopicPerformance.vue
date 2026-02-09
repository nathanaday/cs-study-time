<script setup>
import { ref, onMounted, computed } from 'vue'
import { useApi } from '../../composables/useApi'

const props = defineProps({
  userId: { type: Number, required: true },
})

const api = useApi()
const stats = ref(null)

onMounted(async () => {
  stats.value = await api.get(`/users/${props.userId}/stats`)
})

const hasAttempts = computed(() => {
  return stats.value && stats.value.total_attempts > 0
})

const bestTopics = computed(() => {
  if (!hasAttempts.value) return []
  return stats.value.topics
    .filter((t) => t.total_attempts > 0)
    .sort((a, b) => {
      const aAcc = a.correct_count / a.total_attempts
      const bAcc = b.correct_count / b.total_attempts
      return bAcc - aAcc
    })
    .slice(0, 2)
})

const worstTopics = computed(() => {
  if (!hasAttempts.value) return []
  return stats.value.topics
    .filter((t) => t.total_attempts > 0)
    .sort((a, b) => {
      const aAcc = a.correct_count / a.total_attempts
      const bAcc = b.correct_count / b.total_attempts
      return aAcc - bAcc
    })
    .slice(0, 2)
})

function accuracy(topic) {
  if (topic.total_attempts === 0) return 0
  return Math.round((topic.correct_count / topic.total_attempts) * 100)
}
</script>

<template>
  <div class="topic-perf slide-up">
    <h3 class="topic-perf__title">Topic Performance</h3>

    <div v-if="!stats" class="topic-perf__loading">Loading stats...</div>

    <div v-else-if="!hasAttempts" class="topic-perf__empty">
      <p>No study sessions yet. Start a session to see your performance here.</p>
    </div>

    <div v-else class="topic-perf__content">
      <div class="topic-perf__section">
        <h4 class="topic-perf__section-label topic-perf__section-label--best">Strongest</h4>
        <div class="topic-perf__cards">
          <div
            v-for="topic in bestTopics"
            :key="topic.id"
            class="topic-perf__card topic-perf__card--best"
          >
            <span class="topic-perf__name">{{ topic.name }}</span>
            <span class="topic-perf__accuracy">{{ accuracy(topic) }}%</span>
          </div>
        </div>
      </div>

      <div class="topic-perf__section">
        <h4 class="topic-perf__section-label topic-perf__section-label--worst">Needs Work</h4>
        <div class="topic-perf__cards">
          <div
            v-for="topic in worstTopics"
            :key="topic.id"
            class="topic-perf__card topic-perf__card--worst"
          >
            <span class="topic-perf__name">{{ topic.name }}</span>
            <span class="topic-perf__accuracy">{{ accuracy(topic) }}%</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.topic-perf {
  background: var(--color-bg-card);
  border-radius: var(--radius-lg);
  padding: 24px;
  box-shadow: 0 4px 16px var(--color-shadow);
}

.topic-perf__title {
  margin-bottom: 16px;
}

.topic-perf__loading,
.topic-perf__empty {
  color: var(--color-text-muted);
  padding: 20px 0;
  text-align: center;
}

.topic-perf__content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.topic-perf__section-label {
  font-size: 0.85rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 8px;
}

.topic-perf__section-label--best {
  color: var(--color-correct);
}

.topic-perf__section-label--worst {
  color: var(--color-incorrect);
}

.topic-perf__cards {
  display: flex;
  gap: 10px;
}

.topic-perf__card {
  flex: 1;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-radius: var(--radius-md);
  border: 1px solid var(--color-border);
}

.topic-perf__card--best {
  border-left: 4px solid var(--color-correct);
}

.topic-perf__card--worst {
  border-left: 4px solid var(--color-incorrect);
}

.topic-perf__name {
  font-weight: 600;
  font-size: 0.95rem;
}

.topic-perf__accuracy {
  font-weight: 800;
  font-size: 1.1rem;
  color: var(--color-primary);
}
</style>
