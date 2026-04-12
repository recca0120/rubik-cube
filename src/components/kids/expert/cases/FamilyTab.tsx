export function FamilyTab({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className="px-3 py-1.5 rounded-xl font-display text-sm active:scale-95 transition-transform"
      style={{
        background: active ? 'var(--marker-yellow)' : 'transparent',
        color: 'var(--ink)',
        border: active ? 'var(--border-mid)' : '1.5px solid transparent',
        boxShadow: active ? 'var(--offset-sm)' : 'none',
      }}
    >
      {label}
    </button>
  )
}
