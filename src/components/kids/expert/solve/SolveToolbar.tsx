import type { ReactNode } from 'react'
import { useCubeStore } from '@/store/cubeStore'
import { StickerButton } from '@/components/ui/StickerButton'

export function SolveToolbar({ onOpenInput }: { onOpenInput: () => void }) {
  const solving = useCubeStore((s) => s.solving)
  const cube = useCubeStore((s) => s.cube)
  const queue = useCubeStore((s) => s.queue)
  const scramble = useCubeStore((s) => s.scramble)
  const reset = useCubeStore((s) => s.reset)
  const solveLBL = useCubeStore((s) => s.solveLBL)
  const solveCFOP = useCubeStore((s) => s.solveCFOP)
  const compareMethods = useCubeStore((s) => s.compareMethods)

  const cubeSolved = cube.isSolved()
  const canSolve = !solving && !cubeSolved && queue.length === 0

  return (
    <div
      className="px-3 py-2 flex items-center gap-2 flex-wrap sticky top-0 z-20"
      style={{ background: 'white', borderBottom: 'var(--border-mid)' }}
    >
      <Group label="設定">
        <StickerButton color="var(--marker-yellow)" onClick={scramble}>🎲 打亂</StickerButton>
        <StickerButton onClick={onOpenInput}>✍️ 輸入</StickerButton>
        <StickerButton onClick={reset}>↺ 還原</StickerButton>
      </Group>
      <Group label="解法">
        <StickerButton color="var(--marker-blue)" onClick={() => solveLBL().catch(console.error)} disabled={!canSolve}>
          ▶ LBL
        </StickerButton>
        <StickerButton color="var(--marker-purple)" onClick={() => solveCFOP().catch(console.error)} disabled={!canSolve}>
          ⚡ CFOP
        </StickerButton>
        <StickerButton color="var(--marker-grass)" onClick={() => compareMethods().catch(console.error)} disabled={solving || cubeSolved}>
          ⚖ 對照
        </StickerButton>
      </Group>
    </div>
  )
}

function Group({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="font-display text-[10px] uppercase opacity-50 hidden md:inline">{label}</span>
      <div className="flex gap-1.5">{children}</div>
    </div>
  )
}
