export type PieceKind = 'center' | 'edge' | 'corner'

export function pieceKind(x: number, y: number, z: number): PieceKind {
  const nonZero = (x !== 0 ? 1 : 0) + (y !== 0 ? 1 : 0) + (z !== 0 ? 1 : 0)
  if (nonZero === 1) return 'center'
  if (nonZero === 2) return 'edge'
  return 'corner'
}
