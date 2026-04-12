import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useCubeStore } from '@/store/cubeStore'
import { ExpertPage } from './ExpertPage'

vi.mock('@/components/Cube3D', () => ({
  Cube3D: () => <div data-testid="cube3d-stub" />,
}))

beforeEach(() => {
  useCubeStore.getState().reset()
  useCubeStore.setState({ appMode: 'expert', expertOnboarded: true })
})

describe('ExpertPage (RD2-X3)', () => {
  it('renders 解 tab and 案例 tab buttons', () => {
    render(<ExpertPage onExit={() => {}} />)
    expect(screen.getByRole('tab', { name: /^🧠 解$/ })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: /^📚 案例$/ })).toBeInTheDocument()
  })

  it('解 tab is active by default', () => {
    render(<ExpertPage onExit={() => {}} />)
    expect(screen.getByRole('tab', { name: /^🧠 解$/ })).toHaveAttribute('aria-selected', 'true')
    expect(screen.getByRole('tab', { name: /^📚 案例$/ })).toHaveAttribute('aria-selected', 'false')
  })

  it('clicking 案例 tab activates it', async () => {
    const user = userEvent.setup()
    render(<ExpertPage onExit={() => {}} />)
    await user.click(screen.getByRole('tab', { name: /^📚 案例$/ }))
    expect(screen.getByRole('tab', { name: /^📚 案例$/ })).toHaveAttribute('aria-selected', 'true')
  })

  it('header has 回首頁 button that calls onExit', async () => {
    const user = userEvent.setup()
    const onExit = vi.fn()
    render(<ExpertPage onExit={onExit} />)
    await user.click(screen.getByRole('button', { name: /回首頁/ }))
    expect(onExit).toHaveBeenCalledOnce()
  })

  it('does not use the old dark bg-neutral-900 theme', () => {
    const { container } = render(<ExpertPage onExit={() => {}} />)
    expect(container.querySelector('[class*="bg-neutral-900"]')).toBeNull()
    expect(container.querySelector('[class*="text-neutral-100"]')).toBeNull()
  })
})
