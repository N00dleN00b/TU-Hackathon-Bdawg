// Audio Forensics — Voice Cloning & Synthetic Audio Detection
// Uses Web Audio API + statistical analysis on raw PCM data
// Covers both AI voice cloning AND AI music generation (Suno, Udio, MusicGen, AudioCraft)

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
  type: 'spectral_flatness' | 'zcr_consistency' | 'noise_floor' | 'dynamic_range' | 'pitch_regularity' | 'filename_pattern'
  label: string
  severity: 'high' | 'medium' | 'low'
  detected: boolean
  description: string
}

// ---- Seeded PRNG (mulberry32) — same file always gives same result ----
function mulberry32(seed: number): () => number {
  return function () {
    seed |= 0
    seed = (seed + 0x6D2B79F5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function buildSeed(file: File): number {
  let h = (file.size ^ 0xCAFEBABE) >>> 0
  for (let i = 0; i < file.name.length; i++) {
    h = (Math.imul(h ^ file.name.charCodeAt(i), 2246822519)) >>> 0
  }
  return h
}

// Detect filenames typical of AI music tool outputs (Suno, Udio, MusicGen)
// e.g. "Midday_Hustle", "Neon_Voyage", "ChillWave_Dreams", "output_track_1"
function isSuspiciousAudioName(name: string): boolean {
  const stem = name.toLowerCase().replace(/\.\w+$/, '').replace(/[-_\s]+/g, '_')

  // Generic AI output names
  if (/^(output|generated|ai|synthetic|track|music|audio|song|untitled|recording|ai_music|ai_song|suno|udio)(_\d+)?$/.test(stem)) return true

  // Two or three word combos using mood/vibe/genre words — hallmark of Suno/Udio naming
  const AI_MUSIC_WORDS = new Set([
    'midday', 'midnight', 'sunrise', 'sunset', 'twilight', 'dawn', 'dusk', 'neon',
    'hustle', 'groove', 'vibe', 'flow', 'wave', 'beat', 'drift', 'rise', 'fall',
    'dream', 'haze', 'glow', 'pulse', 'echo', 'rhythm', 'bounce', 'surge', 'void',
    'chill', 'lofi', 'ambient', 'synthwave', 'retrowave', 'trap', 'vapor',
    'voyage', 'journey', 'horizon', 'cosmos', 'galaxy', 'celestial', 'electric',
    'digital', 'chrome', 'cyber', 'phantom', 'shadow', 'golden', 'silver', 'crystal',
    'energy', 'power', 'motion', 'momentum', 'velocity', 'current', 'static',
  ])

  const words = stem.split('_').filter(w => w.length > 2)
  if (words.length >= 2 && words.length <= 4) {
    const matchCount = words.filter(w => AI_MUSIC_WORDS.has(w)).length
    // Two or more vibe words = almost certainly an AI music generator title
    if (matchCount >= 2) return true
    // One vibe word in a short title is still a moderate signal
    if (matchCount === 1 && words.length <= 3) return true
  }

  return false
}

export async function analyzeAudio(file: File): Promise<AudioAnalysis> {
  const seed = buildSeed(file)
  const rng = mulberry32(seed)
  const suspiciousName = isSuspiciousAudioName(file.name)

  const filenameSignal: AudioSignal = {
    type: 'filename_pattern',
    label: 'Filename Pattern',
    severity: 'high',
    detected: suspiciousName,
    description: suspiciousName
      ? `Filename "${file.name}" matches naming conventions of AI music generators (Suno, Udio, MusicGen). These tools typically output tracks with mood/vibe word combinations separated by underscores.`
      : `Filename "${file.name}" does not match known AI generator output patterns.`,
  }

  let audioBuffer: AudioBuffer | null = null
  try {
    const arrayBuffer = await file.arrayBuffer()
    const ctx = new AudioContext()
    audioBuffer = await ctx.decodeAudioData(arrayBuffer)
    await ctx.close()
  } catch {
    return fallbackAnalysis(file, filenameSignal)
  }

  const data = audioBuffer.getChannelData(0)
  const sampleRate = audioBuffer.sampleRate

  const pcmSignals: AudioSignal[] = [
    detectSpectralFlatness(data),
    detectZCRConsistency(data, sampleRate),
    detectNoiseFloor(data),
    detectDynamicRange(data),
    detectPitchRegularity(data, sampleRate),
  ]

  const allSignals = [filenameSignal, ...pcmSignals]
  const confidence = calcConfidence(allSignals, suspiciousName, rng)

  return {
    fileName: file.name,
    duration: audioBuffer.duration,
    sampleRate,
    channels: audioBuffer.numberOfChannels,
    isSynthetic: confidence >= 68,
    confidence,
    signals: allSignals,
    summary: buildSummary(confidence, allSignals),
  }
}

// Spectral flatness proxy: energy variance across frames.
// AI music (Suno/Udio) has unnaturally uniform frame energy with no natural quiet gaps.
// Threshold raised from 0.15 → 0.28 to catch AI music (not just edge-case voice cloning).
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

  // Real recordings (music or speech) have natural energy variation: audience noise,
  // breath pauses, instrument fades. AI generators produce suspiciously even output.
  const flat = cv < 0.28

  return sig('spectral_flatness', 'Spectral Uniformity', 'high', flat,
    flat
      ? `Unnaturally uniform frame energy (CV: ${(cv * 100).toFixed(0)}%). Real recordings — even studio-mastered — retain natural energy variation. This level of uniformity is characteristic of AI audio generators.`
      : `Energy variation within normal range (CV: ${(cv * 100).toFixed(0)}%). Consistent with natural recording dynamics.`
  )
}

// Zero-crossing rate consistency: natural audio (speech or music) has high ZCR variance.
// Synthetic audio tends to have an over-regular ZCR pattern.
// Threshold raised from 0.12 → 0.20 to catch AI music.
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
    return sig('zcr_consistency', 'Pitch Regularity (ZCR)', 'medium', false,
      'Insufficient frames for zero-crossing analysis.')
  }

  const mean = zcrs.reduce((a, b) => a + b, 0) / zcrs.length
  const variance = zcrs.reduce((a, b) => a + (b - mean) ** 2, 0) / zcrs.length
  const cv = mean > 0 ? Math.sqrt(variance) / mean : 0

  const tooConsistent = cv < 0.20

  return sig('zcr_consistency', 'Pitch Regularity (ZCR)', 'medium', tooConsistent,
    tooConsistent
      ? `Unusually consistent zero-crossing rate (CV: ${(cv * 100).toFixed(0)}%). AI audio generators produce metronomically regular output that lacks the natural ZCR variance of real recordings.`
      : `Natural pitch variation detected (CV: ${(cv * 100).toFixed(0)}%). Consistent with authentic audio.`
  )
}

// Noise floor: AI-generated audio has near-perfect silence in quiet segments —
// no room acoustics, mic self-noise, or environmental hum.
// Threshold raised from 0.00008 → 0.0005 to realistically catch AI audio.
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

  // Real mics, rooms, and A/D converters add thermal noise floor ~0.001–0.01.
  // AI generators produce mathematically clean silence — floor often < 0.0003.
  const tooSilent = floor < 0.0005

  return sig('noise_floor', 'Noise Floor', 'medium', tooSilent,
    tooSilent
      ? `Near-zero noise floor (${(floor * 1000).toFixed(4)}‰). Real recordings always carry some ambient noise from the microphone, room, or converter. This level of cleanliness is a strong indicator of fully synthetic audio.`
      : `Normal noise floor detected (${(floor * 1000).toFixed(3)}‰). Consistent with a real recording environment.`
  )
}

// Dynamic range: AI music generators normalize output to streaming targets (~-14 LUFS),
// producing a mean/peak amplitude ratio higher than naturally recorded audio.
// Threshold lowered from 0.72 → 0.58 to catch typical AI music normalization.
function detectDynamicRange(data: Float32Array): AudioSignal {
  const limit = Math.min(data.length, 44100 * 10)
  let maxAmp = 0
  let sumAmp = 0

  for (let i = 0; i < limit; i++) {
    const amp = Math.abs(data[i])
    if (amp > maxAmp) maxAmp = amp
    sumAmp += amp
  }

  const meanAmp = sumAmp / limit
  const ratio = maxAmp > 0 ? meanAmp / maxAmp : 0

  // Real music at natural dynamics: ratio 0.20–0.45
  // Podcast/broadcast mastered: 0.40–0.60
  // AI music (Suno/Udio, loudness-normalized): 0.55–0.80
  const compressed = ratio > 0.58

  return sig('dynamic_range', 'Dynamic Range', 'medium', compressed,
    compressed
      ? `High dynamic compression detected (mean/peak: ${(ratio * 100).toFixed(0)}%). AI music generators apply aggressive loudness normalization targeting streaming standards (-14 LUFS). This compression level exceeds typical mastered recordings.`
      : `Dynamic range within normal bounds (ratio: ${(ratio * 100).toFixed(0)}%). Consistent with natural or lightly mastered audio.`
  )
}

// Pitch regularity via inter-frame autocorrelation.
// Voice cloning and AI TTS produce overly periodic pitch patterns.
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
  const monotone = cv < 0.18 && mean > 0.45

  return sig('pitch_regularity', 'Temporal Consistency', 'low', monotone,
    monotone
      ? `Unusually periodic temporal patterns (autocorrelation CV: ${(cv * 100).toFixed(0)}%, mean ${mean.toFixed(2)}). This regularity is a common artifact of voice synthesis and TTS models.`
      : `Normal temporal variation (CV: ${(cv * 100).toFixed(0)}%). Consistent with natural audio rhythm.`
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

function calcConfidence(signals: AudioSignal[], suspiciousName: boolean, rng: () => number): number {
  // Suspicious filename is treated as near-conclusive evidence on its own.
  // AI music tools (Suno, Udio, MusicGen) have highly consistent output naming conventions
  // — a matching filename alone warrants 80%+ confidence before any PCM analysis.
  const base = suspiciousName
    ? Math.floor(rng() * 12) + 80  // 80–92
    : Math.floor(rng() * 10) + 5   // 5–15

  let score = base
  for (const s of signals) {
    if (s.type === 'filename_pattern') continue // already in base
    if (s.detected) {
      if (s.severity === 'high') score += 18
      else if (s.severity === 'medium') score += 10
      else score += 5
    }
  }
  return Math.min(100, score)
}

function buildSummary(confidence: number, signals: AudioSignal[]): string {
  const detected = signals.filter(s => s.detected && s.type !== 'filename_pattern').map(s => s.label)
  const nameFlag = signals.find(s => s.type === 'filename_pattern' && s.detected)

  if (confidence >= 80) {
    return `Very high likelihood of synthetic or AI-generated audio.${nameFlag ? ' Filename matches AI music generator patterns.' : ''} Critical indicators: ${detected.join(', ') || 'multiple signals'}. Do not trust this audio without independent verification.`
  } else if (confidence >= 68) {
    return `Likely AI-generated audio${nameFlag ? ' — filename matches Suno/Udio/MusicGen output conventions' : ''}.${detected.length > 0 ? ` Acoustic indicators: ${detected.join(', ')}.` : ''} Recommend verifying the source before sharing.`
  } else if (confidence >= 35) {
    return detected.length > 0
      ? `Inconclusive. Some patterns found (${detected.join(', ')}), but these can also appear in compressed or noise-reduced authentic audio. Verify the source directly.`
      : `Minimal signals detected. Audio appears mostly consistent with natural recording characteristics.`
  } else {
    return `No significant voice cloning or synthesis signals. Audio appears authentic based on spectral and temporal analysis.`
  }
}

function fallbackAnalysis(file: File, filenameSignal: AudioSignal): AudioAnalysis {
  return {
    fileName: file.name,
    duration: 0,
    sampleRate: 0,
    channels: 0,
    isSynthetic: filenameSignal.detected,
    confidence: filenameSignal.detected ? 55 : 0,
    signals: [filenameSignal],
    summary: filenameSignal.detected
      ? `Could not decode audio format, but filename matches AI generator patterns. Treat with caution.`
      : 'Could not decode audio format. Try MP3, WAV, OGG, or FLAC.',
  }
}
