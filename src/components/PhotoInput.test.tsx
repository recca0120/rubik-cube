import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

// Mock the actual image scanner — jsdom has no canvas/imaging.
// Each call returns a predefined face string so we can test UI wiring.
const scans: Record<string, string> = {
  U: 'UUUUUUUUU',
  R: 'RRRRRRRRR',
  F: 'FFFFFFFFF',
  D: 'DDDDDDDDD',
  L: 'LLLLLLLLL',
  B: 'BBBBBBBBB',
}
let scanCallOrder: string[] = []

vi.mock('@/vision/scanImage', () => ({
  scanImageFile: vi.fn(async (file: File) => {
    scanCallOrder.push(file.name)
    return scans[file.name.replace('.png', '')] ?? 'UUUUUUUUU'
  }),
}))

import { PhotoInput } from './PhotoInput'
import { SOLVED } from '@/cube/Cube'

describe('PhotoInput', () => {
  beforeEach(() => {
    scanCallOrder = []
  })

  it('Apply is disabled until all 6 faces scanned', async () => {
    const user = userEvent.setup()
    const { container } = render(<PhotoInput onApply={vi.fn()} />)

    const apply = screen.getByRole('button', { name: /套用/ })
    expect(apply).toBeDisabled()

    const firstFileInput = container.querySelector('input[type="file"]') as HTMLInputElement
    await user.upload(firstFileInput, new File(['x'], 'U.png', { type: 'image/png' }))
    expect(apply).toBeDisabled()
  })

  it('uploads all 6 faces and Apply sends SOLVED facelets', async () => {
    const user = userEvent.setup()
    const onApply = vi.fn()
    const { container } = render(<PhotoInput onApply={onApply} />)

    const inputs = container.querySelectorAll<HTMLInputElement>('input[type="file"]')
    expect(inputs).toHaveLength(6)

    // Order in DOM is U, R, F, D, L, B (matches FACES array).
    const order = ['U', 'R', 'F', 'D', 'L', 'B']
    for (let i = 0; i < 6; i++) {
      await user.upload(inputs[i], new File(['x'], `${order[i]}.png`, { type: 'image/png' }))
    }

    const apply = screen.getByRole('button', { name: /套用/ })
    expect(apply).toBeEnabled()
    await user.click(apply)
    expect(onApply).toHaveBeenCalledWith(SOLVED)
  })

  it('clicking a detected cell cycles its color', async () => {
    const user = userEvent.setup()
    const { container } = render(<PhotoInput onApply={vi.fn()} />)

    const inputs = container.querySelectorAll<HTMLInputElement>('input[type="file"]')
    await user.upload(inputs[0], new File(['x'], 'U.png', { type: 'image/png' }))

    // U face cell 0 starts as 'U', clicking should cycle to 'R'
    const cell = await screen.findByLabelText('U0 = U')
    await user.click(cell)
    expect(screen.getByLabelText('U0 = R')).toBeInTheDocument()
  })

  it('Clear resets all scanned faces', async () => {
    const user = userEvent.setup()
    const { container } = render(<PhotoInput onApply={vi.fn()} />)
    const inputs = container.querySelectorAll<HTMLInputElement>('input[type="file"]')

    await user.upload(inputs[0], new File(['x'], 'U.png', { type: 'image/png' }))
    expect(screen.getByLabelText('U0 = U')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /清空/ }))
    expect(screen.queryByLabelText('U0 = U')).not.toBeInTheDocument()
  })
})
