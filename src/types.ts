import type { Ref } from 'vue';

export type VueScrollBehaviorExtended = ScrollBehavior | 'instant';

export interface VueStickToBottomState {
  scrollTop: number;
  targetScrollTop: number;
  scrollDifference: number;
  resizeDifference: number;
  escapedFromLock: boolean;
  isAtBottom: boolean;
  isNearBottom: boolean;
}

export type VueGetTargetScrollTop = (
  targetScrollTop: number,
  elements: { scrollElement: HTMLElement; contentElement: HTMLElement }
) => number;

export interface VueStickToBottomOptions {
  resize?: VueScrollBehaviorExtended | false;
  initial?: VueScrollBehaviorExtended | boolean;
  mass?: number;
  damping?: number;
  stiffness?: number;
  targetScrollTop?: VueGetTargetScrollTop;
}

export type VueScrollToBottom = (options?: VueScrollToBottomOptions) => boolean;
export type VueStopScroll = () => void;

export interface VueScrollToBottomOptions {
  animation?: VueScrollBehaviorExtended;
  preserveScrollPosition?: boolean;
  wait?: boolean | number;
}

export interface VueStickToBottomInstance {
  contentRef: Ref<HTMLElement | null>;
  scrollRef: Ref<HTMLElement | null>;
  scrollToBottom: VueScrollToBottom;
  stopScroll: VueStopScroll;
  isAtBottom: Ref<boolean>;
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
