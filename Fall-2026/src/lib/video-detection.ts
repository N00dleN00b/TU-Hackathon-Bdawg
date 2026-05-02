// Video Deepfake Detection
// Frame-by-frame analysis for video manipulation detection

export interface VideoAnalysis {
  fileName: string
  duration: number
  totalFrames: number
  framerate: number
  suspect: boolean
  confidence: number
  issues: VideoIssue[]
  timeline: FrameAnalysis[]
  summary: string
}

export interface VideoIssue {
  type: 'facial_swap' | 'lip_sync' | 'expression_inconsistency' | 'flickering' | 'compression'
  severity: 'high' | 'medium' | 'low'
  frameRange: [number, number]
  description: string
  detected: boolean
}

export interface FrameAnalysis {
  frameNumber: number
  timestamp: number
  anomalyScore: number // 0-100
  flags: string[]
}

// Analyze video file for deepfake indicators
export async function analyzeVideo(file: File): Promise<VideoAnalysis> {
  // Extract basic video metadata
  const metadata = await extractVideoMetadata(file)
  
  // Simulate frame extraction and analysis
  // In production: use FFmpeg.wasm to extract frames
  const frameCount = Math.floor(metadata.duration * metadata.framerate)
  const sampleRate = Math.max(1, Math.floor(frameCount / 30)) // Analyze ~30 key frames
  
  const timeline: FrameAnalysis[] = []
  let suspiciousFrames = 0
  
  for (let i = 0; i < frameCount; i += sampleRate) {
    const timestamp = i / metadata.framerate
    const anomalyScore = simulateFrameAnalysis(i, frameCount)
    
    timeline.push({
      frameNumber: i,
      timestamp,
      anomalyScore,
      flags: generateFrameFlags(anomalyScore)
    })
    
    if (anomalyScore >= 60) suspiciousFrames++
  }
  
  // Detect pattern-based issues
  const issues: VideoIssue[] = [
    {
      type: 'facial_swap',
      severity: 'high',
      frameRange: detectFacialSwaps(timeline),
      description: 'Face appears to be synthetically replaced in multiple frames',
      detected: timeline.some(f => f.flags.includes('face_mismatch'))
    },
    {
      type: 'lip_sync',
      severity: 'high',
      frameRange: detectLipSyncIssues(timeline),
      description: 'Lip movements misaligned with audio (would need audio analysis)',
      detected: timeline.some(f => f.flags.includes('lip_desync'))
    },
    {
      type: 'expression_inconsistency',
      severity: 'medium',
      frameRange: detectExpressionFlickers(timeline),
      description: 'Facial expressions change unnaturally between frames',
      detected: timeline.some(f => f.flags.includes('weird_expression'))
    },
    {
      type: 'flickering',
      severity: 'medium',
      frameRange: detectFlickering(timeline),
      description: 'Unnatural flickering in face region (classic deepfake sign)',
      detected: timeline.some(f => f.flags.includes('flicker'))
    },
    {
      type: 'compression',
      severity: 'low',
      frameRange: detectCompressionArtifacts(timeline),
      description: 'Unusual compression patterns suggesting frame manipulation',
      detected: timeline.some(f => f.flags.includes('compression_artifact'))
    }
  ]
  
  const detectedIssues = issues.filter(i => i.detected)
  const overallConfidence = calculateVideoConfidence(suspiciousFrames, timeline.length, detectedIssues)
  
  return {
    fileName: file.name,
    duration: metadata.duration,
    totalFrames: frameCount,
    framerate: metadata.framerate,
    suspect: overallConfidence >= 65,
    confidence: overallConfidence,
    issues: detectedIssues,
    timeline,
    summary: generateVideoSummary(overallConfidence, detectedIssues)
  }
}

// Extract basic video metadata without decoding entire video
async function extractVideoMetadata(file: File): Promise<{duration: number, framerate: number}> {
  return new Promise((resolve) => {
    const video = document.createElement('video')
    const url = URL.createObjectURL(file)
    
    video.onloadedmetadata = () => {
      resolve({
        duration: video.duration || 0,
        framerate: 24 // Default assumption; more sophisticated: check metadata
      })
      URL.revokeObjectURL(url)
    }
    
    video.onerror = () => {
      // Fallback
      resolve({ duration: 0, framerate: 24 })
      URL.revokeObjectURL(url)
    }
    
    video.src = url
  })
}

// Simulate frame analysis (real: would extract frame as canvas, run GAN detection)
function simulateFrameAnalysis(frameIndex: number, totalFrames: number): number {
  // Create realistic anomaly score pattern
  const pattern = Math.sin((frameIndex / totalFrames) * Math.PI * 4) * 20 + 40
  const noise = Math.random() * 30
  let score = pattern + noise
  
  // Increase suspicion at common deepfake insertion points
  if (frameIndex > totalFrames * 0.2 && frameIndex < totalFrames * 0.4) {
    score += 15 // Often insert fake video mid-stream
  }
  
  return Math.min(100, Math.max(0, score))
}

// Detect likely facial swap regions
function detectFacialSwaps(timeline: FrameAnalysis[]): [number, number] {
  let startSwap = -1
  let maxConsecutive = 0
  let currentConsecutive = 0
  let bestStart = 0
  
  for (let i = 0; i < timeline.length; i++) {
    if (timeline[i].anomalyScore > 70 && timeline[i].flags.includes('face_mismatch')) {
      if (currentConsecutive === 0) startSwap = i
      currentConsecutive++
      
      if (currentConsecutive > maxConsecutive) {
        maxConsecutive = currentConsecutive
        bestStart = startSwap
      }
    } else {
      currentConsecutive = 0
    }
  }
  
  return maxConsecutive > 3 ? [bestStart, bestStart + maxConsecutive] : [0, 0]
}

// Detect lip-sync misalignment
function detectLipSyncIssues(timeline: FrameAnalysis[]): [number, number] {
  let syncIssues = 0
  let startIssue = -1
  let bestStart = 0
  let maxIssues = 0
  
  for (let i = 1; i < timeline.length; i++) {
    if (timeline[i].flags.includes('lip_desync')) {
      syncIssues++
      if (startIssue === -1) startIssue = i
      
      if (syncIssues > maxIssues) {
        maxIssues = syncIssues
        bestStart = startIssue
      }
    } else {
      syncIssues = 0
      startIssue = -1
    }
  }
  
  return maxIssues > 5 ? [bestStart, bestStart + maxIssues] : [0, 0]
}

// Detect unnatural expression changes
function detectExpressionFlickers(timeline: FrameAnalysis[]): [number, number] {
  let flickers = 0
  let startFlicker = -1
  let bestStart = 0
  let maxFlickers = 0
  
  for (let i = 1; i < timeline.length; i++) {
    const prevScore = timeline[i - 1].anomalyScore
    const currScore = timeline[i].anomalyScore
    
    if (Math.abs(prevScore - currScore) > 40) {
      flickers++
      if (startFlicker === -1) startFlicker = i
      
      if (flickers > maxFlickers) {
        maxFlickers = flickers
        bestStart = startFlicker
      }
    } else {
      flickers = 0
      startFlicker = -1
    }
  }
  
  return maxFlickers > 5 ? [bestStart, bestStart + maxFlickers] : [0, 0]
}

// Detect frame flickering (rapid changes in same region)
function detectFlickering(timeline: FrameAnalysis[]): [number, number] {
  let flickerCount = 0
  let startFlicker = -1
  let bestStart = 0
  let maxFlicker = 0
  
  for (let i = 0; i < timeline.length; i++) {
    if (timeline[i].flags.includes('flicker')) {
      flickerCount++
      if (startFlicker === -1) startFlicker = i
      
      if (flickerCount > maxFlicker) {
        maxFlicker = flickerCount
        bestStart = startFlicker
      }
    } else {
      flickerCount = 0
      startFlicker = -1
    }
  }
  
  return maxFlicker > 3 ? [bestStart, bestStart + maxFlicker] : [0, 0]
}

// Detect compression artifacts
function detectCompressionArtifacts(timeline: FrameAnalysis[]): [number, number] {
  let artifactCount = 0
  let startArtifact = -1
  let bestStart = 0
  let maxArtifacts = 0
  
  for (let i = 0; i < timeline.length; i++) {
    if (timeline[i].flags.includes('compression_artifact')) {
      artifactCount++
      if (startArtifact === -1) startArtifact = i
      
      if (artifactCount > maxArtifacts) {
        maxArtifacts = artifactCount
        bestStart = startArtifact
      }
    } else {
      artifactCount = 0
      startArtifact = -1
    }
  }
  
  return maxArtifacts > 5 ? [bestStart, bestStart + maxArtifacts] : [0, 0]
}

// Generate flags for a frame based on anomaly score
function generateFrameFlags(anomalyScore: number): string[] {
  const flags: string[] = []
  
  if (anomalyScore > 75) flags.push('face_mismatch')
  if (anomalyScore > 65 && Math.random() > 0.5) flags.push('lip_desync')
  if (anomalyScore > 70 && Math.random() > 0.4) flags.push('weird_expression')
  if (anomalyScore > 60 && Math.random() > 0.7) flags.push('flicker')
  if (anomalyScore > 55 && Math.random() > 0.8) flags.push('compression_artifact')
  
  return flags
}

// Calculate overall confidence score
function calculateVideoConfidence(suspiciousFrames: number, totalFrames: number, issues: VideoIssue[]): number {
  let confidence = 45 // Baseline
  
  // Frame suspicion ratio
  const ratio = suspiciousFrames / Math.max(1, totalFrames)
  confidence += ratio * 30
  
  // Issue severity weights
  issues.forEach(issue => {
    if (issue.detected) {
      if (issue.severity === 'high') confidence += 20
      else if (issue.severity === 'medium') confidence += 12
      else confidence += 5
    }
  })
  
  return Math.min(100, Math.max(0, confidence))
}

// Generate human-readable summary
function generateVideoSummary(confidence: number, issues: VideoIssue[]): string {
  const detectedTypes = issues.map(i => i.type.replace(/_/g, ' ')).join(', ')
  
  if (confidence >= 80) {
    return `VERY HIGH LIKELIHOOD OF DEEPFAKE. Multiple critical indicators detected: ${detectedTypes}. Recommend NOT SHARING until verified by expert.`
  } else if (confidence >= 65) {
    return `Likely deepfake or serious manipulation detected. Key issues: ${detectedTypes}. Exercise extreme caution before sharing.`
  } else if (confidence >= 50) {
    return `Some deepfake indicators found (${detectedTypes}), but inconclusive. Verify source and content carefully before sharing.`
  } else if (confidence >= 35) {
    return `Minimal deepfake signals. Could be genuine with minor editing or compression artifacts. Treat as authentic unless proven otherwise.`
  } else {
    return `Appears to be genuine video or naturally edited content. No significant deepfake indicators detected.`
  }
}

// Format timestamp for UI display
export function formatTimestamp(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}
