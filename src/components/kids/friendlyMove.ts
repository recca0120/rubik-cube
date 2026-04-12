const FACE_LABEL: Record<string, string> = {
  U: '上', D: '下', L: '左', R: '右', F: '前', B: '後',
}

/** Translate a cube notation move into friendly Chinese + direction icon. */
export function friendlyMove(move: string): string {
  if (!move) return ''
  const face = FACE_LABEL[move[0]]
  if (!face) return move
  const suf = move.slice(1)
  if (suf === '') return `${face} ↻`
  if (suf === "'") return `${face} ↺`
  if (suf === '2') return `${face} 180°`
  return move
}
