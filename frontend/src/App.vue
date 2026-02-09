<script setup>
import { onMounted } from 'vue'
import { useUser } from './composables/useUser'
import { useTheme } from './composables/useTheme'
import AppHeader from './components/shared/AppHeader.vue'

const { user } = useUser()
const { initTheme } = useTheme()

onMounted(() => {
  if (user.value) {
    initTheme(user.value)
  }
})
</script>

<template>
  <AppHeader v-if="user" />
  <main>
    <router-view v-slot="{ Component }">
      <transition name="page" mode="out-in">
        <component :is="Component" />
      </transition>
    </router-view>
  </main>
</template>

<style>
main {
  max-width: 960px;
  margin: 0 auto;
  padding: 24px 20px;
}

.page-enter-active {
  animation: fade-in 0.25s ease-out;
}

.page-leave-active {
  animation: fade-in 0.15s ease-in reverse;
}
</style>
