import { Link } from 'react-router-dom'
import { ScanText, History, BookOpen, ShieldCheck, Zap, Brain } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { RealityCheckIcon } from '@/components/app-logo'

const STATS = [
  { label: 'Detection Signals', value: '11', desc: 'Heuristic checks per analysis' },
  { label: 'AI Models', value: '1+', desc: 'Groq LLaMA 3 for deep analysis' },
  { label: 'Privacy', value: '100%', desc: 'No data leaves your browser' },
  { label: 'Cost', value: 'Free', desc: 'No account required' },
]

const FEATURES = [
  {
    icon: ScanText,
    title: 'Text Analysis',
    description: 'Detect emotional manipulation, vague sourcing, AI-generated patterns, logical fallacies, and clickbait — instantly.',
    href: '/analyze',
    cta: 'Analyze text'
  },
  {
    icon: Brain,
    title: 'Image Forensics',
    description: 'Extract EXIF metadata, detect AI generation software tags, check camera info, and flag missing authenticity signals.',
    href: '/analyze',
    cta: 'Analyze image'
  },
  {
    icon: Zap,
    title: 'AI Enhancement',
    description: 'Connect a free Groq API key to add LLaMA 3-powered credibility scoring on top of heuristic analysis.',
    href: '/analyze',
    cta: 'Get started'
  },
  {
    icon: BookOpen,
    title: 'Media Literacy Hub',
    description: 'Learn how deepfakes work, how to spot AI text, and how to verify claims using free professional tools.',
    href: '/learn',
    cta: 'Start learning'
  },
]

const HOW_IT_WORKS = [
  {
    step: '01',
    title: 'Submit Content',
    desc: 'Paste any article, social media post, or upload a photo/screenshot you want to verify.'
  },
  {
    step: '02',
    title: 'Instant Scan',
    desc: 'RealityCheck runs 11 manipulation signal checks in milliseconds — no server required.'
  },
  {
    step: '03',
    title: 'Trust Score',
    desc: 'Get a 0–100 trust score, verdict, breakdown of all detected signals, and likely manipulation tools.'
  },
  {
    step: '04',
    title: 'Informed Decision',
    desc: 'Use the results to decide whether to trust, investigate further, or skip sharing the content.'
  },
]

export default function Dashboard() {
  return (
    <div className="space-y-12 py-4">
      {/* Hero */}
      <section className="text-center space-y-5 pt-6">
        <div className="flex justify-center">
          <RealityCheckIcon className="size-24 text-primary opacity-90" />
        </div>
        <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
          <ShieldCheck className="size-4" />
          TU Hackathon Fall 2026 — Wonder Gaurd
        </div>
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl ">
          Stop Sharing.<br className="hidden sm:block" /> <span className="typing"> Start Verifying </span>
        </h1>

        <p className="max-w-xl mx-auto text-muted-foreground text-lg leading-relaxed">
          RealityCheck is the Shazam for disinformation. In seconds, identify manipulation signals,
          deepfake indicators, and the tools used to deceive — all in your browser, all free.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
          <Button asChild size="lg" className="gap-2">
            <Link to="/analyze">
              <ScanText className="size-4" /> Analyze Content
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="gap-2">
            <Link to="/learn">
              <BookOpen className="size-4" /> Learn How It Works
            </Link>
          </Button>
        </div>
      </section>

      {/* Stats */}
      <section className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {STATS.map(s => (
          <Card key={s.label} className="text-center">
            <CardContent className="pt-5 pb-5">
              <p className="text-3xl font-bold text-primary">{s.value}</p>
              <p className="text-sm font-medium mt-1">{s.label}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{s.desc}</p>
            </CardContent>
          </Card>
        ))}
      </section>

      {/* How it works */}
      <section>
        <h2 className="text-xl font-bold mb-6">How It Works</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {HOW_IT_WORKS.map(step => (
            <div key={step.step} className="flex gap-4">
              <div className="shrink-0">
                <span className="text-3xl font-black text-primary/20">{step.step}</span>
              </div>
              <div className="pt-1">
                <p className="font-semibold text-sm">{step.title}</p>
                <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section>
        <h2 className="text-xl font-bold mb-6">What You Can Analyze</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {FEATURES.map(f => (
            <Card key={f.title} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3 mb-1">
                  <div className="rounded-lg p-2 bg-muted">
                    <f.icon className="size-5" />
                  </div>
                  <CardTitle className="text-base">{f.title}</CardTitle>
                </div>
                <CardDescription className="leading-relaxed">{f.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild variant="outline" size="sm" className="gap-1">
                  <Link to={f.href}>{f.cta} →</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="text-center py-4 border rounded-xl bg-muted/30 space-y-4">
        <h2 className="text-xl font-bold">Ready to test it?</h2>
        <p className="text-muted-foreground text-sm">
          Grab any news article you're unsure about and run it through RealityCheck right now.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button asChild size="lg" className="gap-2">
            <Link to="/analyze"><ScanText className="size-4" /> Open Analyzer</Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="gap-2">
            <Link to="/history"><History className="size-4" /> View History</Link>
          </Button>
        </div>
      </section>
    </div>
  )
}
