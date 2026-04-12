import type { CubieEmotion } from './Cubie'

/** Per-emotion face SVG renderers (overlaid on the front face of Cubie). */

export function CubieFace({ emotion, talking }: { emotion: CubieEmotion; talking: boolean }) {
  // Front face roughly: x=28..80, y=46..138. Centre face around (54, 96).
  const cx = 54
  const cy = 96

  if (emotion === 'happy' || emotion === 'celebrating') {
    return (
      <g>
        <path d={`M ${cx - 16} ${cy - 8} Q ${cx - 11} ${cy - 18} ${cx - 6} ${cy - 8}`} stroke="var(--ink)" strokeWidth="3" fill="none" strokeLinecap="round" />
        <path d={`M ${cx + 6} ${cy - 8} Q ${cx + 11} ${cy - 18} ${cx + 16} ${cy - 8}`} stroke="var(--ink)" strokeWidth="3" fill="none" strokeLinecap="round" />
        <ellipse cx={cx} cy={cy + 14} rx={emotion === 'celebrating' ? 12 : 10} ry={emotion === 'celebrating' ? 9 : 6} fill="var(--ink)" />
        <path d={`M ${cx - 6} ${cy + 16} Q ${cx} ${cy + 20} ${cx + 6} ${cy + 16}`} fill="var(--marker-pink)" />
      </g>
    )
  }

  if (emotion === 'surprised') {
    return (
      <g>
        <Eye x={cx - 12} y={cy - 8} pupilR={4} />
        <Eye x={cx + 12} y={cy - 8} pupilR={4} />
        <ellipse cx={cx} cy={cy + 14} rx="5" ry="7" fill="var(--ink)" />
      </g>
    )
  }

  if (emotion === 'cheering') {
    return (
      <g>
        <path d={`M ${cx - 16} ${cy - 4} L ${cx - 6} ${cy - 12}`} stroke="var(--ink)" strokeWidth="3" strokeLinecap="round" />
        <path d={`M ${cx + 6} ${cy - 12} L ${cx + 16} ${cy - 4}`} stroke="var(--ink)" strokeWidth="3" strokeLinecap="round" />
        <path d={`M ${cx - 12} ${cy + 8} Q ${cx} ${cy + 18} ${cx + 12} ${cy + 8}`} stroke="var(--ink)" strokeWidth="3" fill="var(--ink)" />
        <text x={cx} y={cy - 22} textAnchor="middle" fontSize="14" fill="var(--marker-yellow)">★</text>
      </g>
    )
  }

  if (emotion === 'confused') {
    return (
      <g>
        <Eye x={cx - 12} y={cy - 8} pupilR={2.5} blink />
        <Eye x={cx + 12} y={cy - 8} pupilR={2.5} blink />
        <path d={`M ${cx - 10} ${cy + 10} Q ${cx} ${cy + 6} ${cx + 10} ${cy + 12}`} stroke="var(--ink)" strokeWidth="3" fill="none" strokeLinecap="round" />
        <text x={cx + 22} y={cy - 6} fontSize="20" fill="var(--marker-yellow)" fontWeight="bold">?</text>
      </g>
    )
  }

  // calm
  const mouthD = talking
    ? `M ${cx - 8} ${cy + 8} Q ${cx} ${cy + 16} ${cx + 8} ${cy + 8}`
    : `M ${cx - 10} ${cy + 8} Q ${cx} ${cy + 12} ${cx + 10} ${cy + 8}`
  return (
    <g>
      <Eye x={cx - 12} y={cy - 8} pupilR={2.8} blink />
      <Eye x={cx + 12} y={cy - 8} pupilR={2.8} blink />
      <path d={mouthD} stroke="var(--ink)" strokeWidth="3" fill={talking ? 'var(--ink)' : 'none'} strokeLinecap="round" />
    </g>
  )
}

function Eye({ x, y, pupilR, blink }: { x: number; y: number; pupilR: number; blink?: boolean }) {
  return (
    <g>
      <ellipse cx={x} cy={y} rx="4.5" ry="5" fill="white" stroke="var(--ink)" strokeWidth="1.5" />
      <circle cx={x} cy={y} r={pupilR} fill="var(--ink)" className={blink ? 'anim-blink' : undefined} />
    </g>
  )
}
