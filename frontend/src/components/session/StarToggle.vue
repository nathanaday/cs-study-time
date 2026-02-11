<script setup>
defineProps({
  starred: { type: Boolean, default: false },
})

defineEmits(['toggle'])
</script>

<template>
  <button
    class="star-toggle"
    :class="{ 'star-toggle--active': starred }"
    @click="$emit('toggle')"
    title="Toggle favorite"
  >
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      :fill="starred ? 'currentColor' : 'none'"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
    >
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  </button>
</template>

<style scoped>
.star-toggle {
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  color: var(--color-border);
  transition: color 0.2s ease, transform 0.2s var(--transition-bounce);
}

.star-toggle:hover {
  color: var(--color-accent);
  transform: scale(1.15);
}

.star-toggle--active {
  color: var(--color-accent);
}
</style>
