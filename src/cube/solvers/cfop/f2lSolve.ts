import { Cube } from '../../Cube'
import { parseCubies } from '../../cubies'
import { identifyCaseForSlot, lookupCase } from './f2lCases'
import type { F2LSlot } from './locate'

export function solveF2LPair(cube: Cube, slot: F2LSlot): string[] {
  const state = parseCubies(cube.facelets)
  const key = identifyCaseForSlot(state, slot)
  const entry = lookupCase(slot, key)
  if (!entry) {
    throw new Error(
      `F2L slot ${slot} case not in DB: c${key.cornerPos}/${key.cornerOri}-e${key.edgePos}/${key.edgeOri}`,
    )
  }
  return [...entry.alg]
}
