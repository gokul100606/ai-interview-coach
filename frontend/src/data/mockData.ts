// Temporary mock data — powers the UI until backend integration (Phase 6+).
// Every service function in src/services/ is written so swapping this for
// real API calls later touches ONLY the service layer, never components.
import type { User } from '@/types/user'
import type { Interview } from '@/types/interview'
import type { TopicPerformance } from '@/types/result'
import type { Question } from '@/types/question'
import type { Evaluation } from '@/types/answer'

export const mockUser: User = {
  id: 'u_1',
  name: 'Ananya Rao',
  email: 'ananya.rao@example.com',
  targetRole: 'Frontend Engineer',
  skills: ['React', 'TypeScript', 'Node.js', 'MongoDB'],
  createdAt: '2026-05-02T10:00:00Z',
}

export const mockInterviews: Interview[] = [
  { id: 'i_1', userId: 'u_1', role: 'Frontend Engineer', interviewType: 'Technical', difficulty: 'medium', questionCount: 8, status: 'COMPLETED', overallScore: 78, startedAt: '2026-07-20T09:00:00Z', completedAt: '2026-07-20T09:40:00Z', createdAt: '2026-07-20T08:55:00Z' },
  { id: 'i_2', userId: 'u_1', role: 'Full Stack Developer', interviewType: 'Mixed', difficulty: 'medium', questionCount: 10, status: 'COMPLETED', overallScore: 84, startedAt: '2026-07-28T09:00:00Z', completedAt: '2026-07-28T09:52:00Z', createdAt: '2026-07-28T08:55:00Z' },
  { id: 'i_3', userId: 'u_1', role: 'Frontend Engineer', interviewType: 'System Design', difficulty: 'hard', questionCount: 6, status: 'COMPLETED', overallScore: 71, startedAt: '2026-08-05T09:00:00Z', completedAt: '2026-08-05T09:35:00Z', createdAt: '2026-08-05T08:55:00Z' },
  { id: 'i_4', userId: 'u_1', role: 'Frontend Engineer', interviewType: 'Behavioral', difficulty: 'easy', questionCount: 6, status: 'COMPLETED', overallScore: 90, startedAt: '2026-08-10T09:00:00Z', completedAt: '2026-08-10T09:25:00Z', createdAt: '2026-08-10T08:55:00Z' },
  { id: 'i_5', userId: 'u_1', role: 'Frontend Engineer', interviewType: 'Technical', difficulty: 'medium', questionCount: 8, status: 'CREATED', createdAt: '2026-08-12T18:00:00Z' },
]

export const mockScoreTrend = mockInterviews
  .filter((i) => i.overallScore !== undefined)
  .map((i) => ({ date: i.completedAt!.slice(0, 10), score: i.overallScore! }))

export const mockTopicPerformance: TopicPerformance[] = [
  { topic: 'React', score: 88 },
  { topic: 'JavaScript', score: 82 },
  { topic: 'System Design', score: 64 },
  { topic: 'MongoDB', score: 58 },
  { topic: 'Communication', score: 79 },
]

// --- Interview Room mock question bank ---
export const mockQuestions: Question[] = [
  { id: 'q_1', interviewId: 'i_5', questionText: "Explain how React's reconciliation algorithm decides what to re-render.", category: 'Frontend', topic: 'React', difficulty: 'medium', order: 1, expectedTopics: ['virtual DOM', 'diffing', 'keys'] },
  { id: 'q_2', interviewId: 'i_5', questionText: 'What is the difference between authentication and authorization?', category: 'Security', topic: 'Web Security', order: 2, difficulty: 'easy', expectedTopics: ['identity verification', 'permissions', 'JWT'] },
  { id: 'q_3', interviewId: 'i_5', questionText: 'How would you design a rate limiter for a public REST API?', category: 'System Design', topic: 'System Design', order: 3, difficulty: 'hard', expectedTopics: ['token bucket', 'sliding window', 'Redis'] },
  { id: 'q_4', interviewId: 'i_5', questionText: 'Describe a time you disagreed with a teammate about a technical decision. What happened?', category: 'Behavioral', topic: 'Communication', order: 4, difficulty: 'easy', expectedTopics: ['conflict resolution', 'collaboration'] },
]

export function mockEvaluate(answerText: string): Evaluation {
  const length = answerText.trim().length
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
}
