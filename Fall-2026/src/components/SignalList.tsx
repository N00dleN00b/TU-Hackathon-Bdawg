import { CheckCircle, XCircle, AlertCircle, MinusCircle } from 'lucide-react'
import type { Signal, SignalSeverity } from '@/lib/types'
import { cn } from '@/lib/utils'

interface SignalListProps {
  signals: Signal[]
  showAll?: boolean
}

const SEVERITY_CONFIG: Record<SignalSeverity, { color: string; label: string }> = {
  high: { color: 'text-red-500', label: 'High' },
  medium: { color: 'text-yellow-500', label: 'Medium' },
  low: { color: 'text-green-500', label: 'Low' },
}

function SignalIcon({ found, severity }: { found: boolean; severity: SignalSeverity }) {
  if (!found) {
    return <CheckCircle className="size-4 shrink-0 text-green-500" />
  }
  if (severity === 'high') {
    return <XCircle className="size-4 shrink-0 text-red-500" />
  }
  if (severity === 'medium') {
    return <AlertCircle className="size-4 shrink-0 text-yellow-500" />
  }
  return <MinusCircle className="size-4 shrink-0 text-muted-foreground" />
}

export function SignalList({ signals, showAll = false }: SignalListProps) {
  const visible = showAll
    ? signals
    : signals.filter(s => s.found || s.severity !== 'low')

  const grouped = visible.reduce<Record<string, Signal[]>>((acc, s) => {
    if (!acc[s.category]) acc[s.category] = []
    acc[s.category].push(s)
    return acc
  }, {})

  return (
    <div className="space-y-4">
      {Object.entries(grouped).map(([category, items]) => (
        <div key={category}>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
            {category}
          </p>
          <div className="space-y-2">
            {items.map(signal => (
              <div
                key={signal.id}
                className={cn(
                  'flex items-start gap-3 p-3 rounded-lg border text-sm',
                  signal.found && signal.severity === 'high' && 'border-red-200 bg-red-50/50 dark:border-red-900 dark:bg-red-950/30',
                  signal.found && signal.severity === 'medium' && 'border-yellow-200 bg-yellow-50/50 dark:border-yellow-900 dark:bg-yellow-950/30',
                  signal.found && signal.severity === 'low' && 'border-border bg-muted/30',
                  !signal.found && 'border-green-200 bg-green-50/50 dark:border-green-900 dark:bg-green-950/30',
                )}
              >
                <SignalIcon found={signal.found} severity={signal.severity} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium text-foreground">{signal.label}</span>
                    {signal.found && (
                      <span className={cn(
                        'text-xs px-1.5 py-0.5 rounded font-medium',
                        signal.severity === 'high' && 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200',
                        signal.severity === 'medium' && 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-200',
                        signal.severity === 'low' && 'bg-muted text-muted-foreground',
                      )}>
                        {SEVERITY_CONFIG[signal.severity].label} risk
                      </span>
                    )}
                  </div>
                  <p className="text-muted-foreground text-xs mt-0.5 leading-relaxed">
                    {signal.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
