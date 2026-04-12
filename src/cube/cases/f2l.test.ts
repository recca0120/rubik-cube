import { describe, it, expect } from 'vitest'
import { Cube, SOLVED } from '../Cube'
import { invertAlg } from '../invertAlg'
import { F2L_CASES } from './f2l'

describe('F2L_CASES', () => {
  it('has 41 cases (CFOP standard)', () => {
    expect(F2L_CASES.length).toBe(41)
  })

  it('each case id is unique', () => {
    const ids = F2L_CASES.map((c) => c.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it.each(F2L_CASES)('$id alg is parseable + reversible', (c) => {
    // If the alg has invalid notation, applyAlg throws.
    const scrambled = new Cube().applyAlg(invertAlg(c.alg))
    const restored = scrambled.applyAlg(c.alg)
    expect(restored.facelets).toBe(SOLVED)
  })

  it.each(F2L_CASES)('$id has non-empty name + description', (c) => {
    expect(c.name.length).toBeGreaterThan(0)
    expect(c.description.length).toBeGreaterThan(0)
  })
})
