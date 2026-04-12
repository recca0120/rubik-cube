# UX 重設計 — 10 輪思考紀錄

目標：把現有「進階速解者導向」的網站，轉成 8-12 歲小孩也能上手、活潑、有遊戲感。

## 第 1 輪：當前實際 bugs + 不協調

| 區塊 | bug / 不協調 |
|---|---|
| TeachPanel 預設 tab=`now` | NowCard 多數時間是「空狀態」，第一印象「這頁好空」 |
| ActionBar + ⌘K | 兩條入口做同件事，新手不知道按哪個 |
| 「對照」按鈕 | 小孩不懂這是什麼 |
| 案例 tab 顯示 case names | 用 internal naming 例如「Edge-Only-DF」，無教學意義 |
| 「URF」「F2L」「PLL」術語 | 8-12 歲完全看不懂 |
| 對照後跳 compare tab | cube 沒變化，使用者困惑「我按了什麼」 |
| Solver `…` loading | 沒說明為什麼等 10 秒，小孩會以為網站壞了 |
| 一進站 cube 已解 | 沒指引「該按 Scramble」 |
| viewFlipped 翻轉 | 對小孩太抽象，不知為何要翻 |
| 沒有任何歡迎 / 引導 | 小孩 30 秒內就跳走 |
| 沒有完成感 / 慶祝 | 解開只有一個 🎉，缺乏正回饋 |
| 沒有「學到哪」進度 | 小孩學東西需要 progress bar 跟 stars |

**結論**：當前網站 100% 給已知道 cube 的使用者用，對 8-12 歲新手完全敵意。

## 第 2 輪：參考其他 cube 網站

| 網站 | 風格 | 適合 | 學到什麼 |
|---|---|---|---|
| rubiks.com (官方) | 大圖、白底、有 mascot | 兒童 | 影片教學 + 印刷 PDF |
| youcandothecube.com | 學校教材風 | 教師/學生 | 章節式、可印刷 |
| ruwix.com | 百科、文字密 | 進階 | 不適合學 |
| jperm.net | 簡潔黑底、動畫好 | 速解進階 | 一頁一個概念 |
| cube.rider.biz | 互動 3D | 中階 | 直接拖 cube 練 |

**給小孩的網站共同點**：
1. 大色塊 emoji icon
2. 角色引導
3. 拒絕速解術語（不說 URF，說「右前上角」）
4. 線性 wizard
5. 完成感（彩帶、星星、音效）

## 第 3 輪：定義 persona

| Persona | 年齡 | 知識 | 需要 |
|---|---|---|---|
| **A 小明** | 8-12 | 0 | wizard、術語簡化、慶祝 |
| **B 阿翔** | 13-16 | 會 LBL，想學 CFOP | 對照、case 庫 |
| **C 阿姨** | 25+ | 0 | 文字解釋、可暫停 |
| **D 進階** | any | 會 CFOP、想練 | timer、daily challenge |

現況：100% 服務 D。**目標**：A 是核心，B 順便照顧。

## 第 4 輪：歡迎頁 + wizard wireframe

```
歡迎首頁
├─ 📚 學解魔方 (9 章節 wizard)
├─ 🎮 自由玩 (現有的 cplus 介面)
└─ 🏆 挑戰 (進階)

點「學解魔方」→ Chapter 1：
  3D cube + Cubie 角色 + 大「下一步」按鈕
```

## 第 5 輪：吉祥物 Cubie

擬人化 cube，有眼睛跟手。表情：😊 😲 💪 🎉。
- 章節開始介紹
- 階段達成跳一下
- 卡住給提示
- 全解跳舞 + 彩帶

實作：SVG 動畫或 Lottie。

## 第 6 輪：質疑吉祥物

Duolingo Owl 被嫌煩的反例。修正：
- Cubie 預設出現，可關閉
- 進階模式自動隱藏
- 用「音效 + 動畫」當 fallback

## 第 7 輪：遊戲化

```
✅ 1. 認識方塊       ⭐⭐⭐
✅ 2. 6 個基本轉法    ⭐⭐☆
▶  3. 白色十字       ⭐☆☆
🔒 4. 白色那一面
🔒 5. 中間一圈
🔒 6. 黃色十字
🔒 7. 黃色那一面
🔒 8. 最後對齊
🔒 9. 恭喜你會了！
```

每章 3 顆星：★ 看完示範 ★★ 自己做一次 ★★★ 不看提示完成。

## 第 8 輪：視覺 style

色票：天藍 #38BDF8、暖橘 #FB923C、黃綠 #84CC16、粉紅 #F472B6、奶白 / 深夜藍。

字體：
- 標題 Quicksand / Nunito Bold
- 內文 Inter / Noto Sans TC
- code JetBrains Mono

按鈕分級 Hero / Primary / Secondary / Chip。

3D cube 比現在大 1.5×，高亮即將動的方塊。

## 第 9 輪：手機優先

iPhone 直立 (375)：
- 60% 螢幕給 cube
- bottom sheet 教學內容
- 浮動 + 號叫快速選單
- 觸控目標 ≥44px

## 第 10 輪：綜合 — 三大模式

```
歡迎首頁
├─ 學徒模式 (linear wizard，新手 A)
├─ 自由模式 (現有 cplus，B/C/D)
└─ 挑戰模式 (timer/daily/case，D)
```

共用 backend solver/store。

## 第 11 輪：Wizard 章節內容詳細化

```
Ch 1. 認識魔術方塊 (5 分鐘)
  ├─ 6 個面、6 種顏色、中心不會動
  ├─ 角塊 8 個、邊塊 12 個、中心 6 個
  └─ 互動：拖曳 cube 看每一面

Ch 2. 6 種轉法 (10 分鐘)
  ├─ U/D/L/R/F/B 用「上/下/左/右/前/後」說
  ├─ 順時針 / 逆時針 / 180度
  └─ 小遊戲：「轉到指定狀態」3 題

Ch 3. 白色十字 (15 分鐘)
  ├─ 4 白邊塊歸位，直覺解法
  └─ 練習 5 個不同初始狀態

Ch 4. 白色一面 (15 分鐘) — sexy move (R U R' U')
Ch 5. 中間一圈 (15 分鐘) — 左插/右插公式 + 翻 cube
Ch 6. 黃色十字 (10 分鐘) — F R U R' U' F'
Ch 7. 黃色一面 (10 分鐘) — sune (R U R' U R U2 R')
Ch 8. 最後對齊 (15 分鐘) — 角 perm + 邊 perm
Ch 9. 恭喜！(2 分鐘) — 完整 replay + 證書
```

每章 = 教學動畫 + 互動練習 + 過關測試。

## 第 12 輪：Cubie 角色設計具體化

- 視覺：3D 渲染 mini cube，64×64 頭像 / 128×128 全身
- 6 表情：平靜/開心/驚訝/加油/困惑/慶祝
- 對話框：圓角 + 三角指向 + typewriter
- 講話風格：稱「你」「我們」、有驚嘆號、偶爾 emoji
- 實作：純 SVG 起手，可升級 Lottie

## 第 13 輪：聲音 / 音效設計

預設關閉，可開。5 種音效：
- 點按鈕「咚」 0.05s
- 一個轉法完成「噠」 0.1s
- 階段達成「叮叮」 0.3s
- 解開 cube「鏘啷～」 1.5s
- 卡住提示「叮咚？」 0.5s

避免：背景音樂、人聲、廣告音。

## 第 14 輪：Onboarding 前 60 秒

```
0-2s   載入畫面 + logo
2-5s   Cubie 滑入「嗨！第一次來嗎？」
5-15s  分流選擇
15-30s 首頁 3 個大按鈕
30-60s Ch 1 開始 + 浮動提示
```

關鍵指標：60 秒內讓使用者**做出第一個動作**。

## 第 15 輪：Reward / 星星 mechanics

```
★   = 看完該章節
★★  = 完成互動練習 1 次
★★★ = 無提示連續成功 3 次

獎勵
├─ 9 顆星 → 解鎖自由玩
├─ 18 顆星 → 解鎖挑戰
└─ 27 顆星 → 「魔方大師」徽章
```

挫折處理：不顯示「失敗」，重試無限，Cubie 永遠正面。

## 第 16 輪：Hint 系統

```
卡住偵測
├─ 30 秒沒動作 → Cubie 變困惑
├─ 連續錯 3 次 → 主動提示
└─ 點「我不懂」按鈕

3 級提示
├─ Lv1 文字提示       → ★★★ 仍可拿
├─ Lv2 視覺閃光       → 最高 ★★
└─ Lv3 動畫演示       → 最高 ★

「跳過此題」永遠可用，不扣星。
```

## 第 17 輪：色彩無障礙

5% 男生紅綠色盲。

對策：
1. 色塊上加 pattern (斜線/點點/直線等)
2. 「色覺輔助模式」每面加符號 (圓/方/星/三角/月/愛心)
3. 教學文字用位置而非顏色 (「上面那層」非「白色那層」)
4. 對比度 ≥ 4.5:1 (WCAG AA)
5. 內文 ≥16px、對話 ≥18px

## 第 18 輪：互動模式

```
互動 1: 拖視角 (現有)
互動 2: 拖 face 觸發 turn (NEW)
互動 3: 點 face center → CW，長按 → CCW (NEW)
互動 4: 教學模式 hint — 該動的方塊閃光，點對自動執行
```

手機：兩指拖視角，一指拖 face turn，雙擊 reset 視角。

## 第 19 輪：邊界情境

```
自動存檔 — 每完成一 step 存到 localStorage
回來時 — 「歡迎回來！繼續上次嗎？」
連續登入獎勵 — 「連續 3 天學習！」
意外重整 — wizard 不 lost progress
離線使用 — Service Worker cache + precomputed tables → 完全可用
```

## 第 20 輪：技術整合計劃

新 branch `feature/kid-friendly`。

新 component：
- WelcomePage / ModeSelector
- Wizard / WizardChapter
- Cubie / CubieDialog
- ChapterProgress / StarRating
- HintSystem / SoundManager / Confetti
- ChallengeMode

修改既有：
- Cube3D 加 highlight + 觸控 face turn
- Player 在 wizard 隱藏 Speed
- store 加 wizard slice (chapter, step, stars, sound, mascot)

技術選擇：
- 動畫：framer-motion
- Confetti：react-confetti
- 字體：Quicksand + Noto Sans TC
- 音效：base64 short clips

實作順序 (~11 commit, ~25 小時)：
1. WelcomePage + ModeSelector
2. Cubie + dialog + 表情
3. Wizard 框架 + Ch1
4. Ch2-9 一次一章
5. Star/progress 系統
6. Hint 系統
7. 音效
8. 慶祝特效
9. 觸控 face turn
10. 無障礙 / 色覺輔助
11. 整合測試 + Polish

---

# 視覺設計探索 (Round 21-30) — 套用 frontend-design skill

第一輪 KF#1-#11 實作後，使用者明確指出視覺不夠「活潑」、Cubie 不像精靈、配色亂。
呼叫 `frontend-design` skill 後重新做 visual direction。

## 第 21 輪 — 第一版「Saturday Morning Toy Box」的問題

剛 commit 的 Fredoka + cream/sun/candy 配色其實還是落入 AI slop：
- 跟所有兒童 app 公式相同 (Duolingo / Khan Academy / IXL 都這樣)
- Fredoka 已被用爛
- 沒有 atmosphere (背景只有 dot pattern)
- Cubie 還是「正方形 + 兩眼」標準擬人化

## 第 22 輪 — 8 種美學方向

| # | 方向 | Pros | Cons |
|---|---|---|---|
| A | 80s Memphis 派 | Distinctive、適合裝飾 | 對小孩可能太「設計」 |
| B | 日系 Kawaii | 普世可愛 | 太常見 |
| C | 童書水彩 | 有溫度 | 數位實作難 |
| D | Risograph 印刷 | 質感獨特、冷門 | 對讀字壓力大 |
| E | Y2K 玩具感 | Nostalgic for 家長 | 小孩沒共鳴 |
| F | 像素 8-bit | 有型 | 字太小 |
| G | Pop-up 紙模 | 跟 cube 主題契合 | 動畫實作中等 |
| H | Crayon 蠟筆 | 親近感 | 凌亂 |

## 第 23 輪 — 配對「魔術方塊」這個主題

D Risograph、G Pop-up 紙模 跟 cube「6 個正方形面摺出來」呼應度最高。最終選 **G Pop-up 紙模玩具書**。

## 第 24 輪 — 風格定錨：「立體紙模玩具書 Pop-up Paper Toybook」

- 油紙底 + 細噪點
- 厚紙板 4-6px 黑色描邊
- 卡片有 6-10px offset 陰影 (硬 offset 不糊)
- Cubie 是「紙摺方塊」帶活頁眼睛
- 按鈕像「貼紙」帶撕邊
- 慶祝特效是「彩色紙片噴出」

## 第 25 輪 — Design tokens

```css
--paper:        #FBF4DD
--paper-deep:   #EFE2B8
--ink:          #1A1A2E
--marker-red:   #E63946
--marker-yellow:#FFD23F
--marker-blue:  #2A9D8F
--marker-pink:  #F08FC0
--marker-grass: #95C623
--marker-purple:#6A4C93

--font-display: 'Bagel Fat One' (圓胖、原創、避開 Fredoka)
--font-body:    'Lexend'
--font-mono:    'JetBrains Mono'

--card-offset:      6px 6px 0 var(--ink)
--card-offset-deep: 10px 10px 0 var(--ink)
```

## 第 26 輪 — Cubie 重做：紙摺小精靈

- 視覺尺寸 160-200px on welcome
- 紙摺剪下感 (粗黑邊 + 內部色塊)
- 眼睛是「貼紙」(白圓 + 黑點) 偶爾眨
- 嘴巴跟 typewriter 字符同步張合 (talking)
- 兩隻「紙手」用線連接，會浮動 + 偶爾揮手
- 旁邊散落彩色紙片裝飾
- idle: bob 3s + blink 4-7s 隨機 + 偶爾 wiggle
- celebrating: 整個彈跳 + 紙片噴出

## 第 27 輪 — Welcome composition (打破網格)

- 標題用 BIG display 字 + 下劃線手繪感
- Cubie 大且偏右下，對話框右側
- 3 張卡片各微傾不同角度 (-2°, +1°, -1°)
- 散落小裝飾 (星星 / 雲朵 / 紙片) 不搶戲

## 第 28 輪 — 動畫策略：編排載入

```
0.0s 油紙底淡入
0.2s 標題從上滑入 + bounce
0.4s Cubie 從右下角彈入 + 旋轉
0.6s Cubie 對話框 typewriter 開始
0.8s 卡片 1 淡入 + 微傾
1.0s 卡片 2 淡入
1.2s 卡片 3 淡入
1.5s 散落星星 fade in
```

卡片 hover: 上移 4px + 影子加深 + emoji wiggle
卡片 click: scale-down → bounce-up → 換頁

## 第 29 輪 — Background 三層 atmosphere

```
Layer 1 (底): 油紙紋理 (SVG noise 或 base64 PNG, 8% 透明)
Layer 2 (中): cream → 較深 cream 微 radial 漸層
Layer 3 (上): 散落 SVG 裝飾 (星/雲/squiggle), 30-50% opacity, 慢慢飄
```

## 第 30 輪 — 視覺實作計劃

1 commit: design tokens + fonts + 紙紋 + 裝飾 component
2 commit: Cubie 重寫 (紙摺、紙手、揮手、嘴巴 talking)
3 commit: WelcomePage 重新排版 (傾斜卡片、散落裝飾、載入編排)
4 commit: Wizard 配合新 aesthetic
5 commit: Confetti 改紙片感
6 commit: 微調 + 修 Cubie tests

---

# 兒童學習效果探索 (Round 31-40)

視覺定下後，再用「兒童學習設計」角度檢視內容是否真的能教會小孩。

## 第 31 輪 — 認知負荷 (Cognitive Load)

8-12 歲工作記憶 5-7 chunks。每畫面同時要記不超過 1 目標 + 1 動作 + 1 獎勵。
當前 wizard 一頁顯示 7+ 元素，已滿。

對策：
- 同時只顯示 1 個焦點，其他 dim
- 「下一步」按鈕變超大
- hint 預設折疊

## 第 32 輪 — 注意力長度

10-15 分鐘專注上限。對策：
- 章節步上限 8 步
- 每章末「休息一下」彈窗
- 連續 20 分鐘出現 Cubie「累了，要休息嗎？」
- 不允許跳整章

## 第 33 輪 — Scaffolding 鷹架

當前直接給 `R U R' U'` 太抽象。應該：
- 階段 1 具體：「右邊那層往上 → 上面往左...」
- 階段 2 符號化：「這叫 sexy move = R U R' U'」
- 階段 3 抽象：「換你做 sexy move」

## 第 34 輪 — 練習循環 I do / We do / You do

**最大缺陷**：當前只有「I do」(playMoves 演示)。要加：
- **We do**: 顯示要按的按鈕，使用者跟著按
- **You do**: 不顯示提示，自己試。對 → ★，錯 → 鼓勵

## 第 35 輪 — 錯誤恢復 (零懲罰)

❌ 紅 X / 「錯了！」/ 失敗音效 / 倒數計時
✅ Cubie confused 但不批判 / 「咦～再試試」 / 自動倒回 / 連錯 3 次主動示範

## 第 36 輪 — 記憶輔助

公式給名字 + 節奏 + 比喻：
- R U R' U' = **Sexy Move** 「像跳舞節拍」
- F R U R' U' F' = **黃十字咒語** 「F 抱住 sexy 再放開」
- R U R' U R U2 R' = **Sune** 「R-U-R'-U + R-U2-R' 兩半記」
- L F L' F' = **Left Sexy** 反手版

每章學公式：給名字 + 節奏 + 比喻 + 重複呼名

## 第 37 輪 — 家長/老師視角

`/parents` 隱藏路徑：章節 PDF 印出、進度報告、無廣告無註冊
`/teachers` 隱藏路徑：60min 課堂教案、challenge ideas、評量 rubric

## 第 38 輪 — 動覺學習

當前只有看跟讀。加入：
- 拖 face 真的轉
- 點 cube 高亮方塊自動執行
- Cubie 講「右邊那層」時自動高亮 R 面
- 速度滑桿讓小孩「玩」demo
- 強烈推薦實體方塊：「拿你的方塊跟我一起做！」

## 第 39 輪 — 社群感 (無登入)

- 「我學會了！」生成圖片 (Cubie + 星數 + 章節) 分享
- 「挑戰朋友」生成 cube 狀態連結
- 本地匿名排行
- ❌ 全球排行 / PvP / 留言 / 邀請拿星 dark pattern

## 第 40 輪 — 動機：內在 vs 外在

✅ Mastery「你做到了！」/ Autonomy「換你解給 Cubie 看」/ Social purpose「教家人」
❌ 金幣兌換 / 寶箱 / Loot box

當前 9 章 27 ⭐ OK 是 mastery，但加：
- 9 ⭐ 解鎖「教給家人」分享功能
- 18 ⭐ 解鎖「自由模式 + Timer」
- 27 ⭐「魔方大師」徽章 + 證書 PDF

## 30→40 整體調整建議

| 學習角度發現 | 影響的實作 |
|---|---|
| 認知負荷 (#31) | Wizard footer 簡化，下一步變超大 |
| 注意力 (#32) | 加休息彈窗 |
| Scaffolding (#33) | 公式之前先「具體文字」步驟 |
| **I/We/You do (#34)** | **最大缺**: 加 We do (跟做) + You do (考試) 步驟 |
| 錯誤恢復 (#35) | Hint 系統避免懲罰用語 |
| 記憶輔助 (#36) | 公式 step 加「綽號 + 節奏 + 比喻」 |
| 家長/老師 (#37) | 隱藏 /parents /teachers 頁 |
| 動覺 (#38) | 觸控 face turn + 高亮方塊 |
| 社群 (#39) | 「我學會了」分享圖片生成 |
| 內在動機 (#40) | 解鎖「教家人」分享 / 證書 PDF |

---

# 整體 UI + 功能面再檢視 (Round 41-50)

## 第 41 輪 — IA 重檢：取消三模式分法

當前 wizard / free / challenge 對小孩太抽象。改為**一條龍 progressive unlock**：
新手只看到「想學嗎？想！」按鈕，9 ⭐ 後解鎖自由模式，18 ⭐ 解鎖挑戰。

## 第 42 輪 — 真正的前 30 秒

```
0-3s  cube 飛入 + 自己轉
3-6s  Cubie 滑入「嗨～看到我嗎？」
6-10s Cubie「想學解這個嗎？」+ BIG 「想！」按鈕
10s   點下 → Ch1 直接開始
```
跳過 mode 選單，直接帶進去。

## 第 43 輪 — Progressive Disclosure

Wizard 元素按需要才出現：
- 階段 1: 只 Cubie + typewriter
- 階段 2: 字打完才浮現「下一步」按鈕
- 階段 3: 5 秒不點，hint 浮現
- 階段 4: 長按下一步，「跳過此章」menu

## 第 44 輪 — Friction 稽核

最大痛點：**Solver 載入 10s** 但 Wizard 早期不需要。
對策：lazy load solver / 智慧 typewriter 速度 / 動畫可跳過

## 第 45 輪 — Feedback Loops

每個動作該有 視覺 + 聲音 + (手機) 觸覺反饋。當前 silent 多。
特別缺：聲音、haptic、錯誤反饋。

## 第 46 輪 — Mobile (手裡有實體方塊)

真實場景：左手實體方塊，右手手機。對策：
- 大字大按鈕，cube 不用拖視角
- **Killer**: 相機掃描方塊狀態 (鏡頭認識顏色)
- 語音控制「下一步」
- 底部超大「下一步」佔 1/3 螢幕

## 第 47 輪 — Voice-over / TTS

7-9 歲不熟字。Web Speech API 朗讀 Cubie 對話。預設關但顯眼開關。字大小 3 級可調。

## 第 48 輪 — 語系

先中文但所有 string i18n key 化，未來加英文低成本。簡單 t() lookup，不用 i18next。

## 第 49 輪 — 效能預算

當前估 ~700KB gzip。手機 4G 3 秒。對策：lazy load solver / F2L / 拆 chunk。
目標 wizard 首屏 < 200KB。

## 第 50 輪 — Killer Feature

差異化最強：**「拿手機拍方塊，AI 教你下一步」**。
9 格 × 6 面 = 108 sticker 顏色辨識。對話引導拍 6 面。中等難度，~3 天工作量。
小孩會跟同學講「你拿手機拍我的方塊它告訴你怎麼解！」

## 41-50 整體調整

| 輪 | 影響 |
|---|---|
| 41 IA | 取消 mode 選單，progressive unlock |
| 42 第一 30s | cube 主動出現，跳過選單直接 Ch1 |
| 43 揭露 | wizard 元素分階段出現 |
| 44 friction | lazy load solver |
| 45 反饋 | 加聲音 + haptic |
| 46 mobile | 相機掃描 + 語音控制 |
| 47 TTS | Web Speech API 朗讀 |
| 48 i18n | string key 化 |
| 49 perf | code split |
| 50 killer | **AI 拍照辨識** |

---

# 進度與下一步 (KF#12 完成後)

## 已完成 (feature/kid-friendly branch)

- KF#1-11: 基礎 wizard / Cubie / 9 章節 / Confetti / Stars / localStorage
- **KF#12: Pop-up Paper Toybook 視覺套用** ← 剛完成 ccc868f
- 424 tests green
- doc 50 輪設計探索

## Saturday Morning Toy Box → Pop-up Paper Toybook 變化

| 之前 | 之後 |
|---|---|
| Inter/Tailwind 灰藍 | Bagel Fat One + 紙紋奶油 + ink/marker 配色 |
| Cubie 96px 平面 SVG | Cubie 140px 紙摺感 + 揮手 + talking |
| 純色按鈕 hover 變色 | 厚邊 sticker + offset shadow + wiggle |
| 純漸層背景 | 紙紋 dot grid + 散落漂浮裝飾 |
| Confetti 純圓+方 | Confetti marker 色 + ink 描邊 + 紙條 |
| Wizard 透明卡 | Wizard 白底厚邊 + sticker 按鈕 |

## 下次 session 優先順序 (依 #41-50 整體分析)

依「最痛點優先」+「執行成本」排序：

| 順 | Task | 何種痛點 | 工時 |
|---|---|---|---|
| 1 | **打開瀏覽器 + Playwright 截圖看實際** | 50 輪都是猜，要看 | 30 分 |
| 2 | **#41+#42 IA 簡化 + 第一 30 秒** | 三模式對小孩太抽象 | 1 commit |
| 3 | **#34 We do/You do 練習階段** | 教學最大缺陷 | 3-4 commit |
| 4 | **#36 公式記憶 hooks (sexy/sune 命名+節奏+比喻)** | 內容增強 | 純文案 1 commit |
| 5 | **#45 聲音 + haptic** | 反饋活潑感 | 1 commit |
| 6 | **#43 progressive disclosure** | 認知負荷 | 1 commit |
| 7 | **#50 AI 拍照** | killer feature 但要基礎穩 | ~3 天 |

## Branch 狀態

`feature/kid-friendly` 跟 `main` 大幅分歧。
另一個 branch `feature/ui-cplus` 也未 merge。

決策待定：
- merge ui-cplus 到 main? 還是廢掉？
- merge kid-friendly 到 main? 還是 main 也保留進階版？

---

# Session N+1 進度 (2026-04-14, 嚴格 TDD)

## 已完成

| Slice | Commit | Test Δ | TDD |
|---|---|---|---|
| KF#13 mobile WelcomePage + wizard camera | a5e41fc | — | 視覺驗證 |
| KF#14 IA 簡化 + 首訪直入 wizard | 93258ef | +5 | ✓ |
| KF#15-1 requireMoves 機制 | 330ca44 | +2 | ✓ |
| KF#15-2A Ch2 6 面 you-do | 5d46357 | +6 | ✓ |
| KF#15-2B ↻ 再試一次 | 746be56 | +2 | ✓ |
| KF#15-2C ✓ 太棒了 chip | 9833c91 | +3 | ✓ |
| KF#15-2D Ch4/6/7 公式 you-do | 60c07f2 | +3 | ✓ |
| KF#36 Ch5 記憶口訣 | dd04e0c | — | 內容 |

**8 commits、+17 tests、441 全綠 (424 → 441)**

## 行為重大變化

- **首訪 (totalStars=0)** → 跳過 WelcomePage，直接進 Wizard Ch1
- **WelcomePage** → 從 3-card 選單改成單一「繼續學習」CTA + 章節列表
- **自由玩 / 挑戰** 鎖住 🔒 直到全 9 章解完
- **Wizard practice step** → `requireMoves: string[]` 鎖 Next、↻ 再試一次、✓ 太棒了 chip
- **Ch2 流程** → demo → you do (×6 面) 共 15 step
- **Ch4/6/7 結尾** → 公式 you-do 練習關卡

## 不做 / 待定

- **~~#50 AI 相機掃描~~** — 已決定不做
- **#45 聲音 + haptic** — 需要決定要哪幾種音效（成功/失敗/Cubie 講話）和音色風格
- **#43 progressive disclosure** — 等真實小孩試用回饋再做
- **Ch3/5/8 you-do 練習** — 公式太長 (8-10 moves)，鍵盤打字不合理。等加上虛擬鍵盤再做

## 下次 session 候選

1. 真實使用者測試（找 8-12 歲小孩試 Ch1-2）
2. #45 聲音回饋（決定音色後做）
3. 虛擬鍵盤 (移動裝置必需，目前 Ch2 you-do 在手機上不能用)
4. Branch 決策：kid-friendly + ui-cplus 怎麼處理
