export type InterviewStatus = 'CREATED' | 'IN_PROGRESS' | 'COMPLETED' | 'ABANDONED'
export type InterviewType = 'Technical' | 'Behavioral' | 'System Design' | 'Mixed'
export type Difficulty = 'easy' | 'medium' | 'hard'

export interface Interview {
  id: string
  userId: string
  role: string
  interviewType: InterviewType
  difficulty: Difficulty
  questionCount: number
  status: InterviewStatus
  resumeId?: string
  overallScore?: number
  startedAt?: string
  completedAt?: string
  createdAt: string
}
