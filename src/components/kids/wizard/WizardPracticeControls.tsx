import { MoveKeypad } from '../MoveKeypad'
import { HintButton } from '../HintButton'
import { matchedCount } from '../wizardChapters'

export function WizardPracticeControls({
  requireMoves, history, practiceDone, onMove, onReset,
}: {
  requireMoves: string[]
  history: string[]
  practiceDone: boolean
  onMove: (m: string) => void
  onReset: () => void
}) {
  const matched = matchedCount(history, requireMoves)
  const nextMove = matched < requireMoves.length ? requireMoves[matched] : null
  const needs180 = requireMoves.some((m) => m.endsWith('2'))
  const needsCCW = requireMoves.some((m) => m.endsWith("'"))
  const variants: ('cw' | 'ccw' | '180')[] = needs180
    ? ['cw', 'ccw', '180']
    : needsCCW
      ? ['cw', 'ccw']
      : ['cw']

  return (
    <>
      <MoveKeypad onMove={onMove} highlight={nextMove ? [nextMove] : []} variants={variants} />
      <div className="flex items-center justify-center gap-2 flex-wrap">
        <button
          onClick={onReset}
          className="text-xs px-3 py-1.5 rounded-xl font-display"
          style={{
            background: 'white',
            color: 'var(--ink)',
            border: 'var(--border-mid)',
            boxShadow: 'var(--offset-sm)',
          }}
        >
          ↻ 再試一次
        </button>
        {nextMove && <HintButton onShow={() => onMove(nextMove)} />}
        {practiceDone && (
          <span
            data-testid="practice-success"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full font-display text-sm anim-pop"
            style={{
              background: 'var(--marker-grass)',
              color: 'var(--ink)',
              border: 'var(--border-mid)',
              boxShadow: 'var(--offset-sm)',
            }}
          >
            ✓ 太棒了！
          </span>
        )}
      </div>
    </>
  )
}
