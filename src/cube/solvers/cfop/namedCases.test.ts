import { describe, it, expect } from 'vitest'
import { describeCase } from './namedCases'

describe('describeCase', () => {
  it('names Solved when pair is home', () => {
    expect(describeCase(0, { cornerPos: 0, cornerOri: 0, edgePos: 8, edgeOri: 0 })).toEqual({
      name: 'Solved',
      description: 'Pair 已歸位',
    })
    expect(describeCase(1, { cornerPos: 1, cornerOri: 0, edgePos: 9, edgeOri: 0 })).toEqual({
      name: 'Solved',
      description: 'Pair 已歸位',
    })
  })

  it('names Edge-Only when corner home but edge displaced', () => {
    const r = describeCase(0, { cornerPos: 0, cornerOri: 0, edgePos: 5, edgeOri: 0 })
    expect(r.name).toBe('Edge-Only-DF')
    expect(r.description).toMatch(/角塊已歸位/)
  })

  it('names Corner-Only when edge home but corner displaced', () => {
    const r = describeCase(0, { cornerPos: 4, cornerOri: 2, edgePos: 8, edgeOri: 0 })
    expect(r.name).toBe('Corner-Only-DFR')
    expect(r.description).toMatch(/邊塊已歸位/)
    expect(r.description).toMatch(/L傾/)
  })

  it('names D-Layer-Pair for corner in D + edge displaced', () => {
    const r = describeCase(0, { cornerPos: 4, cornerOri: 0, edgePos: 5, edgeOri: 1 })
    expect(r.name).toBe('D-Layer-Pair-DFR')
    expect(r.description).toMatch(/D 層組 pair/)
    expect(r.description).toMatch(/DF翻/)
  })

  it('names Misplaced-U for corner stuck in U wrong slot', () => {
    const r = describeCase(0, { cornerPos: 2, cornerOri: 1, edgePos: 8, edgeOri: 1 })
    // Edge at home pos but flipped → corner-only? wait edgeOri=1 so edge not home
    // Let's use edgePos != 8
    const r2 = describeCase(0, { cornerPos: 2, cornerOri: 1, edgePos: 7, edgeOri: 0 })
    expect(r2.name).toBe('Misplaced-U-ULB')
    expect(r2.description).toMatch(/卡在/)
    void r
  })
})
