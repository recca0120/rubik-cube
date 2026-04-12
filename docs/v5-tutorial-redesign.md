# Tutorial Redesign v5 — 小孩真能跟著轉的版本

## 痛點診斷

1. **視角飄移**：TrackballControls 讓小孩把 cube 亂轉 → `R` 變成螢幕上的左邊，notation 失效
2. **Notation 硬核**：`R U R' U'` 對 8-12 歲是天書
3. **Demo 一閃而過**：8–11 步公式一口氣跑完，小孩跟不上
4. **無法回放**：看不懂沒辦法倒回前一步
5. **長 practice 折磨**：要小孩手動打 11 步 U-perm

## 設計決策

### A. 鎖定 Wizard 視角
- `TrackballControls` 從 Wizard 移除（Sandbox/Expert 保留）
- 方向鍵 + `0` 在 Wizard 內停用
- cube 永遠白上、綠前、紅右的標準角度
- Ch 1 Step 6「拖動看看」改成自動 360° spin 展示

### B. 友善 notation 雙軌
- `friendlyMove(m)` 把 `R'` 翻成 `右 ↺`
- `MoveKeypad` 按鈕下方加小字翻譯
- 對話訊息：中文描述為主，`(R U R' U')` 為括號輔助
- `MoveLabel` 3D 字母保留純 notation（視覺簡潔）

### C. Step-by-step 預設
- Wizard demo 預設每個 move 跑完自動 pause
- Cubie 對話跟著當前 move 更新：「第 3 步: U'」
- 每個長公式加 `stepNarrations: { 0: "先上一下讓位", 3: "再抓邊塊", ... }`
- Wizard footer 加 mini player：`⏮ 上一步 / ▶ 自動播放 / ⏭ 下一步`
- 可按 `▶ 自動播放` 跳過 step-by-step 一次跑完
- 按「🔄 從頭再看」重置到 preScramble 狀態

### D. Practice 負擔減量
- 短公式（≤7 步）保留 practice
- 長公式（≥8 步）只 demo，刪 practice

| 章節 | 公式長度 | Demo | Practice |
|---|---|---|---|
| Ch2 U/D/L/R/F/B | 1 步 | ✓ | ✓ |
| Ch2 R'/R2 | 1 步 | ✓ | ✓ |
| Ch4 Sexy | 4 步 | ✓ | ✓ |
| Ch5 右插 | 8 步 | ✓ | ✗ 刪 |
| Ch5 左插 | 8 步 | ✓ | ✗ 刪 |
| Ch6 黃十字 | 6 步 | ✓ | ✓ |
| Ch7 Sune | 7 步 | ✓ | ✓ |
| Ch8 A-perm | 9 步 | ✓ | ✗ 刪 |
| Ch8 U-perm | 11 步 | ✓ | ✗ 刪 |

## 執行計畫（9 slice，嚴格 TDD）

### Slice 1: `friendlyMove(m)` 純函式
- 新檔 `src/components/kids/friendlyMove.ts` + test
- 輸出：`R` → `右 ↻`、`R'` → `右 ↺`、`R2` → `右 180°`

### Slice 2: `MoveKeypad` 按鈕加小字翻譯
- 每個 U/D/L/R/F/B 鈕下方顯示 friendlyMove 翻譯

### Slice 3: `WizardStep.stepNarrations?: Record<number, string>` schema
- move index → 補充敘事文字
- Wizard demo 執行到該 index 時 Cubie 對話切換

### Slice 4: Wizard demo 預設 step-by-step
- 進入 demo step 時把 `paused: true` + `stepTokens: 0`
- 每按「下一步」消耗 1 token 播一 move → 再 pause
- Cubie 訊息同步：「第 N 步：{friendlyMove}」

### Slice 5: Wizard footer mini player
- `⏮ 上一步` / `▶ 自動播放` / `⏭ 下一步` / `🔄 從頭` 四鈕
- 顯示當前進度 `3 / 8`

### Slice 6: Ch 5/7/8 長公式加 stepNarrations
- 右插、左插、Sune、A-perm、U-perm 逐步解說

### Slice 7: Ch 2-8 訊息改中文描述 + notation 括號
- `'示範 A perm:'` → `'示範 A perm (角塊換位)：'`
- 每個 demo message 用口語描述

### Slice 8: 刪除長公式 practice step
- Ch 5 右插/左插 practice → 刪
- Ch 8 A-perm/U-perm practice → 刪

### Slice 9: 鎖 Wizard 視角
- `WizardCubeStage` 移除 `TrackballControls`
- `CubeKeyboardControls` 加 `disableView?: boolean` prop，Wizard 傳 true
- Ch 1 Step 6 改成 `autoSpin: true`（新欄位，step 進入自動旋轉一圈）

## 不動的部分

- Ch 3 白十字（目前沒固定公式，保持直覺）
- Ch 9 終極 showcase（已 preScramble 實作）
- 所有 preScramble 設定
- Sandbox / Expert 互動

## 風險

- **Step-by-step 讓 Wizard test 的時序變複雜** — 需要 fake timers + 多次 advance
- **Mini player UX 要配合** CubieDialog 的 typewriter 動畫，避免互相打架
- **Ch 1 Step 6 autoSpin 需要 store 加欄位**（cameraTarget / spinOnce）可能溢出 scope，最後做

## 完成標準

- 全部 slice 嚴格 TDD (RED → GREEN)
- 既有 687 tests 全綠
- TS clean, eslint 0 error
- 新增 test 覆蓋 friendlyMove、stepNarrations、mini player
- bundle size 不顯著增加
