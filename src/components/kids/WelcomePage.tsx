import { useCubeStore } from '@/store/cubeStore'
import { CHAPTERS, nextAvailableChapter } from './wizardChapters'
import { Decoration } from './Decoration'
import { WelcomeToggles } from './welcome/WelcomeToggles'
import { WelcomeHeader } from './welcome/WelcomeHeader'
import { StarProgressBar } from './welcome/StarProgressBar'
import { ContinueLearningCTA } from './welcome/ContinueLearningCTA'
import { ChapterGrid } from './welcome/ChapterGrid'
import { SandboxChip } from './welcome/SandboxChip'
import { ExpertSentinel } from './welcome/ExpertSentinel'

const TOTAL_STARS = CHAPTERS.length * 3

export function WelcomePage() {
  const setAppMode = useCubeStore((s) => s.setAppMode)
  const setWizardChapter = useCubeStore((s) => s.setWizardChapter)
  const setWizardStep = useCubeStore((s) => s.setWizardStep)
  const earnedStars = useCubeStore((s) => s.earnedStars)
  const wizardChapter = useCubeStore((s) => s.wizardChapter)
  const activeDays7d = useCubeStore((s) => s.activeDays7d())
  const totalStars = Object.values(earnedStars).reduce((a, b) => a + b, 0)
  const allChaptersDone = CHAPTERS.every((c) => (earnedStars[c.id] ?? 0) > 0)

  const nextChapter =
    nextAvailableChapter(earnedStars) ??
    CHAPTERS[wizardChapter - 1] ??
    CHAPTERS[0]

  const greeting = totalStars === 0
    ? '嗨！我是 Cubie，一起來學解魔方吧～先從第一章開始！'
    : `歡迎回來！已得 ${totalStars} 顆 ⭐ — 繼續學習嗎？`

  function gotoChapter(id: number) {
    const parent = CHAPTERS.find((c) => c.id === id)?.parent
    const isLocked = parent !== null && parent !== undefined && (earnedStars[parent] ?? 0) === 0
    if (isLocked) return
    setWizardChapter(id)
    setWizardStep(0)
    setAppMode('wizard')
  }

  return (
    <div className="min-h-screen relative overflow-x-hidden px-4 pt-5 pb-8">
      <Decoration emoji="⭐" top="10%" left="4%" delay="0s" />
      <Decoration emoji="✨" top="16%" right="10%" delay="0.5s" />
      <Decoration emoji="🌟" bottom="25%" left="3%" delay="1s" />
      <Decoration emoji="☁️" top="5%" left="45%" delay="0.3s" size={34} />

      <WelcomeToggles />

      <div className="relative max-w-2xl mx-auto">
        <WelcomeHeader greeting={greeting} />
        <StarProgressBar totalStars={totalStars} totalMax={TOTAL_STARS} activeDays7d={activeDays7d} />
        <ContinueLearningCTA chapter={nextChapter} onGo={() => gotoChapter(nextChapter.id)} />
        <ChapterGrid earnedStars={earnedStars} onGoto={gotoChapter} />
        <SandboxChip onClick={() => setAppMode('sandbox')} />
        {allChaptersDone && <ExpertSentinel onClick={() => setAppMode('expert')} />}
        <p className="text-center text-xs font-body mt-6 opacity-60">
          魔方學園 · 適合 8 歲以上 · 無廣告無註冊
        </p>
      </div>
    </div>
  )
}
