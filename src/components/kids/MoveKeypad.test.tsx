import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MoveKeypad } from './MoveKeypad'

const FACES = ['U', 'D', 'L', 'R', 'F', 'B'] as const

describe('MoveKeypad', () => {
  describe('variants prop (RD2-C7)', () => {
    it('variants=["cw"] renders only 6 base-face buttons', () => {
      render(<MoveKeypad onMove={() => {}} variants={['cw']} />)
      expect(screen.getAllByRole('button')).toHaveLength(6)
      expect(screen.getByRole('button', { name: 'U' })).toBeInTheDocument()
      expect(screen.queryByRole('button', { name: "U'" })).not.toBeInTheDocument()
      expect(screen.queryByRole('button', { name: 'U2' })).not.toBeInTheDocument()
    })

    it('variants=["cw","ccw"] renders 12 buttons (no 2)', () => {
      render(<MoveKeypad onMove={() => {}} variants={['cw', 'ccw']} />)
      expect(screen.getAllByRole('button')).toHaveLength(12)
      expect(screen.getByRole('button', { name: "U'" })).toBeInTheDocument()
      expect(screen.queryByRole('button', { name: 'U2' })).not.toBeInTheDocument()
    })

    it('default (no variants prop) renders all 18', () => {
      render(<MoveKeypad onMove={() => {}} />)
      expect(screen.getAllByRole('button')).toHaveLength(18)
    })
  })

  it('renders 18 move buttons (6 faces × 3 variations)', () => {
    render(<MoveKeypad onMove={() => {}} />)
    expect(screen.getAllByRole('button')).toHaveLength(18)
  })

  it.each(FACES)('has buttons for %s, %s\', %s2', (face) => {
    render(<MoveKeypad onMove={() => {}} />)
    expect(screen.getByRole('button', { name: face })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: `${face}'` })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: `${face}2` })).toBeInTheDocument()
  })

  it('clicking a button calls onMove with that move', async () => {
    const user = userEvent.setup()
    const onMove = vi.fn()
    render(<MoveKeypad onMove={onMove} />)
    await user.click(screen.getByRole('button', { name: 'R' }))
    expect(onMove).toHaveBeenCalledWith('R')
    await user.click(screen.getByRole('button', { name: "R'" }))
    expect(onMove).toHaveBeenCalledWith("R'")
  })

  it('highlighted button uses kp-pulse (not opacity animate-pulse)', () => {
    render(<MoveKeypad onMove={() => {}} highlight={['R']} />)
    const btn = screen.getByRole('button', { name: 'R' })
    expect(btn.className).toMatch(/kp-pulse/)
    expect(btn.className).not.toMatch(/animate-pulse/)
  })

  it('highlight prop marks given moves with data-highlight=true', () => {
    render(<MoveKeypad onMove={() => {}} highlight={['R', "U'"]} />)
    expect(screen.getByRole('button', { name: 'R' })).toHaveAttribute('data-highlight', 'true')
    expect(screen.getByRole('button', { name: "U'" })).toHaveAttribute('data-highlight', 'true')
    expect(screen.getByRole('button', { name: 'L' })).toHaveAttribute('data-highlight', 'false')
  })

  it('disabled prop disables every button', () => {
    render(<MoveKeypad onMove={() => {}} disabled />)
    for (const btn of screen.getAllByRole('button')) {
      expect(btn).toBeDisabled()
    }
  })

  it('disabled keypad does NOT call onMove on click', async () => {
    const user = userEvent.setup()
    const onMove = vi.fn()
    render(<MoveKeypad onMove={onMove} disabled />)
    await user.click(screen.getByRole('button', { name: 'R' }))
    expect(onMove).not.toHaveBeenCalled()
  })

  describe('friendly Chinese hint (v5)', () => {
    it('each button shows the Chinese translation visually (aria-hidden for sr)', () => {
      render(<MoveKeypad onMove={() => {}} />)
      // Accessible name stays "U" (aria-hidden on friendly span)
      const u = screen.getByRole('button', { name: 'U' })
      // Visual text includes both
      expect(u.textContent).toMatch(/U/)
      expect(u.textContent).toMatch(/上/)
      // R' button has 右 ↺
      const rPrime = screen.getByRole('button', { name: "R'" })
      expect(rPrime.textContent).toMatch(/右/)
      expect(rPrime.textContent).toMatch(/↺/)
    })
  })
})
