import { describe, it, expect } from 'vitest'
import { Cube, SOLVED } from './Cube'

describe('Cube', () => {
  it('starts solved', () => {
    const c = new Cube()
    expect(c.facelets).toBe(SOLVED)
    expect(c.isSolved()).toBe(true)
  })

  it('SOLVED is 54 chars with 9 of each face', () => {
    expect(SOLVED).toHaveLength(54)
    for (const f of 'URFDLB') {
      expect([...SOLVED].filter((c) => c === f)).toHaveLength(9)
    }
  })

  it('apply U breaks solved state', () => {
    const c = new Cube().apply('U')
    expect(c.isSolved()).toBe(false)
  })

  describe.each(['U', 'D', 'L', 'R', 'F', 'B'])('basic move %s', (m) => {
    it('4× returns to solved', () => {
      const c = new Cube().apply(m).apply(m).apply(m).apply(m)
      expect(c.isSolved()).toBe(true)
    })

    it("move then move' returns to solved", () => {
      const c = new Cube().apply(m).apply(`${m}'`)
      expect(c.isSolved()).toBe(true)
    })

    it('move2 equals move×2', () => {
      const a = new Cube().apply(`${m}2`)
      const b = new Cube().apply(m).apply(m)
      expect(a.facelets).toBe(b.facelets)
    })
  })

  it('sexy move (R U R\' U\') × 6 returns to solved', () => {
    const c = new Cube().applyAlg("R U R' U' R U R' U' R U R' U' R U R' U' R U R' U' R U R' U'")
    expect(c.isSolved()).toBe(true)
  })

  it('applyAlg parses notation', () => {
    const a = new Cube().applyAlg("R U2 R'")
    const b = new Cube().apply('R').apply('U').apply('U').apply("R'")
    expect(a.facelets).toBe(b.facelets)
  })

  it('randomScramble produces 25 moves without repeating face', () => {
    const alg = Cube.randomScramble()
    const moves = alg.split(' ')
    expect(moves).toHaveLength(25)
    for (let i = 1; i < moves.length; i++) {
      expect(moves[i][0]).not.toBe(moves[i - 1][0])
    }
    // applying the scramble produces a valid (non-solved likely) state
    const c = new Cube().applyAlg(alg)
    expect(c.facelets).toHaveLength(54)
  })

  it('clone is independent', () => {
    const a = new Cube()
    const b = a.clone().apply('U')
    expect(a.isSolved()).toBe(true)
    expect(b.isSolved()).toBe(false)
  })
})
