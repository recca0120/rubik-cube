# React Component Refactor (v4)

> 對 24 個 React `.tsx` 檔逐一打分，找出該拆 component 的，分 8 個 slice TDD 重構，**測試永遠保持綠 + 行為不變**。

## 評分

A = clean, single responsibility · B = OK 但可拆 · C = 該拆 · D = monolithic

| File | 行 | 分 | 拆解建議 |
|---|--:|:-:|---|
| `App.tsx` | 39 | A | router 乾淨 |
| `main.tsx` | 10 | A | entry |
| `GitHubLink.tsx` | 24 | A | atomic |
| `HintButton.tsx` | 50 | A | atomic |
| `kids/expert/StageChipRow.tsx` | 52 | A | 已純 |
| `kids/MoveKeypad.tsx` | 59 | A | 已純 |
| `kids/ExpertHome.tsx` | 71 | A | 單 hero page |
| `kids/expert/ComparePanel.tsx` | 79 | A | inner `MethodCol` 可內聯保留 |
| `kids/Confetti.tsx` | 80 | A | 動畫粒子 |
| `kids/expert/CaseMiniPreview.tsx` | 81 | A | SVG helper |
| `kids/expert/MoveListPanel.tsx` | 85 | A | 純展示 |
| `FormulaInput.tsx` | 88 | A | 單表單 |
| `kids/ExpertPage.tsx` | 96 | A | inner `TabButton` OK |
| `kids/expert/StateInputDrawer.tsx` | 106 | A | inner `SubTab` OK |
| `kids/Sandbox.tsx` | 110 | A | 單 page |
| `Player.tsx` | 121 | **B** | inner `PlayerBtn` 可移共用 |
| `ManualInput.tsx` | 148 | **B** | inner `V2Btn` 重複 |
| `PhotoInput.tsx` | 149 | **B** | inner `V2Btn` 重複 |
| `kids/expert/SolveTab.tsx` | 175 | **B+** | toolbar / banners / result-area 三段該拆 |
| `kids/expert/CasesTab.tsx` | 196 | **C** | `CaseCard` / `CaseApplyDock` / `FamilyTab` 該獨立 |
| `Cube3D.tsx` | 252 | **C** | `Cubie3D mesh` / `FaceLabels` / `GhostArrow` 三個 sub 該拆 |
| `kids/WelcomePage.tsx` | 274 | **C** | 8 個 section 集中、`Decoration` helper |
| `kids/Cubie.tsx` | 274 | **C** | `Cubie` + `CubieDialog` + 6 個 face SVG 該拆 |
| `kids/Wizard.tsx` | 384 | **D** | 8+ concerns + 多個 useEffect，最該動 |

## 共用元件可萃取（檔內重複）

- **V2 sticker `Btn`** — 出現在 SolveTab、PhotoInput、ManualInput、FormulaInput、Wizard、Sandbox、ExpertHome、ExpertPage、Sentinel、CasesTab。**全部統一到 `src/components/ui/StickerButton.tsx`**。
- **`Panel`** (white card + ink border + offset shadow) — 出現在 SolveTab、Wizard、CasesTab dock。`src/components/ui/Panel.tsx`。
- **`Decoration`** (浮動 emoji) — WelcomePage、ExpertHome 用過。`src/components/kids/Decoration.tsx`。

## 8 個 slice (TDD，每 slice 完跑全測)

### RD5-1 共用 UI primitives 萃取
- 新建 `src/components/ui/StickerButton.tsx`、`Panel.tsx`、`StickerChip.tsx`
- 不動 callsite，只新增；後續 slice 逐步遷移
- TDD: snapshot/render test 各 1 個

### RD5-2 Cubie 拆檔
- `kids/Cubie.tsx` (mascot SVG only)
- `kids/CubieDialog.tsx` (typewriter + speech bubble — 移出)
- `kids/CubieFace.tsx` (6 emotion 各自 render fn 集中)
- 既有 `Cubie.test.tsx` 不動，import 路徑更新

### RD5-3 Cube3D 拆檔
- `components/Cube3D.tsx` (主 scene)
- `components/three/Cubie3D.tsx` (單顆 mesh)
- `components/three/FaceLabels.tsx`
- `components/three/GhostArrow.tsx`

### RD5-4 WelcomePage section 拆
- `kids/welcome/WelcomeHeader.tsx` (title + decorations)
- `kids/welcome/WelcomeToggles.tsx` (右上 🅰️🔊)
- `kids/welcome/StarProgressBar.tsx`
- `kids/welcome/ContinueLearningCTA.tsx`
- `kids/welcome/ChapterGrid.tsx` (含 ChapterCard 子元件)
- `kids/welcome/SandboxChip.tsx`
- `kids/welcome/ExpertSentinel.tsx`
- `WelcomePage.tsx` 變組裝層 ≤ 60 行

### RD5-5 Wizard 拆檔 + hooks
- `kids/wizard/WizardHeader.tsx`
- `kids/wizard/WizardAchievement.tsx`
- `kids/wizard/WizardCubeStage.tsx` (Canvas + lights + Cube3D)
- `kids/wizard/WizardPracticeControls.tsx` (MoveKeypad + retry + hint + ✓)
- `kids/wizard/WizardNav.tsx`
- 抽出 hooks: `useWizardPhaseSync` (highlightedFace/Move sync), `useAutoUndoWrong`, `useSuccessSfx`
- `Wizard.tsx` 變主流程 ≤ 100 行

### RD5-6 SolveTab 拆段
- `kids/expert/solve/SolveToolbar.tsx`
- `kids/expert/solve/SolverStatusBanners.tsx`
- `kids/expert/solve/SolveResultArea.tsx`

### RD5-7 CasesTab 拆段
- `kids/expert/cases/CaseCard.tsx`
- `kids/expert/cases/CaseApplyDock.tsx`
- `kids/expert/cases/FamilyTab.tsx`

### RD5-8 共用 V2Btn 遷移
- 把 PhotoInput、ManualInput、FormulaInput、Player、Wizard、Sandbox 等內部 `V2Btn` / `Btn` / `PlayerBtn` 全改用 `<StickerButton>`
- 確保 props 對齊（color、primary、disabled、onClick）

## 不動的部分

- store / hooks / cube engine / solvers / animations 全保留
- testfile 不動（接口不變）；只 import 路徑可能要調

## 風險

- 大量 import 路徑變動 → 用 vitest watch + frequent commits 緩解
- snapshot 測試會錯 → 沒用 snapshot test
- prop 名/嵌套不一致 → strict TS 接住

## 完成標準

- 行數 redistribution: 沒有 file > 200 行（Cubie/CubieDialog/Cubie3D 等 SVG 例外可以稍多）
- 605 unit + 24 E2E 全綠
- bundle size 不增（檢查 `pnpm build`）
- ✱ no functional behavior change
