import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { FormulaInput } from './FormulaInput'
import { Cube } from '@/cube/Cube'

describe('FormulaInput', () => {
  it('Apply is disabled when input is empty', () => {
    render(<FormulaInput onApply={vi.fn()} />)
    expect(screen.getByRole('button', { name: /套用/ })).toBeDisabled()
  })

  it('Apply sends the resulting facelets to onApply', async () => {
    const user = userEvent.setup()
    const onApply = vi.fn()
    render(<FormulaInput onApply={onApply} />)

    await user.type(screen.getByRole('textbox'), "R U R' U'")
    await user.click(screen.getByRole('button', { name: /套用/ }))

    expect(onApply).toHaveBeenCalledWith(new Cube().applyAlg("R U R' U'").facelets)
  })

  it('shows move count while valid', async () => {
    const user = userEvent.setup()
    render(<FormulaInput onApply={vi.fn()} />)
    await user.type(screen.getByRole('textbox'), "R U2 F'")
    expect(screen.getByText(/3 moves/i)).toBeInTheDocument()
  })

  it('shows error for invalid notation without calling onApply', async () => {
    const user = userEvent.setup()
    const onApply = vi.fn()
    render(<FormulaInput onApply={onApply} />)
    await user.type(screen.getByRole('textbox'), 'R X')
    expect(screen.getByText(/unknown move/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /套用/ })).toBeDisabled()
    expect(onApply).not.toHaveBeenCalled()
  })

  it('Cancel calls onCancel', async () => {
    const user = userEvent.setup()
    const onCancel = vi.fn()
    render(<FormulaInput onApply={vi.fn()} onCancel={onCancel} />)
    await user.click(screen.getByRole('button', { name: /取消/ }))
    expect(onCancel).toHaveBeenCalled()
  })
})
