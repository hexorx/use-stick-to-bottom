<template>
  <button
    v-if="!isAtBottom"
    class="absolute i-ph-arrow-circle-down-fill text-4xl rounded-lg left-[50%] translate-x-[-50%] bottom-0"
    @click="scrollToBottom()"
  />
</template>

<script setup lang="ts">
import { useStickToBottomContext } from '../src/index';

const { isAtBottom, scrollToBottom } = useStickToBottomContext();
</script>
