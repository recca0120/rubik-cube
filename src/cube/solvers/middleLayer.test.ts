import { describe, it, expect } from 'vitest'
import { Cube } from '../Cube'
import { isTopTwoLayersSolved } from '../stages'
import { solveWhiteCross } from './whiteCross'
import { solveWhiteCorners } from './whiteCorners'
import { solveMiddleLayer } from './middleLayer'

const apply = (cube: Cube, moves: string[]) => moves.reduce((c, m) => c.apply(m), cube)

describe('solveMiddleLayer', () => {
  it('returns [] when already solved', () => {
    expect(solveMiddleLayer(new Cube())).toEqual([])
  })

  it.each([
    "R U R' U'",
    "F R U R' U' F'",
    "F D F'",
    "R U R' U' R U R' U'",
  ])('cross + corners + middle yields top-two-layers (scramble: %s)', (alg) => {
    const scrambled = new Cube().applyAlg(alg)
    const afterCross = apply(scrambled, solveWhiteCross(scrambled))
    const afterCorners = apply(afterCross, solveWhiteCorners(afterCross))
    const final = apply(afterCorners, solveMiddleLayer(afterCorners))
    expect(isTopTwoLayersSolved(final.facelets)).toBe(true)
  }, 60000)

  it('solves top two layers from 5 random 25-move scrambles', () => {
    for (let i = 0; i < 5; i++) {
      const alg = Cube.randomScramble()
      const scrambled = new Cube().applyAlg(alg)
      const afterCross = apply(scrambled, solveWhiteCross(scrambled))
      const afterCorners = apply(afterCross, solveWhiteCorners(afterCross))
      const final = apply(afterCorners, solveMiddleLayer(afterCorners))
      expect(isTopTwoLayersSolved(final.facelets), `scramble: ${alg}`).toBe(true)
    }
  }, 300000)
})
