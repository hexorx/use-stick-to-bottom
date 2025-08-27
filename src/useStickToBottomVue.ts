import { type Ref, onMounted, onUnmounted, reactive, ref } from "vue";

export interface StickToBottomState {
	scrollTop: number;
	targetScrollTop: number;
	scrollDifference: number;
	resizeDifference: number;
	escapedFromLock: boolean;
	isAtBottom: boolean;
	isNearBottom: boolean;
}

export type GetTargetScrollTop = (
	targetScrollTop: number,
	elements: { scrollElement: HTMLElement; contentElement: HTMLElement },
) => number;

export interface StickToBottomOptions {
	resize?: ScrollBehavior;
	initial?: ScrollBehavior | boolean;
	mass?: number;
	damping?: number;
	stiffness?: number;
	targetScrollTop?: GetTargetScrollTop;
}

export type ScrollToBottom = (options?: ScrollToBottomOptions) => boolean;
export type StopScroll = () => void;

export interface ScrollToBottomOptions {
	animation?: ScrollBehavior;
	preserveScrollPosition?: boolean;
	wait?: boolean | number;
}

const STICK_TO_BOTTOM_OFFSET_PX = 70;

export interface StickToBottomInstance {
	contentRef: Ref<HTMLElement | null>;
	scrollRef: Ref<HTMLElement | null>;
	scrollToBottom: ScrollToBottom;
	stopScroll: StopScroll;
	isAtBottom: Ref<boolean>;
	escapedFromLock: Ref<boolean>;
	state: StickToBottomState;
}

export function useStickToBottom(
	options: StickToBottomOptions = {},
): StickToBottomInstance {
	const scrollRef = ref<HTMLElement | null>(null);
	const contentRef = ref<HTMLElement | null>(null);

	const isAtBottom = ref(options.initial !== false);
	const escapedFromLock = ref(false);
	const isNearBottom = ref(false);

	const state = reactive<StickToBottomState>({
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

	function scrollToBottom(opts: ScrollToBottomOptions = {}): boolean {
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
				opts.animation === "instant" ? "auto" : (opts.animation ?? "smooth"),
		});
		return true;
	}

	function stopScroll() {
		// noop - browser scrolling can't easily be stopped
	}

	onMounted(() => {
		const el = scrollRef.value;
		if (!el) return;
		const handler = () => updateState(el);
		el.addEventListener("scroll", handler);
		handler();
		onUnmounted(() => {
			el.removeEventListener("scroll", handler);
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
