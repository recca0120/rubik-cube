import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import { Confetti } from './Confetti'

afterEach(() => vi.useRealTimers())

describe('Confetti', () => {
  it('renders nothing when show=false', () => {
    render(<Confetti show={false} />)
    expect(screen.queryByTestId('confetti')).not.toBeInTheDocument()
  })

  it('renders particles when show=true', () => {
    render(<Confetti show={true} count={20} />)
    const root = screen.getByTestId('confetti')
    expect(root).toBeInTheDocument()
    expect(root.querySelectorAll('.confetti-particle').length).toBe(20)
  })

  it('calls onDone after duration ms', () => {
    vi.useFakeTimers()
    const onDone = vi.fn()
    render(<Confetti show={true} duration={1000} onDone={onDone} />)
    act(() => {
      vi.advanceTimersByTime(1100)
    })
    expect(onDone).toHaveBeenCalled()
  })

  it('default count is reasonable (50)', () => {
    render(<Confetti show={true} />)
    expect(screen.getByTestId('confetti').querySelectorAll('.confetti-particle').length).toBe(50)
  })
})
