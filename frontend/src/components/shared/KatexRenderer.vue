<script setup>
import { computed } from 'vue'
import katex from 'katex'
import 'katex/dist/katex.min.css'

const props = defineProps({
  text: { type: String, required: true },
})

const rendered = computed(() => {
  const parts = props.text.split(/(\$[^$]+\$)/)
  return parts
    .map((part) => {
      if (part.startsWith('$') && part.endsWith('$') && part.length > 2) {
        const math = part.slice(1, -1)
        try {
          return katex.renderToString(math, { throwOnError: false })
        } catch {
          return part
        }
      }
      return escapeHtml(part)
    })
    .join('')
})

function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}
</script>

<template>
  <span class="katex-renderer" v-html="rendered"></span>
</template>

<style>
.katex-renderer {
  line-height: 1.6;
}

.katex-renderer .katex {
  font-size: 1.05em;
}
</style>
