import { Link } from 'react-router-dom'
import { ScanText, History, BookOpen, ShieldCheck, Zap, Brain, Mic, Users, ArrowRight, CheckCircle2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { RealityCheckIcon } from '@/components/app-logo'

const STATS = [
  { label: 'Detection Signals', value: '15+', desc: 'Forensic checks per analysis' },
  { label: 'Media Types', value: '4', desc: 'Text, image, video & audio' },
  { label: 'Privacy', value: '100%', desc: 'No data leaves your browser' },
  { label: 'Cost', value: 'Free', desc: 'No account required' },
]

const FEATURES = [
  {
    icon: ScanText,
    title: 'Text Analysis',
    description: 'Detect emotional manipulation, vague sourcing, AI-generated patterns, logical fallacies, and clickbait — instantly.',
    href: '/analyze',
    cta: 'Analyze text',
    color: 'text-blue-500',
    bg: 'bg-blue-500/10',
  },
  {
    icon: Brain,
    title: 'Image Forensics',
    description: 'EXIF metadata extraction, GAN fingerprinting, AI software tag detection, and pixel-level artifact analysis.',
    href: '/analyze',
    cta: 'Analyze image',
    color: 'text-purple-500',
    bg: 'bg-purple-500/10',
  },
  {
    icon: Zap,
    title: 'Video Detection',
    description: 'Frame-by-frame temporal analysis detects facial swaps, lip-sync misalignment, and compression artifacts.',
    href: '/analyze',
    cta: 'Analyze video',
    color: 'text-orange-500',
    bg: 'bg-orange-500/10',
  },
  {
    icon: Mic,
    title: 'Audio Forensics',
    description: 'Spectral flatness, noise floor analysis, and dynamic range checks catch AI voice cloning and synthetic music.',
    href: '/analyze',
    cta: 'Analyze audio',
    color: 'text-green-500',
    bg: 'bg-green-500/10',
  },
]

const HOW_IT_WORKS = [
  {
    step: '01',
    title: 'Submit Content',
    desc: 'Paste any article, social media post, or upload a photo, video, or audio file you want to verify.'
  },
  {
    step: '02',
    title: 'Instant Scan',
    desc: 'RealityCheck runs 15+ forensic signal checks in milliseconds — no server, no account, no waiting.'
  },
  {
    step: '03',
    title: 'Trust Score',
    desc: 'Get a 0–100 trust score, a clear verdict, a full signal breakdown, and the likely manipulation tools used.'
  },
  {
    step: '04',
    title: 'Informed Decision',
    desc: 'Decide whether to trust, investigate further, or flag for the community — with full transparency.'
  },
]

const TRUST_POINTS = [
  'No account or sign-up required',
  'All analysis runs in your browser',
  'No images or text sent to any server',
  'Open methodology — every flag is explained',
]

export default function Dashboard() {
  return (
    <div className="space-y-16 py-4">

      {/* Hero */}
      <section className="relative text-center space-y-6 pt-8 pb-4 overflow-hidden">
        {/* Cyberpunk grid + scanline overlays */}
        <div className="absolute inset-0 cyber-grid scanlines-overlay" aria-hidden />
        <div className="scanline-beam" aria-hidden />

        {/* Gradient glow behind icon */}
        <div className="relative flex justify-center">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="size-40 rounded-full bg-primary/20 blur-3xl" />
          </div>
          <div className="relative cyber-corner rounded-2xl bg-background/80 backdrop-blur p-3 ring-1 ring-primary/20 shadow-lg shadow-primary/10">
            <RealityCheckIcon className="size-20" />
          </div>
        </div>

        <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary ring-1 ring-primary/20 terminal-cursor">
          <ShieldCheck className="size-4" />
          TU Hackathon Fall 2026 — Wonder Gaurd
        </div>

        <div className="space-y-3 relative">
          <h1 className="text-5xl font-black tracking-tight sm:text-6xl leading-[1.1]">
            <span className="glitch-text">Stop Sharing.</span>
            <br />
            <span className="neon-text bg-gradient-to-r from-primary via-purple-500 to-pink-500 bg-clip-text text-transparent">
              Start Verifying.
            </span>
          </h1>
          <p className="max-w-2xl mx-auto text-muted-foreground text-lg leading-relaxed">
            RealityCheck is the Shazam for disinformation. In seconds, identify deepfakes,
            manipulation signals, and the tools used to deceive — all in your browser, completely free.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
          <Button asChild size="lg" className="gap-2 text-base px-6 shadow-lg shadow-primary/25">
            <Link to="/analyze">
              <ScanText className="size-4" /> Analyze Content
              <ArrowRight className="size-4 ml-1" />
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="gap-2 text-base px-6">
            <Link to="/learn">
              <BookOpen className="size-4" /> Learn How It Works
            </Link>
          </Button>
        </div>
      </section>

      {/* Stats */}
      <section className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {STATS.map(s => (
          <Card key={s.label} className="text-center border-border/50 bg-card/50 backdrop-blur hover:border-primary/30 transition-colors">
            <CardContent className="pt-6 pb-6">
              <p className="text-4xl font-black bg-gradient-to-br from-primary to-purple-500 bg-clip-text text-transparent">{s.value}</p>
              <p className="text-sm font-semibold mt-1.5">{s.label}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{s.desc}</p>
            </CardContent>
          </Card>
        ))}
      </section>

      {/* Features */}
      <section>
        <div className="text-center mb-8 space-y-2">
          <Badge variant="secondary" className="text-xs">Multi-modal analysis</Badge>
          <h2 className="text-2xl font-bold">What You Can Analyze</h2>
          <p className="text-muted-foreground text-sm max-w-lg mx-auto">
            Four forensic engines in one tool — covering every format misinformation travels in.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {FEATURES.map(f => (
            <Card key={f.title} className="group hover:border-primary/40 hover:shadow-md hover:shadow-primary/5 transition-all duration-200">
              <CardHeader className="pb-3">
                <div className="flex items-start gap-3 mb-2">
                  <div className={`rounded-xl p-2.5 ${f.bg} shrink-0`}>
                    <f.icon className={`size-5 ${f.color}`} />
                  </div>
                  <div>
                    <CardTitle className="text-base">{f.title}</CardTitle>
                    <CardDescription className="leading-relaxed mt-1">{f.description}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <Button asChild variant="ghost" size="sm" className={`gap-1.5 ${f.color} hover:${f.bg} px-0`}>
                  <Link to={f.href}>
                    {f.cta}
                    <ArrowRight className="size-3 group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section>
        <div className="text-center mb-8 space-y-2">
          <Badge variant="secondary" className="text-xs">Simple process</Badge>
          <h2 className="text-2xl font-bold">How It Works</h2>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {HOW_IT_WORKS.map((step, i) => (
            <div key={step.step} className="relative flex flex-col gap-3">
              {i < HOW_IT_WORKS.length - 1 && (
                <div className="hidden lg:block absolute top-5 left-full w-full h-px bg-gradient-to-r from-primary/30 to-transparent -translate-y-px z-0" />
              )}
              <div className="flex items-center gap-3">
                <div className="shrink-0 size-10 rounded-full bg-primary/10 ring-1 ring-primary/20 flex items-center justify-center">
                  <span className="text-sm font-black text-primary">{i + 1}</span>
                </div>
                <p className="font-semibold text-sm">{step.title}</p>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed pl-13">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Trust + Community */}
      <section className="grid gap-4 sm:grid-cols-2">
        <Card className="bg-gradient-to-br from-primary/5 to-purple-500/5 border-primary/20">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2 mb-1">
              <ShieldCheck className="size-5 text-primary" />
              <CardTitle className="text-base">Built for Privacy</CardTitle>
            </div>
            <CardDescription>Everything runs locally — your content never touches a server.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {TRUST_POINTS.map(p => (
              <div key={p} className="flex items-center gap-2 text-sm">
                <CheckCircle2 className="size-4 text-green-500 shrink-0" />
                {p}
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-500/5 to-cyan-500/5 border-blue-500/20">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2 mb-1">
              <Users className="size-5 text-blue-500" />
              <CardTitle className="text-base">Community Verification</CardTitle>
            </div>
            <CardDescription>Human intelligence layers over algorithmic detection.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground leading-relaxed">
              Vote on analyses, build reputation, and catch what the AI misses. High-reputation users earn "Expert Fact-Checker" status and their votes carry more weight.
            </p>
            <Button asChild variant="outline" size="sm" className="gap-1.5 text-blue-600 border-blue-500/30 hover:bg-blue-500/10">
              <Link to="/community">
                <Users className="size-3" /> Open Community
              </Link>
            </Button>
          </CardContent>
        </Card>
      </section>

      {/* CTA */}
      <section className="relative rounded-2xl overflow-hidden border border-primary/20">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-purple-500/5 to-pink-500/10" />
        <div className="relative text-center py-12 px-6 space-y-5">
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
            <Zap className="size-3" /> Ready in seconds
          </div>
          <h2 className="text-2xl font-bold">Ready to test it?</h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            Grab any news article, image, or audio clip you're unsure about and run it through RealityCheck right now.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button asChild size="lg" className="gap-2 shadow-lg shadow-primary/25">
              <Link to="/analyze"><ScanText className="size-4" /> Open Analyzer</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="gap-2">
              <Link to="/history"><History className="size-4" /> View History</Link>
            </Button>
          </div>
        </div>
      </section>

    </div>
  )
}
