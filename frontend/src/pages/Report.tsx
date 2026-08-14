import { useParams, Link } from 'react-router-dom'
import { Trophy, ArrowLeft, CalendarCheck } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { ScoreRow } from '@/components/interview/ScoreRow'
import { SkillBarChart } from '@/components/charts/SkillBarChart'
import { mockTopicPerformance } from '@/data/mockData'

const mockRoadmap = [
  { day: 1, focus: 'MongoDB indexing', tasks: ['Read on compound indexes', 'Practice EXPLAIN on 3 queries'] },
  { day: 2, focus: 'JWT authentication', tasks: ['Implement refresh token flow', 'Review token expiry strategies'] },
  { day: 3, focus: 'REST API security', tasks: ['Study OWASP API top 10', 'Add rate limiting to a toy API'] },
  { day: 4, focus: 'System design fundamentals', tasks: ['Design a URL shortener end to end', 'Review caching strategies'] },
  { day: 5, focus: 'Mock interview', tasks: ['Run a fresh timed mock interview', 'Review yesterday\u2019s weak topics'] },
]

export default function Report() {
  const { id } = useParams()
  const overall = 84
  const scores = { technicalScore: 88, communicationScore: 79, relevanceScore: 91, completenessScore: 76 }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Link to="/history" className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-500 hover:text-ink-800">
        <ArrowLeft className="h-4 w-4" /> Back to history
      </Link>

      <Card className="p-6 sm:p-8">
        <div className="flex flex-col items-start gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Badge tone="sage">Completed</Badge>
            <h2 className="mt-3 font-display text-2xl font-semibold text-ink-800">Frontend Engineer — Technical Interview</h2>
            <p className="mt-1 text-sm text-ink-400">Interview #{id} · 8 questions · medium difficulty</p>
          </div>
          <div className="flex items-center gap-3 rounded-xl2 bg-ink-800 px-6 py-4 text-center">
            <Trophy className="h-6 w-6 text-ember-400" />
            <div>
              <p className="font-mono text-2xl font-semibold text-white">{overall}%</p>
              <p className="text-xs text-ink-300">Overall score</p>
            </div>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-2 gap-6 sm:grid-cols-4">
          <ScoreRow label="Technical" value={scores.technicalScore} />
          <ScoreRow label="Communication" value={scores.communicationScore} />
          <ScoreRow label="Relevance" value={scores.relevanceScore} />
          <ScoreRow label="Completeness" value={scores.completenessScore} />
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <Card className="p-6">
          <p className="text-xs font-semibold uppercase tracking-wide text-sage-600">Strengths</p>
          <ul className="mt-3 space-y-2 text-sm text-ink-600">
            <li className="flex gap-2"><span className="text-sage">+</span>Clear structure — problem, approach, trade-off, in that order</li>
            <li className="flex gap-2"><span className="text-sage">+</span>Strong grasp of React rendering fundamentals</li>
            <li className="flex gap-2"><span className="text-sage">+</span>Confident, concise communication under time pressure</li>
          </ul>
        </Card>
        <Card className="p-6">
          <p className="text-xs font-semibold uppercase tracking-wide text-rust-600">Weaknesses</p>
          <ul className="mt-3 space-y-2 text-sm text-ink-600">
            <li className="flex gap-2"><span className="text-rust">−</span>Database indexing concepts need reinforcement</li>
            <li className="flex gap-2"><span className="text-rust">−</span>System design answers skip failure-mode discussion</li>
            <li className="flex gap-2"><span className="text-rust">−</span>Occasionally rushes past edge cases</li>
          </ul>
        </Card>
      </div>

      <Card className="p-6">
        <h3 className="font-semibold text-ink-800">Topic performance</h3>
        <SkillBarChart data={mockTopicPerformance} />
      </Card>

      <Card className="p-6">
        <div className="flex items-center gap-2">
          <CalendarCheck className="h-4 w-4 text-ink-500" />
          <h3 className="font-semibold text-ink-800">Your 5-day study roadmap</h3>
        </div>
        <ol className="mt-4 space-y-4">
          {mockRoadmap.map((d) => (
            <li key={d.day} className="flex gap-4 border-l-2 border-ink-100 pl-4">
              <div>
                <p className="font-mono text-xs text-ink-300">Day {d.day}</p>
                <p className="text-sm font-medium text-ink-800">{d.focus}</p>
                <ul className="mt-1 space-y-0.5 text-sm text-ink-500">
                  {d.tasks.map((t) => (
                    <li key={t}>· {t}</li>
                  ))}
                </ul>
              </div>
            </li>
          ))}
        </ol>
      </Card>

      <div className="flex flex-col gap-3 sm:flex-row">
        <Link to="/interview/setup" className="flex-1">
          <Button className="w-full" variant="secondary">Practice again</Button>
        </Link>
        <Link to="/dashboard" className="flex-1">
          <Button className="w-full">Back to dashboard</Button>
        </Link>
      </div>
    </div>
  )
}
