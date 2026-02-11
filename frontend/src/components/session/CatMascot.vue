<script setup>
defineProps({
  state: {
    type: String,
    required: true,
    validator: (v) => ['waiting', 'correct', 'incorrect'].includes(v),
  },
})
</script>

<template>
  <div class="cat-mascot">
    <img
      v-if="state === 'waiting'"
      :src="'/assets/app/cat_waiting.png'"
      alt="Cat waiting"
      class="cat-mascot__waiting"
    />
    <img
      v-if="state === 'correct'"
      :src="'/assets/app/cat_happy.png'"
      alt="Cat happy"
      class="cat-mascot__correct"
    />
    <img
      v-if="state === 'incorrect'"
      :src="'/assets/app/cat_shocked.png'"
      alt="Cat shocked"
      class="cat-mascot__incorrect"
    />
  </div>
</template>

<style scoped>
.cat-mascot {
  display: flex;
  justify-content: center;
  margin: 0 auto -6px;
  pointer-events: none;
}

.cat-mascot img {
  width: 82px;
  height: auto;
}

.cat-mascot__waiting {
  animation: cat-idle 2s ease-in-out infinite;
}

.cat-mascot__correct {
  animation: cat-happy 0.8s ease-in-out;
}

.cat-mascot__incorrect {
  animation: cat-blown-away 0.7s ease-in forwards;
}
</style>
