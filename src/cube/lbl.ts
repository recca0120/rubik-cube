/**
 * LBL stage annotation layer.
 *
 * We use cubejs (Kociemba) as the underlying solver, then tag each move of the
 * resulting sequence with the LBL stage it advanced into (if any). This gives
 * students a visible progress pipeline without requiring a true stage-by-stage
 * solver (that lives in Phase 8-1+).
 */

import { Cube } from './Cube'
import { currentStage, STAGES, type Stage } from './stages'

export const STAGE_ORDER = STAGES
export type { Stage }

export type AnnotatedMove = {
  move: string
  before: Stage
  after: Stage
  /** The stage this move *reached* (i.e. advanced into), if stage index went up. */
  stageReached?: Stage
}

const STAGE_INDEX: Record<Stage, number> = Object.fromEntries(STAGES.map((s, i) => [s, i])) as Record<Stage, number>

export function annotate(startFacelets: string, moves: string[]): AnnotatedMove[] {
  const out: AnnotatedMove[] = []
  let cube = new Cube(startFacelets)
  let stage = currentStage(cube.facelets)
  for (const m of moves) {
    cube = cube.apply(m)
    const next = currentStage(cube.facelets)
    const advanced = STAGE_INDEX[next] > STAGE_INDEX[stage]
    out.push({
      move: m,
      before: stage,
      after: next,
      stageReached: advanced ? next : undefined,
    })
    stage = next
  }
  return out
}

const DESCRIPTIONS: Record<Stage, string> = {
  start: '打亂狀態',
  whiteCross: '白十字：4 個含白的邊塊放到 U 面，側色對齊中心',
  whiteFace: '白面：把 4 個白角塊放到 U 面對應位置',
  topTwoLayers: '中層：把 4 個非黃邊塊放到 E 中層',
  yellowCross: '黃十字：翻轉 D 面邊塊讓黃色朝下',
  yellowFace: '黃面：翻轉 D 面角塊讓黃色朝下',
  solved: '方塊已還原',
}

export function stageDescription(stage: Stage): string {
  return DESCRIPTIONS[stage] ?? ''
}
