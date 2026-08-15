import { Question, IQuestion } from '../models/Question'
import { Answer, IAnswer } from '../models/Answer'
import { interviewService } from './interviewService'

export interface ReportQuestionResult {
  id: string
  questionText: string
  category: string
  topic: string
  difficulty: string
  order: number
  answered: boolean
  answerText?: string
  overallScore?: number
}

export interface ReportData {
  interviewId: string
  role: string
  interviewType: string
  difficulty: string
  status: string
  createdAt: Date
  startedAt?: Date
  completedAt?: Date
  totalQuestions: number
  answeredQuestions: number
  // null (not 0) when nothing has been answered yet — 0 would look like a
  // real score of zero rather than "no data".
  overallScore: number | null
  technicalScore: number | null
  communicationScore: number | null
  relevanceScore: number | null
  completenessScore: number | null
  topicPerformance: { topic: string; score: number }[]
  strengths: string[]
  weaknesses: string[]
  recommendations: string[]
  questions: ReportQuestionResult[]
}

function average(values: number[]): number | null {
  if (values.length === 0) return null
  return Math.round(values.reduce((sum, v) => sum + v, 0) / values.length)
}

function uniqueTop(values: string[], limit: number): string[] {
  return Array.from(new Set(values)).slice(0, limit)
}

export const reportService = {
  /**
   * Aggregates a report entirely from persisted Interview + Question +
   * Answer data. Deliberately does NOT create or read a Result document —
   * the Result model exists on paper but every number here is already
   * sitting in Answer documents; a separate Result record would just be a
   * second copy that can drift out of sync for no benefit at this phase.
   */
  async getReport(userId: string, interviewId: string): Promise<ReportData> {
    // Ownership check reused as-is — same 404-for-both-cases guarantee as
    // every other interview read (see interviewService.getOwned).
    const interview = await interviewService.getOwned(userId, interviewId)

    const [questions, answers] = await Promise.all([
      Question.find({ interviewId: interview._id }).sort({ order: 1 }),
      Answer.find({ interviewId: interview._id }),
    ])

    const answersByQuestionId = new Map<string, IAnswer>()
    for (const answer of answers) {
      answersByQuestionId.set(answer.questionId.toString(), answer)
    }

    const questionResults: ReportQuestionResult[] = questions.map((q: IQuestion) => {
      const answer = answersByQuestionId.get(q._id.toString())
      return {
        id: q._id.toString(),
        questionText: q.questionText,
        category: q.category,
        topic: q.topic,
        difficulty: q.difficulty,
        order: q.order,
        answered: !!answer,
        answerText: answer?.answerText,
        overallScore: answer?.overallScore,
      }
    })

    const technicalScore = average(answers.map((a) => a.technicalScore))
    const communicationScore = average(answers.map((a) => a.clarityScore))
    const relevanceScore = average(answers.map((a) => a.relevanceScore))
    const completenessScore = average(answers.map((a) => a.completenessScore))
    const overallScore = average(answers.map((a) => a.overallScore))

    // Topic performance: each answer's score grouped under its question's
    // topic (Question.topic — same field the report shares with the
    // question-generation side).
    const scoresByTopic = new Map<string, number[]>()
    for (const answer of answers) {
      const question = questions.find((q) => q._id.toString() === answer.questionId.toString())
      if (!question) continue
      const list = scoresByTopic.get(question.topic) ?? []
      list.push(answer.overallScore)
      scoresByTopic.set(question.topic, list)
    }
    const topicPerformance = Array.from(scoresByTopic.entries()).map(([topic, scores]) => ({
      topic,
      score: average(scores) ?? 0,
    }))

    const strengths = uniqueTop(answers.flatMap((a) => a.strengths), 5)
    const weaknesses = uniqueTop(answers.flatMap((a) => a.weaknesses), 5)

    // Recommendations are derived from real topic scores, not invented —
    // any topic averaging under 65 gets a "review this" line. No
    // fabricated day-by-day curriculum: there's no persisted data to
    // honestly generate one from at this phase.
    const recommendations = topicPerformance.filter((t) => t.score < 65).map((t) => `Review ${t.topic}`)

    return {
      interviewId: interview._id.toString(),
      role: interview.role,
      interviewType: interview.interviewType,
      difficulty: interview.difficulty,
      status: interview.status,
      createdAt: interview.createdAt,
      startedAt: interview.startedAt,
      completedAt: interview.completedAt,
      totalQuestions: questions.length,
      answeredQuestions: answers.length,
      overallScore,
      technicalScore,
      communicationScore,
      relevanceScore,
      completenessScore,
      topicPerformance,
      strengths,
      weaknesses,
      recommendations,
      questions: questionResults,
    }
  },
}
