/*!---------------------------------------------------------------------------------------------
 *  Copyright (c) StackBlitz. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { computed, onUnmounted, reactive, ref, watch } from 'vue';
import type {
  VueAnimation,
  VueScrollToBottom,
  VueSpringAnimation,
  VueStickToBottomInstance,
  VueStickToBottomOptions,
  VueStickToBottomState,
  VueStopScroll,
} from './types.js';

const DEFAULT_SPRING_ANIMATION = {
  /**
   * A value from 0 to 1, on how much to damp the animation.
   * 0 means no damping, 1 means full damping.
   *
   * @default 0.7
   */
  damping: 0.7,

  /**
   * The stiffness of how fast/slow the animation gets up to speed.
   *
   * @default 0.05
   */
  stiffness: 0.05,

  /**
   * The inertial mass associated with the animation.
   * Higher numbers make the animation slower.
   *
   * @default 1.25
   */
  mass: 1.25,
};

const STICK_TO_BOTTOM_OFFSET_PX = 70;
const SIXTY_FPS_INTERVAL_MS = 1000 / 60;
const RETAIN_ANIMATION_DURATION_MS = 350;

let mouseDown = false;

// Global mouse tracking for selection detection
if (typeof globalThis !== 'undefined' && globalThis.document) {
  globalThis.document.addEventListener('mousedown', () => {
    mouseDown = true;
  });

  globalThis.document.addEventListener('mouseup', () => {
    mouseDown = false;
  });

  globalThis.document.addEventListener('click', () => {
    mouseDown = false;
  });
}

export function useStickToBottom(
  options: VueStickToBottomOptions = {}
): VueStickToBottomInstance {
  const scrollRef = ref<HTMLElement | null>(null);
  const contentRef = ref<HTMLElement | null>(null);

  const escapedFromLock = ref(false);
  const isAtBottom = ref(options.initial !== false);
  const isNearBottom = ref(false);

  const optionsRef = ref<VueStickToBottomOptions>(options);

  // Keep options up to date
  watch(
    () => options,
    (newOptions) => {
      optionsRef.value = newOptions;
    },
    { deep: true }
  );

  const isSelecting = (): boolean => {
    if (!mouseDown) {
      return false;
    }

    const selection = window.getSelection();
    if (!selection || !selection.rangeCount) {
      return false;
    }

    const range = selection.getRangeAt(0);
    return (
      (scrollRef.value
        ? range.commonAncestorContainer.contains(scrollRef.value)
        : false) ||
      (scrollRef.value?.contains(range.commonAncestorContainer) ?? false)
    );
  };

  const setIsAtBottom = (value: boolean) => {
    isAtBottom.value = value;
  };

  const setEscapedFromLock = (value: boolean) => {
    escapedFromLock.value = value;
  };

  const setIsNearBottom = (value: boolean) => {
    isNearBottom.value = value;
  };

  const state = reactive<VueStickToBottomState>({
    resizeDifference: 0,
    accumulated: 0,
    velocity: 0,
    ignoreScrollToTop: undefined,
    lastScrollTop: undefined,
    lastTick: undefined,
    animation: undefined,
    resizeObserver: undefined,
  });

  // Helper functions instead of getters for better performance
  const getScrollTop = (): number => {
    return scrollRef.value?.scrollTop ?? 0;
  };

  const setScrollTop = (scrollTop: number) => {
    if (scrollRef.value) {
      scrollRef.value.scrollTop = scrollTop;
      state.ignoreScrollToTop = scrollRef.value.scrollTop;
    }
  };

  const getTargetScrollTop = (): number => {
    if (!scrollRef.value || !contentRef.value) {
      return 0;
    }
    return scrollRef.value.scrollHeight - 1 - scrollRef.value.clientHeight;
  };

  const getCalculatedTargetScrollTop = (): number => {
    if (!scrollRef.value || !contentRef.value) {
      return 0;
    }

    const targetScrollTop = getTargetScrollTop();

    if (!optionsRef.value.targetScrollTop) {
      return targetScrollTop;
    }

    return Math.max(
      Math.min(
        optionsRef.value.targetScrollTop(targetScrollTop, {
          scrollElement: scrollRef.value,
          contentElement: contentRef.value,
        }),
        targetScrollTop
      ),
      0
    );
  };

  const getScrollDifference = (): number => {
    return getCalculatedTargetScrollTop() - getScrollTop();
  };

  const scrollToBottom: VueScrollToBottom = (scrollOptions = {}) => {
    if (typeof scrollOptions === 'string') {
      scrollOptions = { animation: scrollOptions };
    }

    if (!scrollOptions.preserveScrollPosition) {
      setIsAtBottom(true);
    }

    const waitElapsed = Date.now() + (Number(scrollOptions.wait) || 0);
    const behavior = mergeAnimations(optionsRef.value, scrollOptions.animation);
    const { ignoreEscapes = false } = scrollOptions;

    let durationElapsed: number;
    let startTarget = getCalculatedTargetScrollTop();

    if (scrollOptions.duration instanceof Promise) {
      scrollOptions.duration.finally(() => {
        durationElapsed = Date.now();
      });
    } else {
      durationElapsed = waitElapsed + (scrollOptions.duration ?? 0);
    }

    const next = async (): Promise<boolean> => {
      const promise = new Promise<boolean>((resolve) => {
        requestAnimationFrame(() => {
          if (!isAtBottom.value) {
            state.animation = undefined;
            resolve(false);
            return;
          }

          const scrollTop = getScrollTop();
          const tick = performance.now();
          const tickDelta =
            (tick - (state.lastTick ?? tick)) / SIXTY_FPS_INTERVAL_MS;

          state.animation = state.animation || {
            behavior,
            promise,
            ignoreEscapes,
          };

          if (state.animation.behavior === behavior) {
            state.lastTick = tick;
          }

          if (isSelecting()) {
            next().then(resolve);
            return;
          }

          if (waitElapsed > Date.now()) {
            next().then(resolve);
            return;
          }

          if (
            scrollTop < Math.min(startTarget, getCalculatedTargetScrollTop())
          ) {
            if (state.animation?.behavior === behavior) {
              if (behavior === 'instant') {
                setScrollTop(getCalculatedTargetScrollTop());
                next().then(resolve);
                return;
              }

              state.velocity =
                (behavior.damping * state.velocity +
                  behavior.stiffness * getScrollDifference()) /
                behavior.mass;
              state.accumulated += state.velocity * tickDelta;
              setScrollTop(getScrollTop() + state.accumulated);

              if (getScrollTop() !== scrollTop) {
                state.accumulated = 0;
              }
            }

            next().then(resolve);
            return;
          }

          if (durationElapsed > Date.now()) {
            startTarget = getCalculatedTargetScrollTop();
            next().then(resolve);
            return;
          }

          state.animation = undefined;

          // If we're still below the target, queue up another scroll
          if (getScrollTop() < getCalculatedTargetScrollTop()) {
            const result = scrollToBottom({
              animation: mergeAnimations(
                optionsRef.value,
                optionsRef.value.resize
              ),
              ignoreEscapes,
              duration: Math.max(0, durationElapsed - Date.now()) || undefined,
            });
            if (result instanceof Promise) {
              result.then(resolve);
            } else {
              resolve(result);
            }
            return;
          }

          resolve(isAtBottom.value);
        });
      });

      promise.then((result) => {
        requestAnimationFrame(() => {
          if (!state.animation) {
            state.lastTick = undefined;
            state.velocity = 0;
          }
        });

        return result;
      });

      return promise;
    };

    if (scrollOptions.wait !== true) {
      state.animation = undefined;
    }

    if (state.animation?.behavior === behavior) {
      return state.animation.promise;
    }

    return next();
  };

  const stopScroll: VueStopScroll = () => {
    setEscapedFromLock(true);
    setIsAtBottom(false);
    state.animation = undefined;
    state.velocity = 0;
    state.accumulated = 0;
  };

  const handleScroll = (event: Event) => {
    if (event.target !== scrollRef.value) {
      return;
    }

    const scrollTop = getScrollTop();
    const ignoreScrollToTop = state.ignoreScrollToTop;
    let lastScrollTop = state.lastScrollTop ?? scrollTop;

    state.lastScrollTop = scrollTop;
    state.ignoreScrollToTop = undefined;

    if (ignoreScrollToTop && ignoreScrollToTop > scrollTop) {
      lastScrollTop = ignoreScrollToTop;
    }

    setIsNearBottom(getScrollDifference() <= STICK_TO_BOTTOM_OFFSET_PX);

    // Use setTimeout to handle potential race conditions with ResizeObserver
    setTimeout(() => {
      if (state.resizeDifference || scrollTop === ignoreScrollToTop) {
        return;
      }

      if (isSelecting()) {
        setEscapedFromLock(true);
        setIsAtBottom(false);
        return;
      }

      const isScrollingDown = scrollTop > lastScrollTop;
      const isScrollingUp = scrollTop < lastScrollTop;

      if (state.animation?.ignoreEscapes) {
        setScrollTop(lastScrollTop);
        return;
      }

      if (isScrollingUp) {
        setEscapedFromLock(true);
        setIsAtBottom(false);
      }

      if (isScrollingDown) {
        setEscapedFromLock(false);
      }

      if (
        !escapedFromLock.value &&
        getScrollDifference() <= STICK_TO_BOTTOM_OFFSET_PX
      ) {
        setIsAtBottom(true);
      }
    }, 1);
  };

  const handleWheel = (event: WheelEvent) => {
    let element = event.target as HTMLElement;

    while (!['scroll', 'auto'].includes(getComputedStyle(element).overflow)) {
      if (!element.parentElement) {
        return;
      }
      element = element.parentElement;
    }

    // Prevent scroll escape when wheel scrolled up
    if (
      element === scrollRef.value &&
      event.deltaY < 0 &&
      scrollRef.value.scrollHeight > scrollRef.value.clientHeight &&
      !state.animation?.ignoreEscapes
    ) {
      setEscapedFromLock(true);
      setIsAtBottom(false);
    }
  };

  // Setup event listeners and ResizeObserver
  watch(
    scrollRef,
    (newScrollRef, oldScrollRef) => {
      // Remove old listeners
      oldScrollRef?.removeEventListener('scroll', handleScroll);
      oldScrollRef?.removeEventListener('wheel', handleWheel);

      // Add new listeners
      if (newScrollRef) {
        newScrollRef.addEventListener('scroll', handleScroll, {
          passive: true,
        });
        newScrollRef.addEventListener('wheel', handleWheel, { passive: true });
      }
    },
    { immediate: true }
  );

  watch(
    contentRef,
    (newContentRef) => {
      state.resizeObserver?.disconnect();

      if (!newContentRef) {
        return;
      }

      let previousHeight: number | undefined;

      state.resizeObserver = new ResizeObserver(([entry]) => {
        const { height } = entry.contentRect;
        const difference = height - (previousHeight ?? height);

        state.resizeDifference = difference;

        // Check for overscroll and adjust
        if (getScrollTop() > getTargetScrollTop()) {
          setScrollTop(getTargetScrollTop());
        }

        setIsNearBottom(getScrollDifference() <= STICK_TO_BOTTOM_OFFSET_PX);

        if (difference >= 0) {
          // Positive resize: scroll to bottom if already at bottom
          const animation = mergeAnimations(
            optionsRef.value,
            previousHeight ? optionsRef.value.resize : optionsRef.value.initial
          );

          scrollToBottom({
            animation,
            wait: true,
            preserveScrollPosition: true,
            duration:
              animation === 'instant'
                ? undefined
                : RETAIN_ANIMATION_DURATION_MS,
          });
        } else {
          // Negative resize: check if we're near bottom
          if (getScrollDifference() <= STICK_TO_BOTTOM_OFFSET_PX) {
            setEscapedFromLock(false);
            setIsAtBottom(true);
          }
        }

        previousHeight = height;

        // Reset resize difference after scroll event
        requestAnimationFrame(() => {
          setTimeout(() => {
            if (state.resizeDifference === difference) {
              state.resizeDifference = 0;
            }
          }, 1);
        });
      });

      state.resizeObserver.observe(newContentRef);
    },
    { immediate: true }
  );

  onUnmounted(() => {
    state.resizeObserver?.disconnect();
    state.resizeObserver = undefined;
    state.animation = undefined;
    state.velocity = 0;
    state.accumulated = 0;
    scrollRef.value?.removeEventListener('scroll', handleScroll);
    scrollRef.value?.removeEventListener('wheel', handleWheel);
  });

  return {
    contentRef,
    scrollRef,
    scrollToBottom,
    stopScroll,
    isAtBottom: computed(() => isAtBottom.value || isNearBottom.value),
    isNearBottom,
    escapedFromLock,
    state,
  };
}

// Animation merging utility
const animationCache = new Map<
  string,
  Readonly<Required<VueSpringAnimation>>
>();

function mergeAnimations(
  ...animations: (VueAnimation | boolean | undefined)[]
) {
  const result = { ...DEFAULT_SPRING_ANIMATION };
  let instant = false;

  for (const animation of animations) {
    if (animation === 'instant') {
      instant = true;
      continue;
    }

    if (typeof animation !== 'object' || animation === null) {
      continue;
    }

    instant = false;

    result.damping = animation.damping ?? result.damping;
    result.stiffness = animation.stiffness ?? result.stiffness;
    result.mass = animation.mass ?? result.mass;
  }

  const key = JSON.stringify(result);

  if (!animationCache.has(key)) {
    animationCache.set(key, Object.freeze(result));
  }

  return instant ? 'instant' : animationCache.get(key)!;
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
