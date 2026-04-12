import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useCubeStore } from '@/store/cubeStore'
import { CasesTab } from './CasesTab'

vi.mock('@/cube/solver', () => ({
  initSolver: vi.fn().mockResolvedValue(undefined),
  solve: vi.fn().mockResolvedValue(''),
}))

beforeEach(() => {
  useCubeStore.getState().reset()
})

describe('CasesTab (RD2-X6)', () => {
  it('renders F2L and PLL family toggle + search input', () => {
    render(<CasesTab />)
    expect(screen.getByRole('tab', { name: /^F2L/ })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: /^PLL/ })).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/搜尋/)).toBeInTheDocument()
  })

  it('shows F2L cases by default', () => {
    render(<CasesTab />)
    // At least one F2L case card should render
    expect(screen.getAllByTestId(/^case-card-/).length).toBeGreaterThan(0)
  })

  it('search narrows the case list', async () => {
    const user = userEvent.setup()
    render(<CasesTab />)
    const countBefore = screen.getAllByTestId(/^case-card-/).length
    await user.type(screen.getByPlaceholderText(/搜尋/), 'xxnonexistentxx')
    const countAfter = screen.queryAllByTestId(/^case-card-/).length
    expect(countAfter).toBeLessThan(countBefore)
  })

  it('clicking a case shows dock bar (no auto-tab-switch)', async () => {
    const user = userEvent.setup()
    const onJumpToSolve = vi.fn()
    render(<CasesTab onJumpToSolve={onJumpToSolve} />)
    const firstCard = screen.getAllByTestId(/^case-card-/)[0]
    await user.click(firstCard)
    expect(screen.getByTestId('case-apply-dock')).toBeInTheDocument()
    expect(onJumpToSolve).not.toHaveBeenCalled()
  })

  it('dock 跳到解 tab button calls onJumpToSolve', async () => {
    const user = userEvent.setup()
    const onJumpToSolve = vi.fn()
    render(<CasesTab onJumpToSolve={onJumpToSolve} />)
    await user.click(screen.getAllByTestId(/^case-card-/)[0])
    await user.click(screen.getByRole('button', { name: /跳到解/ }))
    expect(onJumpToSolve).toHaveBeenCalledOnce()
  })

  it('dock ✕ button hides dock', async () => {
    const user = userEvent.setup()
    render(<CasesTab onJumpToSolve={() => {}} />)
    await user.click(screen.getAllByTestId(/^case-card-/)[0])
    await user.click(screen.getByRole('button', { name: /關閉/ }))
    expect(screen.queryByTestId('case-apply-dock')).toBeNull()
  })

  it('switching to PLL tab shows different cases', async () => {
    const user = userEvent.setup()
    render(<CasesTab />)
    const f2lFirstCard = screen.getAllByTestId(/^case-card-/)[0].textContent
    await user.click(screen.getByRole('tab', { name: /^PLL/ }))
    const pllFirstCard = screen.getAllByTestId(/^case-card-/)[0].textContent
    expect(pllFirstCard).not.toBe(f2lFirstCard)
  })

  describe('teaching mode toggle (v6)', () => {
    it('has a 🎓 teach-mode toggle defaulting to off', () => {
      render(<CasesTab />)
      const btn = screen.getByTestId('teach-mode-toggle')
      expect(btn).toHaveAttribute('aria-pressed', 'false')
      expect(btn.textContent).toMatch(/關/)
    })

    it('clicking toggle switches state + label', async () => {
      const user = userEvent.setup()
      render(<CasesTab />)
      const btn = screen.getByTestId('teach-mode-toggle')
      await user.click(btn)
      expect(btn).toHaveAttribute('aria-pressed', 'true')
      expect(btn.textContent).toMatch(/開/)
    })

    it('applying a case with teach-mode ON enables stepByStep + paused', async () => {
      const user = userEvent.setup()
      render(<CasesTab />)
      await user.click(screen.getByTestId('teach-mode-toggle'))
      await user.click(screen.getAllByTestId(/^case-card-/)[0])
      await new Promise((r) => setTimeout(r, 50))
      const s = useCubeStore.getState()
      expect(s.stepByStep).toBe(true)
      expect(s.paused).toBe(true)
      expect(s.queue.length).toBeGreaterThan(0)
    })
  })
})
