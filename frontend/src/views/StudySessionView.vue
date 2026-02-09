<script setup>
import { onBeforeUnmount } from 'vue'
import { useRouter, onBeforeRouteLeave } from 'vue-router'
import { useUser } from '../composables/useUser'
import { useStudySession } from '../composables/useStudySession'
import TopicSidebar from '../components/session/TopicSidebar.vue'
import ScoreBar from '../components/session/ScoreBar.vue'
import StudyCard from '../components/session/StudyCard.vue'
import AnswerButtons from '../components/session/AnswerButtons.vue'
import ResultOverlay from '../components/session/ResultOverlay.vue'
import CompletionCard from '../components/session/CompletionCard.vue'

const router = useRouter()
const { user } = useUser()
const {
  sessionState,
  currentQuestion,
  score,
  lastResult,
  progress,
  beginSession,
  submitAnswer,
  nextQuestion,
  resetSession,
} = useStudySession()

async function handleBegin() {
  if (!user.value) return
  await beginSession(user.value.id)
}

async function handleAnswer(answer) {
  if (!user.value) return
  await submitAnswer(user.value.id, answer)
}

function handleNext() {
  nextQuestion()
}

function handleBack() {
  resetSession()
  router.push('/dashboard')
}

onBeforeRouteLeave((_to, _from, next) => {
  if (sessionState.value === 'active' || sessionState.value === 'answered') {
    const leave = window.confirm('You have an active session. Leave anyway?')
    if (!leave) return next(false)
  }
  resetSession()
  next()
})

onBeforeUnmount(() => {
  if (sessionState.value === 'complete') {
    resetSession()
  }
})
</script>

<template>
  <div v-if="user" class="study-session">
    <!-- Topic selection -->
    <TopicSidebar
      v-if="sessionState === 'idle'"
      :userId="user.id"
      @begin="handleBegin"
    />

    <!-- Loading -->
    <div v-else-if="sessionState === 'loading'" class="study-session__loading">
      <p>Loading questions...</p>
    </div>

    <!-- Active session -->
    <template v-else-if="sessionState === 'active' || sessionState === 'answered'">
      <ScoreBar
        :correct="score.correct"
        :incorrect="score.incorrect"
        :current="progress.current"
        :total="progress.total"
      />

      <StudyCard
        v-if="currentQuestion"
        :key="currentQuestion.id"
        :question="currentQuestion"
      />

      <AnswerButtons
        v-if="sessionState === 'active'"
        @answer="handleAnswer"
      />

      <ResultOverlay
        v-if="sessionState === 'answered' && lastResult"
        :result="lastResult"
        @next="handleNext"
      />
    </template>

    <!-- Completion -->
    <CompletionCard
      v-else-if="sessionState === 'complete'"
      :correct="score.correct"
      :incorrect="score.incorrect"
      @back="handleBack"
    />
  </div>
</template>

<style scoped>
.study-session {
  display: flex;
  flex-direction: column;
  gap: 20px;
  max-width: 640px;
  margin: 0 auto;
}

.study-session__loading {
  text-align: center;
  padding: 60px 20px;
  color: var(--color-text-muted);
  font-weight: 600;
  animation: pulse 1.5s ease-in-out infinite;
}
</style>
