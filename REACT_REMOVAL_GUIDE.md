# React Removal Guide for use-stick-to-bottom

> **Status**: Vue 3 conversion complete with full feature parity. React components ready for removal.

## Overview

This guide documents the current dual-framework state and provides a roadmap for removing React components while preserving the complete Vue 3 implementation. The Vue implementation has **100% feature parity** with React and is production-ready.

## Current Architecture

### Files to Remove (React-specific)
```
src/
├── StickToBottom.tsx           # React component - REMOVE
├── useStickToBottom.ts         # React hook - REMOVE
└── useStickToBottomContext.ts  # React context hook - REMOVE

demo/
├── Demo.tsx                    # React demo - REMOVE
├── index.tsx                   # React demo entry - REMOVE
├── useFakeMessages.tsx         # React demo utility - REMOVE
└── combined.tsx                # Dual framework demo - REMOVE AFTER UPDATING
```

### Files to Keep (Vue 3 implementation)
```
src/
├── StickToBottomVue.vue        # Main Vue wrapper - KEEP & RENAME
├── StickToBottomContent.vue    # Vue content wrapper - KEEP & RENAME
├── useStickToBottomVue.ts      # Vue composable - KEEP & RENAME
├── useStickToBottomContext.ts  # Vue context - KEEP (already Vue-only)
├── types.ts                    # Vue types - KEEP & CLEAN UP
└── vue-components.d.ts         # Vue TS support - KEEP

demo/vue/
├── Demo.vue                    # Vue demo - KEEP & PROMOTE
├── Messages.vue                # Vue demo component - KEEP
├── MessagesContent.vue         # Vue demo component - KEEP
├── ScrollToBottom.vue          # Vue demo component - KEEP
├── Message.vue                 # Vue demo component - KEEP
├── main.ts                     # Vue demo entry - KEEP
└── useFakeMessages.ts          # Vue demo utility - KEEP & PROMOTE
```

## Removal Strategy

### Phase 1: File Removal
1. Delete React-specific source files
2. Delete React demo files
3. Update demo structure to promote Vue demo

### Phase 2: Renaming & Restructuring
```bash
# Rename Vue components to primary names
src/StickToBottomVue.vue → src/StickToBottom.vue
src/StickToBottomContent.vue → src/StickToBottomContent.vue (no change)
src/useStickToBottomVue.ts → src/useStickToBottom.ts

# Promote Vue demo to main demo
demo/vue/* → demo/*
demo/vue/ → DELETE (empty directory)
```

### Phase 3: Export Updates

#### Current exports in `src/index.ts`:
```typescript
// React exports (REMOVE)
export * from './StickToBottom.js';
export * from './useStickToBottom.js';
export { useStickToBottomContext } from './useStickToBottomContext.js';

// Vue exports (KEEP & SIMPLIFY)
export { default as StickToBottomContent } from './StickToBottomContent.vue';
export { default as StickToBottom } from './StickToBottomVue.vue';
export * from './types.js';
export { useStickToBottomContext } from './useStickToBottomContext.js';
export { useStickToBottom as useStickToBottomVue } from './useStickToBottomVue.js';
```

#### Target exports after cleanup:
```typescript
// Primary Vue exports with standard names
export { default as StickToBottom } from './StickToBottom.vue';
export { default as StickToBottomContent } from './StickToBottomContent.vue';
export { useStickToBottom } from './useStickToBottom.js';
export { useStickToBottomContext } from './useStickToBottomContext.js';
export * from './types.js';
```

### Phase 4: Type Cleanup

#### Current `types.ts` has Vue-prefixed types. Rename:
```typescript
// Current Vue types (rename to primary names)
VueStickToBottomState → StickToBottomState
VueStickToBottomOptions → StickToBottomOptions
VueStickToBottomInstance → StickToBottomInstance
VueScrollToBottom → ScrollToBottom
VueScrollToBottomOptions → ScrollToBottomOptions
VueStopScroll → StopScroll
VueGetTargetScrollTop → GetTargetScrollTop
VueSpringAnimation → SpringAnimation
VueAnimation → Animation
VueScrollBehaviorExtended → ScrollBehaviorExtended
VueStickToBottomContext → StickToBottomContext
VueStickToBottomKey → StickToBottomKey
```

### Phase 5: Package.json Updates

#### Dependencies to remove:
```json
{
  "peerDependencies": {
    "react": "^16.8.0 || ^17.0.0 || ^18.0.0 || ^19.0.0",  // REMOVE
    "vue": "^3.4.0"  // KEEP
  },
  "devDependencies": {
    "@types/react": "^18.3.3",           // REMOVE
    "@types/react-dom": "^18.3.0",       // REMOVE
    "@vitejs/plugin-react": "^4.3.1",    // REMOVE
    "react": "^16.8.0 || ^17.0.0 || ^18.0.0",  // REMOVE
    "react-dom": "^18.0.0",              // REMOVE
    // Keep Vue dependencies
    "@vitejs/plugin-vue": "^5.0.4",      // KEEP
    "vue": "^3.4.0"                      // KEEP
  }
}
```

#### Scripts to update:
```json
{
  "scripts": {
    "dev": "vite",                    // Keep (will use main Vue demo)
    "dev:react": "...",               // REMOVE
    "dev:vue": "...",                 // REMOVE (becomes main dev)
  }
}
```

### Phase 6: Demo Structure Updates

#### Current demo configuration files to remove:
- `vite.config.react.ts` - REMOVE
- `vite.config.vue.ts` - REMOVE (functionality moves to main vite.config.ts)
- `demo/react.html` - REMOVE
- `vue.html` - REMOVE
- `demo/index.html` - UPDATE (remove dual framework UI)

#### Target demo structure:
```
demo/
├── Demo.vue          # Main demo (from demo/vue/Demo.vue)
├── Messages.vue      # From demo/vue/
├── MessagesContent.vue
├── ScrollToBottom.vue
├── Message.vue
├── main.ts           # Entry point (from demo/vue/main.ts)
├── useFakeMessages.ts
└── index.css         # Shared styles
```

#### Update main `index.html`:
```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>use-stick-to-bottom Vue 3 Demo</title>
  </head>
  <body>
    <div id="app"></div>
    <script type="module" src="/demo/main.ts"></script>
  </body>
</html>
```

## Build System Considerations

### Current TypeScript Setup
- `tsconfig.app.json` - Update to remove React JSX settings
- `tsconfig.demo.json` - Already includes Vue support
- Build process already works with Vue SFCs

### Vite Configuration
Current `vite.config.ts` includes both React and Vue plugins:
```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';  // REMOVE
import vue from '@vitejs/plugin-vue';      // KEEP

export default defineConfig({
  plugins: [react(), vue()],  // Change to: plugins: [vue()],
});
```

## Vue Implementation Feature Completeness

### ✅ Fully Implemented Features

The Vue implementation has complete feature parity:

1. **Spring Animation System** (`useStickToBottomVue.ts:26-49`)
   - Velocity-based physics with configurable mass, damping, stiffness
   - Custom animation loop with requestAnimationFrame
   - Identical spring constants to React version

2. **Scroll Anchoring** (`useStickToBottomVue.ts:390-477`)
   - ResizeObserver with positive/negative resize handling
   - Prevents viewport jumping during content changes
   - Scroll difference calculation and offset handling

3. **User Interaction Detection** (`useStickToBottomVue.ts:89-106`, `useStickToBottomVue.ts:370-388`)
   - Mouse selection detection during scroll
   - Wheel event handling for escape behavior
   - Proper event listener cleanup

4. **Promise-based API** (`useStickToBottomVue.ts:171-309`)
   - `scrollToBottom()` returns `Promise<boolean>`
   - Supports wait, duration, ignoreEscapes options
   - Proper animation cancellation

5. **Context System** (`StickToBottomVue.vue:49-74`)
   - provide/inject pattern matching React Context
   - Reactive getters for isAtBottom, escapedFromLock
   - Component prop passing and instance override support

## Documentation Updates Needed

### README.md
- Remove React examples and imports
- Update primary examples to use non-prefixed Vue component names
- Update description to "Vue 3 library" instead of "React and Vue 3"

### Package Description
- Update to focus on Vue 3 as primary framework
- Remove React references in description and keywords

## Testing Recommendations

After removal:
1. **Build Test**: `pnpm build` should complete without React dependencies
2. **Demo Test**: `pnpm dev` should serve Vue demo correctly
3. **Export Test**: Verify all components can be imported with clean names
4. **Type Test**: Ensure TypeScript compilation works without React types

## Migration Path for Existing Users

### For React Users
Provide migration documentation showing:
```typescript
// Before (React)
import { StickToBottom, useStickToBottomContext } from 'use-stick-to-bottom';

// After (Vue 3 - new major version)
import { StickToBottom, useStickToBottomContext } from 'use-stick-to-bottom';
// Usage changes to Vue 3 patterns
```

### Version Strategy
- Current version: `1.1.1` (dual framework)
- Next version: `2.0.0` (Vue 3 only - breaking change)

## Key Files for Reference

When removing React, reference these Vue implementation files as the source of truth:
- `src/useStickToBottomVue.ts` - Complete implementation with all features
- `src/StickToBottomVue.vue` - Component wrapper with prop handling
- `demo/vue/Demo.vue` - Working demo showing all functionality
- `src/types.ts` - Type definitions (currently Vue-prefixed)

## Risk Assessment

**Low Risk**: Vue implementation is complete and tested
- All React features ported successfully
- Demo shows identical behavior
- Build system already supports Vue-only compilation
- No breaking changes to Vue API surface

**Completion Estimate**: 2-3 hours for careful removal and testing