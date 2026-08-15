export interface TopicPerformance {
  topic: string
  score: number
}

export interface RoadmapDay {
  day: number
  focus: string
  tasks: string[]
}

export interface Result {
  id: string
  interviewId: string
  overallScore: number
  technicalScore: number
  communicationScore: number
  relevanceScore: number
  completenessScore: number
  topicPerformance: TopicPerformance[]
  strengths: string[]
  weaknesses: string[]
  recommendations: string[]
  studyRoadmap: RoadmapDay[]
  createdAt: string
}

// Response shape for GET /api/interviews/:id/report — mirrors ReportData
// on the backend (backend/src/services/reportService.ts) exactly. This is
// an aggregated, computed-on-read report (Interview + Question + Answer),
// NOT a persisted Result document — Result/RoadmapDay above are unused by
// this endpoint and left in place rather than reused, since conflating a
// live aggregate with a persisted record's shape would be misleading.
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

export interface InterviewReport {
  interviewId: string
  role: string
  interviewType: string
  difficulty: string
  status: string
  createdAt: string
  startedAt?: string
  completedAt?: string
  totalQuestions: number
  answeredQuestions: number
  overallScore: number | null
  technicalScore: number | null
  communicationScore: number | null
  relevanceScore: number | null
  completenessScore: number | null
  topicPerformance: TopicPerformance[]
  strengths: string[]
  weaknesses: string[]
  recommendations: string[]
  questions: ReportQuestionResult[]
}
