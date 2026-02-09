import { createRouter, createWebHistory } from 'vue-router'
import { useUser } from '../composables/useUser'
import WelcomeView from '../views/WelcomeView.vue'
import DashboardView from '../views/DashboardView.vue'
import StudySessionView from '../views/StudySessionView.vue'

const routes = [
  { path: '/', name: 'welcome', component: WelcomeView },
  { path: '/dashboard', name: 'dashboard', component: DashboardView },
  { path: '/study/tf', name: 'study-tf', component: StudySessionView },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach(async (to) => {
  const { user, fetchUsers } = useUser()

  if (!user.value) {
    await fetchUsers()
  }

  if (!user.value && to.name !== 'welcome') {
    return { name: 'welcome' }
  }

  if (user.value && to.name === 'welcome') {
    return { name: 'dashboard' }
  }
})

export default router
