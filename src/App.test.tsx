import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { useCubeStore } from '@/store/cubeStore'

// R3F Canvas needs WebGL; in jsdom we stub the whole 3D component.
vi.mock('@/components/Cube3D', () => ({
  Cube3D: () => <div data-testid="cube3d-stub" />,
}))

import App from './App'

beforeEach(() => {
  useCubeStore.getState().reset()
  useCubeStore.setState({
    appMode: 'welcome',
    wizardChapter: 1,
    wizardStep: 0,
    earnedStars: {},
  })
})

describe('App routing', () => {
  it('first-visit (totalStars=0, appMode=welcome) lands on WelcomePage', () => {
    render(<App />)
    expect(screen.getByRole('heading', { name: /魔方學園/ })).toBeInTheDocument()
    expect(screen.queryByText(/Chapter 1 \/ 10/)).not.toBeInTheDocument()
  })

  it('returning user (totalStars>0) also sees WelcomePage', () => {
    useCubeStore.setState({ earnedStars: { 1: 1 } })
    render(<App />)
    expect(screen.getByRole('heading', { name: /魔方學園/ })).toBeInTheDocument()
  })

  it('appMode=wizard renders Wizard regardless of stars', () => {
    useCubeStore.setState({ appMode: 'wizard', earnedStars: { 1: 3 } })
    render(<App />)
    expect(screen.getByText(/Chapter 1 \/ 10/)).toBeInTheDocument()
  })
})
