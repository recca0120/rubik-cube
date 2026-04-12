import { describe, it, expect } from 'vitest'
import { assembleFacelets } from './assemble'
import { SOLVED } from '@/cube/Cube'

describe('assembleFacelets', () => {
  it('assembles 6 solved faces into SOLVED', () => {
    expect(
      assembleFacelets({
        U: 'UUUUUUUUU',
        R: 'RRRRRRRRR',
        F: 'FFFFFFFFF',
        D: 'DDDDDDDDD',
        L: 'LLLLLLLLL',
        B: 'BBBBBBBBB',
      }),
    ).toBe(SOLVED)
  })

  it('throws when a face has wrong length', () => {
    expect(() =>
      assembleFacelets({
        U: 'UUU',
        R: 'RRRRRRRRR',
        F: 'FFFFFFFFF',
        D: 'DDDDDDDDD',
        L: 'LLLLLLLLL',
        B: 'BBBBBBBBB',
      }),
    ).toThrow(/U/)
  })
})
