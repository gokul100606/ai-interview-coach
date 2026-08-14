export interface Evaluation {
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

export interface Answer extends Evaluation {
  id: string
  interviewId: string
  questionId: string
  answerText: string
  createdAt: string
}
