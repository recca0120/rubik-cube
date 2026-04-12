import { describe, it, expect } from 'vitest'
import { invertAlg } from './invertAlg'

describe('invertAlg', () => {
  it('empty alg → empty', () => {
    expect(invertAlg('')).toBe('')
    expect(invertAlg('   ')).toBe('')
  })
  it('single move: R → R\'', () => {
    expect(invertAlg('R')).toBe("R'")
  })
  it("single prime: R' → R", () => {
    expect(invertAlg("R'")).toBe('R')
  })
  it('double turn is its own inverse: R2 → R2', () => {
    expect(invertAlg('R2')).toBe('R2')
  })
  it('reverses order AND inverts each move', () => {
    expect(invertAlg("R U R' U'")).toBe('U R U\' R\'')
  })
  it('handles extra whitespace', () => {
    expect(invertAlg('  R  U  R\'  ')).toBe("R U' R'")
  })
  it('is an involution: invertAlg(invertAlg(x)) === x (normalized)', () => {
    const x = "R U R' U' F2 L D'"
    expect(invertAlg(invertAlg(x))).toBe(x)
  })
})
