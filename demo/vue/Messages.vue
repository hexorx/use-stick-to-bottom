<template>
  <div class="prose flex flex-col gap-2 w-full overflow-hidden">
    <h2 class="flex justify-center">{{ animation }}:</h2>
    <StickToBottom
      class="h-[50vh] flex flex-col"
      :resize="animation"
      :initial="animation === 'instant' ? 'instant' : { mass: 10 }"
    >
      <MessagesContent :messages="messages" />
    </StickToBottom>
  </div>
</template>

<script setup lang="ts">
import { type PropType } from 'vue';
import { StickToBottom } from '../../src/StickToBottomVue';
import MessagesContent from './MessagesContent.vue';
import { useFakeMessages } from './useFakeMessages';

const props = defineProps({
  animation: { type: String as PropType<ScrollBehavior>, required: true },
  speed: { type: Number, required: true },
});

const messages = useFakeMessages(props.speed);
</script>
