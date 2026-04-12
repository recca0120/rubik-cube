import type { CubieState } from '../../cubies'

/**
 * y-rotation on cubie state with identity relabeling. Designed so that
 * the solved state is y-invariant (cp[i]=i preserved after rotation).
 *
 * Construction:
 *   new_cp[yPerm^s(P)] = yPerm^s(old_cp[P])   // relabel cubie identity
 *   new_co[yPerm^s(P)] = old_co[P]            // orientation stays with piece
 *   same for edges
 *
 * This lets us express "classify slot s as if it were URF" by rotating
 * the state and using the URF-slot classifier.
 */

function yPermPos(pos: number, s: number): number {
  // Layers: U-corners 0-3, D-corners 4-7; U-edges 0-3, D-edges 4-7, middle 8-11.
  // Each layer cycles by subtract-1 (mod 4) per y step.
  const base = pos < 4 ? 0 : pos < 8 ? 4 : 8
  const j = pos - base
  return base + ((j - s) % 4 + 4) % 4
}

function yPermCorner(id: number, s: number): number {
  return yPermPos(id, s)
}

function yPermEdge(id: number, s: number): number {
  return yPermPos(id, s)
}

export function yRotateState(state: CubieState, s: number): CubieState {
  const new_cp = new Array<number>(8)
  const new_co = new Array<number>(8)
  const new_ep = new Array<number>(12)
  const new_eo = new Array<number>(12)

  for (let P = 0; P < 8; P++) {
    const newP = yPermCorner(P, s)
    new_cp[newP] = yPermCorner(state.cp[P], s)
    new_co[newP] = state.co[P]
  }
  for (let P = 0; P < 12; P++) {
    const newP = yPermEdge(P, s)
    new_ep[newP] = yPermEdge(state.ep[P], s)
    new_eo[newP] = state.eo[P]
  }

  return { cp: new_cp, co: new_co, ep: new_ep, eo: new_eo }
}
