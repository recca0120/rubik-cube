import { describe, it, expect } from 'vitest'
import { Cube } from '../Cube'
import { isWhiteFaceSolved, isWhiteCrossSolved } from '../stages'
import { solveWhiteCross } from './whiteCross'
import { solveWhiteCorners } from './whiteCorners'

const apply = (cube: Cube, moves: string[]) => moves.reduce((c, m) => c.apply(m), cube)

describe('solveWhiteCorners', () => {
  it('returns empty moves when white face is already solved', () => {
    expect(solveWhiteCorners(new Cube())).toEqual([])
  })

  it.each([
    "R U R' U'", // sexy move — breaks both cross and corners
    "R U R'",
    "F R U R' U' F'",
    "R U2 R' U' R U' R'", // sune — orients corners
    "R U R' U' R U R' U'",
  ])('after cross + corners, white face is solved (scramble: %s)', (alg) => {
    const scrambled = new Cube().applyAlg(alg)
    const crossMoves = solveWhiteCross(scrambled)
    const afterCross = apply(scrambled, crossMoves)
    expect(isWhiteCrossSolved(afterCross.facelets)).toBe(true)

    const cornerMoves = solveWhiteCorners(afterCross)
    const final = apply(afterCross, cornerMoves)
    expect(isWhiteFaceSolved(final.facelets)).toBe(true)
  }, 20000)

  it('solves white face from 10 random 25-move scrambles', () => {
    for (let i = 0; i < 10; i++) {
      const alg = Cube.randomScramble()
      const scrambled = new Cube().applyAlg(alg)
      const afterCross = apply(scrambled, solveWhiteCross(scrambled))
      expect(isWhiteCrossSolved(afterCross.facelets), `scramble: ${alg}`).toBe(true)
      const final = apply(afterCross, solveWhiteCorners(afterCross))
      expect(isWhiteFaceSolved(final.facelets), `scramble: ${alg}`).toBe(true)
    }
  }, 120000)
})
