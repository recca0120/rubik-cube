import { describe, it, expect, vi } from 'vitest'
import { Cube } from '../../Cube'
import { parseCubies, toFacelets } from '../../cubies'
import { SOLVED_CUBIES } from '../../cubieMoves'
import { Cube as CubejsCube } from '../../cubejs-shim'
import { constructCaseState } from './fillMissing'
import { locatePair } from './locate'

vi.mock('../../solver', async () => {
  let inited = false
  return {
    initSolver: vi.fn(async () => {
      if (!inited) { CubejsCube.initSolver(); inited = true }
    }),
    solve: vi.fn(async (facelets: string) => {
      if (!inited) { CubejsCube.initSolver(); inited = true }
      return CubejsCube.fromString(facelets).solve() ?? ''
    }),
  }
})


describe('constructCaseState', () => {
  it('solved case returns solved state', () => {
    const s = constructCaseState(0, { cornerPos: 0, cornerOri: 0, edgePos: 8, edgeOri: 0 })
    expect(s).toEqual(SOLVED_CUBIES)
  })

  it('constructed state matches the requested case key for slot 0', () => {
    const key = { cornerPos: 4, cornerOri: 0, edgePos: 8, edgeOri: 0 }
    const s = constructCaseState(0, key)!
    expect(s).toBeTruthy()
    // Cross must be intact
    for (let i = 0; i < 4; i++) {
      expect(s.ep[i]).toBe(i)
      expect(s.eo[i]).toBe(0)
    }
    // Slot 0's corner + edge match key
    const { corner, edge } = locatePair(s, 0)
    expect(corner.pos).toBe(key.cornerPos)
    expect(corner.ori).toBe(key.cornerOri)
    expect(edge.pos).toBe(key.edgePos)
    expect(edge.ori).toBe(key.edgeOri)
  })

  it('constructed state converts to valid facelets (round-trip via parseCubies)', () => {
    const key = { cornerPos: 4, cornerOri: 2, edgePos: 5, edgeOri: 1 }
    const s = constructCaseState(0, key)!
    const f = toFacelets(s)
    expect(f.length).toBe(54)
    const parsed = parseCubies(f)
    expect(parsed.cp).toEqual(s.cp)
    expect(parsed.co).toEqual(s.co)
    expect(parsed.ep).toEqual(s.ep)
    expect(parsed.eo).toEqual(s.eo)
  })

  it('constructed state satisfies cube group constraints', () => {
    const key = { cornerPos: 4, cornerOri: 2, edgePos: 5, edgeOri: 1 }
    const s = constructCaseState(0, key)!
    // co sum mod 3 = 0
    expect(s.co.reduce((a, b) => a + b, 0) % 3).toBe(0)
    // eo sum mod 2 = 0
    expect(s.eo.reduce((a, b) => a + b, 0) % 2).toBe(0)
    // Permutation parity: cp and ep parities together must be even.
    // (Count inversions.)
    const parity = (arr: number[]) => {
      let p = 0
      for (let i = 0; i < arr.length; i++)
        for (let j = i + 1; j < arr.length; j++)
          if (arr[i] > arr[j]) p++
      return p % 2
    }
    expect((parity(s.cp) + parity(s.ep)) % 2).toBe(0)
  })

  it('returned state is actually reachable (checked by round-tripping through Cube)', () => {
    // Cube constructor validates facelets implicitly
    const key = { cornerPos: 5, cornerOri: 1, edgePos: 7, edgeOri: 0 }
    const s = constructCaseState(0, key)!
    const f = toFacelets(s)
    expect(() => new Cube(f)).not.toThrow()
  })

  it('works for all 4 slots', () => {
    for (const slot of [0, 1, 2, 3] as const) {
      const homeCorner = slot
      const homeEdge = 8 + slot
      const s = constructCaseState(slot, {
        cornerPos: homeCorner,
        cornerOri: 0,
        edgePos: homeEdge,
        edgeOri: 0,
      })!
      expect(s.cp[homeCorner]).toBe(homeCorner)
      expect(s.ep[homeEdge]).toBe(homeEdge)
    }
  })
})

describe('findAlgForCase (cubejs-based)', () => {
  it('finds an alg that solves a specific missing case (c4/0-e8/0 for slot 0)', { timeout: 30000 }, async () => {
    const { findAlgForCase } = await import('./fillMissing')
    const key = { cornerPos: 4, cornerOri: 0, edgePos: 8, edgeOri: 0 }
    const alg = await findAlgForCase(0, key)
    expect(alg).toBeTruthy()
    expect(alg!.length).toBeGreaterThan(0)
    // Verify: applying alg to the constructed state solves slot 0's pair
    const state = constructCaseState(0, key)!
    const cube = new Cube(toFacelets(state))
    const final = alg!.reduce((c, m) => c.apply(m), cube)
    const fs = parseCubies(final.facelets)
    expect(fs.cp[0]).toBe(0)
    expect(fs.co[0]).toBe(0)
    expect(fs.ep[8]).toBe(8)
    expect(fs.eo[8]).toBe(0)
  })
})
