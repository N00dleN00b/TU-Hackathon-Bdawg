import { BookOpen, Brain, Image as ImageIcon, Share2, ShieldCheck, ExternalLink } from 'lucide-react'
import { PageHeader, PageHeaderHeading, PageHeaderDescription } from '@/components/page-header'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

const TOPICS = [
  {
    icon: Brain,
    title: 'What is Disinformation?',
    badge: 'Basics',
    badgeVariant: 'secondary' as const,
    content: `Disinformation is false information spread deliberately to deceive. It differs from misinformation (accidentally wrong) and malinformation (true but used harmfully).

Key forms:
• Fabricated content — 100% false stories invented to deceive
• Manipulated content — real content that has been altered
• Misleading framing — true facts presented out of context
• Satire misrepresented — jokes or parody presented as real news
• Imposter content — spoofing legitimate sources`,
    signals: ['Fabricated stories', 'Misleading headlines', 'Out-of-context media'],
  },
  {
    icon: ImageIcon,
    title: 'How Deepfakes Work',
    badge: 'Technology',
    badgeVariant: 'warning' as const,
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
  },
  {
    icon: Share2,
    title: 'How Fake News Spreads',
    badge: 'Social Media',
    badgeVariant: 'warning' as const,
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
  },
  {
    icon: ShieldCheck,
    title: 'How to Verify News',
    badge: 'Your Toolkit',
    badgeVariant: 'success' as const,
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
  },
  {
    icon: BookOpen,
    title: 'Spotting AI-Generated Text',
    badge: 'Advanced',
    badgeVariant: 'secondary' as const,
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

export default function Learn() {
  return (
    <>
      <PageHeader>
        <PageHeaderHeading>Learn</PageHeaderHeading>
        <PageHeaderDescription>
          Understand how disinformation works — and how to fight it.
        </PageHeaderDescription>
      </PageHeader>

      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2">
          {TOPICS.map((topic, i) => (
            <Card key={i}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg p-2 bg-muted">
                      <topic.icon className="size-5 text-foreground" />
                    </div>
                    <CardTitle className="text-base">{topic.title}</CardTitle>
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
              </CardContent>
            </Card>
          ))}
        </div>

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
