import { api } from './api'
import type { User } from '@/types/user'

// The backend wraps every success response the same way — see
// backend/src/utils/apiResponse.ts (sendSuccess).
interface AuthApiResponse {
  success: boolean
  message: string
  data: { user: User }
}

export const authService = {
  async login(email: string, password: string): Promise<User> {
    const { data } = await api.post<AuthApiResponse>('/auth/login', { email, password })
    return data.data.user
  },

  async register(name: string, email: string, password: string): Promise<User> {
    const { data } = await api.post<AuthApiResponse>('/auth/register', { name, email, password })
    return data.data.user
  },

  async logout(): Promise<void> {
    await api.post('/auth/logout')
  },

  async me(): Promise<User | null> {
    try {
      const { data } = await api.get<AuthApiResponse>('/auth/me')
      return data.data.user
    } catch {
      // Not logged in (401) or the API is unreachable — either way, no session.
      return null
    }
  },
}