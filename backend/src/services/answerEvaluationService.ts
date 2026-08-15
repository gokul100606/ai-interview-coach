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

/**
 * Temporary deterministic evaluation — the server-side port of the
 * frontend's old mockEvaluate (frontend/src/data/mockData.ts). Now the
 * ONLY place a score is computed; the frontend never fabricates one.
 *
 * This is the one function a later phase needs to replace: swap the body
 * for a call to the FastAPI/Gemini service, keep the same
 * evaluateAnswer({ question, answer, interview }) -> EvaluationResult
 * signature, and answerService, answerController, and the frontend all
 * stay exactly as they are.
 */
export const answerEvaluationService = {
  evaluateAnswer({
    answer,
  }: {
    question: IQuestion
    answer: string
    interview: IInterview
  }): EvaluationResult {
    const length = answer.trim().length
    const base = Math.min(95, 45 + Math.floor(length / 4))
    const jitter = (n: number) => Math.max(30, Math.min(98, n + Math.floor(Math.random() * 10 - 5)))

    const technicalScore = jitter(base)
    const relevanceScore = jitter(base + 3)
    const clarityScore = jitter(base - 4)
    const completenessScore = jitter(base - 2)
    const overallScore = Math.round((technicalScore + relevanceScore + clarityScore + completenessScore) / 4)

    return {
      technicalScore,
      relevanceScore,
      clarityScore,
      completenessScore,
      overallScore,
      strengths: ['Covered the core concept clearly', 'Used a concrete example to ground the explanation'],
      weaknesses: ['Could go deeper on edge cases', 'Missed mentioning trade-offs'],
      suggestions: ['Mention time/space complexity where relevant', 'Compare against at least one alternative approach'],
      idealAnswer:
        'A strong answer names the core mechanism, walks through a concrete example, and closes with trade-offs or edge cases an interviewer would probe next.',
    }
  },
}
