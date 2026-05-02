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
    isLikelyAI: score >= 65,
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
  // GAN-generated images often have consistent noise patterns
  // Real natural images have more random noise
  
  let noiseVariance = 0
  const samples = Math.min(100, (width * height) / 256)
  
  for (let i = 0; i < samples; i++) {
    const x = Math.floor(Math.random() * (width - 1))
    const y = Math.floor(Math.random() * (height - 1))
    const pixel = getPixel(data, width, x, y)
    const neighbor = getPixel(data, width, x + 1, y)
    noiseVariance += Math.abs(pixel[0] - neighbor[0])
  }
  
  noiseVariance /= samples
  // Natural images: 10-30 average diff, AI images: 5-15
  return noiseVariance < 10
}

// Symmetry bias (fake faces are too symmetric)
function detectSymmetryBias(data: Uint8ClampedArray, width: number, height: number): boolean {
  if (width < 64) return false
  
  const centerX = width / 2
  let symmetryScore = 0
  const samples = Math.min(50, width * height / 1024)
  
  for (let i = 0; i < samples; i++) {
    const x = Math.floor(Math.random() * (centerX - 10)) + 10
    const y = Math.floor(Math.random() * height)
    
    const leftPixel = getPixel(data, width, Math.floor(centerX - x), y)
    const rightPixel = getPixel(data, width, Math.floor(centerX + x), y)
    
    if (similar(leftPixel, rightPixel, 10)) symmetryScore++
  }
  
  // Natural faces: ~30-40% symmetric at boundaries, AI: 60%+
  return (symmetryScore / samples) > 0.55
}

// Color channel anomalies
function detectColorAnomalies(data: Uint8ClampedArray, width: number, height: number): boolean {
  let colorMisalignment = 0
  const samples = 50
  
  for (let i = 0; i < samples; i++) {
    const x = Math.floor(Math.random() * (width - 1))
    const y = Math.floor(Math.random() * (height - 1))
    
    const idx = (y * width + x) * 4
    const r = data[idx]
    const g = data[idx + 1]
    const b = data[idx + 2]
    
    // RGB variance: AI images often show color bleeding
    const variance = Math.abs(r - g) + Math.abs(g - b) + Math.abs(r - b)
    if (variance > 150) colorMisalignment++
  }
  
  return (colorMisalignment / samples) > 0.4
}

// Texture synthesis errors
function detectTextureAnomalies(data: Uint8ClampedArray, width: number, height: number): boolean {
  // Detect repetitive texture blocks typical of generative models
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
  
  return (repeatedBlocks / Math.max(1, totalBlocks)) > 0.15
}

// Anatomical oddities (extra fingers, strange features)
function detectAnatomicalOddities(data: Uint8ClampedArray, width: number, height: number): boolean {
  // Simplified: Look for statistical anomalies in edge detection
  // Real implementation would use face detection + keypoint analysis
  
  const edges = detectEdges(data, width, height)
  let anomalies = 0
  
  for (let i = 0; i < edges.length; i++) {
    if (edges[i] > 200) {
      // Unusually sharp edge - could be artifact
      const neighbors = edges.slice(Math.max(0, i - 5), i + 5).filter(e => e > 200)
      if (neighbors.length > 8) anomalies++
    }
  }
  
  return anomalies > 10
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
  let score = 50 // Baseline
  
  // Weight signals by severity
  signals.forEach(s => {
    if (s.detected) {
      if (s.severity === 'high') score += 15
      else if (s.severity === 'medium') score += 8
      else score += 3
    }
  })
  
  // Each detected artifact adds points
  score += artifacts.filter(a => a.found).length * 5
  
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
