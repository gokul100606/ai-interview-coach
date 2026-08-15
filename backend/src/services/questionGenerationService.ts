import type { IInterview } from '../models/Interview'

export interface GeneratedQuestion {
  questionText: string
  category: string
  topic: string
  difficulty: 'easy' | 'medium' | 'hard'
  expectedTopics: string[]
}

/**
 * Temporary mock-based generator — the exact same 4 questions that used to
 * live in frontend/src/data/mockData.ts, ported here so they're served from
 * the database instead of bundled into the frontend.
 *
 * This is the ONLY function a later phase needs to replace. Once the
 * FastAPI/Gemini service exists, `generate()` below becomes an HTTP call to
 * it instead of cycling through this array — its signature (takes interview
 * context, returns GeneratedQuestion[]) stays the same, so questionService,
 * questionController, and the entire frontend are untouched by that switch.
 */
const MOCK_BANK: GeneratedQuestion[] = [
  {
    questionText: "Explain how React's reconciliation algorithm decides what to re-render.",
    category: 'Frontend',
    topic: 'React',
    difficulty: 'medium',
    expectedTopics: ['virtual DOM', 'diffing', 'keys'],
  },
  {
    questionText: 'What is the difference between authentication and authorization?',
    category: 'Security',
    topic: 'Web Security',
    difficulty: 'easy',
    expectedTopics: ['identity verification', 'permissions', 'JWT'],
  },
  {
    questionText: 'How would you design a rate limiter for a public REST API?',
    category: 'System Design',
    topic: 'System Design',
    difficulty: 'hard',
    expectedTopics: ['token bucket', 'sliding window', 'Redis'],
  },
  {
    questionText: 'Describe a time you disagreed with a teammate about a technical decision. What happened?',
    category: 'Behavioral',
    topic: 'Communication',
    difficulty: 'easy',
    expectedTopics: ['conflict resolution', 'collaboration'],
  },
]

export const questionGenerationService = {
  /**
   * Produces `interview.questionCount` questions for the given interview.
   * Cycles through the fixed mock bank so any question count (4-25) is
   * always satisfied — never empty, never throws.
   */
  generate(interview: Pick<IInterview, 'role' | 'interviewType' | 'difficulty' | 'questionCount'>): GeneratedQuestion[] {
    const questions: GeneratedQuestion[] = []
    for (let i = 0; i < interview.questionCount; i++) {
      questions.push(MOCK_BANK[i % MOCK_BANK.length])
    }
    return questions
  },
}
