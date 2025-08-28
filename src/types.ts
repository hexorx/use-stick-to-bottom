import type { Ref } from 'vue';

export type ScrollBehaviorExtended = ScrollBehavior | 'instant';

export interface SpringAnimation {
  damping?: number;
  stiffness?: number;
  mass?: number;
}

export type Animation = ScrollBehaviorExtended | SpringAnimation;

export interface StickToBottomState {
  lastScrollTop?: number;
  ignoreScrollToTop?: number;
  resizeDifference: number;

  animation?: {
    behavior: 'instant' | Required<SpringAnimation>;
    ignoreEscapes: boolean;
    promise: Promise<boolean>;
  };
  lastTick?: number;
  velocity: number;
  accumulated: number;

  resizeObserver?: ResizeObserver;
}

export type GetTargetScrollTop = (
  targetScrollTop: number,
  elements: { scrollElement: HTMLElement; contentElement: HTMLElement }
) => number;

export interface StickToBottomOptions extends SpringAnimation {
  resize?: Animation;
  initial?: Animation | boolean;
  targetScrollTop?: GetTargetScrollTop;
}

export type ScrollToBottomOptions =
  | ScrollBehaviorExtended
  | {
      animation?: Animation;
      wait?: boolean | number;
      ignoreEscapes?: boolean;
      preserveScrollPosition?: boolean;
      duration?: number | Promise<void>;
    };

export type ScrollToBottom = (
  options?: ScrollToBottomOptions
) => Promise<boolean> | boolean;
export type StopScroll = () => void;

export interface StickToBottomInstance {
  contentRef: Ref<HTMLElement | null>;
  scrollRef: Ref<HTMLElement | null>;
  scrollToBottom: ScrollToBottom;
  stopScroll: StopScroll;
  isAtBottom: Ref<boolean>;
  isNearBottom: Ref<boolean>;
  escapedFromLock: Ref<boolean>;
  state: StickToBottomState;
}

export interface StickToBottomContext {
  contentRef: Ref<HTMLElement | null>;
  scrollRef: Ref<HTMLElement | null>;
  scrollToBottom: ScrollToBottom;
  stopScroll: StopScroll;
  isAtBottom: Ref<boolean>;
  escapedFromLock: Ref<boolean>;
  get targetScrollTop(): GetTargetScrollTop | null;
  set targetScrollTop(v: GetTargetScrollTop | null);
  state: StickToBottomState;
}

export const StickToBottomKey = Symbol('StickToBottom') as symbol;
