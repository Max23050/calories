// Compress an image File to ~1MB JPEG via canvas resize.
export async function compressImage(file, { maxDim = 1280, quality = 0.82, targetBytes = 1_050_000 } = {}) {
  const bitmap = await createImageBitmap(file)
  let { width, height } = bitmap
  const scale = Math.min(1, maxDim / Math.max(width, height))
  width = Math.round(width * scale)
  height = Math.round(height * scale)

  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  ctx.drawImage(bitmap, 0, 0, width, height)

  let q = quality
  let blob = await new Promise((res) => canvas.toBlob(res, 'image/jpeg', q))
  while (blob && blob.size > targetBytes && q > 0.4) {
    q -= 0.1
    blob = await new Promise((res) => canvas.toBlob(res, 'image/jpeg', q))
  }
  return blob
}

export function blobToBase64(blob) {
  return new Promise((resolve, reject) => {
    const r = new FileReader()
    r.onload = () => {
      const s = r.result
      // strip "data:...;base64," prefix
      const idx = s.indexOf(',')
      resolve(idx >= 0 ? s.slice(idx + 1) : s)
    }
    r.onerror = reject
    r.readAsDataURL(blob)
  })
}
