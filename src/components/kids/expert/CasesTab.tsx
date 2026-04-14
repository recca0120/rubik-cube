import { useState } from 'react'
import { F2L_CASES } from '@/cube/cases/f2l'
import { PLL_CASES } from '@/cube/cases/pll'
import { SOLVED } from '@/cube/Cube'
import { Cube as CubejsCube } from '@/cube/cubejs-shim'
import { solve as solveFacelets } from '@/cube/solver'
import { useCubeStore } from '@/store/cubeStore'
import { invertAlg } from '@/cube/invertAlg'
import { FamilyTab } from './cases/FamilyTab'
import { CaseCard, type CaseData } from './cases/CaseCard'
import { CaseApplyDock } from './cases/CaseApplyDock'

type Family = 'f2l' | 'pll'

type Props = { onJumpToSolve?: () => void }

export function CasesTab({ onJumpToSolve }: Props = {}) {
  const [family, setFamily] = useState<Family>('f2l')
  const [search, setSearch] = useState('')
  const [appliedName, setAppliedName] = useState<string | null>(null)
  const [teachMode, setTeachMode] = useState(false)
  const setFacelets = useCubeStore((s) => s.setFacelets)
  const enqueue = useCubeStore((s) => s.enqueue)
  const setPaused = useCubeStore((s) => s.setPaused)
  const setStepByStep = useCubeStore((s) => s.setStepByStep)
  const setViewFlipped = useCubeStore((s) => s.setViewFlipped)

  const rawCases: CaseData[] = family === 'f2l' ? F2L_CASES : PLL_CASES
  const q = search.trim().toLowerCase()
  const filtered = q
    ? rawCases.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.id.toLowerCase().includes(q) ||
          c.alg.toLowerCase().includes(q) ||
          (c.description ?? '').toLowerCase().includes(q),
      )
    : rawCases

  async function apply(c: CaseData) {
    const inverse = invertAlg(c.alg)
    try {
      const cubeObj = CubejsCube.fromString(SOLVED).move(inverse)
      setFacelets(cubeObj.asString())
      setViewFlipped(family === 'f2l')
      if (teachMode) {
        // Teaching: enqueue the case's OWN alg (not solver output) so learner
        // sees the canonical move sequence, step-by-step.
        enqueue(c.alg)
        setStepByStep(true)
        setPaused(true)
      } else {
        const solveAlg = await solveFacelets(cubeObj.asString())
        if (solveAlg.trim()) {
          enqueue(solveAlg)
          setPaused(true)
        }
      }
      setAppliedName(c.name)
    } catch (e) {
      console.error('case apply failed:', e)
    }
  }

  return (
    <div className="p-4 space-y-3">
      <div
        role="tablist"
        className="flex items-center gap-2 rounded-2xl p-2"
        style={{ background: 'white', border: 'var(--border-mid)', boxShadow: 'var(--offset-sm)' }}
      >
        <FamilyTab label={`F2L (${F2L_CASES.length})`} active={family === 'f2l'} onClick={() => setFamily('f2l')} />
        <FamilyTab label={`PLL (${PLL_CASES.length})`} active={family === 'pll'} onClick={() => setFamily('pll')} />
        <button
          data-testid="teach-mode-toggle"
          onClick={() => setTeachMode(!teachMode)}
          aria-pressed={teachMode}
          title={teachMode ? '關閉教學模式（快速套用）' : '開啟教學模式（一步一步看）'}
          className="text-xs font-display px-3 py-1.5 rounded-xl active:scale-95 transition-transform"
          style={{
            background: teachMode ? 'var(--marker-grass)' : 'white',
            color: 'var(--ink)',
            border: teachMode ? 'var(--border-mid)' : '1.5px solid var(--ink)',
            boxShadow: teachMode ? 'var(--offset-sm)' : 'none',
          }}
        >
          🎓 教學 {teachMode ? '開' : '關'}
        </button>
        <input
          type="text"
          placeholder="🔍 搜尋"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="ml-auto px-3 py-1.5 rounded-xl font-body text-sm min-w-0 flex-1 max-w-[200px]"
          style={{
            background: 'var(--paper-deep)',
            border: '1.5px solid var(--ink)',
            color: 'var(--ink)',
          }}
        />
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12 font-body opacity-60">沒有符合的案例</div>
      )}

      {appliedName && (
        <CaseApplyDock
          appliedName={appliedName}
          onJump={() => { setAppliedName(null); onJumpToSolve?.() }}
          onClose={() => setAppliedName(null)}
        />
      )}

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {filtered.map((c) => (
          <CaseCard key={c.id} c={c} family={family} onApply={apply} />
        ))}
      </div>
    </div>
  )
}
