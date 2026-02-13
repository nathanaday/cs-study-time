<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUser } from '../composables/useUser'
import { useApi } from '../composables/useApi'
import UserBanner from '../components/dashboard/UserBanner.vue'
import TopicPerformance from '../components/dashboard/TopicPerformance.vue'
import ActivityCard from '../components/dashboard/ActivityCard.vue'
import ResetConfirmModal from '../components/dashboard/ResetConfirmModal.vue'

const router = useRouter()
const { user, deleteUser } = useUser()
const api = useApi()
const starredCount = ref(0)
const incorrectCount = ref(0)
const showResetModal = ref(false)

onMounted(async () => {
  if (user.value) {
    const [starredResult, incorrectResult] = await Promise.all([
      api.get(`/users/${user.value.id}/starred/count`),
      api.get(`/users/${user.value.id}/incorrect/count`),
    ])
    starredCount.value = starredResult.count
    incorrectCount.value = incorrectResult.count
  }
})

async function confirmReset() {
  if (!user.value) return
  await deleteUser(user.value.id)
  router.push('/')
}
</script>

<template>
  <div v-if="user" class="dashboard">
    <UserBanner :user="user" />

    <TopicPerformance :userId="user.id" />

    <section class="dashboard__activities slide-up">
      <h3 class="dashboard__section-title">Study Activities</h3>
      <div class="dashboard__activity-grid">
        <ActivityCard
          title="Create Study Session"
          description="Choose topics, sources, and question types"
          :enabled="true"
          to="/study"
        />
        <ActivityCard
          title="Study Favorites"
          description="Review your starred questions"
          :enabled="starredCount > 0"
          to="/study?favorites=true"
          :badge="starredCount === 0 ? 'No starred questions' : ''"
        />
        <ActivityCard
          title="Study Wrong Answers"
          description="Review questions you haven't gotten right yet"
          :enabled="incorrectCount > 0"
          to="/study?incorrect=true"
          :badge="incorrectCount === 0 ? 'No wrong answers' : ''"
        />
        <ActivityCard
          title="Question Bank"
          description="Browse and manage all questions"
          :enabled="true"
          to="/bank"
        />
      </div>
    </section>

    <div class="dashboard__reset">
      <button class="dashboard__reset-btn" @click="showResetModal = true">
        Reset all data
      </button>
    </div>

    <ResetConfirmModal
      v-if="showResetModal"
      @confirm="confirmReset"
      @cancel="showResetModal = false"
    />
  </div>
</template>

<style scoped>
.dashboard {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.dashboard__section-title {
  margin-bottom: 12px;
}

.dashboard__activity-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 14px;
}

.dashboard__reset {
  display: flex;
  justify-content: center;
  padding-top: 8px;
}

.dashboard__reset-btn {
  background: none;
  border: none;
  color: var(--color-text-muted);
  font-size: 0.8rem;
  cursor: pointer;
  padding: 6px 12px;
  border-radius: var(--radius-sm);
  transition: color 0.15s ease, background-color 0.15s ease;
}

.dashboard__reset-btn:hover {
  color: var(--color-incorrect);
  background: rgba(0, 0, 0, 0.04);
}
</style>
