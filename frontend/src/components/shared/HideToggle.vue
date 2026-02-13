<script setup>
defineProps({
  hidden: { type: Boolean, default: false },
})

defineEmits(['toggle'])
</script>

<template>
  <button
    class="hide-toggle"
    :class="{ 'hide-toggle--active': hidden }"
    @click="$emit('toggle')"
    title="Toggle hidden"
  >
    <svg
      v-if="!hidden"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
    >
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
    <svg
      v-else
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
    >
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
      <line x1="1" y1="1" x2="23" y2="23" />
      <path d="M14.12 14.12a3 3 0 1 1-4.24-4.24" />
    </svg>
  </button>
</template>

<style scoped>
.hide-toggle {
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  color: var(--color-border);
  transition: color 0.2s ease, transform 0.2s var(--transition-bounce);
}

.hide-toggle:hover {
  color: var(--color-incorrect);
  transform: scale(1.15);
}

.hide-toggle--active {
  color: var(--color-incorrect);
}
</style>
