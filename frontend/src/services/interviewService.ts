import { api } from './api'
import type { Interview, CreateInterviewInput, UpdateInterviewInput } from '@/types/interview'

interface ApiEnvelope<T> {
  success: boolean
  message: string
  data: T
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
}