# v3 Audit + 4×10-Round Refactor Plan

> 針對使用者指出的：首頁加了專家模式後結構失衡、案例 tab 點了不知道去哪、LBL 步數過多、魔方 3D 視覺跟 paper toybook 氣質脫節。
> 每一頁先給分，然後 一般模式 / 專家模式 / 自由玩 / LBL bug 各跑 10 輪（每輪找前輪 3 個弱點 → 替代 → 取捨），最終整合重構 roadmap。
> 全程遵循 frontend-design skill：大膽 aesthetic direction、辨識度字體/動效、避免 AI slop。

---

## 📊 逐頁評分

| 頁面 | 分 | 重點評語 |
|---|---|---|
| **WelcomePage (首頁)** | **C+** | 三張 mode sticker 疊 9 格 grid → 多層決策、scale 失控；「繼續學習」單一 CTA 原則 (plan Round 4) 被破壞；paper aesthetic OK 但資訊密度太高 |
| **Wizard (一般課)** | **B+** | v2 polish 做完後最穩：穩定 55vh cube、compact keypad、Cubie 對話、face pulse + ghost arrow、phase badge、success chip |
| **Sandbox (自由玩)** | **B−** | 3D + keypad 夠用但無進度回饋；打亂/重設 icon 太不顯眼；沒有「保存這個打亂」或「改變速度」的 affordance |
| **ExpertHome (畢業)** | **A−** | Cubie + 紫 CTA 畫面 punchy，aesthetic 齊 |
| **ExpertPage 解 tab** | **C** | 右欄窄擠 ①②③ 編號像表單；桌機 cube 很大但控件小；無 desktop landscape plan |
| **ExpertPage 案例 tab** | **D** | **apply 後用戶還在 案例 tab 看不見 cube**（user 直接點名的 bug）；2-col 密度對速解者 OK 但沒 mini-cube preview |
| **ExpertPage 輸入 drawer** | **C−** | drawer 外殼 v2 了，內部 ManualInput/FormulaInput/PhotoInput 仍舊 legacy 樣式（白底黑塊）— 氣質斷層 |
| **Cube3D 3D 視覺** | **C** | 預設材質面色太飽和、邊框粗度跟紙感不協；idle 慢轉已修 wizard 但在 sandbox / expert 仍在轉（可能有感搖）；沒有 paper 材質貼圖／toon shader |

---

## 🟨 一般模式 10 輪（首頁 + Wizard + Sandbox + 模式 IA）

### Round 1 — 現況問題

- W1 WelcomePage 硬塞 3 模式入口 + 9 章 grid + star bar + streak + toggles → 滾動才看得全
- W2 「繼續學習」當 primary，「專家模式」「自由玩」當 peer → 小孩看到 peer 的大 sticker 會誤導
- W3 章節 3×3 grid 加專家模式後成 4×3 layout，row 不對齊

### R1 → 2 决策
- hero + secondary 分層：主 CTA「繼續學習」最大；專家/自由改小 icon-chip 藏 header 右上
- 章節 grid 改成折疊式「📒 我的章節進度」，預設折起，hero 下方僅顯示 next chapter 提示

### R2 → 3
- W1 折疊章節 grid 失掉 glanceable 進度
- W2 小 icon-chip 在 header 跟 toggles 搶位
- 决：章節進度改成一條 **水平段條 (segmented bar)**，9 格彩色，看一眼就懂進度；專家/自由 chip 放在段條下一行

### R3 → 4
- W1 水平段條在手機會太小（9 格 × 32px = 288px）
- W2 一行 9 格無名稱，不知「我在哪」
- 决：手機 scroll-snap 橫向章節卡（每張 140px），第一張是 next chapter 大卡（自動 snap）；進度條縮成 9 個 dot over 卡片

### R4 → 5
- W1 滑動式章節列表把操作焦點從 CTA 抽走
- W2 專家/自由 chip 在段條下方仍 cramped
- 决：回到 single hero 型 layout — **只顯示 next chapter 大卡 + 兩個 tiny 次按鈕 (🎓 專家 / 🎮 玩)**，章節列表完全移到 /progress 次級頁面

### R5 → 6
- W1 /progress 次級頁 = 新增路由，破壞 v2 的「扁平導航」
- W2 專家模式在 home 頁當 tiny button 對小孩不易發現
- 决：**折衷** — home 只有 next chapter hero + 下方「📒 所有章節」可收折 accordion；tiny 🎓 🎮 🔊 🅰️ 4 icon chip 集中右上工具列

### R6 → 7
- W1 accordion 展開時推動下方，用戶誤以為內容跳
- W2 4 個右上 icon chip，🎓 跟 🔊/🅰️ 不同類型，視覺雜
- 决：accordion 改用 modal (lightbox)；🎓 專家升級為 hero 下方的「🎓 升級 expert」小 pill（condition: 全破時才出現），跟工具類分開

### R7 → 8
- W1 modal 會擋 Cubie + star bar，互動深度變深
- W2 「升級 expert」pill 名稱尬，不吸引
- 决：回 simple scroll — hero (Cubie + star + 繼續學習 CTA) 一屏一螢幕；下方 scroll 是「📒 章節小卡列表」(9 個 full-width 橫列) + 底部「🎓 你已全破 → 進入專家工作台」ribbon，只在 allDone 時出現

### R8 → 9
- W1 9 個 full-width 橫列滾起來 ~900px，手機 scroll 3 次
- W2 「進入專家工作台」ribbon 在底部不易發現
- 决：章節改 2×N 網格（手機 2 欄），完成章節 collapse 成小磚；未解／當前占 row 滿寬；專家 ribbon 永遠在 scrolled viewport 最下方 sticky

### R9 → 10
- W1 磚塊大小混合看起來像 masonry，布局不穩
- W2 sticky ribbon 擋 footer
- 决：**最終版** — 章節 3 欄網格（magicien 3×3），每格同尺寸；當前 Ch 用 marker-blue 邊框高亮，已解 marker-grass 填色，鎖住灰；首頁底部非 sticky 而是 sentinel — scroll 到底才顯示「專家工作台」召喚卡（sensory trigger）

### Round 10 自結
- hero = Cubie + 星星進度條 + 繼續學習
- tools chip = 右上 🔊 🅰️ 兩個（🎓/🎮 移走）
- 章節 3×3 網格（保留 v2 現狀，移除 row 4 的專家/自由 slot）
- 自由玩 chip 移到 **每章節小卡「自由玩這個打亂」分支**（情境化，不是 home-level CTA）
- 專家工作台 = scroll-to-bottom 才浮出的召喚卡，全破才出現

---

## 🟪 專家模式 10 輪

### R1 問題
- W1 解 tab ①②③ 編號表單感
- W2 案例 tab apply 後 UX 斷層（user 點名）
- W3 cube 大控件小（desktop）

### R2 决策
- ①②③ → 橫向 toolbar（cube 上方）：`[🎲][✍️][↺]  |  [LBL][CFOP][⚖]  |  [▶⏯⏮][📋]`
- 案例 tab apply → auto-switch 到 解 tab + highlight 「剛套用 XXX」toast
- desktop cube 區佔 60% width

### R3 → 4
- W1 單條 toolbar 按鈕太多 (9+)
- W2 auto-switch 反直覺（用戶想連點多個 case 比較）
- W3 toast 會被忽略
- 决：toolbar 分兩層（primary + secondary）；apply 後**不切換 tab**，在 案例 tab 底部彈出 dock bar「▶ 跳到解 tab 看 | ✕」； dock 持續 15s 自動收

### R4 → 5
- W1 dock 設計冗餘（又一個 toast/drawer）
- W2 2 層 toolbar 手機塞不下
- 决：案例 tab 有**左右兩欄 layout**（desktop）— 左：案例 grid；右：固定 mini cube preview (180px) + 應用的 alg 顯示；手機則是點 case → card 原地展開（accordion）顯示 alg + [套用並看解] 按鈕

### R5 → 6
- W1 mini cube 在 案例 tab 右側 = 複製了 解 tab 的 cube，兩個 canvas 同時渲染耗 GPU
- W2 手機 accordion 同時只能開一個，比較麻煩
- 决：mini cube 用 2D SVG unfolded 圖（cheap），不用 WebGL；手機點 case → case card highlight + 下方 sticky bar 出現「剛選：XX → [套用並跳到解]」

### R6 → 7
- W1 SVG unfolded 圖 41+21 張要生成
- W2 sticky bar 跟 home 底部 ribbon 設計語言差太多
- 决：SVG **即時生成**（state → 2D），共用 helper；sticky bar 改成 case card 選中時整張 card 展開（已 chosen state），只有一張 chosen，其他變半透明；底部 CTA「套用並看解」

### R7 → 8
- W1 半透明其他 card 在手機灰白混亂
- W2 「套用並看解」= auto switch 到 解 tab — 回到 R2 被否定的方案
- 决：R7 放棄半透明；接受 R3 的 dock bar 方案但做細緻 — 紫色 marker sticker dock，右下角（desktop）或 bottom (mobile)，持續到 user 確認

### R8 → 9
- W1 解 tab ③ 編號仍是表單感
- W2 ExpertHome 只首次出現，用戶重進 app 會懷念
- 决：解 tab 改為 **dashboard metaphor** — 頂部 big cube + 橫 toolbar (primary)，下方 2-col：左 StageChipRow + MoveList，右 Player + Compare；無編號；ExpertHome 每次進 expert 都播放 3 秒 intro 動畫（paper flip），後自動展開 ExpertPage

### R9 → 10
- W1 每次 3 秒 intro 會煩（3x 後覺得多餘）
- W2 dashboard 2-col 手機會疊成 4 區塊超長
- 决：intro 動畫只「從 Welcome 首次點進」時播，之後直接 ExpertPage；手機 dashboard 用單欄 scroll，desktop 2-col；解 tab toolbar 固定在 cube 頂部 sticky (not bottom)，永遠可及

### Round 10 自結
- 解 tab = cube + sticky toolbar 頂 + dashboard-style result area
- 案例 tab = left grid + SVG mini preview（desktop）/ selected-card dock (mobile)
- apply 案例 → 不跳 tab，出 dock「套用並跳到解」讓用戶選
- ExpertHome 只首次 3 秒動畫
- 移除 ①②③ 編號

---

## 🟦 自由玩 (Sandbox) 10 輪

### R1 問題
- W1 沒進度回饋（不知是否接近解開）
- W2 打亂 / 重設按鈕太小在 header
- W3 不能調速度、暫停、步進
- W4 沒有「給我提示」或「讓 solver 解」

### R2 决策
- 加入 auto-detect「完成」→ 顯示 🎉 慶祝
- 主工具列改到下方 footer bar（Sandbox 專屬）
- 加 Player 速度 chips

### R3 → 4
- W1 Sandbox 加 Player = 跟專家模式重複
- W2 完成偵測：現有 `cube.isSolved()` 直接用
- W3 「讓 solver 解」= solver 按鈕入侵了 kid 心智模型（sandbox 不該教）
- 决：Sandbox **純粹** — 只保 cube+keypad+打亂+重設，不加 Player/Solver；完成時 confetti + Cubie 對話「你解開了！」

### R4 → 5
- W1 沒 hint 遇到難的 scramble 會卡住
- W2 keypad 在下占螢幕 1/3，cube 擠
- W3 完成時 Cubie 從哪來（目前 Sandbox 沒 Cubie）
- 决：加「💡 小提示」按鈕 → 顯示「下一步試試 R U R'」（reuse wizard highlight）；keypad 可折疊（下拉 chevron）；完成時 Cubie pop-in 從底部冒 Cubie 頭

### R5 → 6
- W1 hint 按鈕 = 把 wizard 機制搬進 sandbox，模糊邊界
- W2 可折疊 keypad 多一個操作步驟
- W3 Cubie pop-in 動畫可能會驚嚇
- 决：**拒絕** hint（sandbox 就是沒手把手的地方）；keypad 固定不可折；完成時 Cubie 用現有 celebrating 表情 + confetti (existing Confetti 元件)

### R6 → 7
- W1 無 hint 小孩挫折就退出 — 違背 v2 「5 次失敗就跳 app」原則
- W2 現有 Confetti + Cubie 已足夠
- 决：妥協 — 加「🆘 Cubie 來幫忙」按鈕（僅 sandbox scramble 後 30s 沒解開才出現），點了 → 拉回 WelcomePage 暗示「回去學」

### R7 → 8
- W1 「拉回 WelcomePage」中斷 sandbox flow 太暴力
- W2 30s 計時暗箱不透明
- 决：「🆘 Cubie 來幫忙」按鈕改名「💭 想學解法？」— 點了跳 WelcomePage 但保留當前 cube state；計時改「60s 沒動手就冒出」

### R8 → 9
- W1 計時 60s 靠「沒動手」偵測需要 input listener
- W2 Cubie 不在 sandbox 主 UI 顯示 = 情感斷層
- 决：**降階** — 不做計時；改成「💭」按鈕永遠顯示在 keypad 右上，permanent affordance；sandbox header 加小 Cubie 頭像 + 隨機小語（共用 expert 文案庫）

### R9 → 10
- W1 小 Cubie 頭像 + 小語在 sandbox 會跟 expert 混淆
- W2 「💭 想學解法？」按鈕跟 expert 的「🎓 升級」有點重疊
- 决：sandbox 保持 Cubie **不顯示**（只出現在完成時 pop-in），不加小語；「💭」按鈕留

### Round 10 自結
- Sandbox 增：完成 confetti + Cubie 祝賀 pop、「💭 想學解法？」按鈕跳 WelcomePage (保留 cube state)
- Sandbox 砍：Player / solver / hint / 計時器
- keypad 固定、header 小整理

---

## 🟥 LBL bug 10 輪

### R1 症狀
user: 「點 LBL 後還原的步數會非常多」

### R2 root cause 候選
- H1: solveLBL 在 tokenize 改動後，sub-solver (whiteCorners/middleLayer/...) 出現多餘 moves 沒合併
- H2: solveLBL 運行在「scramble moves 還沒播完的 mid-state」上，導致 solver 對錯誤狀態求解
- H3: move animation 延遲讓用戶感覺步數多（perception bug）
- H4: 沒做 move cancellation (e.g. R R' 變 0 步)

### R3 → 4 驗證 H1
- 驗證：unit test solveLBL on known scramble；assert 總 move count 不超過 80
- 若 fail → H1
- 決：先寫一個 LBL total count invariant test

### R4 → 5 驗證 H2
- 驗證：在 SolveTab LBL 按鈕 onClick 前，先 `setFacelets(cube.facelets)` 或 `await drainQueue()` 確保 solver 跑在最終 state
- 實作：LBL button disabled 時 queue.length > 0；目前已 disabled；檢查是否真的 disabled
- 決：已正確 gate；排除 H2

### R5 → 6 驗證 H3
- 驗證：speed 設 4x 看還是否感覺多；預期 yes 因為步數客觀多
- 決：加「快速播放」預設 — LBL 點擊後自動 speed=2

### R6 → 7 H4 move cancellation
- LBL sub-solver 可能生成 `R U U' R'` 這種可約分的序列
- 决：加 `simplifyMoves(moves)` 在 solveLBL 最後：cancel 相鄰 inverse + 合併 R R → R2

### R7 → 8 再驗證
- W1 simplifyMoves 可能破壞 segmentBoundaries（每 stage 算好的 move count）
- W2 LBL sub-solver 有沒有自己做 cancellation
- 决：simplify 僅在 segment 內部，segment 之間不併；每 segment 先 simplify 再計算 boundary

### R8 → 9
- W1 若 solver 已有 cancellation 再疊一次會破壞 pre-baked 公式
- W2 per-segment simplify 改動範圍大
- 决：**先量化** — 寫一個 regression test 抓 100 個 random scramble 的 LBL 總步數分布（mean, p95）；超過閾值才啟動 simplify；沒超過代表觀感是 H3

### R9 → 10 H3 重新探討
- 用戶觀感 = 「相對於 scramble 25 步，solution 80 步感覺多一倍」
- 若 solution mean = 70, p95 = 100，客觀就是長；無法靠心理暗示解
- 决：兩路進行
  1. **客觀**：LBL sub-solver 各自加 post-process cancellation（white cross 14→12, corners 25→20, middle 20→16, yellow cross 10→8, yellow face 12→10, PLL 15→13）
  2. **主觀**：default speed=2x when LBL 播放

### Round 10 最終修復 plan
- Write regression test: seed 50 random scrambles, measure LBL total moves, assert mean <= 60, p95 <= 90
- 加 `collapseMoves(moves)` utility: F F → F2 / F F' → (removed) / F2 F → F' / F F2 → F'
- 每 sub-solver return 前呼叫 collapseMoves
- solveLBL 設定 `speed: 2` 預設
- ComparePanel 加「solution 越短越好」的 context

---

## 🎨 整合重構 roadmap (v3)

### Phase A — bug fix (先做)
1. **RD3-1** LBL collapseMoves + regression test
2. **RD3-2** Cube3D 視覺升級（材質 / shader / 降低飽和）
3. **RD3-3** 案例 apply dock bar（apply → 不跳 tab，出 dock）

### Phase B — 首頁 IA 改
4. **RD3-4** WelcomePage 移除 3-mode sticker；hero = 繼續學習 only
5. **RD3-5** 章節 3×3 網格保留；專家模式變 scroll-to-bottom sentinel
6. **RD3-6** 自由玩 chip 收進章節卡 (每章節底 「自由玩這個打亂」)

### Phase C — 專家模式 UX
7. **RD3-7** 解 tab toolbar 化（移除 ①②③，改 sticky toolbar on cube）
8. **RD3-8** 案例 tab SVG mini preview + dock bar
9. **RD3-9** 輸入 drawer 內部 ManualInput/FormulaInput/PhotoInput v2 restyle

### Phase D — Sandbox 收尾
10. **RD3-10** Sandbox 完成偵測 + confetti + Cubie pop
11. **RD3-11** Sandbox 「💭 想學解法？」escape hatch
12. **RD3-12** Cube3D 視覺升級在 sandbox/expert 也套用

每 slice TDD + invariant + E2E 更新。

---

## 前端 skill 使用備忘

- **Bold direction**：保留 Pop-up Paper Toybook，**但**首頁從「selector」改「journey hub」— 單一 CTA + 進度景觀
- **字體**：Bagel Fat One + Comfortaa 已定，不動
- **Motion**：reduce motion respected；ExpertHome paper-flip 只 first-time
- **Background**：graph paper dot grid 延續，加 scroll-to-bottom reveal 的紙張翻邊 hint（未來）
- **Avoid AI slop**：不要 generic dashboard icon、不用 sky-blue gradient、不用 Inter/Roboto

---

## 待你確認

1. **LBL 步數**你覺得「多」的客觀值是多少？60? 80? 100+?（設計 collapseMoves 閾值）
2. **首頁砍 3-mode sticker** 你 OK 嗎？（Phase B 核心）
3. **案例 apply dock bar** vs **自動跳 解 tab**？（Phase A 抉擇）
4. **Sandbox 完成 Cubie pop** 有必要嗎？還是單純 confetti 就好？
