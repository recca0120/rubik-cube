# 魔方學園 · Cube Academy

互動式 3D 魔術方塊教學網站，小孩友善 + 速解者進階工作台。

**🔗 線上試玩**: https://recca0120.github.io/rubik-cube/
**🐛 回報問題**: https://github.com/recca0120/rubik-cube/issues

---

## 對象

- **8–12 歲小朋友**：用 Cubie 吉祥物帶學 9 章節層解法（LBL），支援「換你做」互動練習
- **速解者**：全破後解鎖專家工作台，含 CFOP / F2L / PLL 案例庫

## Features

### 🧒 一般模式

- 🎓 **9 章課程** 認識方塊 → 6 轉法 → 白十字 → 白面 → 中層 → 黃十字 → 黃面 → 最後對齊
- 🧩 **互動練習** 每個公式章節末有「換你做」步驟（keypad 高亮 + ghost arrow）
- 🎯 **失敗容忍** 轉錯自動 undo + 💡 提示（5 秒冷卻）+ ↻ 再試一次
- ⭐ **星星 + 🔥 streak**（7 天滾動視窗，零內疚設計）
- 🎮 **自由玩 Sandbox** 完成會灑花慶祝

### 🎓 專家模式（解完全部 9 章解鎖）

- ▶ LBL 逐階段解法播放（Kociemba 優化，平均 ~55 步）
- ⚡ CFOP / F2L / PLL 真案例資料
- ⚖ LBL vs CFOP 對照
- 📚 F2L 41 案例 + PLL 21 案例（SVG mini preview + 搜尋）
- ✍️ 3 種輸入：手動塗色 / 公式 / 相機掃描 6 面

### 設計

- **Pop-up Paper Toybook** aesthetic：方格紙 + Bagel Fat One + Comfortaa + marker palette + 厚黑邊 + offset shadow
- **v2 Cubie** SVG mascot 支援 6 表情 + 3 手勢
- Mobile-first（390×844 spec）

## Development

```bash
pnpm install
pnpm dev         # http://localhost:5173
pnpm test        # 596 unit + 70 invariant
pnpm test:e2e    # 24 Playwright E2E (desktop + Pixel 5)
pnpm build       # production bundle
```

## 品質

| 層級 | 工具 | 覆蓋 |
|---|---|---|
| Unit | Vitest + jsdom + RTL | 596 tests |
| Invariant | Vitest | 70 chapter-content + skill-graph checks |
| E2E | @playwright/test | 24 tests × 2 viewport |
| LBL regression | Vitest | 50 random scrambles, mean ≤ 55 / p95 ≤ 80 |

## 部署

CI 於 `push main` 自動跑 `pnpm test --run` + `pnpm build` + deploy GitHub Pages（見 `.github/workflows/deploy.yml`）。

## 文件

- `docs/ux-redesign-rounds.md` — 50 輪 UX 設計思考
- `docs/redesign-v2.md` — v2 重設計 10 輪迭代
- `docs/expert-redesign.md` — 專家模式 10 輪迭代
- `docs/v3-audit-and-refactor.md` — v3 逐頁評分 + 4×10 輪
- `docs/lbl-roadmap.md` · `docs/ux-teaching-roadmap.md` — 早期 roadmap

## 回饋

發現 bug、想建議新功能、或單純想聊這個 project：**[開 Issue](https://github.com/recca0120/rubik-cube/issues/new)**
