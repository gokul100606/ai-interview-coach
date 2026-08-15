import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Bookmark, ArrowRight, Loader2 } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Skeleton } from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/ui/EmptyState'
import { Waveform } from '@/components/ui/Waveform'
import { ScoreRow } from '@/components/interview/ScoreRow'
import { mockEvaluate } from '@/data/mockData'
import { interviewService } from '@/services/interviewService'
import { getApiErrorMessage } from '@/services/api'
import type { Evaluation } from '@/types/answer'
import type { Interview } from '@/types/interview'
import type { Question } from '@/types/question'

export default function InterviewRoom() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [index, setIndex] = useState(0)
  const [answerText, setAnswerText] = useState('')
  const [evaluation, setEvaluation] = useState<Evaluation | null>(null)
  const [isEvaluating, setIsEvaluating] = useState(false)
  const [bookmarked, setBookmarked] = useState<Record<string, boolean>>({})

  // Real data from the backend: the interview record (role/type/ownership)
  // and its generated question set (mock-backed for now — see backend
  // questionGenerationService.ts; a future phase swaps that generator for
  // FastAPI/Gemini without this page changing at all).
  const [interview, setInterview] = useState<Interview | null>(null)
  const [questions, setQuestions] = useState<Question[] | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState('')

  useEffect(() => {
    if (!id) return
    setIsLoading(true)
    setLoadError('')
    Promise.all([interviewService.getById(id), interviewService.getQuestions(id)])
      .then(([interviewData, questionsData]) => {
        setInterview(interviewData)
        setQuestions(questionsData)
      })
      .catch((err) => setLoadError(getApiErrorMessage(err, "We couldn't load this interview.")))
      .finally(() => setIsLoading(false))
  }, [id])

  // --- Loading state ---
  if (isLoading) {
    return (
      <div className="mx-auto max-w-2xl space-y-4">
        <Skeleton className="h-4 w-40" />
        <Card className="space-y-4 p-6 sm:p-8">
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-7 w-full" />
          <Skeleton className="h-40 w-full" />
        </Card>
      </div>
    )
  }

  // --- Error state (not found / not owned / network) ---
  if (loadError || !interview) {
    return (
      <div className="mx-auto max-w-2xl">
        <EmptyState
          title="Interview not found"
          description={loadError || "This interview doesn't exist or you don't have access to it."}
          action={<Button onClick={() => navigate('/interview/setup')}>Start a new interview</Button>}
        />
      </div>
    )
  }

  // --- Empty-questions state (generation produced nothing) ---
  if (!questions || questions.length === 0) {
    return (
      <div className="mx-auto max-w-2xl">
        <EmptyState
          title="No questions yet"
          description="This interview doesn't have any questions prepared. Try starting a new one."
          action={<Button onClick={() => navigate('/interview/setup')}>Start a new interview</Button>}
        />
      </div>
    )
  }

  const question = questions[index]
  const isLast = index === questions.length - 1

  async function handleSubmit() {
    if (!answerText.trim()) return
    setIsEvaluating(true)
    // Phase 8+: POST /api/interviews/:id/answers -> Node -> FastAPI -> Gemini
    await new Promise((r) => setTimeout(r, 900))
    setEvaluation(mockEvaluate(answerText))
    setIsEvaluating(false)
  }

  function handleNext() {
    if (isLast) {
      navigate(`/report/${id}`)
      return
    }
    setIndex((i) => i + 1)
    setAnswerText('')
    setEvaluation(null)
  }

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-5">
        <p className="text-xs font-medium text-ink-400">
          {interview.role} · {interview.interviewType}
        </p>
        <div className="mt-1.5 flex items-center justify-between">
          <p className="text-sm font-medium text-ink-400">
            Question <span className="font-mono text-ink-800">{index + 1}</span> of {questions.length}
          </p>
          <div className="h-1.5 w-32 overflow-hidden rounded-full bg-ink-100">
            <div
              className="h-full rounded-full bg-ink-800 transition-all duration-500"
              style={{ width: `${((index + (evaluation ? 1 : 0)) / questions.length) * 100}%` }}
            />
          </div>
        </div>
      </div>

      <Card className="p-6 sm:p-8">
        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-wrap gap-2">
            <Badge tone="neutral">{question.category}</Badge>
            <Badge tone="signal">{question.difficulty}</Badge>
          </div>
          <button
            aria-label="Bookmark question"
            onClick={() => setBookmarked((b) => ({ ...b, [question.id]: !b[question.id] }))}
            className="rounded-full p-1.5 text-ink-300 transition-colors hover:bg-ink-50 hover:text-ember-600"
          >
            <Bookmark className={bookmarked[question.id] ? 'h-5 w-5 fill-ember-500 text-ember-500' : 'h-5 w-5'} />
          </button>
        </div>

        <h2 className="mt-4 font-display text-xl font-semibold leading-snug text-ink-800 sm:text-2xl">
          {question.questionText}
        </h2>

        {!evaluation ? (
          <>
            <textarea
              value={answerText}
              onChange={(e) => setAnswerText(e.target.value)}
              placeholder="Type your answer as you would say it out loud…"
              rows={8}
              className="mt-6 w-full resize-none rounded-xl border border-ink-100 bg-white px-4 py-3.5 text-sm leading-relaxed text-ink-800 placeholder:text-ink-300 focus:border-signal-500 focus:outline-none focus:ring-2 focus:ring-signal-500/20"
            />
            <div className="mt-5 flex items-center justify-between">
              <span className="text-xs text-ink-300">{answerText.trim().split(/\s+/).filter(Boolean).length} words</span>
              <Button onClick={handleSubmit} disabled={!answerText.trim()} isLoading={isEvaluating}>
                {isEvaluating ? 'Evaluating' : 'Submit answer'}
              </Button>
            </div>
            {isEvaluating && (
              <div className="mt-4 flex items-center gap-2 text-xs text-ink-400">
                <Loader2 className="h-3.5 w-3.5 animate-spin" /> AI is scoring your answer…
              </div>
            )}
          </>
        ) : (
          <div className="mt-6 animate-rise space-y-6">
            <Waveform
              values={[evaluation.technicalScore, evaluation.relevanceScore, evaluation.clarityScore, evaluation.completenessScore, evaluation.overallScore]}
              className="h-16"
            />
            <div className="grid grid-cols-2 gap-4">
              <ScoreRow label="Technical" value={evaluation.technicalScore} />
              <ScoreRow label="Relevance" value={evaluation.relevanceScore} />
              <ScoreRow label="Clarity" value={evaluation.clarityScore} />
              <ScoreRow label="Completeness" value={evaluation.completenessScore} />
            </div>

            <div className="rounded-xl bg-paper p-4">
              <p className="font-mono text-xs uppercase tracking-wide text-ink-400">Overall</p>
              <p className="mt-1 font-display text-3xl font-semibold text-ink-800">{evaluation.overallScore}<span className="text-base text-ink-300">/100</span></p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-sage-600">Strengths</p>
                <ul className="mt-2 space-y-1.5 text-sm text-ink-600">
                  {evaluation.strengths.map((s) => (
                    <li key={s} className="flex gap-2"><span className="text-sage">+</span>{s}</li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-rust-600">Improve</p>
                <ul className="mt-2 space-y-1.5 text-sm text-ink-600">
                  {evaluation.weaknesses.map((s) => (
                    <li key={s} className="flex gap-2"><span className="text-rust">−</span>{s}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="rounded-xl border border-ink-100 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-ink-400">Ideal answer</p>
              <p className="mt-2 text-sm leading-relaxed text-ink-600">{evaluation.idealAnswer}</p>
            </div>

            <Button className="w-full" size="lg" onClick={handleNext}>
              {isLast ? 'View final report' : 'Next question'} <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </Card>
    </div>
  )
}
