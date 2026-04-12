import { useCubeStore } from '@/store/cubeStore'

const LBL_LABELS = ['白十字', '白角', '中層', '黃十字', '黃面', 'PLL'] as const

/** RD2-X9: shows the current LBL/Kociemba solution broken down by stage. */
export function MoveListPanel() {
  const lbl = useCubeStore((s) => s.lastLBLSolution)
  const kociemba = useCubeStore((s) => s.lastSolution)
  const segmentBoundaries = useCubeStore((s) => s.segmentBoundaries)
  const totalProgram = useCubeStore((s) => s.totalProgram)
  const queue = useCubeStore((s) => s.queue)

  if (!lbl && !kociemba) return null

  const completed = totalProgram - queue.length

  return (
    <div
      data-testid="move-list"
      className="rounded-2xl p-4 space-y-2"
      style={{ background: 'white', border: 'var(--border-mid)', boxShadow: 'var(--offset-sm)' }}
    >
      <h3 className="font-display text-base">📋 解法步驟</h3>

      {lbl && segmentBoundaries.length === 6 && (
        <div className="space-y-2">
          {([lbl.cross, lbl.whiteCorners, lbl.middleLayer, lbl.yellowCross, lbl.yellowFace, lbl.pll] as const).map((moves, i) => {
            const segStart = i === 0 ? 0 : segmentBoundaries[i - 1]
            const segDone = Math.max(0, Math.min(moves.length, completed - segStart))
            const isActive = completed >= segStart && completed < segmentBoundaries[i] && queue.length > 0
            const isDone = completed >= segmentBoundaries[i]
            return (
              <div
                key={LBL_LABELS[i]}
                className="rounded-lg p-2"
                style={{
                  background: isActive ? 'var(--paper-deep)' : 'transparent',
                  border: isActive ? '1.5px solid var(--ink)' : '1.5px solid transparent',
                }}
              >
                <div className="flex items-baseline justify-between text-xs font-body mb-1">
                  <span className="font-display text-sm" style={{ color: isDone ? 'var(--marker-grass)' : isActive ? 'var(--marker-blue)' : 'var(--ink)' }}>
                    {isDone ? '✓' : isActive ? '▶' : '·'} {LBL_LABELS[i]}
                  </span>
                  <span className="font-mono opacity-70">{segDone}/{moves.length}</span>
                </div>
                {moves.length > 0 && (
                  <div
                    className="font-mono text-xs p-1.5 rounded break-all"
                    style={{ background: 'var(--paper)' }}
                  >
                    {moves.map((m, j) => (
                      <span
                        key={j}
                        style={{
                          opacity: j < segDone ? 0.4 : 1,
                          color: j === segDone && isActive ? 'var(--marker-red)' : 'var(--ink)',
                          fontWeight: j === segDone && isActive ? 700 : 400,
                        }}
                      >
                        {m}{' '}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {!lbl && kociemba && (
        <div>
          <div className="text-xs font-body opacity-70 mb-1">Kociemba — {kociemba.split(/\s+/).filter(Boolean).length} 步</div>
          <div
            className="font-mono text-xs p-2 rounded break-all"
            style={{ background: 'var(--paper)' }}
          >
            {kociemba}
          </div>
        </div>
      )}
    </div>
  )
}
