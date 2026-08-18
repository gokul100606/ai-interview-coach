import type { TopicPerformance } from './result'
import type { Interview } from './interview'

// Response shape for GET /api/analytics/dashboard — mirrors DashboardData
// on the backend (backend/src/services/analyticsService.ts) exactly.
export interface ScoreTrendPoint {
  date: string
  score: number
}

export interface DashboardData {
  totalInterviews: number
  completedInterviews: number
  averageScore: number
  bestScore: number
  totalQuestionsAnswered: number
  scoreTrend: ScoreTrendPoint[]
  topicPerformance: TopicPerformance[]
  recentInterviews: Interview[]
}
