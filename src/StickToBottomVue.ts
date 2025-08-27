import {
	type PropType,
	type Ref,
	type VNode,
	defineComponent,
	h,
	inject,
	onMounted,
	provide,
	reactive,
	ref,
} from "vue";
import {
	type GetTargetScrollTop,
	type ScrollToBottom,
	type StickToBottomInstance,
	type StickToBottomOptions,
	type StickToBottomState,
	type StopScroll,
	useStickToBottom,
} from "./useStickToBottomVue.js";

export interface StickToBottomContext {
	contentRef: Ref<HTMLElement | null>;
	scrollRef: Ref<HTMLElement | null>;
	scrollToBottom: ScrollToBottom;
	stopScroll: StopScroll;
	isAtBottom: boolean;
	escapedFromLock: boolean;
	get targetScrollTop(): GetTargetScrollTop | null;
	set targetScrollTop(v: GetTargetScrollTop | null);
	state: StickToBottomState;
}

export const StickToBottomKey = Symbol("StickToBottom");

export const StickToBottom = defineComponent({
	name: "StickToBottom",
	props: {
		contextRef: Function as PropType<(ctx: StickToBottomContext) => void>,
		instance: Object as PropType<StickToBottomInstance>,
		resize: [String, Object] as PropType<StickToBottomOptions["resize"]>,
		initial: [String, Object, Boolean] as PropType<
			StickToBottomOptions["initial"]
		>,
		mass: Number as PropType<StickToBottomOptions["mass"]>,
		damping: Number as PropType<StickToBottomOptions["damping"]>,
		stiffness: Number as PropType<StickToBottomOptions["stiffness"]>,
		targetScrollTop: Function as PropType<GetTargetScrollTop>,
	},
	setup(props, { slots, attrs }) {
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

		const context = reactive<StickToBottomContext>({
			scrollRef: inst.scrollRef,
			contentRef: inst.contentRef,
			scrollToBottom: inst.scrollToBottom,
			stopScroll: inst.stopScroll,
			get isAtBottom() {
				return inst.isAtBottom.value;
			},
			get escapedFromLock() {
				return inst.escapedFromLock.value;
			},
			get targetScrollTop() {
				return customTargetScrollTop.value;
			},
			set targetScrollTop(v: GetTargetScrollTop | null) {
				customTargetScrollTop.value = v;
			},
			state: inst.state,
		});

		provide(StickToBottomKey, context);

		if (props.contextRef) {
			props.contextRef(context);
		}

		onMounted(() => {
			const el = inst.scrollRef.value;
			if (el && getComputedStyle(el).overflow === "visible") {
				el.style.overflow = "auto";
			}
		});

		return () => {
			const slot = slots.default ? slots.default(context as any) : [];
			return h("div", attrs, slot as VNode[]);
		};
	},
});

export const StickToBottomContent = defineComponent({
	name: "StickToBottomContent",
	setup(_, { slots }) {
		const context = useStickToBottomContext();
		return () =>
			h(
				"div",
				{ ref: context.scrollRef, style: { height: "100%", width: "100%" } },
				[
					h(
						"div",
						{ ref: context.contentRef },
						slots.default ? slots.default(context as any) : [],
					),
				],
			);
	},
});

export function useStickToBottomContext(): StickToBottomContext {
	const ctx = inject<StickToBottomContext | null>(StickToBottomKey, null);
	if (!ctx) {
		throw new Error(
			"useStickToBottomContext must be used within a StickToBottom component",
		);
	}
	return ctx;
}
