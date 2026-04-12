import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { StickerButton } from './StickerButton'

describe('StickerButton', () => {
  it('renders children + responds to click', async () => {
    const user = userEvent.setup()
    const onClick = vi.fn()
    render(<StickerButton onClick={onClick}>Click me</StickerButton>)
    await user.click(screen.getByRole('button', { name: /click me/i }))
    expect(onClick).toHaveBeenCalledOnce()
  })

  it('disabled blocks clicks + applies disabled style', async () => {
    const user = userEvent.setup()
    const onClick = vi.fn()
    render(<StickerButton disabled onClick={onClick}>Nope</StickerButton>)
    const btn = screen.getByRole('button')
    expect(btn).toBeDisabled()
    await user.click(btn)
    expect(onClick).not.toHaveBeenCalled()
  })

  it.each(['primary', 'default', 'chip'] as const)('variant=%s renders without error', (variant) => {
    render(<StickerButton variant={variant}>X</StickerButton>)
    expect(screen.getByRole('button')).toBeInTheDocument()
  })

  it('tilt prop applies rotate transform', () => {
    render(<StickerButton tilt={-1.5}>X</StickerButton>)
    expect(screen.getByRole('button').style.transform).toBe('rotate(-1.5deg)')
  })

  it('color prop sets background', () => {
    render(<StickerButton color="var(--marker-yellow)">X</StickerButton>)
    expect(screen.getByRole('button').style.background).toContain('--marker-yellow')
  })
})
