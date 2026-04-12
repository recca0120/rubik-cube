import { Cube } from './Cube'
import { parseCubies, type CubieState } from './cubies'

/**
 * Precomputed move tables: for each of the 6 CW quarter-turn moves, store the
 * effect as (permutation index, orientation delta) over corner and edge slots.
 *
 * Applying a move M to a cubie state s:
 *   new.cp[i] = s.cp[perm_c[i]]
 *   new.co[i] = (s.co[perm_c[i]] + ori_c[i]) mod 3
 *   (same structure for edges with mod 2)
 */
type Table = {
  cornerPerm: number[]
  cornerOri: number[]
  edgePerm: number[]
  edgeOri: number[]
}

const BASIC = ['U', 'D', 'L', 'R', 'F', 'B'] as const
const TABLES: Record<string, Table> = {}
for (const m of BASIC) {
  const after = parseCubies(new Cube().apply(m).facelets)
  TABLES[m] = {
    cornerPerm: after.cp,
    cornerOri: after.co,
    edgePerm: after.ep,
    edgeOri: after.eo,
  }
}

export const SOLVED_CUBIES: CubieState = {
  cp: [0, 1, 2, 3, 4, 5, 6, 7],
  co: [0, 0, 0, 0, 0, 0, 0, 0],
  ep: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
  eo: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
}

function applyBasic(state: CubieState, move: string): CubieState {
  const t = TABLES[move]
  const cp = new Array<number>(8)
  const co = new Array<number>(8)
  for (let i = 0; i < 8; i++) {
    const src = t.cornerPerm[i]
    cp[i] = state.cp[src]
    co[i] = (state.co[src] + t.cornerOri[i]) % 3
  }
  const ep = new Array<number>(12)
  const eo = new Array<number>(12)
  for (let i = 0; i < 12; i++) {
    const src = t.edgePerm[i]
    ep[i] = state.ep[src]
    eo[i] = (state.eo[src] + t.edgeOri[i]) % 2
  }
  return { cp, co, ep, eo }
}

export function applyMove(state: CubieState, move: string): CubieState {
  const face = move[0]
  if (!(face in TABLES)) throw new Error(`unknown move: ${move}`)
  const suffix = move.slice(1)
  const times = suffix === "'" ? 3 : suffix === '2' ? 2 : 1
  let s = state
  for (let t = 0; t < times; t++) s = applyBasic(s, face)
  return s
}
