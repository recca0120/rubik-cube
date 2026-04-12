import { SOLVED } from './Cube'

export type ValidationResult = { valid: true } | { valid: false; errors: string[] }

const FACES = ['U', 'R', 'F', 'D', 'L', 'B'] as const
const CENTER_INDEX = [4, 13, 22, 31, 40, 49]

/**
 * Basic structural validation for a 54-char facelets string.
 *   - length === 54
 *   - each face letter appears exactly 9 times
 *   - each center sticker is its own face letter
 *
 * Does NOT verify corner/edge parity — cubejs solver will catch unsolvable states.
 */
export function validateFacelets(facelets: string): ValidationResult {
  const errors: string[] = []
  if (facelets.length !== 54) {
    return { valid: false, errors: [`length must be 54 (got ${facelets.length})`] }
  }
  for (const f of FACES) {
    const count = [...facelets].filter((c) => c === f).length
    if (count !== 9) errors.push(`face ${f} has ${count} stickers, expected 9`)
  }
  for (let i = 0; i < 6; i++) {
    const expected = FACES[i]
    const actual = facelets[CENTER_INDEX[i]]
    if (actual !== expected) {
      errors.push(`center at position ${CENTER_INDEX[i]} should be ${expected}, got ${actual}`)
    }
  }
  return errors.length === 0 ? { valid: true } : { valid: false, errors }
}

export function isSolved(facelets: string): boolean {
  return facelets === SOLVED
}
