import { describe, it, expect, vi } from 'vitest'
import { Cube } from '../Cube'
import { isYellowFaceSolved, isYellowCrossSolved, isTopTwoLayersSolved } from '../stages'
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

import { solveYellowFace } from './yellowFace'
import { solveWhiteCross } from './whiteCross'
import { solveWhiteCorners } from './whiteCorners'
import { solveMiddleLayer } from './middleLayer'
import { solveYellowCross } from './yellowCross'

const apply = (cube: Cube, moves: string[]) => moves.reduce((c, m) => c.apply(m), cube)

describe('solveYellowFace', () => {
  it('returns [] when already solved', async () => {
    expect(await solveYellowFace(new Cube())).toEqual([])
  })

  it('solves yellow face from 3 random scrambles after F2L+yellow-cross', async () => {
    for (let i = 0; i < 3; i++) {
      const alg = Cube.randomScramble()
      const scrambled = new Cube().applyAlg(alg)
      let state = apply(scrambled, solveWhiteCross(scrambled))
      state = apply(state, solveWhiteCorners(state))
      state = apply(state, solveMiddleLayer(state))
      state = apply(state, solveYellowCross(state))
      expect(isTopTwoLayersSolved(state.facelets) && isYellowCrossSolved(state.facelets)).toBe(true)
      const final = apply(state, await solveYellowFace(state))
      expect(isYellowFaceSolved(final.facelets), `scramble: ${alg}`).toBe(true)
    }
  }, 300000)
})
