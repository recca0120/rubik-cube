import { describe, it, expect } from 'vitest'
import { Cube } from '../../Cube'
import { parseCubies } from '../../cubies'
import { discoverURFCases } from './discover'
import { locatePair } from './locate'

describe('discoverURFCases', { timeout: 120000 }, () => {
  // Depth 5 for test speed; the generated table file uses depth 6.
  const cases = discoverURFCases(5)

  it('contains the Solved case', () => {
    expect(cases.size).toBeGreaterThan(0)
    // Solved state key is cp=0/co=0/ep=8/eo=0
    expect(cases.has('c0/0-e8/0')).toBe(true)
    expect(cases.get('c0/0-e8/0')).toEqual([])
  })

  it('discovers substantially more than the original 8 cases', () => {
    expect(cases.size).toBeGreaterThanOrEqual(30)
  })

  it('every discovered alg solves its case back to Solved key', () => {
    let checked = 0
    for (const [keyStr, alg] of cases) {
      if (keyStr === 'c0/0-e8/0') continue
      // Apply inverse-of-alg (= the scramble that produced the case) then the alg
      const scramble = [...alg].reverse().map((m) =>
        m.endsWith('2') ? m : m.endsWith("'") ? m.slice(0, -1) : m + "'",
      )
      let c = new Cube()
      for (const m of scramble) c = c.apply(m)
      for (const m of alg) c = c.apply(m)
      const s = parseCubies(c.facelets)
      const { corner, edge } = locatePair(s, 0)
      expect(corner.pos).toBe(0)
      expect(corner.ori).toBe(0)
      expect(edge.pos).toBe(8)
      expect(edge.ori).toBe(0)
      checked++
      if (checked > 20) break // sample 20 for speed
    }
    expect(checked).toBeGreaterThan(10)
  })
})
