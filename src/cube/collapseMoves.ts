/**
 * Collapse adjacent moves on the same face:
 *   R  R   → R2
 *   R  R'  → (removed)
 *   R  R2  → R'
 *   R2 R   → R'
 *   R' R2  → R
 *   R2 R'  → R
 *   R2 R2  → (removed)
 *   R' R'  → R2
 *
 * Applied repeatedly until no more collapsing is possible.
 * Different faces never combine (R U stays R U).
 */

type Face = 'U' | 'D' | 'L' | 'R' | 'F' | 'B'
type Amount = 1 | 2 | 3 // 1 = X, 2 = X2, 3 = X' (CCW 90°)

function parse(move: string): { face: Face; amount: Amount } | null {
  const face = move[0] as Face
  if (!'UDLRFB'.includes(face)) return null
  const suf = move.slice(1)
  if (suf === '') return { face, amount: 1 }
  if (suf === "'") return { face, amount: 3 }
  if (suf === '2') return { face, amount: 2 }
  return null
}

function format(face: Face, amount: Amount): string {
  if (amount === 1) return face
  if (amount === 2) return `${face}2`
  return `${face}'`
}

export function collapseMoves(moves: string[]): string[] {
  const out: string[] = []
  for (const raw of moves) {
    const next = parse(raw)
    if (!next) {
      out.push(raw)
      continue
    }
    let amount: number = next.amount
    while (out.length > 0) {
      const prev = parse(out[out.length - 1])
      if (!prev || prev.face !== next.face) break
      out.pop()
      amount = (prev.amount + amount) % 4
    }
    if (amount !== 0) out.push(format(next.face, amount as Amount))
  }
  return out
}
