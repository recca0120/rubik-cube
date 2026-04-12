import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { CaseMiniPreview } from './CaseMiniPreview'

describe('CaseMiniPreview', () => {
  it('renders an svg', () => {
    const { container } = render(<CaseMiniPreview alg="R U R' U'" family="f2l" />)
    expect(container.querySelector('svg')).toBeInTheDocument()
  })

  it('renders 12 cells (3x3 U face + 3-cell F top strip)', () => {
    const { container } = render(<CaseMiniPreview alg="R U R' U'" family="f2l" />)
    expect(container.querySelectorAll('rect').length).toBeGreaterThanOrEqual(12)
  })

  it('different algs produce different rendered colors', () => {
    const { container: a } = render(<CaseMiniPreview alg="R U R' U'" family="f2l" />)
    const { container: b } = render(<CaseMiniPreview alg="F R U' R' U' R U R' F'" family="pll" />)
    const colorsA = Array.from(a.querySelectorAll('rect')).map((r) => r.getAttribute('fill')).join(',')
    const colorsB = Array.from(b.querySelectorAll('rect')).map((r) => r.getAttribute('fill')).join(',')
    expect(colorsA).not.toBe(colorsB)
  })
})
