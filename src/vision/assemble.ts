import type { FaceLetter } from './colors'

/** Assemble 6 face strings (each 9 chars) into a 54-char URFDLB facelets string. */
export function assembleFacelets(faces: Record<FaceLetter, string>): string {
  const order: FaceLetter[] = ['U', 'R', 'F', 'D', 'L', 'B']
  for (const f of order) {
    if (!faces[f] || faces[f].length !== 9) {
      throw new Error(`face ${f} is missing or has wrong length`)
    }
  }
  return order.map((f) => faces[f]).join('')
}
