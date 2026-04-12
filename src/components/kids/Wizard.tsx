import { useEffect, useRef, useState } from 'react'
import { useCubeStore } from '@/store/cubeStore'
import { CubieDialog } from './Cubie'
import { Confetti } from './Confetti'
import { CubeKeyboardControls } from '@/components/CubeKeyboardControls'
import { playSfx } from '@/audio/sfx'
import { getChapter, CHAPTERS, inferPhase, matchedCount } from './wizardChapters'
import { invertAlg } from '@/cube/invertAlg'
import { Cube } from '@/cube/Cube'
import { WizardHeader } from './wizard/WizardHeader'
import { WizardAchievement } from './wizard/WizardAchievement'
import { WizardCubeStage } from './wizard/WizardCubeStage'
import { WizardPracticeControls } from './wizard/WizardPracticeControls'
import { WizardNav } from './wizard/WizardNav'
import { WizardMiniPlayer } from './wizard/WizardMiniPlayer'
import { friendlyMove } from './friendlyMove'

type Props = { onExit: () => void }

export function Wizard({ onExit }: Props) {
  const chapterId = useCubeStore((s) => s.wizardChapter)
  const stepIdx = useCubeStore((s) => s.wizardStep)
  const setStep = useCubeStore((s) => s.setWizardStep)
  const setChapter = useCubeStore((s) => s.setWizardChapter)
  const awardStars = useCubeStore((s) => s.awardStars)
  const markActiveToday = useCubeStore((s) => s.markActiveToday)
  const reset = useCubeStore((s) => s.reset)
  const enqueue = useCubeStore((s) => s.enqueue)
  const history = useCubeStore((s) => s.history)
  const queue = useCubeStore((s) => s.queue)
  const [rerunKey, setRerunKey] = useState(0)
  const undo = useCubeStore((s) => s.undo)
  const setHighlightedFace = useCubeStore((s) => s.setHighlightedFace)
  const setHighlightedMove = useCubeStore((s) => s.setHighlightedMove)
  const setHighlightedPieces = useCubeStore((s) => s.setHighlightedPieces)
  const setSpeed = useCubeStore((s) => s.setSpeed)
  const setFacelets = useCubeStore((s) => s.setFacelets)
  const setPaused = useCubeStore((s) => s.setPaused)
  const setStepByStep = useCubeStore((s) => s.setStepByStep)
  const setViewFlipped = useCubeStore((s) => s.setViewFlipped)
  const setHighlightedCubies = useCubeStore((s) => s.setHighlightedCubies)

  const chapter = getChapter(chapterId) ?? CHAPTERS[0]
  const step = chapter.steps[stepIdx] ?? chapter.steps[0]
  const isFirstStep = stepIdx === 0
  const isLastStep = stepIdx === chapter.steps.length - 1
  const isLastChapter = chapterId === CHAPTERS.length
  const phase = inferPhase(step)
  const requireMoves = step.requireMoves ?? null
  const practiceDone =
    !requireMoves ||
    (history.length >= requireMoves.length &&
      requireMoves.every((m, i) => history[history.length - requireMoves.length + i] === m))

  useEffect(() => {
    if (step.resetOnEnter) reset()
    // Pre-scramble: apply inverse of the teaching algorithm so cube starts in
    // the state where the step's playMoves would naturally solve it.
    if (step.preScramble) {
      const scrambled = new Cube().applyAlg(invertAlg(step.preScramble))
      setFacelets(scrambled.facelets)
    }
    setHighlightedPieces(step.highlight ?? null)
    setHighlightedCubies(step.highlightCubies ?? null)
    setViewFlipped(step.viewFlipped === true)
    // Clear stale move highlights; main effect will re-set if this is a demo.
    setHighlightedFace(null)
    setHighlightedMove(null)

    const moves = step.playMoves
    if (!moves || moves.length === 0) return
    const isDemo = phase === 'show' || phase === 'walkthrough'
    if (isDemo) {
      // Pre-highlight the target face + pop the letter label, then slow-demo.
      const firstMove = moves[0]
      setHighlightedFace(firstMove[0])
      setHighlightedMove(firstMove)
      const prevSpeed = useCubeStore.getState().speed
      const prevStepByStep = useCubeStore.getState().stepByStep
      setSpeed(0.5)
      setStepByStep(true)
      setPaused(true)
      const id = setTimeout(() => {
        enqueue(moves.join(' '))
        setPaused(true) // stay paused; user presses "下一步" to advance
      }, 800)
      return () => {
        clearTimeout(id)
        setSpeed(prevSpeed)
        setStepByStep(prevStepByStep)
      }
    }
    enqueue(moves.join(' '))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chapterId, stepIdx, rerunKey])

  // Auto-undo wrong moves on guided/free steps.
  useEffect(() => {
    const isGuided = phase === 'guided' || phase === 'free'
    if (!isGuided || !requireMoves || requireMoves.length === 0) return
    if (history.length === 0) return
    const prior = history.slice(0, -1)
    const i = matchedCount(prior, requireMoves)
    const expected = requireMoves[i]
    const last = history[history.length - 1]
    if (last !== expected) {
      playSfx('wrong')
      const id = setTimeout(() => undo(), 1500)
      return () => clearTimeout(id)
    }
  }, [history, phase, requireMoves, undo])

  // Success sound when practice transitions to done.
  const prevDoneRef = useRef(false)
  useEffect(() => {
    if (practiceDone && !prevDoneRef.current && requireMoves) playSfx('success')
    prevDoneRef.current = practiceDone
  }, [practiceDone, requireMoves])

  // Keep highlightedFace/highlightedMove in sync with next required move.
  // Main step-change effect owns the highlights for show/walkthrough demos —
  // this effect only manages guided/free phases.
  useEffect(() => {
    const isGuided = phase === 'guided' || phase === 'free'
    if (!isGuided || !requireMoves || requireMoves.length === 0) return
    const i = matchedCount(history, requireMoves)
    const nextMove = requireMoves[i]
    setHighlightedFace(nextMove ? nextMove[0] : null)
    setHighlightedMove(nextMove ?? null)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chapterId, stepIdx, phase, requireMoves, history])

  const [celebrating, setCelebrating] = useState(false)
  const [showAchievement, setShowAchievement] = useState(false)

  function handleNext() {
    if (!isLastStep) {
      setStep(stepIdx + 1)
      return
    }
    awardStars(chapterId, 1)
    markActiveToday()
    playSfx('chapter-done')
    setCelebrating(true)
    setShowAchievement(true)
    setTimeout(() => setCelebrating(false), 2000)
  }

  function handleAchievementContinue() {
    setShowAchievement(false)
    setCelebrating(false)
    if (isLastChapter) onExit()
    else setChapter(chapterId + 1)
  }

  function handleAchievementHome() {
    setShowAchievement(false)
    setCelebrating(false)
    onExit()
  }

  function handlePrev() {
    if (stepIdx > 0) setStep(stepIdx - 1)
  }

  // Demo playback progress (for mini player + dynamic narration)
  const demoPlayMoves = step.playMoves ?? []
  const demoTotal = demoPlayMoves.length
  const demoDone = Math.max(0, demoTotal - queue.length)
  const demoActive = demoTotal > 0 && (phase === 'show' || phase === 'walkthrough')
  const currentDemoMove = demoActive && demoDone < demoTotal ? demoPlayMoves[demoDone] : null
  const narration = currentDemoMove
    ? (step.stepNarrations?.[demoDone] ?? `第 ${demoDone + 1} / ${demoTotal} 步: ${friendlyMove(currentDemoMove)}`)
    : null

  return (
    <div
      className="h-screen flex flex-col overflow-hidden"
      style={{ background: 'var(--paper)' }}
    >
      <CubeKeyboardControls disableView />
      <Confetti show={celebrating} count={80} duration={2000} />
      {showAchievement && (
        <WizardAchievement
          chapterTitle={chapter.title}
          isLastChapter={isLastChapter}
          onContinue={handleAchievementContinue}
          onHome={handleAchievementHome}
        />
      )}
      <WizardHeader
        chapterId={chapterId}
        chapterTitle={chapter.title}
        stepIdx={stepIdx}
        stepCount={chapter.steps.length}
        phase={phase}
        onExit={onExit}
      />
      <div
        className="flex-1 min-h-0 grid grid-rows-[minmax(0,1fr)_auto] md:grid-rows-1 md:grid-cols-[1.4fr_1fr]"
      >
        <WizardCubeStage />
        <aside
          className="p-3 overflow-y-auto flex flex-col gap-2 border-t md:border-t-0 md:border-l border-[var(--ink)]"
          style={{ background: 'white' }}
        >
          <CubieDialog
            emotion={practiceDone && requireMoves ? 'happy' : step.emotion}
            message={narration ?? step.message}
            hint={narration ? step.message : step.hint}
            gesture={
              practiceDone && requireMoves
                ? 'thumbsup'
                : requireMoves
                  ? 'point'
                  : 'idle'
            }
          />
          {demoActive && (
            <WizardMiniPlayer total={demoTotal} done={demoDone} onRestart={() => setRerunKey((n) => n + 1)} />
          )}
          {requireMoves && (
            <WizardPracticeControls
              requireMoves={requireMoves}
              history={history}
              practiceDone={practiceDone}
              onMove={(m) => enqueue(m)}
              onReset={() => reset()}
            />
          )}
          <div className="mt-auto">
            <WizardNav
              stepIdx={stepIdx}
              stepCount={chapter.steps.length}
              isFirstStep={isFirstStep}
              isLastStep={isLastStep}
              practiceDone={practiceDone}
              onPrev={handlePrev}
              onNext={handleNext}
            />
          </div>
        </aside>
      </div>
    </div>
  )
}
