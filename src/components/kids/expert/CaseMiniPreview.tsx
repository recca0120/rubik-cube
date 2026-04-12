import { Cube, SOLVED } from '@/cube/Cube'
import { FACE_COLOR } from '@/cube/facelets'

/** RD3-8: tiny SVG showing the case's start state.
 *  Layout: top 3×3 = U face, bottom strip = F-top + R-top + L-top + B-top
 *  (so PLL/F2L recognition cues all visible).
 */
function invertAlg(alg: string): string {
  return alg
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .reverse()
    .map((m) => (m.endsWith('2') ? m : m.endsWith("'") ? m.slice(0, -1) : m + "'"))
    .join(' ')
}

function caseFacelets(alg: string): string {
  try {
    return new Cube().applyAlg(invertAlg(alg)).facelets
  } catch {
    return SOLVED
  }
}

const CELL = 9
const GAP = 1

export function CaseMiniPreview({ alg, family }: { alg: string; family: 'f2l' | 'pll' }) {
  const f = caseFacelets(alg)
  const U = f.slice(0, 9)         // top face
  const R_top = f.slice(9, 12)    // R[0..2]
  const F_top = f.slice(18, 21)   // F[0..2]
  const L_top = f.slice(36, 39)   // L[0..2]
  const B_top = f.slice(45, 48)   // B[0..2]
  void family

  // Total dims: 3×3 face + 4 strips of 3 cells stacked below = 4 rows × 3 cols
  const w = 3 * CELL + 2 * GAP
  const stripH = CELL + GAP
  const h = 3 * CELL + 2 * GAP + 4 * stripH + GAP

  function cellRect(x: number, y: number, color: string, key: string) {
    return (
      <rect
        key={key}
        x={x}
        y={y}
        width={CELL}
        height={CELL}
        fill={color}
        stroke="#1A1A2E"
        strokeWidth={0.5}
        rx={1}
      />
    )
  }

  return (
    <svg
      viewBox={`-1 -1 ${w + 2} ${h + 2}`}
      width={56}
      height={(56 * h) / w}
      role="img"
      aria-label="case preview"
    >
      {/* U face 3×3 */}
      {[...U].map((c, i) => {
        const r = Math.floor(i / 3), col = i % 3
        return cellRect(col * (CELL + GAP), r * (CELL + GAP), FACE_COLOR[c] ?? '#888', `u${i}`)
      })}
      {/* F top strip below U face */}
      {([F_top, R_top, B_top, L_top] as const).map((strip, sIdx) => {
        const baseY = 3 * (CELL + GAP) + GAP + sIdx * stripH
        return [...strip].map((c, i) =>
          cellRect(i * (CELL + GAP), baseY, FACE_COLOR[c] ?? '#888', `s${sIdx}-${i}`),
        )
      })}
    </svg>
  )
}
