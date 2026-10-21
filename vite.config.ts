import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  base: process.env.VITE_BASE_PATH ?? '/',
  plugins: [react()],
  build: {
    // Course markdown/quizzes dominate bundle size; warn only above that floor.
    chunkSizeWarningLimit: 4500,
    // Keep EN content out of the entry HTML modulepreload list so it only
    // downloads after loadEnContent() (locale switch / idle prefetch).
    modulePreload: {
      resolveDependencies: (_url, deps) =>
        deps.filter((dep) => !/[\\/]content-en[^/]*\.js$|content-en-/.test(dep)),
    },
    rolldownOptions: {
      output: {
        // Split vendor and course content so the entry chunk stays smaller
        // and content/vendor can cache independently when UI-only files change.
        codeSplitting: {
          groups: [
            {
              name: 'vendor',
              test: /node_modules/,
            },
            {
              name: 'content-en',
              test: /[\\/]src[\\/]content[\\/]en[\\/]/,
              priority: 10,
            },
            {
              name: 'content',
              test: /[\\/]src[\\/]content[\\/]/,
            },
          ],
        },
      },
    },
  },
})
