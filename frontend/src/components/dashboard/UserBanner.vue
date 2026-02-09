<script setup>
defineProps({
  user: { type: Object, required: true },
})
</script>

<template>
  <div class="user-banner slide-up">
    <img :src="`/${user.icon}`" :alt="user.name" class="user-banner__avatar" />
    <div class="user-banner__info">
      <h2 class="user-banner__greeting">Welcome back, {{ user.name }}</h2>
      <div class="user-banner__streak">
        <span class="user-banner__streak-count">{{ user.current_streak }}</span>
        <span class="user-banner__streak-label">day streak</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.user-banner {
  display: flex;
  align-items: center;
  gap: 20px;
  background: var(--color-bg-card);
  border-radius: var(--radius-lg);
  padding: 24px;
  box-shadow: 0 4px 16px var(--color-shadow);
}

.user-banner__avatar {
  width: 72px;
  height: 72px;
  border-radius: 50%;
  border: 3px solid var(--color-primary-light);
  object-fit: cover;
}

.user-banner__info {
  flex: 1;
}

.user-banner__greeting {
  margin-bottom: 4px;
}

.user-banner__streak {
  display: flex;
  align-items: baseline;
  gap: 6px;
}

.user-banner__streak-count {
  font-size: 1.8rem;
  font-weight: 800;
  color: var(--color-primary);
  line-height: 1;
}

.user-banner__streak-label {
  color: var(--color-text-muted);
  font-weight: 600;
}
</style>
