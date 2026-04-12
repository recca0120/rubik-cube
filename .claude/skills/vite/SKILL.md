---
name: vite
description: Vite 6/7 最佳實踐指南。當需要初始化 Vite 專案、設定 plugin、配置 build、除錯 HMR、path alias 或整合 React/TS/Vitest 時使用。
---

# Vite 最佳實踐

> 基於 2025 年 5 月知識，安裝前用 `pnpm create vite@latest` 取得最新模板。Vite 7 需 Node 20.19+ / 22.12+。

## 初始化

```bash
pnpm create vite@latest my-app --template react-ts
cd my-app && pnpm install
```

## vite.config.ts 建議範本

```ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'node:path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') },
  },
  server: { port: 5173, open: true },
  build: {
    target: 'es2022',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          three: ['three'],
          r3f: ['@react-three/fiber', '@react-three/drei'],
        },
      },
    },
  },
})
```

tsconfig 要同步加 `"paths": { "@/*": ["./src/*"] }`，否則 IDE 不認。

## 環境變數

- 檔名：`.env`, `.env.local`, `.env.production`
- 只有 `VITE_` 前綴會暴露到 client：`import.meta.env.VITE_API_URL`
- 型別補完建一份 `src/env.d.ts`：

```ts
interface ImportMetaEnv {
  readonly VITE_API_URL: string
}
interface ImportMeta { readonly env: ImportMetaEnv }
```

## Path / 資源

- `public/`：不走 build pipeline，用絕對路徑 `/logo.png` 引用
- `src/assets/`：走 build，會 hash 並內聯小檔；用 `import url from './x.png?url'` 取得 URL
- `?raw` 拿檔案純文字、`?worker` 做 Web Worker import

## 常見陷阱

1. **HMR 失效**：元件必須 named export 或 default export function component，別用條件式 export。
2. **CJS-only 套件**：Vite 是 ESM，遇到 CJS 套件加 `optimizeDeps.include: ['pkg']`。
3. **import.meta.env 在測試中 undefined**：Vitest 會自動支援，但若在 Node 腳本用 Vite 設定則需 `loadEnv()`。
4. **build 後路徑 404**：SPA 部署要設 `base: '/sub-path/'`（若非根路徑）並配合 server fallback to `index.html`。
5. **巨大 chunk 警告**：用 `manualChunks` 拆 vendor，或 `build.chunkSizeWarningLimit` 調門檻（治標）。
6. **Node polyfill**：Vite 不自動 polyfill `Buffer`/`process`，需要用 `vite-plugin-node-polyfills`。

## 整合 Vitest

```ts
// vite.config.ts — 加 test 區塊
/// <reference types="vitest" />
export default defineConfig({
  // ...
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
  },
})
```

`setup.ts` 內 `import '@testing-library/jest-dom'`。

## Worker / WASM

```ts
import MyWorker from './solver.worker.ts?worker'
const worker = new MyWorker()
```

適合 cubejs solver 這種耗時初始化，避免阻塞主執行緒。
