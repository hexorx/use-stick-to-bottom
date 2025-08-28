<template>
  <div
    ref="context.scrollRef"
    style="height: 100%; width: 100%; overflow: auto"
  >
    <div v-bind="$attrs" ref="context.contentRef">
      <slot :context="context" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useStickToBottomContext } from './useStickToBottomContext.js';

const context = useStickToBottomContext();
</script>
