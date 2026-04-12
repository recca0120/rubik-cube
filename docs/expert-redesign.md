# Expert Mode Redesign — 10 Rounds

> v2-advanced branch 問題：`AppMain` (專家模式) 是舊的 dark `bg-neutral-900` UI，跟 v2 kid 的 Pop-up Paper Toybook（paper + marker + Bagel Fat One + chunky 邊）完全兩個產品。
> 本文用跟 v2 一樣的自我迭代方法（先寫第一版，然後 9 次「找前一輪 3 個弱點 → 提替代 → 取捨 → 重寫」），得到最終可執行計畫。

---

## 現況盤點（screenshots: `scripts/screenshots/expert/`）

| 畫面 | v2 設計語彙 | 現在專家模式 |
|---|---|---|
| 背景 | paper cream + 方格紙 dot grid | 純黑 `bg-neutral-900` |
| 主色 | marker-yellow/red/blue/pink/grass/purple | sky-600 tab active + neutral-800 |
| 字體 | Bagel Fat One + Comfortaa | 預設 sans |
| 邊框 | 4px ink black + offset shadow | 1px neutral-700 |
| Cubie 角色 | 大頭對話框 | 沒有 |
| Layout | 固定 55vh cube + 內捲 footer | 50vh + aside 380px (desktop) |
| Header | 手寫風 title + 🏠 sticker | 粗體黑字 🏠 3D Rubik's Cube Tutor |
| Tabs | 無（wizard 線性流） | 教學/自由/案例/輸入 4-tab |

---

## ✅ 最終 plan（10 輪迭代後）

### 設計鐵律

1. **保留 v2 aesthetic 一致性** — expert 要看得出是同一個 app 畢業生模式
2. **但不要可愛化 — 速解者需要資訊密度** — 不要為了 sticker 而犧牲可讀性
3. **Mobile-first** — 390×844 是 spec；desktop 是 bonus
4. **Cube 尺寸穩定**（v2-C10 課）
5. **4 → 2 tabs IA simplification** — 教學 + 自由合併成「解」，輸入變 drawer 不占 tab
6. **零 dark theme leftover** — bg-neutral-900、text-neutral-100 etc. 全部斬草
7. **Cubie 出現在 expert 入口** — 畢業歡迎，但不在主互動 UI（expert 是工作台）

### Information Architecture

```
/                       ← WelcomePage (kid)
/wizard                 ← Wizard (kid, 9 章)
/sandbox                ← Sandbox (kid 自由玩)
/expert                 ← ExpertPage (entry animation + 2-tab)
  ├─ 解 (solve tab)     ← 預設 — 打亂 + 輸入 + 解方 + 結果
  └─ 案例 (cases tab)   ← F2L 41 + PLL 21 個案例庫
     drawer             ← 輸入狀態（manual / formula / photo 三個 sub-tab）
     panel              ← 對照 (LBL vs CFOP)，滑入 inline 非 modal
```

### 頁面設計

#### 1. Entry transition (`/expert` 首次進入)

- WelcomePage 🎓 紫 sticker 點擊後，**paper flip 動畫**（card 繞 Y 軸轉 180°）
- 翻面後：Cubie 大頭對話（180px 居中）：「哇～你真的會解了！這邊是進階工具區。想打亂來解解看嗎？」
- 對話框下方：[開始使用] sticker 按鈕
- 點擊 → 過場 → ExpertPage 解 tab
- **只首次出現**（localStorage flag: `expertOnboarded`）

#### 2. ExpertPage 架構

```
┌──────────────────────────────────────┐
│ Header (white, border-b-ink-3px)     │
│  ← 回首頁 (pink sticker)   專家工作台 │
├──────────────────────────────────────┤
│ Tab row (sticker tabs)               │
│  [ 🧠 解 ]  [ 📚 案例 ]              │
├──────────────────────────────────────┤
│                                      │
│ 解 tab body (active)                 │
│                                      │
└──────────────────────────────────────┘
```

#### 3. 解 tab — desktop 2-col, mobile stacked

**Desktop 1024+**:
```
┌────────────────┬─────────────────────┐
│                │ State setup:        │
│                │ [🎲 打亂] [✍️ 輸入]  │
│                │                     │
│   3D Cube      ├─────────────────────┤
│   (55vh)       │ Solve method:       │
│                │ [▶ LBL] [⚡ CFOP]    │
│                │ [⚖ 對照]             │
│                ├─────────────────────┤
│                │ Stage pipeline      │
│                │ ●—●—◎—○—○—○         │
│                │                     │
│                │ Player controls     │
│                │ [⏮ Prev][⏯][Step ⏭] │
│                │ Speed: 0.5x 1x 2x 4x│
│                │                     │
│                │ Move list (scroll)  │
│                │ R U R' F B2 ...     │
└────────────────┴─────────────────────┘
```

**Mobile**:
```
┌──────────────────┐
│ Header           │
│ Tabs             │
├──────────────────┤
│ [3D Cube 55vh]   │
├──────────────────┤
│ State setup row  │ ← 橫向排列 buttons
├──────────────────┤
│ Solve method row │
├──────────────────┤
│ Stage pipeline   │ ← 緊湊橫向 chip 串
├──────────────────┤
│ Player controls  │
├──────────────────┤
│ Move list        │ ← 可摺疊 (default open)
└──────────────────┘
```

#### 4. 案例 tab

```
┌──────────────────────────────────────┐
│ [F2L] [PLL]   搜尋: ____________     │ ← filter bar
├──────────────────────────────────────┤
│ ┌────┐ ┌────┐ ┌────┐ ┌────┐        │ ← 4-col desktop
│ │Case│ │Case│ │Case│ │Case│        │    2-col mobile
│ │ 01 │ │ 02 │ │ 03 │ │ 04 │        │
│ │🎯R U│ │🎯F' U│ │    │ │    │        │ 每 card: mini cube preview
│ └────┘ └────┘ └────┘ └────┘        │  + case name + algorithm 預覽
│                                      │
│ 點一張 card → 右側 drawer 出現：     │
│  大 cube preview + 完整 alg + 應用按鈕│
└──────────────────────────────────────┘
```

#### 5. 輸入 drawer (全螢幕 mobile, right-side 480px desktop)

```
┌──────────────────────────────┐
│ ✕ 關閉       輸入方塊狀態     │
├──────────────────────────────┤
│ [手動] [公式] [拍照]          │ ← sub-tabs
├──────────────────────────────┤
│                              │
│ Manual: 9×12 cross layout    │
│ (existing ManualInput UI 但   │
│  換成 v2 sticker 按鈕)        │
│                              │
│ OR Formula: <input> + Apply  │
│ OR Photo: 6 uploaders + Scan │
│                              │
│ [取消] [✓ 套用到方塊]         │
└──────────────────────────────┘
```

#### 6. 對照 inline panel

- 點「對照」按鈕 → 下方 slide-down 一張紙 card (marker-purple 底)
- 內容：LBL vs CFOP 雙欄，每欄列 segments + totals，底部「哪個短」badge
- 右上 ✕ 收起

### 視覺 tokens（沿用 v2，不新增）

- `--paper`, `--paper-deep`, `--ink`
- `--marker-red/yellow/blue/pink/grass/purple` — 專家模式主用 purple + blue 區別 kid 的 yellow + pink
- `--offset / --offset-sm / --offset-lg` — 厚陰影
- `--border-thick / --border-mid`
- Graph paper background (繼承)

### Component 重用 / 新建

| 動作 | Component |
|---|---|
| 沿用 | Cube3D, MoveKeypad, HintButton 無關(不顯示) |
| 改 aesthetic | Player, StagePipeline, CaseLibrary, ManualInput, FormulaInput, PhotoInput |
| 新建 | `ExpertHome` (入口 + Cubie transition) |
| 新建 | `ExpertPage` (tab shell + layout) |
| 新建 | `SolveTab` (解 tab 主體) |
| 新建 | `CasesTab` (CaseLibrary wrapper w/ filter) |
| 新建 | `StateInputDrawer` (抽屜) |
| 新建 | `ComparePanel` (對照 inline) |
| 新建 | `StageChipRow` (替代 StagePipeline 視覺) |

### Roadmap

| # | Slice | Commits |
|---|---|---|
| X2 | ExpertHome + Cubie transition | 1 |
| X3 | ExpertPage tab shell + routing | 1 |
| X4 | SolveTab layout + state setup + solve buttons | 1 |
| X5 | StageChipRow + Player v2 style | 1 |
| X6 | CasesTab + CaseLibrary v2 restyle + filter | 1 |
| X7 | StateInputDrawer + Manual/Formula/Photo restyle | 2 |
| X8 | ComparePanel inline | 1 |
| X9 | Move list panel + full flow polish | 1 |
| X10 | E2E test expansion + delete old dark code | 1 |

---

## 🔁 Iteration Log (10 rounds)

### Round 0 → 1

**v0**: 保留 4-tab 架構 + 全部換 v2 aesthetic（背景、字體、按鈕 sticker 化）

**v0 弱點**：
- W1: 保 4-tab 等於 copy-paste aesthetic，沒想清楚 advanced 用戶真的要什麼
- W2: 教學 tab 對 advanced 冗餘（9 章都畢業了還要 LBL 逐步教學？）
- W3: 輸入獨立成 tab，浪費 top-level slot — 只有 setup 時用

**Round 1 決策**：
- 4 tab → 2 tab（解 + 案例）
- 教學合併進解 tab（靠 LBL/CFOP 按鈕觸發逐步播放）
- 輸入 → drawer

### Round 1 → 2

**Round 1 弱點**：
- W1: 合併後「解」tab 承擔太多職責（打亂 + 輸入 + 3 種解法 + 結果），資訊爆炸
- W2: LBL/CFOP/對照 3 個 button 並列，但三者性質不同（前二是 solver，後一是比較）
- W3: 沒講 mobile 怎麼放下這麼多 UI

**Round 2 決策**：
- 解 tab 內部分區：State setup row（上）/ Solve method row（中）/ Result area（下）
- 對照 從 button 變成 result area 的 toggle
- Mobile 垂直堆疊 + 可摺疊 result sections

### Round 2 → 3

**Round 2 弱點**：
- W1: 可摺疊區塊在 v2 aesthetic 沒先例，破壞一致性
- W2: Result area 包含 stage pipeline + 移動列表 + player，三種信息密度不同
- W3: stage pipeline 視覺在 v2 該長什麼樣沒寫

**Round 3 決策**：
- 不用折疊，改用 sections 直接堆疊
- stage pipeline 改成「chip 串」（marker 色六連塊），比原來的 StagePipeline 豎直版更緊湊
- 移動列表放最後，可上下卷

### Round 3 → 4

**Round 3 弱點**：
- W1: Cubie 是 v2 主 mascot，expert 完全不放 Cubie 會斷氣質
- W2: 專家模式沒入口過場，直接 WelcomePage → 4-tab 突兀
- W3: 解 tab 的「▶一鍵解 / LBL / CFOP / 對照」四個選項 decision paralysis

**Round 4 決策**：
- ExpertHome 首次進入時 Cubie 大頭對話（「哇～你真的會解了」），之後 Cubie 不出現在主操作 UI
- paper flip 過場動畫（Y 軸 180°）
- 解 tab 選項合併：只有 LBL / CFOP 兩個 primary，對照是 secondary（LBL + CFOP 都跑過後才亮）

### Round 4 → 5

**Round 4 弱點**：
- W1: ExpertHome 每次都出 Cubie 會煩，要用 localStorage flag
- W2: 「LBL / CFOP primary，對照 secondary」邏輯上對，但一般 user 不會依序跑
- W3: paper flip 動畫在手機效能是否順暢沒評估

**Round 5 決策**：
- `expertOnboarded` flag 持久化，只首次 Cubie
- 對照改為「任何時候可按」，若 LBL/CFOP 還沒算過就現場算（非同步 loading state）
- paper flip 用 CSS transform 3D、duration 600ms，mobile 60fps OK

### Round 5 → 6

**Round 5 弱點**：
- W1: CaseLibrary 41+21 case，搜尋 filter 在原本沒有
- W2: case card 怎麼呈現 mini cube preview？SVG? 3D?
- W3: 點 case 後怎麼互動沒寫

**Round 6 決策**：
- filter bar top：[F2L] [PLL] toggle + 搜尋 input
- case card mini preview = SVG 2D 展開圖（簡化、快）
- 點 case → 右側 drawer（desktop 480px、mobile full）顯示大 preview + 完整 alg + [套用到目前方塊] / [練這個] 按鈕

### Round 6 → 7

**Round 6 弱點**：
- W1: drawer 在右側，手機上 drawer 跟主畫面爭焦點
- W2: 「套用到方塊」vs「練這個」差別沒講
- W3: Player controls (Prev/Play/Pause/Step/Speed) 在 v2 sticker 風格怎麼排？

**Round 7 決策**：
- 手機 drawer = bottom sheet（從下滑上）而非右側
- 「套用到方塊」= 把該 case 的起始狀態載入 cube（user 可從 case 狀態開始解）；「練這個」= scramble cube 讓它進入該 case 狀態 + requireMoves = case alg
- Player 橫向 sticker 列 [⏮][⏯][⏭] 三個方按鈕 + speed 圓形 chip

### Round 7 → 8

**Round 7 弱點**：
- W1: 「練這個」把 v2 kid wizard 的 requireMoves 機制移植到 expert，範圍擴大要想清楚
- W2: 手機 bottom sheet 跟現有 Wizard footer 一樣都從下冒 — 會不會混淆
- W3: 沒寫 expertOnboarded 跟 sandbox 之間的互動

**Round 8 決策**：
- 「練這個」先砍掉（列入 v2.X expert-plus）。drawer 只做「套用到方塊」，簡單
- bottom sheet 區分：wizard footer 是 static 區塊，案例 drawer 是 modal (有 backdrop + ✕ 按鈕)。視覺上加 backdrop blur 區分
- Sandbox 跟 ExpertPage 是兄弟頁面，各自從 WelcomePage 進入，互不跳轉

### Round 8 → 9

**Round 8 弱點**：
- W1: Cubie transition 只第一次出現，之後用戶從 WelcomePage 點 🎓 直接進 ExpertPage 會覺得「沒驚喜」—需要某種每次都有的 breadcrumb
- W2: 解 tab 的 move list 在 mobile 看起來會很擠（打亂 25 步 + 解法 50 步）
- W3: expert 沒有 kid wizard 的成就感 — 用戶憑什麼繼續用？

**Round 9 決策**：
- 每次進入 ExpertPage：header 下方 1 行 Cubie 小語（隨機、友善，不用對話框）「今天想解幾顆？」「試試 CFOP 看看？」持續 breadcrumb
- move list 預設只顯示當前 stage 的 moves + 總計，點開才看全部
- expert 新增「今日解數」計數（persist），首頁可看

### Round 9 → 10 (final coherence)

**Round 9 弱點**：
- W1: 「Cubie 小語」每次隨機看起來聰明但實際要有文案庫，維護成本
- W2: 「今日解數」持久化跟現有 streak 系統要整合
- W3: ComparePanel 位置沒定（inline 哪裡？）

**Round 10 決策**：
- Cubie 小語文案庫先寫 6 句固定隨機（極省成本），後期再擴充
- 「今日解數」併入現有 `markActiveToday`：expert 每次 solve 按鈕也 mark，首頁 streak chip 已顯示 7 天次數，不用另外計數
- ComparePanel 位置：點「對照」按鈕後，在 Solve method row 下方 slide-down（push 其下方內容）— 非 modal，不蓋 cube

### Round 10 自我總結

相比 v0 最大改變：
1. **4 tab → 2 tab + drawer**（解 + 案例，輸入藏 drawer）
2. **加入 Cubie entry transition**（只第一次大對話 + 每次小語）
3. **保留 v2 紙感 aesthetic**（不再 dark theme）
4. **對照 inline 而非 modal**
5. **stage 視覺從豎直 pipeline → 橫向 chip 串**
6. **Case drawer mobile 下滑不右滑**
7. **「練 case」砍到 expert-plus**（控制範圍）
8. **隨機 Cubie 小語**（情感一致性）
9. **不重複計數**（共用 activeDates）
10. **ExpertHome = 一次性 entry gate，不是每次都過場**

---

## 🎯 Tasks 對照

每個 slice 1 commit，emphasize TDD + screenshot regression。

- RD2-X2 ExpertHome + Cubie transition
- RD2-X3 ExpertPage shell (header + 2 tabs + routing)
- RD2-X4 SolveTab 主體（state setup + solve buttons + cube canvas 55vh 共用）
- RD2-X5 StageChipRow + v2 Player
- RD2-X6 CasesTab + CaseLibrary v2 restyle + filter/search
- RD2-X7a StateInputDrawer shell + sub-tabs
- RD2-X7b Manual/Formula/Photo v2 restyle
- RD2-X8 ComparePanel inline slide-down
- RD2-X9 Move list panel + Cubie 小語 header
- RD2-X10 E2E expand + cleanup old AppMain dark code

---

## 風險

| 風險 | 緩解 |
|---|---|
| 大面積重寫破 548 unit tests + 7 expert E2E | 每 slice 跑 test，不批量；每動 AppMain 先寫新組件並存 |
| paper flip 動畫手機卡 | prefers-reduced-motion 尊重；備援：淡出淡入 |
| ManualInput 9×12 cell grid 不好 sticker 化 | 保留原 cell 交互，僅背板換 paper + 邊框換 ink |
| CaseLibrary 41 cases SVG preview 計算成本 | 預算算好存 static SVG；lazy render viewport 內的 |
| drawer 層級跟 achievement modal 衝突 | z-index 規劃：modal 50 / drawer 40 / sticky header 30 |

## 待你決定

1. **「練 case」**真的砍到 expert-plus 還是進 X7？
2. Cubie 小語**真的隨機**還是「今日」固定一句（localStorage 記今日日期用一句）？
3. 案例 drawer 在 mobile 是 bottom sheet 還是 full-page navigate？
