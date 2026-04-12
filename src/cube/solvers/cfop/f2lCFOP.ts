import { Cube } from '../../Cube'
import { parseCubies } from '../../cubies'
import { solveF2LPair } from './f2lSolve'
import { identifyCaseForSlot, lookupCase } from './f2lCases'
import type { F2LSlot } from './locate'

export type F2LSlotInfo = {
  slot: F2LSlot
  caseName: string
  caseDescription: string
  moves: string[]
}

/**
 * Full CFOP F2L solver: solves all 4 slots (URF, UFL, ULB, UBR) in order.
 * Assumes white cross is already solved. Returns a single concatenated
 * move sequence.
 *
 * Per-slot solving uses the per-slot case DB in f2lCases.ts. Only 8 URF
 * case templates are currently registered, so complex scrambles may hit
 * case-not-in-DB errors mid-sequence.
 */
export function solveF2LCFOP(cube: Cube): string[] {
  return solveF2LCFOPDetailed(cube).flatMap((s) => s.moves)
}

export function solveF2LCFOPDetailed(cube: Cube): F2LSlotInfo[] {
  const result: F2LSlotInfo[] = []
  let state = cube
  for (const slot of [0, 1, 2, 3] as const satisfies readonly F2LSlot[]) {
    const key = identifyCaseForSlot(parseCubies(state.facelets), slot)
    const slotAlg = solveF2LPair(state, slot)
    const entry = lookupCase(slot, key)
    for (const m of slotAlg) state = state.apply(m)
    result.push({
      slot,
      caseName: entry?.name ?? 'unknown',
      caseDescription: entry?.description ?? '',
      moves: slotAlg,
    })
  }
  return result
}
