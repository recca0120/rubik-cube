import { useCubeStore } from '@/store/cubeStore'

const LABELS = ['白十字', '白面', '中層', '黃十字', '黃面', 'PLL'] as const
const COLORS = [
  'white',
  'var(--marker-yellow)',
  'var(--marker-grass)',
  'var(--marker-yellow)',
  'var(--marker-yellow)',
  'var(--marker-red)',
] as const

/** RD2-X5: horizontal chip chain replacing the old vertical StagePipeline. */
export function StageChipRow() {
  const lblSol = useCubeStore((s) => s.lastLBLSolution)
  const segmentBoundaries = useCubeStore((s) => s.segmentBoundaries)
  const totalProgram = useCubeStore((s) => s.totalProgram)
  const queue = useCubeStore((s) => s.queue)

  if (!lblSol || segmentBoundaries.length !== 6) return null

  const completed = totalProgram - queue.length
  // current stage = first boundary still > completed
  const firstUnfinished = segmentBoundaries.findIndex((b) => b > completed)
  const activeIdx = firstUnfinished === -1 ? 5 : firstUnfinished

  return (
    <div className="flex items-center gap-1 overflow-x-auto py-1">
      {LABELS.map((label, i) => {
        const state = i < activeIdx ? 'done' : i === activeIdx && queue.length > 0 ? 'current' : i === activeIdx ? 'done' : 'future'
        return (
          <div
            key={label}
            data-testid={`stage-chip-${i}`}
            data-state={state}
            className="px-2.5 py-1 rounded-full font-display text-xs flex-shrink-0"
            style={{
              background: state === 'done' ? COLORS[i] : state === 'current' ? 'var(--marker-blue)' : 'var(--paper-deep)',
              color: state === 'current' ? 'white' : 'var(--ink)',
              border: '1.5px solid var(--ink)',
              boxShadow: state === 'current' ? 'var(--offset-sm)' : 'none',
              opacity: state === 'future' ? 0.6 : 1,
            }}
          >
            {state === 'done' ? '✓ ' : state === 'current' ? '▶ ' : ''}
            {label}
          </div>
        )
      })}
    </div>
  )
}
