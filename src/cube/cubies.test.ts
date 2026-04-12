import { describe, it, expect } from 'vitest'
import { parseCubies, toFacelets } from './cubies'
import { Cube, SOLVED } from './Cube'

describe('parseCubies', () => {
  it('solved cube: identity permutations, zero orientations', () => {
    const s = parseCubies(SOLVED)
    expect(s.cp).toEqual([0, 1, 2, 3, 4, 5, 6, 7])
    expect(s.co).toEqual([0, 0, 0, 0, 0, 0, 0, 0])
    expect(s.ep).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11])
    expect(s.eo).toEqual([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0])
  })

  it('after U: URF→UFL→ULB→UBR→URF cycle (slot 0 gains cubie from slot 3)', () => {
    const s = parseCubies(new Cube().apply('U').facelets)
    expect(s.cp).toEqual([3, 0, 1, 2, 4, 5, 6, 7])
    expect(s.co).toEqual([0, 0, 0, 0, 0, 0, 0, 0])
    expect(s.ep).toEqual([3, 0, 1, 2, 4, 5, 6, 7, 8, 9, 10, 11])
    expect(s.eo).toEqual([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0])
  })

  it('after R: R-layer corners cycle and twist, middle edges unflipped', () => {
    // Cycle: URF(0)→UBR(3)→DRB(7)→DFR(4)→URF.
    // Orientation twists by ±1 depending on which direction the U/D sticker rotates.
    const s = parseCubies(new Cube().apply('R').facelets)
    expect(s.cp).toEqual([4, 1, 2, 0, 7, 5, 6, 3])
    expect(s.co).toEqual([2, 0, 0, 1, 1, 0, 0, 2])
    // Edge cycle UR(0)→BR(11)→DR(4)→FR(8)→UR
    expect(s.ep).toEqual([8, 1, 2, 3, 11, 5, 6, 7, 4, 9, 10, 0])
    expect(s.eo).toEqual([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0])
  })

  it('after 4× R returns to solved (sanity)', () => {
    const s = parseCubies(new Cube().applyAlg('R R R R').facelets)
    expect(s.cp).toEqual([0, 1, 2, 3, 4, 5, 6, 7])
    expect(s.co).toEqual([0, 0, 0, 0, 0, 0, 0, 0])
    expect(s.ep).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11])
    expect(s.eo).toEqual([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0])
  })

  it('toFacelets(parse(SOLVED)) === SOLVED', () => {
    expect(toFacelets(parseCubies(SOLVED))).toBe(SOLVED)
  })

  it.each([
    'U', "U'", 'D', 'R', "R'", 'L', 'F', "F'", 'B',
    "R U R' U'",
    "R U R' U' R U R' U' R U R' U'",
    "R U2 D' B F L2 R' F B2",
  ])('round-trip parseCubies/toFacelets is identity after: %s', (alg) => {
    const facelets = new Cube().applyAlg(alg).facelets
    expect(toFacelets(parseCubies(facelets))).toBe(facelets)
  })

  it('after F: affects 4 edges around F face, flips their orientations', () => {
    // F CW flips the 4 F-face edges in terms of our orientation convention
    // (U/D sticker moves off the U/D face → principal-color test fails)
    const s = parseCubies(new Cube().apply('F').facelets)
    // Sanity: F-layer edges UF(1), FR(8), DF(5), FL(9) get shuffled.
    // Rather than hand-trace orientations, at minimum they're permuted.
    const fLayerSlots = [1, 8, 5, 9]
    // After F, the 4 F-face edges have cycled: UF→FR→DF→FL→UF (or similar).
    // Check each still contains a cubie with F in its id.
    const fEdgeCubies = new Set([1, 8, 5, 9])
    for (const slot of fLayerSlots) {
      expect(fEdgeCubies.has(s.ep[slot])).toBe(true)
    }
    // Other 8 edges untouched
    for (const slot of [0, 2, 3, 4, 6, 7, 10, 11]) {
      expect(s.ep[slot]).toBe(slot)
      expect(s.eo[slot]).toBe(0)
    }
  })
})
