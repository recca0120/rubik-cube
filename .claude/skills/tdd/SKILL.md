---
name: tdd
description: TDD (Test-Driven Development) 最佳實踐指南，搭配 Vitest + React Testing Library。當需要撰寫測試、實踐 Red-Green-Refactor、設計測試結構時使用。應在開發新功能時主動套用。
---

# TDD 最佳實踐（Vitest + RTL）

## Red-Green-Refactor

1. **Red**：先寫一個失敗的測試（描述想要的行為）
2. **Green**：用最小修改讓測試過（允許醜陋）
3. **Refactor**：保持綠燈重構

**鐵律**：
- 每次只讓一個測試紅 → 綠
- 不寫沒對應測試的生產代碼
- 不重構沒綠燈的代碼
- 小步前進：每 2-5 分鐘一次紅綠循環

## 安裝

```bash
pnpm add -D vitest @vitest/ui jsdom \
  @testing-library/react @testing-library/user-event \
  @testing-library/jest-dom
```

## vite.config.ts

```ts
/// <reference types="vitest" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    coverage: { reporter: ['text', 'html'] },
  },
})
```

`src/test/setup.ts`：
```ts
import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach } from 'vitest'
afterEach(() => cleanup())
```

## 檔案命名

- `foo.ts` → `foo.test.ts` 同資料夾
- 或 `__tests__/foo.test.ts`
- 選一種專案內一致

## 測試結構（AAA）

```ts
import { describe, it, expect, beforeEach, vi } from 'vitest'

describe('Cube', () => {
  let cube: Cube
  beforeEach(() => { cube = new Cube() })

  it('rotates U face clockwise', () => {
    // Arrange
    cube.apply('U')
    // Act
    const top = cube.getFace('U')
    // Assert
    expect(top).toEqual(Array(9).fill('U'))
  })
})
```

## React Testing Library

```tsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

it('increments on click', async () => {
  const user = userEvent.setup()
  render(<Counter />)
  await user.click(screen.getByRole('button', { name: /add/i }))
  expect(screen.getByText('1')).toBeInTheDocument()
})
```

**Query 優先順序**：`getByRole` > `getByLabelText` > `getByPlaceholderText` > `getByText` > `getByTestId`（最後手段）。

## 測試金字塔

```
        E2E (Playwright)      ← 少量、關鍵流程
      Integration (RTL)       ← 元件 + store
  Unit (Vitest pure functions) ← 大量、邏輯
```

**本專案分層建議**：
- **純邏輯**（cube state、solver wrapper、color classify）→ 大量 unit test
- **React 元件**（Input 表單、教學面板）→ RTL integration test
- **3D 元件**（R3F scene）→ 不測渲染，測背後的 state/邏輯

## 該測什麼

✅ **測行為**：給定輸入 → 期待輸出/副作用
✅ 邊界條件、錯誤處理、public API
❌ **不測實作細節**：私有函式、內部 state 欄位
❌ 不測第三方套件本身
❌ 不測 trivial getter/setter

## Mock 策略

見 `test-doubles` skill。原則：**能不 mock 就不 mock**，優先 Fake > Stub > Mock。

## 魔術方塊範例（TDD walkthrough）

```ts
// 1. Red
it('U move rotates top face clockwise', () => {
  const cube = new Cube()
  cube.apply('U')
  expect(cube.facelets.slice(0, 9)).toBe('UUUUUUUUU')
  expect(cube.facelets.slice(9, 12)).toBe('FFF')  // R top row = F
})

// 2. Green (最小實作)
class Cube {
  facelets = 'UUUUUUUUU RRR... '
  apply(move: string) {
    if (move === 'U') { /* 實作 U */ }
  }
}

// 3. Refactor：抽 rotateFace 工具、查表驅動 6 面
```

## 檢查清單

- [ ] 每次改代碼前先看看有沒有測試覆蓋
- [ ] 一個測試只驗一件事
- [ ] 測試名稱講「做什麼」不是「怎麼做」
- [ ] `pnpm test` 全綠才 commit
- [ ] coverage 看趨勢不看絕對值
