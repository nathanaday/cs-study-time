<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUser } from '../composables/useUser'
import { useApi } from '../composables/useApi'
import QuestionBankItem from '../components/bank/QuestionBankItem.vue'
import BubbleButton from '../components/shared/BubbleButton.vue'

const router = useRouter()
const { user } = useUser()
const api = useApi()

const questions = ref([])
const expandedId = ref(null)
const activeFilter = ref('all')

onMounted(async () => {
  if (!user.value) return
  questions.value = await api.get(`/users/${user.value.id}/questions/bank`)
})

const filteredQuestions = computed(() => {
  if (activeFilter.value === 'starred') {
    return questions.value.filter(q => q.is_starred)
  }
  if (activeFilter.value === 'hidden') {
    return questions.value.filter(q => q.is_hidden)
  }
  return questions.value
})

const groupedByTopic = computed(() => {
  const groups = []
  const map = new Map()
  for (const q of filteredQuestions.value) {
    if (!map.has(q.topic_id)) {
      const group = { topic_id: q.topic_id, topic_name: q.topic_name, questions: [] }
      map.set(q.topic_id, group)
      groups.push(group)
    }
    map.get(q.topic_id).questions.push(q)
  }
  return groups
})

const starredCount = computed(() => questions.value.filter(q => q.is_starred).length)
const hiddenCount = computed(() => questions.value.filter(q => q.is_hidden).length)

function toggleExpand(id) {
  expandedId.value = expandedId.value === id ? null : id
}

async function toggleStar(question) {
  const newStarred = !question.is_starred
  question.is_starred = newStarred ? 1 : 0
  try {
    await api.post(`/users/${user.value.id}/questions/${question.id}/star`, {
      starred: newStarred,
    })
  } catch {
    question.is_starred = newStarred ? 0 : 1
  }
}

async function toggleHide(question) {
  const newHidden = !question.is_hidden
  question.is_hidden = newHidden ? 1 : 0
  try {
    await api.post(`/users/${user.value.id}/questions/${question.id}/hide`, {
      hidden: newHidden,
    })
  } catch {
    question.is_hidden = newHidden ? 0 : 1
  }
}
</script>

<template>
  <div v-if="user" class="question-bank">
    <div class="question-bank__header">
      <BubbleButton variant="secondary" size="sm" @click="router.push('/dashboard')">
        Back to Dashboard
      </BubbleButton>
      <h2 class="question-bank__title">Question Bank</h2>
    </div>

    <div class="question-bank__filters">
      <button
        class="question-bank__filter"
        :class="{ 'question-bank__filter--active': activeFilter === 'all' }"
        @click="activeFilter = 'all'"
      >
        All ({{ questions.length }})
      </button>
      <button
        class="question-bank__filter"
        :class="{ 'question-bank__filter--active': activeFilter === 'starred' }"
        @click="activeFilter = 'starred'"
      >
        Starred ({{ starredCount }})
      </button>
      <button
        class="question-bank__filter"
        :class="{ 'question-bank__filter--active': activeFilter === 'hidden' }"
        @click="activeFilter = 'hidden'"
      >
        Hidden ({{ hiddenCount }})
      </button>
    </div>

    <div v-if="groupedByTopic.length === 0" class="question-bank__empty">
      No questions match this filter.
    </div>

    <section
      v-for="group in groupedByTopic"
      :key="group.topic_id"
      class="question-bank__topic"
    >
      <h3 class="question-bank__topic-name">{{ group.topic_name }}</h3>
      <div class="question-bank__list">
        <QuestionBankItem
          v-for="(q, idx) in group.questions"
          :key="q.id"
          :question="q"
          :number="idx + 1"
          :expanded="expandedId === q.id"
          @toggle-expand="toggleExpand(q.id)"
          @toggle-star="toggleStar(q)"
          @toggle-hide="toggleHide(q)"
        />
      </div>
    </section>
  </div>
</template>

<style scoped>
.question-bank {
  display: flex;
  flex-direction: column;
  gap: 20px;
  max-width: 800px;
  margin: 0 auto;
}

.question-bank__header {
  display: flex;
  align-items: center;
  gap: 16px;
}

.question-bank__title {
  font-size: 1.4rem;
}

.question-bank__filters {
  display: flex;
  gap: 8px;
}

.question-bank__filter {
  padding: 6px 16px;
  border-radius: var(--radius-sm);
  border: 1px solid var(--color-border);
  background: var(--color-bg-card);
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  color: var(--color-text-muted);
  transition: background-color 0.15s ease, color 0.15s ease;
}

.question-bank__filter:hover {
  background: var(--color-primary-light);
  color: var(--color-primary);
}

.question-bank__filter--active {
  background: var(--color-primary);
  color: var(--color-text-on-primary);
  border-color: var(--color-primary);
}

.question-bank__filter--active:hover {
  background: var(--color-primary-hover);
  color: var(--color-text-on-primary);
}

.question-bank__empty {
  text-align: center;
  color: var(--color-text-muted);
  padding: 40px 0;
  font-size: 0.95rem;
}

.question-bank__topic {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.question-bank__topic-name {
  font-size: 1.1rem;
  color: var(--color-primary);
  padding-bottom: 4px;
  border-bottom: 2px solid var(--color-primary-light);
}

.question-bank__list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
</style>
