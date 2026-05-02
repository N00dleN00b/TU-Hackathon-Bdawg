// Community Trust & Voting System

export interface CommunityVote {
  analysisId: string
  userId: string // Anonymous but consistent per browser
  verdict: 'reliable' | 'unreliable' | 'unsure'
  reason?: string
  timestamp: number
}

export interface UserReputation {
  userId: string
  totalVotes: number
  accuracy: number // 0-100, based on if votes match eventual consensus
  trustRating: number // 0-5 stars
  badges: ('expert' | 'verified' | 'active' | 'trustworthy')[]
}

export interface CommunityConsensus {
  analysisId: string
  totalVotes: number
  reliableVotes: number
  unreliableVotes: number
  consensusVerdict: 'reliable' | 'unreliable' | 'split'
  confidence: number // 0-100
  weightedScore: number // voted by high-reputation users
}

const COMMUNITY_VOTES_KEY = 'truthlens_community_votes'
const USER_ID_KEY = 'truthlens_user_id'
const USER_REP_KEY = 'truthlens_user_rep'

// Get or create anonymous but consistent user ID
export function getUserId(): string {
  let id = localStorage.getItem(USER_ID_KEY)
  if (!id) {
    id = `user_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`
    localStorage.setItem(USER_ID_KEY, id)
  }
  return id
}

// Submit a vote on an analysis
export function submitVote(analysisId: string, verdict: 'reliable' | 'unreliable' | 'unsure', reason?: string): void {
  const votes = getCommunityVotes()
  const userId = getUserId()
  
  // Remove existing vote from this user on this analysis
  const filtered = votes.filter(v => !(v.analysisId === analysisId && v.userId === userId))
  
  filtered.push({
    analysisId,
    userId,
    verdict,
    reason,
    timestamp: Date.now()
  })
  
  try {
    localStorage.setItem(COMMUNITY_VOTES_KEY, JSON.stringify(filtered))
  } catch {
    // Storage full — trim oldest votes
    localStorage.setItem(COMMUNITY_VOTES_KEY, JSON.stringify(filtered.slice(-100)))
  }
  
  // Update user reputation
  updateUserReputation(userId)
}

// Get all votes
export function getCommunityVotes(): CommunityVote[] {
  try {
    const raw = localStorage.getItem(COMMUNITY_VOTES_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

// Get consensus for an analysis
export function getConsensus(analysisId: string): CommunityConsensus {
  const votes = getCommunityVotes().filter(v => v.analysisId === analysisId)
  const totalVotes = votes.length
  
  const reliableVotes = votes.filter(v => v.verdict === 'reliable').length
  const unreliableVotes = votes.filter(v => v.verdict === 'unreliable').length
  
  let consensusVerdict: 'reliable' | 'unreliable' | 'split'
  if (reliableVotes > unreliableVotes * 2) consensusVerdict = 'reliable'
  else if (unreliableVotes > reliableVotes * 2) consensusVerdict = 'unreliable'
  else consensusVerdict = 'split'
  
  // Weight votes by reputation
  let weightedScore = 0
  votes.forEach(vote => {
    const rep = getUserReputation(vote.userId)
    const weight = Math.max(0.5, rep.trustRating) / 5 // 0.5 to 1.0
    weightedScore += (vote.verdict === 'reliable' ? weight : -weight)
  })
  
  const confidence = Math.min(100, Math.abs(weightedScore / Math.max(1, votes.length)) * 100)
  
  return {
    analysisId,
    totalVotes,
    reliableVotes,
    unreliableVotes,
    consensusVerdict,
    confidence: Math.round(confidence),
    weightedScore: Math.round(weightedScore * 10) / 10
  }
}

// Get user's vote on a specific analysis
export function getUserVote(analysisId: string): CommunityVote | null {
  const userId = getUserId()
  const votes = getCommunityVotes()
  return votes.find(v => v.analysisId === analysisId && v.userId === userId) || null
}

// Get user reputation
export function getUserReputation(userId: string): UserReputation {
  try {
    const reps = JSON.parse(localStorage.getItem(USER_REP_KEY) || '{}') as Record<string, UserReputation>
    return reps[userId] || getDefaultReputation(userId)
  } catch {
    return getDefaultReputation(userId)
  }
}

function getDefaultReputation(userId: string): UserReputation {
  return {
    userId,
    totalVotes: 0,
    accuracy: 50,
    trustRating: 2,
    badges: []
  }
}

// Update reputation based on voting history
function updateUserReputation(userId: string): void {
  const votes = getCommunityVotes().filter(v => v.userId === userId)
  const rep = getUserReputation(userId)
  
  rep.totalVotes = votes.length
  
  // Simulate accuracy (in real system, compare to eventual consensus)
  rep.accuracy = 50 + Math.random() * 30 // Placeholder
  
  // Trust rating based on votes and accuracy
  let rating = 2
  if (rep.totalVotes >= 5) rating = 2.5
  if (rep.totalVotes >= 10) rating = 3
  if (rep.accuracy >= 70) rating += 1
  if (rep.totalVotes >= 20 && rep.accuracy >= 75) rating = 5
  
  rep.trustRating = Math.min(5, Math.max(1, rating))
  
  // Awards badges
  rep.badges = []
  if (rep.totalVotes >= 10) rep.badges.push('active')
  if (rep.accuracy >= 80) rep.badges.push('trustworthy')
  if (rep.totalVotes >= 30 && rep.accuracy >= 85) rep.badges.push('expert')
  
  // Save
  const reps = JSON.parse(localStorage.getItem(USER_REP_KEY) || '{}') as Record<string, UserReputation>
  reps[userId] = rep
  localStorage.setItem(USER_REP_KEY, JSON.stringify(reps))
}

export function getCurrentUserReputation(): UserReputation {
  return getUserReputation(getUserId())
}

export function clearCommunityData(): void {
  localStorage.removeItem(COMMUNITY_VOTES_KEY)
  localStorage.removeItem(USER_REP_KEY)
}
