# UX / 教學體驗升級 Roadmap

承接對話中的 3 個觀察 + 我補的 3 個進階項目。

## 背景問題（使用者實測發現）

1. **教學節奏錯**：LBL 教學模式只在「階段之間」暫停，階段內多個 moves 一路播完；使用者看不清每步在做什麼
2. **側欄擠**：Pipeline / 解法分段 / Controls / Player / 18 個 Move 按鈕 / Keyboard hint 全部塞在一個 380px 欄位
3. **解法單一**：只支援 LBL；名詞和 case 沒對齊（其實黃十字/黃面/PLL 就是 CFOP 的 OLL/PLL，但沒顯示 case 名）

## 6 個 Task 清單

| ID | 任務 | 優先度 | 工時 | 依賴 |
|---|---|---|---|---|
| #1 | Mode tabs (Teach / Free Play / Input) | 🔴 高 | 半天 | 無 |
| #2 | 每步暫停模式 (stepByStep) | 🔴 高 | 2 小時 | 無 |
| #3 | 語境化 move annotation（取代 notation 翻譯） | 🔴 高 | 1-2 天 | 無 |
| #4 | OLL/PLL case library 頁 | 🟡 中 | 1-2 天 | 無 |
| #5 | CFOP F2L solver | 🟢 低 | 1 週 | Phase A (已完成) |
| #6 | 多解法切換（LBL/CFOP/Roux/ZZ） | 🟢 低 | 2+ 週 | #5 |

Task 編號對應 TaskList (#25-#30)。

## 實作原則

- **嚴格 TDD**：每 Task 先寫失敗測試再實作
- **每 Task 一個 commit**（或多個合邏輯 commit）
- **先重構再 feature**：做 #1 後面板變清爽，後續 feature 加進來不擠
- **不破壞既有體驗**：現有 229+ tests 要全綠

## 執行順序建議

```
#1 (Mode tabs) → #2 (stepByStep) → #3 (annotation)
                                     ↓
                                   #4 (case library) ← 獨立
                                     ↓
                              #5 (F2L) → #6 (多解法)
```

- 1→3 直接改善教學體驗
- 4 獨立但適合做完 1-3 之後整合
- 5-6 大工程，未來 session

## 與 LBL roadmap 的關係

`docs/lbl-roadmap.md` 是 solver 演算法層的 roadmap（Phase A–H + C'/D'/E/F/G/H）。
本文件是 **UX 層**的 roadmap，跟 solver 演算法獨立。

## 非目標（範圍外）

- 色盲模式
- 完整 i18n（中英完全切換）
- 音效 / 動畫特效
- 多人對戰
- 錄影 / 重播
