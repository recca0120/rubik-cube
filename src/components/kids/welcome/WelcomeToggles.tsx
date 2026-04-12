import { useCubeStore } from '@/store/cubeStore'

export function WelcomeToggles() {
  const soundEnabled = useCubeStore((s) => s.soundEnabled)
  const setSoundEnabled = useCubeStore((s) => s.setSoundEnabled)
  const showNotation = useCubeStore((s) => s.showNotation)
  const setShowNotation = useCubeStore((s) => s.setShowNotation)

  return (
    <div
      data-testid="welcome-top-toggles"
      className="absolute top-3 right-3 flex gap-1.5 z-10"
    >
      <button
        onClick={() => setShowNotation(!showNotation)}
        data-testid="notation-toggle"
        className="text-xs font-display px-2 py-1 rounded-full"
        style={{
          background: showNotation ? 'var(--marker-blue)' : 'white',
          color: showNotation ? 'white' : 'var(--ink)',
          border: '1.5px solid var(--ink)',
          boxShadow: 'var(--offset-sm)',
        }}
        title={showNotation ? '面字母開' : '面字母關'}
      >
        🅰️
      </button>
      <button
        onClick={() => setSoundEnabled(!soundEnabled)}
        data-testid="sound-toggle"
        className="text-xs font-display px-2 py-1 rounded-full"
        style={{
          background: soundEnabled ? 'var(--marker-grass)' : 'white',
          color: 'var(--ink)',
          border: '1.5px solid var(--ink)',
          boxShadow: 'var(--offset-sm)',
        }}
        title={soundEnabled ? '聲音開' : '聲音關'}
      >
        {soundEnabled ? '🔊' : '🔇'}
      </button>
    </div>
  )
}
