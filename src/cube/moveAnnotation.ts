/**
 * Translate a single move (e.g. "R'") into a human-friendly Chinese annotation.
 */

export const FACE_NAMES: Record<string, string> = {
  U: '頂面',
  D: '底面',
  L: '左面',
  R: '右面',
  F: '前面',
  B: '後面',
}

export type MoveAnnotation = {
  move: string
  face: string
  direction: string
  /** Combined sentence, e.g. "逆時針 90° 轉右面". */
  text: string
}

export function annotateMove(move: string): MoveAnnotation | null {
  const faceLetter = move[0]
  if (!(faceLetter in FACE_NAMES)) return null
  const suffix = move.slice(1)
  if (suffix !== '' && suffix !== "'" && suffix !== '2') return null

  const face = FACE_NAMES[faceLetter]
  const direction = suffix === '2' ? '180°' : suffix === "'" ? '逆時針 90°' : '順時針 90°'
  const text = suffix === '2' ? `180° 轉${face}` : `${direction} 轉${face}`
  return { move, face, direction, text }
}
