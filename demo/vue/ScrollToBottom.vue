<template>
  <button
    v-if="!isAtBottom"
    class="absolute bg-blue-500 hover:bg-blue-600 text-white rounded-lg px-3 py-2 text-sm font-medium left-[50%] translate-x-[-50%] bottom-0 shadow-lg"
    @click="scrollToBottom()"
  >
    ↓ Scroll to Bottom
  </button>
</template>

<script setup lang="ts">
import { useStickToBottomContext } from '../../src/index';

const { isAtBottom, scrollToBottom } = useStickToBottomContext();
</script>
