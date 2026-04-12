import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useCubeStore } from '@/store/cubeStore'
import { Wizard } from './Wizard'
import { CHAPTERS } from './wizardChapters'

vi.mock('@/components/Cube3D', () => ({
  Cube3D: () => <div data-testid="cube3d-stub" />,
}))


beforeEach(() => {
  useCubeStore.setState({ wizardChapter: 1, wizardStep: 0, earnedStars: {} })
})

describe('Wizard', () => {
  it('renders Chapter 1 title + step counter', () => {
    render(<Wizard onExit={() => {}} />)
    expect(screen.getAllByText(/認識魔術方塊/).length).toBeGreaterThan(0)
    expect(screen.getByText(/Step 1/)).toBeInTheDocument()
  })

  it('renders the current step Cubie message (after typewriter completes)', async () => {
    vi.useFakeTimers()
    render(<Wizard onExit={() => {}} />)
    // Ch1 step 1 message starts with "嗨", typewriter ~30ms/char × 17 chars
    await act(async () => { vi.advanceTimersByTime(2000) })
    expect(screen.getByText(/嗨/)).toBeInTheDocument()
    vi.useRealTimers()
  })

  it('Next advances wizardStep', async () => {
    const user = userEvent.setup()
    render(<Wizard onExit={() => {}} />)
    await user.click(screen.getByRole('button', { name: /下一步/ }))
    expect(useCubeStore.getState().wizardStep).toBe(1)
  })

  it('Prev decreases wizardStep', async () => {
    const user = userEvent.setup()
    useCubeStore.setState({ wizardStep: 2 })
    render(<Wizard onExit={() => {}} />)
    await user.click(screen.getByRole('button', { name: /上一步/ }))
    expect(useCubeStore.getState().wizardStep).toBe(1)
  })

  it('Prev disabled at first step', () => {
    render(<Wizard onExit={() => {}} />)
    expect(screen.getByRole('button', { name: /上一步/ })).toBeDisabled()
  })

  it('on last step, Next button reads 完成本章 and awards a star', () => {
    useCubeStore.setState({ wizardStep: 6 })
    render(<Wizard onExit={() => {}} />)
    expect(screen.getByRole('button', { name: /完成本章/ })).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: /完成本章/ }))
    // awardStars happens synchronously even though chapter advance is delayed
    expect(useCubeStore.getState().earnedStars[1]).toBeGreaterThanOrEqual(1)
  })

  // 3D cube renders inside Canvas (R3F), which doesn't run in jsdom.
  // Verify the main region exists instead.
  it('renders the cube area (main region)', () => {
    const { container } = render(<Wizard onExit={() => {}} />)
    expect(container.querySelector('main')).toBeInTheDocument()
  })

  it('Exit button calls onExit', async () => {
    const user = userEvent.setup()
    const onExit = vi.fn()
    render(<Wizard onExit={onExit} />)
    await user.click(screen.getByRole('button', { name: /回首頁|exit/i }))
    expect(onExit).toHaveBeenCalled()
  })

  it('step with playMoves enqueues those moves after demo pre-highlight delay', async () => {
    // Ch2 step 1 has playMoves: ['U']; show-phase demo pre-highlights 800ms, then enqueues.
    vi.useFakeTimers()
    try {
      useCubeStore.setState({ wizardChapter: 2, wizardStep: 1 })
      render(<Wizard onExit={() => {}} />)
      await act(async () => { await vi.advanceTimersByTimeAsync(900) })
      expect(useCubeStore.getState().queue).toContain('U')
    } finally {
      vi.useRealTimers()
    }
  })

  describe('practice success feedback (KF#15 slice 2C)', () => {
    it('shows 太棒了 chip when practice requireMoves match history tail', () => {
      const original = { ...CHAPTERS[0].steps[0] }
      CHAPTERS[0].steps[0] = { ...original, message: '請轉 U', requireMoves: ['U'] } as typeof original
      try {
        useCubeStore.setState({ wizardChapter: 1, wizardStep: 0, history: ['U'] })
        render(<Wizard onExit={() => {}} />)
        expect(screen.getByTestId('practice-success')).toBeInTheDocument()
        expect(screen.getByTestId('practice-success')).toHaveTextContent(/太棒了/)
      } finally {
        CHAPTERS[0].steps[0] = original
      }
    })

    it('hides 太棒了 chip when practice not yet satisfied', () => {
      const original = { ...CHAPTERS[0].steps[0] }
      CHAPTERS[0].steps[0] = { ...original, message: '請轉 U', requireMoves: ['U'] } as typeof original
      try {
        useCubeStore.setState({ wizardChapter: 1, wizardStep: 0, history: [] })
        render(<Wizard onExit={() => {}} />)
        expect(screen.queryByTestId('practice-success')).not.toBeInTheDocument()
      } finally {
        CHAPTERS[0].steps[0] = original
      }
    })

    it('does not show 太棒了 on non-practice steps even if history exists', () => {
      useCubeStore.setState({ wizardChapter: 1, wizardStep: 0, history: ['U', 'R'] })
      render(<Wizard onExit={() => {}} />)
      expect(screen.queryByTestId('practice-success')).not.toBeInTheDocument()
    })
  })

  describe('chapter completion achievement (RD2-A5)', () => {
    it('shows achievement screen after completing last step (replaces auto-advance)', () => {
      // Ch1 has 7 steps, last index = 6
      useCubeStore.setState({ wizardChapter: 1, wizardStep: 6 })
      render(<Wizard onExit={() => {}} />)
      fireEvent.click(screen.getByRole('button', { name: /完成本章/ }))
      expect(screen.getByTestId('achievement-screen')).toBeInTheDocument()
    })

    it('achievement shows the cleared chapter title', () => {
      useCubeStore.setState({ wizardChapter: 1, wizardStep: 6 })
      render(<Wizard onExit={() => {}} />)
      fireEvent.click(screen.getByRole('button', { name: /完成本章/ }))
      expect(screen.getByTestId('achievement-screen')).toHaveTextContent(/認識魔術方塊/)
    })

    it('下一章 button advances to next chapter', () => {
      useCubeStore.setState({ wizardChapter: 1, wizardStep: 6 })
      render(<Wizard onExit={() => {}} />)
      fireEvent.click(screen.getByRole('button', { name: /完成本章/ }))
      fireEvent.click(screen.getByRole('button', { name: /下一章/ }))
      expect(useCubeStore.getState().wizardChapter).toBe(2)
    })

    it('回首頁 button calls onExit', () => {
      const onExit = vi.fn()
      useCubeStore.setState({ wizardChapter: 1, wizardStep: 6 })
      render(<Wizard onExit={onExit} />)
      fireEvent.click(screen.getByRole('button', { name: /完成本章/ }))
      fireEvent.click(screen.getAllByRole('button', { name: /回首頁/ })[0])
      expect(onExit).toHaveBeenCalled()
    })

    it('last chapter has no 下一章 button (only 回首頁)', () => {
      const last = CHAPTERS[CHAPTERS.length - 1]
      useCubeStore.setState({ wizardChapter: last.id, wizardStep: last.steps.length - 1 })
      render(<Wizard onExit={() => {}} />)
      fireEvent.click(screen.getByRole('button', { name: /完成本章/ }))
      expect(screen.queryByRole('button', { name: /下一章/ })).not.toBeInTheDocument()
    })
  })

  describe('X2 atomic in requireMoves (RD2-C13)', () => {
    it('history containing U2 satisfies requireMoves:["U2"]', () => {
      const original = { ...CHAPTERS[0].steps[0] }
      CHAPTERS[0].steps[0] = { ...original, message: '練 U2', requireMoves: ['U2'] } as typeof original
      try {
        useCubeStore.setState({ wizardChapter: 1, wizardStep: 0, history: ['U2'] })
        render(<Wizard onExit={() => {}} />)
        expect(screen.getByRole('button', { name: /下一步|完成本章/ })).toBeEnabled()
      } finally {
        CHAPTERS[0].steps[0] = original
      }
    })

    it('history with [U, U] does NOT satisfy requireMoves:["U2"] (distinct atoms)', () => {
      const original = { ...CHAPTERS[0].steps[0] }
      CHAPTERS[0].steps[0] = { ...original, message: '練 U2', requireMoves: ['U2'] } as typeof original
      try {
        useCubeStore.setState({ wizardChapter: 1, wizardStep: 0, history: ['U', 'U'] })
        render(<Wizard onExit={() => {}} />)
        expect(screen.getByRole('button', { name: /下一步|完成本章/ })).toBeDisabled()
      } finally {
        CHAPTERS[0].steps[0] = original
      }
    })
  })

  describe('no native tooltip on disabled Next (RD2-C8)', () => {
    it('Next button does not set title attribute when blocked', () => {
      const original = { ...CHAPTERS[0].steps[0] }
      CHAPTERS[0].steps[0] = { ...original, message: '練 R', requireMoves: ['R'] } as typeof original
      try {
        useCubeStore.setState({ wizardChapter: 1, wizardStep: 0, history: [] })
        render(<Wizard onExit={() => {}} />)
        const next = screen.getByRole('button', { name: /下一步/ })
        expect(next).toBeDisabled()
        expect(next).not.toHaveAttribute('title')
      } finally {
        CHAPTERS[0].steps[0] = original
      }
    })
  })

  describe('HintButton (RD2-A4)', () => {
    it('renders 提示 button on guided steps', () => {
      const original = { ...CHAPTERS[0].steps[0] }
      CHAPTERS[0].steps[0] = { ...original, message: '練 R', requireMoves: ['R'] } as typeof original
      try {
        useCubeStore.setState({ wizardChapter: 1, wizardStep: 0, history: [] })
        render(<Wizard onExit={() => {}} />)
        expect(screen.getByRole('button', { name: /提示/ })).toBeInTheDocument()
      } finally {
        CHAPTERS[0].steps[0] = original
      }
    })

    it('does NOT render 提示 button on non-practice steps', () => {
      useCubeStore.setState({ wizardChapter: 1, wizardStep: 0, history: [] })
      render(<Wizard onExit={() => {}} />)
      expect(screen.queryByRole('button', { name: /提示/ })).not.toBeInTheDocument()
    })

    it('clicking 提示 enqueues the next required move', async () => {
      const original = { ...CHAPTERS[0].steps[0] }
      CHAPTERS[0].steps[0] = { ...original, message: '練 R', requireMoves: ['R'] } as typeof original
      try {
        useCubeStore.setState({ wizardChapter: 1, wizardStep: 0, history: [], queue: [] })
        render(<Wizard onExit={() => {}} />)
        fireEvent.click(screen.getByRole('button', { name: /提示/ }))
        expect(useCubeStore.getState().queue).toContain('R')
      } finally {
        CHAPTERS[0].steps[0] = original
      }
    })
  })

  describe('auto-undo wrong move (RD2-M7)', () => {
    it('auto-undoes a wrong move on guided step after a short delay', async () => {
      vi.useFakeTimers()
      const original = { ...CHAPTERS[0].steps[0] }
      CHAPTERS[0].steps[0] = { ...original, message: '練 R', requireMoves: ['R'] } as typeof original
      try {
        useCubeStore.setState({ wizardChapter: 1, wizardStep: 0, history: [], queue: [] })
        render(<Wizard onExit={() => {}} />)
        await act(async () => {
          useCubeStore.getState().enqueue('L')
          useCubeStore.getState().finishMove()
        })
        expect(useCubeStore.getState().history).toEqual(['L'])
        await act(async () => { vi.advanceTimersByTime(1600) })
        expect(useCubeStore.getState().history).toEqual([])
      } finally {
        CHAPTERS[0].steps[0] = original
        vi.useRealTimers()
      }
    })

    it('does NOT auto-undo a correct move', async () => {
      vi.useFakeTimers()
      const original = { ...CHAPTERS[0].steps[0] }
      CHAPTERS[0].steps[0] = { ...original, message: '練 R', requireMoves: ['R'] } as typeof original
      try {
        useCubeStore.setState({ wizardChapter: 1, wizardStep: 0, history: [], queue: [] })
        render(<Wizard onExit={() => {}} />)
        await act(async () => {
          useCubeStore.getState().enqueue('R')
          useCubeStore.getState().finishMove()
        })
        await act(async () => { vi.advanceTimersByTime(2000) })
        expect(useCubeStore.getState().history).toEqual(['R'])
      } finally {
        CHAPTERS[0].steps[0] = original
        vi.useRealTimers()
      }
    })
  })

  describe('Cubie gesture (RD2-M6)', () => {
    it('uses gesture=point on guided step before practiceDone', () => {
      const original = { ...CHAPTERS[0].steps[0] }
      CHAPTERS[0].steps[0] = { ...original, message: '練 U', requireMoves: ['U'] } as typeof original
      try {
        useCubeStore.setState({ wizardChapter: 1, wizardStep: 0, history: [] })
        const { container } = render(<Wizard onExit={() => {}} />)
        expect(container.querySelector('[data-gesture="point"]')).toBeInTheDocument()
      } finally {
        CHAPTERS[0].steps[0] = original
      }
    })

    it('uses gesture=thumbsup once practiceDone', () => {
      const original = { ...CHAPTERS[0].steps[0] }
      CHAPTERS[0].steps[0] = { ...original, message: '練 U', requireMoves: ['U'] } as typeof original
      try {
        useCubeStore.setState({ wizardChapter: 1, wizardStep: 0, history: ['U'] })
        const { container } = render(<Wizard onExit={() => {}} />)
        expect(container.querySelector('[data-gesture="thumbsup"]')).toBeInTheDocument()
      } finally {
        CHAPTERS[0].steps[0] = original
      }
    })

    it('uses gesture=idle on non-practice step', () => {
      useCubeStore.setState({ wizardChapter: 1, wizardStep: 0, history: [] })
      const { container } = render(<Wizard onExit={() => {}} />)
      expect(container.querySelector('[data-gesture="idle"]')).toBeInTheDocument()
    })
  })

  describe('face highlight (RD2-M5)', () => {
    it('sets store.highlightedFace to next required move face on guided step', () => {
      const original = { ...CHAPTERS[0].steps[0] }
      CHAPTERS[0].steps[0] = { ...original, message: '練 R', requireMoves: ['R'] } as typeof original
      try {
        useCubeStore.setState({ wizardChapter: 1, wizardStep: 0, history: [], highlightedFace: null })
        render(<Wizard onExit={() => {}} />)
        expect(useCubeStore.getState().highlightedFace).toBe('R')
      } finally {
        CHAPTERS[0].steps[0] = original
      }
    })

    it('clears highlightedFace on non-guided step', () => {
      useCubeStore.setState({ wizardChapter: 1, wizardStep: 0, history: [], highlightedFace: 'R' })
      render(<Wizard onExit={() => {}} />)
      expect(useCubeStore.getState().highlightedFace).toBeNull()
    })

    it('strips prime/2 suffix when extracting face (R\' -> R, R2 -> R)', () => {
      const original = { ...CHAPTERS[0].steps[0] }
      CHAPTERS[0].steps[0] = { ...original, message: '練 R\'', requireMoves: ["R'"] } as typeof original
      try {
        useCubeStore.setState({ wizardChapter: 1, wizardStep: 0, history: [], highlightedFace: null })
        render(<Wizard onExit={() => {}} />)
        expect(useCubeStore.getState().highlightedFace).toBe('R')
      } finally {
        CHAPTERS[0].steps[0] = original
      }
    })
  })

  describe('phase badge (RD2-M4)', () => {
    it('shows "👀 看示範" badge for show-phase steps', () => {
      useCubeStore.setState({ wizardChapter: 1, wizardStep: 0, history: [] })
      render(<Wizard onExit={() => {}} />)
      expect(screen.getByTestId('phase-badge')).toHaveTextContent(/看示範/)
    })

    it('shows "🎯 換你做" badge for guided-phase (requireMoves) steps', () => {
      const original = { ...CHAPTERS[0].steps[0] }
      CHAPTERS[0].steps[0] = { ...original, message: '練 U', requireMoves: ['U'] } as typeof original
      try {
        useCubeStore.setState({ wizardChapter: 1, wizardStep: 0, history: [] })
        render(<Wizard onExit={() => {}} />)
        expect(screen.getByTestId('phase-badge')).toHaveTextContent(/換你做/)
      } finally {
        CHAPTERS[0].steps[0] = original
      }
    })
  })

  describe('compact keypad (RD2-C7)', () => {
    it('shows only 6 buttons when requireMoves uses only CW base moves', () => {
      const original = { ...CHAPTERS[0].steps[0] }
      CHAPTERS[0].steps[0] = { ...original, message: '練 U', requireMoves: ['U'] } as typeof original
      try {
        useCubeStore.setState({ wizardChapter: 1, wizardStep: 0, history: [] })
        render(<Wizard onExit={() => {}} />)
        expect(screen.getAllByRole('button').filter((b) => /^[UDLRFB]('|2)?/.test(b.textContent ?? '') && /(↻|↺|180°)/.test(b.textContent ?? ''))).toHaveLength(6)
      } finally {
        CHAPTERS[0].steps[0] = original
      }
    })

    it('shows 12 buttons when requireMoves includes a prime move', () => {
      const original = { ...CHAPTERS[0].steps[0] }
      CHAPTERS[0].steps[0] = { ...original, message: '練', requireMoves: ['R', "U'"] } as typeof original
      try {
        useCubeStore.setState({ wizardChapter: 1, wizardStep: 0, history: [] })
        render(<Wizard onExit={() => {}} />)
        expect(screen.getAllByRole('button').filter((b) => /^[UDLRFB]('|2)?/.test(b.textContent ?? '') && /(↻|↺|180°)/.test(b.textContent ?? ''))).toHaveLength(12)
      } finally {
        CHAPTERS[0].steps[0] = original
      }
    })

    it('shows 18 buttons when requireMoves includes a "2" move', () => {
      const original = { ...CHAPTERS[0].steps[0] }
      CHAPTERS[0].steps[0] = { ...original, message: '練', requireMoves: ['R', "U'", 'F2'] } as typeof original
      try {
        useCubeStore.setState({ wizardChapter: 1, wizardStep: 0, history: [] })
        render(<Wizard onExit={() => {}} />)
        expect(screen.getAllByRole('button').filter((b) => /^[UDLRFB]('|2)?/.test(b.textContent ?? '') && /(↻|↺|180°)/.test(b.textContent ?? ''))).toHaveLength(18)
      } finally {
        CHAPTERS[0].steps[0] = original
      }
    })
  })

  describe('MoveKeypad integration (RD2-M3)', () => {
    it('renders MoveKeypad on practice steps (requireMoves)', () => {
      const original = { ...CHAPTERS[0].steps[0] }
      CHAPTERS[0].steps[0] = { ...original, message: '請轉 U', requireMoves: ['U'] } as typeof original
      try {
        useCubeStore.setState({ wizardChapter: 1, wizardStep: 0, history: [] })
        render(<Wizard onExit={() => {}} />)
        expect(screen.getByTestId('move-keypad')).toBeInTheDocument()
      } finally {
        CHAPTERS[0].steps[0] = original
      }
    })

    it('does NOT render MoveKeypad on non-practice steps', () => {
      useCubeStore.setState({ wizardChapter: 1, wizardStep: 0, history: [] })
      render(<Wizard onExit={() => {}} />)
      expect(screen.queryByTestId('move-keypad')).not.toBeInTheDocument()
    })

    it('clicking the highlighted move enqueues it (drives practiceDone)', async () => {
      const user = userEvent.setup()
      const original = { ...CHAPTERS[0].steps[0] }
      CHAPTERS[0].steps[0] = { ...original, message: '請轉 U', requireMoves: ['U'] } as typeof original
      try {
        useCubeStore.setState({ wizardChapter: 1, wizardStep: 0, history: [] })
        render(<Wizard onExit={() => {}} />)
        await user.click(screen.getByRole('button', { name: 'U' }))
        // Move enters the queue (not yet finished — Cube3D would tick).
        expect(useCubeStore.getState().queue).toContain('U')
      } finally {
        CHAPTERS[0].steps[0] = original
      }
    })

    it('next required move is highlighted on the keypad', () => {
      const original = { ...CHAPTERS[0].steps[0] }
      CHAPTERS[0].steps[0] = { ...original, message: '練 R U', requireMoves: ['R', 'U'] } as typeof original
      try {
        useCubeStore.setState({ wizardChapter: 1, wizardStep: 0, history: [] })
        render(<Wizard onExit={() => {}} />)
        expect(screen.getByRole('button', { name: 'R' })).toHaveAttribute('data-highlight', 'true')
        expect(screen.getByRole('button', { name: 'U' })).toHaveAttribute('data-highlight', 'false')
      } finally {
        CHAPTERS[0].steps[0] = original
      }
    })
  })

  describe('practice retry (KF#15 slice 2B)', () => {
    it('practice step shows 再試一次 button that resets cube + history', async () => {
      const user = userEvent.setup()
      const original = { ...CHAPTERS[0].steps[0] }
      CHAPTERS[0].steps[0] = { ...original, message: '請轉一下 U', requireMoves: ['U'] } as typeof original
      try {
        useCubeStore.setState({ wizardChapter: 1, wizardStep: 0, history: ['F', "L'"] })
        render(<Wizard onExit={() => {}} />)
        const retry = screen.getByRole('button', { name: /再試一次/ })
        await user.click(retry)
        expect(useCubeStore.getState().history).toEqual([])
      } finally {
        CHAPTERS[0].steps[0] = original
      }
    })

    it('non-practice step does NOT show 再試一次', () => {
      // Default Ch1 step 0 has no requireMoves
      useCubeStore.setState({ wizardChapter: 1, wizardStep: 0, history: [] })
      render(<Wizard onExit={() => {}} />)
      expect(screen.queryByRole('button', { name: /再試一次/ })).not.toBeInTheDocument()
    })
  })

  describe('practice step (KF#15 — You do)', () => {
    it('blocks 下一步 until user has executed targetMoves', () => {
      // Inject a temporary practice step into chapter 2's last step
      // by setting state to a chapter/step that has requireMoves.
      // We simulate by patching CHAPTERS at runtime via a dedicated
      // chapter (Ch2 step 0 is "happy intro"; we use Ch1 step 5 which is
      // the "drag the cube" step — and add a requireMoves to a known step).
      // Practical approach: spy on chapter data — instead use Ch2 step 1
      // (which has playMoves=['U']) but we treat moves the user added as practice.
      // To avoid global mutation we just check the contract: when current step
      // has requireMoves, the Next button is disabled until store.history matches.
      useCubeStore.setState({
        wizardChapter: 99, // forces fallback to CHAPTERS[0]; we override below
      })
      // Replace step temporarily via a custom chapter on CHAPTERS[0]:
      const original = { ...CHAPTERS[0].steps[0] }
      CHAPTERS[0].steps[0] = {
        ...original,
        message: '請轉一下 U',
        requireMoves: ['U'],
      } as typeof original
      try {
        useCubeStore.setState({ wizardChapter: 1, wizardStep: 0, history: [] })
        render(<Wizard onExit={() => {}} />)
        const next = screen.getByRole('button', { name: /下一步/ })
        expect(next).toBeDisabled()
      } finally {
        CHAPTERS[0].steps[0] = original
      }
    })

    it('enables 下一步 once user history contains the requireMoves', () => {
      const original = { ...CHAPTERS[0].steps[0] }
      CHAPTERS[0].steps[0] = {
        ...original,
        message: '請轉一下 U',
        requireMoves: ['U'],
      } as typeof original
      try {
        useCubeStore.setState({
          wizardChapter: 1,
          wizardStep: 0,
          history: ['U'],
        })
        render(<Wizard onExit={() => {}} />)
        const next = screen.getByRole('button', { name: /下一步|完成本章/ })
        expect(next).toBeEnabled()
      } finally {
        CHAPTERS[0].steps[0] = original
      }
    })
  })

  it('completing the last chapter shows achievement → 回首頁 calls onExit', () => {
    const onExit = vi.fn()
    const lastStepIdx = CHAPTERS[CHAPTERS.length - 1].steps.length - 1
    useCubeStore.setState({ wizardChapter: CHAPTERS.length, wizardStep: lastStepIdx })
    render(<Wizard onExit={onExit} />)
    fireEvent.click(screen.getByRole('button', { name: /完成本章/ }))
    fireEvent.click(screen.getAllByRole('button', { name: /回首頁/ })[0])
    expect(onExit).toHaveBeenCalled()
  })
})
