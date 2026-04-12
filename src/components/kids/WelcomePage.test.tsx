import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useCubeStore } from '@/store/cubeStore'
import { WelcomePage } from './WelcomePage'
import { CHAPTERS } from './wizardChapters'

vi.mock('@/cube/solver', () => ({
  initSolver: vi.fn().mockResolvedValue(undefined),
  solve: vi.fn().mockResolvedValue(''),
}))

beforeEach(() =>
  useCubeStore.setState({
    appMode: 'welcome',
    earnedStars: { 1: 1 },
    wizardChapter: 1,
    wizardStep: 0,
  }),
)


describe('WelcomePage (KF#14)', () => {
  it('shows total star count (X / 30)', () => {
    useCubeStore.setState({ earnedStars: { 1: 3, 2: 2 } })
    render(<WelcomePage />)
    expect(screen.getByText(/5\s*\/\s*30/)).toBeInTheDocument()
  })

  it('shows 歡迎回來 greeting (returning-user only screen)', () => {
    render(<WelcomePage />)
    expect(screen.getAllByText(/回來|繼續/).length).toBeGreaterThan(0)
  })

  it('primary CTA "繼續學習" exists and is recommended', () => {
    render(<WelcomePage />)
    const cta = screen.getByRole('button', { name: /繼續學習/ })
    expect(cta).toBeInTheDocument()
    expect(cta).toHaveAttribute('data-recommended', 'true')
  })

  it('繼續學習 jumps to first un-starred chapter and sets appMode=wizard', async () => {
    const user = userEvent.setup()
    useCubeStore.setState({ earnedStars: { 1: 1, 2: 1 }, wizardChapter: 5, wizardStep: 4 })
    render(<WelcomePage />)
    await user.click(screen.getByRole('button', { name: /繼續學習/ }))
    const s = useCubeStore.getState()
    expect(s.appMode).toBe('wizard')
    expect(s.wizardChapter).toBe(3) // first unstarred
    expect(s.wizardStep).toBe(0)
  })

  it('自由玩 sticker removed from primary CTAs (RD3-4)', () => {
    render(<WelcomePage />)
    // hero used to have giant 🎮 自由玩 sticker — now only a small chip below grid
    const tinyChip = screen.queryByTestId('sandbox-chip')
    expect(tinyChip).toBeInTheDocument()
    // primary-area CTA selector should not match
    const primaryButtons = screen.getAllByRole('button')
    const heroFreePlay = primaryButtons.find((b) => b.classList.contains('rounded-3xl') && b.textContent?.includes('自由玩'))
    expect(heroFreePlay).toBeUndefined()
  })

  it('小 sandbox chip → setAppMode=sandbox (RD3-6)', async () => {
    const user = userEvent.setup()
    render(<WelcomePage />)
    await user.click(screen.getByTestId('sandbox-chip'))
    expect(useCubeStore.getState().appMode).toBe('sandbox')
  })

  it('專家模式 sticker not in primary CTAs (RD3-4)', () => {
    useCubeStore.setState({ earnedStars: Object.fromEntries(CHAPTERS.map((c) => [c.id, 3])) })
    render(<WelcomePage />)
    // expert sentinel will appear at scroll bottom (RD3-5); not as hero
    const heroExpert = screen.queryByTestId('expert-entry')
    expect(heroExpert).toBeNull()
  })

  describe('expert sentinel (RD3-5)', () => {
    it('not rendered when chapters not all starred', () => {
      useCubeStore.setState({ earnedStars: { 1: 1, 2: 1 } })
      render(<WelcomePage />)
      expect(screen.queryByTestId('expert-sentinel')).toBeNull()
    })

    it('renders sentinel at bottom when all chapters starred', () => {
      useCubeStore.setState({ earnedStars: Object.fromEntries(CHAPTERS.map((c) => [c.id, 3])) })
      render(<WelcomePage />)
      expect(screen.getByTestId('expert-sentinel')).toBeInTheDocument()
    })

    it('clicking sentinel sets appMode=expert', async () => {
      const user = userEvent.setup()
      useCubeStore.setState({ earnedStars: Object.fromEntries(CHAPTERS.map((c) => [c.id, 3])) })
      render(<WelcomePage />)
      await user.click(screen.getByTestId('expert-sentinel'))
      expect(useCubeStore.getState().appMode).toBe('expert')
    })
  })

  it('挑戰 button removed', () => {
    render(<WelcomePage />)
    expect(screen.queryByRole('button', { name: /挑戰/ })).not.toBeInTheDocument()
  })

  it('clicking an unlocked chapter cell in the grid jumps to it', async () => {
    const user = userEvent.setup()
    render(<WelcomePage />)
    const grid = screen.getByTestId('chapter-grid')
    const ch2Cell = within(grid).getByRole('button', { name: /Ch2/ })
    await user.click(ch2Cell)
    const s = useCubeStore.getState()
    expect(s.appMode).toBe('wizard')
    expect(s.wizardChapter).toBe(2)
  })

  it('locked chapter cell is disabled', () => {
    render(<WelcomePage />) // earnedStars:{1:1}, so Ch3+ locked
    const grid = screen.getByTestId('chapter-grid')
    expect(within(grid).getByRole('button', { name: /Ch4/ })).toBeDisabled()
  })

  it('shows streak count with activeDays7d (RD2-M9)', () => {
    const today = new Date().toISOString().slice(0, 10)
    useCubeStore.setState({ activeDates: [today], earnedStars: { 1: 1 } })
    render(<WelcomePage />)
    expect(screen.getByText(/過去 7 天玩了 1 次/)).toBeInTheDocument()
  })

  describe('layout (RD2-C9)', () => {
    it('章節進度 renders as a 9-cell grid (not a list)', () => {
      useCubeStore.setState({ earnedStars: { 1: 3, 2: 2 } })
      render(<WelcomePage />)
      const grid = screen.getByTestId('chapter-grid')
      // every CHAPTER has a cell
      for (const c of CHAPTERS) {
        expect(grid).toHaveTextContent(`Ch${c.id}`)
      }
    })

    it('locked chapters (parent missing star) show 🔒 icon', () => {
      useCubeStore.setState({ earnedStars: {} }) // only Ch1 unlocked
      render(<WelcomePage />)
      const grid = screen.getByTestId('chapter-grid')
      // Ch3+ locked
      expect(grid.textContent).toMatch(/🔒/)
    })

    it('sound + notation toggles live in a top-right header zone', () => {
      useCubeStore.setState({ earnedStars: { 1: 1 } })
      render(<WelcomePage />)
      const header = screen.getByTestId('welcome-top-toggles')
      expect(header).toContainElement(screen.getByTestId('sound-toggle'))
      expect(header).toContainElement(screen.getByTestId('notation-toggle'))
    })
  })

  it('shows Cubie greeting', () => {
    render(<WelcomePage />)
    expect(screen.getAllByText(/Cubie/).length).toBeGreaterThan(0)
  })
})
