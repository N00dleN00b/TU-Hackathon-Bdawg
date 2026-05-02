import { useState, useRef, useCallback } from 'react'
import {
  Loader2, ScanText, Image as ImageIcon, Sparkles, Wrench,
  ChevronDown, ChevronUp, Key, UploadCloud, X, AlertTriangle,
  Film, Mic,
} from 'lucide-react'
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
import { VideoResultCard } from '@/components/VideoResultCard'
import { AudioResultCard } from '@/components/AudioResultCard'
import { analyzeText } from '@/lib/textAnalysis'
import { analyzeImage } from '@/lib/imageAnalysis'
import { analyzeVideo } from '@/lib/video-detection'
import { analyzeAudio } from '@/lib/audio-forensics'
import { enhanceWithGroq } from '@/lib/groqClient'
import { saveAnalysis, generateId } from '@/lib/storage'
import { matchesCrisis, logMediaAlert } from '@/lib/crisis'
import type { AnalysisResult } from '@/lib/types'
import type { VideoAnalysis } from '@/lib/video-detection'
import type { AudioAnalysis } from '@/lib/audio-forensics'

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

const ANALYZING_MESSAGES: Record<string, string> = {
  text: '11 signals + optional AI analysis',
  image: 'EXIF metadata + GAN fingerprinting (11 signals)',
  video: 'Frame-by-frame deepfake indicators',
  audio: 'Spectral analysis + voice cloning detection',
}

export default function Analyzer() {
  const [activeTab, setActiveTab] = useState('text')

  // Text
  const [text, setText] = useState('')

  // Image
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [dragOverImage, setDragOverImage] = useState(false)
  const imageInputRef = useRef<HTMLInputElement>(null)

  // Video
  const [videoFile, setVideoFile] = useState<File | null>(null)
  const [dragOverVideo, setDragOverVideo] = useState(false)
  const videoInputRef = useRef<HTMLInputElement>(null)

  // Audio
  const [audioFile, setAudioFile] = useState<File | null>(null)
  const [dragOverAudio, setDragOverAudio] = useState(false)
  const audioInputRef = useRef<HTMLInputElement>(null)

  // Groq
  const [groqKey, setGroqKey] = useState(() => localStorage.getItem('truthlens_groq_key') ?? '')
  const [showApiKey, setShowApiKey] = useState(false)

  // State
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const [videoResult, setVideoResult] = useState<VideoAnalysis | null>(null)
  const [audioResult, setAudioResult] = useState<AudioAnalysis | null>(null)
  const [showAllSignals, setShowAllSignals] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [crisisAlert, setCrisisAlert] = useState<string | null>(null)

  const saveKey = (key: string) => {
    setGroqKey(key)
    if (key) localStorage.setItem('truthlens_groq_key', key)
    else localStorage.removeItem('truthlens_groq_key')
  }

  const clearAllResults = () => {
    setResult(null)
    setVideoResult(null)
    setAudioResult(null)
    setError(null)
    setCrisisAlert(null)
  }

  const handleTabChange = (tab: string) => {
    setActiveTab(tab)
    clearAllResults()
  }

  // ---- Image handlers ----
  const handleImageSelect = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file (JPG, PNG, WebP, etc.)')
      return
    }
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
    clearAllResults()
  }

  const handleImageDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOverImage(false)
    const file = e.dataTransfer.files[0]
    if (file) handleImageSelect(file)
  }, [])

  const clearImage = () => {
    setImageFile(null)
    if (imagePreview) URL.revokeObjectURL(imagePreview)
    setImagePreview(null)
    setResult(null)
  }

  // ---- Video handlers ----
  const handleVideoSelect = (file: File) => {
    const allowed = ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo', 'video/mpeg']
    if (!allowed.includes(file.type) && !file.name.match(/\.(mp4|webm|mov|avi|mkv)$/i)) {
      setError('Please upload a video file (MP4, WebM, MOV, AVI).')
      return
    }
    setVideoFile(file)
    clearAllResults()
  }

  const handleVideoDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOverVideo(false)
    const file = e.dataTransfer.files[0]
    if (file) handleVideoSelect(file)
  }, [])

  const clearVideo = () => {
    setVideoFile(null)
    setVideoResult(null)
  }

  // ---- Audio handlers ----
  const handleAudioSelect = (file: File) => {
    if (!file.type.startsWith('audio/') && !file.name.match(/\.(mp3|wav|ogg|flac|m4a|aac|opus)$/i)) {
      setError('Please upload an audio file (MP3, WAV, OGG, FLAC, M4A).')
      return
    }
    setAudioFile(file)
    clearAllResults()
  }

  const handleAudioDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOverAudio(false)
    const file = e.dataTransfer.files[0]
    if (file) handleAudioSelect(file)
  }, [])

  const clearAudio = () => {
    setAudioFile(null)
    setAudioResult(null)
  }

  // ---- Core analysis ----
  const analyzeContent = async () => {
    setError(null)
    clearAllResults()
    setIsAnalyzing(true)

    try {
      if (activeTab === 'text') {
        if (!text.trim() || text.trim().length < 20) {
          setError('Please enter at least 20 characters of text to analyze.')
          return
        }
        let baseResult = analyzeText(text)

        if (groqKey) {
          const enhancement = await enhanceWithGroq(text, groqKey)
          if (enhancement) {
            baseResult = {
              ...baseResult,
              trustScore: Math.round((baseResult.trustScore + enhancement.trustScore) / 2),
              summary: enhancement.summary,
              manipulationTools: [...new Set([...baseResult.manipulationTools, ...enhancement.manipulationTools])]
            }
          }
        }

        const finalResult: AnalysisResult = {
          ...baseResult,
          id: generateId(),
          timestamp: new Date().toISOString(),
          aiEnhanced: !!groqKey,
        }
        saveAnalysis(finalResult)
        setResult(finalResult)

        const crisis = matchesCrisis(text)
        if (crisis) {
          setCrisisAlert(crisis.title)
          logMediaAlert(text.slice(0, 100), crisis, finalResult.id, finalResult.trustScore)
        }

      } else if (activeTab === 'image') {
        if (!imageFile) { setError('Please select an image to analyze.'); return }
        const baseResult = await analyzeImage(imageFile)
        const finalResult: AnalysisResult = {
          ...baseResult,
          id: generateId(),
          timestamp: new Date().toISOString(),
          aiEnhanced: false,
        }
        saveAnalysis(finalResult)
        setResult(finalResult)

      } else if (activeTab === 'video') {
        if (!videoFile) { setError('Please select a video file to analyze.'); return }
        const vResult = await analyzeVideo(videoFile)
        setVideoResult(vResult)

        // Save a lightweight record to history
        const record: AnalysisResult = {
          id: generateId(),
          type: 'video',
          timestamp: new Date().toISOString(),
          trustScore: Math.round(100 - vResult.confidence),
          verdict: vResult.suspect ? 'manipulated' : 'reliable',
          summary: vResult.summary,
          signals: [],
          manipulationTools: vResult.issues.map(i => i.type.replace(/_/g, ' ')),
          contentPreview: videoFile.name,
          aiEnhanced: false,
        }
        saveAnalysis(record)

      } else if (activeTab === 'audio') {
        if (!audioFile) { setError('Please select an audio file to analyze.'); return }
        const aResult = await analyzeAudio(audioFile)
        setAudioResult(aResult)

        const record: AnalysisResult = {
          id: generateId(),
          type: 'audio',
          timestamp: new Date().toISOString(),
          trustScore: Math.round(100 - aResult.confidence),
          verdict: aResult.isSynthetic ? 'manipulated' : 'reliable',
          summary: aResult.summary,
          signals: [],
          manipulationTools: aResult.signals.filter(s => s.detected).map(s => s.label),
          contentPreview: audioFile.name,
          aiEnhanced: false,
        }
        saveAnalysis(record)
      }
    } catch (err) {
      console.error(err)
      setError('Analysis failed. Please try again.')
    } finally {
      setIsAnalyzing(false)
    }
  }

  const hasResult = result || videoResult || audioResult
  const flaggedCount = result?.signals.filter(s => s.found && s.severity !== 'low').length ?? 0

  // ---- Shared file drop zone ----
  const DropZone = ({
    dragOver, onDragOver, onDragLeave, onDrop, onClick, accept, hint,
    icon: Icon,
  }: {
    dragOver: boolean
    onDragOver: (e: React.DragEvent) => void
    onDragLeave: () => void
    onDrop: (e: React.DragEvent) => void
    onClick: () => void
    accept: string
    hint: string
    icon: React.ElementType
  }) => (
    <div
      className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
        ${dragOver ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50 hover:bg-muted/30'}`}
      onDragOver={e => { e.preventDefault(); onDragOver(e) }}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      onClick={onClick}
    >
      <Icon className="size-10 mx-auto text-muted-foreground mb-3" />
      <p className="font-medium">Drop a file here or click to browse</p>
      <p className="text-xs text-muted-foreground mt-1">{hint}</p>
      <input type="file" accept={accept} className="hidden" ref={undefined} />
    </div>
  )

  return (
    <>
      <PageHeader>
        <PageHeaderHeading>Analyzer</PageHeaderHeading>
        <PageHeaderDescription>
          Detect manipulation in text, images, video, and audio using multi-modal forensic analysis.
        </PageHeaderDescription>
      </PageHeader>

      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        {/* Input panel */}
        <div className="space-y-4">
          <Card>
            <CardContent className="pt-6">
              <Tabs value={activeTab} onValueChange={handleTabChange}>
                <TabsList className="mb-4 w-full grid grid-cols-4">
                  <TabsTrigger value="text" className="gap-1.5 text-xs sm:text-sm">
                    <ScanText className="size-4" />
                    <span className="hidden sm:inline">Text</span>
                  </TabsTrigger>
                  <TabsTrigger value="image" className="gap-1.5 text-xs sm:text-sm">
                    <ImageIcon className="size-4" />
                    <span className="hidden sm:inline">Image</span>
                  </TabsTrigger>
                  <TabsTrigger value="video" className="gap-1.5 text-xs sm:text-sm">
                    <Film className="size-4" />
                    <span className="hidden sm:inline">Video</span>
                  </TabsTrigger>
                  <TabsTrigger value="audio" className="gap-1.5 text-xs sm:text-sm">
                    <Mic className="size-4" />
                    <span className="hidden sm:inline">Audio</span>
                  </TabsTrigger>
                </TabsList>

                {/* ---- TEXT ---- */}
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
                        onClick={() => { setText(s.text); clearAllResults() }}
                      >
                        {s.label}
                      </Button>
                    ))}
                  </div>
                </TabsContent>

                {/* ---- IMAGE ---- */}
                <TabsContent value="image" className="space-y-3">
                  {!imagePreview ? (
                    <>
                      <div
                        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
                          ${dragOverImage ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50 hover:bg-muted/30'}`}
                        onDragOver={e => { e.preventDefault(); setDragOverImage(true) }}
                        onDragLeave={() => setDragOverImage(false)}
                        onDrop={handleImageDrop}
                        onClick={() => imageInputRef.current?.click()}
                      >
                        <UploadCloud className="size-10 mx-auto text-muted-foreground mb-3" />
                        <p className="font-medium">Drop an image here or click to browse</p>
                        <p className="text-xs text-muted-foreground mt-1">JPG, PNG, WebP, HEIC · EXIF + GAN fingerprinting</p>
                        <input
                          ref={imageInputRef}
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={e => e.target.files?.[0] && handleImageSelect(e.target.files[0])}
                        />
                      </div>
                    </>
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

                {/* ---- VIDEO ---- */}
                <TabsContent value="video" className="space-y-3">
                  {!videoFile ? (
                    <div
                      className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
                        ${dragOverVideo ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50 hover:bg-muted/30'}`}
                      onDragOver={e => { e.preventDefault(); setDragOverVideo(true) }}
                      onDragLeave={() => setDragOverVideo(false)}
                      onDrop={handleVideoDrop}
                      onClick={() => videoInputRef.current?.click()}
                    >
                      <Film className="size-10 mx-auto text-muted-foreground mb-3" />
                      <p className="font-medium">Drop a video here or click to browse</p>
                      <p className="text-xs text-muted-foreground mt-1">MP4, WebM, MOV, AVI · frame-by-frame deepfake analysis</p>
                      <input
                        ref={videoInputRef}
                        type="file"
                        accept="video/*,.mkv"
                        className="hidden"
                        onChange={e => e.target.files?.[0] && handleVideoSelect(e.target.files[0])}
                      />
                    </div>
                  ) : (
                    <div className="flex items-center gap-3 p-4 rounded-lg border bg-muted/20">
                      <Film className="size-8 text-muted-foreground shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{videoFile.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {(videoFile.size / (1024 * 1024)).toFixed(1)} MB · {videoFile.type || 'video'}
                        </p>
                      </div>
                      <Button variant="ghost" size="icon" className="size-7 shrink-0" onClick={clearVideo}>
                        <X className="size-4" />
                      </Button>
                    </div>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Analyzes facial swaps, lip-sync misalignment, expression inconsistencies, and compression artifacts.
                  </p>
                </TabsContent>

                {/* ---- AUDIO ---- */}
                <TabsContent value="audio" className="space-y-3">
                  {!audioFile ? (
                    <div
                      className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
                        ${dragOverAudio ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50 hover:bg-muted/30'}`}
                      onDragOver={e => { e.preventDefault(); setDragOverAudio(true) }}
                      onDragLeave={() => setDragOverAudio(false)}
                      onDrop={handleAudioDrop}
                      onClick={() => audioInputRef.current?.click()}
                    >
                      <Mic className="size-10 mx-auto text-muted-foreground mb-3" />
                      <p className="font-medium">Drop an audio file here or click to browse</p>
                      <p className="text-xs text-muted-foreground mt-1">MP3, WAV, OGG, FLAC, M4A · voice cloning detection</p>
                      <input
                        ref={audioInputRef}
                        type="file"
                        accept="audio/*,.flac"
                        className="hidden"
                        onChange={e => e.target.files?.[0] && handleAudioSelect(e.target.files[0])}
                      />
                    </div>
                  ) : (
                    <div className="flex items-center gap-3 p-4 rounded-lg border bg-muted/20">
                      <Mic className="size-8 text-muted-foreground shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{audioFile.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {(audioFile.size / (1024 * 1024)).toFixed(1)} MB · {audioFile.type || 'audio'}
                        </p>
                      </div>
                      <Button variant="ghost" size="icon" className="size-7 shrink-0" onClick={clearAudio}>
                        <X className="size-4" />
                      </Button>
                    </div>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Detects voice cloning via spectral flatness, pitch regularity, noise floor, and dynamic range analysis.
                  </p>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Groq AI key — only relevant for text */}
          {activeTab === 'text' && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Sparkles className="size-4 text-purple-500" />
                  AI Enhancement (Optional)
                </CardTitle>
                <CardDescription className="text-xs">
                  Add a free Groq API key for deeper AI-powered text analysis. Get one at{' '}
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
          )}

          {error && (
            <Alert variant="destructive">
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {crisisAlert && (
            <Alert variant="destructive" className="border-red-300">
              <AlertTriangle className="size-4" />
              <AlertTitle>Crisis Mode Alert</AlertTitle>
              <AlertDescription>
                This content matches an active monitoring alert: <strong>{crisisAlert}</strong>.
                Check the Crisis Mode page for related verification efforts.
              </AlertDescription>
            </Alert>
          )}

          <Button onClick={analyzeContent} disabled={isAnalyzing} className="w-full" size="lg">
            {isAnalyzing ? (
              <><Loader2 className="size-4 animate-spin" /> Analyzing...</>
            ) : (
              <><ScanText className="size-4" /> Analyze Now</>
            )}
          </Button>
        </div>

        {/* Results panel */}
        <div className="space-y-4">
          {!hasResult && !isAnalyzing && (
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
                  <p className="text-xs text-muted-foreground mt-1">
                    Checking {ANALYZING_MESSAGES[activeTab] ?? 'signals'}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Video results */}
          {videoResult && !isAnalyzing && activeTab === 'video' && (
            <>
              <VideoResultCard result={videoResult} />
              <Button
                variant="outline"
                className="w-full text-xs"
                onClick={() => { setVideoResult(null); clearVideo() }}
              >
                Clear & Analyze New Content
              </Button>
            </>
          )}

          {/* Audio results */}
          {audioResult && !isAnalyzing && activeTab === 'audio' && (
            <>
              <AudioResultCard result={audioResult} />
              <Button
                variant="outline"
                className="w-full text-xs"
                onClick={() => { setAudioResult(null); clearAudio() }}
              >
                Clear & Analyze New Content
              </Button>
            </>
          )}

          {/* Text / Image results */}
          {result && !isAnalyzing && (activeTab === 'text' || activeTab === 'image') && (
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
                  {activeTab === 'image' && result.ganConfidence !== undefined && result.ganConfidence > 0 && (
                    <Badge
                      variant="outline"
                      className={`text-xs gap-1 ${result.ganIsAI ? 'border-red-400 text-red-600 dark:text-red-400' : 'border-green-400 text-green-600 dark:text-green-400'}`}
                    >
                      GAN: {result.ganIsAI ? `AI-generated (${result.ganConfidence}%)` : `Likely authentic (${result.ganConfidence}% AI score)`}
                    </Badge>
                  )}
                  <p className="text-sm text-muted-foreground text-center leading-relaxed px-2">
                    {result.summary}
                  </p>
                </CardContent>
              </Card>

              {/* GAN artifacts (image only) */}
              {activeTab === 'image' && result.ganArtifactNames && result.ganArtifactNames.length > 0 && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <ImageIcon className="size-4 text-orange-500" />
                      GAN Artifacts Detected
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Pixel-level patterns associated with AI image generators
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-1.5">
                      {result.ganArtifactNames.map(name => (
                        <Badge key={name} variant="secondary" className="text-xs">{name}</Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

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
                    {showAllSignals
                      ? <><ChevronUp className="size-3" /> Show fewer</>
                      : <><ChevronDown className="size-3" /> Show all signals</>}
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
                onClick={() => {
                  clearAllResults()
                  setText('')
                  clearImage()
                }}
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
