import type { AnalysisResult } from './types'

const STORAGE_KEY = 'realitycheck_history'
const MAX_HISTORY = 50

export function saveAnalysis(result: AnalysisResult): void {
  const history = getHistory()
  const updated = [result, ...history].slice(0, MAX_HISTORY)
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
  } catch {
    // localStorage full — remove oldest half
    const trimmed = updated.slice(0, Math.floor(MAX_HISTORY / 2))
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed))
  }
}

export function getHistory(): AnalysisResult[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    return JSON.parse(raw) as AnalysisResult[]
  } catch {
    return []
  }
}

export function deleteAnalysis(id: string): void {
  const history = getHistory().filter(r => r.id !== id)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(history))
}

export function clearHistory(): void {
  localStorage.removeItem(STORAGE_KEY)
}

export function generateId(): string {
  return `tl_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
}
