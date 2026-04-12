import { Cube } from '../../Cube'
import { parseCubies } from '../../cubies'
import { locatePair, type F2LSlot } from './locate'
import { SLOT_CASE_TABLES } from './slotCaseTables.generated'
import { EXTENDED_SLOT_CASE_TABLES } from './extendedSlotCaseTables.generated'
import { describeCase } from './namedCases'

export type F2LCaseKey = {
  cornerPos: number
  cornerOri: number
  edgePos: number
  edgeOri: number
}

export type F2LCaseEntry = {
  name: string
  description: string
  alg: string[]
}

function keyToString(k: F2LCaseKey): string {
  return `c${k.cornerPos}/${k.cornerOri}-e${k.edgePos}/${k.edgeOri}`
}

/**
 * Per-slot F2L case DBs. Each slot has its own BFS-discovered table keyed
 * by (cornerPos, cornerOri, edgePos, edgeOri) of that slot's pieces in the
 * real cube frame. All 4 slot tables are generated simultaneously in a
 * single BFS pass over cross-intact reachable states.
 */
function buildSlotDB(slot: F2LSlot): Map<string, F2LCaseEntry> {
  const db = new Map<string, F2LCaseEntry>()
  // BFS-discovered (short, optimal) entries first — they win on collisions.
  const primary = [...SLOT_CASE_TABLES[slot]].sort((a, b) => a[1].length - b[1].length)
  for (const [keyStr, alg] of primary) {
    if (!db.has(keyStr)) {
      db.set(keyStr, { name: keyStr, description: '', alg: [...alg] })
    }
  }
  // Extended (cubejs-filled) entries fill remaining missing keys only.
  for (const [keyStr, alg] of EXTENDED_SLOT_CASE_TABLES[slot]) {
    if (!db.has(keyStr)) {
      db.set(keyStr, { name: keyStr, description: '', alg: [...alg] })
    }
  }
  return db
}

const SLOT_DBS: Record<F2LSlot, Map<string, F2LCaseEntry>> = {
  0: buildSlotDB(0),
  1: buildSlotDB(1),
  2: buildSlotDB(2),
  3: buildSlotDB(3),
}

export function identifyCaseForSlot(state: ReturnType<typeof parseCubies>, slot: F2LSlot): F2LCaseKey {
  const { corner, edge } = locatePair(state, slot)
  return {
    cornerPos: corner.pos,
    cornerOri: corner.ori,
    edgePos: edge.pos,
    edgeOri: edge.ori,
  }
}

export function lookupCase(slot: F2LSlot, key: F2LCaseKey): F2LCaseEntry | null {
  const base = SLOT_DBS[slot].get(keyToString(key))
  if (!base) return null
  const meta = describeCase(slot, key)
  return { ...base, name: meta.name, description: meta.description }
}

// Legacy API kept for existing tests.
export function identifyCaseURF(state: ReturnType<typeof parseCubies>): F2LCaseKey {
  return identifyCaseForSlot(state, 0)
}

export function solveF2LPairURF(cube: Cube): string[] {
  const state = parseCubies(cube.facelets)
  const key = identifyCaseForSlot(state, 0)
  const entry = lookupCase(0, key)
  if (!entry) throw new Error(`F2L URF case not in DB: ${keyToString(key)}`)
  return [...entry.alg]
}
