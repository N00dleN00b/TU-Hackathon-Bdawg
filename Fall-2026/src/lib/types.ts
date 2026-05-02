export type SignalSeverity = 'low' | 'medium' | 'high'
export type Verdict = 'reliable' | 'caution' | 'suspicious' | 'manipulated' | 'unknown'
export type AnalysisType = 'text' | 'image'

export interface Signal {
  id: string
  category: string
  label: string
  severity: SignalSeverity
  found: boolean
  description: string
}

export interface AnalysisResult {
  id: string
  type: AnalysisType
  timestamp: string
  trustScore: number
  verdict: Verdict
  summary: string
  signals: Signal[]
  manipulationTools: string[]
  contentPreview: string
  aiEnhanced: boolean
}

export interface TextAnalysisInput {
  text: string
  groqApiKey?: string
}

export interface ImageAnalysisInput {
  file: File
  groqApiKey?: string
}
