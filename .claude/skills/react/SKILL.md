---
name: react
description: React 19 最佳實踐指南。當需要撰寫 React 元件、使用 Hooks、處理狀態管理、或搭配 TypeScript/Vite 開發時使用。
---

# React 19 最佳實踐

> 基於 2025/5 知識。React 19 已 stable，React Compiler 進入推薦使用。

## TypeScript 寫法

```tsx
// 不要用 React.FC（不支援 generics、implicit children）
function Button({ label, onClick }: { label: string; onClick: () => void }) {
  return <button onClick={onClick}>{label}</button>
}

// children 明確宣告
type CardProps = { title: string; children: React.ReactNode }

// 抽 props 用 ComponentProps
type InputProps = React.ComponentProps<'input'> & { label: string }
```

## React 19 新特性重點

### 1. ref 可當 prop（不再需要 forwardRef）

```tsx
function MyInput({ ref, ...props }: { ref?: React.Ref<HTMLInputElement> } & React.ComponentProps<'input'>) {
  return <input ref={ref} {...props} />
}
```

### 2. Actions + useActionState

```tsx
const [state, formAction, isPending] = useActionState(async (prev, formData) => {
  const res = await submit(formData)
  return res.error ?? null
}, null)

<form action={formAction}>...</form>
```

### 3. useOptimistic

立刻顯示樂觀更新，等 server 回來時 reconcile。

### 4. use() Hook

可在 render 中 unwrap Promise 或 Context（Suspense 邊界接）：
```tsx
const data = use(fetchPromise) // 搭配 <Suspense>
const theme = use(ThemeContext)
```

### 5. `<Context>` 直接當 Provider

```tsx
<ThemeContext value={theme}> {/* 不必 .Provider */}
```

### 6. Document Metadata

可以直接在元件內寫 `<title>`, `<meta>`, `<link>`，React 會 hoist 到 head。

## Hooks 守則

### useEffect 反模式
- ❌ 用 effect 同步兩個 state → 直接計算 derived value
- ❌ 用 effect 處理 user event → 寫在 event handler
- ❌ 用 effect fetch → 用 Suspense + use() 或 TanStack Query
- ✅ 真正需要：訂閱外部系統、DOM measure、整合非 React 函式庫

### useMemo / useCallback
不要預防性加。React Compiler 啟用後幾乎都不需要。手動加只在：
- 昂貴計算（實測 >1ms）
- 傳給 memo 化子元件的 prop/callback
- 當依賴陣列用

### StrictMode 雙重執行
開發模式下 effect/state initializer 會跑兩次，是為了暴露不純副作用。cleanup 要寫對才不會 leak。

## React Compiler（推薦啟用）

```bash
pnpm add -D babel-plugin-react-compiler
```

`vite.config.ts`：
```ts
react({ babel: { plugins: ['babel-plugin-react-compiler'] } })
```

啟用後可刪掉大部分 memo/useMemo/useCallback。

## 常見陷阱

1. **list key 用 index**：reorder/insert 會壞，用穩定 ID。
2. **state 放物件忘記 immutable update**：`setX({ ...x, a: 1 })` 不是 `x.a = 1`。
3. **async 在 effect**：effect 函式本身不能 async，內層宣告 `async function` 再呼叫。
4. **Context 每次 render 新物件**：value 用 useMemo 或拆多個 Context。
5. **Portal 不走事件冒泡的 DOM 樹**：但走 React tree（所以 Context 可透）。
