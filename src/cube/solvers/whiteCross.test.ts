import { describe, it, expect, beforeAll } from 'vitest'
import { Cube } from '../Cube'
import { isWhiteCrossSolved } from '../stages'
import { solveWhiteCross } from './whiteCross'
import { buildCrossTable } from './crossTable'

function applySolution(cube: Cube, moves: string[]): Cube {
  return moves.reduce((c, m) => c.apply(m), cube)
}

describe('solveWhiteCross', () => {
  beforeAll(() => {
    // Pre-build cross table (one-time ~10s BFS) before test timeouts apply.
    buildCrossTable()
  }, 60000)

  it('returns empty moves when cube is solved', () => {
    expect(solveWhiteCross(new Cube())).toEqual([])
  })

  it('solves cross after a single R move (1 step)', () => {
    const scrambled = new Cube().apply('R')
    const solution = solveWhiteCross(scrambled)
    expect(solution.length).toBeGreaterThan(0)
    expect(isWhiteCrossSolved(applySolution(scrambled, solution).facelets)).toBe(true)
  })

  it.each([
    'R',
    "R'",
    'R2',
    'F',
    "F'",
    "R U",
    "R U R'",
    "F R U",
    "R U2 F' L",
    "R U R' U' F2 L",
  ])('solves cross after scramble: %s', (alg) => {
    const scrambled = new Cube().applyAlg(alg)
    const solution = solveWhiteCross(scrambled)
    expect(isWhiteCrossSolved(applySolution(scrambled, solution).facelets)).toBe(true)
    // God's number for cross is 8 HTM
    expect(solution.length).toBeLessThanOrEqual(8)
  })

  it('does not repeat the same face on consecutive moves', () => {
    const scrambled = new Cube().applyAlg("R U R' U' F2 L D")
    const solution = solveWhiteCross(scrambled)
    for (let i = 1; i < solution.length; i++) {
      expect(solution[i][0]).not.toBe(solution[i - 1][0])
    }
  })

  it('solves cross after a full 25-move random scramble (within 8 moves)', () => {
    const alg = Cube.randomScramble()
    const scrambled = new Cube().applyAlg(alg)
    const solution = solveWhiteCross(scrambled)
    expect(solution.length).toBeLessThanOrEqual(8)
    expect(isWhiteCrossSolved(applySolution(scrambled, solution).facelets)).toBe(true)
  }, 30000)
})
