import { useState, useEffect } from 'react'
import { ThumbsUp, ThumbsDown, HelpCircle, Star, Award, TrendingUp, MessageCircle } from 'lucide-react'
import { PageHeader, PageHeaderHeading, PageHeaderDescription } from '@/components/page-header'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import {
  submitVote,
  getConsensus,
  getUserVote,
  getCurrentUserReputation,
  getHistory as getAllHistory,
  type CommunityConsensus
} from '@/lib/community'
import { getHistory } from '@/lib/storage'
import type { AnalysisResult, Verdict } from '@/lib/types'

const VERDICT_COLORS: Record<Verdict, string> = {
  reliable: 'bg-green-100 text-green-800 dark:bg-green-900',
  caution: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900',
  suspicious: 'bg-orange-100 text-orange-800 dark:bg-orange-900',
  manipulated: 'bg-red-100 text-red-800 dark:bg-red-900',
  unknown: 'bg-gray-100 text-gray-800 dark:bg-gray-900',
}

const BADGE_COLORS = {
  expert: 'bg-purple-100 text-purple-800 dark:bg-purple-900',
  verified: 'bg-blue-100 text-blue-800 dark:bg-blue-900',
  active: 'bg-green-100 text-green-800 dark:bg-green-900',
  trustworthy: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900',
}

export default function Community() {
  const [analyses, setAnalyses] = useState<AnalysisResult[]>([])
  const [consensuses, setConsensuses] = useState<Record<string, CommunityConsensus>>({})
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [voteReasons, setVoteReasons] = useState<Record<string, string>>({})
  const userRep = getCurrentUserReputation()

  useEffect(() => {
    const history = getHistory()
    setAnalyses(history)
    
    // Get consensus for each analysis
    const newConsensuses: Record<string, CommunityConsensus> = {}
    history.forEach(a => {
      newConsensuses[a.id] = getConsensus(a.id)
    })
    setConsensuses(newConsensuses)
  }, [])

  const handleVote = (analysisId: string, verdict: 'reliable' | 'unreliable' | 'unsure') => {
    const reason = voteReasons[analysisId] || undefined
    submitVote(analysisId, verdict, reason)
    
    // Update consensus
    setConsensuses(prev => ({
      ...prev,
      [analysisId]: getConsensus(analysisId)
    }))
    
    // Clear reason
    setVoteReasons(prev => {
      const updated = { ...prev }
      delete updated[analysisId]
      return updated
    })
  }

  const getUserVoteForAnalysis = (analysisId: string) => {
    return getUserVote(analysisId)
  }

  if (analyses.length === 0) {
    return (
      <>
        <PageHeader>
          <PageHeaderHeading>Community Validation</PageHeaderHeading>
          <PageHeaderDescription>
            Help verify analyses and build community trust through collaborative fact-checking.
          </PageHeaderDescription>
        </PageHeader>

        <Card className="border-dashed">
          <CardContent className="pt-12 pb-12 text-center">
            <MessageCircle className="size-12 mx-auto text-muted-foreground/30 mb-4" />
            <p className="font-medium">No analyses yet</p>
            <p className="text-sm text-muted-foreground mt-1">
              Run analyses in the Analyzer to start building community consensus.
            </p>
          </CardContent>
        </Card>
      </>
    )
  }

  return (
    <>
      <PageHeader>
        <PageHeaderHeading>Community Validation</PageHeaderHeading>
        <PageHeaderDescription>
          Your reputation: <span className="font-semibold">{userRep.trustRating}.0/5.0</span> • 
          <span className="font-semibold ml-2">{userRep.totalVotes} votes</span> •
          <span className="font-semibold ml-2">{userRep.accuracy}% accuracy</span>
        </PageHeaderDescription>
      </PageHeader>

      {/* Your badges */}
      {userRep.badges.length > 0 && (
        <Card className="bg-muted/30 border-primary/20 mb-6">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-2 flex-wrap">
              {userRep.badges.map(badge => (
                <Badge key={badge} variant="secondary" className={BADGE_COLORS[badge]}>
                  <Award className="size-3 mr-1" />
                  {badge.charAt(0).toUpperCase() + badge.slice(1)}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Analysis cards */}
      <div className="space-y-4">
        {analyses.map(analysis => {
          const consensus = consensuses[analysis.id]
          const userVote = getUserVoteForAnalysis(analysis.id)
          const isExpanded = expandedId === analysis.id

          return (
            <Card key={analysis.id} className={isExpanded ? 'ring-1 ring-primary' : ''}>
              <CardContent className="pt-4 pb-4">
                <div className="space-y-3">
                  {/* Header */}
                  <div className="flex items-start gap-3 justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap mb-2">
                        <Badge className={VERDICT_COLORS[analysis.verdict]}>
                          {analysis.trustScore}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {new Date(analysis.timestamp).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground truncate">
                        {analysis.contentPreview}
                      </p>
                    </div>
                    {consensus && (
                      <div className="text-right shrink-0">
                        <div className="text-2xl font-bold text-primary">
                          {consensus.totalVotes}
                        </div>
                        <div className="text-xs text-muted-foreground">votes</div>
                      </div>
                    )}
                  </div>

                  {/* Consensus */}
                  {consensus && (
                    <div className="bg-muted/30 p-3 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-semibold">Community Consensus</span>
                        <Badge variant="outline" className="text-xs">
                          {consensus.confidence}% confidence
                        </Badge>
                      </div>
                      <div className="flex gap-4 text-xs">
                        <div>
                          <span className="text-green-600 font-semibold">{consensus.reliableVotes}</span>
                          <span className="text-muted-foreground"> say reliable</span>
                        </div>
                        <div>
                          <span className="text-red-600 font-semibold">{consensus.unreliableVotes}</span>
                          <span className="text-muted-foreground"> say suspicious</span>
                        </div>
                      </div>
                      <div className="mt-2">
                        <div className="w-full bg-border rounded-full h-1.5 overflow-hidden">
                          <div
                            className={`h-full transition-all ${
                              consensus.consensusVerdict === 'reliable'
                                ? 'bg-green-500'
                                : consensus.consensusVerdict === 'unreliable'
                                  ? 'bg-red-500'
                                  : 'bg-yellow-500'
                            }`}
                            style={{
                              width: `${Math.max(5, Math.abs(consensus.weightedScore / Math.max(1, consensus.totalVotes)) * 50 + 50)}%`
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Voting */}
                  {isExpanded ? (
                    <div className="space-y-3 border-t pt-3">
                      <Textarea
                        placeholder="Optional: Why do you think this is reliable or suspicious? (helps others understand your vote)"
                        value={voteReasons[analysis.id] || ''}
                        onChange={e => setVoteReasons(prev => ({ ...prev, [analysis.id]: e.target.value }))}
                        className="text-xs min-h-16"
                      />
                      <div className="flex gap-2">
                        <Button
                          variant={userVote?.verdict === 'reliable' ? 'default' : 'outline'}
                          size="sm"
                          className="flex-1 gap-2"
                          onClick={() => handleVote(analysis.id, 'reliable')}
                        >
                          <ThumbsUp className="size-4" /> Reliable
                        </Button>
                        <Button
                          variant={userVote?.verdict === 'unsure' ? 'default' : 'outline'}
                          size="sm"
                          className="flex-1 gap-2"
                          onClick={() => handleVote(analysis.id, 'unsure')}
                        >
                          <HelpCircle className="size-4" /> Unsure
                        </Button>
                        <Button
                          variant={userVote?.verdict === 'unreliable' ? 'default' : 'outline'}
                          size="sm"
                          className="flex-1 gap-2"
                          onClick={() => handleVote(analysis.id, 'unreliable')}
                        >
                          <ThumbsDown className="size-4" /> Suspicious
                        </Button>
                      </div>
                      {userVote && (
                        <p className="text-xs text-green-600">
                          ✓ Your vote: {userVote.verdict}
                        </p>
                      )}
                    </div>
                  ) : (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full gap-2 text-primary"
                      onClick={() => setExpandedId(analysis.id)}
                    >
                      <TrendingUp className="size-4" /> Vote on this analysis
                    </Button>
                  )}

                  {isExpanded && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full text-muted-foreground"
                      onClick={() => setExpandedId(null)}
                    >
                      Hide voting
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* How it works */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-sm">How Community Validation Works</CardTitle>
        </CardHeader>
        <CardContent className="text-sm space-y-2 text-muted-foreground">
          <p>• <strong>Vote</strong> on whether you think an analysis is accurate</p>
          <p>• Your votes are weighted by your <strong>reputation score</strong> (trust rating + accuracy)</p>
          <p>• Higher reputation = your votes count more in community consensus</p>
          <p>• Earn badges as you become a trusted validator: Active, Trustworthy, Expert</p>
          <p>• Community consensus beats any single source—we're smarter together</p>
        </CardContent>
      </Card>
    </>
  )
}
