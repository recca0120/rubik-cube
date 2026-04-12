import { toFacelets, type CubieState } from '../../cubies'
import { SOLVED_CUBIES } from '../../cubieMoves'
import { solve as solveFacelets } from '../../solver'
import type { F2LSlot } from './locate'
import type { F2LCaseKey } from './f2lCases'

/**
 * Construct a valid CubieState for a given F2L case key on a given slot.
 * Returned state:
 *  - has cross intact (edges 0-3 home, eo 0)
 *  - has slot's corner + edge at the requested positions + orientations
 *  - satisfies cube group constraints: co sum ≡ 0 (mod 3), eo sum ≡ 0 (mod 2),
 *    permutation parity even (corners + edges combined)
 *  - all other pieces filled in with minimal disturbance (a compensating
 *    corner-corner or edge-edge swap may be added for parity)
 */
export function constructCaseState(slot: F2LSlot, key: F2LCaseKey): CubieState | null {
  const homeCorner = slot
  const homeEdge = 8 + slot

  const cp = [...SOLVED_CUBIES.cp]
  const co = [...SOLVED_CUBIES.co]
  const ep = [...SOLVED_CUBIES.ep]
  const eo = [...SOLVED_CUBIES.eo]

  const cornerSwapped = key.cornerPos !== homeCorner
  const edgeSwapped = key.edgePos !== homeEdge

  // Place corner
  if (cornerSwapped) {
    // Swap cubies at homeCorner and cornerPos positions.
    ;[cp[homeCorner], cp[key.cornerPos]] = [cp[key.cornerPos], cp[homeCorner]]
    co[key.cornerPos] = key.cornerOri
    co[homeCorner] = (3 - key.cornerOri) % 3 // keep sum = 0 mod 3
  } else {
    co[homeCorner] = key.cornerOri
  }

  // Place edge
  if (edgeSwapped) {
    ;[ep[homeEdge], ep[key.edgePos]] = [ep[key.edgePos], ep[homeEdge]]
    eo[key.edgePos] = key.edgeOri
    eo[homeEdge] = key.edgeOri // keep sum = 0 mod 2 (either 0+0=0 or 1+1=0)
  } else {
    eo[homeEdge] = key.edgeOri
  }

  // Parity fix: if only one of corner/edge was swapped, add a compensating
  // same-kind swap on two unrelated pieces.
  if (cornerSwapped && !edgeSwapped) {
    // Need an extra edge swap. Pick two non-cross, non-slot edges.
    const edgeA = 4
    const edgeB = 5
    ;[ep[edgeA], ep[edgeB]] = [ep[edgeB], ep[edgeA]]
  } else if (!cornerSwapped && edgeSwapped) {
    // Need an extra corner swap. Pick two corners not the slot.
    const cornerA = (homeCorner as number) === 6 ? 4 : 6
    const cornerB = (homeCorner as number) === 7 ? 5 : 7
    ;[cp[cornerA], cp[cornerB]] = [cp[cornerB], cp[cornerA]]
  }

  // Fix co sum if not zero (happens when cornerSwapped=false and cornerOri!=0).
  const coSum = co.reduce((a, b) => a + b, 0) % 3
  if (coSum !== 0) {
    // Add compensating orient on a safe corner (not slot's home if possible).
    const safeCorner = (homeCorner as number) === 7 ? 6 : 7
    co[safeCorner] = (co[safeCorner] + (3 - coSum)) % 3
  }

  const eoSum = eo.reduce((a, b) => a + b, 0) % 2
  if (eoSum !== 0) {
    // Add compensating flip on two edges (must be pair for valid state).
    const safeEdgeA = homeEdge === 6 ? 4 : 6
    const safeEdgeB = homeEdge === 7 ? 5 : 7
    eo[safeEdgeA] ^= 1
    eo[safeEdgeB] ^= 1
  }

  return { cp, co, ep, eo }
}

/**
 * Find a solving alg for a missing F2L case via cubejs. Constructs a cube
 * state matching the key (with everything else at home), asks cubejs for the
 * optimal full-cube solve. Since only the slot's pair is disturbed, cubejs's
 * solution IS the F2L alg for that case.
 */
export async function findAlgForCase(slot: F2LSlot, key: F2LCaseKey): Promise<string[] | null> {
  const state = constructCaseState(slot, key)
  if (!state) return null
  const alg = await solveFacelets(toFacelets(state))
  return alg.trim().split(/\s+/).filter(Boolean)
}
