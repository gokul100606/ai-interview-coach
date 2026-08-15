import { env } from '../config/env'
import { AppError } from '../utils/AppError'
import type { IInterview } from '../models/Interview'

export interface GeneratedQuestion {
  questionText: string
  category: string
  topic: string
  difficulty: 'easy' | 'medium' | 'hard'
  expectedTopics: string[]
}

const GENERATE_TIMEOUT_MS = 20_000

const VALID_DIFFICULTIES = new Set(['easy', 'medium', 'hard'])

/**
 * Calls the FastAPI/Gemini service instead of the old static mock bank.
 * Signature is unchanged from the mock version except sync -> async (an
 * HTTP call can't be synchronous) — questionService.generateForInterview
 * is the only caller and just needed one `await` added for that reason;
 * nothing else about its interface changed.
 */
export const questionGenerationService = {
  async generate(
    interview: Pick<IInterview, 'role' | 'interviewType' | 'difficulty' | 'questionCount'>,
  ): Promise<GeneratedQuestion[]> {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), GENERATE_TIMEOUT_MS)

    let response: Response
    try {
      response = await fetch(`${env.AI_SERVICE_URL}/api/generate-questions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          role: interview.role,
          interviewType: interview.interviewType,
          difficulty: interview.difficulty,
          questionCount: interview.questionCount,
        }),
        signal: controller.signal,
      })
    } catch (err) {
      const isAbort = err instanceof Error && err.name === 'AbortError'
      throw new AppError(
        isAbort
          ? 'Question generation timed out. Please try again.'
          : 'The AI question service is unavailable right now. Please try again shortly.',
        503,
      )
    } finally {
      clearTimeout(timeout)
    }

    if (!response.ok) {
      throw new AppError('The AI question service returned an error. Please try again shortly.', 502)
    }

    let payload: { questions?: unknown }
    try {
      payload = await response.json()
    } catch {
      throw new AppError('The AI question service returned an invalid response.', 502)
    }

    if (!Array.isArray(payload.questions) || payload.questions.length === 0) {
      throw new AppError('The AI question service returned no questions.', 502)
    }

    // Defensive normalization — FastAPI's own Pydantic validation already
    // guarantees shape on its side, but this endpoint crosses a network
    // boundary, so nothing here trusts the response blindly. Note: `order`
    // is intentionally ignored — questionService assigns order from array
    // index itself, exactly as it did with the old mock bank, so it needs
    // no changes for this switch.
    const questions: GeneratedQuestion[] = payload.questions
      .map((raw: unknown): GeneratedQuestion | null => {
        if (typeof raw !== 'object' || raw === null) return null
        const q = raw as Record<string, unknown>
        const questionText = typeof q.questionText === 'string' ? q.questionText.trim() : ''
        if (!questionText) return null
        const difficulty = typeof q.difficulty === 'string' && VALID_DIFFICULTIES.has(q.difficulty)
          ? (q.difficulty as GeneratedQuestion['difficulty'])
          : interview.difficulty
        return {
          questionText,
          category: typeof q.category === 'string' && q.category ? q.category : interview.interviewType,
          topic: typeof q.topic === 'string' && q.topic ? q.topic : interview.role,
          difficulty,
          expectedTopics: Array.isArray(q.expectedTopics) ? q.expectedTopics.map(String) : [],
        }
      })
      .filter((q: GeneratedQuestion | null): q is GeneratedQuestion => q !== null)

    if (questions.length === 0) {
      throw new AppError('The AI question service returned no usable questions.', 502)
    }

    return questions
  },
}
