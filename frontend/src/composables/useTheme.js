import { ref } from 'vue'
import { useUser } from './useUser'

const currentTheme = ref('sage')

function applyTheme(name) {
  currentTheme.value = name
  document.documentElement.setAttribute('data-theme', name)
}

async function saveTheme(userId, name) {
  const { updateUser } = useUser()
  applyTheme(name)
  await updateUser(userId, { color_theme: name })
}

function initTheme(user) {
  applyTheme(user.color_theme || 'sage')
}

export function useTheme() {
  return {
    currentTheme,
    applyTheme,
    saveTheme,
    initTheme,
  }
}
