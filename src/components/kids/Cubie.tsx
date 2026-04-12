import { CubieFace } from './CubieFace'

/**
 * Cubie — pop-up paper-toybook mascot.
 * Isometric paper-cube with eyes, mouth, mittens. Idle bob + blink + wave.
 */

export type CubieEmotion =
  | 'calm'
  | 'happy'
  | 'surprised'
  | 'cheering'
  | 'confused'
  | 'celebrating'

export type CubieGesture = 'idle' | 'point' | 'thumbsup'

type CubieProps = {
  emotion?: CubieEmotion
  size?: number
  className?: string
  /** When true, mouth opens slightly (used while typewriter is running) */
  talking?: boolean
  /** Hand gesture overlay. */
  gesture?: CubieGesture
}

export function Cubie({ emotion = 'calm', size = 140, className = '', talking = false, gesture = 'idle' }: CubieProps) {
  const isCelebrating = emotion === 'celebrating'

  return (
    <div
      data-testid="cubie-wrap"
      data-gesture={gesture}
      className={`relative inline-block anim-bob ${className}`}
      style={{ width: size, height: size }}
      aria-label={`Cubie (${emotion}, ${gesture})`}
    >
      {isCelebrating && (
        <>
          <span className="absolute -top-3 -left-1 text-2xl anim-sparkle" style={{ animationDelay: '0s' }}>✨</span>
          <span className="absolute -top-2 right-1 text-2xl anim-sparkle" style={{ animationDelay: '0.3s' }}>⭐</span>
          <span className="absolute -bottom-1 -right-3 text-2xl anim-sparkle" style={{ animationDelay: '0.6s' }}>✨</span>
        </>
      )}

      <svg
        data-testid="cubie"
        data-emotion={emotion}
        viewBox="0 0 160 160"
        width="100%"
        height="100%"
        role="img"
      >
        <g>
          <path
            d="M 80 26 L 130 50 L 130 110 L 80 138 L 30 110 L 30 50 Z"
            fill="rgba(26,26,46,0.18)"
            transform="translate(4 5)"
          />
          <path
            d="M 80 22 L 132 46 L 80 70 L 28 46 Z"
            fill="var(--marker-yellow)"
            stroke="var(--ink)"
            strokeWidth="4"
            strokeLinejoin="round"
          />
          <path
            d="M 132 46 L 132 110 L 80 138 L 80 70 Z"
            fill="var(--marker-red)"
            stroke="var(--ink)"
            strokeWidth="4"
            strokeLinejoin="round"
          />
          <path
            d="M 28 46 L 80 70 L 80 138 L 28 110 Z"
            fill="var(--marker-blue)"
            stroke="var(--ink)"
            strokeWidth="4"
            strokeLinejoin="round"
          />

          <g>
            <ellipse cx="14" cy="92" rx="10" ry="12" fill="var(--ink)" />
            <ellipse cx="14" cy="89" rx="7" ry="9" fill="white" />
          </g>
          <g
            className={gesture === 'idle' ? 'anim-wave' : ''}
            style={{ transformOrigin: '146px 92px', transform: gesture === 'point' ? 'rotate(30deg)' : undefined }}
          >
            <ellipse cx="146" cy="92" rx="10" ry="12" fill="var(--ink)" />
            <ellipse cx="146" cy="89" rx="7" ry="9" fill="white" />
            {gesture === 'point' && (
              <path d="M 152 86 L 168 80" stroke="var(--ink)" strokeWidth="3" strokeLinecap="round" />
            )}
            {gesture === 'thumbsup' && (
              <path d="M 146 79 L 146 70" stroke="var(--ink)" strokeWidth="4" strokeLinecap="round" />
            )}
          </g>

          <CubieFace emotion={emotion} talking={talking} />
        </g>
      </svg>
    </div>
  )
}

export { CubieDialog } from './CubieDialog'
