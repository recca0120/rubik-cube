import { friendlyMove } from './friendlyMove'

const FACES = ['U', 'D', 'L', 'R', 'F', 'B'] as const
export type Variant = 'cw' | 'ccw' | '180'
const VARIANT_SUFFIX: Record<Variant, string> = { cw: '', ccw: "'", '180': '2' }

const FACE_COLOR: Record<(typeof FACES)[number], string> = {
  U: 'var(--marker-yellow)',
  D: 'white',
  L: 'var(--marker-purple)',
  R: 'var(--marker-red)',
  F: 'var(--marker-blue)',
  B: 'var(--marker-grass)',
}

type Props = {
  onMove: (move: string) => void
  /** Moves to visually highlight (e.g. the next required move in guided phase). */
  highlight?: string[]
  disabled?: boolean
  /** Which variant rows to render. Default = all three. */
  variants?: Variant[]
}

export function MoveKeypad({ onMove, highlight = [], disabled = false, variants = ['cw', 'ccw', '180'] }: Props) {
  const highlightSet = new Set(highlight)
  return (
    <div
      data-testid="move-keypad"
      className="grid grid-cols-6 gap-1.5 p-2 rounded-2xl w-full"
      style={{ background: 'white', border: 'var(--border-mid)', boxShadow: 'var(--offset-sm)' }}
    >
      {variants.map((v) =>
        FACES.map((f) => {
          const move = `${f}${VARIANT_SUFFIX[v]}`
          const isHi = highlightSet.has(move)
          return (
            <button
              key={move}
              type="button"
              onClick={() => onMove(move)}
              disabled={disabled}
              data-highlight={isHi ? 'true' : 'false'}
              className={`font-display text-sm md:text-base rounded-lg py-2 md:py-3 min-w-0 active:scale-95 transition-transform disabled:opacity-40 disabled:cursor-not-allowed ${
                isHi ? 'kp-pulse' : ''
              }`}
              style={{
                background: FACE_COLOR[f],
                color: 'var(--ink)',
                border: isHi ? 'var(--border-thick)' : 'var(--border-mid)',
                boxShadow: isHi ? 'var(--offset)' : 'var(--offset-sm)',
              }}
            >
              <span className="block leading-tight">{move}</span>
              <span aria-hidden="true" className="block leading-tight text-[9px] md:text-[10px] opacity-70 mt-0.5">
                {friendlyMove(move)}
              </span>
            </button>
          )
        }),
      )}
    </div>
  )
}
