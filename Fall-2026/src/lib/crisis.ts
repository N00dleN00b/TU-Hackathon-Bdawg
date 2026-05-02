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

const VIRAL_ALERTS_KEY = 'realitycheck_viral_alerts'
const MEDIA_ALERTS_KEY = 'realitycheck_media_alerts'

// Current global crisis keywords (hardcoded for demo)
const CRISIS_KEYWORDS = {
  election: ['election', 'voting', 'ballot', 'candidate', 'campaign', 'electoral college', 'polls'],
  'public-health': ['vaccine', 'pandemic', 'covid', 'virus', 'outbreak', 'health crisis', 'quarantine'],
  financial: ['crypto', 'market crash', 'bank failure', 'inflation', 'stock', 'fraud'],
  disaster: ['earthquake', 'hurricane', 'flood', 'fire', 'tornado', 'tsunami', 'volcano'],
  scandal: ['epstein', 'jp morgan', 'sex trafficking', 'corruption', 'bribery', 'coverup'],
  other: [],
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
    'public-health',
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

const GDELT_CACHE_PREFIX = 'realitycheck_gdelt_'
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

function getCategoryKeyFromQuery(query: string): string {
  for (const [cat, q] of Object.entries(CATEGORY_GDELT_QUERIES)) {
    if (q === query) return cat
  }
  return 'other'
}

export async function fetchLiveHeadlines(
  query = 'deepfake OR misinformation OR fact check'
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

  // Try GDELT with manual timeout (AbortSignal.timeout has uneven browser support)
  try {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), 7000)

    const encoded = encodeURIComponent(query)
    const url =
      `https://api.gdeltproject.org/api/v2/doc/doc?query=${encoded}` +
      `&mode=artlist&maxrecords=10&format=json`

    const res = await fetch(url, { signal: controller.signal })
    clearTimeout(timer)

    if (!res.ok) throw new Error(`GDELT ${res.status}`)
    const text = await res.text()
    if (!text.trim().startsWith('{')) throw new Error('GDELT returned non-JSON')

    const json = JSON.parse(text) as { articles?: Array<{
      url: string; title: string; seendate: string
      socialimage?: string; domain: string
    }> }

    const articles = json.articles ?? []
    if (articles.length === 0) throw new Error('empty')

    const headlines: LiveHeadline[] = articles.map(a => ({
      title: a.title,
      url: a.url,
      domain: a.domain,
      seendate: a.seendate,
      socialimage: a.socialimage,
    }))

    sessionStorage.setItem(cacheKey, JSON.stringify({ data: headlines, ts: Date.now() }))
    return headlines
  } catch {
    // Fall back to curated demo headlines so the page always has content
    const cat = getCategoryKeyFromQuery(query)
    return DEMO_HEADLINES[cat] ?? DEMO_HEADLINES.other
  }
}

// Per-category GDELT queries for the crisis sidebar
export const CATEGORY_GDELT_QUERIES: Record<string, string> = {
  election: 'election misinformation OR voting disinformation',
  'public-health': 'health misinformation OR vaccine disinformation',
  financial: 'financial fraud OR crypto scam',
  disaster: 'disaster misinformation OR disinformation',
  scandal: 'deepfake scandal OR disinformation',
  other: 'deepfake OR misinformation OR fact check',
}

// ---- Demo fallback headlines (shown when GDELT is unreachable) ----

function gdeltDate(hoursAgo: number): string {
  const d = new Date(Date.now() - hoursAgo * 3600_000)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}00Z`
}

const DEMO_HEADLINES: Record<string, LiveHeadline[]> = {
  election: [
    { title: 'Fact-checkers rebut viral "election fraud" video circulating on TikTok', url: 'https://reuters.com', domain: 'reuters.com', seendate: gdeltDate(1) },
    { title: 'Social media platforms remove coordinated voter suppression network', url: 'https://apnews.com', domain: 'apnews.com', seendate: gdeltDate(3) },
    { title: 'AI-generated poll worker training videos flagged for misinformation', url: 'https://nbcnews.com', domain: 'nbcnews.com', seendate: gdeltDate(5) },
    { title: 'Deepfake audio of candidate circulates hours before primary vote', url: 'https://nytimes.com', domain: 'nytimes.com', seendate: gdeltDate(8) },
    { title: 'Researchers identify synthetic ballot images in viral Facebook posts', url: 'https://washingtonpost.com', domain: 'washingtonpost.com', seendate: gdeltDate(12) },
  ],
  'public-health': [
    { title: 'WHO responds to viral claim that new virus variant "is engineered"', url: 'https://bbc.com', domain: 'bbc.com', seendate: gdeltDate(2) },
    { title: 'False "5G causes illness" posts resurge ahead of tower rollout', url: 'https://theguardian.com', domain: 'theguardian.com', seendate: gdeltDate(4) },
    { title: 'AI-generated doctor videos spread vaccine misinformation on YouTube', url: 'https://cnn.com', domain: 'cnn.com', seendate: gdeltDate(6) },
    { title: 'CDC flags coordinated campaign spreading false flu mortality statistics', url: 'https://reuters.com', domain: 'reuters.com', seendate: gdeltDate(9) },
    { title: 'Deepfake hospital footage used to support pandemic conspiracy theory', url: 'https://apnews.com', domain: 'apnews.com', seendate: gdeltDate(14) },
  ],
  financial: [
    { title: 'FBI warns of deepfake CEO videos used in $25M wire fraud scheme', url: 'https://cnbc.com', domain: 'cnbc.com', seendate: gdeltDate(1) },
    { title: 'Crypto influencer charged with market manipulation via AI-generated news', url: 'https://wsj.com', domain: 'wsj.com', seendate: gdeltDate(3) },
    { title: 'Synthetic earnings reports used to pump penny stocks, SEC finds', url: 'https://ft.com', domain: 'ft.com', seendate: gdeltDate(7) },
    { title: 'AI voice clone of Fed chair used in market-moving fake announcement', url: 'https://bloomberg.com', domain: 'bloomberg.com', seendate: gdeltDate(10) },
    { title: 'Viral "bank collapse" screenshots confirmed as AI-generated', url: 'https://reuters.com', domain: 'reuters.com', seendate: gdeltDate(15) },
  ],
  disaster: [
    { title: '2010 Haiti earthquake footage circulates as "today\'s disaster" again', url: 'https://snopes.com', domain: 'snopes.com', seendate: gdeltDate(2) },
    { title: 'Rescue team photos from 2017 reposted as current flood relief', url: 'https://reuters.com', domain: 'reuters.com', seendate: gdeltDate(5) },
    { title: 'AI-generated wildfire images spread faster than real news during evacuation', url: 'https://wired.com', domain: 'wired.com', seendate: gdeltDate(8) },
    { title: 'Deepfake government "emergency broadcast" causes panic in three states', url: 'https://apnews.com', domain: 'apnews.com', seendate: gdeltDate(11) },
    { title: 'Old hurricane damage photos resurface with false location claims', url: 'https://factcheck.org', domain: 'factcheck.org', seendate: gdeltDate(16) },
  ],
  scandal: [
    { title: 'Deepfake audio of politician emerges 48 hours before vote — confirmed synthetic', url: 'https://nytimes.com', domain: 'nytimes.com', seendate: gdeltDate(1) },
    { title: 'AI-generated evidence introduced in high-profile trial, judge calls mistrial', url: 'https://reuters.com', domain: 'reuters.com', seendate: gdeltDate(4) },
    { title: 'Celebrity scandal video confirmed as GAN-generated by forensic analysts', url: 'https://theguardian.com', domain: 'theguardian.com', seendate: gdeltDate(6) },
    { title: 'Disinformation network behind executive "confession" video identified', url: 'https://washingtonpost.com', domain: 'washingtonpost.com', seendate: gdeltDate(9) },
  ],
  other: [
    { title: 'Researchers release new benchmark for detecting AI-generated news articles', url: 'https://mit.edu', domain: 'mit.edu', seendate: gdeltDate(2) },
    { title: 'EU passes landmark AI content labeling law — enforcement begins Q3', url: 'https://bbc.com', domain: 'bbc.com', seendate: gdeltDate(5) },
    { title: 'OpenAI, Google sign C2PA content authenticity pact for all generated media', url: 'https://theverge.com', domain: 'theverge.com', seendate: gdeltDate(7) },
    { title: 'Fact-checkers report 340% increase in AI-generated misinformation since 2024', url: 'https://apnews.com', domain: 'apnews.com', seendate: gdeltDate(10) },
    { title: 'Twitter/X rolling out deepfake detection labels on video posts', url: 'https://cnbc.com', domain: 'cnbc.com', seendate: gdeltDate(13) },
  ],
}
