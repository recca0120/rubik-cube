---
name: msw-fetch-mock
description: msw-fetch-mock 套件使用指南（搭配 MSW v2 + Vitest）。當需要 mock HTTP 請求、測試 fetch 呼叫、驗證 API 互動時使用。
---

# msw-fetch-mock + MSW v2 最佳實踐

> `msw-fetch-mock` 是 `jest-fetch-mock` 風格 API 的 MSW 相容層，讓習慣 `fetchMock.mockResponseOnce` 的人也能享受 MSW 的 service-worker 攔截能力。若無舊測試包袱，建議直接用原生 MSW v2 `http` handlers。

## 安裝

```bash
pnpm add -D msw msw-fetch-mock
```

MSW v2 需 Node 18+、TypeScript 5.0+。

## 基本設定（Vitest + jsdom）

`src/test/mocks/server.ts`：
```ts
import { setupServer } from 'msw/node'
import { http, HttpResponse } from 'msw'

export const handlers = [
  http.get('/api/user', () => HttpResponse.json({ id: 1, name: 'Alice' })),
]

export const server = setupServer(...handlers)
```

`src/test/setup.ts`：
```ts
import { beforeAll, afterEach, afterAll } from 'vitest'
import { server } from './mocks/server'

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))
afterEach(() => server.resetHandlers())
afterAll(() => server.close())
```

## MSW v2 核心語法（vs v1）

| v1 | v2 |
|---|---|
| `rest.get(url, (req, res, ctx) => res(ctx.json(data)))` | `http.get(url, () => HttpResponse.json(data))` |
| `ctx.status(500)` | `new HttpResponse(null, { status: 500 })` |
| `req.body` | `await request.json()` / `await request.text()` |

```ts
http.post('/api/solve', async ({ request }) => {
  const { facelets } = await request.json() as { facelets: string }
  if (facelets.length !== 54) {
    return HttpResponse.json({ error: 'invalid' }, { status: 400 })
  }
  return HttpResponse.json({ solution: "R U R' U'" })
})
```

## msw-fetch-mock 相容層

```ts
import fetchMock from 'msw-fetch-mock'

beforeEach(() => fetchMock.resetMocks())

it('handles user fetch', async () => {
  fetchMock.mockResponseOnce(JSON.stringify({ id: 1 }))
  const res = await fetch('/api/user').then(r => r.json())
  expect(res).toEqual({ id: 1 })
})

// 動態回應
fetchMock.mockResponse(async (req) => {
  if (req.url.includes('/error')) return { status: 500, body: 'fail' }
  return JSON.stringify({ ok: true })
})
```

## 測試內覆蓋單一 handler

```ts
import { server } from '@/test/mocks/server'
import { http, HttpResponse } from 'msw'

it('shows error on 500', async () => {
  server.use(
    http.get('/api/user', () => new HttpResponse(null, { status: 500 })),
  )
  // ... 測試錯誤行為
})
// afterEach 會 resetHandlers 還原
```

## 驗證 request

MSW 本身不像 jest-fetch-mock 直接給 call history，需自己 spy：

```ts
const requestSpy = vi.fn()
server.use(
  http.post('/api/solve', async ({ request }) => {
    requestSpy(await request.json())
    return HttpResponse.json({ solution: 'R' })
  }),
)

// ... 執行動作
expect(requestSpy).toHaveBeenCalledWith({ facelets: 'UUU...' })
```

## 瀏覽器（開發用 mock）

```ts
// src/mocks/browser.ts
import { setupWorker } from 'msw/browser'
import { handlers } from './handlers'
export const worker = setupWorker(...handlers)
```

```ts
// main.tsx
if (import.meta.env.DEV) {
  const { worker } = await import('./mocks/browser')
  await worker.start()
}
```

首次要 `npx msw init public/ --save` 產生 service worker 檔。

## 常見陷阱

1. **onUnhandledRequest 預設 warn**：設 `'error'` 讓漏掉的 request 測試失敗。
2. **resetHandlers 沒做**：測試之間 handler 累積污染。
3. **MSW v2 需要 `undici` 或 Node 18+**：舊 Node 會出怪錯。
4. **相對 URL**：node 環境 fetch 需絕對 URL 或 base URL，建議測試用絕對 URL。
5. **async handler 沒 await request body**：`request.json()` 是 async。
6. **HttpResponse.json vs new Response**：有型別差異，優先用 `HttpResponse.json()`。
7. **service worker 在 test 沒用**：test 用 `setupServer`（Node），不用 `setupWorker`（browser）。

## 本專案用法

魔術方塊網站大部分運算 client 側，API 可能只有：
- 上傳照片做顏色辨識（若用雲端）
- 儲存進度

對這些 endpoint 用 MSW mock，讓教學流程/上傳流程的 integration test 不靠真 server。
