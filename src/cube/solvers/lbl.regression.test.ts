/**
 * RD3-1 regression: LBL total-move distribution over 50 random scrambles.
 * Asserts mean ≤ 55 and p95 ≤ 80 so user never sees "LBL 步數非常多" again.
 */
import { describe, it, expect, vi } from 'vitest'
import { Cube } from '../Cube'
import { Cube as CubejsCube } from '../cubejs-shim'
import { lblSolve, flatten } from './lbl'

// Stub worker-backed solver (jsdom has no Workers).
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

describe('LBL move-count regression (RD3-1)', () => {
  it('50 random scrambles: mean ≤ 55, p95 ≤ 80 (after collapseMoves)', async () => {
    const rng = mulberry32(42)
    const counts: number[] = []
    for (let i = 0; i < 50; i++) {
      const scrambleAlg = Cube.randomScramble(25, rng)
      const scrambled = new Cube().applyAlg(scrambleAlg)
      const sol = await lblSolve(scrambled)
      counts.push(flatten(sol).length)
    }
    counts.sort((a, b) => a - b)
    const mean = counts.reduce((a, b) => a + b, 0) / counts.length
    const p95 = counts[Math.floor(counts.length * 0.95)]
    expect(mean, `mean=${mean}`).toBeLessThanOrEqual(55)
    expect(p95, `p95=${p95}, full=${counts.join(',')}`).toBeLessThanOrEqual(80)
  }, 60_000)
})
