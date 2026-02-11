import { ref, computed } from 'vue'
import { useApi } from './useApi'

const api = useApi()

const sessionState = ref('idle') // 'idle' | 'loading' | 'active' | 'answered' | 'complete'
const questions = ref([])
const currentIndex = ref(0)
const score = ref({ correct: 0, incorrect: 0 })
const lastResult = ref(null)
const selectedTopicIds = ref(new Set())
const selectedSourceIds = ref(new Set())
const selectedTypes = ref(new Set(['tf', 'selectall', 'shortanswer']))
const matchingQuestionCount = ref(null)
const stepperStep = ref(1)
const pendingAnswer = ref(null)
const availableTopics = ref([])
const availableSources = ref([])
const comfortScores = ref([])

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

const averageComfort = computed(() => {
  if (comfortScores.value.length === 0) return 0
  const sum = comfortScores.value.reduce((a, b) => a + b, 0)
  return Math.round((sum / comfortScores.value.length) * 10) / 10
})

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

function toggleSource(sourceId) {
  const s = new Set(selectedSourceIds.value)
  if (s.has(sourceId)) {
    s.delete(sourceId)
  } else {
    s.add(sourceId)
  }
  selectedSourceIds.value = s
}

function selectAllSources(sourceIds) {
  selectedSourceIds.value = new Set(sourceIds)
}

function deselectAllSources() {
  selectedSourceIds.value = new Set()
}

function toggleType(type) {
  const s = new Set(selectedTypes.value)
  if (s.has(type)) {
    s.delete(type)
  } else {
    s.add(type)
  }
  selectedTypes.value = s
}

function selectAllTypes() {
  selectedTypes.value = new Set(['tf', 'selectall', 'shortanswer'])
}

function deselectAllTypes() {
  selectedTypes.value = new Set()
}

function nextStep() {
  if (stepperStep.value < 4) {
    stepperStep.value++
  }
}

function prevStep() {
  if (stepperStep.value > 1) {
    stepperStep.value--
  }
}

async function fetchQuestionCount() {
  const topicIds = [...selectedTopicIds.value]
  if (topicIds.length === 0) {
    matchingQuestionCount.value = 0
    return
  }
  const params = new URLSearchParams()
  params.set('topics', topicIds.join(','))
  const sourceIds = [...selectedSourceIds.value]
  if (sourceIds.length > 0) {
    params.set('sources', sourceIds.join(','))
  }
  const types = [...selectedTypes.value]
  if (types.length > 0) {
    params.set('types', types.join(','))
  }
  const result = await api.get(`/questions/preview-count?${params.toString()}`)
  matchingQuestionCount.value = result.count
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
  pendingAnswer.value = null
  comfortScores.value = []

  const topicIds = [...selectedTopicIds.value]
  const sourceIds = [...selectedSourceIds.value]
  const types = [...selectedTypes.value]

  const queryParams = new URLSearchParams()
  if (sourceIds.length > 0) {
    queryParams.set('sources', sourceIds.join(','))
  }
  if (types.length > 0) {
    queryParams.set('types', types.join(','))
  }
  const queryStr = queryParams.toString() ? `?${queryParams.toString()}` : ''

  const fetches = topicIds.map((id) =>
    api.get(`/users/${userId}/topics/${id}/questions${queryStr}`)
  )
  const results = await Promise.all(fetches)
  const allQuestions = results.flat()

  // Deduplicate questions that appear in multiple topics
  const seen = new Set()
  const unique = []
  for (const q of allQuestions) {
    if (!seen.has(q.id)) {
      seen.add(q.id)
      unique.push(q)
    }
  }

  questions.value = shuffle(unique)
  sessionState.value = questions.value.length > 0 ? 'active' : 'complete'
}

async function beginFavoritesSession(userId) {
  sessionState.value = 'loading'
  score.value = { correct: 0, incorrect: 0 }
  currentIndex.value = 0
  lastResult.value = null
  pendingAnswer.value = null
  comfortScores.value = []

  const starred = await api.get(`/users/${userId}/starred`)
  questions.value = shuffle(starred)
  sessionState.value = questions.value.length > 0 ? 'active' : 'complete'
}

async function beginIncorrectSession(userId) {
  sessionState.value = 'loading'
  score.value = { correct: 0, incorrect: 0 }
  currentIndex.value = 0
  lastResult.value = null
  pendingAnswer.value = null
  comfortScores.value = []

  const incorrect = await api.get(`/users/${userId}/incorrect`)
  questions.value = shuffle(incorrect)
  sessionState.value = questions.value.length > 0 ? 'active' : 'complete'
}

function submitAnswer(answer) {
  const q = currentQuestion.value
  if (!q) return

  if (q.type === 'tf') {
    const correct = answer === q.content.answer
    lastResult.value = {
      correct,
      correct_answer: q.content.answer,
      explanation: q.content.explanation,
    }
    pendingAnswer.value = { answer: String(answer), type: 'tf' }
    if (correct) {
      score.value = { ...score.value, correct: score.value.correct + 1 }
    } else {
      score.value = { ...score.value, incorrect: score.value.incorrect + 1 }
    }
  } else if (q.type === 'selectall') {
    const correctLabels = q.content.choices
      .filter((c) => c.answer === 'True')
      .map((c) => c.label)
      .sort()
    const userLabels = [...answer].sort()
    const correct =
      correctLabels.length === userLabels.length &&
      correctLabels.every((l, i) => l === userLabels[i])
    lastResult.value = {
      correct,
      correctLabels,
      explanation: q.content.explanation,
    }
    pendingAnswer.value = { selections: answer, type: 'selectall' }
    if (correct) {
      score.value = { ...score.value, correct: score.value.correct + 1 }
    } else {
      score.value = { ...score.value, incorrect: score.value.incorrect + 1 }
    }
  } else if (q.type === 'shortanswer') {
    lastResult.value = { type: 'shortanswer' }
    pendingAnswer.value = { type: 'shortanswer' }
  }

  sessionState.value = 'answered'
}

function submitSelfScore(selfScore) {
  pendingAnswer.value.self_score = selfScore
}

async function confirmAndAdvance(userId, comfort) {
  const q = currentQuestion.value
  if (!q || !pendingAnswer.value) return

  comfortScores.value = [...comfortScores.value, comfort]

  // For shortanswer, correctness is deferred until comfort is known
  if (pendingAnswer.value.type === 'shortanswer') {
    const correct = pendingAnswer.value.self_score >= 70 || comfort >= 3
    lastResult.value.correct = correct
    if (correct) {
      score.value = { ...score.value, correct: score.value.correct + 1 }
    } else {
      score.value = { ...score.value, incorrect: score.value.incorrect + 1 }
    }
  }

  const body = { comfort }
  if (pendingAnswer.value.type === 'tf') {
    body.answer = pendingAnswer.value.answer
  } else if (pendingAnswer.value.type === 'selectall') {
    body.selections = pendingAnswer.value.selections
  } else if (pendingAnswer.value.type === 'shortanswer') {
    body.self_score = pendingAnswer.value.self_score
  }

  try {
    await api.post(`/users/${userId}/questions/${q.id}/attempts`, body)
  } catch (_e) {
    // Continue even if API call fails
  }

  pendingAnswer.value = null
  lastResult.value = null

  const next = currentIndex.value + 1
  if (next >= questions.value.length) {
    sessionState.value = 'complete'
  } else {
    currentIndex.value = next
    sessionState.value = 'active'
  }
}

async function toggleStar(userId, questionId) {
  const q = questions.value.find((q) => q.id === questionId)
  if (!q) return

  const newStarred = !q.is_starred
  q.is_starred = newStarred ? 1 : 0

  try {
    await api.post(`/users/${userId}/questions/${questionId}/star`, {
      starred: newStarred,
    })
  } catch (_e) {
    // Revert on failure
    q.is_starred = newStarred ? 0 : 1
  }
}

function resetSession() {
  sessionState.value = 'idle'
  questions.value = []
  currentIndex.value = 0
  score.value = { correct: 0, incorrect: 0 }
  lastResult.value = null
  pendingAnswer.value = null
  selectedTopicIds.value = new Set()
  selectedSourceIds.value = new Set()
  selectedTypes.value = new Set(['tf', 'selectall', 'shortanswer'])
  matchingQuestionCount.value = null
  stepperStep.value = 1
  comfortScores.value = []
}

export function useStudySession() {
  return {
    sessionState,
    questions,
    currentIndex,
    score,
    lastResult,
    selectedTopicIds,
    selectedSourceIds,
    selectedTypes,
    matchingQuestionCount,
    stepperStep,
    pendingAnswer,
    availableTopics,
    availableSources,
    comfortScores,
    currentQuestion,
    progress,
    averageComfort,
    toggleTopic,
    selectAll,
    deselectAll,
    toggleSource,
    selectAllSources,
    deselectAllSources,
    toggleType,
    selectAllTypes,
    deselectAllTypes,
    nextStep,
    prevStep,
    fetchQuestionCount,
    beginSession,
    beginFavoritesSession,
    beginIncorrectSession,
    submitAnswer,
    submitSelfScore,
    confirmAndAdvance,
    toggleStar,
    resetSession,
  }
}
