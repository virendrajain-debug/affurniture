import sharp from 'sharp'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export async function compressImage(inputPath, options = {}) {
  const maxWidth = options.maxWidth || 1600
  const quality = options.quality || 80
  const format = options.format || 'webp'

  const ext = path.extname(inputPath)
  const baseName = path.basename(inputPath, ext)
  const dir = path.dirname(inputPath)
  const outputPath = path.join(dir, `${baseName}-compressed.${format}`)

  try {
    const metadata = await sharp(inputPath).metadata()

    if (!metadata.width || metadata.width <= maxWidth) {
      const originalSize = fs.statSync(inputPath).size
      return { success: true, originalSize, compressedSize: originalSize, skipped: true }
    }

    let pipeline = sharp(inputPath).resize({ width: maxWidth, withoutEnlargement: true })

    if (format === 'webp') {
      pipeline = pipeline.webp({ quality })
    } else if (format === 'jpeg' || format === 'jpg') {
      pipeline = pipeline.jpeg({ quality, mozjpeg: true })
    } else if (format === 'png') {
      pipeline = pipeline.png({ compressionLevel: 9 })
    }

    await pipeline.toFile(outputPath)

    const originalSize = fs.statSync(inputPath).size
    const compressedSize = fs.statSync(outputPath).size

    if (compressedSize < originalSize) {
      fs.unlinkSync(inputPath)
      fs.renameSync(outputPath, inputPath)
      return { success: true, originalSize, compressedSize }
    } else {
      if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath)
      return { success: false, originalSize, compressedSize }
    }
  } catch (err) {
    if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath)
    return { success: false, error: err.message }
  }
}

export async function compressLogo(inputPath) {
  return compressImage(inputPath, { maxWidth: 400, quality: 85, format: 'webp' })
}
