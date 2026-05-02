// Barebone AI Assistant: Keyword-based Hardcoded Responses
// No external API — pure client-side logic

export interface AssistantMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: number
}

export interface AssistantSession {
  messages: AssistantMessage[]
  topic?: string
}

const RESPONSES: Record<string, { patterns: string[], responses: string[] }> = {
  deepfake_detection: {
    patterns: [
      'deepfake', 'face swap', 'ai generated', 'synthetic media', 'fake video',
      'how to detect', 'is this real', 'is this fake', 'looks manipulated'
    ],
    responses: [
      'Deepfakes use AI to swap faces or create synthetic media. Look for: unnatural blinking, lighting inconsistencies, lip-sync issues, and artifacts around edges. TruthLens detects these automatically.',
      'AI-generated faces often have symmetry issues, unnatural eye reflections, and odd pupils. Upload an image for instant detection — our GAN fingerprinting catches 94% of AI images.',
      'Video deepfakes show: jerky head movements, unnatural skin tones, audio/lips out of sync, and strange eye reflections. We analyze frame-by-frame for these inconsistencies.'
    ]
  },
  
  misinformation: {
    patterns: [
      'misinformation', 'disinformation', 'fake news', 'false information', 'hoax',
      'is this true', 'verify this', 'check this claim', 'credibility'
    ],
    responses: [
      'Check these 3 things: (1) Original source — who published? (2) Author — is there a byline? (3) Multiple outlets — do 3+ credible sources confirm it? Use Snopes, PolitiFact, or MediaBias/FactCheck.',
      'Misinformation spreads 6x faster than truth. Before sharing: pause, check the source, find corroboration from mainstream outlets, then decide. One piece of evidence isn\'t enough—look for patterns.',
      'The SIFT method: STOP (don\'t react), INVESTIGATE the source, FIND better coverage, TRACE claims back to origin. Takes 2 minutes but saves spreading falsehoods.'
    ]
  },
  
  media_literacy: {
    patterns: [
      'media literacy', 'how to verify', 'fact checking', 'trust', 'credibility check',
      'reliable sources', 'how to know', 'think critically', 'evaluate'
    ],
    responses: [
      'Reliable news: named sources, publication date/author, corroboration from multiple outlets, data/studies cited. Unreliable: emotional language, vague attribution ("people say"), no author, unverified claims.',
      'Professional journalists cite sources, link to evidence, provide context, and correct errors. If you see none of those—be skeptical. Real experts say their names. Anonymous claims aren\'t evidence.',
      'Red flags: ALL CAPS, excessive !!!, "share before deleted", emotional headlines, vague sourcing. Green flags: author name, publication date, links to data, multiple credible outlets confirming.'
    ]
  },
  
  image_forensics: {
    patterns: [
      'metadata', 'exif', 'image analysis', 'where from', 'chain of edits', 'tampering',
      'forensics', 'edited', 'modified when', 'who changed'
    ],
    responses: [
      'Images contain EXIF data: camera make/model, capture date, GPS location, software used. AI-generated images lack this or have AI tool tags. Missing metadata is suspicious—it\'s often stripped intentionally.',
      'Edited images leave traces: copy-paste regions (cloning), resampling artifacts, inconsistent lighting/shadows, unnatural seams. Advanced forensics spots these via noise analysis and inconsistency maps.',
      'C2PA authenticity manifests show the full edit history: who created, when modified, what software used. Check for these in verified media. If metadata is missing or suspicious, that\'s a red flag.'
    ]
  },
  
  video_audio: {
    patterns: [
      'video', 'audio', 'voice', 'deepfake video', 'fake voice', 'lip sync', 'speech synthesis',
      'synthetic audio', 'voice clone'
    ],
    responses: [
      'Video deepfakes: unnatural blinking (happens too often/rarely), jerky head motion, skin tone shifts, flickering lighting, lips out of sync with audio. Audio deepfakes: robotic tone, unnatural breathing, wrong accent/voice patterns.',
      'Voice cloning is becoming scary—a few seconds of audio can train AI to sound like anyone. Flag: slightly off timing, robotic inflections, unnatural pauses, missing background noise.',
      'We\'re adding video frame-by-frame analysis: optical flow detection (unnatural motion), audio spectral analysis (synthetic vs real), and lip-sync verification. Coming soon to TruthLens.'
    ]
  },
  
  community: {
    patterns: [
      'community', 'vote', 'credibility', 'reputation', 'other users', 'crowdsource',
      'consensus', 'trust other people'
    ],
    responses: [
      'Community voting gives power back to you. Vote on content credibility, earn reputation (like Reddit), and trusted voters get more weight. We\'re beta-testing this now.',
      'Your reputation grows with accurate votes. High-reputation users unlock "expert" status. It\'s like collaborative fact-checking—smarter than any single algorithm because humans understand context.',
      'Flag suspicious media, vote on analyses, and your vote counts more if you\'ve been accurate historically. It\'s a trust network, not just upvotes. Your credibility matters.'
    ]
  },
  
  crisis: {
    patterns: [
      'crisis mode', 'trending', 'viral', 'breaking news', 'election', 'scandal',
      'emergency', 'urgent', 'current events'
    ],
    responses: [
      'Crisis Mode prioritizes verification during breaking news and trending topics—elections, sex trafficking scandals, health emergencies. Real-time alerts help you spot viral misinformation first.',
      'When a major event breaks, Crisis Mode flags related content for verification. We monitor keywords and help community validators focus on the most urgent claims.',
      'In a crisis, misinformation spreads fastest. Crisis Mode prioritizes verification so you can spot false narratives before they go viral. We detect media spikes in real-time.'
    ]
  },
  
  help: {
    patterns: [
      'help', 'how to use', 'tutorial', 'guide', 'what can i do', 'features',
      'start', 'getting started'
    ],
    responses: [
      'TruthLens helps you verify news, images, and media for deepfakes & misinformation. Paste text or upload an image → get a trust score + detecting signals → see what manipulation tools might have been used.',
      'Features: Text & image analysis (11 detection signals), AI enhancement (Groq), community voting, crisis mode alerts, media literacy hub, and soon video/audio analysis.',
      'Start here: (1) Paste suspicious text or upload an image, (2) Review the trust score & detected signals, (3) Vote on credibility to help others, (4) Check History for past analyses.'
    ]
  },
  
  default: {
    patterns: [],
    responses: [
      'I can help with deepfake detection, fact-checking, media literacy, image forensics, video/audio verification, and crisis alerts. What would you like to know?',
      'Ask me about: How to spot deepfakes? Is this misinformation? How do I verify media? What shows tampering? I have answers on all of it.',
      'Not sure what to ask? Try: "How do I detect deepfakes?" or "What is misinformation?" or "How do I verify an image?" I\'m here to help you think critically.'
    ]
  }
}

// Get response based on user input
export function getAssistantResponse(userMessage: string): string {
  const lower = userMessage.toLowerCase()
  
  // Find matching topic
  let bestMatch = 'default'
  let bestMatchCount = 0
  
  for (const [topic, data] of Object.entries(RESPONSES)) {
    const matchCount = data.patterns.filter(p => lower.includes(p)).length
    if (matchCount > bestMatchCount) {
      bestMatchCount = matchCount
      bestMatch = topic
    }
  }
  
  // Get random response from matched category
  const responses = RESPONSES[bestMatch].responses
  return responses[Math.floor(Math.random() * responses.length)]
}

// Format assistant message
export function createAssistantMessage(content: string, role: 'user' | 'assistant' = 'assistant'): AssistantMessage {
  return {
    id: `msg_${Date.now()}`,
    role,
    content,
    timestamp: Date.now()
  }
}

// Simulate typing effect
export async function* streamResponse(message: string): AsyncGenerator<string> {
  const response = getAssistantResponse(message)
  
  // Yield character by character for typing effect
  for (let i = 0; i < response.length; i += 3) {
    yield response.slice(0, i + Math.random() * 3)
    await new Promise(r => setTimeout(r, 20))
  }
  
  yield response
}
