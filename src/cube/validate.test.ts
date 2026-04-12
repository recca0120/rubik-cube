import { describe, it, expect } from 'vitest'
import { validateFacelets } from './validate'
import { SOLVED } from './Cube'

describe('validateFacelets', () => {
  it('solved state is valid', () => {
    expect(validateFacelets(SOLVED)).toEqual({ valid: true })
  })

  it('rejects wrong length', () => {
    const r = validateFacelets('UUU')
    expect(r.valid).toBe(false)
  })

  it('rejects face count mismatch', () => {
    const bad = SOLVED.replace('U', 'R') // one U swapped to R
    const r = validateFacelets(bad)
    expect(r.valid).toBe(false)
    if (!r.valid) {
      expect(r.errors.some((e) => e.includes('U'))).toBe(true)
      expect(r.errors.some((e) => e.includes('R'))).toBe(true)
    }
  })

  it('rejects wrong center', () => {
    // Swap U center (index 4) with another U elsewhere; keeps counts but center letter changes.
    const arr = [...SOLVED]
    arr[4] = 'D'
    arr[31] = 'U'
    const r = validateFacelets(arr.join(''))
    expect(r.valid).toBe(false)
  })
})
