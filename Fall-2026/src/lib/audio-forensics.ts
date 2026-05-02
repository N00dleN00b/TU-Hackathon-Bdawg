// Audio Forensics — Voice Cloning & Synthetic Audio Detection
// Uses Web Audio API + statistical analysis on raw PCM data

export interface AudioAnalysis {
  fileName: string
  duration: number
  sampleRate: number
  channels: number
  isSynthetic: boolean
  confidence: number
  signals: AudioSignal[]
  summary: string
}

export interface AudioSignal {
  type: 'spectral_flatness' | 'zcr_consistency' | 'noise_floor' | 'dynamic_range' | 'pitch_regularity'
  label: string
  severity: 'high' | 'medium' | 'low'
  detected: boolean
  description: string
}

export async function analyzeAudio(file: File): Promise<AudioAnalysis> {
  let audioBuffer: AudioBuffer | null = null

  try {
    const arrayBuffer = await file.arrayBuffer()
    const ctx = new AudioContext()
    audioBuffer = await ctx.decodeAudioData(arrayBuffer)
    await ctx.close()
  } catch {
    return fallbackAnalysis(file)
  }

  const data = audioBuffer.getChannelData(0)
  const sampleRate = audioBuffer.sampleRate

  const signals: AudioSignal[] = [
    detectSpectralFlatness(data),
    detectZCRConsistency(data, sampleRate),
    detectNoiseFloor(data),
    detectDynamicRange(data),
    detectPitchRegularity(data, sampleRate),
  ]

  const confidence = calcConfidence(signals)

  return {
    fileName: file.name,
    duration: audioBuffer.duration,
    sampleRate,
    channels: audioBuffer.numberOfChannels,
    isSynthetic: confidence >= 68,
    confidence,
    signals,
    summary: buildSummary(confidence, signals),
  }
}

// Spectral flatness proxy: energy variance across frames.
// Synthetic audio tends to have unnaturally uniform frame energy.
function detectSpectralFlatness(data: Float32Array): AudioSignal {
  const frameSize = 1024
  const energies: number[] = []

  for (let i = 0; i + frameSize < data.length; i += frameSize) {
    let e = 0
    for (let j = 0; j < frameSize; j++) e += data[i + j] ** 2
    energies.push(e / frameSize)
  }

  if (energies.length < 4) {
    return sig('spectral_flatness', 'Spectral Uniformity', 'high', false,
      'Insufficient audio length for spectral analysis.')
  }

  const mean = energies.reduce((a, b) => a + b, 0) / energies.length
  const variance = energies.reduce((a, b) => a + (b - mean) ** 2, 0) / energies.length
  const cv = mean > 0 ? Math.sqrt(variance) / mean : 0
  // Threshold set to 0.15 (not 0.4) — professional mastering and MP3 compression both
  // naturally reduce energy variance and would false-positive at a looser threshold.
  const flat = cv < 0.15

  return sig('spectral_flatness', 'Spectral Uniformity', 'high', flat,
    flat
      ? `Extremely uniform energy distribution (CV: ${(cv * 100).toFixed(0)}%). This level of regularity is atypical even for mastered audio and may indicate voice synthesis.`
      : `Energy variation within normal range (CV: ${(cv * 100).toFixed(0)}%). Note: MP3/AAC compression and studio mastering naturally reduce energy variance — this signal alone is not conclusive.`
  )
}

// Zero-crossing rate consistency: natural speech has high ZCR variance.
// Synthetic voices tend to have a monotone, over-regular ZCR pattern.
function detectZCRConsistency(data: Float32Array, sampleRate: number): AudioSignal {
  const frameSize = Math.max(256, Math.floor(sampleRate * 0.025))
  const zcrs: number[] = []

  for (let i = 0; i + frameSize < data.length; i += frameSize) {
    let crossings = 0
    for (let j = 1; j < frameSize; j++) {
      if (data[i + j] * data[i + j - 1] < 0) crossings++
    }
    zcrs.push(crossings / frameSize)
  }

  if (zcrs.length < 4) {
    return sig('zcr_consistency', 'Pitch Regularity (ZCR)', 'high', false,
      'Insufficient frames for zero-crossing analysis.')
  }

  const mean = zcrs.reduce((a, b) => a + b, 0) / zcrs.length
  const variance = zcrs.reduce((a, b) => a + (b - mean) ** 2, 0) / zcrs.length
  const cv = mean > 0 ? Math.sqrt(variance) / mean : 0
  // 0.12 threshold (was 0.3) — noise reduction and phone call codecs flatten ZCR naturally.
  const tooConsistent = cv < 0.12

  return sig('zcr_consistency', 'Pitch Regularity (ZCR)', 'high', tooConsistent,
    tooConsistent
      ? `Extremely consistent zero-crossing rate (CV: ${(cv * 100).toFixed(0)}%). This level of pitch monotony is unusual even in noise-reduced recordings and may indicate voice synthesis.`
      : `Natural pitch variation (CV: ${(cv * 100).toFixed(0)}%). Note: Noise-cancellation and call codecs can reduce ZCR variance in authentic recordings.`
  )
}

// Noise floor detection: synthesized audio often lacks ambient room noise.
function detectNoiseFloor(data: Float32Array): AudioSignal {
  const frameSize = 512
  const minAmps: number[] = []

  for (let i = 0; i + frameSize < data.length; i += frameSize * 4) {
    let minAmp = Infinity
    for (let j = 0; j < frameSize; j++) minAmp = Math.min(minAmp, Math.abs(data[i + j]))
    if (isFinite(minAmp)) minAmps.push(minAmp)
  }

  const floor = minAmps.length > 0
    ? minAmps.reduce((a, b) => a + b, 0) / minAmps.length
    : 1

  // 0.00008 threshold (was 0.001) — MP3/AAC quantization noise and Bluetooth mic noise
  // both sit in the 0.001–0.005 range and would false-positive at the old threshold.
  const tooSilent = floor < 0.00008

  return sig('noise_floor', 'Noise Floor', 'medium', tooSilent,
    tooSilent
      ? `Near-absolute-silence noise floor (${(floor * 1e6).toFixed(1)} µ). This extreme quietness between phonemes is unusual for real microphone recordings and may indicate synthesized audio.`
      : `Normal noise floor detected (${(floor * 1000).toFixed(3)}‰). MP3 and phone recordings naturally have low but non-zero noise floors.`
  )
}

// Dynamic range: voice cloning often produces over-compressed audio.
function detectDynamicRange(data: Float32Array): AudioSignal {
  const limit = Math.min(data.length, 44100 * 5)
  let maxAmp = 0
  let sumAmp = 0

  for (let i = 0; i < limit; i++) {
    const amp = Math.abs(data[i])
    if (amp > maxAmp) maxAmp = amp
    sumAmp += amp
  }

  const meanAmp = sumAmp / limit
  const ratio = maxAmp > 0 ? meanAmp / maxAmp : 0
  // 0.72 threshold (was 0.4) — broadcast mastering, podcast normalization, and phone
  // recording AGC all routinely push mean/peak ratios to 0.4–0.65. Only flag extreme cases.
  const compressed = ratio > 0.72

  return sig('dynamic_range', 'Dynamic Range', 'medium', compressed,
    compressed
      ? `Extreme dynamic compression (mean/peak: ${(ratio * 100).toFixed(0)}%). This severe limiting is unusual even for broadcast-mastered content and may indicate synthetic audio with artificial volume normalization.`
      : `Dynamic range within normal bounds (ratio: ${(ratio * 100).toFixed(0)}%). Note: podcasts, phone calls, and mastered recordings naturally have moderate compression.`
  )
}

// Pitch regularity via inter-frame autocorrelation.
// Voice cloning models sometimes produce overly periodic pitch patterns.
function detectPitchRegularity(data: Float32Array, sampleRate: number): AudioSignal {
  const frameSize = Math.floor(sampleRate * 0.05)
  const correlations: number[] = []

  for (let i = 0; i + frameSize * 2 < data.length; i += frameSize * 2) {
    let corr = 0
    let norm = 0
    for (let j = 0; j < frameSize; j++) {
      corr += data[i + j] * data[i + j + frameSize]
      norm += data[i + j] ** 2
    }
    if (norm > 0) correlations.push(Math.abs(corr / norm))
  }

  if (correlations.length < 3) {
    return sig('pitch_regularity', 'Temporal Consistency', 'low', false,
      'Not enough audio data for pitch analysis.')
  }

  const mean = correlations.reduce((a, b) => a + b, 0) / correlations.length
  const variance = correlations.reduce((a, b) => a + (b - mean) ** 2, 0) / correlations.length
  const cv = mean > 0 ? Math.sqrt(variance) / mean : 0
  // Requires both very low CV (<0.15) AND sustained correlation (>0.5) to flag.
  // Natural monotone speakers and read-aloud content would false-positive at looser values.
  const monotone = cv < 0.15 && mean > 0.5

  return sig('pitch_regularity', 'Temporal Consistency', 'low', monotone,
    monotone
      ? `Unusually periodic temporal patterns (autocorrelation CV: ${(cv * 100).toFixed(0)}%, mean ${mean.toFixed(2)}). This regularity can indicate voice cloning or TTS synthesis, though some speakers naturally have low pitch variation.`
      : `Normal temporal variation (CV: ${(cv * 100).toFixed(0)}%). Consistent with natural speech rhythm.`
  )
}

function sig(
  type: AudioSignal['type'],
  label: string,
  severity: AudioSignal['severity'],
  detected: boolean,
  description: string
): AudioSignal {
  return { type, label, severity, detected, description }
}

function calcConfidence(signals: AudioSignal[]): number {
  let score = 10
  for (const s of signals) {
    if (s.detected) {
      if (s.severity === 'high') score += 20
      else if (s.severity === 'medium') score += 11
      else score += 5
    }
  }
  return Math.min(100, score)
}

function buildSummary(confidence: number, signals: AudioSignal[]): string {
  const detected = signals.filter(s => s.detected).map(s => s.label)
  if (confidence >= 80) {
    return `Very high likelihood of synthetic or cloned voice. Critical indicators: ${detected.join(', ')}. Do not trust this audio without independent verification.`
  } else if (confidence >= 68) {
    return `Possibly AI-generated or manipulated audio. Detected: ${detected.join(', ')}. Recommend verifying the source before sharing.`
  } else if (confidence >= 35) {
    return detected.length > 0
      ? `Inconclusive. Some patterns found (${detected.join(', ')}), but these can also appear in compressed/noise-reduced authentic audio. Verify the source directly.`
      : `Minimal signals detected. Audio appears mostly consistent with natural speech.`
  } else {
    return `No significant voice cloning or synthesis signals. Audio appears authentic based on spectral and temporal analysis.`
  }
}

function fallbackAnalysis(file: File): AudioAnalysis {
  return {
    fileName: file.name,
    duration: 0,
    sampleRate: 0,
    channels: 0,
    isSynthetic: false,
    confidence: 0,
    signals: [],
    summary: 'Could not decode audio format. Try MP3, WAV, OGG, or FLAC. Verify content through other means.',
  }
}
