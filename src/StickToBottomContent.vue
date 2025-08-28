<template>
  <div ref="scrollRef" style="height: 100%; width: 100%; overflow: auto">
    <div v-bind="$attrs" ref="contentRef">
      <slot :context="context" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useStickToBottomContext } from './useStickToBottomContext.js';

const context = useStickToBottomContext();
// Destructure the refs so Vue's template ref system can work with them
const { scrollRef, contentRef } = context;
</script>
