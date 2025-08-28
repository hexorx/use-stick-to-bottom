# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a dual-framework library (`use-stick-to-bottom`) that provides smooth auto-scrolling functionality for chat applications. The library supports both React and Vue 3 implementations, designed for AI chatbots with streaming content that needs to stick to the bottom while maintaining smooth animations.

Key features:
- Zero-dependency React hook + Component
- Vue 3 composition API support with components
- Velocity-based spring animations (not duration-based easing)
- Uses ResizeObserver for content size detection
- Handles scroll anchoring to prevent viewport jumping
- Distinguishes user scrolling from programmatic animations

## Build & Development Commands

### Essential Commands
- `pnpm dev` - Start Vite development server with both React and Vue demos
- `pnpm build` - Clean dist and build TypeScript declarations (`rm -rf dist && tsc -b`)
- `pnpm lint` - Run Biome linter on src files
- `pnpm lint:fix` - Auto-fix linting issues

### Package Manager
- Uses `pnpm` as the package manager (specified in packageManager field)
- Lock file: `pnpm-lock.yaml`

## Architecture & Code Organization

### Dual Framework Support
The library exports both React and Vue 3 implementations:

**React Implementation:**
- `src/StickToBottom.tsx` - React component
- `src/useStickToBottom.ts` - React hook

**Vue 3 Implementation:**
- `src/StickToBottomVue.vue` - Main Vue wrapper component
- `src/StickToBottomContent.vue` - Content wrapper component
- `src/useStickToBottomVue.ts` - Vue composition API hook
- `src/useStickToBottomContext.ts` - Vue context provider
- `src/types.ts` - Vue-specific TypeScript types

### Export Strategy
The `src/index.ts` file exports both frameworks:
- React components and hooks (original implementation)
- Vue components as `StickToBottom` and `StickToBottomContent`
- Vue hook as `useStickToBottomVue` (aliased to avoid naming conflicts)
- Shared types from `types.ts`

### Key Architectural Patterns

**Component Pattern:**
Both frameworks provide a wrapper component that:
1. Sets up scroll and content refs
2. Provides context for child components to access `isAtBottom` state and `scrollToBottom` function
3. Automatically applies `overflow: auto` if not set

**Hook Pattern:**
Both frameworks provide composable hooks that return:
- `scrollRef` and `contentRef` for manual setup
- `scrollToBottom()` function
- `isAtBottom` reactive state
- `stopScroll()` function (React has custom spring animation, Vue uses browser scrolling)

**Animation System:**
- React: Custom spring-based animation system with configurable mass, damping, stiffness
- Vue: Uses browser's native smooth scrolling (`scroll-behavior`)

## Development Practices

### TypeScript Configuration
- Multiple tsconfig files for different contexts:
  - `tsconfig.json` - Base configuration
  - `tsconfig.app.json` - Application code
  - `tsconfig.demo.json` - Demo applications
  - `tsconfig.node.json` - Node.js configuration

### Linting with Biome
- Configuration in `biome.json`
- Only lints `src/**/*.ts` and `src/**/*.tsx`
- Ignores `dist/**` directory
- Relaxed rules for development: allows `noExplicitAny`, `noDebugger` as info level

### Demo Applications
- `demo/Demo.tsx` - React demo
- `demo/vue/` - Vue 3 demo with separate components
- Both demos use Tailwind CSS and share similar fake message generation logic

### Peer Dependencies
Supports wide version ranges:
- React: `^16.8.0 || ^17.0.0 || ^18.0.0 || ^19.0.0`
- Vue: `^3.4.0`

## Framework-Specific Implementation Notes

### Vue 3 Considerations
- Uses Vue 3 Composition API with `<script setup>`
- Reactive state management with `ref()` and `reactive()`
- Context provided via `provide()/inject()` pattern with `VueStickToBottomKey` symbol
- ResizeObserver integration with Vue's lifecycle hooks (`onMounted`, `onUnmounted`)
- Uses `nextTick()` for DOM update coordination

### React vs Vue Differences
- **Animation**: React has custom spring physics; Vue uses browser's scroll-behavior
- **State Management**: React uses custom state with animation frames; Vue uses reactive refs
- **Context**: React uses React.Context; Vue uses provide/inject
- **Lifecycle**: React uses useEffect; Vue uses composition API lifecycle hooks

## Current Development Status

Based on git status, you're currently working on branch `codex/convert-react-component-to-vue3` with Vue 3 component conversion in progress. The implementation appears complete with both component and hook patterns established.