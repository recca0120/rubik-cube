---
name: zustand
description: Zustand 5 最佳實踐指南。當需要建立 store、設計 selector、使用 middleware (persist/immer/devtools)、或處理 React 狀態管理時使用。
---

# Zustand 最佳實踐

> 基於 2025/5 知識。基準版本：zustand ^5。v5 後 `create` 必須用 curry 形式才能得到 TypeScript 正確推論。

## 基本 store

```ts
import { create } from 'zustand'

type CubeState = {
  facelets: string
  history: string[]
  applyMove: (move: string) => void
  reset: () => void
}

export const useCubeStore = create<CubeState>()((set, get) => ({
  facelets: 'UUUUUUUUU...',
  history: [],
  applyMove: (move) => set((s) => ({
    facelets: applyToFacelets(s.facelets, move),
    history: [...s.history, move],
  })),
  reset: () => set({ facelets: 'UUUU...', history: [] }),
}))
```

注意 `create<T>()(...)` 的雙括號——curried 形式。

## Selector 最佳化

```tsx
// ❌ 整個 state 都訂閱，任何變動都 re-render
const store = useCubeStore()

// ✅ 只訂閱需要的
const facelets = useCubeStore((s) => s.facelets)

// ✅ 多個值用 useShallow（避免物件每次新建觸發 re-render）
import { useShallow } from 'zustand/react/shallow'
const { facelets, history } = useCubeStore(useShallow((s) => ({
  facelets: s.facelets, history: s.history,
})))
```

**規則**：selector 絕對不要回傳新物件/陣列而沒用 shallow。

## Middleware

```ts
import { persist, devtools, subscribeWithSelector } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'

export const useStore = create<State>()(
  devtools(
    persist(
      immer((set) => ({
        items: [],
        add: (x) => set((s) => { s.items.push(x) }), // immer 可 mutate
      })),
      { name: 'cube-storage', partialize: (s) => ({ items: s.items }) },
    ),
  ),
)
```

- `persist`：自動存 localStorage；用 `partialize` 篩選要存的欄位
- `devtools`：Redux DevTools 整合
- `immer`：允許 mutate 寫法（方塊 state 很適合）
- `subscribeWithSelector`：`store.subscribe((s) => s.x, callback)` 選擇性訂閱

## React 外部存取

```ts
useCubeStore.getState().facelets  // 讀
useCubeStore.setState({ facelets: '...' })  // 寫
useCubeStore.subscribe((s) => console.log(s.facelets))  // 訂閱
```

適合在非 React 環境（worker、event handler 外部模組）使用。

## Slice pattern（大 store 拆分）

```ts
type CubeSlice = { facelets: string; applyMove: (m: string) => void }
type UISlice = { panel: 'learn' | 'scan'; setPanel: (p: ...) => void }

const createCubeSlice: StateCreator<CubeSlice & UISlice, [], [], CubeSlice> = (set) => ({
  facelets: '...',
  applyMove: (m) => set((s) => ({ /* ... */ })),
})

export const useStore = create<CubeSlice & UISlice>()((...a) => ({
  ...createCubeSlice(...a),
  ...createUISlice(...a),
}))
```

## 常見陷阱

1. **selector 回傳新物件**：`(s) => ({ a: s.a })` 每次新物件 → 用 `useShallow`。
2. **action 依賴舊 state**：用 `set((s) => ...)` 函式形式，別 `set({ x: get().x + 1 })`。
3. **persist rehydrate 時機**：SSR 或 hydration mismatch 時要用 `onRehydrateStorage` 或 `useStore.persist.hasHydrated()` 檢查。
4. **TypeScript 沒推論**：漏了 `create<T>()` 的 `()`。
5. **immer 內回傳新物件**：用了 immer 就不要 return，只 mutate。
6. **測試之間 state 污染**：`beforeEach` 裡 `useStore.setState(initialState, true)` 全量覆寫。

## 與 React 19 / Compiler

React Compiler 會 memo 元件，但 Zustand 的 selector 訂閱機制照樣工作。不需要特別處理。
