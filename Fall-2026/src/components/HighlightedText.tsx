import type { Signal, SignalSeverity } from '@/lib/types'

const SEVERITY_CLS: Record<SignalSeverity, string> = {
  high: 'bg-red-100 dark:bg-red-900/40 text-red-900 dark:text-red-200',
  medium: 'bg-amber-100 dark:bg-amber-900/40 text-amber-900 dark:text-amber-200',
  low: 'bg-blue-100 dark:bg-blue-900/40 text-blue-900 dark:text-blue-200',
}

const SEVERITY_ORDER: Record<SignalSeverity, number> = { high: 2, medium: 1, low: 0 }

export function HighlightedText({ text, signals }: { text: string; signals: Signal[] }) {
  type PhraseEntry = { cls: string; label: string; severity: SignalSeverity }
  const phraseMap = new Map<string, PhraseEntry>()

  for (const signal of signals) {
    if (!signal.found || !signal.matchedExcerpts?.length) continue
    const cls = SEVERITY_CLS[signal.severity]
    for (const phrase of signal.matchedExcerpts) {
      const key = phrase.toLowerCase()
      const existing = phraseMap.get(key)
      if (!existing || SEVERITY_ORDER[signal.severity] > SEVERITY_ORDER[existing.severity]) {
        phraseMap.set(key, { cls, label: signal.label, severity: signal.severity })
      }
    }
  }

  if (phraseMap.size === 0) {
    return <p className="text-sm leading-relaxed whitespace-pre-wrap">{text}</p>
  }

  const phrases = Array.from(phraseMap.keys()).sort((a, b) => b.length - a.length)
  const escaped = phrases.map(p => p.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
  const regex = new RegExp(`(${escaped.join('|')})`, 'gi')
  const parts = text.split(regex)

  return (
    <p className="text-sm leading-relaxed whitespace-pre-wrap">
      {parts.map((part, i) => {
        const entry = phraseMap.get(part.toLowerCase())
        if (entry) {
          return (
            <mark
              key={i}
              title={entry.label}
              className={`rounded px-0.5 not-italic font-medium cursor-help ${entry.cls}`}
            >
              {part}
            </mark>
          )
        }
        return <span key={i}>{part}</span>
      })}
    </p>
  )
}
