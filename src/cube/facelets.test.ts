import { describe, it, expect } from 'vitest'
import { faceletIndex, FACE_COLOR } from './facelets'
import { SOLVED } from './Cube'

describe('FACE_COLOR (classic Rubik palette)', () => {
  it('U is pure white', () => expect(FACE_COLOR.U.toLowerCase()).toBe('#ffffff'))
  it('D is bright yellow', () => expect(FACE_COLOR.D.toLowerCase()).toBe('#ffd500'))
  it('R is red', () => expect(FACE_COLOR.R.toLowerCase()).toBe('#c41e3a'))
  it('L is orange', () => expect(FACE_COLOR.L.toLowerCase()).toBe('#ff6b1a'))
  it('F is green', () => expect(FACE_COLOR.F.toLowerCase()).toBe('#009e4f'))
  it('B is blue', () => expect(FACE_COLOR.B.toLowerCase()).toBe('#0051ba'))
})

describe('faceletIndex', () => {
  it('returns null for interior faces', () => {
    expect(faceletIndex(0, 0, 0, 'U')).toBeNull()
    expect(faceletIndex(1, 0, 0, 'U')).toBeNull() // R face but asking U
  })

  it('URFDLB corner indices match Kociemba convention', () => {
    // U[0] = top-back-left cubie's U sticker
    expect(faceletIndex(-1, 1, -1, 'U')).toBe(0)
    // U[8] = top-front-right
    expect(faceletIndex(1, 1, 1, 'U')).toBe(8)
    // R[0] = URF corner's R sticker
    expect(faceletIndex(1, 1, 1, 'R')).toBe(9)
    // F[0] = ULF corner's F sticker
    expect(faceletIndex(-1, 1, 1, 'F')).toBe(18)
    // D[0] = DLF corner (front-left viewed from below)
    expect(faceletIndex(-1, -1, 1, 'D')).toBe(27)
    // L[0] = ULB corner's L sticker
    expect(faceletIndex(-1, 1, -1, 'L')).toBe(36)
    // B[0] = URB corner's B sticker
    expect(faceletIndex(1, 1, -1, 'B')).toBe(45)
  })

  it('center of each face has canonical index', () => {
    expect(faceletIndex(0, 1, 0, 'U')).toBe(4)
    expect(faceletIndex(1, 0, 0, 'R')).toBe(13)
    expect(faceletIndex(0, 0, 1, 'F')).toBe(22)
    expect(faceletIndex(0, -1, 0, 'D')).toBe(31)
    expect(faceletIndex(-1, 0, 0, 'L')).toBe(40)
    expect(faceletIndex(0, 0, -1, 'B')).toBe(49)
  })

  it('SOLVED has each face center match its letter', () => {
    for (const [dir, center] of [['U', 4], ['R', 13], ['F', 22], ['D', 31], ['L', 40], ['B', 49]] as const) {
      expect(SOLVED[center]).toBe(dir)
    }
  })
})
