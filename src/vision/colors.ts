/**
 * Color sampling + classification for cube face scanning.
 *
 * Pure functions: input = ImageData (or synthetic pixel array) + sample points,
 * output = face letter string.
 */

export type RGB = { r: number; g: number; b: number }

/** Minimal structural shape compatible with DOM `ImageData`. */
export type PixelGrid = { width: number; height: number; data: Uint8ClampedArray | number[] }
export type HSV = { h: number; s: number; v: number } // h in [0,360), s/v in [0,1]

export type FaceLetter = 'U' | 'R' | 'F' | 'D' | 'L' | 'B'

/** Default cube color references (standard Rubik's). */
export const DEFAULT_REFERENCES: Record<FaceLetter, RGB> = {
  U: { r: 255, g: 255, b: 255 }, // white
  D: { r: 255, g: 213, b: 0 }, // yellow
  R: { r: 183, g: 18, b: 52 }, // red
  L: { r: 255, g: 88, b: 0 }, // orange
  F: { r: 0, g: 155, b: 72 }, // green
  B: { r: 0, g: 70, b: 173 }, // blue
}

export function rgbToHsv({ r, g, b }: RGB): HSV {
  const rn = r / 255, gn = g / 255, bn = b / 255
  const max = Math.max(rn, gn, bn)
  const min = Math.min(rn, gn, bn)
  const d = max - min
  let h = 0
  if (d !== 0) {
    if (max === rn) h = 60 * (((gn - bn) / d) % 6)
    else if (max === gn) h = 60 * ((bn - rn) / d + 2)
    else h = 60 * ((rn - gn) / d + 4)
  }
  if (h < 0) h += 360
  const s = max === 0 ? 0 : d / max
  const v = max
  return { h, s, v }
}

/**
 * Sample RGB at (x,y) by averaging a (2*radius+1)² patch.
 * ImageData.data is Uint8ClampedArray with [r,g,b,a, r,g,b,a, ...].
 */
export function sampleAt(img: PixelGrid, x: number, y: number, radius = 3): RGB {
  const { width, height, data } = img
  let rs = 0, gs = 0, bs = 0, n = 0
  const x0 = Math.max(0, Math.floor(x - radius))
  const x1 = Math.min(width - 1, Math.floor(x + radius))
  const y0 = Math.max(0, Math.floor(y - radius))
  const y1 = Math.min(height - 1, Math.floor(y + radius))
  for (let yy = y0; yy <= y1; yy++) {
    for (let xx = x0; xx <= x1; xx++) {
      const i = (yy * width + xx) * 4
      rs += data[i]
      gs += data[i + 1]
      bs += data[i + 2]
      n++
    }
  }
  return { r: Math.round(rs / n), g: Math.round(gs / n), b: Math.round(bs / n) }
}

/**
 * Classify one RGB sample against reference colors using HSV distance.
 * White gets a special case (low saturation, high value) to avoid being
 * confused with pale yellow.
 */
export function classify(rgb: RGB, refs: Record<FaceLetter, RGB> = DEFAULT_REFERENCES): FaceLetter {
  const hsv = rgbToHsv(rgb)
  // Whites often have near-zero saturation regardless of which "white" you sampled.
  if (hsv.s < 0.2 && hsv.v > 0.55) return 'U'

  let best: FaceLetter = 'U'
  let bestDist = Infinity
  for (const [letter, ref] of Object.entries(refs) as [FaceLetter, RGB][]) {
    if (letter === 'U') continue // white handled above
    const refHsv = rgbToHsv(ref)
    // Hue is circular — use min of direct and wrap-around distance.
    const dh = Math.min(Math.abs(hsv.h - refHsv.h), 360 - Math.abs(hsv.h - refHsv.h)) / 180
    const ds = hsv.s - refHsv.s
    const dv = hsv.v - refHsv.v
    // Hue is dominant for chromatic colors; saturation/value are secondary.
    const dist = dh * 3 + Math.abs(ds) + Math.abs(dv)
    if (dist < bestDist) {
      bestDist = dist
      best = letter
    }
  }
  return best
}

/** Scan a face: given 9 (x,y) centers, return a 9-char face string. */
export function scanFace(
  img: PixelGrid,
  centers: [number, number][],
  refs: Record<FaceLetter, RGB> = DEFAULT_REFERENCES,
  sampleRadius = 3,
): string {
  if (centers.length !== 9) throw new Error('scanFace requires 9 centers')
  return centers.map(([x, y]) => classify(sampleAt(img, x, y, sampleRadius), refs)).join('')
}

/**
 * Generate a 3×3 grid of sample centers within a bounding box.
 * Useful for "user aligns face into this box" UI.
 */
export function gridCenters(x: number, y: number, w: number, h: number): [number, number][] {
  const centers: [number, number][] = []
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 3; col++) {
      centers.push([x + ((col + 0.5) * w) / 3, y + ((row + 0.5) * h) / 3])
    }
  }
  return centers
}
