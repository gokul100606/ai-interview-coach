import { Link } from 'react-router-dom'
import { History as HistoryIcon } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { EmptyState } from '@/components/ui/EmptyState'
import { mockInterviews } from '@/data/mockData'

function scoreTone(score?: number): 'sage' | 'ember' | 'rust' | 'neutral' {
  if (score === undefined) return 'neutral'
  if (score >= 75) return 'sage'
  if (score >= 50) return 'ember'
  return 'rust'
}

export default function History() {
  if (mockInterviews.length === 0) {
    return (
      <EmptyState
        icon={<HistoryIcon className="h-8 w-8" />}
        title="No interviews yet"
        description="Once you complete a practice interview, it'll show up here."
      />
    )
  }

  return (
    <div className="space-y-4">
      <h2 className="font-display text-2xl font-semibold text-ink-800">Interview history</h2>
      <Card className="divide-y divide-ink-100 p-2">
        {mockInterviews.map((interview) => (
          <Link
            key={interview.id}
            to={interview.status === 'COMPLETED' ? `/report/${interview.id}` : `/interview/${interview.id}`}
            className="flex items-center justify-between gap-4 rounded-lg px-4 py-4 transition-colors hover:bg-paper"
          >
            <div className="min-w-0">
              <p className="text-sm font-medium text-ink-800">{interview.role}</p>
              <p className="mt-0.5 text-xs text-ink-400">
                {interview.interviewType} · {interview.difficulty} ·{' '}
                {new Date(interview.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </p>
            </div>
            {interview.status === 'COMPLETED' ? (
              <Badge tone={scoreTone(interview.overallScore)}>{interview.overallScore}%</Badge>
            ) : (
              <Badge tone="signal">{interview.status === 'CREATED' ? 'Not started' : interview.status}</Badge>
            )}
          </Link>
        ))}
      </Card>
    </div>
  )
}
