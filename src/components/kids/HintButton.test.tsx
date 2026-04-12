import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, act, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { HintButton } from './HintButton'

afterEach(() => vi.useRealTimers())

describe('HintButton', () => {
  it('renders an enabled button by default', () => {
    render(<HintButton onShow={() => {}} />)
    const btn = screen.getByRole('button', { name: /提示|hint/i })
    expect(btn).toBeEnabled()
  })

  it('clicking calls onShow', async () => {
    const user = userEvent.setup()
    const onShow = vi.fn()
    render(<HintButton onShow={onShow} />)
    await user.click(screen.getByRole('button'))
    expect(onShow).toHaveBeenCalledOnce()
  })

  it('disables for cooldownMs after a click', async () => {
    vi.useFakeTimers()
    render(<HintButton onShow={() => {}} cooldownMs={5000} />)
    const btn = screen.getByRole('button')
    fireEvent.click(btn)
    expect(btn).toBeDisabled()
    await act(async () => { vi.advanceTimersByTime(4900) })
    expect(btn).toBeDisabled()
    await act(async () => { vi.advanceTimersByTime(200) })
    expect(btn).toBeEnabled()
  })

  it('does not call onShow while in cooldown', () => {
    vi.useFakeTimers()
    const onShow = vi.fn()
    render(<HintButton onShow={onShow} cooldownMs={5000} />)
    const btn = screen.getByRole('button')
    fireEvent.click(btn)
    fireEvent.click(btn) // disabled — should not fire
    expect(onShow).toHaveBeenCalledOnce()
  })

  it('default cooldown is 5000ms', async () => {
    vi.useFakeTimers()
    render(<HintButton onShow={() => {}} />)
    fireEvent.click(screen.getByRole('button'))
    await act(async () => { vi.advanceTimersByTime(4500) })
    expect(screen.getByRole('button')).toBeDisabled()
    await act(async () => { vi.advanceTimersByTime(600) })
    expect(screen.getByRole('button')).toBeEnabled()
  })
})
