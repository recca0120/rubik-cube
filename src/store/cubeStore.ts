import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { Cube } from '@/cube/Cube'
import { solve as solveFacelets, initSolver } from '@/cube/solver'
import { lblSolve, type LBLSolution } from '@/cube/solvers/lbl'
import { solveWhiteCross } from '@/cube/solvers/whiteCross'
import { solveF2LCFOPDetailed, type F2LSlotInfo } from '@/cube/solvers/cfop/f2lCFOP'
import { solveWhiteCorners } from '@/cube/solvers/whiteCorners'
import { solveMiddleLayer } from '@/cube/solvers/middleLayer'
import { solveYellowCross } from '@/cube/solvers/yellowCross'
import { solveYellowFace } from '@/cube/solvers/yellowFace'
import { solvePLL } from '@/cube/solvers/pll'

export type MethodSegment = { name: string; moves: string[] }
export type MethodSummary = { totalMoves: number; segments: MethodSegment[] }
export type MethodComparison = { lbl: MethodSummary; cfop: MethodSummary }

type CubeState = {
  cube: Cube
  queue: string[]
  history: string[]

  // Kid-friendly fields (v2)
  appMode: 'welcome' | 'wizard' | 'sandbox' | 'expert'
  setAppMode: (m: 'welcome' | 'wizard' | 'sandbox' | 'expert') => void
  wizardChapter: number
  wizardStep: number
  setWizardChapter: (n: number) => void
  setWizardStep: (n: number) => void
  earnedStars: Record<number, number>
  awardStars: (chapter: number, stars: number) => void
  highlightedFace: string | null
  setHighlightedFace: (face: string | null) => void
  highlightedMove: string | null
  setHighlightedMove: (move: string | null) => void
  highlightedPieces: 'centers' | 'corners' | 'edges' | null
  setHighlightedPieces: (v: 'centers' | 'corners' | 'edges' | null) => void
  highlightedCubies: [number, number, number][] | null
  setHighlightedCubies: (v: [number, number, number][] | null) => void
  viewRotX: number
  viewRotY: number
  setViewRotation: (x: number, y: number) => void
  resetView: () => void
  soundEnabled: boolean
  setSoundEnabled: (v: boolean) => void
  showNotation: boolean
  setShowNotation: (v: boolean) => void
  activeDates: string[]
  markActiveToday: () => void
  activeDays7d: () => number
  /** RD2-X2: one-shot entry transition flag for expert mode. */
  expertOnboarded: boolean
  setExpertOnboarded: (v: boolean) => void

  // Advanced/expert playback state
  paused: boolean
  speed: number
  stepTokens: number
  stepByStep: boolean
  teachMode: boolean
  viewFlipped: boolean
  totalProgram: number
  segmentBoundaries: number[]

  // Solver state
  solving: boolean
  solverReady: boolean
  /** User-visible error from last solver call (null = ok). */
  solverError: string | null
  clearSolverError: () => void
  lastSolution: string | null
  lastLBLSolution: LBLSolution | null
  lastComparison: MethodComparison | null
  cfopError: string | null
  cfopF2LSlots: F2LSlotInfo[] | null

  // Core move actions (v2 tokenize: X2 atomic)
  enqueue: (alg: string) => void
  finishMove: () => void
  scramble: () => string
  reset: () => void
  setFacelets: (facelets: string) => void
  undo: () => void

  // Advanced actions
  setPaused: (p: boolean) => void
  togglePaused: () => void
  setSpeed: (v: number) => void
  stepOnce: () => void
  setStepByStep: (v: boolean) => void
  setTeachMode: (v: boolean) => void
  setViewFlipped: (v: boolean) => void
  stepBack: () => void
  warmSolver: () => Promise<void>
  solveCurrent: () => Promise<void>
  solveLBL: () => Promise<void>
  solveCFOP: () => Promise<void>
  compareMethods: () => Promise<void>
}

export function inverseMove(move: string): string {
  if (move.endsWith('2')) return move
  return move.endsWith("'") ? move.slice(0, -1) : move + "'"
}

function tokenize(alg: string): string[] {
  return alg.trim().split(/\s+/).filter(Boolean)
}

function applyMoves(cube: Cube, moves: string[]): Cube {
  return moves.reduce((c, m) => c.apply(m), cube)
}

function solvedPatch(moves: string[], boundaries: number[], s: { teachMode: boolean; speed: number }) {
  return {
    solverReady: true,
    solving: false,
    queue: moves,
    totalProgram: moves.length,
    segmentBoundaries: boundaries,
    paused: s.teachMode,
    speed: s.teachMode ? 0.5 : s.speed,
    stepTokens: 0,
    history: [],
  }
}

function packSegments(segs: string[][]): { moves: string[]; boundaries: number[] } {
  const tokenizedSegs = segs.map((s) => tokenize(s.join(' ')))
  const moves = tokenizedSegs.flat()
  const boundaries: number[] = []
  let running = 0
  for (const seg of tokenizedSegs) {
    running += seg.length
    boundaries.push(running)
  }
  return { moves, boundaries }
}

type PersistedState = {
  facelets?: string
  appMode?: 'welcome' | 'wizard' | 'sandbox' | 'expert'
  wizardChapter?: number
  wizardStep?: number
  earnedStars?: Record<number, number>
  activeDates?: string[]
  soundEnabled?: boolean
  showNotation?: boolean
  stepByStep?: boolean
  viewFlipped?: boolean
  expertOnboarded?: boolean
}

export const useCubeStore = create<CubeState>()(
  persist(
    (set, get): CubeState => ({
      cube: new Cube(),
      queue: [],
      history: [],

      appMode: 'welcome',
      setAppMode: (m) => set({ appMode: m }),
      wizardChapter: 1,
      wizardStep: 0,
      setWizardChapter: (n) => set({ wizardChapter: n, wizardStep: 0 }),
      setWizardStep: (n) => set({ wizardStep: n }),
      earnedStars: {},
      awardStars: (chapter, stars) =>
        set((s) => ({
          earnedStars: { ...s.earnedStars, [chapter]: Math.max(s.earnedStars[chapter] ?? 0, stars) },
        })),
      highlightedFace: null,
      setHighlightedFace: (face) => set({ highlightedFace: face }),
      highlightedMove: null,
      setHighlightedMove: (move) => set({ highlightedMove: move }),
      highlightedPieces: null,
      setHighlightedPieces: (v) => set({ highlightedPieces: v }),
      highlightedCubies: null,
      setHighlightedCubies: (v) => set({ highlightedCubies: v }),
      viewRotX: 0,
      viewRotY: 0,
      setViewRotation: (x, y) => set({ viewRotX: x, viewRotY: y }),
      resetView: () => set({ viewRotX: 0, viewRotY: 0 }),
      soundEnabled: false,
      setSoundEnabled: (v) => set({ soundEnabled: v }),
      showNotation: false,
      setShowNotation: (v) => set({ showNotation: v }),
      activeDates: [],
      markActiveToday: () =>
        set((s) => {
          const today = new Date().toISOString().slice(0, 10)
          const cutoff = new Date()
          cutoff.setDate(cutoff.getDate() - 30)
          const cutoffStr = cutoff.toISOString().slice(0, 10)
          const kept = s.activeDates.filter((d) => d >= cutoffStr && d !== today)
          return { activeDates: [...kept, today] }
        }),
      activeDays7d: () => {
        const cutoff = new Date()
        cutoff.setDate(cutoff.getDate() - 6)
        const cutoffStr = cutoff.toISOString().slice(0, 10)
        return new Set(useCubeStore.getState().activeDates.filter((d) => d >= cutoffStr)).size
      },
      expertOnboarded: false,
      setExpertOnboarded: (v) => set({ expertOnboarded: v }),

      paused: false,
      speed: 1,
      stepTokens: 0,
      stepByStep: false,
      teachMode: false,
      viewFlipped: false,
      totalProgram: 0,
      segmentBoundaries: [],

      solving: false,
      solverReady: false,
      solverError: null,
      clearSolverError: () => set({ solverError: null }),
      lastSolution: null,
      lastLBLSolution: null,
      lastComparison: null,
      cfopError: null,
      cfopF2LSlots: null,

      enqueue: (alg) => {
        const moves = tokenize(alg)
        set((s) => ({ queue: [...s.queue, ...moves], totalProgram: s.totalProgram + moves.length }))
      },
      finishMove: () =>
        set((s) => {
          const [head, ...rest] = s.queue
          if (!head) return s
          const completed = s.totalProgram - rest.length
          const atBoundary =
            s.teachMode &&
            s.segmentBoundaries.includes(completed) &&
            rest.length > 0
          const shouldStepPause = s.stepByStep && rest.length > 0
          return {
            cube: s.cube.apply(head),
            queue: rest,
            history: [...s.history, head],
            stepTokens: Math.max(0, s.stepTokens - 1),
            paused: atBoundary || shouldStepPause ? true : s.paused,
          }
        }),
      scramble: () => {
        const alg = Cube.randomScramble()
        const moves = tokenize(alg)
        set({
          cube: new Cube(),
          queue: moves,
          lastSolution: null,
          totalProgram: moves.length,
          paused: false,
          stepTokens: 0,
          history: [],
          viewFlipped: false,
        })
        return alg
      },
      reset: () =>
        set({
          cube: new Cube(),
          queue: [],
          lastSolution: null,
          totalProgram: 0,
          stepTokens: 0,
          history: [],
          paused: false, // RD4-2: ensure subsequent enqueue replays cleanly
          viewFlipped: false,
        }),
      setFacelets: (facelets: string) =>
        set({ cube: new Cube(facelets), queue: [], lastSolution: null, totalProgram: 0, stepTokens: 0, history: [] }),
      undo: () =>
        set((s) => {
          if (s.history.length === 0) return s
          const last = s.history[s.history.length - 1]
          return {
            cube: s.cube.apply(inverseMove(last)),
            history: s.history.slice(0, -1),
          }
        }),

      setPaused: (p) => set({ paused: p }),
      togglePaused: () => set((s) => ({ paused: !s.paused })),
      setSpeed: (v) => set({ speed: v }),
      stepOnce: () => set((s) => ({ stepTokens: s.stepTokens + 1 })),
      setStepByStep: (v) => set({ stepByStep: v }),
      setTeachMode: (v) => set({ teachMode: v }),
      setViewFlipped: (v) => set({ viewFlipped: v }),
      stepBack: () =>
        set((s) => {
          if (s.history.length === 0) return s
          const last = s.history[s.history.length - 1]
          return {
            cube: s.cube.apply(inverseMove(last)),
            history: s.history.slice(0, -1),
            queue: [last, ...s.queue],
            // RD4-2: Prev must not immediately auto-replay the move just undone.
            paused: true,
            stepTokens: 0,
          }
        }),
      warmSolver: async () => {
        if (get().solverReady) return
        await initSolver()
        set({ solverReady: true })
      },
      solveCurrent: async () => {
        set({ solving: true, solverError: null })
        try {
          await initSolver()
          const { cube } = get()
          const alg = await solveFacelets(cube.facelets)
          const moves = tokenize(alg)
          set({
            solverReady: true,
            lastSolution: alg,
            lastLBLSolution: null,
            solving: false,
            queue: moves,
            totalProgram: moves.length,
            paused: get().stepByStep,
            stepTokens: 0,
            history: [],
          })
        } catch (e) {
          const msg = e instanceof Error ? e.message : String(e)
          set({ solving: false, solverError: `Kociemba 失敗：${msg}` })
        }
      },
      solveLBL: async () => {
        set({ solving: true, solverError: null })
        try {
          const { cube } = get()
          await initSolver()
          const sol = await lblSolve(cube)
          const { moves, boundaries } = packSegments([
            sol.cross, sol.whiteCorners, sol.middleLayer, sol.yellowCross, sol.yellowFace, sol.pll,
          ])
          set({
            ...solvedPatch(moves, boundaries, get()),
            lastSolution: null,
            lastLBLSolution: sol,
          })
        } catch (e) {
          const msg = e instanceof Error ? e.message : String(e)
          set({ solving: false, solverError: `LBL 失敗：${msg}` })
        }
      },
      solveCFOP: async () => {
        const { cube } = get()
        set({ solving: true, cfopError: null })
        try {
          await initSolver()
          const cross = solveWhiteCross(cube)
          let state = applyMoves(cube, cross)
          let f2l: string[]
          let cfopSlots: F2LSlotInfo[] | null = null
          let usedFallback = false
          try {
            const details = solveF2LCFOPDetailed(state)
            cfopSlots = details
            f2l = details.flatMap((d) => d.moves)
          } catch {
            const corners = solveWhiteCorners(state)
            const edges = solveMiddleLayer(applyMoves(state, corners))
            f2l = [...corners, ...edges]
            usedFallback = true
          }
          state = applyMoves(state, f2l)
          const yellowCross = solveYellowCross(state)
          state = applyMoves(state, yellowCross)
          const yellowFace = await solveYellowFace(state)
          state = applyMoves(state, yellowFace)
          const pll = await solvePLL(state)

          const { moves, boundaries } = packSegments([cross, f2l, yellowCross, yellowFace, pll])
          set({
            ...solvedPatch(moves, boundaries, get()),
            lastSolution: null,
            lastLBLSolution: null,
            cfopError: usedFallback ? 'F2L case 未覆蓋，已降回 LBL 模式完成此步' : null,
            cfopF2LSlots: cfopSlots,
          })
        } catch (e) {
          const msg = e instanceof Error ? e.message : String(e)
          set({ solving: false, cfopError: msg })
        }
      },
      compareMethods: async () => {
        const { cube } = get()
        await initSolver()
        const lblSol = await lblSolve(cube)
        const lblSegs: MethodSegment[] = [
          { name: '白十字', moves: lblSol.cross },
          { name: '白角', moves: lblSol.whiteCorners },
          { name: '中層', moves: lblSol.middleLayer },
          { name: '黃十字', moves: lblSol.yellowCross },
          { name: '黃面', moves: lblSol.yellowFace },
          { name: 'PLL', moves: lblSol.pll },
        ]
        const lblTotal = lblSegs.reduce((a, s) => a + tokenize(s.moves.join(' ')).length, 0)
        const cross = solveWhiteCross(cube)
        let state = applyMoves(cube, cross)
        let f2l: string[]
        try {
          f2l = solveF2LCFOPDetailed(state).flatMap((d) => d.moves)
        } catch {
          const corners = solveWhiteCorners(state)
          f2l = [...corners, ...solveMiddleLayer(applyMoves(state, corners))]
        }
        state = applyMoves(state, f2l)
        const yc = solveYellowCross(state)
        state = applyMoves(state, yc)
        const yf = await solveYellowFace(state)
        state = applyMoves(state, yf)
        const pll = await solvePLL(state)
        const cfopSegs: MethodSegment[] = [
          { name: '白十字', moves: cross },
          { name: 'F2L', moves: f2l },
          { name: '黃十字', moves: yc },
          { name: '黃面', moves: yf },
          { name: 'PLL', moves: pll },
        ]
        const cfopTotal = cfopSegs.reduce((a, s) => a + tokenize(s.moves.join(' ')).length, 0)
        set({
          lastComparison: {
            lbl: { totalMoves: lblTotal, segments: lblSegs },
            cfop: { totalMoves: cfopTotal, segments: cfopSegs },
          },
        })
      },
    }),
    {
      name: 'rubik-cube',
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({
        facelets: s.cube.facelets,
        appMode: s.appMode,
        wizardChapter: s.wizardChapter,
        wizardStep: s.wizardStep,
        earnedStars: s.earnedStars,
        activeDates: s.activeDates,
        soundEnabled: s.soundEnabled,
        showNotation: s.showNotation,
        stepByStep: s.stepByStep,
        viewFlipped: s.viewFlipped,
        expertOnboarded: s.expertOnboarded,
      }),
      merge: (persisted, current) => {
        const p = (persisted ?? {}) as PersistedState
        return {
          ...current,
          cube: p.facelets && p.facelets.length === 54 ? new Cube(p.facelets) : current.cube,
          appMode: p.appMode ?? current.appMode,
          wizardChapter: p.wizardChapter ?? current.wizardChapter,
          wizardStep: p.wizardStep ?? current.wizardStep,
          earnedStars: p.earnedStars ?? current.earnedStars,
          activeDates: p.activeDates ?? current.activeDates,
          soundEnabled: p.soundEnabled ?? current.soundEnabled,
          showNotation: p.showNotation ?? current.showNotation,
          stepByStep: p.stepByStep ?? current.stepByStep,
          viewFlipped: p.viewFlipped ?? current.viewFlipped,
          expertOnboarded: p.expertOnboarded ?? current.expertOnboarded,
        }
      },
    },
  ),
)
