import { api } from './api'
import type { Interview, CreateInterviewInput, UpdateInterviewInput } from '@/types/interview'
import type { Question } from '@/types/question'
import type { Answer } from '@/types/answer'
import type { InterviewReport } from '@/types/result'

// Same envelope shape as authService.ts — the backend's sendSuccess always
// responds { success, message, data: {...} }.
interface ApiEnvelope<T> {
  success: boolean
  message: string
  data: T
}

// Request payload for POST /api/interviews/:id/answers — mirrors
// submitAnswerSchema on the backend (backend/src/validators/answerValidators.ts).
export interface SubmitAnswerInput {
  questionId: string
  answerText: string
}

export const interviewService = {
  async create(input: CreateInterviewInput): Promise<Interview> {
    const { data } = await api.post<ApiEnvelope<{ interview: Interview }>>('/interviews', input)
    return data.data.interview
  },

  async list(): Promise<Interview[]> {
    const { data } = await api.get<ApiEnvelope<{ interviews: Interview[] }>>('/interviews')
    return data.data.interviews
  },

  async getById(id: string): Promise<Interview> {
    const { data } = await api.get<ApiEnvelope<{ interview: Interview }>>(`/interviews/${id}`)
    return data.data.interview
  },

  async update(id: string, input: UpdateInterviewInput): Promise<Interview> {
    const { data } = await api.put<ApiEnvelope<{ interview: Interview }>>(`/interviews/${id}`, input)
    return data.data.interview
  },

  // Backed by mock-generated questions for now (see backend
  // questionGenerationService.ts) — this call shape won't change when a
  // real AI generator replaces the mock one server-side.
  async getQuestions(id: string): Promise<Question[]> {
    const { data } = await api.get<ApiEnvelope<{ questions: Question[] }>>(`/interviews/${id}/questions`)
    return data.data.questions
  },

  // Backed by mock evaluation for now (see backend
  // answerEvaluationService.ts) — same call shape survives the switch to
  // real AI evaluation; only the backend's scoring logic changes.
  async submitAnswer(interviewId: string, input: SubmitAnswerInput): Promise<Answer> {
    const { data } = await api.post<ApiEnvelope<{ answer: Answer }>>(`/interviews/${interviewId}/answers`, input)
    return data.data.answer
  },

  // Aggregated on the backend from Interview + Question + Answer — see
  // reportService.ts. No separate Result document is involved.
  async getReport(id: string): Promise<InterviewReport> {
    const { data } = await api.get<ApiEnvelope<{ report: InterviewReport }>>(`/interviews/${id}/report`)
    return data.data.report
  },
}
