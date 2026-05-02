import { useState, useRef, useCallback } from 'react'
import { Loader2, ScanText, Image as ImageIcon, Sparkles, Wrench, ChevronDown, ChevronUp, Key, UploadCloud, X } from 'lucide-react'
import { PageHeader, PageHeaderHeading, PageHeaderDescription } from '@/components/page-header'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { TrustMeter } from '@/components/TrustMeter'
import { SignalList } from '@/components/SignalList'
import { analyzeText } from '@/lib/textAnalysis'
import { analyzeImage } from '@/lib/imageAnalysis'
import { enhanceWithGroq } from '@/lib/groqClient'
import { saveAnalysis, generateId } from '@/lib/storage'
import type { AnalysisResult } from '@/lib/types'

const SAMPLE_TEXTS = [
  {
    label: 'Suspicious article',
    text: `BREAKING: SHOCKING BOMBSHELL EXPOSED!!! Deep state operatives are SECRETLY poisoning water supplies across the country, and mainstream media is REFUSING to cover it!!! Sources say the government has known for years. Many people are saying this is the biggest cover-up of our generation. Wake up sheeple! Share before this gets CENSORED! They don't want you to know the TRUTH. Everyone knows the elites are behind this. If you disagree you're part of the problem!!!`
  },
  {
    label: 'Credible article',
    text: `According to a new study published in the New England Journal of Medicine on April 15, 2025, researchers at Johns Hopkins University found that regular exercise reduces the risk of cardiovascular disease by 35%. The study, led by Dr. Sarah Chen, followed 12,000 participants over 10 years. "Our findings confirm what previous research has suggested, but with a much larger sample size," Dr. Chen said in an official statement. The research was funded by the National Institutes of Health. Full data is available at nejm.org.`
  }
]

export default function Analyzer() {
  const [activeTab, setActiveTab] = useState('text')
  const [text, setText] = useState('')
  const [groqKey, setGroqKey] = useState(() => localStorage.getItem('truthlens_groq_key') ?? '')
  const [showApiKey, setShowApiKey] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const [showAllSignals, setShowAllSignals] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const saveKey = (key: string) => {
    setGroqKey(key)
    if (key) localStorage.setItem('truthlens_groq_key', key)
    else localStorage.removeItem('truthlens_groq_key')
  }

  const handleImageSelect = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file (JPG, PNG, WebP, etc.)')
      return
    }
    setImageFile(file)
    const url = URL.createObjectURL(file)
    setImagePreview(url)
    setResult(null)
    setError(null)
  }

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file) handleImageSelect(file)
  }, [])

  const clearImage = () => {
    setImageFile(null)
    if (imagePreview) URL.revokeObjectURL(imagePreview)
    setImagePreview(null)
    setResult(null)
  }

  const analyzeContent = async () => {
    setError(null)
    setResult(null)
    setIsAnalyzing(true)

    try {
      let baseResult: Omit<AnalysisResult, 'id' | 'timestamp' | 'aiEnhanced'>

      if (activeTab === 'text') {
        if (!text.trim() || text.trim().length < 20) {
          setError('Please enter at least 20 characters of text to analyze.')
          setIsAnalyzing(false)
          return
        }
        baseResult = analyzeText(text)

        // Optionally enhance with Groq AI
        if (groqKey) {
          const enhancement = await enhanceWithGroq(text, groqKey)
          if (enhancement) {
            baseResult = {
              ...baseResult,
              trustScore: Math.round((baseResult.trustScore + enhancement.trustScore) / 2),
              summary: enhancement.summary,
              manipulationTools: [
                ...new Set([...baseResult.manipulationTools, ...enhancement.manipulationTools])
              ]
            }
          }
        }
      } else {
        if (!imageFile) {
          setError('Please select an image to analyze.')
          setIsAnalyzing(false)
          return
        }
        baseResult = await analyzeImage(imageFile)
      }

      const finalResult: AnalysisResult = {
        ...baseResult,
        id: generateId(),
        timestamp: new Date().toISOString(),
        aiEnhanced: activeTab === 'text' && !!groqKey
      }

      saveAnalysis(finalResult)
      setResult(finalResult)
    } catch (err) {
      console.error(err)
      setError('Analysis failed. Please try again.')
    } finally {
      setIsAnalyzing(false)
    }
  }

  const flaggedCount = result?.signals.filter(s => s.found && s.severity !== 'low').length ?? 0

  return (
    <>
      <PageHeader>
        <PageHeaderHeading>Analyzer</PageHeaderHeading>
        <PageHeaderDescription>
          Paste news text or upload an image to detect manipulation signals and get a trust score.
        </PageHeaderDescription>
      </PageHeader>

      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        {/* Input panel */}
        <div className="space-y-4">
          <Card>
            <CardContent className="pt-6">
              <Tabs value={activeTab} onValueChange={tab => { setActiveTab(tab); setResult(null); setError(null) }}>
                <TabsList className="mb-4 w-full">
                  <TabsTrigger value="text" className="flex-1 gap-2">
                    <ScanText className="size-4" /> Text / Article
                  </TabsTrigger>
                  <TabsTrigger value="image" className="flex-1 gap-2">
                    <ImageIcon className="size-4" /> Image
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="text" className="space-y-3">
                  <Textarea
                    placeholder="Paste a news article, social media post, or any text you want to verify..."
                    className="min-h-[220px] resize-y text-sm"
                    value={text}
                    onChange={e => setText(e.target.value)}
                  />
                  <div className="flex flex-wrap gap-2">
                    <p className="text-xs text-muted-foreground self-center">Try a sample:</p>
                    {SAMPLE_TEXTS.map(s => (
                      <Button
                        key={s.label}
                        variant="outline"
                        size="sm"
                        className="text-xs h-7"
                        onClick={() => { setText(s.text); setResult(null) }}
                      >
                        {s.label}
                      </Button>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="image" className="space-y-3">
                  {!imagePreview ? (
                    <div
                      className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
                        ${dragOver ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50 hover:bg-muted/30'}`}
                      onDragOver={e => { e.preventDefault(); setDragOver(true) }}
                      onDragLeave={() => setDragOver(false)}
                      onDrop={handleDrop}
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <UploadCloud className="size-10 mx-auto text-muted-foreground mb-3" />
                      <p className="font-medium">Drop an image here or click to browse</p>
                      <p className="text-xs text-muted-foreground mt-1">JPG, PNG, WebP, HEIC supported</p>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={e => e.target.files?.[0] && handleImageSelect(e.target.files[0])}
                      />
                    </div>
                  ) : (
                    <div className="relative rounded-lg overflow-hidden border">
                      <img
                        src={imagePreview}
                        alt="Selected"
                        className="w-full max-h-64 object-contain bg-muted/20"
                      />
                      <Button
                        variant="secondary"
                        size="icon"
                        className="absolute top-2 right-2 size-7"
                        onClick={clearImage}
                      >
                        <X className="size-4" />
                      </Button>
                      <div className="p-3 bg-muted/30">
                        <p className="text-xs font-medium truncate">{imageFile?.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {imageFile ? (imageFile.size / 1024).toFixed(0) : 0} KB · {imageFile?.type}
                        </p>
                      </div>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Groq AI Key */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Sparkles className="size-4 text-purple-500" />
                AI Enhancement (Optional)
              </CardTitle>
              <CardDescription className="text-xs">
                Add a free Groq API key for deeper AI-powered analysis. Get one free at{' '}
                <a href="https://console.groq.com" target="_blank" rel="noreferrer" className="underline underline-offset-2">
                  console.groq.com
                </a>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <div className="flex-1">
                  <Label htmlFor="groq-key" className="sr-only">Groq API Key</Label>
                  <Input
                    id="groq-key"
                    type={showApiKey ? 'text' : 'password'}
                    placeholder="gsk_..."
                    value={groqKey}
                    onChange={e => saveKey(e.target.value)}
                    className="font-mono text-xs"
                  />
                </div>
                <Button variant="ghost" size="icon" onClick={() => setShowApiKey(v => !v)}>
                  <Key className="size-4" />
                </Button>
              </div>
              {groqKey && (
                <p className="text-xs text-green-600 dark:text-green-400 mt-2 flex items-center gap-1">
                  <Sparkles className="size-3" /> AI enhancement active
                </p>
              )}
            </CardContent>
          </Card>

          {error && (
            <Alert variant="destructive">
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Button
            onClick={analyzeContent}
            disabled={isAnalyzing}
            className="w-full"
            size="lg"
          >
            {isAnalyzing ? (
              <><Loader2 className="size-4 animate-spin" /> Analyzing...</>
            ) : (
              <><ScanText className="size-4" /> Analyze Now</>
            )}
          </Button>
        </div>

        {/* Results panel */}
        <div className="space-y-4">
          {!result && !isAnalyzing && (
            <Card className="border-dashed">
              <CardContent className="pt-8 pb-8 text-center">
                <ScanText className="size-12 mx-auto text-muted-foreground/40 mb-3" />
                <p className="text-sm text-muted-foreground">
                  Results will appear here after analysis
                </p>
              </CardContent>
            </Card>
          )}

          {isAnalyzing && (
            <Card>
              <CardContent className="pt-8 pb-8 flex flex-col items-center gap-4">
                <Loader2 className="size-10 animate-spin text-primary" />
                <div className="text-center">
                  <p className="font-medium text-sm">Analyzing content...</p>
                  <p className="text-xs text-muted-foreground mt-1">Checking {groqKey ? '11 signals + AI analysis' : '11 signals'}</p>
                </div>
              </CardContent>
            </Card>
          )}

          {result && !isAnalyzing && (
            <>
              {/* Trust score */}
              <Card>
                <CardContent className="pt-6 flex flex-col items-center gap-4">
                  <TrustMeter score={result.trustScore} verdict={result.verdict} size="lg" />
                  {result.aiEnhanced && (
                    <Badge variant="secondary" className="text-xs gap-1">
                      <Sparkles className="size-3 text-purple-500" /> AI Enhanced
                    </Badge>
                  )}
                  <p className="text-sm text-muted-foreground text-center leading-relaxed px-2">
                    {result.summary}
                  </p>
                </CardContent>
              </Card>

              {/* Signals */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center justify-between">
                    <span>Detection Signals</span>
                    <Badge variant="outline" className="text-xs">
                      {flaggedCount} flagged
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <SignalList signals={result.signals} showAll={showAllSignals} />
                  <Button
                    variant="ghost"
                    size="sm"
                    className="mt-3 w-full text-xs text-muted-foreground"
                    onClick={() => setShowAllSignals(v => !v)}
                  >
                    {showAllSignals ? (
                      <><ChevronUp className="size-3" /> Show fewer</>
                    ) : (
                      <><ChevronDown className="size-3" /> Show all signals</>
                    )}
                  </Button>
                </CardContent>
              </Card>

              {/* Manipulation tools */}
              {result.manipulationTools.length > 0 && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Wrench className="size-4 text-orange-500" />
                      Likely Manipulation Tools
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Based on detected patterns, these tools or techniques may have been used.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-1.5">
                      {result.manipulationTools.map((tool, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm">
                          <span className="text-orange-500 mt-0.5 shrink-0">•</span>
                          {tool}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              <Button
                variant="outline"
                className="w-full text-xs"
                onClick={() => { setResult(null); setText(''); clearImage() }}
              >
                Clear & Analyze New Content
              </Button>
            </>
          )}
        </div>
      </div>
    </>
  )
}
