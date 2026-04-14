/// <reference types="vitest/config" />
import { defineConfig } from 'vitest/config'
import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'
import tailwindcss from '@tailwindcss/vite'
import path from 'node:path'

// For GitHub Pages: base = '/<repo-name>/' in production
const base = process.env.GITHUB_ACTIONS
  ? `/${process.env.GITHUB_REPOSITORY?.split('/')[1] ?? ''}/`
  : '/'

export default defineConfig({
  base,
  plugins: [
    react(),
    babel({ presets: [reactCompilerPreset()] }),
    tailwindcss(),
  ],
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    exclude: ['node_modules', 'e2e/**'],
  },
})
