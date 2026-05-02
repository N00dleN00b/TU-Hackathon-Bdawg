import { Link } from 'react-router-dom'
import {
  CheckCircle2, Clock, Cpu, Globe, Smartphone, Puzzle,
  GraduationCap, Building2, Phone, Camera, ScanText,
  Users, Zap, Brain, BookOpen, RefreshCw, Shield, FlaskConical, Lock, Layers,
} from 'lucide-react'
import { PageHeader, PageHeaderHeading, PageHeaderDescription } from '@/components/page-header'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

const BUILT_NOW = [
  { label: 'Text analysis — 11 manipulation signals', icon: ScanText },
  { label: 'Image forensics — EXIF + GAN fingerprinting', icon: Brain },
  { label: 'Video deepfake frame analysis', icon: Zap },
  { label: 'Audio voice-clone spectral detection', icon: Zap },
  { label: 'Groq LLaMA 3 AI enhancement layer', icon: Brain },
  { label: 'Crisis Mode — GDELT live headlines', icon: Shield },
  { label: 'Community voting with reputation weighting', icon: Users },
  { label: 'Explainable AI — "Why is this flagged?"', icon: BookOpen },
  { label: 'Text signal highlighting (XAI)', icon: ScanText },
  { label: 'Web Share Target — native mobile share sheet', icon: Smartphone },
  { label: 'Report-to-platform simulation', icon: Shield },
]

const PHASE_2 = [
  {
    icon: Puzzle,
    title: 'Browser Extension',
    description: 'Passive scan overlay on social feeds. Green checkmark or red shield appears over every image and video as you scroll. Right-click any media to "Analyze with RealityCheck" without leaving the page.',
    eta: 'Q3 2026',
  },
  {
    icon: Smartphone,
    title: 'Family Dashboard',
    description: 'Shared verification feed for households. Parents see what their kids are checking; kids help verify what parents found on Facebook. Trust is a team sport.',
    eta: 'Q3 2026',
  },
  {
    icon: Globe,
    title: 'Quick-Digest Mode',
    description: '"Seniors mode" — huge icons, voice-to-text input, plain-English verdicts. Instead of "GAN spectral anomaly," just: "This image was made by AI — don\'t share it." One button. Instant answer.',
    eta: 'Q4 2026',
  },
  {
    icon: Users,
    title: 'Gamification & Truth Streaks',
    description: '"Master Fact-Checker" badges, daily truth streaks, leaderboards. Turn the community voting system into something Gen Alpha actually wants to open every day.',
    eta: 'Q4 2026',
  },
]

const PHASE_3 = [
  {
    icon: Building2,
    title: 'Trust API for Publishers',
    description: 'Small news outlets can\'t afford deepfake detection. RealityCheck offers a free embeddable "Verified" badge they can add to articles. Every badge is a cryptographically signed attestation. Publishers gain trust. We gain distribution.',
    eta: '2027',
  },
  {
    icon: GraduationCap,
    title: 'Educational Partnerships',
    description: 'Pitch to school districts as a media literacy curriculum tool — the Duolingo for truth. Students use the Learn and Community tabs to practice identifying misinformation. Teachers get class dashboards.',
    eta: '2027',
  },
  {
    icon: Phone,
    title: 'Live Audio Shield',
    description: 'Move beyond uploaded files into real-time streams. A "Phone Call Shield" listens for AI-generated voice patterns (with explicit user consent) to prevent grandparent scams before the victim says "yes."',
    eta: '2027',
  },
  {
    icon: Camera,
    title: 'C2PA & Camera SDK',
    description: 'Partner with camera manufacturers to sign media at the point of capture using the C2PA standard. A photo taken on a RealityCheck-certified device carries a provenance receipt that can never be faked.',
    eta: '2028',
  },
]

const PHASE_4 = [
  {
    icon: Cpu,
    title: 'OS-Level Integration',
    description: 'Propose RealityCheck as a system service in mobile and desktop operating systems — the way spell-check is invisible infrastructure. Every file upload, every paste, every share: silently verified before it leaves your device.',
  },
  {
    icon: Globe,
    title: 'The Truth Standard',
    description: 'Work with the W3C and browser vendors to make media provenance verification a native browser API. The way HTTPS became the default expectation for security, "verified" becomes the default expectation for content.',
  },
]

const FLYWHEEL = [
  {
    step: '01',
    color: 'text-red-500',
    bg: 'bg-red-500/10',
    title: 'Detection (AI)',
    desc: 'The model catches technical glitches — GAN artifacts, spectral anomalies, linguistic patterns — that humans miss at scroll speed.',
  },
  {
    step: '02',
    color: 'text-blue-500',
    bg: 'bg-blue-500/10',
    title: 'Correction (Community)',
    desc: '"This isn\'t a deepfake — it\'s a clip from a 2010 movie." Human context layers over algorithmic detection. The community catches what the model misses.',
  },
  {
    step: '03',
    color: 'text-green-500',
    bg: 'bg-green-500/10',
    title: 'Education (Assistant)',
    desc: 'The AI explains why a piece of content was suspicious. The user becomes a better critical thinker. They catch the next fake before it\'s even submitted.',
  },
]

export default function Roadmap() {
  return (
    <div className="space-y-10 pb-8">
      <PageHeader>
        <PageHeaderHeading>Product Roadmap</PageHeaderHeading>
        <PageHeaderDescription>
          From a hackathon prototype to the default trust layer of the internet.
          Every phase builds on the last — detection feeds correction, correction enables education.
        </PageHeaderDescription>
      </PageHeader>

      {/* Flywheel */}
      <section>
        <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
          <RefreshCw className="size-4 text-primary" />
          The Flywheel
        </h2>
        <div className="grid gap-4 sm:grid-cols-3">
          {FLYWHEEL.map(f => (
            <div key={f.step} className={`rounded-xl p-5 ${f.bg} space-y-2`}>
              <span className={`text-3xl font-black ${f.color} opacity-40`}>{f.step}</span>
              <p className={`font-bold text-sm ${f.color}`}>{f.title}</p>
              <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Phase 1 — Now */}
      <section>
        <div className="flex items-center gap-3 mb-4">
          <h2 className="text-lg font-bold">Phase 1 — Built at this Hackathon</h2>
          <Badge className="bg-green-500/20 text-green-700 dark:text-green-400 border-green-500/30">Live now</Badge>
        </div>
        <Card>
          <CardContent className="pt-5 pb-5">
            <div className="grid gap-2 sm:grid-cols-2">
              {BUILT_NOW.map(item => (
                <div key={item.label} className="flex items-center gap-2.5 text-sm">
                  <CheckCircle2 className="size-4 text-green-500 shrink-0" />
                  {item.label}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Research Foundation */}
      <section>
        <div className="flex items-center gap-3 mb-4">
          <h2 className="text-lg font-bold">Technical Research Foundation</h2>
          <Badge className="bg-indigo-500/20 text-indigo-700 dark:text-indigo-400 border-indigo-500/30">
            <FlaskConical className="size-3 mr-1" /> 2024–2026 Literature
          </Badge>
        </div>
        <div className="space-y-4">

          {/* C2PA */}
          <Card className="border-indigo-200/30 dark:border-indigo-900/30">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2 mb-1">
                <div className="rounded-lg p-1.5 bg-indigo-500/10">
                  <Lock className="size-4 text-indigo-500" />
                </div>
                <CardTitle className="text-sm">Cryptographic Provenance & C2PA</CardTitle>
              </div>
              <CardDescription className="text-xs leading-relaxed">
                The Coalition for Content Provenance and Authenticity (C2PA) creates cryptographically signed "manifests" for digital assets,
                declaring their creation and editing history using Digital Signature Algorithms (DSAs).
                A critical vulnerability identified in 2026 is the <strong>"Integrity Clash"</strong> — a valid C2PA manifest asserting human
                authorship while the underlying pixels remain AI-generated. Researchers propose a{' '}
                <strong>cross-layer audit protocol</strong> that jointly evaluates external metadata and internal watermark status,
                achieving near 100% classification accuracy on contradictory signals.
              </CardDescription>
            </CardHeader>
          </Card>

          {/* Modality table */}
          <Card className="border-indigo-200/30 dark:border-indigo-900/30">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2 mb-1">
                <div className="rounded-lg p-1.5 bg-indigo-500/10">
                  <Layers className="size-4 text-indigo-500" />
                </div>
                <CardTitle className="text-sm">Modality-Specific Metadata Strategies</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="overflow-x-auto">
                <table className="w-full text-xs border-collapse">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 pr-4 font-semibold text-muted-foreground">Modality</th>
                      <th className="text-left py-2 pr-4 font-semibold text-muted-foreground">Strategy</th>
                      <th className="text-left py-2 font-semibold text-muted-foreground">Limitation</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {[
                      { m: 'Image', s: 'JUMBF (JPEG Universal Metadata Box Format) for secure provenance tracking', l: 'Stripped during social media compression or re-saving' },
                      { m: 'Video', s: 'Hybrid DWT + SVD watermarking to embed signatures in frequency domain', l: 'High computational cost for real-time verification' },
                      { m: 'Text', s: 'Linguistic metadata (perplexity, burstiness) + RoBERTa global embeddings', l: 'Raw text lacks a dedicated metadata container' },
                      { m: 'Audio', s: 'Cryptographic inaudible watermarking (e.g. Meta Seal)', l: 'Susceptible to transcoding and noise injection' },
                    ].map(row => (
                      <tr key={row.m} className="text-muted-foreground">
                        <td className="py-2 pr-4 font-medium text-foreground">{row.m}</td>
                        <td className="py-2 pr-4">{row.s}</td>
                        <td className="py-2">{row.l}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* PQC + Blockchain + ML */}
          <div className="grid gap-4 sm:grid-cols-2">
            <Card className="border-indigo-200/30 dark:border-indigo-900/30">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2 mb-1">
                  <div className="rounded-lg p-1.5 bg-indigo-500/10">
                    <Shield className="size-4 text-indigo-500" />
                  </div>
                  <CardTitle className="text-sm">Post-Quantum & Blockchain</CardTitle>
                </div>
                <CardDescription className="text-xs leading-relaxed">
                  NIST-standardized post-quantum algorithms (<strong>Dilithium, Falcon, SPHINCS+</strong>) protect signatures
                  against quantum computing attacks. Decentralized ledgers store content fingerprints (hashes) for
                  non-repudiation — once a creator's manifest is anchored on-chain, origin cannot be denied.
                  (MDPI, 2025)
                </CardDescription>
              </CardHeader>
            </Card>
            <Card className="border-indigo-200/30 dark:border-indigo-900/30">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2 mb-1">
                  <div className="rounded-lg p-1.5 bg-indigo-500/10">
                    <Brain className="size-4 text-indigo-500" />
                  </div>
                  <CardTitle className="text-sm">ML Interpretability (XAI)</CardTitle>
                </div>
                <CardDescription className="text-xs leading-relaxed">
                  Integrating metadata signals (file creation parameters, software versions) into transformer attention layers
                  achieves 98% detection accuracy. <strong>SHAP and LIME</strong> are applied to metadata models to confirm
                  which features — entropy, header anomalies — drive the "AI-generated" classification.
                  RealityCheck's "Why is this flagged?" section is built on this principle.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>

          <p className="text-xs text-muted-foreground px-1">
            Primary reference: Zhao et al. (2024), "SoK: Watermarking for AI-Generated Content," arXiv:2411.18479 (84 citations).
            Detection benchmark: DFDC / MNW (Microsoft-Northwestern-WITNESS, April 2026).
            Algorithm backbone target: EfficientNet / ViT with GenD layer-norm fine-tuning.
          </p>
        </div>
      </section>

      {/* Phase 2 */}
      <section>
        <div className="flex items-center gap-3 mb-4">
          <h2 className="text-lg font-bold">Phase 2 — Distribution</h2>
          <Badge variant="outline" className="text-blue-600 dark:text-blue-400 border-blue-400">
            <Clock className="size-3 mr-1" /> 3–6 months
          </Badge>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {PHASE_2.map(item => (
            <Card key={item.title} className="border-blue-200/30 dark:border-blue-900/30">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2 mb-1">
                  <div className="rounded-lg p-1.5 bg-blue-500/10">
                    <item.icon className="size-4 text-blue-500" />
                  </div>
                  <CardTitle className="text-sm">{item.title}</CardTitle>
                  <Badge variant="outline" className="ml-auto text-[10px]">{item.eta}</Badge>
                </div>
                <CardDescription className="text-xs leading-relaxed">{item.description}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </section>

      {/* Phase 3 */}
      <section>
        <div className="flex items-center gap-3 mb-4">
          <h2 className="text-lg font-bold">Phase 3 — Infrastructure</h2>
          <Badge variant="outline" className="text-purple-600 dark:text-purple-400 border-purple-400">
            <Clock className="size-3 mr-1" /> 6–18 months
          </Badge>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {PHASE_3.map(item => (
            <Card key={item.title} className="border-purple-200/30 dark:border-purple-900/30">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2 mb-1">
                  <div className="rounded-lg p-1.5 bg-purple-500/10">
                    <item.icon className="size-4 text-purple-500" />
                  </div>
                  <CardTitle className="text-sm">{item.title}</CardTitle>
                  <Badge variant="outline" className="ml-auto text-[10px]">{item.eta}</Badge>
                </div>
                <CardDescription className="text-xs leading-relaxed">{item.description}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </section>

      {/* Phase 4 — The Endgame */}
      <section>
        <div className="flex items-center gap-3 mb-4">
          <h2 className="text-lg font-bold">Phase 4 — The Standard</h2>
          <Badge variant="outline" className="text-amber-600 dark:text-amber-400 border-amber-400">
            <Clock className="size-3 mr-1" /> 2+ years
          </Badge>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {PHASE_4.map(item => (
            <Card key={item.title} className="border-amber-200/30 dark:border-amber-900/30">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2 mb-1">
                  <div className="rounded-lg p-1.5 bg-amber-500/10">
                    <item.icon className="size-4 text-amber-500" />
                  </div>
                  <CardTitle className="text-sm">{item.title}</CardTitle>
                </div>
                <CardDescription className="text-xs leading-relaxed">{item.description}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </section>

      {/* Endgame vision */}
      <section className="rounded-xl border bg-gradient-to-br from-primary/5 to-primary/10 p-6 text-center space-y-3">
        <Cpu className="size-10 mx-auto text-primary/50" />
        <h2 className="text-xl font-bold">The Endpoint</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          The goal isn't a website people have to remember to visit.
          The goal is <strong>Truth as a default setting of the internet</strong> — integrated into camera firmware,
          OS file systems, and browser engines, the way HTTPS became infrastructure.
          RealityCheck is the prototype that proves it's possible.
        </p>
        <div className="flex gap-3 justify-center pt-2">
          <Button asChild size="lg">
            <Link to="/analyze"><ScanText className="size-4 mr-2" /> See it working now</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link to="/learn"><BookOpen className="size-4 mr-2" /> Media Literacy Hub</Link>
          </Button>
        </div>
      </section>
    </div>
  )
}
