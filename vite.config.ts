import vue from '@vitejs/plugin-vue2'

import { resolve } from 'path'
import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'

export default defineConfig({
  plugins: [
    vue(),
    dts({ rollupTypes: true })
  ],
  build: {
    outDir: 'lib',
    lib: {
      entry: resolve(__dirname, './index.ts'),
      name: 'icons',
      fileName: 'icons',
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