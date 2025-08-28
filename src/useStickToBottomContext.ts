import { inject } from 'vue';
import type { VueStickToBottomContext } from './types.js';
import { VueStickToBottomKey } from './types.js';

export function useStickToBottomContext(): VueStickToBottomContext {
  const ctx = inject<VueStickToBottomContext | null>(VueStickToBottomKey, null);
  if (!ctx) {
    throw new Error(
      'useStickToBottomContext must be used within a StickToBottom component'
    );
  }
  return ctx;
}
