<script setup>
import { useUser } from '../../composables/useUser'
import { useRouter } from 'vue-router'

const { user } = useUser()
const router = useRouter()

function goHome() {
  router.push('/dashboard')
}
</script>

<template>
  <header class="app-header" @click="goHome">
    <div class="app-header__inner">
      <div class="app-header__brand">
        <span class="app-header__logo">CS</span>
        <span class="app-header__title">Study Time</span>
      </div>
      <div v-if="user" class="app-header__user">
        <img :src="`/${user.icon}`" :alt="user.name" class="app-header__avatar" />
      </div>
    </div>
  </header>
</template>

<style scoped>
.app-header {
  background-color: var(--color-bg-card);
  border-bottom: 1px solid var(--color-border);
  padding: 0 20px;
  cursor: pointer;
  position: sticky;
  top: 0;
  z-index: 100;
}

.app-header__inner {
  max-width: 960px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 56px;
}

.app-header__brand {
  display: flex;
  align-items: center;
  gap: 10px;
}

.app-header__logo {
  background-color: var(--color-primary);
  color: var(--color-text-on-primary);
  font-weight: 800;
  font-size: 0.85rem;
  padding: 4px 8px;
  border-radius: var(--radius-sm);
}

.app-header__title {
  font-weight: 700;
  font-size: 1.1rem;
  color: var(--color-text);
}

.app-header__avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: 2px solid var(--color-primary-light);
  object-fit: cover;
}
</style>
