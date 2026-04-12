import { describe, it, expect } from 'vitest'
import { Cube } from '../Cube'
import { solveWhiteCross } from './whiteCross'
import { solveF2L } from './f2l'
import { isTopTwoLayersSolved } from '../stages'

function apply(cube: Cube, moves: string[]): Cube {
  return moves.reduce((c, m) => c.apply(m), cube)
}

describe('solveF2L', () => {
  it.each([
    "R U R' U'",
    "F R U R' U' F'",
    "L U2 L' U' L U' L'",
  ])('brings cross-solved cube to F2L-solved (scramble: %s)', { timeout: 60000 }, (scramble) => {
    const scrambled = apply(new Cube(), scramble.split(/\s+/))
    const cross = solveWhiteCross(scrambled)
    const afterCross = apply(scrambled, cross)
    const f2l = solveF2L(afterCross)
    const final = apply(afterCross, f2l)
    expect(isTopTwoLayersSolved(final.facelets)).toBe(true)
  })

  it('returns empty when F2L is already solved', () => {
    expect(solveF2L(new Cube())).toEqual([])
  })
})
