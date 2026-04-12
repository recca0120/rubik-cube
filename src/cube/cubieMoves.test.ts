import { describe, it, expect } from 'vitest'
import { Cube } from './Cube'
import { parseCubies, toFacelets } from './cubies'
import { applyMove, SOLVED_CUBIES } from './cubieMoves'

describe('applyMove (cubie-level)', () => {
  it.each([
    'U', "U'", 'U2',
    'R', "R'", 'R2',
    'L', 'F', 'D', 'B',
    "R U R' U'",
    "R U R' U' F2 L D2 B",
    "R U2 D' B F L2 R' F B2",
  ])('matches Cube.apply for: %s', (alg) => {
    // Reference: apply via facelet-level Cube
    const expected = new Cube().applyAlg(alg).facelets

    // Under test: apply via cubie-level move tables
    let s = SOLVED_CUBIES
    for (const m of alg.split(/\s+/).filter(Boolean)) s = applyMove(s, m)
    expect(toFacelets(s)).toBe(expected)
  })

  it('applying any single basic move 4 times returns to solved', () => {
    for (const m of ['U', 'D', 'L', 'R', 'F', 'B']) {
      let s = SOLVED_CUBIES
      for (let i = 0; i < 4; i++) s = applyMove(s, m)
      expect(s).toEqual(SOLVED_CUBIES)
    }
  })

  it("parseCubies round-trip through applyMove equals direct Cube.apply", () => {
    const scramble = "R U R' U' F2 L D2 B"
    const cubeFacelets = new Cube().applyAlg(scramble).facelets
    let s = SOLVED_CUBIES
    for (const m of scramble.split(/\s+/)) s = applyMove(s, m)
    expect(parseCubies(cubeFacelets)).toEqual(s)
  })
})
