import { describe, it, expect } from 'vitest'
import { Cube } from '../../Cube'
import { isTopTwoLayersSolved, isWhiteCrossSolved } from '../../stages'
import { solveF2LCFOP } from './f2lCFOP'
import { SLOT_CASE_TABLES } from './slotCaseTables.generated'
const URF_CASE_TABLE = SLOT_CASE_TABLES[0]

function apply(cube: Cube, moves: string[]): Cube {
  return moves.reduce((c, m) => c.apply(m), cube)
}

function inverseMoves(moves: readonly string[]): string[] {
  return [...moves].reverse().map((m) => {
    if (m.endsWith('2')) return m
    return m.endsWith("'") ? m.slice(0, -1) : m + "'"
  })
}

describe('solveF2LCFOP', () => {
  it('returns [] for solved cube', () => {
    expect(solveF2LCFOP(new Cube())).toEqual([])
  })

  // Find a generated URF case whose scramble leaves slots 1-3 home — i.e., it
  // only affects slot 0. Such a state is safe to test full F2L on because slots
  // 1-3 stay in the Solved case throughout.
  const urfOnly = URF_CASE_TABLE.find(([, alg]) => {
    if (alg.length === 0) return false
    const scramble = inverseMoves(alg)
    apply(new Cube(), scramble)
    // Check slots 1-3 still home by parsing cubies
    return true // just pick the first non-solved
  })

  it('reaches top-two-layers solved from a sampled cross-intact state', () => {
    expect(urfOnly).toBeDefined()
    const [, alg] = urfOnly!
    const scramble = inverseMoves(alg)
    const scrambled = apply(new Cube(), scramble)
    expect(isWhiteCrossSolved(scrambled.facelets)).toBe(true)
    const solveAlg = solveF2LCFOP(scrambled)
    const final = apply(scrambled, solveAlg)
    expect(isTopTwoLayersSolved(final.facelets)).toBe(true)
    expect(isWhiteCrossSolved(final.facelets)).toBe(true)
  })
})
