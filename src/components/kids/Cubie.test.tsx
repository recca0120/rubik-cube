import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Cubie, CubieDialog } from './Cubie'

describe('Cubie', () => {
  it('renders SVG with calm emotion by default', () => {
    const { container } = render(<Cubie />)
    expect(container.querySelector('svg[data-testid="cubie"]')).toBeInTheDocument()
    expect(container.querySelector('svg[data-emotion="calm"]')).toBeInTheDocument()
  })

  it('renders specified emotion', () => {
    const { container } = render(<Cubie emotion="happy" />)
    expect(container.querySelector('svg[data-emotion="happy"]')).toBeInTheDocument()
  })

  describe('gesture (RD2-M6)', () => {
    it('defaults to data-gesture="idle"', () => {
      const { container } = render(<Cubie />)
      expect(container.querySelector('[data-gesture="idle"]')).toBeInTheDocument()
    })

    it('renders gesture="point" when prop=point', () => {
      const { container } = render(<Cubie gesture="point" />)
      expect(container.querySelector('[data-gesture="point"]')).toBeInTheDocument()
    })

    it('renders gesture="thumbsup" when prop=thumbsup', () => {
      const { container } = render(<Cubie gesture="thumbsup" />)
      expect(container.querySelector('[data-gesture="thumbsup"]')).toBeInTheDocument()
    })
  })

  it('supports all 6 emotions (calm/happy/surprised/cheering/confused/celebrating)', () => {
    const emotions = ['calm', 'happy', 'surprised', 'cheering', 'confused', 'celebrating'] as const
    for (const e of emotions) {
      const { container } = render(<Cubie emotion={e} />)
      expect(container.querySelector(`svg[data-emotion="${e}"]`)).toBeInTheDocument()
    }
  })
})

describe('CubieDialog', () => {
  it('renders speech bubble with message (typewriter off)', () => {
    render(<CubieDialog message="嗨！" typewriterMs={0} />)
    expect(screen.getByText('嗨！')).toBeInTheDocument()
  })

  it('shows Cubie avatar to the left', () => {
    const { container } = render(<CubieDialog message="hi" />)
    expect(container.querySelector('svg[data-testid="cubie"]')).toBeInTheDocument()
  })

  it('renders Next button when onNext is provided (after typewriter done)', () => {
    const onNext = vi.fn()
    render(<CubieDialog message="hi" onNext={onNext} typewriterMs={0} />)
    expect(screen.getByRole('button', { name: /下一步|next/i })).toBeInTheDocument()
  })

  it('clicking Next calls onNext', async () => {
    const user = userEvent.setup()
    const onNext = vi.fn()
    render(<CubieDialog message="hi" onNext={onNext} typewriterMs={0} />)
    await user.click(screen.getByRole('button', { name: /下一步|next/i }))
    expect(onNext).toHaveBeenCalled()
  })

  it('hides Next button when onNext omitted', () => {
    render(<CubieDialog message="hi" typewriterMs={0} />)
    expect(screen.queryByRole('button', { name: /下一步|next/i })).not.toBeInTheDocument()
  })

  it('Next button hidden during typewriter, appears when done', async () => {
    vi.useFakeTimers()
    render(<CubieDialog message="abcdef" onNext={() => {}} typewriterMs={50} />)
    expect(screen.queryByRole('button', { name: /下一步/ })).not.toBeInTheDocument()
    // After full typewriter time
    await vi.advanceTimersByTimeAsync(400)
    expect(screen.getByRole('button', { name: /下一步/ })).toBeInTheDocument()
    vi.useRealTimers()
  })
})
