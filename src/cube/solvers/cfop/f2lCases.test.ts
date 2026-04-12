import { describe, it, expect } from 'vitest'
import { Cube } from '../../Cube'
import { parseCubies } from '../../cubies'
import { isWhiteCrossSolved } from '../../stages'
import { identifyCaseURF, solveF2LPairURF } from './f2lCases'
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

describe('identifyCaseURF', () => {
  it('solved cube returns home-home key', () => {
    const key = identifyCaseURF(parseCubies(new Cube().facelets))
    expect(key).toEqual({ cornerPos: 0, cornerOri: 0, edgePos: 8, edgeOri: 0 })
  })
})

describe('solveF2LPairURF', () => {
  it('returns [] when URF pair is already home', () => {
    expect(solveF2LPairURF(new Cube())).toEqual([])
  })

  // Sample 15 entries from the generated case table; each entry's alg should
  // solve a state produced by applying its inverse to a solved cube.
  const sample = URF_CASE_TABLE.filter(([, alg]) => alg.length > 0).slice(0, 15)

  it.each(sample)('solves case %s (alg len %i)', (keyStr, alg) => {
    const scramble = inverseMoves(alg)
    const state = apply(new Cube(), scramble)
    expect(isWhiteCrossSolved(state.facelets)).toBe(true)
    const solveAlg = solveF2LPairURF(state)
    const final = apply(state, solveAlg)
    const s = parseCubies(final.facelets)
    expect(s.cp[0]).toBe(0)
    expect(s.co[0]).toBe(0)
    expect(s.ep[8]).toBe(8)
    expect(s.eo[8]).toBe(0)
    expect(keyStr).toBeDefined()
  })
})
