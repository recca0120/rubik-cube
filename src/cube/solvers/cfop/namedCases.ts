import type { F2LSlot } from './locate'
import type { F2LCaseKey } from './f2lCases'

const CORNER_POS_NAMES = ['URF', 'UFL', 'ULB', 'UBR', 'DFR', 'DLF', 'DBL', 'DRB']
const EDGE_POS_NAMES = ['UR', 'UF', 'UL', 'UB', 'DR', 'DF', 'DL', 'DB', 'FR', 'FL', 'BL', 'BR']
const CORNER_ORI_NAMES = ['正', 'R傾', 'L傾'] as const
const EDGE_ORI_NAMES = ['', '翻'] as const

/**
 * Auto-generate a readable Chinese description from a case key. Phase B1 of
 * #29 — purely metadata, no new algs introduced.
 */
export function describeCase(slot: F2LSlot, key: F2LCaseKey): { name: string; description: string } {
  const homeCorner = slot
  const homeEdge = 8 + slot
  const cornerAtHome = key.cornerPos === homeCorner && key.cornerOri === 0
  const edgeAtHome = key.edgePos === homeEdge && key.edgeOri === 0

  if (cornerAtHome && edgeAtHome) {
    return { name: 'Solved', description: 'Pair 已歸位' }
  }

  const cornerDesc = `${CORNER_POS_NAMES[key.cornerPos]}(${CORNER_ORI_NAMES[key.cornerOri]})`
  const edgeDesc = `${EDGE_POS_NAMES[key.edgePos]}${EDGE_ORI_NAMES[key.edgeOri]}`

  if (cornerAtHome) {
    return {
      name: `Edge-Only-${EDGE_POS_NAMES[key.edgePos]}`,
      description: `角塊已歸位；邊塊在 ${edgeDesc}`,
    }
  }
  if (edgeAtHome) {
    return {
      name: `Corner-Only-${CORNER_POS_NAMES[key.cornerPos]}`,
      description: `邊塊已歸位；角塊在 ${cornerDesc}`,
    }
  }

  // Both displaced — classify by corner layer
  if (key.cornerPos >= 4 && key.cornerPos <= 7) {
    // Corner in D layer (ready to pair)
    return {
      name: `D-Layer-Pair-${CORNER_POS_NAMES[key.cornerPos]}`,
      description: `角塊 ${cornerDesc}，邊塊 ${edgeDesc}（D 層組 pair）`,
    }
  }
  // Corner in U layer wrong slot
  return {
    name: `Misplaced-U-${CORNER_POS_NAMES[key.cornerPos]}`,
    description: `角塊卡在 ${cornerDesc}；邊塊 ${edgeDesc}`,
  }
}
