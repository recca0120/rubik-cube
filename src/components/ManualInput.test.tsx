import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ManualInput } from './ManualInput'
import { SOLVED } from '@/cube/Cube'

describe('ManualInput', () => {
  it('renders 54 cells', () => {
    render(<ManualInput onApply={vi.fn()} />)
    // 6 faces × 9 cells
    expect(screen.getAllByRole('button', { name: /^[URFDLB]\d = [URFDLB]$/ })).toHaveLength(54)
  })

  it('clicking a non-center cell changes its color to current picker', async () => {
    const user = userEvent.setup()
    const onApply = vi.fn()
    render(<ManualInput onApply={onApply} />)

    // Pick R color
    await user.click(screen.getByTitle('R'))
    // Click U face cell 0 (currently U, should become R)
    const cell = screen.getByLabelText('U0 = U')
    await user.click(cell)
    expect(screen.getByLabelText('U0 = R')).toBeInTheDocument()
  })

  it('centers are disabled', () => {
    render(<ManualInput onApply={vi.fn()} />)
    const center = screen.getByLabelText('U4 = U')
    expect(center).toBeDisabled()
  })

  it('Apply with invalid state is disabled', async () => {
    const user = userEvent.setup()
    const onApply = vi.fn()
    render(<ManualInput onApply={onApply} />)

    // Change a non-center cell; now face counts are off
    await user.click(screen.getByTitle('R'))
    await user.click(screen.getByLabelText('U0 = U'))

    const apply = screen.getByRole('button', { name: /套用/ })
    expect(apply).toBeDisabled()
    expect(screen.getByText(/face U has 8 stickers/)).toBeInTheDocument()
  })

  it('Apply with valid state calls onApply with the current facelets', async () => {
    const user = userEvent.setup()
    const onApply = vi.fn()
    render(<ManualInput initial={SOLVED} onApply={onApply} />)

    await user.click(screen.getByRole('button', { name: /套用/ }))
    expect(onApply).toHaveBeenCalledWith(SOLVED)
  })

  it('Cancel calls onCancel when provided', async () => {
    const user = userEvent.setup()
    const onCancel = vi.fn()
    render(<ManualInput onApply={vi.fn()} onCancel={onCancel} />)

    await user.click(screen.getByRole('button', { name: /取消/ }))
    expect(onCancel).toHaveBeenCalled()
  })

  it('Clear resets to solved state', async () => {
    const user = userEvent.setup()
    const arr = [...SOLVED]
    arr[0] = 'R' // dirty
    const dirty = arr.join('')
    render(<ManualInput initial={dirty} onApply={vi.fn()} />)

    expect(screen.getByLabelText('U0 = R')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /清空/ }))
    expect(screen.getByLabelText('U0 = U')).toBeInTheDocument()
  })
})
