<template>
  <div class="relative w-full flex flex-col overflow-hidden">
    <StickToBottomContent class="flex flex-col gap-4 p-6">
      <Message v-for="n in 10" :key="`static-${n}`">
        <h1>This is a test</h1>
        more testing text...
      </Message>

      <Message v-for="(message, i) in messages" :key="i">
        <template v-for="(part, j) in message" :key="j">
          <component v-if="part.tag" :is="part.tag">{{ part.text }}</component>
          <template v-else>{{ part.text }}</template>
        </template>
      </Message>
    </StickToBottomContent>
    <ScrollToBottom />
  </div>
  <div class="flex justify-center pt-4">
    <button
      class="rounded bg-slate-600 text-white px-4 py-2"
      @click="handleStopScroll"
    >
      Stop Scroll
    </button>
  </div>
</template>

<script setup lang="ts">
import { type PropType } from 'vue';
import {
  StickToBottomContent,
  useStickToBottomContext,
} from '../../src/index.js';
import Message from './Message.vue';
import ScrollToBottom from './ScrollToBottom.vue';
import type { MessageParts } from './useFakeMessages';

defineProps({
  messages: { type: Array as PropType<MessageParts[]>, required: true },
});

const handleStopScroll = () => {
  const { stopScroll } = useStickToBottomContext();
  stopScroll();
};
</script>
