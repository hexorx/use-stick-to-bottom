import vue from '@vitejs/plugin-vue';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    dts({
      rollupTypes: true,
      outDir: 'dist',
      entryRoot: 'src',
      include: ['src/**/*.ts', 'src/**/*.vue'],
      exclude: ['demo/**/*'],
      insertTypesEntry: true,
      copyDtsFiles: true,
      compilerOptions: {
        isolatedModules: false,
        skipLibCheck: true,
      },
      beforeWriteFile: (filePath, content) => {
        // Ensure Vue component types are properly generated
        if (filePath.includes('index.d.ts') || filePath.includes('vue.d.ts')) {
          return {
            filePath,
            content: content.replace(
              /export \{\s*\}/,
              'export { StickToBottom, StickToBottomContent, useStickToBottom, useStickToBottomContext } from "./types";'
            ),
          };
        }
        return { filePath, content };
      },
    }),
  ],
  build: {
    lib: {
      entry: {
        index: 'src/index.ts',
        vue: 'src/vue.ts',
      },
      formats: ['es'],
    },
    rollupOptions: {
      external: ['vue'],
      output: {
        entryFileNames: '[name].js',
        chunkFileNames: '[name]-[hash].js',
        assetFileNames: '[name].[ext]',
      },
    },
  },
});
