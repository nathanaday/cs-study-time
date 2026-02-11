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

const mostStudied = computed(() => {
  if (!hasAttempts.value) return []
  return stats.value.topics
    .filter((t) => t.total_attempts > 0)
    .sort((a, b) => b.total_attempts - a.total_attempts)
    .slice(0, 5)
})

const mostCorrect = computed(() => {
  if (!hasAttempts.value) return []
  return stats.value.topics
    .filter((t) => t.correct_count > 0)
    .sort((a, b) => b.correct_count - a.correct_count)
    .slice(0, 5)
})

const mostIncorrect = computed(() => {
  if (!hasAttempts.value) return []
  return stats.value.topics
    .filter((t) => t.incorrect_count > 0)
    .sort((a, b) => b.incorrect_count - a.incorrect_count)
    .slice(0, 5)
})
</script>

<template>
  <div class="topic-perf slide-up">
    <h3 class="topic-perf__title">Topic Performance</h3>

    <div v-if="!stats" class="topic-perf__loading">Loading stats...</div>

    <div v-else-if="!hasAttempts" class="topic-perf__empty">
      <p>No study sessions yet. Start a session to see your performance here.</p>
    </div>

    <div v-else class="topic-perf__columns">
      <div class="topic-perf__column">
        <h4 class="topic-perf__heading topic-perf__heading--studied">Most Studied</h4>
        <ol v-if="mostStudied.length > 0" class="topic-perf__list">
          <li
            v-for="(topic, i) in mostStudied"
            :key="topic.id"
            class="topic-perf__row"
          >
            <span class="topic-perf__rank">{{ i + 1 }}</span>
            <span class="topic-perf__name">{{ topic.name }}</span>
            <span class="topic-perf__count topic-perf__count--studied">{{ topic.total_attempts }}</span>
          </li>
        </ol>
        <p v-else class="topic-perf__none">No data yet</p>
      </div>

      <div class="topic-perf__column topic-perf__column--secondary">
        <h4 class="topic-perf__heading topic-perf__heading--correct">Most Correct</h4>
        <ol v-if="mostCorrect.length > 0" class="topic-perf__list">
          <li
            v-for="(topic, i) in mostCorrect"
            :key="topic.id"
            class="topic-perf__row"
          >
            <span class="topic-perf__rank">{{ i + 1 }}</span>
            <span class="topic-perf__name">{{ topic.name }}</span>
            <span class="topic-perf__count topic-perf__count--correct">{{ topic.correct_count }}</span>
          </li>
        </ol>
        <p v-else class="topic-perf__none">No data yet</p>
      </div>

      <div class="topic-perf__column topic-perf__column--secondary">
        <h4 class="topic-perf__heading topic-perf__heading--incorrect">Most Incorrect</h4>
        <ol v-if="mostIncorrect.length > 0" class="topic-perf__list">
          <li
            v-for="(topic, i) in mostIncorrect"
            :key="topic.id"
            class="topic-perf__row"
          >
            <span class="topic-perf__rank">{{ i + 1 }}</span>
            <span class="topic-perf__name">{{ topic.name }}</span>
            <span class="topic-perf__count topic-perf__count--incorrect">{{ topic.incorrect_count }}</span>
          </li>
        </ol>
        <p v-else class="topic-perf__none">No data yet</p>
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
  /* Stretch wider than the 960px parent to give three columns room */
  width: min(1100px, calc(100vw - 40px));
  position: relative;
  left: 50%;
  transform: translateX(-50%);
  container-type: inline-size;
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

/* Default: single column (Most Studied only) */
.topic-perf__columns {
  display: grid;
  grid-template-columns: 1fr;
  gap: 20px;
}

.topic-perf__column {
  min-width: 0;
}

.topic-perf__column--secondary {
  display: none;
}

/* When the card is wide enough, show all three columns */
@container (min-width: 700px) {
  .topic-perf__columns {
    grid-template-columns: repeat(3, 1fr);
  }

  .topic-perf__column--secondary {
    display: block;
  }
}

.topic-perf__heading {
  font-size: 0.85rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 10px;
}

.topic-perf__heading--studied {
  color: var(--color-primary);
}

.topic-perf__heading--correct {
  color: var(--color-correct);
}

.topic-perf__heading--incorrect {
  color: var(--color-incorrect);
}

.topic-perf__list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.topic-perf__row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 12px;
  border-radius: var(--radius-md);
  border: 1px solid var(--color-border);
}

.topic-perf__rank {
  font-weight: 800;
  font-size: 0.85rem;
  color: var(--color-text-muted);
  min-width: 18px;
  text-align: center;
}

.topic-perf__name {
  flex: 1;
  font-weight: 600;
  font-size: 0.9rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.topic-perf__count {
  font-weight: 800;
  font-size: 1rem;
  flex-shrink: 0;
}

.topic-perf__count--studied {
  color: var(--color-primary);
}

.topic-perf__count--correct {
  color: var(--color-correct);
}

.topic-perf__count--incorrect {
  color: var(--color-incorrect);
}

.topic-perf__none {
  color: var(--color-text-muted);
  font-size: 0.85rem;
  padding: 8px 0;
}
</style>
