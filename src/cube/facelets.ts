/**
 * Map 3D cubie position + face direction → facelet index (0-53) or null if interior.
 *
 * Convention:
 *   +X = Right, -X = Left
 *   +Y = Up,    -Y = Down
 *   +Z = Front, -Z = Back
 *
 * Face order within facelets string: URFDLB (each face 9 stickers, row-major).
 */

export type FaceDir = 'U' | 'D' | 'R' | 'L' | 'F' | 'B'

const FACE_OFFSET: Record<FaceDir, number> = { U: 0, R: 9, F: 18, D: 27, L: 36, B: 45 }

const FACE_CYCLE: FaceDir[] = ['U', 'R', 'F', 'D', 'L', 'B']
export function cycleFace(c: string): FaceDir {
  const i = FACE_CYCLE.indexOf(c as FaceDir)
  return FACE_CYCLE[(i + 1) % 6]
}

export function faceletIndex(x: number, y: number, z: number, dir: FaceDir): number | null {
  const onFace =
    (dir === 'U' && y === 1) ||
    (dir === 'D' && y === -1) ||
    (dir === 'R' && x === 1) ||
    (dir === 'L' && x === -1) ||
    (dir === 'F' && z === 1) ||
    (dir === 'B' && z === -1)
  if (!onFace) return null

  let row: number, col: number
  switch (dir) {
    case 'U':
      row = z === -1 ? 0 : z === 0 ? 1 : 2
      col = x === -1 ? 0 : x === 0 ? 1 : 2
      break
    case 'D':
      row = z === 1 ? 0 : z === 0 ? 1 : 2
      col = x === -1 ? 0 : x === 0 ? 1 : 2
      break
    case 'R':
      row = y === 1 ? 0 : y === 0 ? 1 : 2
      col = z === 1 ? 0 : z === 0 ? 1 : 2
      break
    case 'L':
      row = y === 1 ? 0 : y === 0 ? 1 : 2
      col = z === -1 ? 0 : z === 0 ? 1 : 2
      break
    case 'F':
      row = y === 1 ? 0 : y === 0 ? 1 : 2
      col = x === -1 ? 0 : x === 0 ? 1 : 2
      break
    case 'B':
      row = y === 1 ? 0 : y === 0 ? 1 : 2
      col = x === 1 ? 0 : x === 0 ? 1 : 2
      break
  }
  return FACE_OFFSET[dir] + row * 3 + col
}

// Classic Rubik's colors for clear teaching recognition.
export const FACE_COLOR: Record<string, string> = {
  U: '#ffffff',
  D: '#ffd500',
  R: '#c41e3a',
  L: '#ff6b1a',
  F: '#009e4f',
  B: '#0051ba',
}
