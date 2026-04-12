import { describe, it, expect } from 'vitest'
import { friendlyMove } from './friendlyMove'

describe('friendlyMove', () => {
  it('maps single-letter CW: R → 右 ↻', () => {
    expect(friendlyMove('U')).toBe('上 ↻')
    expect(friendlyMove('D')).toBe('下 ↻')
    expect(friendlyMove('L')).toBe('左 ↻')
    expect(friendlyMove('R')).toBe('右 ↻')
    expect(friendlyMove('F')).toBe('前 ↻')
    expect(friendlyMove('B')).toBe('後 ↻')
  })

  it('maps prime (CCW): R\' → 右 ↺', () => {
    expect(friendlyMove("U'")).toBe('上 ↺')
    expect(friendlyMove("R'")).toBe('右 ↺')
    expect(friendlyMove("F'")).toBe('前 ↺')
  })

  it('maps double: R2 → 右 180°', () => {
    expect(friendlyMove('U2')).toBe('上 180°')
    expect(friendlyMove('R2')).toBe('右 180°')
    expect(friendlyMove('B2')).toBe('後 180°')
  })

  it('returns original string for unknown input', () => {
    expect(friendlyMove('')).toBe('')
    expect(friendlyMove('X')).toBe('X')
    expect(friendlyMove('R3')).toBe('R3')
  })
})
