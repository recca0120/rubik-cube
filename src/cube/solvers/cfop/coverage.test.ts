import { describe, it, expect } from 'vitest'
import { Cube } from '../../Cube'
import { solveWhiteCross } from '../whiteCross'
import { solveF2LCFOP } from './f2lCFOP'

const SCRAMBLES = [
  "R U R' U R U2 R'",
  "F R U R' U' F'",
  "R U' R' U2 R U' R' U R U' R'",
  "L' U2 L U' L' U L",
  "F' L' U' L U F",
  "R U R' U' R U R' U'",
  "U R U' R' U R U' R'",
  "F U F' U' F U F' U'",
  "R U2 R' U' R U' R'",
  "R2 U R' U' R U2 R'",
  "D R U R' D' R U' R'",
  "R U' R' F R F'",
  "U' F' U F U R U' R'",
  "L U L' U L U2 L'",
  "R U R' U' F R F'",
  "R' F R F' R U R'",
  "U R U2 R' U' R U R'",
  "R U2 R2 U' R2 U' R'",
  "F R U R' F' U R U' R'",
  "R U R' U' R U' R' F R F'",
]

describe('CFOP F2L coverage', () => {
  it('reports hit rate across realistic cross-preserving scrambles', { timeout: 60000 }, () => {
    let hit = 0
    for (const scramble of SCRAMBLES) {
      let c = new Cube()
      for (const m of scramble.split(/\s+/)) c = c.apply(m)
      const cross = solveWhiteCross(c)
      for (const m of cross) c = c.apply(m)
      try {
        solveF2LCFOP(c)
        hit++
      } catch {
        // miss — counted via hit rate below
      }
    }
    const rate = (hit / SCRAMBLES.length) * 100
    // Current: 100% expected after BFS (short algs) + cubejs-filled extended table.
    expect(rate).toBeGreaterThanOrEqual(95)
  })
})
