<template>
  <div v-bind="$attrs">
    <slot />
  </div>
</template>

<script setup lang="ts">
import { type PropType, onMounted, provide, ref } from 'vue';
import type {
  GetTargetScrollTop,
  StickToBottomContext,
  StickToBottomInstance,
  StickToBottomOptions,
} from './types';
import { StickToBottomKey } from './types';
import { useStickToBottom } from './useStickToBottom';

const props = defineProps({
  contextRef: Function as PropType<(ctx: StickToBottomContext) => void>,
  instance: Object as PropType<StickToBottomInstance>,
  resize: [String, Object] as PropType<StickToBottomOptions['resize']>,
  initial: [String, Object, Boolean] as PropType<
    StickToBottomOptions['initial']
  >,
  mass: Number as PropType<StickToBottomOptions['mass']>,
  damping: Number as PropType<StickToBottomOptions['damping']>,
  stiffness: Number as PropType<StickToBottomOptions['stiffness']>,
  targetScrollTop: Function as PropType<GetTargetScrollTop>,
});

const customTargetScrollTop = ref<GetTargetScrollTop | null>(null);

const targetScrollTop: GetTargetScrollTop = (target, elements) => {
  const get = customTargetScrollTop.value ?? props.targetScrollTop;
  return get ? get(target, elements) : target;
};

const defaultInstance = useStickToBottom({
  mass: props.mass,
  damping: props.damping,
  stiffness: props.stiffness,
  resize: props.resize,
  initial: props.initial,
  targetScrollTop,
});

const inst = props.instance ?? defaultInstance;

const context: StickToBottomContext = {
  scrollRef: inst.scrollRef,
  contentRef: inst.contentRef,
  scrollToBottom: inst.scrollToBottom,
  stopScroll: inst.stopScroll,
  isAtBottom: inst.isAtBottom,
  escapedFromLock: inst.escapedFromLock,
  get targetScrollTop() {
    return customTargetScrollTop.value;
  },
  set targetScrollTop(v: GetTargetScrollTop | null) {
    customTargetScrollTop.value = v;
  },
  state: inst.state,
};

// Provide the context to child components
provide(StickToBottomKey, context);

if (props.contextRef) {
  props.contextRef(context);
}

onMounted(() => {
  const el = inst.scrollRef.value;
  if (el && getComputedStyle(el).overflow === 'visible') {
    el.style.overflow = 'auto';
  }
});
</script>
