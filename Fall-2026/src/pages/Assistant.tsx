import { useState, useEffect, useRef } from 'react'
import { Send, Bot, User, Loader2 } from 'lucide-react'
import { PageHeader, PageHeaderHeading, PageHeaderDescription } from '@/components/page-header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  getAssistantResponse,
  createAssistantMessage,
  streamResponse,
  type AssistantMessage
} from '@/lib/ai-assistant'

const QUICK_PROMPTS = [
  'How do I detect deepfakes?',
  'What is misinformation?',
  'How do I verify an image?',
  'What are red flags in news?',
  'How do I fact-check?',
]

export default function Assistant() {
  const [messages, setMessages] = useState<AssistantMessage[]>([
    createAssistantMessage(
      'Hi! I\'m the TruthLens AI Assistant. I can help you understand deepfakes, misinformation, media literacy, and how to verify content. What would you like to know?',
      'assistant'
    ),
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [streamingIndex, setStreamingIndex] = useState(-1)
  const [streamingText, setStreamingText] = useState('')
  const messagesEnd = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEnd.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, streamingText])

  const handleSend = async () => {
    if (!input.trim()) return

    // Add user message
    const userMessage = createAssistantMessage(input, 'user')
    setMessages(prev => [...prev, userMessage])
    setInput('')

    // Start typing with stream
    setIsLoading(true)
    const newIndex = messages.length + 1
    setStreamingIndex(newIndex)

    try {
      const generator = streamResponse(input)
      
      for await (const chunk of generator) {
        setStreamingText(chunk)
      }

      // Add complete message
      const response = getAssistantResponse(input)
      const assistantMessage = createAssistantMessage(response, 'assistant')
      setMessages(prev => [...prev, assistantMessage])
      
      setStreamingIndex(-1)
      setStreamingText('')
    } catch (err) {
      console.error('Error:', err)
      setStreamingIndex(-1)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <PageHeader>
        <PageHeaderHeading className="flex items-center gap-2">
          <Bot className="size-6" />
          AI Assistant
        </PageHeaderHeading>
        <PageHeaderDescription>
          Ask me anything about deepfakes, misinformation, media literacy, or content verification.
        </PageHeaderDescription>
      </PageHeader>

      <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
        {/* Chat */}
        <Card className="flex flex-col h-[600px]">
          <CardContent className="flex-1 overflow-y-auto pt-4 pb-4 space-y-4">
            {messages.map((msg, idx) => (
              <div key={msg.id} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}>
                {msg.role === 'assistant' && (
                  <div className="shrink-0">
                    <div className="rounded-full bg-primary/20 p-2">
                      <Bot className="size-5 text-primary" />
                    </div>
                  </div>
                )}

                <div
                  className={`max-w-xs lg:max-w-md rounded-lg p-3 text-sm leading-relaxed ${
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

            {/* Streaming message */}
            {streamingIndex >= 0 && (
              <div className="flex gap-3">
                <div className="shrink-0">
                  <div className="rounded-full bg-primary/20 p-2">
                    <Bot className="size-5 text-primary animate-pulse" />
                  </div>
                </div>
                <div className="max-w-xs lg:max-w-md rounded-lg p-3 text-sm bg-muted text-foreground leading-relaxed">
                  {streamingText}
                  <span className="inline-block ml-1 h-4 w-2 bg-primary/50 animate-pulse" />
                </div>
              </div>
            )}

            <div ref={messagesEnd} />
          </CardContent>

          {/* Input */}
          <div className="border-t p-4 space-y-3">
            <div className="flex gap-2">
              <Input
                placeholder="Ask me about deepfakes, fact-checking, media literacy..."
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
              <Button
                size="icon"
                onClick={handleSend}
                disabled={isLoading || !input.trim()}
              >
                {isLoading ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Send className="size-4" />
                )}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              💡 Tip: Be specific! "How do I spot deepfakes?" works better than "deepfakes"
            </p>
          </div>
        </Card>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Quick prompts */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Quick Questions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {QUICK_PROMPTS.map(prompt => (
                <Button
                  key={prompt}
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start text-xs h-auto py-2 px-2 text-left"
                  onClick={() => {
                    setInput(prompt)
                    // Trigger send after a brief delay to show input
                    setTimeout(() => {
                      handleSend()
                    }, 100)
                  }}
                >
                  {prompt}
                </Button>
              ))}
            </CardContent>
          </Card>

          {/* Topics */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Topics I Know About</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-1.5">
              {[
                'Deepfakes',
                'Misinformation',
                'Fact-Checking',
                'Media Literacy',
                'Image Analysis',
                'Forensics',
                'AI Text',
                'Community Trust',
              ].map(topic => (
                <Badge key={topic} variant="secondary" className="text-xs">
                  {topic}
                </Badge>
              ))}
            </CardContent>
          </Card>

          {/* Info */}
          <Card className="bg-blue-50/50 dark:bg-blue-950/20 border-blue-200/50">
            <CardContent className="pt-4 pb-4 space-y-2 text-xs text-muted-foreground">
              <p>
                <strong>Note:</strong> I'm a keyword-based assistant, not a full AI. My responses
                are based on curated knowledge about misinformation and verification.
              </p>
              <p>
                For complex claims, use TruthLens's analyzer or external fact-checking sites like
                Snopes or PolitiFact.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  )
}
