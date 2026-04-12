import { describe, it, expect, vi } from 'vitest'
import { Cube } from '../Cube'
import { Cube as CubejsCube } from '../cubejs-shim'

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

import { solvePLL } from './pll'
import { solveWhiteCross } from './whiteCross'
import { solveWhiteCorners } from './whiteCorners'
import { solveMiddleLayer } from './middleLayer'
import { solveYellowCross } from './yellowCross'
import { solveYellowFace } from './yellowFace'

const apply = (cube: Cube, moves: string[]) => moves.reduce((c, m) => c.apply(m), cube)

describe('solvePLL', () => {
  it('returns [] when already solved', async () => {
    expect(await solvePLL(new Cube())).toEqual([])
  })

  it('full LBL pipeline: 3 random scrambles reach solved via per-phase solvers', async () => {
    for (let i = 0; i < 3; i++) {
      const alg = Cube.randomScramble()
      const scrambled = new Cube().applyAlg(alg)
      let state = apply(scrambled, solveWhiteCross(scrambled))
      state = apply(state, solveWhiteCorners(state))
      state = apply(state, solveMiddleLayer(state))
      state = apply(state, solveYellowCross(state))
      state = apply(state, await solveYellowFace(state))
      const final = apply(state, await solvePLL(state))
      expect(final.isSolved(), `scramble: ${alg}`).toBe(true)
    }
  }, 300000)
})
