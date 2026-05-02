import type { Signal, Verdict, AnalysisResult } from './types'

// ---- Pattern dictionaries ----

const EMOTIONAL_TRIGGERS = [
  'shocking', 'outrage', 'unbelievable', 'bombshell', 'scandal', 'exposed',
  'cover-up', 'they don\'t want you to know', 'wake up', 'share before deleted',
  'censored', 'banned', 'deep state', 'plandemic', 'hoax', 'crisis actor',
  'you won\'t believe', 'jaw-dropping', 'heartbreaking', 'infuriating',
  'explosive', 'devastating', 'alarming', 'terrifying', 'mind-blowing'
]

const VAGUE_ATTRIBUTION = [
  'some say', 'people are saying', 'many believe', 'sources say',
  'according to sources', 'it is said', 'rumor has it', 'word is',
  'apparently', 'supposedly', 'allegedly', 'unnamed sources', 'insiders say',
  'experts say', 'scientists say', 'studies show', 'research shows'
]

const LOGICAL_FALLACIES = [
  'everyone knows', 'nobody believes', 'they\'re all the same',
  'if you disagree you\'re', 'can\'t be trusted', 'always been corrupt',
  'never tells the truth', 'wake up sheeple', 'do your own research',
  'real patriots', 'true americans', 'libtards', 'trumptards', 'globalists',
  'elites control', 'new world order'
]

const AI_TEXT_PATTERNS = [
  'it is worth noting', 'it is important to note', 'in conclusion',
  'furthermore,', 'moreover,', 'in summary,', 'it should be noted',
  'as we can see,', 'this clearly shows', 'undoubtedly', 'needless to say',
  'it goes without saying', 'as previously mentioned', 'to summarize',
  'delve into', 'nuanced', 'multifaceted', 'comprehensive overview',
  'tapestry', 'it\'s crucial to understand', 'at its core'
]

const CLICKBAIT_PATTERNS = [
  '?!', '!!!', '???', 'BREAKING', 'MUST READ', 'WATCH:', 'URGENT:',
  'you need to see this', 'this will change everything', 'nobody is talking about',
  'hidden truth', 'what they\'re hiding', 'the real story'
]

const RELIABLE_SIGNALS = [
  'according to', 'reported by', 'said in a statement', 'confirmed by',
  'peer-reviewed', 'published in', 'data shows', 'study found',
  'spokesperson said', 'official statement', 'on the record', 'documents show',
  'court records', 'financial disclosure', 'public records'
]

// ---- Helpers ----

function countMatches(text: string, patterns: string[]): number {
  const lower = text.toLowerCase()
  return patterns.filter(p => lower.includes(p)).length
}

function getMatchedPhrases(text: string, patterns: string[]): string[] {
  const lower = text.toLowerCase()
  return patterns.filter(p => lower.includes(p))
}

function countAllCaps(text: string): number {
  const words = text.split(/\s+/)
  return words.filter(w => w.length > 3 && w === w.toUpperCase() && /[A-Z]/.test(w)).length
}

function countExcessivePunctuation(text: string): number {
  const matches = text.match(/[!?]{2,}/g)
  return matches ? matches.length : 0
}

function hasAuthorAttribution(text: string): boolean {
  return /by [A-Z][a-z]+ [A-Z][a-z]+/.test(text) ||
    /reporter|journalist|correspondent|editor|staff writer/i.test(text)
}

function hasDateAttribution(text: string): boolean {
  return /\b(january|february|march|april|may|june|july|august|september|october|november|december)\s+\d{1,2},?\s+\d{4}/i.test(text) ||
    /\d{1,2}\/\d{1,2}\/\d{4}/.test(text) ||
    /\d{4}-\d{2}-\d{2}/.test(text)
}

function hasSourceLinks(text: string): boolean {
  return /https?:\/\//i.test(text) ||
    /\(source:|\[source\]|citation needed/i.test(text) ||
    /according to [A-Z][a-z]|\breuters\b|\bap\b|\bassociated press\b|\bnyt\b|\bbbc\b|\bwashington post\b/i.test(text)
}

function detectLikelyTools(signals: Signal[]): string[] {
  const tools: string[] = []
  const highSev = signals.filter(s => s.found && s.severity === 'high')
  const aiFlag = signals.find(s => s.id === 'ai_text' && s.found)
  const emotional = signals.find(s => s.id === 'emotional' && s.found)
  const noAttrib = signals.find(s => s.id === 'attribution' && !s.found)

  if (aiFlag) {
    tools.push('AI text generators (ChatGPT, Claude, Gemini)')
    tools.push('AI content spinners')
  }
  if (emotional && noAttrib) {
    tools.push('Clickbait headline generators')
    tools.push('Propaganda framing techniques')
  }
  if (highSev.length >= 3) {
    tools.push('Social media manipulation playbooks')
    tools.push('Coordinated inauthentic behavior networks')
  }
  return tools
}

// ---- Main export ----

export function analyzeText(text: string): Omit<AnalysisResult, 'id' | 'timestamp' | 'aiEnhanced'> {
  const wordCount = text.split(/\s+/).filter(Boolean).length

  const emotionalCount = countMatches(text, EMOTIONAL_TRIGGERS)
  const vagueSources = countMatches(text, VAGUE_ATTRIBUTION)
  const fallacyCount = countMatches(text, LOGICAL_FALLACIES)
  const aiPatternCount = countMatches(text, AI_TEXT_PATTERNS)
  const clickbaitCount = countMatches(text, CLICKBAIT_PATTERNS)
  const reliableCount = countMatches(text, RELIABLE_SIGNALS)
  const allCapsCount = countAllCaps(text)
  const excessPunctuation = countExcessivePunctuation(text)

  const emotionalMatches = getMatchedPhrases(text, EMOTIONAL_TRIGGERS)
  const vagueMatches = getMatchedPhrases(text, VAGUE_ATTRIBUTION)
  const fallacyMatches = getMatchedPhrases(text, LOGICAL_FALLACIES)
  const aiMatches = getMatchedPhrases(text, AI_TEXT_PATTERNS)
  const clickbaitMatches = getMatchedPhrases(text, CLICKBAIT_PATTERNS)
  const capsWords = text.split(/\s+/).filter(w => w.length > 3 && w === w.toUpperCase() && /[A-Z]/.test(w))
  const punctInstances = text.match(/[!?]{2,}/g) ?? []
  const hasAuthor = hasAuthorAttribution(text)
  const hasDate = hasDateAttribution(text)
  const hasSources = hasSourceLinks(text)

  const signals: Signal[] = [
    {
      id: 'emotional',
      category: 'Language',
      label: 'Emotional Manipulation',
      severity: emotionalCount >= 4 ? 'high' : emotionalCount >= 2 ? 'medium' : 'low',
      found: emotionalCount >= 2,
      description: emotionalCount >= 2
        ? `Found ${emotionalCount} emotional trigger phrases designed to provoke strong reactions without evidence.`
        : 'Language appears relatively measured without excessive emotional triggers.',
      matchedExcerpts: emotionalMatches,
    },
    {
      id: 'vague_sources',
      category: 'Attribution',
      label: 'Vague Source Attribution',
      severity: vagueSources >= 3 ? 'high' : vagueSources >= 1 ? 'medium' : 'low',
      found: vagueSources >= 1,
      description: vagueSources >= 1
        ? `Found ${vagueSources} instances of vague attribution ("some say", "sources claim") with no verifiable sources.`
        : 'No vague attribution patterns detected.',
      matchedExcerpts: vagueMatches,
    },
    {
      id: 'attribution',
      category: 'Attribution',
      label: 'Missing Author/Source',
      severity: (!hasAuthor && !hasSources) ? 'high' : !hasAuthor ? 'medium' : 'low',
      found: !hasAuthor || !hasSources,
      description: (!hasAuthor && !hasSources)
        ? 'No identifiable author or credible source links found. Legitimate journalism always attributes sources.'
        : hasAuthor
          ? 'Author attribution found. Source links not clearly present.'
          : 'Source references found but no clear author byline.'
    },
    {
      id: 'date',
      category: 'Attribution',
      label: 'Missing Publication Date',
      severity: 'medium',
      found: !hasDate,
      description: !hasDate
        ? 'No publication date found. Undated content is often recycled or decontextualized.'
        : 'Publication date is present.'
    },
    {
      id: 'reliable_signals',
      category: 'Credibility',
      label: 'Credible Source Indicators',
      severity: reliableCount >= 3 ? 'low' : reliableCount >= 1 ? 'medium' : 'high',
      found: reliableCount === 0,
      description: reliableCount >= 3
        ? `Found ${reliableCount} credible attribution signals (named sources, publications, official statements).`
        : reliableCount >= 1
          ? `Found ${reliableCount} credibility signal(s), but more specific sourcing would strengthen credibility.`
          : 'No credible source attribution found. Reliable journalism cites verifiable sources.'
    },
    {
      id: 'logical_fallacy',
      category: 'Reasoning',
      label: 'Logical Fallacies',
      severity: fallacyCount >= 2 ? 'high' : fallacyCount >= 1 ? 'medium' : 'low',
      found: fallacyCount >= 1,
      description: fallacyCount >= 1
        ? `Detected ${fallacyCount} logical fallacy pattern(s) (ad hominem, straw man, appeal to authority).`
        : 'No obvious logical fallacy patterns detected.',
      matchedExcerpts: fallacyMatches,
    },
    {
      id: 'ai_text',
      category: 'Authenticity',
      label: 'AI-Generated Text Signals',
      severity: aiPatternCount >= 4 ? 'high' : aiPatternCount >= 2 ? 'medium' : 'low',
      found: aiPatternCount >= 2,
      description: aiPatternCount >= 2
        ? `Found ${aiPatternCount} AI-generated text patterns. This content may have been produced or heavily edited by an AI language model.`
        : 'No strong AI-generated text patterns detected.',
      matchedExcerpts: aiMatches,
    },
    {
      id: 'clickbait',
      category: 'Language',
      label: 'Clickbait Patterns',
      severity: clickbaitCount >= 2 ? 'high' : clickbaitCount >= 1 ? 'medium' : 'low',
      found: clickbaitCount >= 1,
      description: clickbaitCount >= 1
        ? `Found ${clickbaitCount} clickbait pattern(s) designed to drive engagement without informing.`
        : 'No clickbait patterns detected.',
      matchedExcerpts: clickbaitMatches,
    },
    {
      id: 'caps',
      category: 'Language',
      label: 'Excessive Capitalization',
      severity: allCapsCount >= 5 ? 'high' : allCapsCount >= 2 ? 'medium' : 'low',
      found: allCapsCount >= 2,
      description: allCapsCount >= 2
        ? `Found ${allCapsCount} ALL-CAPS word(s). Excessive caps are a common manipulation tactic to create urgency.`
        : 'No excessive capitalization found.',
      matchedExcerpts: capsWords.slice(0, 8),
    },
    {
      id: 'punctuation',
      category: 'Language',
      label: 'Excessive Punctuation',
      severity: excessPunctuation >= 3 ? 'medium' : 'low',
      found: excessPunctuation >= 2,
      description: excessPunctuation >= 2
        ? `Found ${excessPunctuation} instance(s) of repeated punctuation (!!!???). A sign of sensationalism.`
        : 'Punctuation appears normal.',
      matchedExcerpts: punctInstances.slice(0, 6),
    },
    {
      id: 'length',
      category: 'Credibility',
      label: 'Content Depth',
      severity: wordCount < 50 ? 'medium' : 'low',
      found: wordCount < 100,
      description: wordCount < 100
        ? `Very short content (${wordCount} words). Short posts without context are easy to decontextualize.`
        : `Content has ${wordCount} words — enough depth for meaningful analysis.`
    }
  ]

  // ---- Scoring ----
  let score = 75

  // Penalties
  if (emotionalCount >= 4) score -= 20
  else if (emotionalCount >= 2) score -= 10
  if (vagueSources >= 3) score -= 15
  else if (vagueSources >= 1) score -= 7
  if (!hasAuthor && !hasSources) score -= 20
  else if (!hasAuthor || !hasSources) score -= 8
  if (!hasDate) score -= 5
  if (fallacyCount >= 2) score -= 15
  else if (fallacyCount >= 1) score -= 8
  if (aiPatternCount >= 4) score -= 18
  else if (aiPatternCount >= 2) score -= 10
  if (clickbaitCount >= 2) score -= 12
  else if (clickbaitCount >= 1) score -= 6
  if (allCapsCount >= 5) score -= 10
  else if (allCapsCount >= 2) score -= 4
  if (wordCount < 50) score -= 8

  // Bonuses
  score += Math.min(reliableCount * 5, 20)
  if (hasAuthor) score += 5
  if (hasDate) score += 3
  if (hasSources) score += 5

  score = Math.max(0, Math.min(100, Math.round(score)))

  // ---- Verdict ----
  let verdict: Verdict
  if (score >= 75) verdict = 'reliable'
  else if (score >= 55) verdict = 'caution'
  else if (score >= 35) verdict = 'suspicious'
  else verdict = 'manipulated'

  // ---- Summary ----
  const flagCount = signals.filter(s => s.found && s.severity !== 'low').length
  let summary: string
  if (verdict === 'reliable') {
    summary = `This content shows reasonable credibility signals. ${reliableCount > 0 ? 'Named sources and attribution found.' : ''} Always verify important claims with primary sources.`
  } else if (verdict === 'caution') {
    summary = `This content has ${flagCount} concern(s) worth noting. Some manipulation indicators are present, but it may still contain accurate information. Cross-reference with established news sources.`
  } else if (verdict === 'suspicious') {
    summary = `Multiple red flags detected (${flagCount} signals). This content shows patterns commonly found in misinformation: ${[
      emotionalCount >= 2 ? 'emotional triggers' : '',
      vagueSources >= 1 ? 'vague sourcing' : '',
      !hasAuthor ? 'no author' : '',
      aiPatternCount >= 2 ? 'AI-generated patterns' : ''
    ].filter(Boolean).join(', ')}. Treat with significant skepticism.`
  } else {
    summary = `High risk of manipulation detected. This content exhibits ${flagCount} strong warning signs including techniques commonly used in propaganda, disinformation campaigns, and AI-generated fake news.`
  }

  const manipulationTools = detectLikelyTools(signals)

  return {
    type: 'text',
    trustScore: score,
    verdict,
    summary,
    signals,
    manipulationTools,
    contentPreview: text.slice(0, 200) + (text.length > 200 ? '...' : '')
  }
}
