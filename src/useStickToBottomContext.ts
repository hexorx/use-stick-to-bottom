import { inject } from 'vue';
import type { StickToBottomContext } from './types.js';
import { StickToBottomKey } from './types.js';

export function useStickToBottomContext(): StickToBottomContext {
  const ctx = inject<StickToBottomContext | null>(StickToBottomKey, null);
  if (!ctx) {
    throw new Error(
      'useStickToBottomContext must be used within a StickToBottom component'
    );
  }
  return ctx;
}
