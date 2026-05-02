import { useState, useEffect, useRef } from 'react'
import { Send, Bot, User, Loader2, Sparkles, Key, ExternalLink } from 'lucide-react'
import { PageHeader, PageHeaderHeading, PageHeaderDescription } from '@/components/page-header'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  getAssistantResponse,
  createAssistantMessage,
  streamResponse,
  chatWithGroq,
  type AssistantMessage
} from '@/lib/ai-assistant'

const QUICK_PROMPTS = [
  { label: 'Detect deepfakes', text: 'How do I detect deepfakes in a video?' },
  { label: 'Fact-check steps', text: 'Walk me through how to fact-check a breaking news claim.' },
  { label: 'Image verification', text: 'How do I verify if an image has been manipulated?' },
  { label: 'News red flags', text: 'What are the biggest red flags that a news article is fake?' },
  { label: 'SIFT method', text: 'Explain the SIFT fact-checking method.' },
  { label: 'Voice cloning', text: 'How can I tell if audio has been voice-cloned?' },
  { label: 'Credible sources', text: 'What sources should I use to fact-check claims?' },
]

const FACT_CHECK_RESOURCES = [
  { name: 'Snopes', url: 'https://snopes.com', desc: 'Urban legends & viral claims' },
  { name: 'PolitiFact', url: 'https://politifact.com', desc: 'Political fact-checking' },
  { name: 'FactCheck.org', url: 'https://factcheck.org', desc: 'Non-partisan fact-checking' },
  { name: 'AP Fact Check', url: 'https://apnews.com/APFactCheck', desc: 'Wire service verification' },
  { name: 'MediaBias/Fact Check', url: 'https://mediabiasfactcheck.com', desc: 'Source credibility ratings' },
]

export default function Assistant() {
  const [messages, setMessages] = useState<AssistantMessage[]>([
    createAssistantMessage(
      "Hi! I'm the RealityCheck AI Assistant. Paste a claim, article, or question and I'll help you fact-check it or explain how to verify media. What would you like to investigate?",
      'assistant'
    ),
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [streamingText, setStreamingText] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)
  const [groqKey, setGroqKey] = useState(() => localStorage.getItem('realitycheck_groq_key') ?? '')
  const [showKeyInput, setShowKeyInput] = useState(false)
  const messagesEnd = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const groqActive = !!groqKey

  const scrollToBottom = () => {
    messagesEnd.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, streamingText])

  const saveGroqKey = (key: string) => {
    setGroqKey(key)
    if (key) localStorage.setItem('realitycheck_groq_key', key)
    else localStorage.removeItem('realitycheck_groq_key')
  }

  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return

    const userMessage = createAssistantMessage(text, 'user')
    const updatedHistory = [...messages, userMessage]
    setMessages(updatedHistory)
    setInput('')
    setIsLoading(true)

    try {
      if (groqActive) {
        // Use Groq LLM — no streaming (fetch waits for full response)
        setIsStreaming(true)
        setStreamingText('...')
        const reply = await chatWithGroq(text, groqKey, messages)
        setStreamingText('')
        setIsStreaming(false)
        setMessages(prev => [...prev, createAssistantMessage(reply, 'assistant')])
      } else {
        // Keyword fallback with typing effect
        setIsStreaming(true)
        const gen = streamResponse(text)
        for await (const chunk of gen) {
          setStreamingText(chunk)
        }
        const reply = getAssistantResponse(text)
        setStreamingText('')
        setIsStreaming(false)
        setMessages(prev => [...prev, createAssistantMessage(reply, 'assistant')])
      }
    } catch (err) {
      console.error('Assistant error:', err)
      setStreamingText('')
      setIsStreaming(false)
      setMessages(prev => [
        ...prev,
        createAssistantMessage(
          groqActive
            ? 'Groq API error — check your key or try again. Falling back: ' + getAssistantResponse(text)
            : getAssistantResponse(text),
          'assistant'
        ),
      ])
    } finally {
      setIsLoading(false)
      inputRef.current?.focus()
    }
  }

  const handleSend = () => sendMessage(input)

  const handleQuickPrompt = (text: string) => {
    setInput(text)
    sendMessage(text)
  }

  return (
    <>
      <PageHeader>
        <PageHeaderHeading className="flex items-center gap-2">
          <Bot className="size-6" />
          AI Assistant
        </PageHeaderHeading>
        <PageHeaderDescription>
          Ask about deepfakes, paste a claim to fact-check, or get media literacy guidance.
          {groqActive && <span className="text-purple-600 dark:text-purple-400 font-medium"> · Groq AI active</span>}
        </PageHeaderDescription>
      </PageHeader>

      <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
        {/* Chat */}
        <Card className="flex flex-col h-[620px]">
          <CardContent className="flex-1 overflow-y-auto pt-4 pb-2 space-y-4">
            {messages.map(msg => (
              <div key={msg.id} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}>
                {msg.role === 'assistant' && (
                  <div className="shrink-0">
                    <div className="rounded-full bg-primary/20 p-2">
                      <Bot className="size-5 text-primary" />
                    </div>
                  </div>
                )}

                <div
                  className={`max-w-[75%] rounded-lg p-3 text-sm leading-relaxed whitespace-pre-wrap ${
                    msg.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-foreground'
                  }`}
                >
                  {msg.content}
                </div>

                {msg.role === 'user' && (
                  <div className="shrink-0">
                    <div className="rounded-full bg-muted p-2">
                      <User className="size-5 text-muted-foreground" />
                    </div>
                  </div>
                )}
              </div>
            ))}

            {/* Streaming / loading indicator */}
            {isStreaming && (
              <div className="flex gap-3">
                <div className="shrink-0">
                  <div className="rounded-full bg-primary/20 p-2">
                    <Bot className={`size-5 text-primary ${isLoading ? 'animate-pulse' : ''}`} />
                  </div>
                </div>
                <div className="max-w-[75%] rounded-lg p-3 text-sm bg-muted text-foreground leading-relaxed whitespace-pre-wrap">
                  {streamingText || (
                    <span className="flex items-center gap-1.5 text-muted-foreground">
                      <Loader2 className="size-3 animate-spin" /> Thinking...
                    </span>
                  )}
                  {streamingText && <span className="inline-block ml-0.5 h-4 w-0.5 bg-primary/60 animate-pulse" />}
                </div>
              </div>
            )}

            <div ref={messagesEnd} />
          </CardContent>

          {/* Input */}
          <div className="border-t p-4 space-y-2.5">
            {/* Quick prompts strip */}
            <div className="flex gap-1.5 flex-wrap">
              {QUICK_PROMPTS.slice(0, 4).map(p => (
                <Button
                  key={p.label}
                  variant="outline"
                  size="sm"
                  className="text-xs h-6 px-2"
                  disabled={isLoading}
                  onClick={() => handleQuickPrompt(p.text)}
                >
                  {p.label}
                </Button>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                ref={inputRef}
                placeholder={groqActive
                  ? 'Ask anything or paste a claim to fact-check...'
                  : 'Ask about deepfakes, fact-checking, media literacy...'}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    handleSend()
                  }
                }}
                disabled={isLoading}
                className="text-sm"
              />
              <Button size="icon" onClick={handleSend} disabled={isLoading || !input.trim()}>
                {isLoading
                  ? <Loader2 className="size-4 animate-spin" />
                  : <Send className="size-4" />}
              </Button>
            </div>
            {!groqActive && (
              <p className="text-xs text-muted-foreground">
                Tip: Add a Groq API key in the sidebar for full AI responses on any question.
              </p>
            )}
          </div>
        </Card>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Groq key card */}
          <Card className={groqActive ? 'border-purple-300 dark:border-purple-800' : ''}>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Sparkles className={`size-4 ${groqActive ? 'text-purple-500' : 'text-muted-foreground'}`} />
                AI Mode
              </CardTitle>
              <CardDescription className="text-xs">
                {groqActive
                  ? 'Groq LLM active — full AI responses on any question.'
                  : 'Add a free Groq key for real AI responses. Get one at console.groq.com.'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {showKeyInput || !groqActive ? (
                <div className="flex gap-2">
                  <Input
                    type="password"
                    placeholder="gsk_..."
                    value={groqKey}
                    onChange={e => saveGroqKey(e.target.value)}
                    className="font-mono text-xs"
                  />
                  {groqActive && (
                    <Button variant="ghost" size="sm" className="text-xs shrink-0" onClick={() => setShowKeyInput(false)}>
                      Done
                    </Button>
                  )}
                </div>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full text-xs gap-1.5"
                  onClick={() => setShowKeyInput(true)}
                >
                  <Key className="size-3" /> Change key
                </Button>
              )}
              {groqActive && (
                <p className="text-xs text-purple-600 dark:text-purple-400 flex items-center gap-1">
                  <Sparkles className="size-3" /> AI-powered responses active
                </p>
              )}
            </CardContent>
          </Card>

          {/* All quick prompts */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Quick Questions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1.5">
              {QUICK_PROMPTS.map(p => (
                <Button
                  key={p.label}
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start text-xs h-auto py-1.5 px-2 text-left"
                  disabled={isLoading}
                  onClick={() => handleQuickPrompt(p.text)}
                >
                  {p.text}
                </Button>
              ))}
            </CardContent>
          </Card>

          {/* Fact-check resources */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Fact-Check Resources</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {FACT_CHECK_RESOURCES.map(r => (
                <a
                  key={r.name}
                  href={r.url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-start justify-between gap-2 group"
                >
                  <div>
                    <p className="text-xs font-medium group-hover:underline">{r.name}</p>
                    <p className="text-[10px] text-muted-foreground">{r.desc}</p>
                  </div>
                  <ExternalLink className="size-3 text-muted-foreground shrink-0 mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                </a>
              ))}
            </CardContent>
          </Card>

          {/* Topics */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Topics</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-1.5">
              {[
                'Deepfakes', 'Misinformation', 'Fact-Checking', 'Media Literacy',
                'Image Forensics', 'Voice Cloning', 'C2PA', 'Community Trust', 'Crisis News',
              ].map(topic => (
                <Badge
                  key={topic}
                  variant="secondary"
                  className="text-xs cursor-pointer hover:bg-secondary/80"
                  onClick={() => handleQuickPrompt(`Tell me about ${topic}`)}
                >
                  {topic}
                </Badge>
              ))}
            </CardContent>
          </Card>

          {!groqActive && (
            <Card className="bg-blue-50/50 dark:bg-blue-950/20 border-blue-200/50">
              <CardContent className="pt-4 pb-4 space-y-1.5 text-xs text-muted-foreground">
                <p><strong>Keyword mode:</strong> Responses come from a curated knowledge base. Add a Groq key above for real AI answers on any topic.</p>
                <p>For specific claims, use the <strong>Analyzer</strong> page or the fact-check sites linked above.</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </>
  )
}
