import { describe, it, expect } from 'vitest'
import { Cube } from '../Cube'
import { isYellowCrossSolved, isTopTwoLayersSolved } from '../stages'
import { solveYellowCross } from './yellowCross'
import { solveWhiteCross } from './whiteCross'
import { solveWhiteCorners } from './whiteCorners'
import { solveMiddleLayer } from './middleLayer'

const apply = (cube: Cube, moves: string[]) => moves.reduce((c, m) => c.apply(m), cube)

describe('solveYellowCross', () => {
  it('returns [] when already solved', () => {
    expect(solveYellowCross(new Cube())).toEqual([])
  })

  it('solves yellow cross from 5 random scrambles (after F2L solved)', () => {
    for (let i = 0; i < 5; i++) {
      const alg = Cube.randomScramble()
      const scrambled = new Cube().applyAlg(alg)
      let state = apply(scrambled, solveWhiteCross(scrambled))
      state = apply(state, solveWhiteCorners(state))
      state = apply(state, solveMiddleLayer(state))
      expect(isTopTwoLayersSolved(state.facelets), `scramble: ${alg}`).toBe(true)
      const final = apply(state, solveYellowCross(state))
      expect(isYellowCrossSolved(final.facelets), `scramble: ${alg}`).toBe(true)
      expect(isTopTwoLayersSolved(final.facelets), `scramble: ${alg}`).toBe(true)
    }
  }, 300000)
})
