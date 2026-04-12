# Ch 10: F2L 直覺版 + 案例瀏覽器（LBL → CFOP 的橋樑）

## 教學目標

讓已完成 Ch 1–9 的小孩理解 **pair-and-insert** 思維 — 不是背 41 組公式，是**邏輯推理**：
- 找到「白角 + 對應邊塊」這一對
- 把它們擺到可以同時插入的位置
- 用簡單 3–8 步插進 slot

## 架構：章節 + 案例瀏覽器並行

```
Ch 10 (Wizard, 4-6 步)        F2L Case Browser (新介面)
  ├ Intro F2L 概念            ├ 41 個 case 卡片網格
  ├ 示範一個完美 pair              ├ 點任一 case → cube 進入該狀態
  ├ 「想看更多案例？去案例庫！」  ├ Mini player step-by-step 播 demo
  └ 恭喜 ⭐                     └ 隨意切換 case
      ↓
  解鎖 Case Browser
```

## 實作方式

**重用 Expert `CasesTab`**：加一個「🎓 教學模式」toggle，點 case 時：
- 關（現況）：快速 apply + 自動播完
- 開（新）：設 cube 到 case 狀態 + paused + stepByStep + 出現 Mini Player

這樣 Ch 10 完 → 引導去 Expert CasesTab → 打開教學模式 → 練 41 個 case。

## F2L 41 Cases 完整列表（CFOP 標準分類）

### Group A: 角 + 邊 都在 U 層（24 cases）

#### A1. Connected Pair, White on Top (3)
| # | 名稱 | Alg 例 |
|---|---|---|
| 1 | Basic 前 | `(R U' R') (U R U' R')` |
| 2 | Basic 後 | `(R U2 R') (U R U' R')` |
| 3 | Basic 右 | `U' (R U R') U (R U' R')` |

#### A2. Connected Pair, White on Side (3)
| # | 名稱 | Alg 例 |
|---|---|---|
| 4 | Easy 白朝右 | `(U R U' R')` |
| 5 | Easy 白朝前 | `(U' F' U F)` |
| 6 | Easy 白朝後 | `d (R' U R) d'` |

#### A3. Split Pair, Corner White on Top (6)
| # | 名稱 | Alg 例 |
|---|---|---|
| 7 | Split 前右 | `(U R U2 R') (U R U' R')` |
| 8 | Split 後右 | `(U' R U R') (U R U' R')` |
| 9 | Split 左前 | `(U F' U2 F) (U' F' U F)` |
| 10 | Split 右後 | `(U R U' R') (U2 R U' R')` |
| 11 | Split 前對 | `(U2 R U' R') (U' R U R')` |
| 12 | Split 後對 | `(U2 R U R') U (R U' R')` |

#### A4. Split Pair, Corner White on Side (6)
| # | 名稱 | Alg 例 |
|---|---|---|
| 13 | Split 角白右 | `(R U' R') (U2) (R U R')` |
| 14 | Split 角白前 | `(F' U F) (U2) (F' U' F)` |
| 15 | Split 角白左 | `(U' R U R') (U R U' R')` |
| 16 | Split 角白後 | `(R U R') (U' R U R')` |
| 17 | Split 對稱 1 | `(U F' U' F) (U' R U R')` |
| 18 | Split 對稱 2 | `(U' R U' R') (U F' U' F)` |

#### A5. Edge Inverted（邊塊方向反）(6)
| # | 名稱 | Alg 例 |
|---|---|---|
| 19 | Inverted 基本 | `(R U' R' U) (d R' U' R)` |
| 20 | Inverted 白上 1 | `(F' U F U') (d' F U F')` |
| 21 | Inverted 白上 2 | `(R U R' U') (R U R' U') (R U R')` |
| 22 | Inverted 側 1 | `(R' U' R U) (d R' U R)` |
| 23 | Inverted 側 2 | `(R U' R' U2) (F' U' F)` |
| 24 | Inverted 側 3 | `(F' U F U2) (R U R')` |

### Group B: 角在 U 層、邊在 E 層（6 cases）

| # | 名稱 | 狀態 | Alg 例 |
|---|---|---|---|
| 25 | Edge-in-slot 1 | 邊在 FR slot，角 U | `(R U R' U') (R U R')` |
| 26 | Edge-in-slot 2 | 邊反向 | `(R U' R' U) (R U' R')` |
| 27 | Edge-in-slot 3 | 對稱 | `(R U2 R' U) (R U' R')` |
| 28 | Edge-in-slot 4 | 對稱反 | `(R U2 R') (U' R U R')` |
| 29 | Edge-in-slot 5 | 邊對角 | `(R U' R' U') (R U R' U') (R U R')` |
| 30 | Edge-in-slot 6 | 邊對角反 | `(R U R') (U2) (R U' R')` |

### Group C: 邊在 U 層、角在 D 層（6 cases）

| # | 名稱 | 狀態 | Alg 例 |
|---|---|---|---|
| 31 | Corner-in-slot 1 | 角白朝 D，邊 U | `(R U' R' U2) (R U' R')` |
| 32 | Corner-in-slot 2 | 角白朝側 1 | `(R U R' U') (R U2 R' U') (R U R')` |
| 33 | Corner-in-slot 3 | 角白朝側 2 | `(R U' R' U R U R' U') (R U R')` |
| 34 | Corner-in-slot 4 | 對稱 | `(F' U F U') (F' U F)` |
| 35 | Corner-in-slot 5 | 複雜 1 | `(R U R' U2) (R U2 R' U) (R U' R')` |
| 36 | Corner-in-slot 6 | 複雜 2 | `(R U' R' U) (R U R') (U2 R U' R')` |

### Group D: 兩塊都在 slot 裡亂位（5 cases）

| # | 名稱 | Alg 例 |
|---|---|---|
| 37 | Both-in-slot 角對邊錯 | `(R U' R' U)² (R U' R')` |
| 38 | Both-in-slot 邊對角錯 | `(R U R') U' (R U R' U') (R U R')` |
| 39 | Both-in-slot 全亂 1 | `(R U' R' U') (R U R' U)² (R U' R')` |
| 40 | Both-in-slot 全亂 2 | `(R U' R' U) (R U2 R') (U R U' R')` |
| 41 | Both-in-slot 旋轉 180° | `(R U' R')² (R U R')` |

> **註**：以上 algs 是代表例，速解圈有多種流派（J Perm / BadMephisto / Feliks / AlgDB）。實際補 `f2l.ts` 時會採 **J Perm 標準**（最主流、最短）。

## 實作範圍

### MVP (此次 TDD)
1. Ch 10 短 intro（4-6 步）
2. `CasesTab` 加「🎓 教學模式」toggle
3. 教學模式點 case → preScramble + paused + stepByStep + 彈 MiniPlayer
4. `f2l.ts` 補齊 41 個 case（分 2-3 批，驗證後 commit）
5. Ch 10 完 → 首頁顯示「→ F2L 案例庫 (41)」入口
6. `wizardInvariants` / `f2l.correctness` 測試：每個 case 的 alg 從 preScramble 套用後能回到 solved

### 之後（擴增）
- 2-look OLL 章節 + 案例庫（類似架構，10 個 case）
- 2-look PLL 章節 + 案例庫（6 個 case）
- Full OLL (57) + Full PLL (21)

## 完成標準

- Ch 10 可解鎖並執行
- `CasesTab` 教學模式能對任一 F2L case 播 step-by-step
- `f2l.ts` 有 41 個 case（即使先只驗證 10-15 個，其餘分批）
- F2L correctness regression test：每個 case `new Cube().applyAlg(invertAlg(alg)).applyAlg(alg).isSolved()` 為 true
