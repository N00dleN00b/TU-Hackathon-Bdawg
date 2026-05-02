import type { AnalysisResult } from './types'

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions'
const MODEL = 'llama-3.3-70b-versatile'

const SYSTEM_PROMPT = `You are a media literacy expert and disinformation analyst.
Analyze the provided news text for credibility, manipulation signals, and authenticity.
You must respond with ONLY a valid JSON object — no markdown, no explanation outside the JSON.

Respond with this exact structure:
{
  "trustScore": <number 0-100>,
  "verdict": <"reliable" | "caution" | "suspicious" | "manipulated">,
  "summary": "<2-3 sentence plain-English explanation>",
  "keyFindings": ["<finding 1>", "<finding 2>", ...],
  "biasIndicators": ["<bias type if any>"],
  "manipulationTools": ["<tools or techniques likely used if manipulated>"]
}`

export interface GroqEnhancement {
  trustScore: number
  verdict: AnalysisResult['verdict']
  summary: string
  keyFindings: string[]
  biasIndicators: string[]
  manipulationTools: string[]
}

export async function enhanceWithGroq(text: string, apiKey: string): Promise<GroqEnhancement | null> {
  if (!apiKey || !text.trim()) return null

  try {
    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          {
            role: 'user',
            content: `Analyze this news content for credibility:\n\n${text.slice(0, 4000)}`
          }
        ],
        temperature: 0.1,
        max_tokens: 800,
      })
    })

    if (!response.ok) {
      const err = await response.json().catch(() => ({}))
      console.error('Groq API error:', response.status, err)
      return null
    }

    const data = await response.json()
    const content = data.choices?.[0]?.message?.content ?? ''

    // Parse JSON from response
    const jsonMatch = content.match(/\{[\s\S]*\}/)
    if (!jsonMatch) return null

    const parsed = JSON.parse(jsonMatch[0]) as GroqEnhancement
    return parsed
  } catch (err) {
    console.error('Groq enhancement failed:', err)
    return null
  }
}
