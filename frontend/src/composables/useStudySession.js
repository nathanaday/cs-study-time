import { ref, computed } from 'vue'
import { useApi } from './useApi'

const api = useApi()

const sessionState = ref('idle') // 'idle' | 'loading' | 'active' | 'answered' | 'complete'
const questions = ref([])
const currentIndex = ref(0)
const score = ref({ correct: 0, incorrect: 0 })
const lastResult = ref(null)
const selectedTopicIds = ref(new Set())

const currentQuestion = computed(() => {
  if (currentIndex.value < questions.value.length) {
    return questions.value[currentIndex.value]
  }
  return null
})

const progress = computed(() => ({
  current: currentIndex.value + 1,
  total: questions.value.length,
}))

function toggleTopic(topicId) {
  const s = new Set(selectedTopicIds.value)
  if (s.has(topicId)) {
    s.delete(topicId)
  } else {
    s.add(topicId)
  }
  selectedTopicIds.value = s
}

function selectAll(topicIds) {
  selectedTopicIds.value = new Set(topicIds)
}

function deselectAll() {
  selectedTopicIds.value = new Set()
}

// Fisher-Yates shuffle
function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

async function beginSession(userId) {
  sessionState.value = 'loading'
  score.value = { correct: 0, incorrect: 0 }
  currentIndex.value = 0
  lastResult.value = null

  const topicIds = [...selectedTopicIds.value]
  const fetches = topicIds.map((id) =>
    api.get(`/users/${userId}/topics/${id}/questions`)
  )
  const results = await Promise.all(fetches)
  const allQuestions = results.flat()
  questions.value = shuffle(allQuestions)
  sessionState.value = 'active'
}

async function submitAnswer(userId, answer) {
  const q = currentQuestion.value
  if (!q) return

  const result = await api.post(
    `/users/${userId}/questions/${q.id}/attempts`,
    { answer: String(answer) }
  )
  lastResult.value = result

  if (result.correct) {
    score.value = { ...score.value, correct: score.value.correct + 1 }
  } else {
    score.value = { ...score.value, incorrect: score.value.incorrect + 1 }
  }

  sessionState.value = 'answered'
}

function nextQuestion() {
  const next = currentIndex.value + 1
  if (next >= questions.value.length) {
    sessionState.value = 'complete'
  } else {
    currentIndex.value = next
    lastResult.value = null
    sessionState.value = 'active'
  }
}

function resetSession() {
  sessionState.value = 'idle'
  questions.value = []
  currentIndex.value = 0
  score.value = { correct: 0, incorrect: 0 }
  lastResult.value = null
  selectedTopicIds.value = new Set()
}

export function useStudySession() {
  return {
    sessionState,
    questions,
    currentIndex,
    score,
    lastResult,
    selectedTopicIds,
    currentQuestion,
    progress,
    toggleTopic,
    selectAll,
    deselectAll,
    beginSession,
    submitAnswer,
    nextQuestion,
    resetSession,
  }
}
