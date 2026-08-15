import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { Trophy, ArrowLeft, Target, FileQuestion } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Skeleton } from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/ui/EmptyState'
import { ScoreRow } from '@/components/interview/ScoreRow'
import { SkillBarChart } from '@/components/charts/SkillBarChart'
import { interviewService } from '@/services/interviewService'
import { getApiErrorMessage } from '@/services/api'
import type { InterviewReport } from '@/types/result'

type BadgeTone = 'sage' | 'signal' | 'neutral' | 'rust'

function statusBadge(status: string): { label: string; tone: BadgeTone } {
  switch (status) {
    case 'COMPLETED':
      return { label: 'Completed', tone: 'sage' }
    case 'IN_PROGRESS':
      return { label: 'In progress', tone: 'signal' }
    case 'ABANDONED':
      return { label: 'Abandoned', tone: 'rust' }
    default:
      return { label: 'Not started', tone: 'neutral' }
  }
}

export default function Report() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [report, setReport] = useState<InterviewReport | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState('')

  useEffect(() => {
    if (!id) return
    setIsLoading(true)
    setLoadError('')
    interviewService
      .getReport(id)
      .then(setReport)
      .catch((err) => setLoadError(getApiErrorMessage(err, "We couldn't load this report.")))
      .finally(() => setIsLoading(false))
  }, [id])

  // --- Loading state ---
  if (isLoading) {
    return (
      <div className="mx-auto max-w-3xl space-y-6">
        <Skeleton className="h-4 w-32" />
        <Card className="space-y-4 p-6 sm:p-8">
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-7 w-2/3" />
          <Skeleton className="h-20 w-full" />
        </Card>
        <Card className="space-y-3 p-6">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-24 w-full" />
        </Card>
      </div>
    )
  }

  // --- Error state (not found / not owned / network) ---
  if (loadError || !report) {
    return (
      <div className="mx-auto max-w-3xl">
        <EmptyState
          title="Report not found"
          description={loadError || "This report doesn't exist or you don't have access to it."}
          action={<Button onClick={() => navigate('/history')}>Back to history</Button>}
        />
      </div>
    )
  }

  // --- Nothing answered yet: no meaningful report to show ---
  if (report.answeredQuestions === 0) {
    return (
      <div className="mx-auto max-w-3xl space-y-6">
        <Link to="/history" className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-500 hover:text-ink-800">
          <ArrowLeft className="h-4 w-4" /> Back to history
        </Link>
        <EmptyState
          icon={<FileQuestion className="h-8 w-8" />}
          title="No answers yet"
          description="This interview hasn't been started, so there's nothing to report yet."
          action={<Button onClick={() => navigate(`/interview/${report.interviewId}`)}>Start answering</Button>}
        />
      </div>
    )
  }

  const badge = statusBadge(report.status)
  const isComplete = report.status === 'COMPLETED'

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Link to="/history" className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-500 hover:text-ink-800">
        <ArrowLeft className="h-4 w-4" /> Back to history
      </Link>

      <Card className="p-6 sm:p-8">
        <div className="flex flex-col items-start gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Badge tone={badge.tone}>{badge.label}</Badge>
            <h2 className="mt-3 font-display text-2xl font-semibold text-ink-800">
              {report.role} — {report.interviewType} Interview
            </h2>
            <p className="mt-1 text-sm text-ink-400">
              {report.answeredQuestions} of {report.totalQuestions} questions answered · {report.difficulty}
            </p>
          </div>
          <div className="flex items-center gap-3 rounded-xl2 bg-ink-800 px-6 py-4 text-center">
            <Trophy className="h-6 w-6 text-ember-400" />
            <div>
              <p className="font-mono text-2xl font-semibold text-white">
                {report.overallScore !== null ? `${report.overallScore}%` : '—'}
              </p>
              <p className="text-xs text-ink-300">Overall score</p>
            </div>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-2 gap-6 sm:grid-cols-4">
          <ScoreRow label="Technical" value={report.technicalScore ?? 0} />
          <ScoreRow label="Communication" value={report.communicationScore ?? 0} />
          <ScoreRow label="Relevance" value={report.relevanceScore ?? 0} />
          <ScoreRow label="Completeness" value={report.completenessScore ?? 0} />
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <Card className="p-6">
          <p className="text-xs font-semibold uppercase tracking-wide text-sage-600">Strengths</p>
          {report.strengths.length > 0 ? (
            <ul className="mt-3 space-y-2 text-sm text-ink-600">
              {report.strengths.map((s) => (
                <li key={s} className="flex gap-2">
                  <span className="text-sage">+</span>
                  {s}
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 text-sm text-ink-400">Nothing recorded yet.</p>
          )}
        </Card>
        <Card className="p-6">
          <p className="text-xs font-semibold uppercase tracking-wide text-rust-600">Weaknesses</p>
          {report.weaknesses.length > 0 ? (
            <ul className="mt-3 space-y-2 text-sm text-ink-600">
              {report.weaknesses.map((s) => (
                <li key={s} className="flex gap-2">
                  <span className="text-rust">−</span>
                  {s}
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 text-sm text-ink-400">Nothing recorded yet.</p>
          )}
        </Card>
      </div>

      {report.topicPerformance.length > 0 && (
        <Card className="p-6">
          <h3 className="font-semibold text-ink-800">Topic performance</h3>
          <SkillBarChart data={report.topicPerformance} />
        </Card>
      )}

      {report.recommendations.length > 0 && (
        <Card className="p-6">
          <div className="flex items-center gap-2">
            <Target className="h-4 w-4 text-ink-500" />
            <h3 className="font-semibold text-ink-800">Recommended focus areas</h3>
          </div>
          <ul className="mt-4 space-y-2 text-sm text-ink-600">
            {report.recommendations.map((r) => (
              <li key={r} className="flex gap-2 border-l-2 border-ink-100 pl-4">
                {r}
              </li>
            ))}
          </ul>
        </Card>
      )}

      <div className="flex flex-col gap-3 sm:flex-row">
        {isComplete ? (
          <Link to="/interview/setup" className="flex-1">
            <Button className="w-full" variant="secondary">
              Practice again
            </Button>
          </Link>
        ) : (
          <Link to={`/interview/${report.interviewId}`} className="flex-1">
            <Button className="w-full" variant="secondary">
              Continue interview
            </Button>
          </Link>
        )}
        <Link to="/dashboard" className="flex-1">
          <Button className="w-full">Back to dashboard</Button>
        </Link>
      </div>
    </div>
  )
}
