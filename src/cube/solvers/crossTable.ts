/**
 * White-cross pruning / lookup table.
 *
 * The cross state is determined by the (slot, orientation) of the 4 white
 * edges — cubies 0..3. Encoded as a single integer: slot × 2 + orient for
 * each cubie, combined base-24 → fits in 32 bits.
 *
 * We BFS forward from the solved state using every basic move. For each
 * newly-reached cross state we record the *inverse* of the move that
 * reached it — i.e. the move to apply from that state to get 1 step
 * closer to solved. Repeated lookup gives the full solution in O(depth).
 */

import { Cube } from '../Cube'
import { parseCubies, type CubieState } from '../cubies'
import { applyMove, SOLVED_CUBIES } from '../cubieMoves'
import {
  CROSS_TABLE_KEYS,
  CROSS_TABLE_VALS,
  CROSS_TABLE_MOVES,
} from './crossTable.generated'

const MOVES = [
  'U', "U'", 'U2',
  'D', "D'", 'D2',
  'L', "L'", 'L2',
  'R', "R'", 'R2',
  'F', "F'", 'F2',
  'B', "B'", 'B2',
] as const

const INVERSE: Record<string, string> = {
  U: "U'", "U'": 'U', U2: 'U2',
  D: "D'", "D'": 'D', D2: 'D2',
  L: "L'", "L'": 'L', L2: 'L2',
  R: "R'", "R'": 'R', R2: 'R2',
  F: "F'", "F'": 'F', F2: 'F2',
  B: "B'", "B'": 'B', B2: 'B2',
}

/** Encode cross-relevant state as a single integer. */
export function crossKey(s: CubieState): number {
  let k = 0
  for (let cubie = 0; cubie < 4; cubie++) {
    const slot = s.ep.indexOf(cubie)
    const ori = s.eo[slot]
    k = k * 24 + (slot * 2 + ori)
  }
  return k
}

export type CrossTable = Map<number, string>

let cachedTable: CrossTable | null = null

/**
 * Load the precomputed table from generated data. ~190K entries, near-instant
 * (<10ms) versus the ~10s BFS rebuild.
 */
function loadFromGenerated(): CrossTable {
  const table: CrossTable = new Map()
  table.set(crossKey(SOLVED_CUBIES), '')
  for (let i = 0; i < CROSS_TABLE_KEYS.length; i++) {
    table.set(CROSS_TABLE_KEYS[i], CROSS_TABLE_MOVES[CROSS_TABLE_VALS[i]])
  }
  return table
}

export function buildCrossTable(): CrossTable {
  if (cachedTable) return cachedTable
  cachedTable = loadFromGenerated()
  return cachedTable
}

/** Force rebuild from BFS — used by the generator and as a regression check. */
export function buildCrossTableFromBFS(): CrossTable {
  const table: CrossTable = new Map()
  table.set(crossKey(SOLVED_CUBIES), '')
  const queue: CubieState[] = [SOLVED_CUBIES]
  while (queue.length > 0) {
    const current = queue.shift()!
    for (const m of MOVES) {
      const next = applyMove(current, m)
      const k = crossKey(next)
      if (!table.has(k)) {
        table.set(k, INVERSE[m])
        queue.push(next)
      }
    }
  }
  return table
}

export function lookupNextMove(cube: Cube, table?: CrossTable): string | null {
  const t = table ?? buildCrossTable()
  const key = crossKey(parseCubies(cube.facelets))
  const m = t.get(key)
  if (m === undefined) return null
  return m === '' ? null : m
}
