export function ExpertSentinel({ onClick }: { onClick: () => void }) {
  return (
    <button
      data-testid="expert-sentinel"
      onClick={onClick}
      className="anim-fadeup mt-10 mx-auto block w-full max-w-md rounded-3xl px-5 py-5 text-left active:scale-95 transition-transform"
      style={{
        background: 'var(--marker-purple)',
        color: 'white',
        border: 'var(--border-thick)',
        boxShadow: 'var(--offset-lg)',
        transform: 'rotate(-1deg)',
        animationDelay: '1.2s',
      }}
    >
      <div className="flex items-center gap-3">
        <span className="text-5xl">🎓</span>
        <div className="flex-1 min-w-0">
          <div className="font-display text-2xl">你已全破！</div>
          <div className="font-body text-sm mt-1 opacity-90 truncate">進入專家工作台 · CFOP / F2L / 案例庫</div>
        </div>
        <span className="text-2xl">→</span>
      </div>
    </button>
  )
}
