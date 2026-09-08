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
 * Calls the FastAPI AI service (Groq-backed) instead of local mock scoring.
 * Sends X-Internal-Key (Phase 10H) so FastAPI can reject direct calls from
 * anything that isn't this backend.
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
        headers: {
          'Content-Type': 'application/json',
          'X-Internal-Key': env.AI_INTERNAL_KEY,
        },
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
      payload = (await response.json()) as Record<string, unknown>
    } catch {
      throw new AppError('The AI evaluation service returned an invalid response.', 502)
    }

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