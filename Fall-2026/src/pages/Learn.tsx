import { useState } from 'react'
import { BookOpen, Brain, Image as ImageIcon, Share2, ShieldCheck, ExternalLink, CheckCircle2, Trophy, Star, ChevronDown, ChevronUp, Zap } from 'lucide-react'
import { PageHeader, PageHeaderHeading, PageHeaderDescription } from '@/components/page-header'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'

const TOPICS = [
  {
    id: 'disinformation',
    icon: Brain,
    title: 'What is Disinformation?',
    badge: 'Basics',
    badgeVariant: 'secondary' as const,
    xp: 50,
    content: `Disinformation is false information spread deliberately to deceive. It differs from misinformation (accidentally wrong) and malinformation (true but used harmfully).

Key forms:
• Fabricated content — 100% false stories invented to deceive
• Manipulated content — real content that has been altered
• Misleading framing — true facts presented out of context
• Satire misrepresented — jokes or parody presented as real news
• Imposter content — spoofing legitimate sources`,
    signals: ['Fabricated stories', 'Misleading headlines', 'Out-of-context media'],
    quiz: {
      question: 'What is the difference between disinformation and misinformation?',
      options: [
        'They are the same thing',
        'Disinformation is deliberate; misinformation is accidental',
        'Misinformation is more harmful',
        'Disinformation only applies to images',
      ],
      correct: 1,
      explanation: 'Disinformation is intentionally false and spread to deceive. Misinformation is false but spread without intent to harm.',
    },
  },
  {
    id: 'deepfakes',
    icon: ImageIcon,
    title: 'How Deepfakes Work',
    badge: 'Technology',
    badgeVariant: 'warning' as const,
    xp: 75,
    content: `Deepfakes use AI — specifically Generative Adversarial Networks (GANs) and diffusion models — to create synthetic media that looks authentic.

How they're made:
• Face-swapping — replacing one person's face with another in video
• Voice cloning — recreating someone's voice from audio samples
• Image generation — creating photorealistic "photos" that never happened
• Text generation — AI writing fake quotes attributed to real people

Red flags:
• Unnatural blinking, lighting inconsistencies, or hair artifacts
• Missing EXIF metadata in photos
• AI software tags in image files
• Lips/audio slightly out of sync in videos`,
    signals: ['No EXIF data', 'AI software tag', 'No camera info'],
    quiz: {
      question: 'What does GAN stand for in AI image generation?',
      options: [
        'Government Authentication Network',
        'Geographic Area Network',
        'Generative Adversarial Network',
        'Graphics Analysis Node',
      ],
      correct: 2,
      explanation: 'GAN (Generative Adversarial Network) uses two competing neural networks — a generator and a discriminator — to produce realistic synthetic media.',
    },
  },
  {
    id: 'spread',
    icon: Share2,
    title: 'How Fake News Spreads',
    badge: 'Social Media',
    badgeVariant: 'warning' as const,
    xp: 50,
    content: `False information spreads 6x faster than true information on social media (MIT, 2018). Here's why:

Psychological factors:
• Confirmation bias — we share content that confirms our beliefs
• Emotional contagion — shocking content triggers sharing impulses
• Source heuristics — we trust friends who share more than we verify

Platform mechanics:
• Engagement algorithms reward provocative content with more reach
• Bots and coordinated accounts amplify specific narratives at scale
• Headlines are read without articles — 59% never click through

Stopping the spread:
• Pause before sharing — ask "Do I know this is true?"
• Check the original source, not just the article
• Search for the image/claim to find coverage from multiple outlets`,
    signals: ['Emotional triggers', 'Missing sources', 'No author'],
    quiz: {
      question: 'According to MIT research, how much faster does false information spread vs. true information on social media?',
      options: ['2x faster', '4x faster', '6x faster', '10x faster'],
      correct: 2,
      explanation: 'MIT researchers found false news spreads about 6x faster than true news, largely because it tends to be more novel and emotionally engaging.',
    },
  },
  {
    id: 'verify',
    icon: ShieldCheck,
    title: 'How to Verify News',
    badge: 'Your Toolkit',
    badgeVariant: 'success' as const,
    xp: 75,
    content: `The SIFT method (developed by Mike Caulfield):

STOP — Don't react or share immediately. Pause.
INVESTIGATE the source — Who published this? What is their track record?
FIND better coverage — Can you find corroboration from a reliable outlet?
TRACE claims, quotes, and media back to original context.

Verification tools (all free):
• Google Reverse Image Search / TinEye — find where an image came from
• Snopes, PolitiFact, FactCheck.org — fact-checking databases
• Media Bias/Fact Check (mediabiasfactcheck.com) — outlet credibility ratings
• InVID / WeVerify — video verification tools
• Who.is / WHOIS — check domain age and ownership

The 3-source rule: If 3 independent credible outlets all confirm a story, it is very likely accurate.`,
    signals: ['Source attribution', 'Author byline', 'Publication date'],
    quiz: {
      question: 'What does the "I" in the SIFT verification method stand for?',
      options: [
        'Identify the image',
        'Investigate the source',
        'Ignore emotional reactions',
        'Index the claim',
      ],
      correct: 1,
      explanation: 'SIFT = Stop, Investigate the source, Find better coverage, Trace claims. "Investigate" means asking who published the content and whether they are credible.',
    },
  },
  {
    id: 'aitext',
    icon: BookOpen,
    title: 'Spotting AI-Generated Text',
    badge: 'Advanced',
    badgeVariant: 'secondary' as const,
    xp: 100,
    content: `AI language models produce text with subtle but detectable patterns:

Common AI text signals:
• Overly formal or "assistant-like" phrasing ("It is worth noting that...")
• Excessive hedging and qualifications
• Consistent structure with unnatural transitions ("Furthermore", "Moreover")
• Lack of personal voice, humor, or stylistic quirks
• Repeating the same phrase/concept in slightly different wording
• Superficially balanced arguments that avoid strong positions
• Invented facts that sound plausible but cannot be verified

Verification tools:
• GPTZero (gptzero.me) — AI text detection
• Originality.AI — content authenticity scoring
• Copyleaks — AI and plagiarism detection
• RealityCheck — our heuristic AI pattern detection (built right here!)

Important: AI detection is not perfect. Use it as one signal, not a verdict.`,
    signals: ['AI text patterns', 'Formal phrasing', 'Missing voice'],
    quiz: {
      question: 'Which of the following is a common signal that text was written by an AI?',
      options: [
        'Short sentences and slang',
        'Strong opinions and personal anecdotes',
        'Overly formal phrasing and excessive hedging',
        'Frequent spelling errors',
      ],
      correct: 2,
      explanation: 'AI-generated text often sounds overly polished — formal transitions, constant hedging ("It is worth noting"), and lack of a personal voice are common giveaways.',
    },
  },
]

const RESOURCES = [
  { name: 'Snopes', url: 'https://www.snopes.com', desc: 'Fact-checking since 1994' },
  { name: 'PolitiFact', url: 'https://www.politifact.com', desc: 'Political fact-checking' },
  { name: 'Media Bias/Fact Check', url: 'https://mediabiasfactcheck.com', desc: 'Outlet credibility database' },
  { name: 'InVID WeVerify', url: 'https://www.invid-project.eu/tools-and-services/invid-verification-plugin/', desc: 'Video & image verification' },
  { name: 'First Draft News', url: 'https://firstdraftnews.org', desc: 'Verification guides & research' },
  { name: 'NewsGuard', url: 'https://www.newsguardtech.com', desc: 'News source credibility ratings' },
]

const BADGE_TIERS = [
  { min: 0,   max: 99,  label: 'Newcomer',       color: 'bg-muted text-muted-foreground' },
  { min: 100, max: 199, label: 'Apprentice',      color: 'bg-blue-500/20 text-blue-600 dark:text-blue-400' },
  { min: 200, max: 299, label: 'Fact-Checker',    color: 'bg-green-500/20 text-green-600 dark:text-green-400' },
  { min: 300, max: 399, label: 'Truth Analyst',   color: 'bg-purple-500/20 text-purple-600 dark:text-purple-400' },
  { min: 350, max: Infinity, label: 'Master Fact-Checker', color: 'bg-yellow-500/20 text-yellow-600 dark:text-yellow-400' },
]

function getTier(xp: number) {
  return [...BADGE_TIERS].reverse().find(t => xp >= t.min) ?? BADGE_TIERS[0]
}

export default function Learn() {
  const [completed, setCompleted] = useState<Set<string>>(new Set())
  const [expanded, setExpanded] = useState<string | null>(null)
  // quizState per topic: null = not attempted, number = selected answer index
  const [quizAnswers, setQuizAnswers] = useState<Record<string, number | null>>({})
  const [quizSubmitted, setQuizSubmitted] = useState<Set<string>>(new Set())

  const totalXP = TOPICS.filter(t => completed.has(t.id)).reduce((sum, t) => sum + t.xp, 0)
  const maxXP = TOPICS.reduce((sum, t) => sum + t.xp, 0)
  const tier = getTier(totalXP)

  function markLearned(id: string) {
    setCompleted(prev => new Set([...prev, id]))
  }

  function submitQuiz(topicId: string) {
    setQuizSubmitted(prev => new Set([...prev, topicId]))
    const topic = TOPICS.find(t => t.id === topicId)!
    if (quizAnswers[topicId] === topic.quiz.correct) {
      markLearned(topicId)
    }
  }

  return (
    <>
      <PageHeader>
        <PageHeaderHeading>Learn</PageHeaderHeading>
        <PageHeaderDescription>
          Understand how disinformation works — and earn XP as you go.
        </PageHeaderDescription>
      </PageHeader>

      {/* Progress tracker */}
      <Card className="mb-6">
        <CardContent className="pt-5 pb-5">
          <div className="flex items-center justify-between gap-4 mb-3">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-yellow-500/10 p-2">
                <Trophy className="size-5 text-yellow-500" />
              </div>
              <div>
                <p className="font-semibold text-sm">Your Progress</p>
                <p className="text-xs text-muted-foreground">{completed.size} of {TOPICS.length} topics completed</p>
              </div>
            </div>
            <div className="text-right">
              <Badge className={`${tier.color} border-0 text-xs font-semibold`}>
                <Star className="size-3 mr-1" />
                {tier.label}
              </Badge>
              <p className="text-xs text-muted-foreground mt-1">{totalXP} / {maxXP} XP</p>
            </div>
          </div>
          <Progress value={(totalXP / maxXP) * 100} className="h-2" />
          <div className="flex justify-between text-xs text-muted-foreground mt-1.5">
            <span>0 XP</span>
            <span>{maxXP} XP — Master Fact-Checker</span>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2">
          {TOPICS.map((topic) => {
            const isDone = completed.has(topic.id)
            const isOpen = expanded === topic.id
            const selectedAnswer = quizAnswers[topic.id] ?? null
            const submitted = quizSubmitted.has(topic.id)
            const correct = submitted && selectedAnswer === topic.quiz.correct

            return (
              <Card
                key={topic.id}
                className={isDone ? 'border-green-500/40 bg-green-500/5' : ''}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className={`rounded-lg p-2 ${isDone ? 'bg-green-500/15' : 'bg-muted'}`}>
                        {isDone
                          ? <CheckCircle2 className="size-5 text-green-500" />
                          : <topic.icon className="size-5 text-foreground" />
                        }
                      </div>
                      <div>
                        <CardTitle className="text-base">{topic.title}</CardTitle>
                        <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                          <Zap className="size-3" /> {topic.xp} XP
                        </p>
                      </div>
                    </div>
                    <Badge variant={topic.badgeVariant} className="shrink-0 text-xs">
                      {topic.badge}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="space-y-3">
                  <p className="text-sm text-muted-foreground whitespace-pre-line leading-relaxed">
                    {topic.content}
                  </p>
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                      What RealityCheck checks
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {topic.signals.map(s => (
                        <span key={s} className="text-xs px-2 py-0.5 rounded-md bg-primary/10 text-primary font-medium">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Quiz toggle */}
                  <div className="border-t pt-3">
                    <button
                      className="flex items-center gap-2 text-xs font-semibold text-primary hover:opacity-80 transition-opacity"
                      onClick={() => setExpanded(isOpen ? null : topic.id)}
                    >
                      {isOpen ? <ChevronUp className="size-3.5" /> : <ChevronDown className="size-3.5" />}
                      {isDone ? 'Review quiz' : 'Take the quiz to earn XP'}
                    </button>

                    {isOpen && (
                      <div className="mt-3 space-y-3 animate-in slide-in-from-top-1 duration-150">
                        <p className="text-sm font-medium">{topic.quiz.question}</p>
                        <div className="space-y-2">
                          {topic.quiz.options.map((opt, i) => {
                            let cls = 'w-full text-left text-sm px-3 py-2 rounded-lg border transition-colors cursor-pointer '
                            if (!submitted) {
                              cls += selectedAnswer === i
                                ? 'border-primary bg-primary/10 text-primary'
                                : 'border-border hover:bg-muted/50'
                            } else {
                              if (i === topic.quiz.correct) cls += 'border-green-500 bg-green-500/10 text-green-700 dark:text-green-400'
                              else if (i === selectedAnswer) cls += 'border-red-500 bg-red-500/10 text-red-700 dark:text-red-400'
                              else cls += 'border-border text-muted-foreground'
                            }
                            return (
                              <button
                                key={i}
                                className={cls}
                                disabled={submitted}
                                onClick={() => setQuizAnswers(prev => ({ ...prev, [topic.id]: i }))}
                              >
                                {opt}
                              </button>
                            )
                          })}
                        </div>

                        {submitted ? (
                          <div className={`rounded-lg p-3 text-xs ${correct ? 'bg-green-500/10 text-green-700 dark:text-green-400' : 'bg-red-500/10 text-red-700 dark:text-red-400'}`}>
                            <p className="font-semibold mb-1">{correct ? `Correct! +${topic.xp} XP earned` : 'Not quite.'}</p>
                            <p>{topic.quiz.explanation}</p>
                          </div>
                        ) : (
                          <Button
                            size="sm"
                            className="w-full"
                            disabled={selectedAnswer === null}
                            onClick={() => submitQuiz(topic.id)}
                          >
                            Submit Answer
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Completion banner */}
        {completed.size === TOPICS.length && (
          <div className="rounded-xl border border-yellow-500/40 bg-yellow-500/5 p-6 text-center space-y-2">
            <Trophy className="size-10 mx-auto text-yellow-500" />
            <h3 className="text-lg font-bold">Master Fact-Checker Unlocked!</h3>
            <p className="text-sm text-muted-foreground">
              You've completed all {TOPICS.length} topics and earned {maxXP} XP. You're now equipped to spot disinformation like a professional.
            </p>
          </div>
        )}

        {/* External resources */}
        <Card>
          <CardHeader>
            <CardTitle>External Verification Resources</CardTitle>
            <CardDescription>
              Free tools trusted by journalists and researchers worldwide.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {RESOURCES.map(r => (
                <a
                  key={r.name}
                  href={r.url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors group"
                >
                  <div>
                    <p className="text-sm font-medium">{r.name}</p>
                    <p className="text-xs text-muted-foreground">{r.desc}</p>
                  </div>
                  <ExternalLink className="size-4 text-muted-foreground group-hover:text-foreground transition-colors shrink-0" />
                </a>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  )
}
