import { nextTick, onMounted, onUnmounted, reactive, ref, watch } from 'vue';
import type {
  VueScrollToBottomOptions,
  VueStickToBottomInstance,
  VueStickToBottomOptions,
  VueStickToBottomState,
} from './types.js';

const STICK_TO_BOTTOM_OFFSET_PX = 70;

export function useStickToBottom(
  options: VueStickToBottomOptions = {}
): VueStickToBottomInstance {
  const scrollRef = ref<HTMLElement | null>(null);
  const contentRef = ref<HTMLElement | null>(null);

  const isAtBottom = ref(options.initial !== false);
  const escapedFromLock = ref(false);
  const isNearBottom = ref(false);

  const state = reactive<VueStickToBottomState>({
    scrollTop: 0,
    targetScrollTop: 0,
    scrollDifference: 0,
    resizeDifference: 0,
    escapedFromLock: escapedFromLock.value,
    isAtBottom: isAtBottom.value,
    isNearBottom: isNearBottom.value,
  });

  function updateState(el: HTMLElement) {
    const bottom = el.scrollHeight - el.clientHeight;
    const diff = bottom - el.scrollTop;
    state.scrollTop = el.scrollTop;
    state.isAtBottom = diff <= 0;
    isAtBottom.value = state.isAtBottom;
    state.isNearBottom = diff <= STICK_TO_BOTTOM_OFFSET_PX;
    isNearBottom.value = state.isNearBottom;
  }

  function scrollToBottom(opts: VueScrollToBottomOptions = {}): boolean {
    const el = scrollRef.value;
    const content = contentRef.value;
    if (!el || !content) return false;
    let target = content.offsetHeight;
    if (options.targetScrollTop) {
      target = options.targetScrollTop(target, {
        scrollElement: el,
        contentElement: content,
      });
    }
    el.scrollTo({
      top: target,
      behavior:
        opts.animation === 'instant' ? 'auto' : opts.animation ?? 'smooth',
    });
    return true;
  }

  function stopScroll() {
    // noop - browser scrolling can't easily be stopped
  }

  // Auto-scroll to bottom when new content is added
  async function autoScrollToBottom() {
    if (!isAtBottom.value) return;

    await nextTick();
    const el = scrollRef.value;
    if (!el) return;

    // Use the resize behavior setting
    const behavior = options.resize;
    if (behavior === false) return;

    el.scrollTo({
      top: el.scrollHeight - el.clientHeight,
      behavior: behavior === 'instant' ? 'auto' : behavior ?? 'smooth',
    });
  }

  onMounted(() => {
    const el = scrollRef.value;
    if (!el) return;

    const handler = () => updateState(el);
    el.addEventListener('scroll', handler);
    handler();

    // Set up resize observer to auto-scroll when content changes
    if (options.resize !== false) {
      const resizeObserver = new ResizeObserver(() => {
        autoScrollToBottom();
      });

      // Watch for contentRef changes and observe the new element
      watch(
        contentRef,
        (newContentRef) => {
          if (newContentRef) {
            resizeObserver.observe(newContentRef);
          }
        },
        { immediate: true }
      );

      onUnmounted(() => {
        resizeObserver.disconnect();
      });
    }

    onUnmounted(() => {
      el.removeEventListener('scroll', handler);
    });
  });

  return {
    contentRef,
    scrollRef,
    scrollToBottom,
    stopScroll,
    isAtBottom,
    escapedFromLock,
    state,
  };
}

export type {
  VueGetTargetScrollTop,
  VueScrollToBottom,
  VueScrollToBottomOptions,
  VueStickToBottomInstance,
  VueStickToBottomOptions,
  VueStickToBottomState,
  VueStopScroll,
} from './types.js';
