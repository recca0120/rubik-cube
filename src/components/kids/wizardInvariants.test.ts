/**
 * Chapter content invariants (RD2-V1).
 *
 * Runs cheap checks against the wizardChapters data to catch the class of
 * bugs we've had to fix reactively (RD2-C12 X2 matching, RD2-C13 atom lost
 * in enqueue expansion). If any chapter can't be completed by "follow the
 * highlight", this test file fails — instead of the user discovering it.
 */

import { describe, it, expect } from 'vitest'
import { CHAPTERS, nextAvailableChapter, type WizardStep } from './wizardChapters'
import { Cube } from '@/cube/Cube'
import { parseMove } from '@/components/three/moveAnimation'

const VALID_FACES = new Set(['U', 'D', 'L', 'R', 'F', 'B'])
const VALID_SUFFIX = new Set(['', "'", '2'])

function isValidMove(m: string): boolean {
  if (m.length < 1 || m.length > 2) return false
  if (!VALID_FACES.has(m[0])) return false
  return VALID_SUFFIX.has(m.slice(1))
}

/** Simulate "user clicks highlighted keypad button" until practiceDone or we
 *  run out of patience. Uses the exact matching logic from Wizard. */
function simulateFollowingHighlight(requireMoves: string[]): {
  satisfied: boolean
  iterations: number
  history: string[]
} {
  const history: string[] = []
  const maxIter = requireMoves.length * 3 + 5
  for (let n = 0; n < maxIter; n++) {
    // practiceDone check (tail of history matches requireMoves exactly)
    if (
      history.length >= requireMoves.length &&
      requireMoves.every(
        (m, i) => history[history.length - requireMoves.length + i] === m,
      )
    ) {
      return { satisfied: true, iterations: n, history }
    }
    // next expected move = position after matched prefix in history
    let i = 0
    for (const m of history) {
      if (m === requireMoves[i]) i++
      else i = m === requireMoves[0] ? 1 : 0
    }
    if (i >= requireMoves.length) {
      // theoretically satisfied; loop will catch on next iter
      i = requireMoves.length - 1
    }
    const nextMove = requireMoves[i]
    history.push(nextMove)
  }
  return { satisfied: false, iterations: maxIter, history }
}

describe('Chapter invariants (RD2-V1)', () => {
  describe('every move notation is valid', () => {
    const checks: Array<[number, number, 'playMoves' | 'requireMoves', string[]]> = []
    for (const chapter of CHAPTERS) {
      chapter.steps.forEach((step, idx) => {
        if (step.playMoves) checks.push([chapter.id, idx, 'playMoves', step.playMoves])
        if (step.requireMoves) checks.push([chapter.id, idx, 'requireMoves', step.requireMoves])
      })
    }

    it.each(checks)('Ch%i step %i %s moves parse', (_chId, _stepIdx, _field, moves) => {
      for (const m of moves) {
        expect(isValidMove(m), `invalid move token: "${m}"`).toBe(true)
        expect(parseMove(m), `parseMove rejected: "${m}"`).not.toBeNull()
      }
    })
  })

  describe('every playMoves applies cleanly (no Cube.apply throw)', () => {
    const playSteps: Array<[number, number, string[]]> = []
    for (const chapter of CHAPTERS) {
      chapter.steps.forEach((step, idx) => {
        if (step.playMoves && step.playMoves.length > 0) {
          playSteps.push([chapter.id, idx, step.playMoves])
        }
      })
    }

    it.each(playSteps)('Ch%i step %i plays without error', (_chId, _stepIdx, moves) => {
      expect(() => moves.reduce((c, m) => c.apply(m), new Cube())).not.toThrow()
    })
  })

  describe('every practice step is completable by following the highlight', () => {
    const practiceSteps: Array<[number, number, string[]]> = []
    for (const chapter of CHAPTERS) {
      chapter.steps.forEach((step, idx) => {
        if (step.requireMoves && step.requireMoves.length > 0) {
          practiceSteps.push([chapter.id, idx, step.requireMoves])
        }
      })
    }

    it.each(practiceSteps)('Ch%i step %i can be finished by clicking highlight', (_chId, _stepIdx, moves) => {
      const result = simulateFollowingHighlight(moves)
      expect(
        result.satisfied,
        `unsatisfiable in ${result.iterations} iter — history: ${result.history.join(' ')}`,
      ).toBe(true)
    })
  })

  describe('skill graph (parent DAG)', () => {
    it('every non-root chapter\'s parent exists', () => {
      const ids = new Set(CHAPTERS.map((c) => c.id))
      for (const c of CHAPTERS) {
        if (c.parent !== null) {
          expect(ids.has(c.parent), `Ch${c.id} parent ${c.parent} not found`).toBe(true)
        }
      }
    })

    it('no parent cycle (walking up from any chapter reaches a root)', () => {
      const byId = new Map(CHAPTERS.map((c) => [c.id, c]))
      for (const c of CHAPTERS) {
        const seen = new Set<number>()
        let cur: WizardStep extends never ? never : typeof c | undefined = c
        while (cur && cur.parent !== null) {
          if (seen.has(cur.id)) {
            throw new Error(`cycle in parent chain starting at Ch${c.id}`)
          }
          seen.add(cur.id)
          cur = byId.get(cur.parent)
        }
      }
    })

    it('at least one chapter has parent=null (root)', () => {
      expect(CHAPTERS.some((c) => c.parent === null)).toBe(true)
    })
  })

  describe('chapter progression', () => {
    it('nextAvailableChapter cascades from {} through every chapter to null', () => {
      let stars: Record<number, number> = {}
      const visited: number[] = []
      for (let n = 0; n < CHAPTERS.length + 2; n++) {
        const next = nextAvailableChapter(stars)
        if (!next) break
        if (visited.includes(next.id)) {
          throw new Error(`revisited Ch${next.id} — cascade stuck`)
        }
        visited.push(next.id)
        stars = { ...stars, [next.id]: 1 }
      }
      expect(visited.length).toBe(CHAPTERS.length)
      expect(nextAvailableChapter(stars)).toBeNull()
    })
  })

  describe('steps have content', () => {
    it.each(CHAPTERS)('Ch%i has at least 1 step', (chapter) => {
      expect(chapter.steps.length).toBeGreaterThanOrEqual(1)
    })

    it.each(CHAPTERS)('Ch%i every step has non-empty message', (chapter) => {
      for (const step of chapter.steps) {
        expect(step.message.length, `step: ${JSON.stringify(step)}`).toBeGreaterThan(0)
      }
    })
  })

  describe('Celebration steps do not lie about cube state', () => {
    it('Ch4 final step (白色面完成) resets cube so visual matches message', () => {
      const ch4 = CHAPTERS[3]
      const last = ch4.steps[ch4.steps.length - 1]
      expect(last.emotion).toBe('celebrating')
      expect(last.resetOnEnter).toBe(true)
    })
  })

  describe('Algorithm-teaching steps preScramble so cube ends solved after alg', () => {
    // For demo/practice steps teaching a multi-move algorithm, preScramble
    // should match the algorithm so applying it visually solves the cube.
    it('Ch6 yellow-cross demo preScrambles to its own algorithm', () => {
      const ch6 = CHAPTERS[5]
      const demoStep = ch6.steps.find((s) =>
        s.playMoves && s.playMoves.join(' ') === "F R U R' U' F'",
      )
      expect(demoStep?.preScramble).toBe("F R U R' U' F'")
    })
    it('Ch6 yellow-cross practice preScrambles to its own algorithm', () => {
      const ch6 = CHAPTERS[5]
      const prac = ch6.steps.find((s) =>
        s.requireMoves && s.requireMoves.join(' ') === "F R U R' U' F'",
      )
      expect(prac?.preScramble).toBe("F R U R' U' F'")
    })
    it('Ch7 Sune demo preScrambles to Sune', () => {
      const ch7 = CHAPTERS[6]
      const demo = ch7.steps.find((s) =>
        s.playMoves && s.playMoves.join(' ') === "R U R' U R U2 R'",
      )
      expect(demo?.preScramble).toBe("R U R' U R U2 R'")
    })
    it('Ch7 Sune practice preScrambles', () => {
      const ch7 = CHAPTERS[6]
      const prac = ch7.steps.find((s) =>
        s.requireMoves && s.requireMoves.join(' ') === "R U R' U R U2 R'",
      )
      expect(prac?.preScramble).toBe("R U R' U R U2 R'")
    })
    it('Ch8 A-perm demo preScrambles', () => {
      const ch8 = CHAPTERS[7]
      const demo = ch8.steps.find((s) =>
        s.playMoves && s.playMoves.join(' ') === "R' F R' B2 R F' R' B2 R2",
      )
      expect(demo?.preScramble).toBe("R' F R' B2 R F' R' B2 R2")
    })
    it('Ch8 U-perm demo preScrambles', () => {
      const ch8 = CHAPTERS[7]
      const demo = ch8.steps.find((s) =>
        s.playMoves && s.playMoves.join(' ') === "R U' R U R U R U' R' U' R2",
      )
      expect(demo?.preScramble).toBe("R U' R U R U R U' R' U' R2")
    })
  })

  describe('Long-algorithm demos have stepNarrations for key moves', () => {
    it('Ch5 right-insert demo has narrations', () => {
      const ch5 = CHAPTERS[4]
      const s = ch5.steps.find((x) => x.playMoves?.join(' ') === "U R U' R' U' F' U F")
      expect(s?.stepNarrations).toBeDefined()
      expect(Object.keys(s!.stepNarrations!).length).toBeGreaterThanOrEqual(2)
    })
    it('Ch7 Sune demo has narrations', () => {
      const ch7 = CHAPTERS[6]
      const s = ch7.steps.find((x) => x.playMoves?.join(' ') === "R U R' U R U2 R'")
      expect(s?.stepNarrations).toBeDefined()
    })
    it('Ch8 A-perm demo has narrations', () => {
      const ch8 = CHAPTERS[7]
      const s = ch8.steps.find((x) => x.playMoves?.join(' ') === "R' F R' B2 R F' R' B2 R2")
      expect(s?.stepNarrations).toBeDefined()
    })
    it('Ch8 U-perm demo has narrations', () => {
      const ch8 = CHAPTERS[7]
      const s = ch8.steps.find((x) => x.playMoves?.join(' ') === "R U' R U R U R U' R' U' R2")
      expect(s?.stepNarrations).toBeDefined()
    })
  })

  describe('Ch10 (F2L 直覺版) — intermediate bridge to CFOP', () => {
    const ch10 = CHAPTERS[9]
    it('exists with parent = 9 (unlocks after LBL finish)', () => {
      expect(ch10?.id).toBe(10)
      expect(ch10?.parent).toBe(9)
    })
    it('has a step highlighting the F2L pair (corner + edge) via highlightCubies', () => {
      const pairStep = ch10.steps.find((s) => s.highlightCubies && s.highlightCubies.length === 2)
      expect(pairStep).toBeDefined()
    })
    it('has a case 1 demo with preScramble + stepNarrations', () => {
      const caseStep = ch10.steps.find((s) => s.preScramble === "U R U' R'")
      expect(caseStep?.stepNarrations).toBeDefined()
      expect(Object.keys(caseStep!.stepNarrations!).length).toBeGreaterThanOrEqual(2)
    })
  })

  describe('Ch9 (恭喜) has a scramble+solve showcase', () => {
    const ch9 = CHAPTERS[8]
    it('has a step with preScramble (fully scrambled) and a long playMoves (solve)', () => {
      const showcase = ch9.steps.find((s) => s.preScramble && s.playMoves && s.playMoves.length >= 10)
      expect(showcase).toBeDefined()
    })
  })

  describe('Ch5 flip step actually flips the cube (not just narrative)', () => {
    const ch5 = CHAPTERS[4]
    it('has a step with viewFlipped: true near the "翻過來" narration', () => {
      const flipStep = ch5.steps.find((s) => /翻/.test(s.message) && s.viewFlipped === true)
      expect(flipStep).toBeDefined()
    })
  })

  describe('Long algorithms (≥8 moves) are demo-only (no practice)', () => {
    // v5 decision: typing 8/9/11-move algs is a burden; learn via stepped demo.
    it('Ch5 right-insert has NO practice step', () => {
      const ch5 = CHAPTERS[4]
      expect(ch5.steps.some((s) => s.requireMoves?.join(' ') === "U R U' R' U' F' U F")).toBe(false)
    })
    it('Ch5 left-insert has NO practice step', () => {
      const ch5 = CHAPTERS[4]
      expect(ch5.steps.some((s) => s.requireMoves?.join(' ') === "U' L' U L U F U' F'")).toBe(false)
    })
    it('Ch8 A-perm has NO practice step', () => {
      const ch8 = CHAPTERS[7]
      expect(ch8.steps.some((s) => s.requireMoves?.join(' ') === "R' F R' B2 R F' R' B2 R2")).toBe(false)
    })
    it('Ch8 U-perm has NO practice step', () => {
      const ch8 = CHAPTERS[7]
      expect(ch8.steps.some((s) => s.requireMoves?.join(' ') === "R U' R U R U R U' R' U' R2")).toBe(false)
    })
  })

  describe('Ch2 (6 種轉法) teaches notation with practice, not just demo', () => {
    const ch2 = CHAPTERS[1]
    it('has a practice step for R\' (prime / CCW)', () => {
      expect(ch2.steps.some((s) => s.requireMoves?.length === 1 && s.requireMoves[0] === "R'")).toBe(true)
    })
    it('has a practice step for R2 (double turn)', () => {
      expect(ch2.steps.some((s) => s.requireMoves?.length === 1 && s.requireMoves[0] === 'R2')).toBe(true)
    })
  })

  describe('Ch1 (認識魔術方塊) is interactive, not just text', () => {
    const ch1 = CHAPTERS[0]
    it('centers-highlight step demos R R\' (roll-and-back), not a scrambling sexy', () => {
      const center = ch1.steps.find((s) => s.highlight === 'centers')
      expect(center?.playMoves).toEqual(['R', "R'"])
    })
    it('has at least one step highlighting centers', () => {
      expect(ch1.steps.some((s) => s.highlight === 'centers')).toBe(true)
    })
    it('has at least one step highlighting corners', () => {
      expect(ch1.steps.some((s) => s.highlight === 'corners')).toBe(true)
    })
    it('has at least one step highlighting edges', () => {
      expect(ch1.steps.some((s) => s.highlight === 'edges')).toBe(true)
    })
  })
})
