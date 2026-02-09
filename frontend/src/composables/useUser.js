import { ref, computed } from 'vue'
import { useApi } from './useApi'

const user = ref(null)
const loading = ref(false)
const api = useApi()

async function fetchUsers() {
  loading.value = true
  try {
    const users = await api.get('/users')
    user.value = users.length > 0 ? users[0] : null
  } catch {
    user.value = null
  } finally {
    loading.value = false
  }
}

async function createUser(name, icon) {
  const created = await api.post('/users', { name, icon })
  user.value = created
  return created
}

async function updateUser(id, data) {
  const updated = await api.patch(`/users/${id}`, data)
  user.value = updated
  return updated
}

const isLoggedIn = computed(() => !!user.value)

export function useUser() {
  return {
    user,
    loading,
    isLoggedIn,
    fetchUsers,
    createUser,
    updateUser,
  }
}
