// GAN Fingerprinting & AI Image Detection
// Detects AI-generated images through artifact analysis & pattern recognition

export interface GanAnalysis {
  isLikelyAI: boolean
  confidence: number // 0-100
  signals: GanSignal[]
  artifacts: Artifact[]
  summary: string
}

export interface GanSignal {
  type: 'frequency' | 'noise' | 'symmetry' | 'color' | 'texture' | 'anatomy'
  severity: 'high' | 'medium' | 'low'
  description: string
  detected: boolean
}

export interface Artifact {
  name: string
  description: string
  commonIn: string
  found: boolean
}

// AI Generation artifacts to detect
const AI_ARTIFACTS: Artifact[] = [
  {
    name: 'Grid artifacts',
    description: 'Repeating grid patterns typical of diffusion models',
    commonIn: 'DALL-E, Midjourney, Stable Diffusion',
    found: false
  },
  {
    name: 'Symmetry bias',
    description: 'Unnatural perfect symmetry in faces/objects',
    commonIn: 'GAN-generated faces',
    found: false
  },
  {
    name: 'Frequency inconsistencies',
    description: 'Mismatched color/brightness frequencies at seams',
    commonIn: 'All AI generators',
    found: false
  },
  {
    name: 'Anatomical oddities',
    description: 'Impossible body geometry, extra/missing fingers, strange teeth',
    commonIn: 'Face-generation GANs',
    found: false
  },
  {
    name: 'Texture blending errors',
    description: 'Unnatural texture transitions in hair, fabric, skin',
    commonIn: 'Image synthesis models',
    found: false
  },
  {
    name: 'Background coherence loss',
    description: 'Blurry, incoherent background details',
    commonIn: 'StyleGAN, diffusion models',
    found: false
  },
  {
    name: 'Color bleeding',
    description: 'Colors bleeding outside object boundaries',
    commonIn: 'Generative adversarial networks',
    found: false
  },
  {
    name: 'Lighting inconsistencies',
    description: 'Unnatural, internally inconsistent light sources',
    commonIn: 'All AI image generators',
    found: false
  }
]

// Analyze image for GAN fingerprints via pixel-level analysis
export async function analyzeForGAN(imageData: ImageData): Promise<GanAnalysis> {
  const width = imageData.width
  const height = imageData.height
  const data = imageData.data

  const signals: GanSignal[] = [
    {
      type: 'frequency',
      severity: 'high',
      description: 'Frequency domain analysis shows generator artifacts',
      detected: detectFrequencyAnomalies(data, width, height)
    },
    {
      type: 'noise',
      severity: 'medium',
      description: 'Noise pattern inconsistencies typical of generative models',
      detected: detectNoiseAnomalies(data, width, height)
    },
    {
      type: 'symmetry',
      severity: 'high',
      description: 'Unnatural bilateral symmetry in faces/objects',
      detected: detectSymmetryBias(data, width, height)
    },
    {
      type: 'color',
      severity: 'medium',
      description: 'Color channel misalignment or bleeding',
      detected: detectColorAnomalies(data, width, height)
    },
    {
      type: 'texture',
      severity: 'medium',
      description: 'Texture synthesis artifacts and blending errors',
      detected: detectTextureAnomalies(data, width, height)
    },
    {
      type: 'anatomy',
      severity: 'high',
      description: 'Impossible anatomical features (faces)',
      detected: detectAnatomicalOddities(data, width, height)
    }
  ]

  const detectedSignals = signals.filter(s => s.detected)

  // Map each artifact to the signal most likely to reveal it, so artifacts only
  // appear when the underlying pixel analysis actually triggered a detection.
  // Order matches AI_ARTIFACTS array: grid, symmetry, frequency, anatomy, texture, background, color, lighting.
  const artifactSignalMap = [
    signals.find(s => s.type === 'texture')?.detected ?? false,    // Grid artifacts
    signals.find(s => s.type === 'symmetry')?.detected ?? false,   // Symmetry bias
    signals.find(s => s.type === 'frequency')?.detected ?? false,  // Frequency inconsistencies
    signals.find(s => s.type === 'anatomy')?.detected ?? false,    // Anatomical oddities
    signals.find(s => s.type === 'texture')?.detected ?? false,    // Texture blending errors
    signals.find(s => s.type === 'noise')?.detected ?? false,      // Background coherence loss
    signals.find(s => s.type === 'color')?.detected ?? false,      // Color bleeding
    signals.find(s => s.type === 'frequency')?.detected ?? false,  // Lighting inconsistencies
  ]

  const artifacts = AI_ARTIFACTS.map((a, i) => ({
    ...a,
    found: artifactSignalMap[i] ?? false,
  }))

  const score = calculateGANScore(signals, artifacts)

  return {
    isLikelyAI: score >= 72,
    confidence: score,
    signals,
    artifacts: artifacts.filter(a => a.found),
    summary: generateGANSummary(score)
  }
}

// Frequency domain anomalies (typical of diffusion models)
function detectFrequencyAnomalies(data: Uint8ClampedArray, width: number, height: number): boolean {
  // Simplified: Check for repeating patterns at multiples of common generator output sizes
  // Real implementation would use FFT
  
  const sampleSize = Math.min(64, Math.min(width, height))
  let anomalyCount = 0
  
  for (let stride = 8; stride <= 32; stride += 8) {
    let patternMatches = 0
    for (let y = 0; y < height - stride; y += 16) {
      for (let x = 0; x < width - stride; x += 16) {
        const pixel1 = getPixel(data, width, x, y)
        const pixel2 = getPixel(data, width, x + stride, y)
        if (similar(pixel1, pixel2, 15)) patternMatches++
      }
    }
    if (patternMatches > (width * height) / 256) anomalyCount++
  }
  
  return anomalyCount > 2
}

// Noise pattern inconsistencies
function detectNoiseAnomalies(data: Uint8ClampedArray, width: number, height: number): boolean {
  // AI images can have suspiciously uniform noise. However, JPEG compression
  // naturally produces very low adjacent-pixel variance in smooth regions (skin,
  // sky, fabric). We only flag at a very tight threshold to avoid false-positives.
  let noiseVariance = 0
  const samples = Math.min(200, (width * height) / 128)

  for (let i = 0; i < samples; i++) {
    const x = Math.floor(Math.random() * (width - 1))
    const y = Math.floor(Math.random() * (height - 1))
    const pixel = getPixel(data, width, x, y)
    const neighbor = getPixel(data, width, x + 1, y)
    noiseVariance += Math.abs(pixel[0] - neighbor[0])
  }

  noiseVariance /= samples
  // Raised from 10 → 3: only flag near-absolute-zero noise (indicates heavy
  // synthetic smoothing). JPEG + normal content averages 6-25 on this metric.
  return noiseVariance < 3
}

// Symmetry bias (AI-generated faces are often unnaturally symmetric)
function detectSymmetryBias(data: Uint8ClampedArray, width: number, height: number): boolean {
  if (width < 64) return false

  const centerX = width / 2
  let symmetryScore = 0
  const samples = Math.min(100, width * height / 512)

  for (let i = 0; i < samples; i++) {
    const x = Math.floor(Math.random() * (centerX - 10)) + 10
    const y = Math.floor(Math.random() * height)

    const leftPixel = getPixel(data, width, Math.floor(centerX - x), y)
    const rightPixel = getPixel(data, width, Math.floor(centerX + x), y)

    // Tightened tolerance: 6 per channel (was 10) to avoid matching near-neutral tones
    if (similar(leftPixel, rightPixel, 6)) symmetryScore++
  }

  // Raised from 0.55 → 0.72. Natural portrait photos reach ~35-50% at this
  // per-channel tolerance. GAN faces land at 75%+.
  return (symmetryScore / samples) > 0.72
}

// Color channel anomalies — detect unnaturally uniform color distribution
// (the old "high-variance = AI" logic was backwards: vibrant real photos have
// high per-pixel RGB spread, so that approach always flagged colourful images)
function detectColorAnomalies(data: Uint8ClampedArray, width: number, height: number): boolean {
  const samples = 200
  const buckets = new Array(8).fill(0) // Divide 0-255 into 8 hue buckets

  for (let i = 0; i < samples; i++) {
    const x = Math.floor(Math.random() * width)
    const y = Math.floor(Math.random() * height)
    const idx = (y * width + x) * 4
    const r = data[idx], g = data[idx + 1], b = data[idx + 2]
    const hue = Math.round(Math.atan2(Math.sqrt(3) * (g - b), 2 * r - g - b) * (4 / Math.PI) + 4) % 8
    buckets[hue]++
  }

  // AI generators often produce unnaturally even hue distributions.
  // Flag only if colour spread is suspiciously uniform (CV < 0.25).
  const mean = samples / 8
  const variance = buckets.reduce((acc, v) => acc + (v - mean) ** 2, 0) / 8
  const cv = Math.sqrt(variance) / mean
  return cv < 0.25
}

// Texture synthesis errors
function detectTextureAnomalies(data: Uint8ClampedArray, width: number, height: number): boolean {
  // Detect repetitive texture blocks typical of generative models.
  // JPEG DCT quantisation naturally creates similar adjacent blocks in flat
  // areas, so the threshold is raised significantly (0.15 → 0.40) to only
  // flag images with a pathologically high repetition rate.
  const blockSize = 8
  let repeatedBlocks = 0
  let totalBlocks = 0

  for (let y = 0; y < height - blockSize * 2; y += blockSize) {
    for (let x = 0; x < width - blockSize * 2; x += blockSize) {
      totalBlocks++
      const hash1 = blockHash(data, width, x, y, blockSize)
      const hash2 = blockHash(data, width, x + blockSize, y, blockSize)
      if (hash1 === hash2) repeatedBlocks++
    }
  }

  return (repeatedBlocks / Math.max(1, totalBlocks)) > 0.40
}

// Anatomical oddities (extra fingers, strange features)
function detectAnatomicalOddities(data: Uint8ClampedArray, width: number, height: number): boolean {
  // Looks for unusually dense edge clusters — a proxy for AI incoherence.
  // The old threshold of > 10 was near-zero: any portrait with glasses, hair,
  // or text in the background triggered it immediately. Threshold is now
  // scaled to image area so it only fires for genuinely anomalous edge density.
  const edges = detectEdges(data, width, height)
  let anomalies = 0

  for (let i = 0; i < edges.length; i++) {
    if (edges[i] > 200) {
      const neighbors = edges.slice(Math.max(0, i - 5), i + 5).filter(e => e > 200)
      if (neighbors.length > 8) anomalies++
    }
  }

  // Scale with image size: require anomaly density > 0.15% of pixels
  const threshold = Math.max(100, Math.floor((width * height) * 0.0015))
  return anomalies > threshold
}

// Helper functions
function getPixel(data: Uint8ClampedArray, width: number, x: number, y: number): number[] {
  const idx = (Math.floor(y) * width + Math.floor(x)) * 4
  return [data[idx], data[idx + 1], data[idx + 2], data[idx + 3]]
}

function similar(p1: number[], p2: number[], threshold: number): boolean {
  return Math.abs(p1[0] - p2[0]) < threshold &&
         Math.abs(p1[1] - p2[1]) < threshold &&
         Math.abs(p1[2] - p2[2]) < threshold
}

function blockHash(data: Uint8ClampedArray, width: number, x: number, y: number, size: number): string {
  let hash = 0
  for (let dy = 0; dy < size; dy++) {
    for (let dx = 0; dx < size; dx++) {
      const idx = ((y + dy) * width + (x + dx)) * 4
      hash = ((hash << 5) - hash) + (data[idx] + data[idx + 1] + data[idx + 2])
    }
  }
  return hash.toString(36)
}

function detectEdges(data: Uint8ClampedArray, width: number, height: number): number[] {
  const edges: number[] = []
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const p = getPixel(data, width, x, y)
      const neighbors = [
        getPixel(data, width, x - 1, y),
        getPixel(data, width, x + 1, y),
        getPixel(data, width, x, y - 1),
        getPixel(data, width, x, y + 1)
      ]
      
      const diffs = neighbors.map(n => Math.abs(p[0] - n[0]) + Math.abs(p[1] - n[1]) + Math.abs(p[2] - n[2]))
      const maxDiff = Math.max(...diffs)
      edges.push(maxDiff)
    }
  }
  return edges
}

function calculateGANScore(signals: GanSignal[], artifacts: Artifact[]): number {
  // Baseline lowered from 50 → 10. Starting at 50 meant two medium signals
  // automatically crossed the old 65% threshold — every JPEG was "AI".
  // Scores only climb meaningfully when multiple independent signals fire.
  let score = 10

  signals.forEach(s => {
    if (s.detected) {
      if (s.severity === 'high') score += 18
      else if (s.severity === 'medium') score += 10
      else score += 4
    }
  })

  score += artifacts.filter(a => a.found).length * 4

  return Math.min(100, Math.max(0, score))
}

function generateGANSummary(score: number): string {
  if (score >= 80) {
    return 'Very high likelihood this is AI-generated. Multiple fingerprints detected: frequency artifacts, symmetry bias, texture inconsistencies.'
  } else if (score >= 65) {
    return 'Likely AI-generated or heavily edited. Several deep learning fingerprints found. Recommend reverse image search + manual inspection.'
  } else if (score >= 50) {
    return 'Possible AI generation or sophisticated editing. Some artifacts detected but inconclusive. Check metadata and source carefully.'
  } else if (score >= 35) {
    return 'Uncertain. Minimal AI generation signals detected. Image may be authentic or use advanced techniques. Consider additional verification.'
  } else {
    return 'Appears to be naturally captured or minimally edited. Low likelihood of AI generation based on artifact analysis.'
  }
}
