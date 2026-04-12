---
name: test-doubles
description: Test Doubles 最佳實踐指南（Vitest + TypeScript）。當需要選擇 Mock/Stub/Fake/Spy/Dummy、或討論測試隔離策略時使用。
---

# Test Doubles 最佳實踐

## 五種類型

| 類型 | 目的 | 有行為? | 會驗證? |
|---|---|---|---|
| **Dummy** | 佔位，不會被用 | ❌ | ❌ |
| **Stub** | 回傳固定值 | ✅ 固定 | ❌ |
| **Fake** | 簡化但可運作 | ✅ 真實 | ❌ |
| **Spy** | 記錄呼叫 | ✅ 原行為 | ✅ 事後 |
| **Mock** | 預設行為 + 事先預期 | ✅ | ✅ 事先 |

## 優先順序（從好到壞）

**Fake > Stub > Spy > Mock > Dummy**

原因：
- **Fake** 最接近真實，測試最能反映真行為（如 in-memory DB）
- **Stub** 簡單隔離慢/外部依賴
- **Spy** 不改行為只觀察，破壞性低
- **Mock** 過度 mock 會導致測試通過但真實壞掉
- **Dummy** 不得已的佔位

## Vitest 實作

### Spy（記錄原物件方法呼叫）

```ts
const spy = vi.spyOn(console, 'log')
myFunction()
expect(spy).toHaveBeenCalledWith('hello')
spy.mockRestore()
```

### Mock/Stub（vi.fn）

```ts
const onSave = vi.fn()                           // Spy/Mock
const fetchUser = vi.fn().mockResolvedValue({ id: 1 })  // Stub

expect(onSave).toHaveBeenCalledTimes(1)
expect(onSave).toHaveBeenCalledWith({ name: 'x' })
```

### 模組替換（vi.mock）

```ts
vi.mock('./api', () => ({
  fetchUser: vi.fn().mockResolvedValue({ id: 1, name: 'Alice' }),
}))

import { fetchUser } from './api'
// fetchUser 是 mock
```

### vi.hoisted（解決 hoisting）

`vi.mock` 被提升到檔頂，所以不能直接引用外部變數。要共享 mock instance：

```ts
const { mockFetch } = vi.hoisted(() => ({ mockFetch: vi.fn() }))
vi.mock('./api', () => ({ fetchUser: mockFetch }))

beforeEach(() => mockFetch.mockReset())
```

### Fake（簡化實作）

```ts
class FakeCubeStorage implements CubeStorage {
  private data = new Map<string, string>()
  save(id: string, state: string) { this.data.set(id, state) }
  load(id: string) { return this.data.get(id) ?? null }
}

// 測試中注入
const store = new CubeService(new FakeCubeStorage())
```

**Fake 優於 Mock 的時機**：被依賴的介面多次呼叫、行為有狀態累積（DB、cache、queue）。

## 清理策略

```ts
import { afterEach, vi } from 'vitest'
afterEach(() => {
  vi.clearAllMocks()   // 清 call history，保留 implementation
  // 或 vi.resetAllMocks()  // 連 implementation 也清掉
  // 或 vi.restoreAllMocks() // 復原 spyOn 的原始實作
})
```

或 `vite.config.ts` 設 `test.clearMocks: true` 自動做。

## TypeScript 技巧

```ts
// 取得 mocked 函式型別
import { fetchUser } from './api'
const mockedFetch = vi.mocked(fetchUser)
mockedFetch.mockResolvedValue({ id: 1 })

// 部分 mock
vi.mock('./api', async (importOriginal) => {
  const actual = await importOriginal<typeof import('./api')>()
  return { ...actual, fetchUser: vi.fn() }
})
```

## 常見陷阱

1. **Mock 實作細節**：`expect(mock).toHaveBeenCalled()` 卻沒看結果 → 測試耦合實作。應測最終行為。
2. **過度 mock**：mock 掉半個系統 → 測試綠燈，整合壞掉。Fake 或 real 優先。
3. **Mock leak**：測試之間 state 殘留 → 一律 `afterEach` 清。
4. **mock 時機錯**：`vi.mock` 提升到檔頂，`vi.doMock` 則不提升（動態 mock）。
5. **Spy 沒 restore**：後續測試 console/method 被污染。`mockRestore()` 或 `restoreMocks: true`。
6. **Mock Date/Timer**：`vi.useFakeTimers()` / `vi.setSystemTime()`，記得 `vi.useRealTimers()` 還原。

## 決策流程

```
需要隔離嗎？
├─ 不需要 → 直接用真實依賴
└─ 需要（慢、外部、不確定性）
   ├─ 有狀態、呼叫多 → Fake
   ├─ 單次回固定值 → Stub (vi.fn().mockReturnValue)
   ├─ 驗證被呼叫 → Spy (vi.spyOn)
   └─ 複雜預期互動 → Mock（最後選擇）
```
