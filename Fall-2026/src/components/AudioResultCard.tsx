import { AlertTriangle, CheckCircle, Info, Mic, Volume2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { AudioAnalysis } from '@/lib/audio-forensics'

interface Props {
  result: AudioAnalysis
}

function fmtDuration(s: number): string {
  if (!s) return '—'
  const m = Math.floor(s / 60)
  const sec = Math.floor(s % 60)
  return `${m}:${sec.toString().padStart(2, '0')}`
}

type ConfidenceTier = { label: string; cls: string; description: string }

function getAudioConfidenceTier(confidence: number): ConfidenceTier {
  if (confidence >= 80) return {
    label: 'Very High Risk — Synthetic',
    cls: 'border-red-400 text-red-600 dark:text-red-400',
    description: 'Multiple critical voice-synthesis signals detected. Do not trust this audio without independent verification.',
  }
  if (confidence >= 68) return {
    label: 'Possibly Synthetic',
    cls: 'border-orange-400 text-orange-600 dark:text-orange-400',
    description: 'Detected patterns associated with AI voice generation. Recommend verifying the source.',
  }
  if (confidence >= 35) return {
    label: 'Inconclusive',
    cls: 'border-yellow-400 text-yellow-600 dark:text-yellow-400',
    description: 'Some anomalies found but these can also appear in compressed or noise-reduced authentic audio.',
  }
  return {
    label: 'Likely Authentic',
    cls: 'border-green-400 text-green-600 dark:text-green-400',
    description: 'No significant voice-cloning or synthesis signals detected.',
  }
}

export function AudioResultCard({ result }: Props) {
  const tier = getAudioConfidenceTier(result.confidence)

  return (
    <div className="space-y-4">
      {/* Verdict */}
      <Card className={result.isSynthetic
        ? 'border-red-300 dark:border-red-800'
        : 'border-green-300 dark:border-green-800'}>
        <CardContent className="pt-6 pb-5 flex flex-col items-center gap-3 text-center">
          {result.isSynthetic
            ? <AlertTriangle className="size-10 text-red-500" />
            : <CheckCircle className="size-10 text-green-500" />}
          <div>
            <p className="text-xl font-bold">
              {result.isSynthetic ? 'Likely Synthetic Voice' : 'Appears Authentic'}
            </p>
            <p className="text-sm text-muted-foreground mt-0.5">
              {result.confidence}% synthetic confidence
            </p>
          </div>
          {/* Confidence bar */}
          <div className="w-full max-w-[220px] h-2 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full rounded-full transition-all"
              style={{
                width: `${result.confidence}%`,
                backgroundColor: result.confidence >= 60 ? 'rgb(239,68,68)' : result.confidence >= 40 ? 'rgb(234,179,8)' : 'rgb(34,197,94)',
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
              {tier.description} Statistical analysis only — MP3/AAC compression and noise reduction can affect results. Not a substitute for expert audio forensics.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Audio info */}
      {result.duration > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Volume2 className="size-4" /> Audio Info
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-3 gap-3 text-sm">
            <div>
              <p className="text-xs text-muted-foreground">Duration</p>
              <p className="font-medium">{fmtDuration(result.duration)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Sample Rate</p>
              <p className="font-medium">
                {result.sampleRate ? `${(result.sampleRate / 1000).toFixed(1)} kHz` : '—'}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Channels</p>
              <p className="font-medium">
                {result.channels === 1 ? 'Mono' : result.channels === 2 ? 'Stereo' : result.channels > 0 ? `${result.channels}ch` : '—'}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Detection signals */}
      {result.signals.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Mic className="size-4" /> Detection Signals
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {result.signals.map(signal => (
              <div key={signal.type}>
                <div className="flex items-center gap-2 mb-0.5">
                  <span className={`size-2 rounded-full shrink-0 ${signal.detected ? 'bg-red-500' : 'bg-green-500'}`} />
                  <span className="text-sm font-medium flex-1">{signal.label}</span>
                  {signal.detected && (
                    <Badge
                      variant="outline"
                      className={`text-[10px] px-1.5 ${
                        signal.severity === 'high'
                          ? 'text-red-600 dark:text-red-400 border-red-300 dark:border-red-700'
                          : signal.severity === 'medium'
                            ? 'text-yellow-600 dark:text-yellow-400 border-yellow-300 dark:border-yellow-700'
                            : 'text-blue-600 dark:text-blue-400 border-blue-300 dark:border-blue-700'
                      }`}
                    >
                      {signal.severity}
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground pl-4">{signal.description}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
