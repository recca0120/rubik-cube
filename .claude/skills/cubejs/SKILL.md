---
name: cubejs
description: cubejs (Rubik's Cube solver, Kociemba two-phase) 使用指南。當需要實作魔術方塊自動解法、狀態字串序列化、或 scramble 產生時使用。
---

# cubejs 魔術方塊 Solver

> 注意：npm 有兩個同名套件！**魔術方塊 solver 是 `cubejs`（lgarron/cubejs）**，另一個 `@cubejs-client/*` 是 Cube.dev BI 工具，完全不同。

## 套件選擇

| 套件 | 演算法 | 解長度 | 初始化 | 備註 |
|---|---|---|---|---|
| **cubejs** | Kociemba 2-phase | ~20 | ~2-5s load tables | 老但穩定、檔案小 |
| **min2phase** | Kociemba 優化 | ~20 | 類似 | 更快解，TypeScript 較差 |
| **cubing.js** | 多演算法 | 依需求 | 較重 | 完整 cube 生態，推薦 |
| **rubiks-cube-solver** | Layer-by-layer | 100+ | 即時 | 適合教學步驟（長但易理解） |

**本專案建議**：
- **自動解（最短解）**：`cubejs` 或 `cubing.js`
- **教學模式（Layer-by-Layer 步驟）**：自己實作 LBL，不用 solver（教學需要固定步驟邏輯）

## 安裝

```bash
pnpm add cubejs
```

無 types，加一份 `src/types/cubejs.d.ts`：

```ts
declare module 'cubejs' {
  export default class Cube {
    static fromString(s: string): Cube
    static random(): Cube
    static scramble(): string
    static initSolver(): void
    static asyncInitSolver?(): Promise<void>
    asString(): string
    solve(maxDepth?: number): string
    move(alg: string): Cube
    isSolved(): boolean
    clone(): Cube
  }
}
```

## 狀態字串格式

54 字元，URFDLB 面順序，每面 9 格 row-major（從左上到右下）：

```
UUUUUUUUU RRRRRRRRR FFFFFFFFF DDDDDDDDD LLLLLLLLL BBBBBBBBB
(共 54 字元，無空格)
```

面字母也代表顏色（U=白, R=紅, F=綠, D=黃, L=橘, B=藍 — 依標準配色）。

## 基本用法

```ts
import Cube from 'cubejs'

// 1. 初始化 solver tables（耗時，只需一次）
Cube.initSolver()  // 或 await Cube.asyncInitSolver()

// 2. 建 cube
const cube = Cube.fromString('UUUUUUUUURRR...')  // 54 char
// 或 const cube = new Cube()  // 已還原
// 或 const cube = Cube.random()  // 隨機打亂

// 3. 解
const solution = cube.solve()  // e.g. "R U R' U' F2 L"

// 4. Scramble
const scrambleAlg = Cube.scramble()  // 25 moves 字串
```

## Worker 初始化（必做）

solver table 載入 2-5 秒會阻塞 UI，一定要放 Web Worker：

```ts
// src/workers/solver.worker.ts
import Cube from 'cubejs'
Cube.initSolver()
self.onmessage = (e: MessageEvent<string>) => {
  const cube = Cube.fromString(e.data)
  self.postMessage(cube.solve())
}
```

```ts
// 使用端
import SolverWorker from './workers/solver.worker.ts?worker'
const worker = new SolverWorker()
worker.postMessage(facelets)
worker.onmessage = (e) => setSolution(e.data)
```

## 與 3D 狀態互轉

把 3D cube 的 54 貼紙按 URFDLB 順序組字串；若顏色不是預設，做一層 color → face 字母的 map（中心塊決定哪個顏色代表哪面）。

```ts
function faceletsFromColors(colors: Color[]): string {
  const centers = [colors[4], colors[13], colors[22], colors[31], colors[40], colors[49]]
  const face = ['U','R','F','D','L','B']
  const map = new Map(centers.map((c, i) => [c, face[i]]))
  return colors.map((c) => map.get(c)!).join('')
}
```

## 常見陷阱

1. **忘記 initSolver**：`solve()` 會丟 "solver not initialized"。
2. **非法狀態**：貼紙數量錯、對應不合法會拋錯，呼叫前先驗證。
3. **狀態字串大小寫**：必須大寫 URFDLB。
4. **solve() 在主執行緒**：單次解也要 100ms~1s，建議 worker。
5. **scramble vs random**：`Cube.scramble()` 回傳 moves 字串，`Cube.random()` 回傳 Cube 物件。
6. **TypeScript types 沒有**：自己寫 .d.ts（見上）。

## 驗證合法狀態

cubejs 的 `fromString` 不會完整驗證（corner/edge parity 等）。可先用自己的驗證：
- 每色恰 9 個貼紙
- 12 edges、8 corners 的組合存在
- corner twist sum ≡ 0 (mod 3)、edge flip sum ≡ 0 (mod 2)、permutation parity 一致
