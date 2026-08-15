import { env } from '../config/env'
import { AppError } from '../utils/AppError'
import type { IQuestion } from '../models/Question'
import type { IInterview } from '../models/Interview'

export interface EvaluationResult {
  technicalScore: number
  relevanceScore: number
  clarityScore: number
  completenessScore: number
  overallScore: number
  strengths: string[]
  weaknesses: string[]
  suggestions: string[]
  idealAnswer: string
}

const EVALUATE_TIMEOUT_MS = 20_000

function clampScore(value: unknown): number {
  const n = typeof value === 'number' ? value : Number(value)
  if (!Number.isFinite(n)) return 0
  return Math.max(0, Math.min(100, Math.round(n)))
}

function toStringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((v): v is string => typeof v === 'string') : []
}

/**
 * Calls the FastAPI/Gemini service instead of the old local mock scoring.
 * Signature is unchanged except sync -> async (an HTTP call can't be
 * synchronous) — answerService.submitAnswer is the only caller and just
 * needed one `await` added for that reason; nothing else about its
 * interface changed.
 */
export const answerEvaluationService = {
  async evaluateAnswer({
    question,
    answer,
  }: {
    question: IQuestion
    answer: string
    interview: IInterview
  }): Promise<EvaluationResult> {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), EVALUATE_TIMEOUT_MS)

    let response: Response
    try {
      response = await fetch(`${env.AI_SERVICE_URL}/api/evaluate-answer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: {
            questionText: question.questionText,
            category: question.category,
            topic: question.topic,
            difficulty: question.difficulty,
            expectedTopics: question.expectedTopics,
          },
          answerText: answer,
        }),
        signal: controller.signal,
      })
    } catch (err) {
      const isAbort = err instanceof Error && err.name === 'AbortError'
      throw new AppError(
        isAbort
          ? 'Answer evaluation timed out. Please try again.'
          : 'The AI evaluation service is unavailable right now. Please try again shortly.',
        503,
      )
    } finally {
      clearTimeout(timeout)
    }

    if (!response.ok) {
      throw new AppError('The AI evaluation service returned an error. Please try again shortly.', 502)
    }

    let payload: Record<string, unknown>
    try {
      payload = await response.json()
    } catch {
      throw new AppError('The AI evaluation service returned an invalid response.', 502)
    }

    // FastAPI's contract uses "communicationScore" (see
    // ai-service/app/schemas.py, which follows the Phase 8 spec's example
    // response exactly). The Node/Mongo side has used "clarityScore" on
    // the Answer model since Phase 2 — this is the one place that naming
    // gap is bridged, so nothing downstream (Answer model, answerService,
    // Report, frontend types) has to change.
    return {
      technicalScore: clampScore(payload.technicalScore),
      relevanceScore: clampScore(payload.relevanceScore),
      clarityScore: clampScore(payload.communicationScore),
      completenessScore: clampScore(payload.completenessScore),
      overallScore: clampScore(payload.overallScore),
      strengths: toStringArray(payload.strengths),
      weaknesses: toStringArray(payload.weaknesses),
      suggestions: toStringArray(payload.suggestions),
      idealAnswer: typeof payload.idealAnswer === 'string' ? payload.idealAnswer : '',
    }
  },
}
