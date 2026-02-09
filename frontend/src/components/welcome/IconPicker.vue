<script setup>
import { ref, onMounted } from 'vue'
import { useApi } from '../../composables/useApi'

const props = defineProps({
  modelValue: { type: String, default: '' },
})
const emit = defineEmits(['update:modelValue'])

const api = useApi()
const icons = ref([])

onMounted(async () => {
  icons.value = await api.get('/icons')
  if (!props.modelValue && icons.value.length > 0) {
    emit('update:modelValue', icons.value[0])
  }
})

function select(icon) {
  emit('update:modelValue', icon)
}
</script>

<template>
  <div class="icon-picker">
    <h3 class="icon-picker__label">Choose your avatar</h3>
    <div class="icon-picker__grid">
      <button
        v-for="icon in icons"
        :key="icon"
        class="icon-picker__item"
        :class="{ 'icon-picker__item--selected': modelValue === icon }"
        @click="select(icon)"
        type="button"
      >
        <img :src="`/${icon}`" alt="User icon" />
      </button>
    </div>
  </div>
</template>

<style scoped>
.icon-picker__label {
  margin-bottom: 12px;
  color: var(--color-text);
}

.icon-picker__grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  max-width: 280px;
}

.icon-picker__item {
  aspect-ratio: 1;
  border-radius: var(--radius-md);
  border: 3px solid var(--color-border);
  padding: 8px;
  background: var(--color-bg-card);
  transition: transform 0.2s var(--transition-bounce),
              border-color 0.2s ease;
  cursor: pointer;
}

.icon-picker__item img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  border-radius: var(--radius-sm);
}

.icon-picker__item:hover {
  transform: scale(1.08);
  border-color: var(--color-primary-light);
}

.icon-picker__item--selected {
  border-color: var(--color-primary);
  background: var(--color-primary-light);
  transform: scale(1.05);
}
</style>
