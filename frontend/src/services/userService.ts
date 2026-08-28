import { api } from './api'
import type { User } from '@/types/user'

// Same envelope shape as every other service — the backend's sendSuccess
// always responds { success, message, data: {...} }.
interface ApiEnvelope<T> {
  success: boolean
  message: string
  data: T
}

// Request payload for PUT /api/users/me — mirrors updateUserSchema on the
// backend (backend/src/validators/userValidators.ts) exactly.
export interface UpdateUserInput {
  name?: string
  targetRole?: string
  preferences?: {
    emailDigest?: boolean
    practiceReminders?: boolean
  }
}

export const userService = {
  async updateMe(input: UpdateUserInput): Promise<User> {
    const { data } = await api.put<ApiEnvelope<{ user: User }>>('/users/me', input)
    return data.data.user
  },
}
