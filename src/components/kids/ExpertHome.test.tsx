import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useCubeStore } from '@/store/cubeStore'
import { ExpertHome } from './ExpertHome'

beforeEach(() => {
  useCubeStore.getState().reset()
  useCubeStore.setState({
    appMode: 'expert',
    expertOnboarded: false,
  })
})

describe('ExpertHome (RD2-X2)', () => {
  it('renders Cubie greeting with graduation message', () => {
    render(<ExpertHome onEnter={() => {}} />)
    expect(screen.getByText(/真的會解了|畢業/)).toBeInTheDocument()
  })

  it('renders a Cubie avatar', () => {
    const { container } = render(<ExpertHome onEnter={() => {}} />)
    expect(container.querySelector('svg[data-testid="cubie"]')).toBeInTheDocument()
  })

  it('renders 開始使用 CTA button', () => {
    render(<ExpertHome onEnter={() => {}} />)
    expect(screen.getByRole('button', { name: /開始使用/ })).toBeInTheDocument()
  })

  it('clicking 開始使用 calls onEnter', async () => {
    const user = userEvent.setup()
    const onEnter = vi.fn()
    render(<ExpertHome onEnter={onEnter} />)
    await user.click(screen.getByRole('button', { name: /開始使用/ }))
    expect(onEnter).toHaveBeenCalledOnce()
  })

  it('has a 回首頁 escape button that calls onExit', async () => {
    const user = userEvent.setup()
    const onExit = vi.fn()
    render(<ExpertHome onEnter={() => {}} onExit={onExit} />)
    await user.click(screen.getByRole('button', { name: /回首頁/ }))
    expect(onExit).toHaveBeenCalledOnce()
  })
})
