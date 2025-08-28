import type { Ref } from 'vue';

export type VueScrollBehaviorExtended = ScrollBehavior | 'instant';

export interface VueSpringAnimation {
  damping?: number;
  stiffness?: number;
  mass?: number;
}

export type VueAnimation = VueScrollBehaviorExtended | VueSpringAnimation;

export interface VueStickToBottomState {
  scrollTop: number;
  lastScrollTop?: number;
  ignoreScrollToTop?: number;
  targetScrollTop: number;
  calculatedTargetScrollTop: number;
  scrollDifference: number;
  resizeDifference: number;

  animation?: {
    behavior: 'instant' | Required<VueSpringAnimation>;
    ignoreEscapes: boolean;
    promise: Promise<boolean>;
  };
  lastTick?: number;
  velocity: number;
  accumulated: number;

  escapedFromLock: boolean;
  isAtBottom: boolean;
  isNearBottom: boolean;

  resizeObserver?: ResizeObserver;
}

export type VueGetTargetScrollTop = (
  targetScrollTop: number,
  elements: { scrollElement: HTMLElement; contentElement: HTMLElement }
) => number;

export interface VueStickToBottomOptions extends VueSpringAnimation {
  resize?: VueAnimation;
  initial?: VueAnimation | boolean;
  targetScrollTop?: VueGetTargetScrollTop;
}

export type VueScrollToBottomOptions =
  | VueScrollBehaviorExtended
  | {
      animation?: VueAnimation;
      wait?: boolean | number;
      ignoreEscapes?: boolean;
      preserveScrollPosition?: boolean;
      duration?: number | Promise<void>;
    };

export type VueScrollToBottom = (
  options?: VueScrollToBottomOptions
) => Promise<boolean> | boolean;
export type VueStopScroll = () => void;

export interface VueStickToBottomInstance {
  contentRef: Ref<HTMLElement | null>;
  scrollRef: Ref<HTMLElement | null>;
  scrollToBottom: VueScrollToBottom;
  stopScroll: VueStopScroll;
  isAtBottom: Ref<boolean>;
  isNearBottom: Ref<boolean>;
  escapedFromLock: Ref<boolean>;
  state: VueStickToBottomState;
}

export interface VueStickToBottomContext {
  contentRef: Ref<HTMLElement | null>;
  scrollRef: Ref<HTMLElement | null>;
  scrollToBottom: VueScrollToBottom;
  stopScroll: VueStopScroll;
  isAtBottom: boolean;
  escapedFromLock: boolean;
  get targetScrollTop(): VueGetTargetScrollTop | null;
  set targetScrollTop(v: VueGetTargetScrollTop | null);
  state: VueStickToBottomState;
}

export const VueStickToBottomKey = Symbol('VueStickToBottom') as symbol;
