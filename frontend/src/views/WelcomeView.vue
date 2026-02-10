<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUser } from '../composables/useUser'
import { useTheme } from '../composables/useTheme'
import IconPicker from '../components/welcome/IconPicker.vue'
import ThemePicker from '../components/welcome/ThemePicker.vue'
import BubbleButton from '../components/shared/BubbleButton.vue'

const router = useRouter()
const { createUser, updateUser } = useUser()
const { applyTheme } = useTheme()

const name = ref('')
const selectedIcon = ref('')
const selectedTheme = ref('sage')
const submitting = ref(false)

async function handleSubmit() {
  if (!name.value.trim() || !selectedIcon.value || submitting.value) return
  submitting.value = true
  try {
    const user = await createUser(name.value.trim(), selectedIcon.value)
    if (selectedTheme.value !== 'sage') {
      await updateUser(user.id, { color_theme: selectedTheme.value })
    }
    applyTheme(selectedTheme.value)
    router.push('/dashboard')
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <div class="welcome bounce-in">
    <div class="welcome__card">
      <h1 class="welcome__title">Welcome to CS Study Time</h1>
      <p class="welcome__subtitle">Let's set up your profile to get started.</p>

      <form class="welcome__form" @submit.prevent="handleSubmit">
        <div class="welcome__field">
          <h3 class="welcome__field-label">Your first name</h3>
          <input
            v-model="name"
            type="text"
            class="welcome__input"
            placeholder="Enter your name"
            maxlength="30"
            autofocus
          />
        </div>

        <IconPicker v-model="selectedIcon" />
        <ThemePicker v-model="selectedTheme" />

        <BubbleButton
          variant="primary"
          size="lg"
          :disabled="!name.trim() || !selectedIcon || submitting"
          @click="handleSubmit"
        >
          {{ submitting ? 'Setting up...' : 'Get Started' }}
        </BubbleButton>
      </form>
    </div>
  </div>
</template>

<style scoped>
.welcome {
  display: flex;
  justify-content: center;
  padding-top: 40px;
}

.welcome__card {
  background: var(--color-bg-card);
  border-radius: var(--radius-lg);
  padding: 40px;
  box-shadow: 0 4px 20px var(--color-shadow);
  max-width: 480px;
  width: 100%;
}

.welcome__title {
  margin-bottom: 8px;
  color: var(--color-primary);
}

.welcome__subtitle {
  color: var(--color-text-muted);
  margin-bottom: 32px;
}

.welcome__form {
  display: flex;
  flex-direction: column;
  gap: 28px;
}

.welcome__field-label {
  margin-bottom: 8px;
  color: var(--color-text);
}

.welcome__input {
  width: 100%;
  padding: 12px 16px;
  border: 2px solid var(--color-border);
  border-radius: var(--radius-md);
  font-size: 1rem;
  background: var(--color-bg);
  color: var(--color-text);
  transition: border-color 0.2s ease;
}

.welcome__input:focus {
  outline: none;
  border-color: var(--color-primary);
}

.welcome__input::placeholder {
  color: var(--color-text-muted);
}
</style>
