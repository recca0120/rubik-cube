import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { StateInputDrawer } from './StateInputDrawer'

describe('StateInputDrawer (RD2-X7)', () => {
  it('not rendered when open=false', () => {
    render(<StateInputDrawer open={false} onClose={() => {}} />)
    expect(screen.queryByRole('dialog')).toBeNull()
  })

  it('renders 3 sub-tabs when open', () => {
    render(<StateInputDrawer open onClose={() => {}} />)
    expect(screen.getByRole('tab', { name: /手動/ })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: /公式/ })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: /拍照/ })).toBeInTheDocument()
  })

  it('close button calls onClose', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    render(<StateInputDrawer open onClose={onClose} />)
    await user.click(screen.getByRole('button', { name: /關閉|✕/ }))
    expect(onClose).toHaveBeenCalled()
  })

  it('switching sub-tab activates the right one', async () => {
    const user = userEvent.setup()
    render(<StateInputDrawer open onClose={() => {}} />)
    await user.click(screen.getByRole('tab', { name: /公式/ }))
    expect(screen.getByRole('tab', { name: /公式/ })).toHaveAttribute('aria-selected', 'true')
  })
})
