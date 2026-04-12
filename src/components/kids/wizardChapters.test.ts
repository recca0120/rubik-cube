import { describe, it, expect } from 'vitest'
import { getChapter } from './wizardChapters'

describe('wizardChapters', () => {
  describe('copy (RD2-C7)', () => {
    it('Ch2 you-do steps do not reference keyboard (v2 uses MoveKeypad)', async () => {
      const { CHAPTERS } = await import('./wizardChapters')
      const ch2 = CHAPTERS.find((c) => c.id === 2)!
      const youDo = ch2.steps.filter((s) => s.requireMoves)
      for (const step of youDo) {
        expect(step.message, `step message: ${step.message}`).not.toMatch(/鍵盤|keyboard/i)
      }
    })

    it('Ch2 you-do steps do not suggest dragging a layer', async () => {
      const { CHAPTERS } = await import('./wizardChapters')
      const ch2 = CHAPTERS.find((c) => c.id === 2)!
      const youDo = ch2.steps.filter((s) => s.requireMoves)
      for (const step of youDo) {
        const text = step.message + (step.hint ?? '')
        expect(text).not.toMatch(/拖動上層|拖.+?層/)
      }
    })

    it('Ch2 you-do hints do not reference lowercase keyboard keys', async () => {
      const { CHAPTERS } = await import('./wizardChapters')
      const ch2 = CHAPTERS.find((c) => c.id === 2)!
      const youDo = ch2.steps.filter((s) => s.requireMoves)
      for (const step of youDo) {
        if (step.hint) {
          expect(step.hint).not.toMatch(/小寫\s*[udlrfb]/i)
        }
      }
    })
  })

  describe('skill graph (RD2-M10)', () => {
    it('every chapter declares a parent (null for Ch1)', async () => {
      const { CHAPTERS } = await import('./wizardChapters')
      expect(CHAPTERS[0].parent).toBeNull()
      for (let i = 1; i < CHAPTERS.length; i++) {
        expect(CHAPTERS[i].parent).toBe(CHAPTERS[i - 1].id)
      }
    })

    it('nextAvailableChapter returns Ch1 when no stars earned', async () => {
      const { nextAvailableChapter } = await import('./wizardChapters')
      expect(nextAvailableChapter({})?.id).toBe(1)
    })

    it('nextAvailableChapter returns Ch2 when only Ch1 has a star', async () => {
      const { nextAvailableChapter } = await import('./wizardChapters')
      expect(nextAvailableChapter({ 1: 1 })?.id).toBe(2)
    })

    it('nextAvailableChapter skips chapters whose parent has no star', async () => {
      const { nextAvailableChapter } = await import('./wizardChapters')
      // Even if 3 has a star but 1 doesn't, we should return 1 (parent gating)
      expect(nextAvailableChapter({ 3: 1 })?.id).toBe(1)
    })

    it('nextAvailableChapter returns null when all chapters have stars', async () => {
      const { nextAvailableChapter, CHAPTERS } = await import('./wizardChapters')
      const allDone = Object.fromEntries(CHAPTERS.map((c) => [c.id, 1]))
      expect(nextAvailableChapter(allDone)).toBeNull()
    })
  })

  describe('inferPhase (RD2-M4)', () => {
    // We expose a helper that maps a legacy step shape to a phase label so
    // the Wizard can show "👀 看示範" / "🎯 換你做" hints.
    it('infers "guided" for a step with requireMoves', async () => {
      const { inferPhase } = await import('./wizardChapters')
      expect(inferPhase({ requireMoves: ['U'] })).toBe('guided')
    })
    it('infers "show" for a step with playMoves but no requireMoves', async () => {
      const { inferPhase } = await import('./wizardChapters')
      expect(inferPhase({ playMoves: ['U'] })).toBe('show')
    })
    it('infers "show" for a plain dialog step', async () => {
      const { inferPhase } = await import('./wizardChapters')
      expect(inferPhase({})).toBe('show')
    })
    it('honours explicit phase field over inference', async () => {
      const { inferPhase } = await import('./wizardChapters')
      expect(inferPhase({ phase: 'free', requireMoves: ['U'] })).toBe('free')
    })
  })

  it('getChapter returns the chapter by id', () => {
    expect(getChapter(1)?.title).toMatch(/認識魔術方塊/)
    expect(getChapter(99)).toBeUndefined()
  })

  describe('formula practice (KF#15 slice 2D + RD2-V2)', () => {
    const cases: Array<[number, string, string[]]> = [
      // v5: long algs (≥8 moves) are demo-only, no practice step.
      [3, '白十字示範序列 F R U\' B L2', ['F', 'R', "U'", 'B', 'L2']],
      [4, 'sexy move', ['R', 'U', "R'", "U'"]],
      [6, '黃十字 F R U R\' U\' F\'', ['F', 'R', 'U', "R'", "U'", "F'"]],
      [7, 'sune', ['R', 'U', "R'", 'U', 'R', 'U2', "R'"]],
    ]
    it.each(cases)('Ch%i has a practice step for %s', (id, _label, moves) => {
      const ch = getChapter(id)!
      const found = ch.steps.find(
        (s) =>
          Array.isArray(s.requireMoves) &&
          s.requireMoves.length === moves.length &&
          s.requireMoves.every((m, i) => m === moves[i]),
      )
      expect(found, `Ch${id} should contain practice for ${moves.join(' ')}`).toBeDefined()
    })
  })

  describe('Ch2 — practice (KF#15 slice 2A)', () => {
    const ch2 = getChapter(2)!
    const FACES = ['U', 'D', 'R', 'L', 'F', 'B'] as const

    it.each(FACES)('has a practice step requiring %s right after the %s demo', (face) => {
      // Find demo step (playMoves: [face]) and assert the immediate next
      // step is a practice step requiring the same face.
      const demoIdx = ch2.steps.findIndex(
        (s) => s.playMoves?.length === 1 && s.playMoves[0] === face,
      )
      expect(demoIdx, `${face} demo step exists`).toBeGreaterThanOrEqual(0)
      const next = ch2.steps[demoIdx + 1]
      expect(next, `${face} has a follow-up step`).toBeDefined()
      expect(next.requireMoves).toEqual([face])
    })
  })
})
