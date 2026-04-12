/**
 * RD4-1 correctness regression: every LBL solve must actually solve the cube.
 * User reported "常常無法還原". This test catches any scramble where
 * flatten(LBL solution) doesn't end in SOLVED.
 */
import { describe, it, expect, vi } from 'vitest'
import { Cube } from '../Cube'
import { Cube as CubejsCube } from '../cubejs-shim'
import { lblSolve, flatten } from './lbl'

vi.mock('../solver', async () => {
  let inited = false
  return {
    initSolver: vi.fn(async () => { if (!inited) { CubejsCube.initSolver(); inited = true } }),
    solve: vi.fn(async (facelets: string) => {
      if (!inited) { CubejsCube.initSolver(); inited = true }
      return CubejsCube.fromString(facelets).solve() ?? ''
    }),
  }
})

function mulberry32(seed: number) {
  let a = seed
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

describe('LBL correctness regression (RD4-1)', () => {
  it('100 random scrambles all fully restore to SOLVED', async () => {
    const rng = mulberry32(1337)
    const failures: Array<{ scramble: string; final: string }> = []
    for (let i = 0; i < 100; i++) {
      const scramble = Cube.randomScramble(25, rng)
      const start = new Cube().applyAlg(scramble)
      const sol = await lblSolve(start)
      const after = start.applyAlg(flatten(sol).join(' '))
      if (!after.isSolved()) {
        failures.push({ scramble, final: after.facelets })
      }
    }
    expect(
      failures.length,
      failures.length ? `${failures.length}/100 scrambles not restored: ${JSON.stringify(failures.slice(0, 3))}` : '',
    ).toBe(0)
  }, 90_000)
})
