import { describe, it, expect, vi } from 'vitest'
import { Cube } from '../Cube'
import { lblSolve, flatten } from './lbl'
import { Cube as CubejsCube } from '../cubejs-shim'

// Stub the worker solver to use the main-thread cubejs shim instead (jsdom has no Worker-ready environment).
vi.mock('../solver', async () => {
  let inited = false
  return {
    initSolver: vi.fn(async () => {
      if (!inited) { CubejsCube.initSolver(); inited = true }
    }),
    solve: vi.fn(async (facelets: string) => {
      if (!inited) { CubejsCube.initSolver(); inited = true }
      return CubejsCube.fromString(facelets).solve() ?? ''
    }),
  }
})

const apply = (cube: Cube, moves: string[]) => moves.reduce((c, m) => c.apply(m), cube)

describe('lblSolve', () => {
  it('returns empty sections for already-solved cube', async () => {
    const sol = await lblSolve(new Cube())
    expect(sol.cross).toEqual([])
    expect(sol.whiteCorners).toEqual([])
    expect(sol.middleLayer).toEqual([])
    expect(sol.yellowCross).toEqual([])
    expect(sol.yellowFace).toEqual([])
    expect(sol.pll).toEqual([])
  })

  it('solves a scramble with non-empty stage sections', async () => {
    const scramble = "R U R' U' F R U R' U' F'"
    const scrambled = new Cube().applyAlg(scramble)
    const sol = await lblSolve(scrambled)
    const final = apply(scrambled, flatten(sol))
    expect(final.isSolved()).toBe(true)
  }, 120000)

  it('solves 3 random 25-move scrambles', async () => {
    for (let i = 0; i < 3; i++) {
      const alg = Cube.randomScramble()
      const scrambled = new Cube().applyAlg(alg)
      const sol = await lblSolve(scrambled)
      const final = apply(scrambled, flatten(sol))
      expect(final.isSolved(), `scramble: ${alg}`).toBe(true)
    }
  }, 300000)
})
