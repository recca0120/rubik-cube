import { useCubeStore } from '@/store/cubeStore'

/** RD2-X8: inline slide-down comparison of LBL vs CFOP totals + segments. */
export function ComparePanel() {
  const last = useCubeStore((s) => s.lastComparison)
  if (!last) return null

  const { lbl, cfop } = last
  const diff = Math.abs(lbl.totalMoves - cfop.totalMoves)
  const winner = cfop.totalMoves < lbl.totalMoves
    ? 'CFOP'
    : lbl.totalMoves < cfop.totalMoves
      ? 'LBL'
      : null

  return (
    <div
      data-testid="compare-panel"
      className="rounded-2xl p-4 anim-slide-down"
      style={{
        background: 'var(--marker-purple)',
        color: 'white',
        border: 'var(--border-thick)',
        boxShadow: 'var(--offset)',
      }}
    >
      <div className="font-display text-base mb-3">⚖ LBL vs CFOP</div>

      <div className="grid grid-cols-2 gap-3">
        <MethodCol label="LBL" total={lbl.totalMoves} segments={lbl.segments} />
        <MethodCol label="CFOP" total={cfop.totalMoves} segments={cfop.segments} />
      </div>

      {winner ? (
        <div
          data-testid="compare-winner"
          className="mt-3 inline-block px-3 py-1.5 rounded-full font-display text-sm"
          style={{
            background: 'var(--marker-yellow)',
            color: 'var(--ink)',
            border: '1.5px solid var(--ink)',
          }}
        >
          🏆 {winner} 短 {diff} 步
        </div>
      ) : (
        <div className="mt-3 font-body text-sm opacity-90">兩者步數相同</div>
      )}
    </div>
  )
}

function MethodCol({
  label, total, segments,
}: {
  label: string
  total: number
  segments: { name: string; moves: string[] }[]
}) {
  return (
    <div
      className="rounded-xl p-2.5"
      style={{ background: 'rgba(255,255,255,0.18)', border: '1.5px solid rgba(255,255,255,0.3)' }}
    >
      <div className="flex items-baseline justify-between mb-1">
        <span className="font-display text-sm">{label}</span>
        <span className="font-mono text-xs">{total} 步</span>
      </div>
      <ul className="space-y-0.5 text-xs font-body opacity-90">
        {segments.map((s) => (
          <li key={s.name} className="flex justify-between">
            <span className="truncate pr-2">{s.name}</span>
            <span className="font-mono flex-shrink-0">{s.moves.length}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
