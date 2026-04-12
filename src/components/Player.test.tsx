import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Player } from './Player'
import { useCubeStore } from '@/store/cubeStore'

vi.mock('@/cube/solver', () => ({
  initSolver: vi.fn().mockResolvedValue(undefined),
  solve: vi.fn().mockResolvedValue(''),
}))

describe('Player', () => {
  beforeEach(() => useCubeStore.getState().reset())

  it('Pause/Step are disabled when queue is empty', () => {
    render(<Player />)
    expect(screen.getByRole('button', { name: /pause|play/i })).toBeDisabled()
    expect(screen.getByRole('button', { name: /step/i })).toBeDisabled()
  })

  it('Prev button disabled when history is empty', () => {
    render(<Player />)
    expect(screen.getByRole('button', { name: /prev/i })).toBeDisabled()
  })

  it('Prev button enabled when history has moves; clicking steps back', async () => {
    const user = userEvent.setup()
    useCubeStore.getState().enqueue('R')
    useCubeStore.getState().finishMove()
    render(<Player />)
    const prev = screen.getByRole('button', { name: /prev/i })
    expect(prev).toBeEnabled()
    await user.click(prev)
    expect(useCubeStore.getState().history).toEqual([])
    expect(useCubeStore.getState().queue[0]).toBe('R')
  })

  it('Pause toggles paused state', async () => {
    const user = userEvent.setup()
    useCubeStore.getState().enqueue("R U R'")
    render(<Player />)
    expect(useCubeStore.getState().paused).toBe(false)
    await user.click(screen.getByRole('button', { name: /pause/i }))
    expect(useCubeStore.getState().paused).toBe(true)
    await user.click(screen.getByRole('button', { name: /play/i }))
    expect(useCubeStore.getState().paused).toBe(false)
  })

  it('Step adds a step token', async () => {
    const user = userEvent.setup()
    useCubeStore.getState().enqueue('R')
    render(<Player />)
    await user.click(screen.getByRole('button', { name: /step/i }))
    expect(useCubeStore.getState().stepTokens).toBe(1)
  })

  it('Speed buttons set speed', async () => {
    const user = userEvent.setup()
    render(<Player />)
    await user.click(screen.getByRole('button', { name: '4×' }))
    expect(useCubeStore.getState().speed).toBe(4)
    await user.click(screen.getByRole('button', { name: '0.5×' }))
    expect(useCubeStore.getState().speed).toBe(0.5)
  })

  it('shows progress when program loaded', () => {
    useCubeStore.getState().enqueue("R U R'")
    render(<Player />)
    expect(screen.getByText(/0 \/ 3/)).toBeInTheDocument()
  })

  it('renders 每步暫停 checkbox toggling stepByStep', async () => {
    const user = userEvent.setup()
    render(<Player />)
    const cb = screen.getByLabelText(/每步暫停/) as HTMLInputElement
    expect(cb.checked).toBe(false)
    await user.click(cb)
    expect(useCubeStore.getState().stepByStep).toBe(true)
  })
})
