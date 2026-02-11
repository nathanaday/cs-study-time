<script setup>
import { useTheme } from '../../composables/useTheme'

defineProps({
  modelValue: { type: String, default: 'sage' },
})
const emit = defineEmits(['update:modelValue'])

const { applyTheme } = useTheme()

const themes = [
  { id: 'sage', label: 'Sage', color: '#7c9a72' },
  { id: 'terracotta', label: 'Terracotta', color: '#c08b6a' },
  { id: 'ocean', label: 'Ocean', color: '#6a9aab' },
]

function select(theme) {
  emit('update:modelValue', theme.id)
  applyTheme(theme.id)
}
</script>

<template>
  <div class="theme-picker">
    <h3 class="theme-picker__label">Pick a color theme</h3>
    <div class="theme-picker__options">
      <button
        v-for="theme in themes"
        :key="theme.id"
        class="theme-picker__swatch"
        :class="{ 'theme-picker__swatch--selected': modelValue === theme.id }"
        @click="select(theme)"
        type="button"
      >
        <span
          class="theme-picker__color"
          :style="{ backgroundColor: theme.color }"
        ></span>
        <span class="theme-picker__name">{{ theme.label }}</span>
      </button>
    </div>
  </div>
</template>

<style scoped>
.theme-picker__label {
  margin-bottom: 12px;
  margin-top: 24px;
  color: var(--color-text);
}

.theme-picker__options {
  display: flex;
  gap: 12px;
}

.theme-picker__swatch {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  border-radius: var(--radius-md);
  border: 3px solid var(--color-border);
  background: var(--color-bg-card);
  cursor: pointer;
  transition: transform 0.2s var(--transition-bounce),
              border-color 0.2s ease;
}

.theme-picker__swatch:hover {
  transform: scale(1.05);
}

.theme-picker__swatch--selected {
  border-color: var(--color-primary);
}

.theme-picker__color {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12);
}

.theme-picker__name {
  font-weight: 600;
  font-size: 0.9rem;
  color: var(--color-text);
}
</style>
