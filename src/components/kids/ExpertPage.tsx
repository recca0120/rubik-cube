import { useEffect, useState } from 'react'
import { useCubeStore } from '@/store/cubeStore'
import { SolveTab } from './expert/SolveTab'
import { CasesTab } from './expert/CasesTab'

type Tab = 'solve' | 'cases'

type Props = { onExit: () => void }

const CUBIE_QUIPS = [
  '今天想解幾顆？',
  '試試 CFOP 看看？',
  '來看 F2L 案例庫～',
  '速度跟準度，先追哪個？',
  '打亂之前先深呼吸 😤',
  '每天一顆，手感會越來越好！',
]

export function ExpertPage({ onExit }: Props) {
  const [tab, setTab] = useState<Tab>('solve')
  const [quip] = useState(() => CUBIE_QUIPS[Math.floor(Math.random() * CUBIE_QUIPS.length)])
  const warmSolver = useCubeStore((s) => s.warmSolver)

  // RD4-1: pre-warm Kociemba tables on expert entry so first solve is instant.
  useEffect(() => { warmSolver().catch(() => {}) }, [warmSolver])

  return (
    <div
      className="h-screen grid grid-rows-[auto_auto_minmax(0,1fr)] overflow-hidden"
      style={{ background: 'var(--paper)' }}
    >
      <header
        className="px-4 py-3 flex items-center justify-between"
        style={{ background: 'white', borderBottom: 'var(--border-mid)' }}
      >
        <div>
          <div className="font-display text-lg md:text-xl" style={{ color: 'var(--ink)' }}>
            🎓 專家工作台
          </div>
          <div className="text-xs font-body opacity-70 truncate max-w-[240px] md:max-w-none">
            Cubie: {quip}
          </div>
        </div>
        <button
          onClick={onExit}
          className="px-3 py-1.5 rounded-xl font-display text-sm"
          style={{
            background: 'var(--marker-pink)',
            color: 'var(--ink)',
            border: 'var(--border-mid)',
            boxShadow: 'var(--offset-sm)',
          }}
        >
          🏠 回首頁
        </button>
      </header>

      <div
        role="tablist"
        className="flex gap-2 px-4 py-2"
        style={{ background: 'white', borderBottom: 'var(--border-mid)' }}
      >
        <TabButton label="🧠 解" active={tab === 'solve'} onClick={() => setTab('solve')} color="var(--marker-yellow)" />
        <TabButton label="📚 案例" active={tab === 'cases'} onClick={() => setTab('cases')} color="var(--marker-blue)" />
      </div>

      <main className="overflow-y-auto">
        {tab === 'solve' && <SolveTab />}
        {tab === 'cases' && <CasesTab onJumpToSolve={() => setTab('solve')} />}
      </main>
    </div>
  )
}

function TabButton({
  label, active, onClick, color,
}: {
  label: string; active: boolean; onClick: () => void; color: string
}) {
  return (
    <button
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className="px-4 py-2 rounded-xl font-display text-sm md:text-base active:scale-95 transition-transform"
      style={{
        background: active ? color : 'var(--paper-deep)',
        color: 'var(--ink)',
        border: active ? 'var(--border-thick)' : 'var(--border-mid)',
        boxShadow: active ? 'var(--offset)' : 'var(--offset-sm)',
      }}
    >
      {label}
    </button>
  )
}
