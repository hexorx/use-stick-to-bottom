<template>
  <div class="flex flex-col gap-10 p-10 items-center w-full">
    <input
      class="w-full max-w-screen-lg"
      type="range"
      v-model.number="speed"
      min="0"
      max="1"
      step="0.01"
    />
    <div class="flex gap-6 w-full max-w-screen-lg">
      <Messages :speed="speed" animation="smooth" />
      <Messages :speed="speed" animation="instant" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import Messages from './Messages.vue';

const speed = ref(0.2);
</script>
