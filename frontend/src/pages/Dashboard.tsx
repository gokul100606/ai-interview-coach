import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowUpRight, Plus, Trophy, Target, TrendingUp, Sparkles, LayoutDashboard } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Skeleton } from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/ui/EmptyState'
import { ScoreTrendChart } from '@/components/charts/ScoreTrendChart'
import { SkillBarChart } from '@/components/charts/SkillBarChart'
import { analyticsService } from '@/services/analyticsService'
import { getApiErrorMessage } from '@/services/api'
import { useAuth } from '@/context/AuthContext'
import type { Interview } from '@/types/interview'
import type { DashboardData } from '@/types/dashboard'

function scoreTone(score?: number): 'sage' | 'ember' | 'rust' | 'neutral' {
  if (score === undefined) return 'neutral'
  if (score >= 75) return 'sage'
  if (score >= 50) return 'ember'
  return 'rust'
}

export default function Dashboard() {
  const { user } = useAuth()
  const [dashboard, setDashboard] = useState<DashboardData | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    analyticsService
      .getDashboard()
      .then(setDashboard)
      .catch((err) => setError(getApiErrorMessage(err, "We couldn't load your dashboard.")))
  }, [])

  const greeting = (
    <div>
      <p className="text-sm text-ink-400">Welcome back,</p>
      <h2 className="font-display text-2xl font-semibold text-ink-800">{user?.name?.split(' ')[0] || 'there'} 👋</h2>
    </div>
  )

  // --- Error state ---
  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">{greeting}</div>
        <EmptyState title="Couldn't load your dashboard" description={error} />
      </div>
    )
  }

  // --- Loading state ---
  if (!dashboard) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">{greeting}</div>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <Card key={i} className="space-y-3 p-5">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-6 w-14" />
            </Card>
          ))}
        </div>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <Card className="p-6 lg:col-span-2">
            <Skeleton className="h-40 w-full" />
          </Card>
          <Card className="p-6">
            <Skeleton className="h-40 w-full" />
          </Card>
        </div>
      </div>
    )
  }

  // --- Empty state: brand-new user with no interviews yet ---
  if (dashboard.totalInterviews === 0) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          {greeting}
          <Link to="/interview/setup">
            <Button>
              <Plus className="h-4 w-4" /> New interview
            </Button>
          </Link>
        </div>
        <EmptyState
          icon={<LayoutDashboard className="h-8 w-8" />}
          title="No interviews yet"
          description="Once you create and complete a practice interview, your stats and progress will show up here."
          action={
            <Link to="/interview/setup">
              <Button>Start your first interview</Button>
            </Link>
          }
        />
      </div>
    )
  }

  // Chronological delta (oldest completed score vs newest) from real
  // scoreTrend data — null when there aren't at least two completed
  // interviews to compare, rather than a misleading "+0%" or fake badge.
  const trend =
    dashboard.scoreTrend.length >= 2
      ? dashboard.scoreTrend[dashboard.scoreTrend.length - 1].score - dashboard.scoreTrend[0].score
      : null

  const stats = [
    { label: 'Interviews completed', value: dashboard.completedInterviews, icon: Sparkles },
    { label: 'Average score', value: `${dashboard.averageScore}%`, icon: Target },
    { label: 'Best score', value: `${dashboard.bestScore}%`, icon: Trophy },
    {
      label: 'Improvement',
      value: trend === null ? '—' : `${trend >= 0 ? '+' : ''}${trend}%`,
      icon: TrendingUp,
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        {greeting}
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
        {dashboard.scoreTrend.length > 0 && (
          <Card className="p-6 lg:col-span-2">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-ink-800">Score trend</h3>
              {trend !== null && (
                <Badge tone={trend > 0 ? 'sage' : trend < 0 ? 'rust' : 'neutral'}>
                  {trend > 0 ? 'Trending up' : trend < 0 ? 'Trending down' : 'Steady'}
                </Badge>
              )}
            </div>
            <ScoreTrendChart data={dashboard.scoreTrend} />
          </Card>
        )}

        {/* Skill performance */}
        {dashboard.topicPerformance.length > 0 && (
          <Card className={dashboard.scoreTrend.length > 0 ? 'p-6' : 'p-6 lg:col-span-3'}>
            <h3 className="font-semibold text-ink-800">Skill performance</h3>
            <SkillBarChart data={dashboard.topicPerformance} />
          </Card>
        )}
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
          {dashboard.recentInterviews.map((interview) => (
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
