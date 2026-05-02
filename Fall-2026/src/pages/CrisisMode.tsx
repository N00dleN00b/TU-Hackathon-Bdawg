import { useState, useEffect } from 'react'
import { AlertTriangle, AlertOctagon, Clock, TrendingUp, Zap, CheckCircle2, Filter } from 'lucide-react'
import { PageHeader, PageHeaderHeading, PageHeaderDescription } from '@/components/page-header'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  getActiveAlerts,
  getMediaAlerts,
  initializeDemoAlerts,
  type ViralAlert,
  type MediaAlert
} from '@/lib/crisis'

const RISK_COLORS = {
  critical: 'bg-red-100 text-red-800 dark:bg-red-900',
  high: 'bg-orange-100 text-orange-800 dark:bg-orange-900',
  medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900',
}

const CATEGORY_ICONS = {
  election: '🗳️',
  'public-health': '🏥',
  financial: '💰',
  disaster: '🌍',
  scandal: '🔍',
  other: 'ℹ️',
}

export default function CrisisMode() {
  const [alerts, setAlerts] = useState<ViralAlert[]>([])
  const [allMediaAlerts, setAllMediaAlerts] = useState<MediaAlert[]>([])
  const [selectedAlert, setSelectedAlert] = useState<string | null>(null)
  const [filter, setFilter] = useState<'all' | 'critical' | 'high'>('all')

  useEffect(() => {
    initializeDemoAlerts()
    const viralAlerts = getActiveAlerts()
    setAlerts(viralAlerts)
    setSelectedAlert(viralAlerts[0]?.id || null)

    // Get all media alerts
    const mediaAlerts = getMediaAlerts()
    setAllMediaAlerts(mediaAlerts)
  }, [])

  const selectedAlertData = alerts.find(a => a.id === selectedAlert)
  const mediaAlertsForSelected = selectedAlert
    ? allMediaAlerts.filter(m => m.viralAlertId === selectedAlert)
    : []

  const filteredAlerts = alerts.filter(a =>
    filter === 'all' ? true : a.riskLevel === filter
  )

  const formatDate = (timestamp: number) => {
    const d = new Date(timestamp)
    const now = new Date()
    const diff = (now.getTime() - d.getTime()) / 1000
    
    if (diff < 60) return 'just now'
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
    return d.toLocaleDateString()
  }

  return (
    <>
      <PageHeader>
        <PageHeaderHeading className="flex items-center gap-2">
          <Zap className="size-6 text-red-500" />
          Crisis Mode
        </PageHeaderHeading>
        <PageHeaderDescription>
          Real-time verification of breaking news, viral claims, and critical misinformation.
        </PageHeaderDescription>
      </PageHeader>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        {/* Main content */}
        <div className="space-y-4">
          {selectedAlertData && (
            <>
              {/* Alert header */}
              <Card className="border-red-200 dark:border-red-900">
                <CardHeader className="bg-red-50/50 dark:bg-red-950/30">
                  <div className="flex items-start gap-3 justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className={RISK_COLORS[selectedAlertData.riskLevel]}>
                          {selectedAlertData.riskLevel.toUpperCase()}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {formatDate(selectedAlertData.createdAt)}
                        </span>
                      </div>
                      <CardTitle className="text-xl">{selectedAlertData.title}</CardTitle>
                      <CardDescription className="mt-2">
                        {selectedAlertData.description}
                      </CardDescription>
                    </div>
                    {selectedAlertData.riskLevel === 'critical' && (
                      <AlertOctagon className="size-8 text-red-500 shrink-0" />
                    )}
                  </div>

                  {/* Keywords being monitored */}
                  <div className="mt-4 flex flex-wrap gap-2">
                    {selectedAlertData.keywords.slice(0, 5).map(kw => (
                      <Badge key={kw} variant="outline" className="text-xs">
                        #{kw}
                      </Badge>
                    ))}
                    {selectedAlertData.keywords.length > 5 && (
                      <span className="text-xs text-muted-foreground">
                        +{selectedAlertData.keywords.length - 5} more keywords
                      </span>
                    )}
                  </div>
                </CardHeader>
              </Card>

              {/* Media alerts */}
              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <TrendingUp className="size-4" />
                  Related Content to Verify
                  <Badge variant="secondary" className="text-xs">
                    {mediaAlertsForSelected.length}
                  </Badge>
                </h3>

                {mediaAlertsForSelected.length === 0 ? (
                  <Card className="border-dashed">
                    <CardContent className="pt-8 pb-8 text-center">
                      <CheckCircle2 className="size-12 mx-auto text-green-500/30 mb-3" />
                      <p className="text-sm text-muted-foreground">
                        No suspicious content detected yet for this crisis.
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-3">
                    {mediaAlertsForSelected.map(alert => (
                      <Card
                        key={alert.id}
                        className={alert.priority > 70 ? 'border-red-200' : 'border-yellow-200'}
                      >
                        <CardContent className="pt-4 pb-4">
                          <div className="flex gap-3 items-start">
                            <div className="shrink-0 mt-1">
                              {alert.priority > 70 ? (
                                <AlertTriangle className="size-5 text-red-500" />
                              ) : (
                                <AlertTriangle className="size-5 text-yellow-500" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1 flex-wrap">
                                <span className="text-xs font-semibold text-muted-foreground">
                                  Priority
                                </span>
                                <div className="text-xs font-bold text-foreground">
                                  {alert.priority}/100
                                </div>
                                <span className="text-xs text-muted-foreground">
                                  • {formatDate(alert.timestamp)}
                                </span>
                              </div>
                              <p className="text-sm text-muted-foreground truncate">
                                {alert.contentPreview}
                              </p>
                              {alert.trustScore && (
                                <div className="mt-2">
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs text-muted-foreground">
                                      Trust Score:
                                    </span>
                                    <div
                                      className={`text-xs font-bold ${
                                        alert.trustScore >= 70
                                          ? 'text-green-600'
                                          : alert.trustScore >= 50
                                            ? 'text-yellow-600'
                                            : 'text-red-600'
                                      }`}
                                    >
                                      {alert.trustScore}
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>

              {/* Tips */}
              <Card className="bg-blue-50/50 dark:bg-blue-950/20 border-blue-200/50">
                <CardHeader>
                  <CardTitle className="text-sm">How to Verify Crisis Content</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm text-muted-foreground">
                  <p>• <strong>Find primary sources</strong> — news agency reports, official statements</p>
                  <p>• <strong>Check multiple outlets</strong> — if 3+ credible sources confirm it, it's likely true</p>
                  <p>• <strong>Reverse image search</strong> — find where photos originated</p>
                  <p>• <strong>Check timestamps</strong> — old photos recirculated as "breaking news"</p>
                  <p>• <strong>Pause before sharing</strong> — misinformation during crises spreads fastest</p>
                </CardContent>
              </Card>
            </>
          )}
        </div>

        {/* Sidebar: Alert list */}
        <div className="space-y-3">
          <div className="flex gap-2 mb-3">
            <Button
              variant={filter === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('all')}
              className="text-xs flex-1"
            >
              All
            </Button>
            <Button
              variant={filter === 'critical' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('critical')}
              className="text-xs flex-1"
            >
              Critical
            </Button>
          </div>

          <div className="space-y-2 max-h-[calc(100vh-400px)] overflow-y-auto">
            {filteredAlerts.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="pt-4 pb-4 text-center">
                  <Clock className="size-8 mx-auto text-muted-foreground/20 mb-2" />
                  <p className="text-xs text-muted-foreground">No active alerts</p>
                </CardContent>
              </Card>
            ) : (
              filteredAlerts.map(alert => (
                <Card
                  key={alert.id}
                  className={`cursor-pointer transition-all ${
                    selectedAlert === alert.id ? 'ring-2 ring-primary' : 'hover:shadow-md'
                  }`}
                  onClick={() => setSelectedAlert(alert.id)}
                >
                  <CardContent className="p-3">
                    <div className="flex gap-2 items-start">
                      <span className="text-lg shrink-0">
                        {CATEGORY_ICONS[alert.category]}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold truncate">{alert.title}</p>
                        <Badge
                          className={`text-xs mt-1 ${RISK_COLORS[alert.riskLevel]}`}
                          variant="secondary"
                        >
                          {alert.riskLevel}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </div>
    </>
  )
}
