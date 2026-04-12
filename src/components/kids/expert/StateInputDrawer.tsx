import { useState } from 'react'
import { ManualInput } from '@/components/ManualInput'
import { FormulaInput } from '@/components/FormulaInput'
import { PhotoInput } from '@/components/PhotoInput'
import { useCubeStore } from '@/store/cubeStore'

type SubTab = 'manual' | 'formula' | 'photo'

type Props = {
  open: boolean
  onClose: () => void
}

export function StateInputDrawer({ open, onClose }: Props) {
  const [sub, setSub] = useState<SubTab>('manual')
  const setFacelets = useCubeStore((s) => s.setFacelets)
  const cube = useCubeStore((s) => s.cube)

  if (!open) return null

  function applyAndClose(facelets: string) {
    setFacelets(facelets)
    onClose()
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-40 flex md:items-center md:justify-end"
      style={{ background: 'rgba(26,26,46,0.55)', backdropFilter: 'blur(2px)' }}
      onClick={onClose}
    >
      <div
        className="w-full md:max-w-[480px] md:h-[90vh] max-h-[90vh] rounded-t-3xl md:rounded-l-3xl md:rounded-tr-none flex flex-col"
        style={{
          background: 'var(--paper)',
          border: 'var(--border-thick)',
          boxShadow: 'var(--offset-lg)',
          marginTop: 'auto',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <header
          className="px-4 py-3 flex items-center justify-between flex-shrink-0"
          style={{ background: 'white', borderBottom: 'var(--border-mid)' }}
        >
          <h2 className="font-display text-lg">✍️ 輸入方塊狀態</h2>
          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded-xl font-display text-sm"
            style={{
              background: 'white',
              color: 'var(--ink)',
              border: 'var(--border-mid)',
              boxShadow: 'var(--offset-sm)',
            }}
          >
            ✕ 關閉
          </button>
        </header>

        <div
          role="tablist"
          className="flex gap-2 px-4 py-2 flex-shrink-0"
          style={{ background: 'white', borderBottom: '1.5px solid var(--ink)' }}
        >
          <SubTab label="✋ 手動" active={sub === 'manual'} onClick={() => setSub('manual')} />
          <SubTab label="📝 公式" active={sub === 'formula'} onClick={() => setSub('formula')} />
          <SubTab label="📷 拍照" active={sub === 'photo'} onClick={() => setSub('photo')} />
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {sub === 'manual' && (
            <ManualInput initial={cube.facelets} onApply={applyAndClose} onCancel={onClose} />
          )}
          {sub === 'formula' && (
            <FormulaInput onApply={applyAndClose} onCancel={onClose} />
          )}
          {sub === 'photo' && (
            <PhotoInput onApply={applyAndClose} onCancel={onClose} />
          )}
        </div>
      </div>
    </div>
  )
}

function SubTab({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
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
