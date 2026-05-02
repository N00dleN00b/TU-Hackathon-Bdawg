import { useState, useEffect, useRef } from 'react'
import { Send, Bot, User, Loader2, ExternalLink } from 'lucide-react'
import { PageHeader, PageHeaderHeading, PageHeaderDescription } from '@/components/page-header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  getAssistantResponse,
  createAssistantMessage,
  streamResponse,
  streamClaude,
  hasClaudeKey,
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
      "Hi! I'm the RealityCheck AI Assistant. Ask me about deepfakes, fact-checking, voice cloning, media literacy, or paste a claim you want to investigate.",
      'assistant'
    ),
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [streamingText, setStreamingText] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)
  const messagesEnd = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    messagesEnd.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, streamingText])

  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return

    const userMessage = createAssistantMessage(text, 'user')
    const updatedMessages = [...messages, userMessage]
    setMessages(updatedMessages)
    setInput('')
    setIsLoading(true)
    setIsStreaming(true)

    try {
      if (hasClaudeKey()) {
        const history = updatedMessages.map(m => ({ role: m.role, content: m.content }))
        let finalText = ''
        for await (const chunk of streamClaude(history)) {
          setStreamingText(chunk)
          finalText = chunk
        }
        setStreamingText('')
        setIsStreaming(false)
        setMessages(prev => [...prev, createAssistantMessage(finalText || getAssistantResponse(text), 'assistant')])
      } else {
        for await (const chunk of streamResponse(text)) {
          setStreamingText(chunk)
        }
        setStreamingText('')
        setIsStreaming(false)
        setMessages(prev => [...prev, createAssistantMessage(getAssistantResponse(text), 'assistant')])
      }
    } catch {
      setStreamingText('')
      setIsStreaming(false)
      setMessages(prev => [...prev, createAssistantMessage(getAssistantResponse(text), 'assistant')])
    } finally {
      setIsLoading(false)
      inputRef.current?.focus()
    }
  }

  const handleSend = () => sendMessage(input)
  const handleQuickPrompt = (text: string) => { setInput(text); sendMessage(text) }

  return (
    <>
      <PageHeader>
        <PageHeaderHeading className="flex items-center gap-2">
          <Bot className="size-6" />
          AI Assistant
        </PageHeaderHeading>
        <PageHeaderDescription>
          Ask about deepfakes, paste a claim to fact-check, or get media literacy guidance.
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
                <div className={`max-w-[75%] rounded-lg p-3 text-sm leading-relaxed whitespace-pre-wrap ${
                  msg.role === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-foreground'
                }`}>
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

            {isStreaming && (
              <div className="flex gap-3">
                <div className="shrink-0">
                  <div className="rounded-full bg-primary/20 p-2">
                    <Bot className="size-5 text-primary animate-pulse" />
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

          <div className="border-t p-4 space-y-2.5">
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
                placeholder="Ask about deepfakes, fact-checking, media literacy..."
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() }
                }}
                disabled={isLoading}
                className="text-sm"
              />
              <Button size="icon" onClick={handleSend} disabled={isLoading || !input.trim()}>
                {isLoading ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
              </Button>
            </div>
          </div>
        </Card>

        {/* Sidebar */}
        <div className="space-y-4">
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
        </div>
      </div>
    </>
  )
}
