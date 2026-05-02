import { useState, useEffect } from 'react'
import { Trash2, ScanText, Image as ImageIcon, Clock, AlertTriangle } from 'lucide-react'
import { PageHeader, PageHeaderHeading, PageHeaderDescription } from '@/components/page-header'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { TrustMeter, VERDICT_LABELS } from '@/components/TrustMeter'
import { getHistory, deleteAnalysis, clearHistory } from '@/lib/storage'
import type { AnalysisResult } from '@/lib/types'

export default function History() {
  const [history, setHistory] = useState<AnalysisResult[]>([])
  const [expanded, setExpanded] = useState<string | null>(null)

  useEffect(() => {
    setHistory(getHistory())
  }, [])

  const handleDelete = (id: string) => {
    deleteAnalysis(id)
    setHistory(getHistory())
    if (expanded === id) setExpanded(null)
  }

  const handleClearAll = () => {
    if (confirm('Clear all analysis history? This cannot be undone.')) {
      clearHistory()
      setHistory([])
      setExpanded(null)
    }
  }

  const verdictColor = (result: AnalysisResult) => {
    const map = {
      reliable: 'success',
      caution: 'warning',
      suspicious: 'warning',
      manipulated: 'danger',
      unknown: 'secondary'
    } as const
    return map[result.verdict] ?? 'secondary'
  }

  const formatDate = (iso: string) => {
    const d = new Date(iso)
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) +
      ' · ' + d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <>
      <PageHeader>
        <PageHeaderHeading>History</PageHeaderHeading>
        <PageHeaderDescription>
          All analyses are stored locally in your browser — nothing is sent to a server.
        </PageHeaderDescription>
      </PageHeader>

      {history.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="pt-12 pb-12 flex flex-col items-center gap-4">
            <Clock className="size-12 text-muted-foreground/30" />
            <div className="text-center">
              <p className="font-medium">No analysis history yet</p>
              <p className="text-sm text-muted-foreground mt-1">
                Analyzed content will appear here for future reference.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-muted-foreground">{history.length} analysis record{history.length !== 1 ? 's' : ''}</p>
            <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive gap-2" onClick={handleClearAll}>
              <Trash2 className="size-4" /> Clear all
            </Button>
          </div>

          <div className="space-y-3">
            {history.map(item => (
              <Card
                key={item.id}
                className={`cursor-pointer transition-all hover:shadow-md ${expanded === item.id ? 'ring-1 ring-primary/30' : ''}`}
                onClick={() => setExpanded(expanded === item.id ? null : item.id)}
              >
                <CardContent className="pt-4 pb-4">
                  <div className="flex items-start gap-4">
                    {/* Type icon */}
                    <div className="shrink-0 mt-0.5">
                      {item.type === 'text'
                        ? <ScanText className="size-5 text-muted-foreground" />
                        : <ImageIcon className="size-5 text-muted-foreground" />
                      }
                    </div>

                    {/* Content preview */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant={verdictColor(item)} className="text-xs shrink-0">
                          {VERDICT_LABELS[item.verdict]}
                        </Badge>
                        <span className="text-xs text-muted-foreground">{formatDate(item.timestamp)}</span>
                        {item.aiEnhanced && (
                          <span className="text-xs text-purple-500">AI Enhanced</span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1 truncate">
                        {item.contentPreview}
                      </p>
                    </div>

                    {/* Score badge */}
                    <div className="shrink-0 text-right">
                      <span className={`text-lg font-bold ${
                        item.trustScore >= 75 ? 'text-green-600' :
                        item.trustScore >= 55 ? 'text-yellow-600' :
                        item.trustScore >= 35 ? 'text-orange-600' : 'text-red-600'
                      }`}>
                        {item.trustScore}
                      </span>
                      <span className="text-xs text-muted-foreground">/100</span>
                    </div>
                  </div>

                  {/* Expanded view */}
                  {expanded === item.id && (
                    <div className="mt-4 pt-4 border-t space-y-4">
                      <div className="flex flex-col sm:flex-row gap-6 items-start">
                        <TrustMeter score={item.trustScore} verdict={item.verdict} size="md" />
                        <div className="flex-1">
                          <p className="text-sm leading-relaxed text-muted-foreground">{item.summary}</p>

                          {item.manipulationTools.length > 0 && (
                            <div className="mt-3">
                              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                                Likely tools
                              </p>
                              <div className="flex flex-wrap gap-1.5">
                                {item.manipulationTools.map((t, i) => (
                                  <span key={i} className="text-xs bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-200 px-2 py-0.5 rounded-md">
                                    {t}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          <div className="mt-3 flex flex-wrap gap-1.5">
                            {item.signals.filter(s => s.found && s.severity !== 'low').map(s => (
                              <span key={s.id} className={`text-xs px-2 py-0.5 rounded-md flex items-center gap-1 ${
                                s.severity === 'high'
                                  ? 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-200'
                                  : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-950 dark:text-yellow-200'
                              }`}>
                                <AlertTriangle className="size-3" /> {s.label}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-end">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:text-destructive gap-1 text-xs"
                          onClick={e => { e.stopPropagation(); handleDelete(item.id) }}
                        >
                          <Trash2 className="size-3" /> Delete
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}
    </>
  )
}
