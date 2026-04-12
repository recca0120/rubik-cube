import { scanFace, gridCenters, DEFAULT_REFERENCES, type FaceLetter, type RGB } from './colors'

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      URL.revokeObjectURL(url)
      resolve(img)
    }
    img.onerror = (e) => {
      URL.revokeObjectURL(url)
      reject(e)
    }
    img.src = url
  })
}

/**
 * Read a photo into a 9-char face string by sampling the largest centered square.
 * Caller is responsible for the photo being reasonably aligned to the face.
 */
export async function scanImageFile(
  file: File,
  refs: Record<FaceLetter, RGB> = DEFAULT_REFERENCES,
): Promise<string> {
  const img = await loadImage(file)
  const canvas = document.createElement('canvas')
  canvas.width = img.naturalWidth
  canvas.height = img.naturalHeight
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('canvas 2d context unavailable')
  ctx.drawImage(img, 0, 0)

  const size = Math.min(canvas.width, canvas.height)
  const x0 = (canvas.width - size) / 2
  const y0 = (canvas.height - size) / 2
  const imageData = ctx.getImageData(x0, y0, size, size)
  const centers = gridCenters(0, 0, size, size)
  return scanFace(imageData, centers, refs)
}
