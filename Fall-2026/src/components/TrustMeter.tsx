import type { Verdict } from '@/lib/types'

interface TrustMeterProps {
  score: number
  verdict: Verdict
  size?: 'sm' | 'md' | 'lg'
}

const VERDICT_LABELS: Record<Verdict, string> = {
  reliable: 'Likely Reliable',
  caution: 'Use Caution',
  suspicious: 'Suspicious',
  manipulated: 'Likely Manipulated',
  unknown: 'Unknown'
}

const VERDICT_COLORS: Record<Verdict, { stroke: string; text: string; bg: string; badge: string }> = {
  reliable: {
    stroke: '#22c55e',
    text: 'text-green-600 dark:text-green-400',
    bg: 'bg-green-50 dark:bg-green-950',
    badge: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100'
  },
  caution: {
    stroke: '#eab308',
    text: 'text-yellow-600 dark:text-yellow-400',
    bg: 'bg-yellow-50 dark:bg-yellow-950',
    badge: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100'
  },
  suspicious: {
    stroke: '#f97316',
    text: 'text-orange-600 dark:text-orange-400',
    bg: 'bg-orange-50 dark:bg-orange-950',
    badge: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-100'
  },
  manipulated: {
    stroke: '#ef4444',
    text: 'text-red-600 dark:text-red-400',
    bg: 'bg-red-50 dark:bg-red-950',
    badge: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100'
  },
  unknown: {
    stroke: '#6b7280',
    text: 'text-gray-600 dark:text-gray-400',
    bg: 'bg-gray-50 dark:bg-gray-950',
    badge: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-100'
  }
}

export function TrustMeter({ score, verdict, size = 'md' }: TrustMeterProps) {
  const colors = VERDICT_COLORS[verdict]
  const sizes = {
    sm: { r: 36, cx: 48, cy: 48, vb: '0 0 96 96', textSize: 'text-xl', subSize: 'text-xs', wrapSize: 'w-24 h-24' },
    md: { r: 48, cx: 64, cy: 64, vb: '0 0 128 128', textSize: 'text-3xl', subSize: 'text-xs', wrapSize: 'w-32 h-32' },
    lg: { r: 60, cx: 80, cy: 80, vb: '0 0 160 160', textSize: 'text-4xl', subSize: 'text-sm', wrapSize: 'w-40 h-40' }
  }[size]

  const circumference = 2 * Math.PI * sizes.r
  const dashOffset = circumference - (score / 100) * circumference

  return (
    <div className="flex flex-col items-center gap-3">
      <div className={`relative ${sizes.wrapSize}`}>
        <svg viewBox={sizes.vb} className="w-full h-full -rotate-90">
          <circle
            cx={sizes.cx}
            cy={sizes.cy}
            r={sizes.r}
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
            className="text-border"
          />
          <circle
            cx={sizes.cx}
            cy={sizes.cy}
            r={sizes.r}
            fill="none"
            stroke={colors.stroke}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            style={{ transition: 'stroke-dashoffset 0.8s ease' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`font-bold leading-none ${sizes.textSize} ${colors.text}`}>{score}</span>
          <span className={`${sizes.subSize} text-muted-foreground leading-none mt-0.5`}>/100</span>
        </div>
      </div>
      <span className={`text-xs font-semibold px-3 py-1 rounded-full ${colors.badge}`}>
        {VERDICT_LABELS[verdict]}
      </span>
    </div>
  )
}

export { VERDICT_LABELS, VERDICT_COLORS }
