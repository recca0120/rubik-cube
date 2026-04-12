import type { CubieEmotion } from './Cubie'

/**
 * Pedagogical phase a step belongs to. Used for UI hints (badge,
 * keypad visibility, auto-advance behavior).
 *
 *   show         — I do. Cubie speaks; cube auto-demos via playMoves.
 *   walkthrough  — We do. Slow, step-by-step explanation.
 *   guided       — You do, with hint. Highlight the next required move.
 *   free         — You do, no hint. Just requireMoves and a keypad.
 */
export type WizardPhase = 'show' | 'walkthrough' | 'guided' | 'free'

export type WizardStep = {
  /** Optional explicit phase. If absent, `inferPhase` derives it from playMoves/requireMoves. */
  phase?: WizardPhase
  emotion?: CubieEmotion
  message: string
  /** Optional hint shown below the dialog. */
  hint?: string
  /** Moves to demo when entering this step (auto-enqueued). */
  playMoves?: string[]
  /** Reset cube to solved when entering this step. */
  resetOnEnter?: boolean
  /**
   * "You do" practice: user must execute these moves (in order) before
   * 下一步 unlocks. Match is against the tail of cubeStore.history so the
   * user can warm up with extra moves.
   */
  requireMoves?: string[]
  /** Highlight a piece-kind set on the 3D cube for teaching. */
  highlight?: 'centers' | 'corners' | 'edges'
  /**
   * Pre-scramble the cube by applying the inverse of this algorithm before
   * the step loads — so the cube starts in a state where the step's playMoves
   * would naturally solve it. Applied AFTER resetOnEnter.
   */
  preScramble?: string
  /**
   * Per-move narrations shown when the cube reaches that move index in the
   * demo playback. Key = 0-based move index; value = the Chinese explanation.
   */
  stepNarrations?: Record<number, string>
  /** Flip the cube upside-down (white→bottom, yellow→top) on step enter. */
  viewFlipped?: boolean
  /** Highlight specific cubies by their (x, y, z) position (F2L pair/slot). */
  highlightCubies?: [number, number, number][]
}

export type WizardChapter = {
  id: number
  /** Skill graph: chapter that must have a star before this one unlocks. null = root. */
  parent: number | null
  title: string
  estMinutes: number
  steps: WizardStep[]
}

export const CHAPTERS: WizardChapter[] = [
  {
    id: 1,
    parent: null,
    title: '認識魔術方塊',
    estMinutes: 5,
    steps: [
      {
        emotion: 'happy',
        message: '嗨！我們先一起來認識魔術方塊吧～',
      },
      {
        emotion: 'calm',
        message: '魔術方塊有 6 個面，每個面有 9 格小方塊。',
        hint: '上、下、左、右、前、後',
      },
      {
        emotion: 'surprised',
        message: '中間那格是固定的！看我轉 → 中心還是在原位。',
        hint: '亮起來的就是 6 個中心，它們永遠不跑～',
        highlight: 'centers',
        playMoves: ['R', "R'"],
        resetOnEnter: true,
      },
      {
        emotion: 'calm',
        message: '8 個角落叫「角塊」，每個角塊有 3 種顏色。',
        hint: '亮起來的就是 8 顆角塊',
        highlight: 'corners',
      },
      {
        emotion: 'calm',
        message: '12 條邊邊叫「邊塊」，每個邊塊有 2 種顏色。',
        hint: '亮起來的就是 12 顆邊塊',
        highlight: 'edges',
      },
      {
        emotion: 'cheering',
        message: '看一下方塊 → 這個角度看得到 3 個面：上、前、右。',
        hint: '接下來的章節都會用這個角度，你記住「白上 / 綠前 / 紅右」',
      },
      {
        emotion: 'celebrating',
        message: '太棒了！你完成第一章了！拿到一顆 ⭐ 囉～',
      },
    ],
  },
  {
    id: 2,
    parent: 1,
    title: '6 種轉法',
    estMinutes: 10,
    steps: [
      { emotion: 'happy', message: '接下來教你 6 種基本轉法！我先示範，然後換你試試看。' },
      { emotion: 'calm', message: 'U = 把上面那一層轉一下，我做給你看～看好：上面整圈會旋轉。', hint: 'U 代表 Up，上面那一層', playMoves: ['U'], resetOnEnter: true },
      { emotion: 'cheering', message: '換你！點下面的 U 鍵，轉一下上層。', hint: '黃色鍵 = 上層', requireMoves: ['U'], resetOnEnter: true },
      { emotion: 'calm', message: 'D = 轉下面那一層。注意：上面一排不動！', hint: 'D 代表 Down，下面那一層', playMoves: ['D'], resetOnEnter: true },
      { emotion: 'cheering', message: '換你！點 D 鍵，轉一下下層。', hint: '黃色鍵轉上層，白色鍵轉下層', requireMoves: ['D'], resetOnEnter: true },
      { emotion: 'calm', message: 'R = 轉右邊那一層。左、中兩排不會動喔～', hint: 'R 代表 Right，右邊那一層', playMoves: ['R'], resetOnEnter: true },
      { emotion: 'cheering', message: '換你！點 R 鍵，轉一下右邊。', hint: '紅色鍵是右邊那層', requireMoves: ['R'], resetOnEnter: true },
      { emotion: 'calm', message: 'L = 轉左邊那一層。R 的鏡像～', hint: 'L 代表 Left，左邊那一層', playMoves: ['L'], resetOnEnter: true },
      { emotion: 'cheering', message: '換你！點 L 鍵，轉一下左邊。', hint: '紫色鍵是左邊那層', requireMoves: ['L'], resetOnEnter: true },
      { emotion: 'calm', message: 'F = 轉前面那一層。就是你最正對的那一面～', hint: 'F 代表 Front，面向你那一層', playMoves: ['F'], resetOnEnter: true },
      { emotion: 'cheering', message: '換你！點 F 鍵，轉一下前面。', hint: '藍綠色鍵是面向你那層', requireMoves: ['F'], resetOnEnter: true },
      { emotion: 'calm', message: 'B = 轉後面那一層。F 的反面，看不到那層～', hint: 'B 代表 Back，背對你那一層', playMoves: ['B'], resetOnEnter: true },
      { emotion: 'cheering', message: '換你！點 B 鍵，轉一下後面。', hint: '草綠色鍵是背對你那層', requireMoves: ['B'], resetOnEnter: true },
      {
        emotion: 'surprised',
        message: '每個轉法還可以「反過來」或「轉兩次」喔！先看 R\'（R 加一撇）= 反過來轉。',
        hint: '看：先 R 正轉，再 R\' 逆轉回來',
        playMoves: ['R', "R'"],
        resetOnEnter: true,
      },
      {
        emotion: 'cheering',
        message: '換你！點 R\' 按鈕，把右邊反過來轉一下。',
        hint: '紅色的 R\' 鍵（加一撇的那個）',
        requireMoves: ["R'"],
        resetOnEnter: true,
      },
      {
        emotion: 'calm',
        message: 'R2 = 轉兩次一口氣到底。看：',
        hint: 'R2 就是一次轉 180 度',
        playMoves: ['R2'],
        resetOnEnter: true,
      },
      {
        emotion: 'cheering',
        message: '換你！點 R2 按鈕試試。',
        hint: '紅色的 R2 鍵（加 2 的那個）',
        requireMoves: ['R2'],
        resetOnEnter: true,
      },
      { emotion: 'celebrating', message: '太厲害了！你學會 6 種轉法 + \' 和 2 notation 了！⭐⭐' },
    ],
  },
  {
    id: 3,
    parent: 2,
    title: '白色十字',
    estMinutes: 15,
    steps: [
      { emotion: 'happy', message: '第三章開始嘍～ 我們要做出「白色加號」！', resetOnEnter: true },
      { emotion: 'calm', message: '把白色那面朝上看。中間那個白色不會動，對吧？' },
      { emotion: 'calm', message: '我們要把 4 個有白色的邊塊，放到中間白色的旁邊。', hint: '邊塊 = 兩顏色的長條塊' },
      {
        emotion: 'calm',
        message: '比如「白色 + 紅色」邊塊，要放在白色中心 + 紅色中心之間。',
      },
      {
        emotion: 'cheering',
        message: '看我示範打亂：F R U\' B L2',
        hint: '仔細看白邊跑去哪',
        resetOnEnter: true,
        playMoves: ['F', 'R', "U'", 'B', 'L2'],
      },
      {
        emotion: 'cheering',
        message: '換你跟著做一次：F R U\' B L2',
        hint: '依序點：F → R → U\' → B → L2',
        resetOnEnter: true,
        requireMoves: ['F', 'R', "U'", 'B', 'L2'],
      },
      {
        emotion: 'calm',
        message: '實際解白十字要依打亂狀況想，先感受一下手感！',
      },
      { emotion: 'celebrating', message: '太強了！白十字你會了 ⭐' },
    ],
  },
  {
    id: 4,
    parent: 3,
    title: '白色那一面',
    estMinutes: 15,
    steps: [
      { emotion: 'happy', message: '第四章！要把整個白色面變整齊。', resetOnEnter: true },
      { emotion: 'calm', message: '剛才我們做了白十字，現在要放 4 個白色「角塊」。', hint: '角塊 = 三顏色的小方塊' },
      {
        emotion: 'surprised',
        message: '神奇公式：R U R\' U\' (重複個 1~5 次)',
        hint: '速解圈叫它「sexy move」💃',
      },
      {
        emotion: 'calm',
        message: '我做給你看～ 這就是 sexy move 一次！',
        resetOnEnter: true,
        playMoves: ['R', 'U', "R'", "U'"],
      },
      {
        emotion: 'cheering',
        message: '重複 6 次會回到原樣！是不是很神奇～',
        resetOnEnter: true,
        playMoves: ['R', 'U', "R'", "U'", 'R', 'U', "R'", "U'", 'R', 'U', "R'", "U'", 'R', 'U', "R'", "U'", 'R', 'U', "R'", "U'", 'R', 'U', "R'", "U'"],
      },
      {
        emotion: 'cheering',
        message: '換你做一次 sexy move：R U R\' U\'',
        hint: '鍵盤輸入: r u Shift+R Shift+U（大寫=反轉）',
        resetOnEnter: true,
        requireMoves: ['R', 'U', "R'", "U'"],
      },
      {
        emotion: 'calm',
        message: '把每個白角放到該去的角落上方，反覆 sexy move 直到歸位。',
      },
      {
        emotion: 'celebrating',
        message: '你學會 sexy move 了！⭐ 實際解白角時，反覆對每個角做 sexy move 直到歸位即可。',
        resetOnEnter: true,
      },
    ],
  },
  {
    id: 5,
    parent: 4,
    title: '中間一圈',
    estMinutes: 15,
    steps: [
      { emotion: 'happy', message: '中層！4 個沒有白也沒有黃的邊塊，要放到中間。', resetOnEnter: true },
      { emotion: 'surprised', message: '把方塊翻過來！白色朝下，黃色朝上。看，cube 翻過來了～', hint: '真方塊也一起翻，才跟螢幕一致', viewFlipped: true },
      { emotion: 'calm', message: '兩個對稱公式：「右插」跟「左插」。像把鑰匙塞回口袋 🔑', hint: '邊塊要去右邊 → 用右插；要去左邊 → 用左插' },
      {
        emotion: 'calm',
        message: '右插示範：先上→再抓右邊→反上→放回→再 F 系列插入 (U R U\' R\' U\' F\' U F)',
        hint: '節奏：U sexy 之後 U\' F\' U F（左右對稱）',
        resetOnEnter: true,
        playMoves: ['U', 'R', "U'", "R'", "U'", "F'", 'U', 'F'],
        stepNarrations: {
          0: '第 1 步：先把上層轉，讓邊塊空出位置',
          3: '第 4 步：邊塊就位了，準備「插」進去',
          7: '第 8 步：插入完成！邊塊歸位～',
        },
      },
      {
        emotion: 'calm',
        message: '左插示範：右插的鏡像 (U\' L\' U L U F U\' F\')',
        hint: '右插的鏡像：把所有方向換邊',
        resetOnEnter: true,
        playMoves: ["U'", "L'", 'U', 'L', 'U', 'F', "U'", "F'"],
        stepNarrations: {
          0: '第 1 步：反向（這是右插的鏡像）',
          3: '第 4 步：準備插邊塊進左邊',
          7: '第 8 步：插好了！',
        },
      },
      {
        emotion: 'cheering',
        message: '對著一個邊塊，看它要往左或往右插，挑對應公式！',
      },
      { emotion: 'celebrating', message: '中層搞定 ⭐ 兩層半啦！' },
    ],
  },
  {
    id: 6,
    parent: 5,
    title: '黃色十字',
    estMinutes: 10,
    steps: [
      { emotion: 'happy', message: '上面看一下黃色面，目前長什麼樣？', resetOnEnter: true },
      {
        emotion: 'calm',
        message: '可能是 4 種：點 → L 形 → 一字 → 十字。',
        hint: '中間那點永遠是黃的，所以從 1 點開始',
      },
      {
        emotion: 'surprised',
        message: '神奇公式：前 → sexy → 反前 (F R U R\' U\' F\')，重複做 1~3 次',
      },
      {
        emotion: 'calm',
        message: '我示範一次：看，這種狀態 → 跑公式 → 黃十字出來了！',
        resetOnEnter: true,
        preScramble: "F R U R' U' F'",
        playMoves: ['F', 'R', 'U', "R'", "U'", "F'"],
      },
      {
        emotion: 'cheering',
        message: '重複 1~3 次後，會出現黃色十字！',
      },
      {
        emotion: 'cheering',
        message: '換你做一次黃十字公式：F R U R\' U\' F\'',
        hint: '節奏：F → R U R\' U\' (sexy) → F\'',
        resetOnEnter: true,
        preScramble: "F R U R' U' F'",
        requireMoves: ['F', 'R', 'U', "R'", "U'", "F'"],
      },
      { emotion: 'celebrating', message: '黃十字完成 ⭐' },
    ],
  },
  {
    id: 7,
    parent: 6,
    title: '黃色那一面',
    estMinutes: 10,
    steps: [
      { emotion: 'happy', message: '把整個黃色面翻整齊！', resetOnEnter: true },
      { emotion: 'calm', message: '4 個角，看哪幾個的黃色已經朝上。' },
      { emotion: 'surprised', message: '公式叫「sune」(素內)：sexy 前半 → 上一下 → sexy 變形 (R U R\' U R U2 R\')', hint: '英文 sune 念「素內」' },
      {
        emotion: 'calm',
        message: '我示範一次 sune：看，跑一次就把黃面翻正了！',
        resetOnEnter: true,
        preScramble: "R U R' U R U2 R'",
        playMoves: ['R', 'U', "R'", 'U', 'R', 'U2', "R'"],
        stepNarrations: {
          0: '第 1 步：sexy 的前半 (R U R\')',
          3: '第 4 步：推一下上層，換個位置',
          4: '第 5 步：再一次 sexy 變形 (R U2 R\')',
          6: '第 7 步：黃面整齊！',
        },
      },
      {
        emotion: 'cheering',
        message: '重複 1~3 次，黃色面就會整齊！',
      },
      {
        emotion: 'cheering',
        message: '換你做一次 sune：R U R\' U R U2 R\'',
        hint: '節奏：sexy 後接 U 再 sexy U2',
        resetOnEnter: true,
        preScramble: "R U R' U R U2 R'",
        requireMoves: ['R', 'U', "R'", 'U', 'R', 'U2', "R'"],
      },
      { emotion: 'celebrating', message: '黃面 OK ⭐ 只差最後一步！' },
    ],
  },
  {
    id: 8,
    parent: 7,
    title: '最後對齊',
    estMinutes: 15,
    steps: [
      { emotion: 'happy', message: '最後一章了！只剩角塊跟邊塊「對齊」。', resetOnEnter: true },
      { emotion: 'calm', message: '先看角塊：找有沒有兩個顏色一樣的角（叫 headlight）。' },
      {
        emotion: 'surprised',
        message: '角塊換位公式 (A perm)：R\' F R\' B2 R F\' R\' B2 R2',
        hint: '9 步，有規律：setup → 主動作 → 反 setup',
      },
      {
        emotion: 'calm',
        message: '示範 A perm：看，跑完角塊歸位！',
        resetOnEnter: true,
        preScramble: "R' F R' B2 R F' R' B2 R2",
        playMoves: ["R'", 'F', "R'", 'B2', 'R', "F'", "R'", 'B2', 'R2'],
        stepNarrations: {
          0: '第 1 步：setup — 先擺好角塊要換的位置',
          4: '第 5 步：核心換位動作',
          7: '第 8 步：把 setup 反過來還原',
          8: '第 9 步：收尾！角塊全歸位～',
        },
      },
      { emotion: 'calm', message: '角塊好了之後處理邊塊。' },
      {
        emotion: 'surprised',
        message: '邊塊換位公式 (U perm)：R U\' R U R U R U\' R\' U\' R2',
        hint: '11 步最長，跟著 mini player 一步一步看',
      },
      {
        emotion: 'calm',
        message: '示範 U perm：看，跑完邊塊歸位！',
        resetOnEnter: true,
        preScramble: "R U' R U R U R U' R' U' R2",
        playMoves: ['R', "U'", 'R', 'U', 'R', 'U', 'R', "U'", "R'", "U'", 'R2'],
        stepNarrations: {
          0: '第 1 步：抓住一組邊塊往同一方向推',
          4: '第 5 步：中段連環推動',
          7: '第 8 步：開始反向收斂',
          10: '第 11 步：R2 收尾，邊塊全歸位！',
        },
      },
      {
        emotion: 'celebrating',
        message: '哇～ 整顆方塊解開了！你做到了！',
      },
    ],
  },
  {
    id: 9,
    parent: 8,
    title: '恭喜！你會解了！',
    estMinutes: 2,
    steps: [
      { emotion: 'celebrating', message: '🎉🎉🎉 你成為魔方達人了！', resetOnEnter: true },
      {
        emotion: 'surprised',
        message: '看一次完整的「打亂 → 解開」！',
        hint: '從亂到好，整個魔方學園教的公式組合起來就是這樣',
        resetOnEnter: true,
        preScramble: "R U R' U' F2 L D2 B R' F L2 U",
        playMoves: ['R', 'U', "R'", "U'", 'F2', 'L', 'D2', 'B', "R'", 'F', 'L2', 'U'],
      },
      { emotion: 'happy', message: '想繼續精進嗎？回首頁試試「自由玩」或「挑戰」吧！' },
    ],
  },
  {
    id: 10,
    parent: 9,
    title: 'F2L 直覺版 (進階)',
    estMinutes: 8,
    steps: [
      { emotion: 'happy', message: 'F2L 是什麼？它是比 LBL 更聰明的解法 — 把「白角 + 邊塊」一起插！', resetOnEnter: true },
      {
        emotion: 'calm',
        message: '看這一對：白紅角塊 + 紅邊塊。它們要一起進右前方那個槽位。',
        hint: '角塊在右上前 (URF)，邊塊在上前 (UF)',
        resetOnEnter: true,
        highlightCubies: [[1, 1, 1], [0, 1, 1]],
      },
      {
        emotion: 'calm',
        message: '槽位就在這裡：角塊的家 + 邊塊的家。',
        hint: '右下前 + 下前',
        resetOnEnter: true,
        highlightCubies: [[1, -1, 1], [0, -1, 1]],
      },
      {
        emotion: 'surprised',
        message: 'Case 1「完美對」示範：只要 4 步就能把 pair 插進去 (U R U\' R\')',
        hint: '上推 → 抓右 → 反上 → 放回',
        resetOnEnter: true,
        preScramble: "U R U' R'",
        playMoves: ['U', 'R', "U'", "R'"],
        stepNarrations: {
          0: '第 1 步 U：把 pair 推到正確位置上方',
          1: '第 2 步 R：右手抓一下，為插入做準備',
          2: '第 3 步 U\'：上層反轉，把邊塊送到右前',
          3: '第 4 步 R\'：右手放回，pair 進槽完成！',
        },
      },
      {
        emotion: 'happy',
        message: 'F2L 有 41 個 case — 想看更多，去專家模式 → 案例 tab 練習！',
        hint: '每個 case 都可以跟著 mini player 一步一步學',
      },
      { emotion: 'celebrating', message: '進階第一課搞定 ⭐ 你是 F2L 新手了！', resetOnEnter: true },
    ],
  },
]

export function inferPhase(step: Pick<WizardStep, 'phase' | 'playMoves' | 'requireMoves'>): WizardPhase {
  if (step.phase) return step.phase
  if (step.requireMoves && step.requireMoves.length > 0) return 'guided'
  return 'show'
}

/** Returns the next chapter the learner should attempt: first chapter without a star
 * whose parent (if any) HAS a star. Returns null if every chapter has a star. */
export function nextAvailableChapter(stars: Record<number, number>): WizardChapter | null {
  for (const c of CHAPTERS) {
    const earned = (stars[c.id] ?? 0) > 0
    if (earned) continue
    const parentDone = c.parent === null || (stars[c.parent] ?? 0) > 0
    if (parentDone) return c
  }
  return null
}

export function getChapter(id: number): WizardChapter | undefined {
  return CHAPTERS.find((c) => c.id === id)
}

/** Walk history and return how many of requireMoves have been matched as a suffix-streak. */
export function matchedCount(history: string[], requireMoves: string[]): number {
  let i = 0
  for (const m of history) {
    if (m === requireMoves[i]) i++
    else i = m === requireMoves[0] ? 1 : 0
  }
  return i
}
