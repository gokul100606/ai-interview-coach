import { Link } from 'react-router-dom'
import { ArrowUpRight, Plus, Trophy, Target, TrendingUp, Sparkles } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { ScoreTrendChart } from '@/components/charts/ScoreTrendChart'
import { SkillBarChart } from '@/components/charts/SkillBarChart'
import { mockInterviews, mockScoreTrend, mockTopicPerformance } from '@/data/mockData'
import { useAuth } from '@/context/AuthContext'
import type { Interview } from '@/types/interview'

function scoreTone(score?: number): 'sage' | 'ember' | 'rust' | 'neutral' {
  if (score === undefined) return 'neutral'
  if (score >= 75) return 'sage'
  if (score >= 50) return 'ember'
  return 'rust'
}

export default function Dashboard() {
  const { user } = useAuth()
  const completed = mockInterviews.filter((i) => i.status === 'COMPLETED')
  const avgScore = Math.round(completed.reduce((s, i) => s + (i.overallScore || 0), 0) / completed.length)
  const bestScore = Math.max(...completed.map((i) => i.overallScore || 0))
  const improvement = completed.length >= 2 ? completed[completed.length - 1].overallScore! - completed[0].overallScore! : 0

  const stats = [
    { label: 'Interviews completed', value: completed.length, icon: Sparkles },
    { label: 'Average score', value: `${avgScore}%`, icon: Target },
    { label: 'Best score', value: `${bestScore}%`, icon: Trophy },
    { label: 'Improvement', value: `${improvement >= 0 ? '+' : ''}${improvement}%`, icon: TrendingUp },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="text-sm text-ink-400">Welcome back,</p>
          <h2 className="font-display text-2xl font-semibold text-ink-800">{user?.name?.split(' ')[0] || 'there'} 👋</h2>
        </div>
        <Link to="/interview/setup">
          <Button>
            <Plus className="h-4 w-4" /> New interview
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map(({ label, value, icon: Icon }) => (
          <Card key={label} className="p-5">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium text-ink-400">{label}</p>
              <Icon className="h-4 w-4 text-ink-300" />
            </div>
            <p className="mt-2 font-mono text-2xl font-semibold text-ink-800">{value}</p>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Score trend */}
        <Card className="p-6 lg:col-span-2">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-ink-800">Score trend</h3>
            <Badge tone="sage">Trending up</Badge>
          </div>
          <ScoreTrendChart data={mockScoreTrend} />
        </Card>

        {/* Skill performance */}
        <Card className="p-6">
          <h3 className="font-semibold text-ink-800">Skill performance</h3>
          <SkillBarChart data={mockTopicPerformance} />
        </Card>
      </div>

      {/* Recent interviews */}
      <Card className="p-6">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-ink-800">Recent interviews</h3>
          <Link to="/history" className="flex items-center gap-1 text-sm font-medium text-ink-500 hover:text-ink-800">
            View all <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        <div className="mt-4 divide-y divide-ink-100">
          {mockInterviews.map((interview) => (
            <InterviewRow key={interview.id} interview={interview} />
          ))}
        </div>
      </Card>
    </div>
  )
}

function InterviewRow({ interview }: { interview: Interview }) {
  const tone = scoreTone(interview.overallScore)
  return (
    <div className="flex items-center justify-between gap-4 py-3.5">
      <div className="min-w-0">
        <p className="truncate text-sm font-medium text-ink-800">{interview.role}</p>
        <p className="mt-0.5 text-xs text-ink-400">
          {interview.interviewType} · {interview.difficulty} · {interview.questionCount} questions
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-3">
        {interview.status === 'COMPLETED' ? (
          <Badge tone={tone}>{interview.overallScore}%</Badge>
        ) : (
          <Badge tone="signal">{interview.status === 'CREATED' ? 'Not started' : interview.status}</Badge>
        )}
        <Link
          to={interview.status === 'COMPLETED' ? `/report/${interview.id}` : `/interview/${interview.id}`}
          className="text-xs font-medium text-ink-500 hover:text-ink-800"
        >
          {interview.status === 'COMPLETED' ? 'View report' : 'Continue'}
        </Link>
      </div>
    </div>
  )
}
