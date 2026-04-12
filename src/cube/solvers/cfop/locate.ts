import type { CubieState } from '../../cubies'

/**
 * F2L slot → home cubie indices.
 * Slots 0..3 = URF, UFL, ULB, UBR (U-layer white-corner slots).
 * Corner cubie home index == slot (0..3).
 * Edge cubie home index == 8 + slot (middle-layer edges FR, FL, BL, BR).
 */
export type F2LSlot = 0 | 1 | 2 | 3

export function locatePair(state: CubieState, slot: F2LSlot): {
  corner: { pos: number; ori: 0 | 1 | 2 }
  edge: { pos: number; ori: 0 | 1 }
} {
  const cornerCubie = slot
  const edgeCubie = 8 + slot
  const cPos = state.cp.indexOf(cornerCubie)
  const ePos = state.ep.indexOf(edgeCubie)
  return {
    corner: { pos: cPos, ori: state.co[cPos] as 0 | 1 | 2 },
    edge: { pos: ePos, ori: state.eo[ePos] as 0 | 1 },
  }
}
