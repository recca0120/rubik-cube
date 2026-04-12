import { describe, it, expect } from 'vitest'
import { collapseMoves } from './collapseMoves'

describe('collapseMoves', () => {
  it('empty stays empty', () => {
    expect(collapseMoves([])).toEqual([])
  })

  it('single move unchanged', () => {
    expect(collapseMoves(['R'])).toEqual(['R'])
  })

  it('cancels X X\' adjacency', () => {
    expect(collapseMoves(['R', "R'"])).toEqual([])
    expect(collapseMoves(["U'", 'U'])).toEqual([])
  })

  it('merges X X → X2', () => {
    expect(collapseMoves(['R', 'R'])).toEqual(['R2'])
    expect(collapseMoves(['U', 'U'])).toEqual(['U2'])
  })

  it('X X2 → X\' and X2 X → X\'', () => {
    expect(collapseMoves(['R', 'R2'])).toEqual(["R'"])
    expect(collapseMoves(['R2', 'R'])).toEqual(["R'"])
  })

  it("X' X2 → X and X2 X' → X", () => {
    expect(collapseMoves(["R'", 'R2'])).toEqual(['R'])
    expect(collapseMoves(['R2', "R'"])).toEqual(['R'])
  })

  it('X2 X2 cancels', () => {
    expect(collapseMoves(['R2', 'R2'])).toEqual([])
  })

  it("X' X' → X2", () => {
    expect(collapseMoves(["R'", "R'"])).toEqual(['R2'])
  })

  it('does not merge moves on different faces', () => {
    expect(collapseMoves(['R', 'U'])).toEqual(['R', 'U'])
    expect(collapseMoves(['R', "U'"])).toEqual(['R', "U'"])
  })

  it('performs a cascade collapse', () => {
    // R U U' R' → R R' → []
    expect(collapseMoves(['R', 'U', "U'", "R'"])).toEqual([])
  })

  it('handles longer cascade', () => {
    // R R R → R2 R → R'
    expect(collapseMoves(['R', 'R', 'R'])).toEqual(["R'"])
  })

  it('preserves moves that do not cancel (F on opposite face)', () => {
    expect(collapseMoves(['R', 'L'])).toEqual(['R', 'L'])
  })

  it('accepts space-separated algorithm string', () => {
    // also exposed as string input for convenience
    expect(collapseMoves("R U U' R'".split(/\s+/))).toEqual([])
  })
})
