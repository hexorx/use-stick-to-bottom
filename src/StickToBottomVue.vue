<template>
  <div v-bind="$attrs">
    <slot />
  </div>
</template>

<script setup lang="ts">
import { type PropType, onMounted, provide, ref } from 'vue';
import type {
  VueGetTargetScrollTop,
  VueStickToBottomContext,
  VueStickToBottomInstance,
  VueStickToBottomOptions,
} from './types';
import { VueStickToBottomKey } from './types';
import { useStickToBottom } from './useStickToBottomVue';

const props = defineProps({
  contextRef: Function as PropType<(ctx: VueStickToBottomContext) => void>,
  instance: Object as PropType<VueStickToBottomInstance>,
  resize: [String, Object] as PropType<VueStickToBottomOptions['resize']>,
  initial: [String, Object, Boolean] as PropType<
    VueStickToBottomOptions['initial']
  >,
  mass: Number as PropType<VueStickToBottomOptions['mass']>,
  damping: Number as PropType<VueStickToBottomOptions['damping']>,
  stiffness: Number as PropType<VueStickToBottomOptions['stiffness']>,
  targetScrollTop: Function as PropType<VueGetTargetScrollTop>,
});

const customTargetScrollTop = ref<VueGetTargetScrollTop | null>(null);

const targetScrollTop: VueGetTargetScrollTop = (target, elements) => {
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

const context: VueStickToBottomContext = {
  scrollRef: inst.scrollRef,
  contentRef: inst.contentRef,
  scrollToBottom: inst.scrollToBottom,
  stopScroll: inst.stopScroll,
  isAtBottom: inst.isAtBottom,
  escapedFromLock: inst.escapedFromLock,
  get targetScrollTop() {
    return customTargetScrollTop.value;
  },
  set targetScrollTop(v: VueGetTargetScrollTop | null) {
    customTargetScrollTop.value = v;
  },
  state: inst.state,
};

// Provide the context to child components
provide(VueStickToBottomKey, context);

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
