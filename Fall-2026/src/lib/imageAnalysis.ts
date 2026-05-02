import type { Signal, Verdict, AnalysisResult } from './types'
import { analyzeForGAN } from './gan-fingerprint'

// ---- Minimal JPEG EXIF parser (no external dependencies) ----

interface ExifData {
  hasExif: boolean
  make?: string
  model?: string
  software?: string
  dateTime?: string
  gpsLatitude?: number
  gpsLongitude?: number
  orientation?: number
  xResolution?: number
  yResolution?: number
}

const AI_GENERATOR_SOFTWARE = [
  'stable diffusion', 'midjourney', 'dall-e', 'dalle', 'adobe firefly',
  'runway', 'deepfake', 'faceswap', 'reface', 'wombo', 'artbreeder',
  'craiyon', 'canva ai', 'generative', 'ai generated', 'synthetic'
]

function readString(view: DataView, offset: number, length: number): string {
  let result = ''
  for (let i = 0; i < length; i++) {
    const byte = view.getUint8(offset + i)
    if (byte === 0) break
    result += String.fromCharCode(byte)
  }
  return result.trim()
}

function parseExif(buffer: ArrayBuffer): ExifData {
  const view = new DataView(buffer)

  if (view.byteLength < 4 || view.getUint16(0) !== 0xFFD8) {
    return { hasExif: false }
  }

  let offset = 2
  while (offset < view.byteLength - 4) {
    if (view.getUint8(offset) !== 0xFF) break
    const marker = view.getUint8(offset + 1)
    const segmentLength = view.getUint16(offset + 2)

    if (marker === 0xE1 && segmentLength > 6) {
      const exifHeader = readString(view, offset + 4, 4)
      if (exifHeader === 'Exif') {
        return parseExifIFD(view, offset + 10, buffer)
      }
    }

    if (marker === 0xD9 || marker === 0xDA) break
    offset += 2 + segmentLength
  }

  return { hasExif: false }
}

function parseExifIFD(view: DataView, tiffStart: number, _buffer: ArrayBuffer): ExifData {
  try {
    const byteOrder = view.getUint16(tiffStart)
    const littleEndian = byteOrder === 0x4949

    const read16 = (offset: number) => view.getUint16(tiffStart + offset, littleEndian)
    const read32 = (offset: number) => view.getUint32(tiffStart + offset, littleEndian)

    if (read16(2) !== 42) return { hasExif: true }

    const ifdOffset = read32(4)
    const entryCount = read16(ifdOffset)

    const result: ExifData = { hasExif: true }
    const TAG = {
      Make: 0x010F,
      Model: 0x0110,
      Software: 0x0131,
      DateTime: 0x0132,
      Orientation: 0x0112,
      XResolution: 0x011A,
      YResolution: 0x011B,
      GPSInfoIFDPointer: 0x8825,
    }

    for (let i = 0; i < Math.min(entryCount, 50); i++) {
      const entryOffset = ifdOffset + 2 + i * 12
      if (tiffStart + entryOffset + 12 > view.byteLength) break

      const tag = read16(entryOffset)
      const type = read16(entryOffset + 2)
      const count = read32(entryOffset + 4)
      const valueOffset = entryOffset + 8

      const readValue = (): string | number => {
        if (type === 2) {
          const strOffset = count <= 4 ? tiffStart + valueOffset : tiffStart + read32(valueOffset)
          return readString(view, strOffset, count)
        }
        if (type === 3) return read16(valueOffset)
        if (type === 4) return read32(valueOffset)
        return ''
      }

      switch (tag) {
        case TAG.Make: result.make = readValue() as string; break
        case TAG.Model: result.model = readValue() as string; break
        case TAG.Software: result.software = readValue() as string; break
        case TAG.DateTime: result.dateTime = readValue() as string; break
        case TAG.Orientation: result.orientation = readValue() as number; break
        case TAG.XResolution: result.xResolution = readValue() as number; break
        case TAG.YResolution: result.yResolution = readValue() as number; break
        case TAG.GPSInfoIFDPointer: {
          const gpsOffset = read32(valueOffset)
          const gpsEntries = read16(gpsOffset)
          if (gpsEntries > 0) {
            result.gpsLatitude = 0
            result.gpsLongitude = 0
          }
          break
        }
      }
    }
    return result
  } catch {
    return { hasExif: true }
  }
}

async function getImageDimensions(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve) => {
    const img = new Image()
    const url = URL.createObjectURL(file)
    img.onload = () => {
      URL.revokeObjectURL(url)
      resolve({ width: img.naturalWidth, height: img.naturalHeight })
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      resolve({ width: 0, height: 0 })
    }
    img.src = url
  })
}

// Renders the image into a canvas (capped at 512px) to get pixel data for GAN analysis.
async function getImageData(file: File): Promise<ImageData | null> {
  return new Promise((resolve) => {
    const img = new Image()
    const url = URL.createObjectURL(file)
    img.onload = () => {
      try {
        const maxDim = 512
        const scale = Math.min(1, maxDim / Math.max(img.naturalWidth || 1, img.naturalHeight || 1))
        const w = Math.max(1, Math.round(img.naturalWidth * scale))
        const h = Math.max(1, Math.round(img.naturalHeight * scale))
        const canvas = document.createElement('canvas')
        canvas.width = w
        canvas.height = h
        const ctx = canvas.getContext('2d')
        if (!ctx) { resolve(null); return }
        ctx.drawImage(img, 0, 0, w, h)
        resolve(ctx.getImageData(0, 0, w, h))
      } catch {
        resolve(null)
      } finally {
        URL.revokeObjectURL(url)
      }
    }
    img.onerror = () => { URL.revokeObjectURL(url); resolve(null) }
    img.src = url
  })
}

function isAiGeneratedSoftware(software?: string): boolean {
  if (!software) return false
  const lower = software.toLowerCase()
  return AI_GENERATOR_SOFTWARE.some(s => lower.includes(s))
}

function isSuspiciousFileName(name: string): boolean {
  const lower = name.toLowerCase()
  const suspicious = ['image', 'download', 'screenshot', 'photo', 'picture', 'img', 'untitled', 'generated']
  const suspiciousPattern = /^(image|photo|download|screenshot|picture)\s*(\(\d+\))?\.\w+$/i
  return suspiciousPattern.test(lower) || suspicious.some(s => lower.startsWith(s) && lower.length < s.length + 10)
}

// ---- Main export ----

export async function analyzeImage(file: File): Promise<Omit<AnalysisResult, 'id' | 'timestamp' | 'aiEnhanced'>> {
  const buffer = await file.arrayBuffer()
  const exif = parseExif(buffer)

  // Kick off parallel async operations
  const [dims, imageData] = await Promise.all([
    getImageDimensions(file),
    getImageData(file),
  ])

  const fileSizeMB = file.size / (1024 * 1024)
  const isJpeg = file.type === 'image/jpeg' || file.name.toLowerCase().endsWith('.jpg') || file.name.toLowerCase().endsWith('.jpeg')
  const isPng = file.type === 'image/png' || file.name.toLowerCase().endsWith('.png')
  const aiSoftware = isAiGeneratedSoftware(exif.software)
  const suspiciousName = isSuspiciousFileName(file.name)
  const lastModified = new Date(file.lastModified)
  const now = new Date()
  const daysDiff = (now.getTime() - lastModified.getTime()) / (1000 * 60 * 60 * 24)
  const isFutureDate = lastModified > now
  const isVeryRecentOrOld = daysDiff < 1 || daysDiff > 365 * 5

  const signals: Signal[] = [
    {
      id: 'exif_present',
      category: 'Metadata',
      label: 'EXIF Metadata Present',
      severity: isJpeg && !exif.hasExif ? 'high' : 'low',
      found: isJpeg && !exif.hasExif,
      description: exif.hasExif
        ? 'EXIF metadata found. Authentic photos typically contain camera and device information.'
        : isJpeg
          ? 'JPEG without EXIF metadata. Important context: social media platforms (Instagram, X, Facebook), messaging apps (WhatsApp, iMessage, Telegram), and most websites automatically strip EXIF from all images — so missing EXIF is the norm for anything downloaded online. This flag is only meaningful if you have strong reason to believe this image came directly from a camera and was never shared digitally first.'
          : `${isPng ? 'PNG' : 'Image'} files rarely contain EXIF data — this is normal and expected.`
    },
    {
      id: 'camera_info',
      category: 'Metadata',
      label: 'Camera Device Information',
      severity: exif.hasExif && !exif.make && !exif.model ? 'medium' : 'low',
      found: exif.hasExif && !exif.make && !exif.model,
      description: exif.make || exif.model
        ? `Camera: ${[exif.make, exif.model].filter(Boolean).join(' ')}. Device metadata suggests authentic capture.`
        : exif.hasExif
          ? 'EXIF present but no camera make/model. Could indicate post-processed or screen-captured image.'
          : 'No camera device information available.'
    },
    {
      id: 'ai_software',
      category: 'Authenticity',
      label: 'AI Generator Software Tag',
      severity: 'high',
      found: aiSoftware,
      description: aiSoftware
        ? `Software tag "${exif.software}" matches known AI image generation tools. This image was likely AI-generated.`
        : exif.software
          ? `Software tag found: "${exif.software}". No AI generation match.`
          : 'No software tag present.'
    },
    {
      id: 'gps_data',
      category: 'Metadata',
      label: 'GPS Location Data',
      severity: 'low',
      found: false,
      description: exif.gpsLatitude !== undefined
        ? 'GPS coordinates embedded. Location metadata suggests the image was taken on a device with GPS.'
        : 'No GPS data found. Absence of GPS alone is not suspicious — many cameras disable GPS by default.'
    },
    {
      id: 'date_consistency',
      category: 'Metadata',
      label: 'Date Metadata',
      severity: isFutureDate ? 'high' : isVeryRecentOrOld ? 'medium' : 'low',
      found: isFutureDate || isVeryRecentOrOld,
      description: isFutureDate
        ? `Future date detected (${lastModified.toLocaleDateString()}). This is highly suspicious — files cannot legitimately have future timestamps.`
        : exif.dateTime
          ? `EXIF capture date: ${exif.dateTime}.`
          : `File system date: ${lastModified.toLocaleDateString()}.`
    },
    {
      id: 'suspicious_name',
      category: 'Attribution',
      label: 'Suspicious Filename',
      severity: 'low',
      found: suspiciousName,
      description: suspiciousName
        ? `Filename "${file.name}" matches patterns common with downloaded or AI-generated content.`
        : `Filename "${file.name}" appears normal.`
    },
    {
      id: 'resolution',
      category: 'Quality',
      label: 'Image Resolution',
      severity: dims.width > 0 && (dims.width < 100 || dims.height < 100) ? 'medium' : 'low',
      found: dims.width > 0 && (dims.width < 100 || dims.height < 100),
      description: dims.width > 0
        ? dims.width < 100 || dims.height < 100
          ? `Very low resolution: ${dims.width}x${dims.height}px. Could indicate a thumbnail or severely compressed image.`
          : `Resolution: ${dims.width}x${dims.height}px — normal range.`
        : 'Could not determine image dimensions.'
    },
    {
      id: 'file_size',
      category: 'Quality',
      label: 'File Size Analysis',
      severity: 'low',
      found: false,
      description: isJpeg && fileSizeMB < 0.05
        ? `Very small JPEG (${(fileSizeMB * 1024).toFixed(0)} KB). Heavily compressed JPEGs can hide manipulation artifacts.`
        : `File size: ${fileSizeMB < 1 ? (fileSizeMB * 1024).toFixed(0) + ' KB' : fileSizeMB.toFixed(1) + ' MB'}.`
    }
  ]

  // ---- EXIF scoring ----
  let score = 70
  if (isJpeg && !exif.hasExif) score -= 25
  if (aiSoftware) score -= 40
  if (!exif.make && !exif.model && exif.hasExif) score -= 10
  if (isFutureDate) score -= 25
  if (suspiciousName) score -= 5
  if (exif.gpsLatitude !== undefined) score += 10
  if (exif.make || exif.model) score += 10
  if (exif.dateTime) score += 5
  if (!isJpeg) score += 5

  const manipulationTools: string[] = []
  if (aiSoftware && exif.software) manipulationTools.push(exif.software)
  if (isJpeg && !exif.hasExif) {
    manipulationTools.push('Deepfake generation tools (EXIF stripped)')
    manipulationTools.push('Face swap software (e.g., DeepFaceLab, FaceSwap)')
  }

  // ---- GAN fingerprinting ----
  let ganConfidence = 0
  let ganIsAI = false
  let ganArtifactNames: string[] = []

  if (imageData) {
    try {
      const gan = await analyzeForGAN(imageData)
      ganConfidence = gan.confidence
      ganIsAI = gan.isLikelyAI
      ganArtifactNames = gan.artifacts.map(a => a.name)

      signals.push(
        {
          id: 'gan_frequency',
          category: 'AI Detection',
          label: 'GAN Frequency Artifacts',
          severity: 'high',
          found: gan.signals.find(s => s.type === 'frequency')?.detected ?? false,
          description: gan.signals.find(s => s.type === 'frequency')?.detected
            ? 'Repeating frequency patterns detected — typical of DALL-E, Midjourney, and Stable Diffusion outputs.'
            : 'No significant frequency artifacts found. Image frequency domain appears natural.'
        },
        {
          id: 'gan_symmetry',
          category: 'AI Detection',
          label: 'Unnatural Symmetry Bias',
          severity: 'high',
          found: gan.signals.find(s => s.type === 'symmetry')?.detected ?? false,
          description: gan.signals.find(s => s.type === 'symmetry')?.detected
            ? 'Bilateral symmetry significantly above natural range. GAN-generated faces are often unnaturally symmetric.'
            : 'Symmetry levels within normal range for real photographs.'
        },
        {
          id: 'gan_texture',
          category: 'AI Detection',
          label: 'Texture Synthesis Errors',
          severity: 'medium',
          found: gan.signals.find(s => s.type === 'texture')?.detected ?? false,
          description: gan.signals.find(s => s.type === 'texture')?.detected
            ? 'Repeating texture blocks detected — a hallmark of image synthesis models.'
            : 'Texture patterns appear natural with no repeating synthesis artifacts.'
        }
      )

      if (ganIsAI) {
        score -= 20
        if (!manipulationTools.some(t => t.includes('AI image generator'))) {
          manipulationTools.push(`AI image generator — GAN/diffusion model (${ganConfidence}% confidence)`)
        }
      } else if (ganConfidence > 45) {
        score -= 8
      }
    } catch {
      // GAN analysis is best-effort; EXIF results still valid
    }
  }

  score = Math.max(0, Math.min(100, Math.round(score)))

  let verdict: Verdict
  if (score >= 75) verdict = 'reliable'
  else if (score >= 55) verdict = 'caution'
  else if (score >= 35) verdict = 'suspicious'
  else verdict = 'manipulated'

  let summary: string
  if (aiSoftware) {
    summary = `AI generation software detected in metadata. This image was created by an artificial intelligence system, not captured by a camera.`
  } else if (ganIsAI && !aiSoftware) {
    summary = `GAN fingerprinting detected AI-generation characteristics (${ganConfidence}% confidence). Pixel-level analysis found frequency artifacts and symmetry patterns typical of generative models.`
  } else if (isJpeg && !exif.hasExif) {
    summary = `This JPEG is missing EXIF metadata — a strong indicator of AI generation or deliberate metadata removal. Authentic photos almost always contain camera information.`
  } else if (verdict === 'reliable') {
    summary = `Image metadata appears consistent with an authentic photograph. ${exif.make || exif.model ? `Captured with ${[exif.make, exif.model].filter(Boolean).join(' ')}.` : ''} Always consider context before sharing.`
  } else {
    const issues = signals.filter(s => s.found && s.severity !== 'low')
    summary = `Found ${issues.length} metadata concern(s). The image shows signals that warrant closer inspection before use.`
  }

  return {
    type: 'image',
    trustScore: score,
    verdict,
    summary,
    signals,
    manipulationTools,
    contentPreview: file.name,
    ganConfidence,
    ganIsAI,
    ganArtifactNames,
  }
}
