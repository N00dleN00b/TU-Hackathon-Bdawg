import { AlertTriangle, CheckCircle, Clock, Film, Info } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { VideoAnalysis } from '@/lib/video-detection'
import { formatTimestamp } from '@/lib/video-detection'

interface Props {
  result: VideoAnalysis
}

const ISSUE_LABELS: Record<string, string> = {
  facial_swap: 'Facial Swap',
  lip_sync: 'Lip-Sync Mismatch',
  expression_inconsistency: 'Expression Inconsistency',
  flickering: 'Unnatural Flickering',
  compression: 'Compression Artifacts',
}

type ConfidenceTier = {
  label: string
  cls: string
  description: string
}

function getVideoConfidenceTier(confidence: number): ConfidenceTier {
  if (confidence >= 85) return {
    label: 'High Confidence — Deepfake',
    cls: 'border-red-400 text-red-600 dark:text-red-400',
    description: 'Multiple critical indicators detected. Do not share without expert verification.',
  }
  if (confidence >= 70) return {
    label: 'Likely Manipulated',
    cls: 'border-orange-400 text-orange-600 dark:text-orange-400',
    description: 'Significant deepfake signals found. Exercise strong caution.',
  }
  if (confidence >= 40) return {
    label: 'Inconclusive',
    cls: 'border-yellow-400 text-yellow-600 dark:text-yellow-400',
    description: 'Some anomalies present but insufficient for a confident verdict. Verify the source.',
  }
  return {
    label: 'Likely Authentic',
    cls: 'border-green-400 text-green-600 dark:text-green-400',
    description: 'Low anomaly scores. Minor variance is normal for compressed video.',
  }
}

export function VideoResultCard({ result }: Props) {
  const tier = getVideoConfidenceTier(result.confidence)

  return (
    <div className="space-y-4">
      {/* Verdict */}
      <Card className={result.suspect
        ? 'border-red-300 dark:border-red-800'
        : 'border-green-300 dark:border-green-800'}>
        <CardContent className="pt-6 pb-5 flex flex-col items-center gap-3 text-center">
          {result.suspect
            ? <AlertTriangle className="size-10 text-red-500" />
            : <CheckCircle className="size-10 text-green-500" />}
          <div>
            <p className="text-xl font-bold">
              {result.suspect ? 'Likely Deepfake' : 'Appears Authentic'}
            </p>
            <p className="text-sm text-muted-foreground mt-0.5">
              {result.confidence}% deepfake confidence
            </p>
          </div>
          {/* Confidence bar */}
          <div className="w-full max-w-[220px] h-2 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full rounded-full transition-all"
              style={{
                width: `${result.confidence}%`,
                backgroundColor: result.confidence >= 65 ? 'rgb(239,68,68)' : result.confidence >= 45 ? 'rgb(234,179,8)' : 'rgb(34,197,94)',
              }}
            />
          </div>
          {/* Confidence tier label */}
          <Badge variant="outline" className={`text-xs px-2.5 ${tier.cls}`}>
            {tier.label}
          </Badge>
          <p className="text-xs text-muted-foreground leading-relaxed px-2">{result.summary}</p>
          {/* Disclosure */}
          <div className="flex items-start gap-1.5 bg-muted/40 rounded-md px-3 py-2 text-left w-full mt-1">
            <Info className="size-3 text-muted-foreground shrink-0 mt-0.5" />
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              {tier.description} This analysis uses heuristic frame-pattern detection, not pixel-level neural inspection — treat results as indicators, not proof.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Metadata */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Film className="size-4" /> Video Metadata
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-y-3 gap-x-4 text-sm">
          <div>
            <p className="text-xs text-muted-foreground">Duration</p>
            <p className="font-medium">{formatTimestamp(result.duration)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Framerate</p>
            <p className="font-medium">{result.framerate} fps</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Total Frames</p>
            <p className="font-medium">{result.totalFrames.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Frames Sampled</p>
            <p className="font-medium">{result.timeline.length}</p>
          </div>
        </CardContent>
      </Card>

      {/* Issues */}
      {result.issues.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Detected Issues</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {result.issues.map(issue => (
              <div key={issue.type} className="flex items-start gap-3">
                <Badge
                  variant="secondary"
                  className={`shrink-0 mt-0.5 text-white text-[10px] px-1.5 ${
                    issue.severity === 'high'
                      ? 'bg-red-500 hover:bg-red-500'
                      : issue.severity === 'medium'
                        ? 'bg-yellow-500 hover:bg-yellow-500'
                        : 'bg-blue-500 hover:bg-blue-500'
                  }`}
                >
                  {issue.severity}
                </Badge>
                <div>
                  <p className="text-sm font-medium">{ISSUE_LABELS[issue.type] ?? issue.type}</p>
                  <p className="text-xs text-muted-foreground">{issue.description}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Frame anomaly timeline */}
      {result.timeline.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Clock className="size-4" /> Frame Anomaly Timeline
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-px h-14 w-full">
              {result.timeline.map(frame => (
                <div
                  key={frame.frameNumber}
                  className="flex-1 min-w-0 rounded-sm"
                  style={{
                    height: `${frame.anomalyScore}%`,
                    backgroundColor: frame.anomalyScore >= 70
                      ? 'rgb(239,68,68)'
                      : frame.anomalyScore >= 50
                        ? 'rgb(234,179,8)'
                        : 'rgb(34,197,94)',
                    opacity: 0.85,
                  }}
                  title={`${formatTimestamp(frame.timestamp)} — anomaly: ${frame.anomalyScore}`}
                />
              ))}
            </div>
            <div className="flex justify-between text-[10px] text-muted-foreground mt-1.5">
              <span>0:00</span>
              <span className="text-[10px] text-muted-foreground">
                green = low risk · yellow = moderate · red = high
              </span>
              <span>{formatTimestamp(result.duration)}</span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
