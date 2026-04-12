/** Pulse emissive intensity for the face-highlight effect.
 *  Centered at 0.4, amplitude 0.2, ω = 3 rad/s. Smooth breathing feel.
 *  Pure function of t so it can be driven by useFrame or unit-tested. */
export function pulseIntensity(t: number): number {
  return 0.4 + 0.2 * Math.sin(t * 3)
}

/** Parse a single move like 'R' / "R'" / 'R2' into face + direction. */
export type MoveDirection = 'cw' | 'ccw' | '180'
export function parseMoveDirection(move: string): { face: string; direction: MoveDirection } | null {
  if (!move) return null
  const face = move[0]
  if (!'UDLRFB'.includes(face)) return null
  if (move.endsWith("'")) return { face, direction: 'ccw' }
  if (move.endsWith('2')) return { face, direction: '180' }
  return { face, direction: 'cw' }
}

/** Idle-state auto-rotation speed (rad/s). Zero while anything active.
 *  Also zero while in wizard mode (kids are learning — cube must be stable). */
export function idleRotationSpeed(input: {
  queueLength: number
  highlightedFace: string | null
  mode?: 'wizard' | 'sandbox'
}): number {
  if (input.queueLength > 0) return 0
  if (input.highlightedFace !== null) return 0
  if (input.mode === 'wizard') return 0
  return 0.15
}
