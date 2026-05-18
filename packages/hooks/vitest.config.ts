import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'happy-dom',
    globals: true,
  },
  resolve: {
    alias: {
      '@pulse/types':    new URL('../types/src/index.ts',    import.meta.url).pathname,
      '@pulse/store':    new URL('../store/src/index.ts',    import.meta.url).pathname,
      '@pulse/services': new URL('../services/src/index.ts', import.meta.url).pathname,
    },
  },
})
