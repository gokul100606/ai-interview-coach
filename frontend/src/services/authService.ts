import { api } from './api'
import { mockUser } from '@/data/mockData'
import type { User } from '@/types/user'

// PHASE 1: mock implementation so the UI is fully clickable end-to-end.
// PHASE 6 will replace bodies with real `api.post('/auth/...')` calls —
// call signatures below are already the real contract so nothing else changes.
const USE_MOCK = true

export const authService = {
  async login(email: string, _password: string): Promise<User> {
    if (USE_MOCK) {
      await delay(500)
      return { ...mockUser, email }
    }
    const { data } = await api.post('/auth/login', { email, password: _password })
    return data.user
  },

  async register(name: string, email: string, _password: string): Promise<User> {
    if (USE_MOCK) {
      await delay(500)
      return { ...mockUser, name, email }
    }
    const { data } = await api.post('/auth/register', { name, email, password: _password })
    return data.user
  },

  async logout(): Promise<void> {
    if (USE_MOCK) return
    await api.post('/auth/logout')
  },

  async me(): Promise<User | null> {
    if (USE_MOCK) return null // no persisted session in mock mode
    try {
      const { data } = await api.get('/auth/me')
      return data.user
    } catch {
      return null
    }
  },
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
