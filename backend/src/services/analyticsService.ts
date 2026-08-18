import { Interview, IInterview } from '../models/Interview'
import { Answer } from '../models/Answer'
import { Question } from '../models/Question'

export interface ScoreTrendPoint {
  date: string
  score: number
}

export interface TopicPerformancePoint {
  topic: string
  score: number
}

export interface DashboardData {
  totalInterviews: number
  completedInterviews: number
  averageScore: number
  bestScore: number
  totalQuestionsAnswered: number
  scoreTrend: ScoreTrendPoint[]
  topicPerformance: TopicPerformancePoint[]
  recentInterviews: IInterview[]
}

// Mirrors the tiny helper already in reportService.ts (backend/src/services/reportService.ts).
// Duplicated rather than imported from there so this phase's changes stay
// isolated to new files only — reportService.ts is not touched.
function average(values: number[]): number {
  if (values.length === 0) return 0
  return Math.round(values.reduce((sum, v) => sum + v, 0) / values.length)
}

export const analyticsService = {
  /**
   * Every number here comes from the requesting user's own persisted
   * Interview/Answer/Question documents — nothing is fabricated. A
   * brand-new user with no interviews gets honest zeros/empty arrays, the
   * same way reportService.getReport returns nulls instead of guessed
   * scores when there's no data yet.
   *
   * Identity is `userId` exactly as passed in by the caller — this
   * function has no other way to know who's asking, and
   * analyticsController only ever passes req.userId (the verified JWT),
   * never a client-supplied id.
   */
  async getDashboard(userId: string): Promise<DashboardData> {
    const [interviews, answers] = await Promise.all([
      Interview.find({ userId }).sort({ createdAt: -1 }),
      Answer.find({ userId }),
    ])

    const completed = interviews.filter((i) => i.status === 'COMPLETED')
    const completedScores = completed
      .map((i) => i.overallScore)
      .filter((s): s is number => typeof s === 'number')

    const averageScore = average(completedScores)
    const bestScore = completedScores.length > 0 ? Math.max(...completedScores) : 0

    // One point per completed interview that actually has a completedAt +
    // overallScore, oldest first — nothing here is interpolated or invented.
    const scoreTrend: ScoreTrendPoint[] = completed
      .filter((i) => i.completedAt !== undefined && typeof i.overallScore === 'number')
      .sort((a, b) => a.completedAt!.getTime() - b.completedAt!.getTime())
      .map((i) => ({
        date: i.completedAt!.toISOString().slice(0, 10),
        score: i.overallScore!,
      }))

    // Topic performance across ALL of this user's answers (every
    // interview, not just one) — reuses the same Answer.questionId ->
    // Question.topic relationship reportService.ts already relies on for
    // a single interview; no new fields, no duplicated topic data.
    let topicPerformance: TopicPerformancePoint[] = []
    if (answers.length > 0) {
      const questionIds = answers.map((a) => a.questionId)
      const questions = await Question.find({ _id: { $in: questionIds } }).select('topic')
      const topicByQuestionId = new Map<string, string>()
      for (const q of questions) {
        topicByQuestionId.set(q._id.toString(), q.topic)
      }
      const scoresByTopic = new Map<string, number[]>()
      for (const answer of answers) {
        const topic = topicByQuestionId.get(answer.questionId.toString())
        if (!topic) continue
        const list = scoresByTopic.get(topic) ?? []
        list.push(answer.overallScore)
        scoresByTopic.set(topic, list)
      }
      topicPerformance = Array.from(scoresByTopic.entries()).map(([topic, scores]) => ({
        topic,
        score: average(scores),
      }))
    }

    return {
      totalInterviews: interviews.length,
      completedInterviews: completed.length,
      averageScore,
      bestScore,
      totalQuestionsAnswered: answers.length,
      scoreTrend,
      topicPerformance,
      // Already sorted newest-first by the query above — same
      // Interview.find + toJSON serialization every other interview
      // endpoint uses (see interviewController.list), so the frontend's
      // existing Interview type needs no changes.
      recentInterviews: interviews.slice(0, 5),
    }
  },
}
