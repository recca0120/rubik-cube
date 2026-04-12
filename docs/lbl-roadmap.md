# 真 LBL Solver Roadmap

目標：做出能把任意 scrambled cube 逐階段還原的 Layer-by-Layer solver，讓 StagePipeline 真的依序點亮。

## 當前狀態

| Phase | 狀態 | 備註 |
|---|---|---|
| A Cubies 表示層 | ✅ 完成 | `src/cube/cubies.ts`, 18 tests |
| B 白十字 | ✅ 完成 | BFS with cross-only key, `whiteCross.ts`, 14 tests |
| C 白角 | ⚠️ 部分 | per-corner BFS, 限制 scramble 難度, MAX_DEPTH=12 |
| C' 白角升級 | 待做 | 改 case-based，處理任意 scramble |
| D 中層 | ⚠️ Stub | BFS 爆炸，只處理 already-solved |
| D' 中層 case-based | 待做 | 左右插入公式 |
| E 黃十字 | ⚠️ Stub | probe 找到部分巨集，完整實作待做 |
| F 黃面 | 待做 | sune 反覆法 |
| G PLL | 待做 | A-perm + U/H/Z-perm |
| H 整合 | 待做 | 串起 B-G + UI |

## 關鍵教訓

**BFS 無 pruning table 解不了 F2L 以後的階段**。Phase B 能 work 只因為狀態小（4 edges）。從 Phase C 起必須走 case-based。

case-based 演算法流程：
1. 檢測當前屬於哪個 case（看特定貼紙位置）
2. 如需要，先做 setup turn（U / D 轉到標準方向）
3. 套對應公式
4. 如非 terminal case，遞迴

---

## 各 Phase 實作遇到的問題（給未來自己的筆記）

### Phase A — Cubies 表示層

**順利的部分**：
- 設計 cp/co/ep/eo（Kociemba 慣例）直接，TDD 流暢
- parseCubies + toFacelets 雙向互驗 round-trip 抓 bug 很有效

**踩到的坑**：
1. **U CW 方向我腦袋轉反了**：第一版測試 expect `cp = [1,2,3,0,...]`，實際 impl 回 `[3,0,1,2,...]`。用 R(Y,-90°) 推導才確認 impl 對 test 錯。教訓：寫坐標變換前先用 right-hand rule 畫一下。
2. **Corner orientation 的「principal position」語意不一致**：cornerFacelets 的 index 順序必須跟 CORNER_COLORS 的 CW 順序嚴格一致。第一次寫時把 URF 的 cubie 色寫成 `['U','F','R']`（反向），導致 toFacelets 在 ori≠0 時錯。靠 round-trip test 抓到。

**給未來**：新增 corner / edge 標記時務必同步更新 CORNER_FACELETS、CORNER_COLORS、EDGE_FACELETS、EDGE_COLORS 四份表格，只改其中一份會爛得很隱晦。

### Phase B — 白十字 BFS

**順利**：
- State key 只記 4 個白色邊塊 → 搜尋空間 <200K，BFS 秒殺多數 scramble
- sexy-move ×6 property test 驗證 BFS correctness

**踩到的坑**：
1. **最初嘗試 no-same-face 剪枝時漏了「連續相反面」**（U 後面跟 D 其實可交換，但 U 後 U' 應剪掉；我只剪後者其實兩者都要考慮）。影響效能但不影響正確性。後面沒時間優化。
2. **Random 25-move scramble 有時跑 ~3s**：BFS 沒 heuristic，depth 8 上限下偶有近邊界 case。可加 IDA* 配 pruning table 降到 <100ms。

**給未來**：
- 若 Phase B 要優化，先建 cross 的 pruning table：BFS from solved 逆向展開所有 cross-state，記錄每個 state 到 solved 的最短距離。然後用這個當 IDA* 的 admissible heuristic。
- pruning table 大小：~200K 條目 × 4 bytes = <1MB，build 時間 <5s。

### Phase C — 白角 per-corner BFS

**順利**：
- 「一次解一個角」把 state key 控制在「4 cross edges + i+1 corners」→ 比全狀態 BFS 可行
- 引入 cubieMoves 預計算 move tables，比 parseCubies(apply(m).facelets) 快 ~100x

**踩到的坑**：
1. **第一版全狀態 BFS 完全爆炸**：500MB+ 跑 3 分鐘沒完成。8 pieces 同時追蹤 state 空間 ~26B。
2. **IDA* with heuristic `ceil(max(misplaced)/4)` 還是太弱**：bound 10+ 即指數爆炸。Admissible 但實務無用。
3. **Per-corner BFS 對困難 case 仍慢**：單一角需要 >12 moves 時 MAX_DEPTH=12 抓不到；>8 moves 時已經要 5-10s。
4. **React 19 + Vitest 組合下，BFS 佔 CPU 時 vitest worker 會吃 500MB+**，有時直接 OOM。

**給未來 (Phase C')**：
- 必須 case-based，不能再 BFS
- 每個 target slot 有 insertion alg 的 3 個變體（co=0/1/2）
- 8 corner slots × 3 orientations = 24 starting cases per target × 4 targets = 96 cases，但實際因對稱合併到 ~12 個獨立 case
- **已 probe 結果**（whiteCorners.probe.test.ts）：
  - `R'` → URF cubie @ DFR slot, ori=1（白在 F 側）
  - `F` → URF @ DFR, ori=2（白在 R 側）
  - `R D R' D'` → URF @ 原位 ori=0（等於 no-op 循環）
  - **沒找到 ori=0 的 DFR 設置**（白在 D 的 case）— 需要更長序列或從其他角入手
- **TDD 策略**：每個 case 用「反向構造」測試——從 solved 套 setup 得到已知 case → 套候選插入公式 → 驗證 URF 復位

### Phase D — 中層 BFS 完全失敗

**為什麼比 Phase C 更糟**：
- State key 必須鎖住 4 cross edges + 4 corners + 已放 middle edges = 最多 12 pieces
- 即便 `F D F'`（3 步 scramble）都無法在 60s + 500MB 內解完

**踩到的坑**：
1. 試過降 MAX_DEPTH=10 還是爆
2. 試過只測 `R U R' U'` 發現它其實根本沒動到 middle layer（middle layer 沒事，solver 返回 []，test 假 pass）。**教訓**：要確認 scramble 真的擾動了你想測的東西，否則 test 是假綠
3. 最後只能 stub 只處理 already-solved

**給未來 (Phase D')**：
- 100% case-based，沒有其他路
- Middle edge 4 個目標（FR, FL, BL, BR），每個有左插 / 右插兩個 6-move 公式
- 需要：
  - `findMiddleEdgeInULayer(state, target) → {slot, orientation}` — 在 U 層找目標中層 edge
  - `ejectFromELayer(state, slot)` — 如果在 E 層錯位，套一次插入公式「踢」到 U 層
  - setup U turn 對齊 + 套對應公式

### Phase E — 黃十字 probe 部分結論

**已發現**：
- `B R D R' D' B'` 是 yellow-down 慣例下**唯一** 6-move 保留上兩層的巨集
- solved → L-case（D 邊位置 28, 30 對齊，其他為 side color）
- 經測試，`F R U R' U' F'`（yellow-up 標準 OLL）在我們 convention 下**會破壞上兩層** — 因為它本質是 F-sexy conjugate，只有在 cube 原本就差一點 OLL 時才是 no-op 於 top 2

**沒搞定**：
- line-case 的 solver alg 沒找到（`B R D R' D' B'` 套兩次仍是 L 變體）
- dot-case 要怎麼經由哪些巨集 chain 到 L 或 line
- D-setup turn 的旋轉對稱性沒試完

**給未來 (Phase E 完整版)**：
- 繼續 probe：把 `B R D R' D' B'`（及其逆、D 變體、U 變體）組合嘗試 2-3 個巨集串接，涵蓋所有 case
- 或換個思路：直接用 Kociemba 但限制在 G1 子群的解（phase 1 part only）
- 或 case-based 寫死 4 個 case + 旋轉變體

---

## Phase C' — 白角 case-based 升級

**規格**：保留函式簽章 `solveWhiteCorners(cube): string[]`，覆蓋任意 scramble。

**演算法**（依序處理 4 個白角 URF/UFL/ULB/UBR）：

```
for each target corner T in [URF, UFL, ULB, UBR]:
  locate T on the cube (search 8 corner slots for cp[slot] === T_index)
  
  case 1: already at T_slot with co=0 → skip
  
  case 2: at T_slot but co ≠ 0 → extract to D layer first:
    apply (R U R' U') or mirror — pops corner out to D
  
  case 3: in top layer at wrong slot:
    extract to D (same as case 2)
  
  case 4: in D layer:
    D rotate to position it directly below T_slot
    inspect co:
      co=0 (white on D): apply (R U R' U') × n (usually 3, max 5)
      co=1 (white on F-side): apply U R U' R'
      co=2 (white on R-side): apply F' U F  
    (adjust R/F to match which corner slot — URF uses R,F; UFL uses F,L; etc.)
```

**測試**：
- 單角位置 × 3 朝向 × 4 個角 = 12 case
- 隨機 25-move scramble（預期 <1s 完成）
- 每次套完不破壞 cross

**檔案**：覆寫 `src/cube/solvers/whiteCorners.ts`

---

## Phase D' — 中層 case-based

**規格**：`solveMiddleLayer(cube): string[]`，要求上層 solved（白面）。

**演算法**（依序 FR, FL, BL, BR 四個中層邊）：

```
for each target middle edge E in [FR, FL, BL, BR]:
  locate E on the cube
  
  case 1: already at home with eo=0 → skip
  
  case 2: in middle layer but wrong slot or flipped → eject:
    apply the right-insert alg targeting its current slot (any direction works)
    now it's in U layer
  
  case 3: in U layer:
    U rotate to align: the side-color sticker (non-U color) should face 
    the side matching that color's center
    inspect target direction:
      需向右插（side color sticker on front, target is to the right）:
        U R U' R' U' F' U F
      需向左插（side color on front, target is to the left）:
        U' L' U L U F U' F'
    公式會把這個 edge 送入對應的中層 slot
```

**測試**：
- 12 種 starting case（4 slots × 3 orientations in U layer）
- 中層 edge flipped in place
- 隨機 scramble 後 cross+corners+middle 一條龍 <5s

**檔案**：覆寫 `src/cube/solvers/middleLayer.ts`

---

## Phase E — 黃十字

**規格**：`solveYellowCross(cube): string[]`，要求 top two layers solved。

**已知**（probe 測試）：
- `B R D R' D' B'` 是 yellow-down 慣例下保留上兩層的 6-move 巨集
- solved → 特定 L-case（D 邊 28, 30 對齊）

**要補完**：
1. detector：看 D 面 4 個邊位置 (28, 30, 32, 34) 的貼紙：
   - 全 D → solved
   - 2 個相鄰 D → L-case
   - 2 個對面 D → line-case
   - 0 個 D → dot-case
2. L 的 4 個旋轉：用 D setup turns 對齊到已知的 L 形狀
3. line 的 2 個旋轉：同上
4. line → cross 巨集：未找到，需 probe（可能是 B R D R' D' B' 某種組合）
5. dot → line/L：套 line 或 L 巨集一次

**推薦 probe 流程**：
```
套 B R D R' D' B' 兩次、三次，看 D-edges 變化
找到能產生 dot 的序列 X
X⁻¹ 就是 dot→solved 的 alg（可能很長，需拆解）
```

**測試**：各 case 起始狀態 → 套完 isYellowCrossSolved = true + 上兩層不動。

**檔案**：完整 `src/cube/solvers/yellowCross.ts`

---

## Phase F — 黃面（OLL corners）

**規格**：`solveYellowFace(cube): string[]`，要求 yellow cross solved。

**Beginner 法**（最簡）：
```
while not isYellowFaceSolved:
  count corners with D color facing D
  D-rotate to put them in standard orientation:
    0 oriented: any orientation → apply sune
    1 oriented: place it at back-left position → apply sune  
    2 oriented: 2 cases (diagonal or adjacent), 各自 setup → sune
    3 oriented: can't happen (parity)
  apply sune: R U R' U R U2 R'  (on U side — but we're on D)
  equivalently for yellow-down: probe to find sune equivalent
```

**probe 需要做的**：找到 yellow-down 的 sune 等效公式。推測：
- `R' D R D' R' D2 R`（x2 conjugation of U-side sune）
- 需 probe 驗證

**進階**（可選）：直接辨識 7 種 OLL case（sune, antisune, H, Pi, T, U, L）+ 對應公式，一次套完。

**測試**：7 種 OLL 起始 case → solved 終態。

**檔案**：`src/cube/solvers/yellowFace.ts`（新）

---

## Phase G — PLL（角 + 邊排列）

**規格**：`solvePLL(cube): string[]`，要求 yellow face solved（上兩層 + D 面全黃）。

**A. 角 permutation**
- 看 D 層 4 個角的「側色 pair」：每角有兩個側色貼紙，應該匹配側面中心
- 找一個已在正確位置的角（可能 0 個：需先套公式；1 個：setup 好，直接套）
- A-perm：(x R' U R') D2 (R U' R') D2 R2（yellow-up 版本，需 probe y-down 等效）

**B. 邊 permutation**
- 看 D 層 4 個邊的側色是否匹配
- 0 匹配：H-perm 或 Z-perm
- 1 匹配：U-perm（順或逆）
- 4 匹配：已完成

**Beginner 公式**（yellow-up 版本，需 probe y-down 等效）：
- U-perm (順): R U' R U R U R U' R' U' R2
- U-perm (逆): R2 U R U R' U' R' U' R' U R'
- H-perm: M2 U M2 U2 M2 U M2（M 是中層 slice，我們需拆解為 R L' 組合）
- Z-perm: M2 U M2 U M' U2 M2 U2 M' U2

**注意**：我們沒實作 M/S/E 中層 slice 記號。需用 R/L 組合模擬（如 M = R' L x'，但 x 也是 cube rotation）。可能需要 extend move parser 支援 slice moves。

**測試**：各 PLL case 起始 → isCubeSolved 終態。

**檔案**：`src/cube/solvers/pll.ts`（新）。可能需 `src/cube/Cube.ts` 加 slice moves。

---

## Phase H — 整合 + UI

**整合 API**：
```ts
type LBLSolution = {
  cross: string[]
  whiteCorners: string[]
  middleLayer: string[]
  yellowCross: string[]
  yellowFace: string[]
  pll: string[]  // 或拆成 pllCorners / pllEdges
}

export function lblSolve(cube: Cube): LBLSolution {
  let state = cube
  const cross = solveWhiteCross(state)
  state = applyAll(state, cross)
  const whiteCorners = solveWhiteCorners(state)
  state = applyAll(state, whiteCorners)
  // ... 依序
  return { cross, whiteCorners, middleLayer, yellowCross, yellowFace, pll }
}
```

**UI 調整**：
1. cubeStore 新增 `solveLBL` action（與 `solveCurrent` 並列）
2. Solution 區塊改顯示分段：
   ```
   白十字 (5 步): F R U2 R' D
   白角 (8 步): R U R' U' R U R' U'
   ...
   ```
3. 新「教學模式」按鈕：用 LBL、速度 0.5×、階段間自動暫停（可取消）
4. StagePipeline 隨播放自然點亮各節點（已就位）
5. 某 phase 失敗時：catch + 顯示「此 scramble 需要 case X，暫未支援，fallback 到 Kociemba」

**測試**：
- 20 個隨機 scramble 全部能 solveLBL 成功
- 每個 phase 都非空 moves（非 trivial）
- 最終 isCubeSolved

**檔案**：`src/cube/solvers/lbl.ts`（新），cubeStore + App 調整。

---

## 工作量估計

| Phase | 行數（含 test）| 工時 |
|---|---|---|
| C' 白角 case-based | ~200 | 2-3 h |
| D' 中層 case-based | ~200 | 2-3 h |
| E 黃十字完整 | ~250 | 3-4 h（probe 找公式耗時）|
| F 黃面 sune 法 | ~150 | 2 h |
| G PLL + slice moves | ~400 | 4-6 h（可能需擴 Cube 引擎）|
| H 整合 + UI | ~200 | 2 h |
| **總計** | **~1400** | **15-20 h** |

分成 6-8 個 session，每次專注一個 Phase。

---

## 工作原則（強制）

1. **嚴格 TDD**：紅 → 綠 → refactor，每次只讓一個測試轉綠
2. **每個 Phase 先 probe**：驗證候選公式在我們慣例下有效
3. **case-based 不 BFS**：已證明 BFS 在這些階段撞牆
4. **不跳過已知限制**：遇到沒覆蓋的 case，assert + 清楚 throw message
5. **commit 每個 Phase**：失敗也要 commit（stub + 已發現的 probe 結果）
