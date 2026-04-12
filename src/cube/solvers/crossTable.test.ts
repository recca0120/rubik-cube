import { describe, it, expect } from 'vitest'
import { Cube } from '../Cube'
import { isWhiteCrossSolved } from '../stages'
import { parseCubies } from '../cubies'
import { buildCrossTable, buildCrossTableFromBFS, crossKey, lookupNextMove } from './crossTable'

describe('crossTable', () => {
  const table = buildCrossTable()

  it('contains all reachable cross states', () => {
    // The cross has 11880 × 16 = 190080 theoretically distinct (slot, ori) tuples
    // but parity constraints (edge orientation sum, permutation parity with
    // identity corners assumed) reduce reachable states. We expect > 100K.
    expect(table.size).toBeGreaterThan(100_000)
  })

  it('solved cross state maps to no move', () => {
    const solvedKey = crossKey(parseCubies(new Cube().facelets))
    expect(table.get(solvedKey)).toBe('')
  })

  it('single-move scramble has a 1-step solution', () => {
    // After R, the cross state requires R' to return.
    const c = new Cube().apply('R')
    const first = lookupNextMove(c, table)
    expect(first).toBe("R'")
  })

  it('lookupNextMove returns null for already-solved cube', () => {
    expect(lookupNextMove(new Cube(), table)).toBeNull()
  })

  it('precomputed table matches BFS rebuild (key + value parity)', { timeout: 60000 }, () => {
    const fresh = buildCrossTableFromBFS()
    expect(table.size).toBe(fresh.size)
    // Spot-check a sample
    let checked = 0
    for (const [k, v] of fresh) {
      expect(table.get(k)).toBe(v)
      if (++checked > 500) break
    }
  })

  it('iterated lookup produces a valid cross solution', () => {
    let c = new Cube().applyAlg("R U2 F' L D")
    const moves: string[] = []
    for (let i = 0; i < 20 && !isWhiteCrossSolved(c.facelets); i++) {
      const m = lookupNextMove(c, table)
      if (!m) break
      moves.push(m)
      c = c.apply(m)
    }
    expect(isWhiteCrossSolved(c.facelets)).toBe(true)
    expect(moves.length).toBeLessThanOrEqual(8)
  })
})
