import { Cube } from '../../Cube'
import { toFacelets, type CubieState } from '../../cubies'
import { applyMove, SOLVED_CUBIES } from '../../cubieMoves'
import { locatePair } from './locate'

function isCrossIntact(s: CubieState): boolean {
  for (let i = 0; i < 4; i++) {
    if (s.ep[i] !== i || s.eo[i] !== 0) return false
  }
  return true
}

const MOVES = [
  'U', "U'", 'U2',
  'D', "D'", 'D2',
  'R', "R'", 'R2',
  'L', "L'", 'L2',
  'F', "F'", 'F2',
  'B', "B'", 'B2',
]

const OPPOSITES: Record<string, string> = { U: 'D', D: 'U', R: 'L', L: 'R', F: 'B', B: 'F' }

function keyToString(cp: number, co: number, ep: number, eo: number): string {
  return `c${cp}/${co}-e${ep}/${eo}`
}

function inverseMoves(moves: string[]): string[] {
  return [...moves].reverse().map((m) => {
    if (m.endsWith('2')) return m
    return m.endsWith("'") ? m.slice(0, -1) : m + "'"
  })
}

/**
 * Pack CubieState into a BigInt hash.
 *   cp: 8 × 3 bits = 24
 *   co: 8 × 2 bits = 16
 *   ep: 12 × 4 bits = 48
 *   eo: 12 × 1 bit  = 12
 *   total = 100 bits.
 */
function hashState(s: CubieState): bigint {
  let h = 0n
  for (let i = 0; i < 8; i++) h = (h << 3n) | BigInt(s.cp[i])
  for (let i = 0; i < 8; i++) h = (h << 2n) | BigInt(s.co[i])
  for (let i = 0; i < 12; i++) h = (h << 4n) | BigInt(s.ep[i])
  for (let i = 0; i < 12; i++) h = (h << 1n) | BigInt(s.eo[i])
  return h
}

function cubieToCube(s: CubieState): Cube {
  return new Cube(toFacelets(s))
}

/**
 * BFS from solved cube up to maxDepth with:
 *  - CubieState + BigInt hash for dedup (much smaller than 54-char facelets)
 *  - Parent pointers for path reconstruction (paths only reified for discovered keys)
 *  - Same-face and canonical opposite-face ordering pruning
 *
 * Records case keys for all 4 slots simultaneously.
 */
export function discoverAllSlotCases(maxDepth: number): Record<0 | 1 | 2 | 3, Map<string, string[]>> {
  const results: Record<0 | 1 | 2 | 3, Map<string, string[]>> = {
    0: new Map([[keyToString(0, 0, 8, 0), []]]),
    1: new Map([[keyToString(1, 0, 9, 0), []]]),
    2: new Map([[keyToString(2, 0, 10, 0), []]]),
    3: new Map([[keyToString(3, 0, 11, 0), []]]),
  }
  const solvedHash = hashState(SOLVED_CUBIES)
  // parent: hash → {parentHash, move}. null parentHash = solved (root).
  const parent = new Map<bigint, { parent: bigint | null; move: string | null }>()
  parent.set(solvedHash, { parent: null, move: null })

  function reconstructPath(h: bigint): string[] {
    const moves: string[] = []
    let cur: bigint | null = h
    while (cur !== null) {
      const entry = parent.get(cur)
      if (!entry) break
      if (entry.move !== null) moves.unshift(entry.move)
      cur = entry.parent
    }
    return moves
  }

  interface Node { state: CubieState; hash: bigint; lastFace: string; prevFace: string }
  let frontier: Node[] = [{ state: SOLVED_CUBIES, hash: solvedHash, lastFace: '', prevFace: '' }]

  for (let depth = 1; depth <= maxDepth; depth++) {
    const next: Node[] = []
    for (const { state, hash, lastFace, prevFace } of frontier) {
      for (const m of MOVES) {
        const face = m[0]
        if (face === lastFace) continue
        if (OPPOSITES[lastFace] === face && face < lastFace) continue
        if (face === prevFace && OPPOSITES[lastFace] === face) continue
        const ns = applyMove(state, m)
        const nh = hashState(ns)
        if (parent.has(nh)) continue
        parent.set(nh, { parent: hash, move: m })
        // Check for cross-intact + record case keys (cubie-state check, no facelet conversion)
        if (isCrossIntact(ns)) {
          for (const slot of [0, 1, 2, 3] as const) {
            const { corner, edge } = locatePair(ns, slot)
            const key = keyToString(corner.pos, corner.ori, edge.pos, edge.ori)
            if (!results[slot].has(key)) {
              const path = reconstructPath(nh)
              results[slot].set(key, inverseMoves(path))
            }
          }
        }
        next.push({ state: ns, hash: nh, lastFace: face, prevFace: lastFace })
      }
    }
    frontier = next
    if (frontier.length === 0) break
  }

  return results
}

/** Legacy single-slot API. */
export function discoverURFCases(maxDepth: number): Map<string, string[]> {
  return discoverAllSlotCases(maxDepth)[0]
}

// Re-export helper for tests that still use parseCubies via facelet path.
export { cubieToCube }
