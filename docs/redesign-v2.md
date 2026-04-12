# Redesign v2 — 10 輪迭代後最終版

> 對象：8-12 歲。風格：活潑。目的：把 v1 (Pop-up Paper Toybook) 推到下一個層次。
> 寫於 2026-04-14，base 是真實 WebFetch 競品調研 + 30 項功能盤點 + **10 輪自我推翻**。

---

## 🌐 競品研究摘要 (real fetch, 2026-04)

5 大 best practice：stage gating、動畫 3D + 件高亮 + 箭頭、顏色優先 notation 後到、<2 分鐘小段 + 中間練習、間隔複習 trainer。

3 大反 pattern：notation-first、靜態圖 + 大段文字、PDF 主 artifact。

3 個沒人做的：件分解教學 (centers/edges/corners 各自關卡)、練習成功偵測 + 失敗容忍、行動裝置原生 keypad。

完整研究見 [iteration log](#iteration-log) sources 區。

---

## ✅ 最終 plan（10 輪迭代後）

### 設計鐵律

1. **Mobile-first**：手機 390×844 是 spec，桌機 fallback
2. **零鍵盤依賴**：所有 move 透過螢幕觸控
3. **每 90 秒一次小成功**
4. **失敗即解釋**，不是「再試一次」
5. **零黑暗 pattern**：streak 用週計、無「你失去 streak」內疚提示
6. **聲音 opt-in**：default 靜音，第一次播放前問
7. **沒爸媽面板 (v2 範圍外)**：保留資料但不另開 UI
8. **節制 aesthetic 投資**：視覺定一次，所有力氣放交互

### Information Architecture (rev. 4)

```
/                ← Home：當前進度卡 + 「下一步」單一 CTA + 「玩玩看」次要入口
/lesson/:n       ← 一節課（取代 wizard）
                   每節內含 1-N 個 concept，每 concept 用 phase 子集
/sandbox         ← 自由玩，3D + contextual keypad
/review (條件式) ← 「複習」入口，只在有 due item 時露出，否則隱藏
```

**砍除**：
- 整個 advanced mode (AppMain + 4 tab + 30 features)
- challenge mode dead code
- /parent dashboard
- /practice 頂層入口（改為條件 /review）

### 章節結構 (rev. 3)

不再用「6 章」這種隨便的數字。改成 **skill graph**：

```
S1 認識魔方 (concepts: 中心固定、edge piece、corner piece)
   ↓
S2 6 種基本轉法 (concepts: U/D/L/R/F/B 各一)
   ↓
S3 白色十字 (concepts: 白邊塊定位、顏色對齊)
   ↓
S4 完成第一層 (concepts: 白角塊、sexy move)
   ↓
S5 完成第二層 (concepts: 邊塊插入、左右對稱公式)
   ↓
S6 黃色十字 (concepts: F R U R' U' F')
   ↓
S7 黃色面 (concepts: sune)
   ↓
S8 最後對齊 (concepts: A perm, U perm)
```

8 個 skill node，但 **UI 上只露出「下一個」**。Skill graph 是資料結構，不是給小孩看的地圖（小孩會被 8 個格子嚇到）。

### Concept 教學 phase（rev. 3，每個 concept 自選）

不再強制 4 phase。每個 concept 配最少需要的 phase：

| Phase | 用途 | 範例 |
|---|---|---|
| **show** | I do — 動畫 + Cubie 解說 | 「中心是固定的喔」 |
| **walkthrough** | We do — 慢動作逐步解釋 | sexy move 一步一步 |
| **guided** | You do — face pulse 高亮提示 | 你來轉 R |
| **free** | You do — 沒提示，做對才過 | 完整公式自己跑 |

像 Ch1「認識魔方」只需要 show；像 sexy move 需要 show + walkthrough + guided + free；像 sune 需要 show + walkthrough + free。

### Move 互動（rev. 5）

**MoveKeypad** 元件，手機與桌機通用：
- 6 面 × 3 變化 = 18 鍵的 grid
- **contextual 顯示**：只在 phase=guided/free 才出現；show/walkthrough 不出現
- guided 時，下一個該按的鍵 pulse highlight
- 桌機保留鍵盤快捷（小寫=CW、大寫=CCW），但 keypad 是主介面

**3D cube 提示**（rev. 5 改）：
- ❌ ghost arrow（技術太硬，risk 高）
- ✅ **face pulse highlight**：guided phase 時，目標 face 邊緣脈動發光（CSS / 簡單 shader）
- arrow 列入 v2.5 polish

### Cubie 2.0（rev. 4，砍）

砍 lookAt 跟眼睛追游標（炫但工程量爆炸）。

保留：
- 新增 `gesture: 'point' | 'thumbsup' | 'idle'`（point 用在「請按這個鍵」）
- 對「轉對 / 轉錯」反應：對 → eye brighten + bounce；錯 → confused + 自動 undo + 「我們倒回來囉」

### 視覺系統（rev. 1，大砍）

**保留 v1 Pop-up Paper Toybook**。**不換手繪 Cube Notebook**。

理由：v1 已經夠有辨識度（Bagel Fat One + offset shadow + 紙紋），重投資手繪會吃 1-2 週工期但收益邊際。把那些時間放交互 + 內容深度。

只做兩個小升級：
- 字體微調：保留 Bagel Fat One，body 改 **Comfortaa** 比 Lexend 更圓潤（手機讀起來軟）
- 新增鉛筆 dot grid 背景（CSS data URI，0 工程量）

### Streak（rev. 8）

- **以週計**，不是日計
- 顯示「這週玩了 X 次」，不是「連續 X 天」
- 沒有「你失去了！」紅字
- 不影響任何解鎖

### 聲音（rev. 6）

- default 靜音
- 第一次成功 chip 出現時，旁邊小喇叭 icon 閃 → 點才開
- 5 個 base64 短音效：成功、失敗、Cubie 講話、轉動、章節完成
- TTS 中文朗讀列入 v2.5

### Failure-tolerant（rev. 3 強化）

- 點錯 → cube 真的轉錯 → Cubie 「啊這樣會弄壞，倒回來」→ **2 秒後自動 undo + 重入該 phase**
- 連錯 3 次 → Cubie 主動降階「我們先看一次」→ 跳回 show phase
- guided phase 永遠有「💡 看一次提示」5 秒冷卻
- guided 永遠有「↻ 重來」(無冷卻)
- 沒有「跳過」（這年齡跳過就不會再回來）

### Sandbox 何時露出（rev. 7）

從 Home 永遠可見，但**第一次點才出 onboarding**：「想自己玩？我幫你打亂喔」+ Cubie 揮手。避免小孩跳過 lesson 直接玩。

### Roadmap（rev. 9，無時間單位）

按 commit 量 + 依賴順序：

**MVP slice (v2.0)** — 「能用」最低標準
- M1 砍 advanced mode (AppMain + 三個 Input + CaseLibrary + Player 等)
- M2 MoveKeypad 元件
- M3 接 MoveKeypad 進 Wizard 取代鍵盤依賴
- M4 phase 結構重構（show/walkthrough/guided/free）
- M5 face pulse highlight（guided phase 視覺提示）
- M6 Cubie 2.0 gesture + 對 / 錯反應
- M7 失敗 → 自動 undo + 降階
- M8 Sandbox 頁面（3D + contextual keypad）
- M9 Streak（週計）
- M10 章節結構由「9 章固定」改成「skill graph + 露 next」

**v2.1 slice** — 增添活潑感
- A1 5 個音效 base64 + opt-in toggle
- A2 鉛筆 dot grid 背景
- A3 Comfortaa 字體 swap
- A4 hint cooldown 系統 + 元件
- A5 章節完成成就頁（big confetti + 小報告）

**v2.2 slice — 3D cube polish**（使用者要求 2026-04-14 加）
- C1 cubie bevel 圓角 + 黑描邊 outline
- C2 pulse 動畫（useFrame sin 波動）
- C3 面字母 toggle (U/D/L/R/F/B)
- C4 idle 慢轉
- C5 MeshStandardMaterial → MeshLambertMaterial
- C6 ghost arrow（3D 弧形箭頭，取代/補強 face pulse）

**v2.5 候選**（user 試用後決定）
- v25-2 TTS 中文
- v25-3 Cubie 眼睛追游標
- v25-4 /review spaced repetition
- v25-5 父母面板

### 風險（rev. 9 重整）

| 風險 | 緩解 |
|---|---|
| 砍 advanced mode 破很多 test | 切到 feature/kid-friendly v2 branch；advanced 留 main |
| MoveKeypad 跟 cube 搶版面 | contextual 顯示 + cube 在 guided phase 縮 70% 高度 |
| face pulse 在 R3F 實作 | 寫成 mesh emissive 動畫、不是 post-process |
| 內容寫不完 | MVP 只 polish S1+S2+S6（黃十字最有教學需求），其他章用現有內容過 |
| streak 鼓勵變壓力 | 週計 + 0 內疚提示 |
| 8 個 skill node 太多 | UI 永遠只露 next，地圖收在「章節進度」折疊 |

### 待 user 決定

1. **advanced mode** 怎麼處理？（建議：feature/kid-friendly-v2 branch 砍乾淨；main 保留進階 — 兩 branch 並存）
2. **內容 polish 範圍**：MVP 是只 polish S1+S2+S6，還是全 8 個？
3. **聲音** opt-in 還是 default-on？（建議：opt-in）
4. **Cubie TTS** 是否進 v2.0 或留 v2.5？

---

## 📋 Tasks 對照

見 task system 編號 RD2-M1 ~ M10（MVP）+ A1 ~ A5 (v2.1) + v25-* (v2.5)。

---

## 🔁 Iteration Log

每輪做：(a) 列前一輪 plan 的 3 個最大弱點，(b) 提替代，(c) 取捨，(d) 改 plan。

### Round 0 → Round 1
**v0 (one-pass, 第一個 commit)**：寫了 10 個面向（殘酷現況、對象、教學法、IA、Cubie、視覺、頁面、元件、缺失、roadmap）一次掃完。

**v0 弱點**：
- W1 「Cube Notebook 手繪視覺」是 v1 紙感的延伸不是革新，吃工期但收益薄
- W2 「6 章」這個數字憑感覺不憑證據
- W3 4-phase (I/we/you-guided/you-free) 套到所有 concept 太僵硬

**Round 1 決策**：
- 視覺：保留 v1 Pop-up Paper Toybook，只字體微調 + dot grid，工程量極少
- 章節：改成 skill graph（資料結構），UI 只露下一個
- Phase：每 concept 自選需要的 phase 子集

### Round 1 → Round 2
**Round 1 弱點**：
- W1 skill graph 對 8 歲是抽象概念，「我在哪一格」會迷
- W2 phase 自選聽起來好，但「誰來決定哪個 concept 配哪些 phase」沒寫
- W3 Cubie 2.0 (point/look/react) 三個動作工程量沒估

**Round 2 決策**：
- skill graph 資料結構保留，但 UI 只露 next；地圖收在「章節進度」折疊（只給已解過的看）
- phase 配置寫死在 `wizardChapters.ts` 的 concept data 裡，每個 concept declarative 列出
- Cubie 2.0：砍 lookAt（眼追游標）— 太炫太貴。保 gesture + 對錯反應

### Round 2 → Round 3
**Round 2 弱點**：
- W1 spaced repetition / practice 入口假設小孩會回來 — 8 歲不可靠
- W2 失敗容忍只說「再試一次」太弱，沒講具體
- W3 沒處理「user 的真實實體 cube state 跟畫面不同」 (advanced 的 ManualInput 砍了，怎辦？)

**Round 3 決策**：
- /practice 改成 /review，**只在有 due item 才露出**；沒 due 就藏
- 失敗具體化：點錯 → 真的轉錯 → 自動 undo（2 秒延遲讓小孩看後果） → 降階
- 實體 cube state：小孩不管實體，wizard 內 cube 永遠虛擬。實體想練回 sandbox 自己亂玩

### Round 3 → Round 4
**Round 3 弱點**：
- W1 /review 條件出現的設計 — 「沒 due 就藏」聽起來好但 sad path（user 想複習找不到入口）
- W2 ghost arrow 技術風險評估太樂觀
- W3 「parent dashboard」放著但沒寫怎麼測 demand

**Round 4 決策**：
- /review：藏起來但 Home 上「章節進度」折疊裡，過關章節旁邊永遠有「再練一次」按鈕。等於 review 入口分散在章節列表內
- ghost arrow：v2.0 拿掉，改用 face pulse highlight。arrow 進 v2.5 candidate
- parent dashboard：v2 砍掉。沒證據說小孩需要被監督，先不做

### Round 4 → Round 5
**Round 4 弱點**：
- W1 MoveKeypad 18 鍵在手機上 cube vs keypad 搶版面
- W2 face pulse 怎麼在 R3F 做沒寫（風險照樣存在）
- W3 「Cubie 對 / 錯反應」沒寫具體 — 是 emotion swap 還是新動畫？

**Round 5 決策**：
- MoveKeypad **contextual 顯示**：只在 phase=guided/free 才掛上；show/walkthrough 沒 keypad，cube 全螢幕
- face pulse：用 mesh emissive 動畫（cube 6 個 face mesh 已存在），不用 post-process。可行
- Cubie 對 / 錯：emotion swap (calm → happy / calm → confused) + 一次性 0.4s bounce/shake。不另畫新動畫

### Round 5 → Round 6
**Round 5 弱點**：
- W1 audio 在計畫上是「opt-in」但 default 設定沒講
- W2 5 個音效用 base64 — 檔案 size、誰選、怎決定？
- W3 streak 改週計，但「週」從哪天起算？UTC？user local？

**Round 6 決策**：
- audio default **靜音**。第一次出 success chip 時，旁邊小喇叭 icon 閃 0.5s。點才開
- 音效：先用 freesound.org CC0 5 個短音效 (~10kB each base64 inline 共 ~50kB)。MVP 過後人類調
- streak 週起算：user local Monday。已 done 用 ✓ chip，未來用空 chip。沒「斷了」紅字

### Round 6 → Round 7
**Round 6 弱點**：
- W1 sandbox 隨時可進，小孩可能跳過 lesson 直接玩
- W2 hint cooldown 5 秒設計 — 太短會被濫用，太長會 frustrating
- W3 「砍 advanced mode 整個」對 main branch 上的 user 太激進

**Round 7 決策**：
- sandbox 第一次點時 onboarding：Cubie「想自己玩？我幫你打亂喔」+ 提示「Lesson 還沒解完，玩玩可以但記得回來學」
- hint cooldown：5 秒 → 「按過後 5 秒不能再按；若再按等於跳到 walkthrough 看一次」。漸進式增量
- branch 策略：v2 redesign 在 `feature/kid-friendly-v2` 新 branch；現有 `feature/kid-friendly` 保留；main 不動

### Round 7 → Round 8
**Round 7 弱點**：
- W1 streak 「Mon-Sun 週計」對小週末玩的小孩沒意義（週日才開始就只有 1 次）
- W2 章節 polish「MVP 只做 S1+S2+S6」— S6 是黃十字最複雜，先做難的不對
- W3 失敗 → 「自動 undo」假設 cube state 可逆 — 連續多步錯了會 undo 多步嗎？

**Round 8 決策**：
- streak：滾動 7 天視窗（過去 7 天玩了幾次），不固定週起算。比較公平
- MVP polish：改成 **S1（認識）+ S2（6 轉法）= 真正的 onboarding 流程**。S6 列入 v2.1
- undo 行為：phase=guided 每一個錯都單步 undo；free phase 錯到底，全 reset 重來

### Round 8 → Round 9
**Round 8 弱點**：
- W1 roadmap 寫「MVP 10 個 milestone」沒排依賴
- W2 「contextual keypad」說只在 guided/free 顯示 — 沒寫怎麼讓小孩知道「現在輪到你」
- W3 Cubie gesture: 'point' 沒寫指什麼怎麼指

**Round 9 決策**：
- 排依賴：M1（砍 advanced）必先；M2（keypad 元件）→ M3（接進 wizard）→ M4（phase 結構）→ M5（face pulse）→ M6（Cubie 反應）→ M7（自動 undo）→ M8（sandbox）→ M9（streak）→ M10（skill graph）。M9/M10 可並行
- 「現在輪到你」訊號：phase 切換時，下方 keypad slide-up 動畫 + Cubie 「換你！」對話。視覺 + 文字 + 動效三重提示
- Cubie point：face=R 時，Cubie 的右手手指方向偏向螢幕右側（CSS rotate 30deg）+ 增加一個 small finger SVG 出現於 hand 末端

### Round 9 → Round 10 (final coherence check)
**Round 9 弱點**：
- W1 整個 plan 沒寫「v2 跟 v1 並存方式」— user 已 ship 的 KF#13/14/15 全部要重做？
- W2 沒寫 testing strategy — TDD 怎麼套到視覺重構
- W3 「skill graph 資料結構」寫了概念但沒寫 schema

**Round 10 決策**：
- v1 vs v2：v2 是 fork from v1，**保留所有 KF#15 practice 機制 + Ch2 內容**。砍的只是 advanced + 重構 IA。已 ship 的 require Moves / 再試一次 / ✓ 太棒了 chip 全部 v2 沿用
- TDD：M1-M3 純 component test (TDD)；M4 phase 結構 (TDD)；M5 face pulse (visual regression via screenshot diff)；M6 Cubie 反應 (component test)；M7 undo (logic test)；M8 sandbox (e2e); M9 streak (logic); M10 skill graph (data + UI test)
- skill graph schema：

```ts
type SkillNode = {
  id: string  // 's1', 's2-u', 's4-sexy'
  parent: string | null  // dependency
  title: string
  concepts: ConceptNode[]
}
type ConceptNode = {
  id: string
  title: string
  message: string
  emotion: CubieEmotion
  // declarative phase config
  phases: Array<'show' | 'walkthrough' | 'guided' | 'free'>
  // for show/walkthrough phases
  demoMoves?: string[]
  // for guided/free phases
  requireMoves?: string[]
  hint?: string
}
```

每 SkillNode 是現有 chapter 的後繼。Concept 是現有 step 的後繼。Schema 完成。

---

### Round 10 自我總結

10 輪後最大改變相比 v0：
1. **視覺投資從「全面手繪換」→「只字體 + 背景小調」**（省 ~10 commit）
2. **章節結構從「6 章寫死」→「skill graph + 露 next」**（更彈性，但 UI 不複雜）
3. **Phase 從強制 4 → 每 concept 自選子集**
4. **Mascot 從「look + point + react」→「point + react」**（砍 lookAt）
5. **Audio 從「default-on」→「opt-in」**
6. **Streak 從「日計可斷」→「7 天滾動視窗」**
7. **/practice → /review 條件出現**
8. **Parent dashboard 砍除**
9. **MVP polish 從 S1+S2+S6 → S1+S2 onboarding**
10. **MVP 順序明確排出依賴 (M1→M10)**

剩下 v2.5 candidate 5 個，等真實小孩試用後決定。

---

## 🔗 Sources (real fetch, 2026-04-14)

- [ruwix.com beginners method](https://ruwix.com/the-rubiks-cube/how-to-solve-the-rubiks-cube-beginners-method/)
- [solvethecube.com](https://solvethecube.com/)
- [jperm.net/3x3](https://jperm.net/3x3)
- [cubeskills.com tutorials](https://www.cubeskills.com/tutorials)
- [easiestsolve.com](https://easiestsolve.com/)
- [iamthecu.be](https://iamthecu.be/)
- [Kids Infinite Learning](https://kidsinfinitelearning.com/course/rubiks-cube-training/)
- [Mathcruise](https://www.mathcruise.com/course/rubiks-cube/)
