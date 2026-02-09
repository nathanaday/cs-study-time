<script setup>
import { useUser } from '../composables/useUser'
import UserBanner from '../components/dashboard/UserBanner.vue'
import TopicPerformance from '../components/dashboard/TopicPerformance.vue'
import ActivityCard from '../components/dashboard/ActivityCard.vue'

const { user } = useUser()
</script>

<template>
  <div v-if="user" class="dashboard">
    <UserBanner :user="user" />

    <TopicPerformance :userId="user.id" />

    <section class="dashboard__activities slide-up">
      <h3 class="dashboard__section-title">Study Activities</h3>
      <div class="dashboard__activity-grid">
        <ActivityCard
          title="True or False"
          description="Test your knowledge with T/F questions"
          :enabled="true"
          to="/study/tf"
        />
        <ActivityCard
          title="Short Answer"
          description="Type in your answers"
          :enabled="false"
        />
        <ActivityCard
          title="Interactive Answer"
          description="Hands-on problem solving"
          :enabled="false"
        />
      </div>
    </section>
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
</style>
