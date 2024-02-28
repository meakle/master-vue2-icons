import vue from '@vitejs/plugin-vue2'

import { resolve } from 'path'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [
    vue(),
  ],
  build: {
    outDir: 'lib',
    lib: {
      entry: resolve(__dirname, './index.ts'),
      name: 'lib',
      fileName: 'lib',
      formats: ['cjs', 'es', 'umd'],
    },
    rollupOptions: {
      external: ['vue'],
      output: {
        globals: {
          vue: 'Vue',
        },
      },
    },
  },
})