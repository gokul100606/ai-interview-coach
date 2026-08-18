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

// Request payload for POST /api/interviews — mirrors createInterviewSchema
// on the backend (backend/src/validators/interviewValidators.ts).
export interface CreateInterviewInput {
  role: string
  interviewType: InterviewType
  difficulty: Difficulty
  questionCount: number
  resumeId?: string
}

// Request payload for PUT /api/interviews/:id — mirrors updateInterviewSchema.
// Phase 10A: status/startedAt/completedAt/overallScore were removed from
// the backend contract (they're server-controlled by the answer-submission
// lifecycle, never client-settable) — this type is updated to match, even
// though nothing currently calls interviewService.update() from any page.
export interface UpdateInterviewInput {
  resumeId?: string
}
