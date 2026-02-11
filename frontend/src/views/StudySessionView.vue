<script setup>
import { onBeforeUnmount, onMounted, computed } from 'vue'
import { useRouter, useRoute, onBeforeRouteLeave } from 'vue-router'
import { useUser } from '../composables/useUser'
import { useStudySession } from '../composables/useStudySession'
import SessionStepper from '../components/session/SessionStepper.vue'
import ScoreBar from '../components/session/ScoreBar.vue'
import StarToggle from '../components/session/StarToggle.vue'
import TrueFalseCard from '../components/session/TrueFalseCard.vue'
import SelectAllCard from '../components/session/SelectAllCard.vue'
import ShortAnswerCard from '../components/session/ShortAnswerCard.vue'
import ComfortSelector from '../components/session/ComfortSelector.vue'
import CompletionCard from '../components/session/CompletionCard.vue'

const router = useRouter()
const route = useRoute()
const { user } = useUser()
const {
  sessionState,
  currentQuestion,
  score,
  lastResult,
  progress,
  pendingAnswer,
  averageComfort,
  beginSession,
  beginFavoritesSession,
  beginIncorrectSession,
  submitAnswer,
  submitSelfScore,
  confirmAndAdvance,
  toggleStar,
  resetSession,
} = useStudySession()

const selfScoreSubmitted = computed(() => {
  return pendingAnswer.value?.type === 'shortanswer' && pendingAnswer.value?.self_score != null
})

onMounted(async () => {
  if (route.query.favorites === 'true' && user.value) {
    await beginFavoritesSession(user.value.id)
  } else if (route.query.incorrect === 'true' && user.value) {
    await beginIncorrectSession(user.value.id)
  }
})

async function handleBegin() {
  if (!user.value) return
  await beginSession(user.value.id)
}

function handleAnswer(answer) {
  submitAnswer(answer)
}

function handleSelfScore(score) {
  submitSelfScore(score)
}

async function handleConfirm(comfort) {
  if (!user.value) return
  await confirmAndAdvance(user.value.id, comfort)
}

function handleStar() {
  if (!user.value || !currentQuestion.value) return
  toggleStar(user.value.id, currentQuestion.value.id)
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
    <!-- Session setup stepper -->
    <SessionStepper
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

      <div v-if="currentQuestion" class="study-session__question-area">
        <div class="study-session__star-row">
          <StarToggle
            :starred="!!currentQuestion.is_starred"
            @toggle="handleStar"
          />
        </div>

        <TrueFalseCard
          v-if="currentQuestion.type === 'tf'"
          :key="currentQuestion.id"
          :question="currentQuestion"
          :result="lastResult"
          @answer="handleAnswer"
        />

        <SelectAllCard
          v-else-if="currentQuestion.type === 'selectall'"
          :key="currentQuestion.id"
          :question="currentQuestion"
          :result="lastResult"
          @answer="handleAnswer"
        />

        <ShortAnswerCard
          v-else-if="currentQuestion.type === 'shortanswer'"
          :key="currentQuestion.id"
          :question="currentQuestion"
          :result="lastResult"
          :selfScoreSubmitted="selfScoreSubmitted"
          @answer="handleAnswer"
          @selfScore="handleSelfScore"
        />
      </div>

      <ComfortSelector
        v-if="sessionState === 'answered' && (currentQuestion?.type !== 'shortanswer' || selfScoreSubmitted)"
        :key="'comfort-' + currentQuestion?.id"
        @confirm="handleConfirm"
      />
    </template>

    <!-- Completion -->
    <CompletionCard
      v-else-if="sessionState === 'complete'"
      :correct="score.correct"
      :incorrect="score.incorrect"
      :averageComfort="averageComfort"
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

.study-session__question-area {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.study-session__star-row {
  display: flex;
  justify-content: flex-end;
}
</style>
