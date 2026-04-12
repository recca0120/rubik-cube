export function CaseApplyDock({
  appliedName, onJump, onClose,
}: { appliedName: string; onJump: () => void; onClose: () => void }) {
  return (
    <div
      data-testid="case-apply-dock"
      className="fixed left-0 right-0 bottom-0 md:left-auto md:right-4 md:bottom-4 md:max-w-md mx-auto md:mx-0 z-30 anim-slide-down"
    >
      <div
        className="rounded-2xl md:rounded-3xl m-3 md:m-0 px-4 py-3 flex items-center gap-3"
        style={{
          background: 'var(--marker-purple)',
          color: 'white',
          border: 'var(--border-thick)',
          boxShadow: 'var(--offset-lg)',
        }}
      >
        <span className="font-display text-sm flex-1 truncate">
          ✨ 套用 <strong>{appliedName}</strong>
        </span>
        <button
          onClick={onJump}
          className="px-3 py-1.5 rounded-xl font-display text-xs"
          style={{
            background: 'var(--marker-yellow)',
            color: 'var(--ink)',
            border: '1.5px solid var(--ink)',
          }}
        >
          ▶ 跳到解 tab 看
        </button>
        <button
          onClick={onClose}
          className="px-2 py-1 rounded-lg font-display text-xs"
          style={{
            background: 'rgba(255,255,255,0.2)',
            color: 'white',
            border: '1.5px solid white',
          }}
          aria-label="關閉"
        >
          ✕
        </button>
      </div>
    </div>
  )
}
