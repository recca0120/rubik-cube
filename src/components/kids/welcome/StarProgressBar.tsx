export function StarProgressBar({
  totalStars, totalMax, activeDays7d,
}: { totalStars: number; totalMax: number; activeDays7d: number }) {
  return (
    <div className="mt-5 mx-auto max-w-sm anim-fadeup" style={{ animationDelay: '0.4s' }}>
      <div className="flex items-baseline justify-between mb-1.5">
        <span className="font-display text-lg">⭐ 星星</span>
        <span className="font-mono text-base">{totalStars} / {totalMax}</span>
      </div>
      <div
        className="h-4 rounded-full overflow-hidden"
        style={{ background: 'var(--paper-deep)', border: '2px solid var(--ink)' }}
      >
        <div
          className="h-full transition-all"
          style={{
            width: `${(totalStars / totalMax) * 100}%`,
            background: 'linear-gradient(90deg, var(--marker-yellow), var(--marker-red))',
          }}
        />
      </div>
      <div className="text-xs font-body opacity-60 mt-1 text-right">
        🔥 過去 7 天玩了 {activeDays7d} 次
      </div>
    </div>
  )
}
