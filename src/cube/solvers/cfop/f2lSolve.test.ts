import { describe, it, expect } from 'vitest'
import { Cube } from '../../Cube'
import { parseCubies } from '../../cubies'
import { isWhiteCrossSolved } from '../../stages'
import { solveF2LPair } from './f2lSolve'
import type { F2LSlot } from './locate'
import { SLOT_CASE_TABLES } from './slotCaseTables.generated'

function apply(cube: Cube, moves: string[]): Cube {
  return moves.reduce((c, m) => c.apply(m), cube)
}

function inverseMoves(moves: readonly string[]): string[] {
  return [...moves].reverse().map((m) => {
    if (m.endsWith('2')) return m
    return m.endsWith("'") ? m.slice(0, -1) : m + "'"
  })
}

function pairHome(cube: Cube, slot: F2LSlot): boolean {
  const s = parseCubies(cube.facelets)
  return s.cp[slot] === slot && s.co[slot] === 0 && s.ep[8 + slot] === 8 + slot && s.eo[8 + slot] === 0
}

describe('solveF2LPair', () => {
  it('returns [] for solved cube, any slot', () => {
    expect(solveF2LPair(new Cube(), 0)).toEqual([])
    expect(solveF2LPair(new Cube(), 1)).toEqual([])
    expect(solveF2LPair(new Cube(), 2)).toEqual([])
    expect(solveF2LPair(new Cube(), 3)).toEqual([])
  })

  it.each([0, 1, 2, 3] as const)('slot %s solves 5 sampled own-table cases', (slot) => {
    const sample = SLOT_CASE_TABLES[slot].filter(([, alg]) => alg.length > 0).slice(0, 5)
    for (const [, alg] of sample) {
      const scramble = inverseMoves(alg)
      const scrambled = apply(new Cube(), scramble)
      expect(isWhiteCrossSolved(scrambled.facelets)).toBe(true)
      const result = solveF2LPair(scrambled, slot)
      const final = apply(scrambled, result)
      expect(pairHome(final, slot)).toBe(true)
    }
  })
})
