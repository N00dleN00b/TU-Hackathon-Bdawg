// Crisis Mode: Real-time Viral Content Detection

export interface ViralAlert {
  id: string
  title: string
  description: string
  riskLevel: 'critical' | 'high' | 'medium'
  category: 'election' | 'public-health' | 'financial' | 'disaster' | 'scandal' | 'other'
  keywords: string[]
  createdAt: number
  expiresAt: number
  active: boolean
}

export interface MediaAlert {
  id: string
  viralAlertId: string
  contentPreview: string
  analysisId?: string
  trustScore?: number
  sharedCount: number // Simulated viral metric
  timestamp: number
  priority: number // 1-100, higher = more urgent
}

const VIRAL_ALERTS_KEY = 'truthlens_viral_alerts'
const MEDIA_ALERTS_KEY = 'truthlens_media_alerts'

// Current global crisis keywords (hardcoded for demo)
const CRISIS_KEYWORDS = {
  election: ['election', 'voting', 'ballot', 'candidate', 'campaign', 'electoral college', 'polls'],
  publicHealth: ['vaccine', 'pandemic', 'covid', 'virus', 'outbreak', 'health crisis', 'quarantine'],
  financial: ['crypto', 'market crash', 'bank failure', 'inflation', 'stock', 'fraud'],
  disaster: ['earthquake', 'hurricane', 'flood', 'fire', 'tornado', 'tsunami', 'volcano'],
  scandal: ['epstein', 'jp morgan', 'sex trafficking', 'corruption', 'bribery', 'coverup'],
}

// Get active viral alerts
export function getActiveAlerts(): ViralAlert[] {
  try {
    const alerts = JSON.parse(localStorage.getItem(VIRAL_ALERTS_KEY) || '[]') as ViralAlert[]
    const now = Date.now()
    return alerts.filter(a => a.active && a.expiresAt > now)
  } catch {
    return []
  }
}

// Create a new alert (admin only, mocked to prevent spam)
export function createAlert(
  title: string,
  description: string,
  riskLevel: 'critical' | 'high' | 'medium',
  category: ViralAlert['category'],
  durationHours: number = 24
): ViralAlert {
  const alert: ViralAlert = {
    id: `alert_${Date.now()}`,
    title,
    description,
    riskLevel,
    category,
    keywords: CRISIS_KEYWORDS[category] || [],
    createdAt: Date.now(),
    expiresAt: Date.now() + durationHours * 60 * 60 * 1000,
    active: true
  }
  
  const alerts = JSON.parse(localStorage.getItem(VIRAL_ALERTS_KEY) || '[]') as ViralAlert[]
  alerts.push(alert)
  localStorage.setItem(VIRAL_ALERTS_KEY, JSON.stringify(alerts))
  
  return alert
}

// Detect if content matches any crisis keyword
export function matchesCrisis(text: string): ViralAlert | null {
  const lower = text.toLowerCase()
  const alerts = getActiveAlerts()
  
  for (const alert of alerts) {
    if (alert.keywords.some(kw => lower.includes(kw))) {
      return alert
    }
  }
  
  return null
}

// Log a media alert when suspicious content matches crisis
export function logMediaAlert(
  contentPreview: string,
  viralAlert: ViralAlert,
  analysisId?: string,
  trustScore?: number
): MediaAlert {
  const alert: MediaAlert = {
    id: `media_${Date.now()}`,
    viralAlertId: viralAlert.id,
    contentPreview,
    analysisId,
    trustScore,
    sharedCount: Math.random() * 10000, // Simulated
    timestamp: Date.now(),
    priority: trustScore ? (100 - trustScore) : 50
  }
  
  const alerts = JSON.parse(localStorage.getItem(MEDIA_ALERTS_KEY) || '[]') as MediaAlert[]
  alerts.push(alert)
  localStorage.setItem(MEDIA_ALERTS_KEY, JSON.stringify(alerts))
  
  return alert
}

// Get media alerts for a specific viral alert, sorted by priority
export function getMediaAlerts(viralAlertId?: string): MediaAlert[] {
  try {
    let alerts = JSON.parse(localStorage.getItem(MEDIA_ALERTS_KEY) || '[]') as MediaAlert[]
    
    if (viralAlertId) {
      alerts = alerts.filter(a => a.viralAlertId === viralAlertId)
    }
    
    return alerts.sort((a, b) => b.priority - a.priority)
  } catch {
    return []
  }
}

// Demo alerts (auto-create for testing)
export function initializeDemoAlerts(): void {
  const existing = getActiveAlerts().length
  if (existing > 0) return // Already initialized
  
  createAlert(
    'Election Integrity Monitoring',
    'Real-time verification of election-related claims and media',
    'high',
    'election',
    24
  )
  
  createAlert(
    'JP Morgan Sex Trafficking Scandal',
    'Monitor for deepfakes, misinformation, and AI-generated content related to recent allegations',
    'critical',
    'scandal',
    48
  )
  
  createAlert(
    'Health Misinformation Watch',
    'Flag false health claims, vaccine misinformation, pandemic hoaxes',
    'high',
    'publicHealth',
    24
  )
}

// Clear all data
export function clearCrisisData(): void {
  localStorage.removeItem(VIRAL_ALERTS_KEY)
  localStorage.removeItem(MEDIA_ALERTS_KEY)
}

// ---- GDELT Live Headlines ----
// GDELT Project API: free, no auth required, CORS-enabled.
// https://blog.gdeltproject.org/gdelt-2-0-our-global-database-of-society/

export interface LiveHeadline {
  title: string
  url: string
  domain: string
  seendate: string  // "20260310T233000Z"
  socialimage?: string
}

const GDELT_CACHE_PREFIX = 'truthlens_gdelt_'
const GDELT_CACHE_TTL = 5 * 60 * 1000 // 5 minutes

function parseGdeltDate(seendate: string): Date {
  // "20260310T233000Z" → Date
  const y = seendate.slice(0, 4)
  const mo = seendate.slice(4, 6)
  const d = seendate.slice(6, 8)
  const h = seendate.slice(9, 11)
  const mi = seendate.slice(11, 13)
  return new Date(`${y}-${mo}-${d}T${h}:${mi}:00Z`)
}

export function formatHeadlineAge(seendate: string): string {
  try {
    const date = parseGdeltDate(seendate)
    const diffMs = Date.now() - date.getTime()
    const mins = Math.floor(diffMs / 60000)
    if (mins < 60) return `${mins}m ago`
    const hrs = Math.floor(mins / 60)
    if (hrs < 24) return `${hrs}h ago`
    return `${Math.floor(hrs / 24)}d ago`
  } catch {
    return ''
  }
}

export async function fetchLiveHeadlines(
  query = 'deepfake OR misinformation OR disinformation OR "fact check"'
): Promise<LiveHeadline[]> {
  const cacheKey = GDELT_CACHE_PREFIX + query.slice(0, 40)

  // Serve from sessionStorage if fresh
  try {
    const cached = sessionStorage.getItem(cacheKey)
    if (cached) {
      const { data, ts } = JSON.parse(cached) as { data: LiveHeadline[]; ts: number }
      if (Date.now() - ts < GDELT_CACHE_TTL) return data
    }
  } catch { /* ignore */ }

  try {
    const encoded = encodeURIComponent(query)
    const url =
      `https://api.gdeltproject.org/api/v2/doc/doc?query=${encoded}` +
      `&mode=artlist&maxrecords=12&format=json&sourcelang=english`

    const res = await fetch(url, { signal: AbortSignal.timeout(8000) })
    if (!res.ok) throw new Error(`GDELT ${res.status}`)

    const json = await res.json() as { articles?: Array<{
      url: string; url_mobile?: string; title: string
      seendate: string; socialimage?: string; domain: string
      language: string; sourcecountry: string
    }> }

    const headlines: LiveHeadline[] = (json.articles ?? []).map(a => ({
      title: a.title,
      url: a.url,
      domain: a.domain,
      seendate: a.seendate,
      socialimage: a.socialimage,
    }))

    sessionStorage.setItem(cacheKey, JSON.stringify({ data: headlines, ts: Date.now() }))
    return headlines
  } catch {
    return []
  }
}

// Per-category GDELT queries for the crisis sidebar
export const CATEGORY_GDELT_QUERIES: Record<string, string> = {
  election: 'election fraud OR "election misinformation" OR "voting disinformation"',
  'public-health': 'health misinformation OR vaccine disinformation OR pandemic hoax',
  financial: 'financial fraud OR crypto scam OR "market manipulation"',
  disaster: 'disaster misinformation OR "natural disaster" disinformation',
  scandal: 'deepfake scandal OR disinformation campaign',
  other: 'deepfake OR misinformation OR "fact check"',
}
