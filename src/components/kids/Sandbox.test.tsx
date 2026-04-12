import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useCubeStore } from '@/store/cubeStore'
import { Sandbox } from './Sandbox'

vi.mock('@/components/Cube3D', () => ({
  Cube3D: () => <div data-testid="cube3d-stub" />,
}))

beforeEach(() => {
  useCubeStore.getState().reset()
  useCubeStore.setState({ appMode: 'sandbox' })
})

describe('Sandbox', () => {
  it('renders MoveKeypad for input', () => {
    render(<Sandbox onExit={() => {}} />)
    expect(screen.getByTestId('move-keypad')).toBeInTheDocument()
  })

  it('renders 打亂 (scramble) button', () => {
    render(<Sandbox onExit={() => {}} />)
    expect(screen.getByRole('button', { name: /打亂/ })).toBeInTheDocument()
  })

  it('clicking 打亂 enqueues scramble moves', async () => {
    const user = userEvent.setup()
    render(<Sandbox onExit={() => {}} />)
    await user.click(screen.getByRole('button', { name: /打亂/ }))
    expect(useCubeStore.getState().queue.length).toBeGreaterThanOrEqual(25)
  })

  it('renders ↻ Reset button that resets cube', async () => {
    const user = userEvent.setup()
    useCubeStore.getState().enqueue('R')
    useCubeStore.getState().finishMove()
    render(<Sandbox onExit={() => {}} />)
    await user.click(screen.getByRole('button', { name: /重設|reset|↻/i }))
    expect(useCubeStore.getState().history).toEqual([])
  })

  describe('completion confetti (RD3-10)', () => {
    it('no confetti when entering with already-solved cube', () => {
      render(<Sandbox onExit={() => {}} />)
      expect(screen.queryByTestId('confetti')).toBeNull()
    })

    it('confetti fires on solved transition (false→true)', async () => {
      // start scrambled
      useCubeStore.setState({ cube: useCubeStore.getState().cube.apply('R') })
      render(<Sandbox onExit={() => {}} />)
      expect(screen.queryByTestId('confetti')).toBeNull()
      // solve via R'
      const { act } = await import('@testing-library/react')
      await act(async () => {
        useCubeStore.getState().enqueue("R'")
        useCubeStore.getState().finishMove()
      })
      expect(screen.getByTestId('confetti')).toBeInTheDocument()
    })
  })

  it('「💭 想學解法？」chip → setAppMode=welcome (RD3-11)', async () => {
    const user = userEvent.setup()
    render(<Sandbox onExit={() => useCubeStore.getState().setAppMode('welcome')} />)
    await user.click(screen.getByRole('button', { name: /想學解法/ }))
    expect(useCubeStore.getState().appMode).toBe('welcome')
  })

  it('clicking 回首頁 calls onExit', async () => {
    const user = userEvent.setup()
    const onExit = vi.fn()
    render(<Sandbox onExit={onExit} />)
    await user.click(screen.getByRole('button', { name: /回首頁/ }))
    expect(onExit).toHaveBeenCalled()
  })

  it('clicking a move on keypad enqueues that move', async () => {
    const user = userEvent.setup()
    render(<Sandbox onExit={() => {}} />)
    await user.click(screen.getByRole('button', { name: 'R' }))
    expect(useCubeStore.getState().queue).toContain('R')
  })
})
