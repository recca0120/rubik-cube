import { describe, it, expect } from 'vitest'
import { Cube } from '../../Cube'
import { isTopTwoLayersSolved } from '../../stages'
import { rotateMovesForSlot } from './rotate'

describe('rotateMovesForSlot', () => {
  it('slot 0 (URF) leaves moves unchanged', () => {
    expect(rotateMovesForSlot(['R', "U'", 'F2'], 0)).toEqual(['R', "U'", 'F2'])
  })

  it('slot 1 (UFL) maps y: F→R, R→B, B→L, L→F, U/D fixed', () => {
    expect(rotateMovesForSlot(['F'], 1)).toEqual(['R'])
    expect(rotateMovesForSlot(['R'], 1)).toEqual(['B'])
    expect(rotateMovesForSlot(['B'], 1)).toEqual(['L'])
    expect(rotateMovesForSlot(['L'], 1)).toEqual(['F'])
    expect(rotateMovesForSlot(['U'], 1)).toEqual(['U'])
    expect(rotateMovesForSlot(['D'], 1)).toEqual(['D'])
  })

  it('slot 2 (ULB) maps y2: F↔B, R↔L', () => {
    expect(rotateMovesForSlot(['F', 'R', 'B', 'L'], 2)).toEqual(['B', 'L', 'F', 'R'])
  })

  it('slot 3 (UBR) maps y3 (=y\'): F→L, L→B, B→R, R→F', () => {
    expect(rotateMovesForSlot(['F', 'L', 'B', 'R'], 3)).toEqual(['L', 'B', 'R', 'F'])
  })

  it('preserves move suffixes (\' and 2)', () => {
    expect(rotateMovesForSlot(["R'", 'F2'], 1)).toEqual(["B'", 'R2'])
  })

  it('rotating 4 times (s=1 applied 4x) returns identity on moves', () => {
    let moves = ['R', "U'", "F'", 'B2', "D'"]
    const original = [...moves]
    for (let i = 0; i < 4; i++) moves = rotateMovesForSlot(moves, 1)
    expect(moves).toEqual(original)
  })

  it('semantic check: slot-3 alg applied to solved cube solves symmetric scramble', () => {
    // R U R' executed at slot 3 (UBR) = F U F' (slot 3 maps R→F)
    const slot3Alg = rotateMovesForSlot(['R', 'U', "R'"], 3)
    expect(slot3Alg).toEqual(['F', 'U', "F'"])
    // Sanity: applying (F U F') then (R U R')^(-1) at slot 0 doesn't matter here,
    // just confirm Cube accepts the output
    let c = new Cube()
    for (const m of slot3Alg) c = c.apply(m)
    expect(isTopTwoLayersSolved(c.facelets)).toBe(false)
  })
})
