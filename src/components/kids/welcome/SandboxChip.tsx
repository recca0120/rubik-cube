export function SandboxChip({ onClick }: { onClick: () => void }) {
  return (
    <div className="mt-4 flex justify-center">
      <button
        data-testid="sandbox-chip"
        onClick={onClick}
        className="text-xs font-display px-3 py-1.5 rounded-full active:scale-95 transition-transform"
        style={{
          background: 'white',
          color: 'var(--ink)',
          border: '1.5px solid var(--ink)',
          boxShadow: 'var(--offset-sm)',
        }}
      >
        🎮 自由玩 3D 方塊
      </button>
    </div>
  )
}
