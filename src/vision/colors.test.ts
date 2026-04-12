import { describe, it, expect } from 'vitest'
import {
  rgbToHsv,
  sampleAt,
  classify,
  scanFace,
  gridCenters,
  DEFAULT_REFERENCES,
  type RGB,
  type FaceLetter,
} from './colors'

// Build a synthetic PixelGrid from a 2D color grid.
function makeImage(colors: RGB[][]) {
  const h = colors.length
  const w = colors[0].length
  const data = new Uint8ClampedArray(w * h * 4)
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const c = colors[y][x]
      const i = (y * w + x) * 4
      data[i] = c.r
      data[i + 1] = c.g
      data[i + 2] = c.b
      data[i + 3] = 255
    }
  }
  return { width: w, height: h, data }
}

describe('rgbToHsv', () => {
  it('white → S=0', () => {
    const hsv = rgbToHsv({ r: 255, g: 255, b: 255 })
    expect(hsv.s).toBe(0)
    expect(hsv.v).toBe(1)
  })
  it('pure red → H≈0', () => {
    const hsv = rgbToHsv({ r: 255, g: 0, b: 0 })
    expect(hsv.h).toBe(0)
    expect(hsv.s).toBe(1)
  })
  it('pure green → H≈120', () => {
    expect(rgbToHsv({ r: 0, g: 255, b: 0 }).h).toBe(120)
  })
  it('pure blue → H≈240', () => {
    expect(rgbToHsv({ r: 0, g: 0, b: 255 }).h).toBe(240)
  })
})

describe('sampleAt', () => {
  it('returns the pixel color when radius covers just that pixel on uniform image', () => {
    const img = makeImage([
      [{ r: 100, g: 150, b: 200 }, { r: 100, g: 150, b: 200 }],
      [{ r: 100, g: 150, b: 200 }, { r: 100, g: 150, b: 200 }],
    ])
    expect(sampleAt(img, 0, 0, 1)).toEqual({ r: 100, g: 150, b: 200 })
  })

  it('averages a patch', () => {
    const img = makeImage([
      [{ r: 0, g: 0, b: 0 }, { r: 100, g: 100, b: 100 }],
      [{ r: 200, g: 200, b: 200 }, { r: 0, g: 0, b: 0 }],
    ])
    // radius=1 from (0,0) → clips to 2×2 → avg of all four
    const avg = sampleAt(img, 0, 0, 1)
    expect(avg.r).toBe(75)
  })
})

describe('classify', () => {
  it.each(Object.keys(DEFAULT_REFERENCES) as FaceLetter[])(
    'reference color for %s classifies as itself',
    (face) => {
      expect(classify(DEFAULT_REFERENCES[face])).toBe(face)
    },
  )

  it('slightly off-white → U (not yellow)', () => {
    expect(classify({ r: 240, g: 240, b: 230 })).toBe('U')
  })

  it('red-ish → R not L', () => {
    expect(classify({ r: 200, g: 30, b: 60 })).toBe('R')
  })

  it('orange-ish → L not R', () => {
    expect(classify({ r: 240, g: 120, b: 30 })).toBe('L')
  })
})

describe('scanFace', () => {
  it('reads a synthetic face with 9 uniform 10x10 tiles', () => {
    const tileSize = 10
    const tiles: FaceLetter[] = ['U', 'R', 'F', 'D', 'L', 'B', 'U', 'R', 'F']
    // Build 30x30 image with 3×3 tiles of reference colors.
    const rows: RGB[][] = []
    for (let y = 0; y < 30; y++) {
      const row: RGB[] = []
      for (let x = 0; x < 30; x++) {
        const tileIdx = Math.floor(y / tileSize) * 3 + Math.floor(x / tileSize)
        row.push(DEFAULT_REFERENCES[tiles[tileIdx]])
      }
      rows.push(row)
    }
    const img = makeImage(rows)
    const centers = gridCenters(0, 0, 30, 30)
    expect(scanFace(img, centers)).toBe(tiles.join(''))
  })

  it('rejects wrong center count', () => {
    const img = makeImage([[{ r: 0, g: 0, b: 0 }]])
    expect(() => scanFace(img, [[0, 0]])).toThrow()
  })
})

describe('gridCenters', () => {
  it('produces 9 points centered inside each 1/3 cell', () => {
    const centers = gridCenters(0, 0, 30, 30)
    expect(centers).toHaveLength(9)
    expect(centers[0]).toEqual([5, 5])
    expect(centers[4]).toEqual([15, 15])
    expect(centers[8]).toEqual([25, 25])
  })
})
