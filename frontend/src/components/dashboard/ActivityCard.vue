<script setup>
defineProps({
  title: { type: String, required: true },
  description: { type: String, default: '' },
  enabled: { type: Boolean, default: true },
  to: { type: String, default: '' },
})
</script>

<template>
  <router-link
    v-if="enabled && to"
    :to="to"
    class="activity-card activity-card--enabled"
  >
    <h3 class="activity-card__title">{{ title }}</h3>
    <p class="activity-card__desc">{{ description }}</p>
    <span class="activity-card__arrow">&#8594;</span>
  </router-link>
  <div v-else class="activity-card activity-card--disabled">
    <h3 class="activity-card__title">{{ title }}</h3>
    <p class="activity-card__desc">{{ description }}</p>
    <span class="activity-card__badge">Coming Soon</span>
  </div>
</template>

<style scoped>
.activity-card {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 20px;
  border-radius: var(--radius-md);
  border: 1px solid var(--color-border);
  position: relative;
  transition: transform 0.2s var(--transition-bounce),
              box-shadow 0.2s ease;
}

.activity-card--enabled {
  background: var(--color-bg-card);
  cursor: pointer;
}

.activity-card--enabled:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 20px var(--color-shadow);
}

.activity-card--disabled {
  background: var(--color-bg);
  opacity: 0.65;
}

.activity-card__title {
  font-size: 1.1rem;
}

.activity-card__desc {
  color: var(--color-text-muted);
  font-size: 0.9rem;
}

.activity-card__arrow {
  position: absolute;
  top: 20px;
  right: 20px;
  font-size: 1.2rem;
  color: var(--color-primary);
  font-weight: 700;
}

.activity-card__badge {
  display: inline-block;
  margin-top: 8px;
  padding: 3px 10px;
  font-size: 0.75rem;
  font-weight: 700;
  background: var(--color-border);
  color: var(--color-text-muted);
  border-radius: var(--radius-sm);
  width: fit-content;
}
</style>
