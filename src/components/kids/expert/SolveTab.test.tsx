import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useCubeStore } from '@/store/cubeStore'
import { SolveTab } from './SolveTab'

vi.mock('@/components/Cube3D', () => ({
  Cube3D: () => <div data-testid="cube3d-stub" />,
}))

vi.mock('@/cube/solver', () => ({
  initSolver: vi.fn().mockResolvedValue(undefined),
  solve: vi.fn().mockResolvedValue('R U R\''),
}))

beforeEach(() => {
  useCubeStore.getState().reset()
  useCubeStore.setState({ solving: false, solverReady: true, solverError: null })
})

describe('SolveTab solver UX (RD4-1)', () => {
  it('shows warming banner when solverReady=false', () => {
    useCubeStore.setState({ solverReady: false })
    render(<SolveTab />)
    expect(screen.getByTestId('solver-warming')).toBeInTheDocument()
  })

  it('hides warming banner when solverReady=true', () => {
    useCubeStore.setState({ solverReady: true })
    render(<SolveTab />)
    expect(screen.queryByTestId('solver-warming')).toBeNull()
  })

  it('shows error banner when solverError set', () => {
    useCubeStore.setState({ solverError: 'Kociemba 失敗：test' })
    render(<SolveTab />)
    expect(screen.getByTestId('solver-error')).toHaveTextContent(/test/)
  })

  it('error banner ✕ clears the error', async () => {
    const user = userEvent.setup()
    useCubeStore.setState({ solverError: 'oops' })
    render(<SolveTab />)
    await user.click(screen.getByRole('button', { name: /^✕$/ }))
    expect(useCubeStore.getState().solverError).toBeNull()
  })

  it('shows 計算解法中 overlay when solving=true', () => {
    useCubeStore.setState({ solving: true })
    render(<SolveTab />)
    expect(screen.getByTestId('solving-overlay')).toBeInTheDocument()
  })
})

describe('SolveTab (RD2-X4)', () => {
  it('renders cube canvas area + 3 state-setup buttons + 3 solve-method buttons', () => {
    render(<SolveTab />)
    expect(screen.getByTestId('solve-cube-canvas')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /打亂/ })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /輸入/ })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /還原/ })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /^▶ LBL$|^LBL$/ })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /^⚡ CFOP$|^CFOP$/ })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /對照/ })).toBeInTheDocument()
  })

  it('clicking 打亂 enqueues at least 25 moves', async () => {
    const user = userEvent.setup()
    render(<SolveTab />)
    await user.click(screen.getByRole('button', { name: /打亂/ }))
    expect(useCubeStore.getState().queue.length).toBeGreaterThanOrEqual(25)
  })

  it('clicking 還原 resets cube', async () => {
    const user = userEvent.setup()
    useCubeStore.getState().enqueue('R U F')
    useCubeStore.getState().finishMove()
    render(<SolveTab />)
    await user.click(screen.getByRole('button', { name: /還原/ }))
    expect(useCubeStore.getState().history).toEqual([])
  })

  it('LBL button is disabled while cube is solved', () => {
    render(<SolveTab />)
    expect(screen.getByRole('button', { name: /^▶ LBL$|^LBL$/ })).toBeDisabled()
  })

  it('LBL button enables after scramble', async () => {
    const user = userEvent.setup()
    render(<SolveTab />)
    await user.click(screen.getByRole('button', { name: /打亂/ }))
    // finish all scramble moves so cube is no longer solved
    while (useCubeStore.getState().queue.length > 0) {
      useCubeStore.getState().finishMove()
    }
    render(<SolveTab />)
    const lbls = screen.getAllByRole('button', { name: /^▶ LBL$|^LBL$/ })
    expect(lbls[lbls.length - 1]).toBeEnabled()
  })
})
